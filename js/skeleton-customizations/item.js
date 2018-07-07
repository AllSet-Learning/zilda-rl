import RL from '../skeleton/rl.js';

// Get rid of black border around items
RL.Item.prototype.charStrokeColor = false;
RL.Item.prototype.charStrokeWidth = 0;

// Update item - if on same tile as player pick them up
RL.Item.prototype.update = function update() {
  if (this.x === this.game.player.x && this.y === this.game.player.y) {
    this.attachTo(this.game.player);
    this.game.itemManager.remove(this);
  }
};
