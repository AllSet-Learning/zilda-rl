import RL from '../skeleton/rl.js';

RL.Tile.Types.floor = {
  name: 'Floor',
  char: '.',
  color: '#444',
  bgColor: '#222',
  passable: true,
};

RL.Tile.Types.wall = {
  name: 'Wall',
  char: '#',
  color: '#777',
  bgColor: '#2e2e2e',
  passable: false,
  bombable: false,
};

RL.Tile.Types.weakWall = {
  name: 'Weak Wall',
  char: '≠',
  color: '#777',
  bgColor: '#2e2e2e',
  passable: false,
  bombable: true,
};

RL.Tile.Types.door = {
  name: 'Door',
  char: '▇',
  color: '#222',
  bgColor: '#2e2e2e',
  passable: true,
  bombable: false,
};

RL.Tile.Types.lockedDoor = {
  name: 'Locked Door',
  char: '▇',
  color: '#8B4513',
  bgColor: '#2e2e2e',
  passable: false,
  bombable: false,
  bump(entity) {
    if (entity.keys) {
      this.game.console.log('You unlock the door');
      entity.removeKeys(1);
      this.game.map.set(this.x, this.y, 'door');
    }
    this.game.renderer.draw();
  },
};

RL.Tile.Types.fire = {
  name: 'Fire',
  char: '火',
  color: 'red',
  bgColor: '#522',
  passable: true,
  update() {
    const entity = this.game.entityManager.get(this.x, this.y);
    if (entity) {
      if (entity === this.game.player) {
        this.game.console.log('You got burned by 火 (huǒ)! OUCH!');
      }
      entity.takeDamage(1);
    }
  },
};

RL.Tile.Types.bombThree = {
  name: 'Bomb',
  char: 'ර',
  color: 'blue',
  bgColor: '#222',
  passable: true,
  update() {
    this.game.console.log('Three.');
    this.changeType('bombTwo');
  },
};

RL.Tile.Types.bombTwo = {
  name: 'Bomb',
  char: 'ර',
  color: 'blue',
  bgColor: '#222',
  passable: true,
  update() {
    this.game.console.log('Two!');
    this.changeType('bombOne');
  },
};

RL.Tile.Types.bombOne = {
  name: 'Bomb',
  char: 'ර',
  color: 'red',
  bgColor: '#222',
  passable: true,
  update() {
    this.game.console.log('ONE!');
    this.changeType('bombExploding');
  },
};

RL.Tile.Types.bombExploding = {
  name: 'Bomb',
  char: 'ර',
  color: 'red',
  bgColor: '#222',
  passable: true,
  update() {
    for (let x = this.x - 1; x < this.x + 2; x += 1) {
      for (let y = this.y - 1; y < this.y + 2; y += 1) {
        const tile = this.game.map.get(x, y);
        if (tile.bombable) {
          this.game.map.get(x, y).changeType('explosion');
          if (x > this.x || (x === this.x && y > this.y)) {
            this.game.map.get(x, y).skip = true;
          }
          const entity = this.game.entityManager.get(x, y);
          if (entity) {
            entity.takeDamage(1);
          }
        }
      }
    }
    this.changeType('explosion');
  },
};

RL.Tile.Types.explosion = {
  name: 'Explosion',
  char: '火',
  color: 'red',
  bgColor: '#522',
  passable: true,
  update() {
    this.changeType('embers');
  },
};

RL.Tile.Types.embers = {
  name: 'Embers',
  char: '.',
  color: '#522',
  bgColor: '#222',
  passable: true,
};

RL.Tile.Types.brazier = {
  name: 'Brazier',
  char: '♨',
  color: 'red',
  bgColor: '#222',
  passable: false,
  bombable: true,
};

RL.Tile.Types.puddle = {
  name: 'Puddle',
  char: '~',
  color: 'blue',
  bgColor: '#222',
  passable: true,
  bombable: true,
};

RL.Tile.Types.acidPuddle = {
  name: 'Puddle',
  char: '~',
  color: 'blue',
  bgColor: '#222',
  passable: true,
  bombable: true,
  update() {
    const entity = this.game.entityManager.get(this.x, this.y);
    if (entity) {
      entity.takeDamage(1);
    }
  },
};

