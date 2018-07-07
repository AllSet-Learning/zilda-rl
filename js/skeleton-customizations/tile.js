import RL from '../skeleton/rl.js';

// make tiles explored by default
RL.Tile.prototype.explored = true;
// give tiles update method placeholder;
RL.Tile.prototype.update = function update() {};
RL.Tile.prototype.skip = false;
RL.Tile.prototype.bombable = true; // tiles are by default bombable
// change type function
RL.Tile.prototype.changeType = function changeType(type) {
  this.type = type;
  const typeData = RL.Tile.Types[this.type];
  RL.Util.merge(this, typeData);
  if (!typeData.update) {
    this.update = function update() {};
  }
  if (!typeData.onEntityEnter) {
    this.onEntityEnter = function onEntityEnter() {};
  }
};
