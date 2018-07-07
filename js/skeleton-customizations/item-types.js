import RL from '../skeleton/rl.js';

RL.Item.Types = {
  heart: {
    name: 'Heart',
    color: 'red',
    bgColor: false,
    char: '♥',
    canAttachTo(entity) {
      return this.game.player === entity;
    },
    attachTo(entity) {
      entity.heal(1);
    },
  },

  gold: {
    name: 'Gold',
    color: 'yellow',
    bgColor: false,
    char: '*',
    canAttachTo(entity) {
      return this.game.player === entity;
    },
    attachTo(entity) {
      entity.addGold(1);
    },
  },

  threeGold: {
    name: '3 Gold',
    color: 'yellow',
    bgColor: false,
    char: '⁂',
    canAttachTo(entity) {
      return this.game.player === entity;
    },
    attachTo(entity) {
      entity.addGold(3);
    },
  },

  key: {
    name: 'Key',
    color: 'orange',
    bgColor: false,
    char: '۴',
    canAttachTo(entity) {
      return this.game.player === entity;
    },
    attachTo(entity) {
      entity.addKeys(1);
    },
  },

  bomb: {
    name: 'Bomb',
    color: 'blue',
    bgColor: false,
    char: 'ර',
    canAttachTo(entity) {
      return this.game.player === entity;
    },
    attachTo(entity) {
      entity.addBombs(1);
    },
  },
};