RL.Tile.Types.tombstone = {
  name: 'Tombstone',
  char: '☗',
  color: '#777',
  bgColor: '#222',
  passable: true,
  bombable: true,
};

RL.Tile.Types.pillar = {
  name: 'Pillar',
  char: '●',
  color: '#2e2e2e',
  bgColor: '#222',
  passable: false,
  bombable: false,
};

RL.Tile.Types.downStairs = {
  name: 'Stairs',
  char: 'Ω',
  color: '#CC2EFA',
  bgColor: '#222',
  passable: true,
  bombable: false,
  onEntityEnter(entity) {
    if (entity === this.game.player) {
      this.game.depth += 1;
      if (this.game.dungeon.levels.length === this.game.depth) {
        console.log('generating new level');
        this.game.dungeon.generate(
          this.game.depth,
          this.game.player.room.x,
          this.game.player.room.y,
        );
      } else {
        console.log('level already generated');
        this.game.dungeon.rooms = this.game.dungeon.levels[this.game.depth];
      }
      this.game.player.room.entityManager.remove(this.game.player);
      this.game.dungeon.getRoomsWithTag('START')[0].entityManager.add(this.game.player.x, this.game.player.y, this.game.player);
      this.game.movePlayerRoom(this.game.player.room, this.game.dungeon.getRoomsWithTag('START')[0]);
    }
  },
};

RL.Tile.Types.upStairs = {
  name: 'Stairs',
  char: '<',
  color: '#777',
  bgColor: '#222',
  passable: true,
  bombdable: false,
};

// Shop-specific tiles
RL.Tile.Types.bombBlock = {
  name: 'Bomb Display',
  char: 'ර',
  color: 'blue',
  bgColor: '#004',
  passable: false,
  bombable: false,
  bump() {
    this.game.console.log('Move into the space below to buy a bomb for 3 gold');
  },
};

RL.Tile.Types.bombBuy = {
  name: 'Buy a Bomb',
  char: '⁂',
  color: '#880',
  bgColor: '#222',
  passable: true,
  bombable: false,
  onEntityEnter(entity) {
    console.log('bombBuy entered');
    if (entity === this.game.player) {
      if (entity.gold >= 3) {
        entity.removeGold(3);
        entity.addBombs(1);
        this.game.console.log('You buy a bomb for 3 gold');
      } else {
        this.game.console.log('It costs 3 gold to buy a bomb');
      }
    }
  },
};

RL.Tile.Types.keyBlock = {
  name: 'Key Display',
  char: '۴',
  color: 'orange',
  bgColor: '#420',
  passable: false,
  bombable: false,
  bump() {
    this.game.console.log('Move into the space below to buy a key for 3 gold');
  },
};

RL.Tile.Types.keyBuy = {
  name: 'Buy a Key',
  char: '⁂',
  color: '#880',
  bgColor: '#222',
  passable: true,
  bombable: false,
  onEntityEnter(entity) {
    if (entity === this.game.player) {
      if (entity.gold >= 3) {
        entity.removeGold(3);
        entity.addKeys(1);
        this.game.console.log('You buy a key for 3 gold');
      } else {
        this.game.console.log('It costs 3 gold to buy a key');
      }
    }
  },
};

RL.Tile.Types.heartBlock = {
  name: 'Heart Display',
  char: '♥',
  color: 'red',
  bgColor: '#400',
  passable: false,
  bombable: false,
  bump() {
    this.game.console.log('Move into the space below to heal a heart for 3 gold');
  },
};

RL.Tile.Types.heartBuy = {
  name: 'Buy a Heart',
  char: '⁂',
  color: '#880',
  bgColor: '#222',
  passable: true,
  bombable: false,
  onEntityEnter(entity) {
    if (entity === this.game.player) {
      if (entity.gold >= 3) {
        entity.removeGold(3);
        entity.heal(1);
        this.game.console.log('You heal for 3 gold');
      } else {
        this.game.console.log('It costs 3 gold to heal');
      }
    }
  },
};

RL.Tile.Types.hud = {
  name: 'HUD',
  char: '■',
  color: '#000',
  bgColor: '#000',
};
