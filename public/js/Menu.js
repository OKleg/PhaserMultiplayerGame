class Menu extends Phaser.Scene {
  constructor() {
    super({
      key: "Menu",
    });
  }

  init(data) {
    this.points_blue = 0;
    this.points_red = 0;

    if (Object.keys(data).length !== 0) {
      this.points_blue = data.points_blue;
      this.points_red = data.points_red;
    }
  }

  create() {
    const pointsDB = localStorage.getItem("best_points");
    this.betsPoints = pointsDB !== null ? pointsDB : 0;

    this.add.image(0, 0, "background").setOrigin(0);

    this.add.image(0, 0, "wall").setOrigin(0);
    this.add.image(this.scale.width, 0, "wall").setOrigin(1, 0).setFlipX(true);

    this.add.image(0, this.scale.height, "floor").setOrigin(0, 1);

    this.logoMenu = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "logo")
      .setScale(2)
      .setInteractive();

    this.pointsText = this.add
      .bitmapText(
        this.scale.width / 2,
        this.scale.height - 100,
        "pixelFont",
        "POINTS BLUE " + this.points_blue
      )
      .setDepth(2)
      .setOrigin(0.5);

    this.pointsText = this.add
      .bitmapText(
        this.scale.width / 2,
        this.scale.height - 80,
        "pixelFont",
        "POINTS RED " + this.points_red
      )
      .setDepth(2)
      .setOrigin(0.5);
    var points = Math.max(this.points_blue, this.points_red);
    if (points > this.betsPoints) {
      localStorage.setItem("best_points", points);
    }
    this.bestPointsText = this.add
      .bitmapText(
        this.scale.width / 2,
        this.scale.height - 60,
        "pixelFont",
        "BEST " + this.betsPoints
      )
      .setDepth(2)
      .setOrigin(0.5);

    this.logoMenu.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.add.tween({
        targets: this.logoMenu,
        ease: "Bounce.easeIn",
        y: -200,
        duration: 1000,
        onComplete: () => {
          this.scene.start("Play");
        },
      });

      this.add.tween({
        targets: [this.pointsText, this.bestPointsText],
        ease: "Bounce.easeIn",
        y: 400,
        duration: 1000,
      });
    });
  }
}

export default Menu;
