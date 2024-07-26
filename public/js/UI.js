class UI extends Phaser.Scene {
  constructor() {
    super({ key: "UI" });
  }

  init() {
    this.scene.moveUp();
    this.actual_points_blue = 0;
    this.actual_points_red = 0;
  }

  create() {
    this.groupLife = this.add.group({
      key: "life",
      repeat: 2,
      setXY: {
        x: 50,
        y: 20,
        stepX: 25,
      },
    });

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

    // Eventos
    this.registry.events.on("remove_life", () => {
      this.groupLife
        .getChildren()
        [this.groupLife.getChildren().length - 1].destroy();
    });
    this.registry.events.on("game_over", () => {
      this.registry.events.removeAllListeners();
      this.scene.start("Menu", {
        points_blue: this.actual_points_blue,
        points_red: this.actual_points_red,
      });
    });

    this.registry.events.on("update_points", (scores) => {
      this.actual_points_blue = scores.blue;
      this.actual_points_red = scores.red;
      this.blueScoreText.setText(scores.blue);
      this.redScoreText.setText(scores.red);
    });
    this.registry.events.on("update_other_points", () => {});
  }
}

export default UI;
