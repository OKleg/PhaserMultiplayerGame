import Tomato from "./Tomato.js";
import Bombs from "./TomBombs.js";
import TomatoItem from "./TomatoItem.js";

/**
 * In this fast-paced game, you play as a character on a mission to collect ripe tomatoes while avoiding bombs with spikes. With just one screen to play on, you must use quick reflexes and strategic thinking to dodge the bombs and collect as many tomatoes as you can. Each tomato you collect earns you points, but watch out! If you collide with a bomb with spikes, you'll lose a life. The goal is to collect as many tomatoes as possible while avoiding bombs and preserving your lives. Can you make it to the end of the game with all your lives intact and become the ultimate tomato-collecting champion? Play now and find out!
 * Game created by Francisco Pereira (Gammafp)
 * - PixelArt created by @VeryEvilTomato
 */

class Play extends Phaser.Scene {
  constructor() {
    super({ key: "Play" });
  }

  init() {
    this.scene.launch("UI");
  }

  create() {
    var self = this;
    this.socket = io();

    this.otherPlayers = this.physics.add.group();
    this.socket.on("currentPlayers", function (players) {
      Object.keys(players).forEach(function (id) {
        console.log("on currentPlayers");
        if (players[id].playerId === self.socket.id) {
          addPlayer(self, players[id]);
        } else {
          addOtherPlayers(self, players[id]);
        }
      });
    });
    this.socket.on("newPlayer", function (playerInfo) {
      console.log("on newPlayer");
      addOtherPlayers(self, playerInfo);
    });

    this.socket.on("disconnect_player", function (playerId) {
      console.log(`${playerId} disconnect`);
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });
    this.socket.on("playerMoved", function (playerInfo) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });

    this.add.image(0, 0, "background").setOrigin(0);

    this.wall_floor = this.physics.add.staticGroup();

    this.wall_floor.create(0, 0, "wall").setOrigin(0);
    this.wall_floor
      .create(this.scale.width, 0, "wall")
      .setOrigin(1, 0)
      .setFlipX(true);

    this.wall_floor.create(0, this.scale.height, "floor").setOrigin(0, 1);

    this.wall_floor.refresh();

    this.wall_floor.getChildren()[2].setOffset(0, 15);

    // Bombs
    this.bombsGroup = new Bombs({
      physicsWorld: this.physics.world,
      scene: this,
    });
    // Items
    this.itemsGroup = new TomatoItem({
      physicsWorld: this.physics.world,
      scene: this,
    });
    this.itemsGroup.addTomatoItem(200, 200);
    this.blueScoreText = this.add
      .bitmapText(0, 40, "pixelFont", Phaser.Utils.String.Pad("0", 6, "0", 1))
      .setTint(0x0000ff);
    this.redScoreText = this.add
      .bitmapText(
        this.scale.width,
        40,
        "pixelFont",
        Phaser.Utils.String.Pad("0", 6, "0", 1)
      )
      .setOrigin(1, 0)
      .setTint(0xff0000);

    this.socket.on("scoreUpdate", function (scores) {
      self.blueScoreText.setText(scores.blue);
      self.redScoreText.setText(scores.red);
    });
    this.socket.on("starLocation", function (starLocation) {
      if (self.itemsGroup)
        self.itemsGroup.destroyItem(starLocation.x, starLocation.y);

      self.physics.add.overlap(
        self.tomato,
        self.itemsGroup,
        function () {
          this.socket.emit("starCollected");
        },
        null,
        self
      );
    });
  }

  update() {
    if (this.tomato) {
      this.tomato.update();
      // генерация события движения
      var x = this.tomato.x;
      var y = this.tomato.y;
      if (
        this.tomato.oldPosition &&
        (x !== this.tomato.oldPosition.x || y !== this.tomato.oldPosition.y)
      ) {
        this.socket.emit("playerMovement", {
          x: this.tomato.x,
          y: this.tomato.y,
        });
      }

      // сохраняем данные о старой позиции
      this.tomato.oldPosition = {
        x: this.tomato.x,
        y: this.tomato.y,
      };
    }
    this.bombsGroup.update();
  }
}

function addPlayer(self, playerInfo) {
  // Personaje
  console.log("cteate my tomato: " + playerInfo.playerId);
  self.tomato = new Tomato({
    scene: self,
    x: playerInfo.x,
    y: playerInfo.y,
  });
  if (playerInfo.team === "blue") {
    self.tomato.setTint(0x0000ff);
  } else {
    self.tomato.setTint(0xff0000);
  }
  self.physics.add.collider([self.tomato, self.bombsGroup], self.wall_floor);
  self.physics.add.overlap(self.tomato, self.bombsGroup, () => {
    self.tomato.bombCollision();
  });

  self.physics.add.overlap(self.itemsGroup, self.tomato, () => {
    self.sound.play("pop");
    //self.registry.events.emit("update_points");
    self.socket.emit("starCollected");
    self.itemsGroup.destroyItem();
    //self.bombsGroup.addBomb();
  });
}
function addOtherPlayers(self, playerInfo) {
  console.log("cteate other tomato: " + playerInfo.playerId);
  const otherPlayer = new Tomato({
    scene: self,
    x: playerInfo.x,
    y: playerInfo.y,
  });
  if (playerInfo.team === "blue") {
    otherPlayer.setTint(0x0000ff);
  } else {
    otherPlayer.setTint(0xff0000);
  }
  self.physics.add.collider([otherPlayer, self.bombsGroup], self.wall_floor);
  self.physics.add.overlap(otherPlayer, self.bombsGroup, () => {
    //otherPlayer.bombCollision();
  });

  self.physics.add.overlap(self.itemsGroup, otherPlayer, () => {
    self.sound.play("pop");
    //self.registry.events.emit("update_other_points");
    self.socket.emit("starCollected");
    self.itemsGroup.destroyItem();
    //self.bombsGroup.addBomb();
  });

  otherPlayer.playerId = playerInfo.playerId;
  if (self.otherPlayers) self.otherPlayers.add(otherPlayer);
}
export default Play;
