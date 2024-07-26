class TomatoItem extends Phaser.Physics.Arcade.StaticGroup {
  constructor(config) {
    super(config.physicsWorld, config.scene);
  }

  addTomatoItem(x, y) {
    // var x = Phaser.Math.Between(50, this.scene.scale.width - 50);
    // var y = Phaser.Math.Between(150, this.scene.scale.height - 70);
    this.create(x, y, "tomato_item");
  }

  destroyItem(newX, newY) {
    this.children.entries[0].destroy();
    this.addTomatoItem(newX, newY);
  }
}

export default TomatoItem;
