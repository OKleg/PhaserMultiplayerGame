class Bombs extends Phaser.Physics.Arcade.Group {
  constructor(config) {
    super(config.physicsWorld, config.scene);
  }

  addBomb(x, dir) {
    this.create(x, -10, "bomb")
      .setDepth(2)
      .setBounce(1)
      .setCircle(18)
      .setVelocityX(dir)
      .setGravityY(-1800);
  }

  update() {
    this.children.iterate((bomb) => {
      if (bomb.body.velocity.x < 0) {
        bomb.setAngularVelocity(-300);
      } else {
        bomb.setAngularVelocity(300);
      }
    });
  }
}

export default Bombs;
