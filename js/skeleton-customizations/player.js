/* global document */
import RL from '../skeleton/rl.js';

RL.Player.prototype.immortal = false;

// Extend players update to include new actions
RL.Player.prototype.update = function update(action) {
  if (RL.Util.DIRECTIONS_8.indexOf(action) !== -1) {
    const offsetCoord = RL.Util.getOffsetCoordsFromDirection(action);
    const moveToX = this.x + offsetCoord.x;
    const moveToY = this.y + offsetCoord.y;
    return this.move(moveToX, moveToY);
  }

  if (action === 'wait') {
    this.wait();
    return true;
  }

  if (action === 'placeBomb') {
    if (this.bombs) {
      this.bombs -= 1;
      this.game.map
        .get(this.x, this.y)
        .changeType('bombThree');
      return true;
    }
    return false;
  }
  return false;
};

// customized move function -- attacks creatures you bump into
RL.Player.prototype.move = function move(x, y) {
  if (this.canMoveTo(x, y)) {
    this.moveTo(x, y);
    return true;
  }
  const target = this.game.entityManager.get(x, y);
  if (target) {
    this.game.console.log(`You attack the <strong>${target.name}</strong>!`);
    target.takeDamage(1);
    return true;
  }

  const tile = this.game.map.get(x, y);
  return tile.bump(this);
};

// initial stats
RL.Player.prototype.maxLife = 6;
RL.Player.prototype.life = 3;
RL.Player.prototype.gold = 3;
RL.Player.prototype.keys = 3;
RL.Player.prototype.bombs = 3;

// increase and decrease max life
RL.Player.prototype.addHeart = function addHeart() {
  if (this.maxLife < 6) {
    this.maxLife += 1;
    this.life += 1;
  }
};
RL.Player.prototype.removeHeart = function removeHeart() {
  this.maxLife -= 1;
  if (this.life > this.maxLife) {
    this.life = this.maxLife;
  }
};

// Damage and healing
RL.Player.prototype.takeDamage = function takeDamage(amount) {
  this.game.console.log(`You take <strong>${amount}</strong> damage.`);
  this.life -= amount;
  if (this.life < 0) {
    this.life = 0;
  }
  if (this.life === 0) {
    if (!this.dead) {
      this.game.console.log('<strong>You are dead!</strong>');
      this.game.console.log(`Your final score is ${this.gold} gold pieces.`);
      this.game.console.log('Reload the page to try again.');
      this.dead = true;
      this.color = 'red';
      this.char = '@';
    }
    if (!this.immortal) {
      this.game.gameOver = true;
    }
  }

  const overlay = document.querySelector('.overlay');
  overlay.classList.add('damaged');
  setTimeout(() => overlay.classList.remove('damaged'), 100);
};
RL.Player.prototype.heal = function heal(amount) {
  this.life += amount;
  if (this.life > this.maxLife) {
    this.life = this.maxLife;
  }
};

// Adding and removing gold
RL.Player.prototype.addGold = function addGold(amount) {
  this.gold += amount;
  if (this.gold > 99) {
    this.gold = 99;
  }
};
RL.Player.prototype.removeGold = function removeGold(amount) {
  this.gold -= amount;
  if (this.gold < 0) {
    this.gold = 0;
  }
};

// Adding and removing keys
RL.Player.prototype.addKeys = function addKeys(amount) {
  this.keys += amount;
  if (this.keys > 99) {
    this.keys = 99;
  }
};
RL.Player.prototype.removeKeys = function removeKeys(amount) {
  this.keys -= amount;
  if (this.keys < 0) {
    this.keys = 0;
  }
};

// Adding and removing bombs
RL.Player.prototype.addBombs = function addBombs(amount) {
  this.bombs += amount;
  if (this.bombs > 99) {
    this.boms = 99;
  }
};
RL.Player.prototype.removeBombs = function removeBombs(amount) {
  this.bombs -= amount;
  if (this.bombs < 0) {
    this.bombs = 0;
  }
};
