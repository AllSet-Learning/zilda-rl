/* global fetch */
import RL from '../skeleton/rl.js';
import Dungeon from '../Dungeon.js';

// customize basic game "turn"
RL.Game.prototype.onKeyAction = function onKeyAction(action) {
  if (!this.gameOver) {
    const result = this.player.update(action);
    if (result) {
      this.updateAll();
    } else if (this.queueDraw) {
      this.renderer.draw();
      this.hudRenderer.draw();
    }
  }
  this.queueDraw = false;
};

// new update function to force updates without keypress
RL.Game.prototype.updateAll = function updateAll() {
  this.dungeon.update();
  this.renderer.draw();
  this.updateHud();
  this.hudRenderer.draw();
};

// custom start function
RL.Game.prototype.start = function start() {
  const playerRoom = this.player.room;
  playerRoom.explored = true;

  this.entityManager = playerRoom.entityManager;
  this.itemManager = playerRoom.itemManager;
  this.map = playerRoom.map;

  this.entityManager.add(this.player.x, this.player.y, this.player);

  this.renderer.setCenter(playerRoom.centerX, playerRoom.centerY);
  this.renderer.draw();

  this.initHud();
  this.updateHud();
  this.hudRenderer.draw();
};

// New function to initializes the HUD tiles
RL.Game.prototype.initHud = function initHud() {
  this.hudMap.get(0, 0).char = 'L';
  this.hudMap.get(0, 0).color = 'white';
  this.hudMap.get(1, 0).char = 'E';
  this.hudMap.get(1, 0).color = 'white';
  this.hudMap.get(2, 0).char = 'V';
  this.hudMap.get(2, 0).color = 'white';
  this.hudMap.get(3, 0).char = 'E';
  this.hudMap.get(3, 0).color = 'white';
  this.hudMap.get(4, 0).char = 'L';
  this.hudMap.get(4, 0).color = 'white';
  this.hudMap.get(5, 0).char = ' ';
  this.hudMap.get(5, 0).color = 'white';
  this.hudMap.get(6, 0).char = '0';
  this.hudMap.get(6, 0).color = 'white';
  this.hudMap.get(7, 0).char = '1';
  this.hudMap.get(7, 0).color = 'white';

  this.hudMap.get(this.dungeon.width + 1, 1).char = '⁂';
  this.hudMap.get(this.dungeon.width + 1, 1).color = 'yellow';
  this.hudMap.get(this.dungeon.width + 2, 1).char = 'X';
  this.hudMap.get(this.dungeon.width + 2, 1).color = 'white';
  this.hudMap.get(this.dungeon.width + 3, 1).color = 'white';
  this.hudMap.get(this.dungeon.width + 4, 1).color = 'white';

  this.hudMap.get(this.dungeon.width + 1, 2).char = '۴'; // "স";// ۴ ߞ ߓ ᚩ ᚨ ᚡ শ  ไ ᶋ
  this.hudMap.get(this.dungeon.width + 1, 2).color = 'orange';
  this.hudMap.get(this.dungeon.width + 2, 2).char = 'X';
  this.hudMap.get(this.dungeon.width + 2, 2).color = 'white';
  this.hudMap.get(this.dungeon.width + 3, 2).color = 'white';
  this.hudMap.get(this.dungeon.width + 4, 2).color = 'white';

  this.hudMap.get(this.dungeon.width + 1, 3).char = 'ර'; // Ȯ Q ᵹ Ố
  this.hudMap.get(this.dungeon.width + 1, 3).color = 'blue';
  this.hudMap.get(this.dungeon.width + 2, 3).char = 'X';
  this.hudMap.get(this.dungeon.width + 2, 3).color = 'white';
  this.hudMap.get(this.dungeon.width + 3, 3).color = 'white';
  this.hudMap.get(this.dungeon.width + 4, 3).color = 'white';

  for (let x = 0; x < this.hudMap.width; x += 1) {
    for (let y = 0; y < this.hudMap.height; y += 1) {
      this.hudMap.get(x, y).explored = true;
    }
  }
  for (let x = 0; x < this.dungeon.width; x += 1) {
    for (let y = 0; y < this.dungeon.height; y += 1) {
      const tile = this.hudMap.get(x, y + 1);
      tile.explored = false;
      tile.color = 'blue';
    }
  }
};

// New function to update the hud
RL.Game.prototype.updateHud = function updateHud() {
  for (let x = 0; x < this.dungeon.width; x += 1) {
    for (let y = 0; y < this.dungeon.height; y += 1) {
      const tile = this.hudMap.get(x, y + 1);
      tile.explored = this.dungeon.rooms.get(x, y).explored;
      if (this.player.room.x === x && this.player.room.y === y) {
        tile.color = 'yellow';
      } else {
        tile.color = 'blue';
      }
    }
  }

  let depthString = this
    .depth
    .toString();
  if (depthString.length === 1) {
    depthString = `0${depthString}`;
  }
  this.hudMap.get(6, 0).char = depthString[0]; // eslint-disable-line prefer-destructuring
  this.hudMap.get(7, 0).char = depthString[1]; // eslint-disable-line prefer-destructuring

  let goldString = this.player.gold.toString();
  if (goldString.length === 1) {
    goldString = `0${goldString}`;
  }
  this.hudMap.get(this.dungeon.width + 3, 1).char = goldString[0]; // eslint-disable-line prefer-destructuring, max-len
  this.hudMap.get(this.dungeon.width + 4, 1).char = goldString[1]; // eslint-disable-line prefer-destructuring, max-len

  let keysString = this.player.keys.toString();
  if (keysString.length === 1) {
    keysString = `0${keysString}`;
  }
  this.hudMap.get(this.dungeon.width + 3, 2).char = keysString[0]; // eslint-disable-line prefer-destructuring, max-len
  this.hudMap.get(this.dungeon.width + 4, 2).char = keysString[1]; // eslint-disable-line prefer-destructuring, max-len

  let bombsString = this.player.bombs.toString();
  if (bombsString.length === 1) {
    bombsString = `0${bombsString}`;
  }
  this.hudMap.get(this.dungeon.width + 3, 3).char = bombsString[0]; // eslint-disable-line prefer-destructuring, max-len
  this.hudMap.get(this.dungeon.width + 4, 3).char = bombsString[1]; // eslint-disable-line prefer-destructuring, max-len

  for (let x = this.hudMap.width - this.player.maxLife; x < this.hudMap.width; x += 1) {
    const y = 0;
    const tile = this.hudMap.get(x, y);
    tile.char = '♥';
    if (x - (this.hudMap.width - this.player.maxLife) >= this.player.life) {
      tile.color = 'gray';
    } else {
      tile.color = 'red';
    }
  }
};

// New function that handles player moving from one room to another
RL.Game.prototype.movePlayerRoom = function movePlayerRoom(fromRoom, toRoom) {
  this.player.room = toRoom;
  this.entityManager = toRoom.entityManager;
  this.itemManager = toRoom.itemManager;
  this.map = toRoom.map;
  this.updateHud();
  this.renderer.draw();
  this.hudRenderer.draw();

  // if player reenters a room with no monsters, spawn more monsters
  if (toRoom.explored && toRoom.entityManager.objects.length === 1) {
    const levelData = this.dungeon.levelGenerationData;
    const { minMonstersPerRoom: min, maxMonstersPerRoom: max } = levelData;
    const numMonsters = Math.floor(Math.random() * (max - min)) + min;
    const monsterTypes = Dungeon.getMonsterTypes(levelData);
    for (let i = 0; i < numMonsters; i += 1) {
      toRoom.spawnMonster(monsterTypes, true);
    }
  }

  this.updateAll();
};

// load monsters from json
RL.Game.prototype.loadMonsters = async function loadMonsters(monsterTypes) {
  RL.Entity.Types = {};

  const defaultMonsterResponse = await fetch('data/monsters/default.json');
  const defaultMonster = (await defaultMonsterResponse.json()).default;

  const promises = monsterTypes.map(type => fetch(`data/monsters/${type}.json`).then(res => res.json()));

  const monsterData = (await Promise.all(promises)).reduce((prev, cur, index) => ({
    ...prev,
    [monsterTypes[index]]: cur,
  }), {});

  Object.keys(monsterData).forEach((monsterType) => {
    Object.keys(monsterData[monsterType]).forEach((monsterID) => {
      const monster = {
        ...defaultMonster,
        ...monsterData[monsterType][monsterID],
        type: monsterType,
      };
      RL.Entity.Types[monsterID] = monster;
    });
  });
};
