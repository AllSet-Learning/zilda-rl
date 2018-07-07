/* global fetch, Promise */
import ROT from './rotjs/rot.js';
import RL from './skeleton/rl.js';
import Room from './Room.js';

function standardizeDirection(direction) {
  const directionMap = {
    n: 'north',
    N: 'north',
    north: 'north',
    North: 'north',
    NORTH: 'north',
    s: 'south',
    S: 'south',
    south: 'south',
    South: 'south',
    SOUTH: 'south',
    e: 'east',
    E: 'east',
    east: 'east',
    East: 'east',
    EAST: 'east',
    w: 'west',
    W: 'west',
    west: 'west',
    West: 'west',
    WEST: 'west',
  };

  return directionMap[direction];
}

export default class Dungeon {
  constructor(game, dungeonWidth, dungeonHeight, roomWidth, roomHeight) {
    this.game = game;
    this.width = dungeonWidth;
    this.height = dungeonHeight;
    this.roomWidth = roomWidth;
    this.roomHeight = roomHeight;
    this.tilesWidth = dungeonWidth * roomWidth;
    this.tilesHeight = dungeonHeight * roomHeight;
    this.rooms = new RL.Array2d(dungeonWidth, dungeonHeight);
    this.levels = [null];
    this.roomLayouts = {};
    this.levelData = {};
    this.connections = [];
    this.defaultLayout = null;
    this.defaultLevel = null;
  }

  update() {
    const { player } = this.game;
    player.room.explored = true;
    player.room.update(player);
  }

  async loadLevels(fnames) {
    const response = await fetch('data/levels/default.json');
    this.defaultLevel = await response.json();

    const promises = fnames
      .map(fname => `data/levels/${fname}.json`)
      .map(url => fetch(url).then(res => res.json()));
    const levelData = await Promise.all(promises);
    const levels = levelData
      .reduce((previous, current) => [...previous, ...current], [])
      .map(level => ({ ...this.defaultLevel, ...level }));

    levels.forEach((level) => {
      const { depth } = level;
      if (!this.levelData[depth]) {
        this.levelData[depth] = [];
      }
      this.levelData[depth].push(level);
    });
  }

  async loadLayouts(roomTypes) {
    const defualtLayoutResponse = await fetch('data/rooms/default.json');
    this.defaultLayout = await defualtLayoutResponse.json();

    const promises = roomTypes.map(roomType => fetch(`data/rooms/${roomType}.json`).then(res => res.json()));
    this.roomLayouts = (await Promise.all(promises)).reduce((prev, cur, index) => ({
      ...prev,
      [roomTypes[index]]: cur,
    }), {});

    // Additional processing of room layouts (defaults and data clean-up)
    Object.keys(this.roomLayouts).forEach((roomType) => {
      this.roomLayouts[roomType] = this.roomLayouts[roomType].map((layout) => {
        // fill in defaults
        const processedLayout = {
          ...this.defaultLayout,
          ...layout,
        };

        // fill in default charToTileType
        processedLayout.charToTileType = {
          ...this.defaultLayout.charToTileType,
          ...processedLayout.charToTileType,
        };

        // standardize directions (N, n, North, NORTH => north, etc)
        processedLayout.requiredDoors = processedLayout.requiredDoors.map(standardizeDirection);
        processedLayout.optionalDoors = processedLayout.optionalDoors.map(standardizeDirection);

        return processedLayout;
      });
    });
  }

  validDirections(roomX, roomY) {
    const directions = ['north', 'south', 'east', 'west'];
    if (roomX === 0) {
      directions.splice(directions.indexOf('west'), 1);
    }
    if (roomX === this.width - 1) {
      directions.splice(directions.indexOf('east'), 1);
    }
    if (roomY === 0) {
      directions.splice(directions.indexOf('north'), 1);
    }
    if (roomY === this.height - 1) {
      directions.splice(directions.indexOf('south'), 1);
    }
    return directions;
  }

  getRoomToDirection(fromRoom, direction) {
    let newRoomX = fromRoom.x;
    let newRoomY = fromRoom.y;
    switch (direction) {
      case 'north':
        newRoomY -= 1;
        break;
      case 'south':
        newRoomY += 1;
        break;
      case 'east':
        newRoomX += 1;
        break;
      case 'west':
        newRoomX -= 1;
        break;
      default:
        console.warn(`Invalid direction '${direction}' passed to getRoomToDirection`);
    }
    return this.rooms.get(newRoomX, newRoomY);
  }

  getAllRooms() {
    const roomArray = [];
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        roomArray.push(this.rooms.get(x, y));
      }
    }
    return roomArray;
  }

  getRoomsWithTag(tag) {
    return this.getAllRooms().filter(room => room.hasTag(tag));
  }

  makeMaze(startX, startY) {
    this.rooms.get(startX, startY).addTag('START');
    const inMaze = [this.rooms.get(startX, startY)];
    const walls = [];
    const directions = this.validDirections(startX, startY);
    directions.forEach((direction) => {
      walls.push({
        direction,
        position: [startX, startY],
      });
    });

    while (walls.length > 0) {
      const wall = RL.Util.randomChoice(walls);
      const room = this.rooms.get(wall.position[0], wall.position[1]);
      const toRoom = this.getRoomToDirection(room, wall.direction);
      if (!inMaze.includes(toRoom)) {
        room.connect(toRoom);
        inMaze.push(toRoom);
        const newWalls = this.validDirections(toRoom.x, toRoom.y);
        newWalls.forEach((direction) => {
          walls.push({
            direction,
            position: [toRoom.x, toRoom.y],
          });
        });
      }
      walls.splice(walls.indexOf(wall), 1);
    }
    inMaze[inMaze.length - 1].addTag('END');
  }

  getCompatibleRoomLayouts(room, roomTypes) {
    const possibleLayouts = roomTypes
      .reduce((previous, current) => [...previous, ...this.roomLayouts[current]], []);
    return possibleLayouts.filter((layout) => {
      let compatible = true;

      // check that room has required doors
      layout.requiredDoors.forEach((direction) => {
        if (
          compatible
          && !room.hasConnection(direction)
        ) {
          compatible = false;
        }
      });

      // check that room does not have any doors the layout doesn't support
      ['north', 'south', 'east', 'west'].forEach((direction) => {
        if (
          compatible
          && room.hasConnection(direction)
          && !layout.requiredDoors.includes(direction)
          && !layout.optionalDoors.includes(direction)
        ) {
          compatible = false;
        }
      });

      return compatible;
    });
  }

  digRooms(levelData) {
    const { roomTypes, startRooms, endRooms } = levelData;

    // TODO clean up
    const allRooms = this.getAllRooms();
    const usedLayouts = [];
    allRooms.forEach((room) => {
      let layout = {
        name: 'foobar',
      };
      if (room.hasTag('START')) {
        while (startRooms.indexOf(layout.name) === -1) {
          layout = RL.Util.randomChoice(this.roomLayouts.start);
        }
      } else if (room.hasTag('END')) {
        while (endRooms.indexOf(layout.name) === -1) {
          layout = RL.Util.randomChoice(this.roomLayouts.end);
        }
      } else if (room.hasTag('SHOP')) {
        layout = RL.Util.randomChoice(this.roomLayouts.shop);
      } else {
        const layouts = this.getCompatibleRoomLayouts(room, roomTypes)
          .filter(l => !usedLayouts.includes(l));

        if (layouts.length) {
          layout = RL.Util.weightedChoice(layouts, l => l.weight);
          usedLayouts.push(layout);
        } else {
          layout = this.defaultLayout;
        }
      }

      // make a copy of mapData so we're not changing future layouts
      let mapData = [...layout.mapData];

      // add walls around room
      mapData = mapData.map(row => `#${row}#`);
      const wallNS = Array(room.width).fill('#').join('');
      mapData.unshift(wallNS);
      mapData.push(wallNS);

      // add doors in walls
      if (room.connections.north !== null) {
        mapData[0] = `${mapData[0].slice(0, room.centerX)}+${mapData[0].slice(room.centerX + 1, room.width)}`;
      }
      if (room.connections.south !== null) {
        mapData[room.height - 1] = `${mapData[room.height - 1].slice(0, room.centerX)}+${mapData[room.height - 1].slice(room.centerX + 1, room.width)}`;
      }
      if (room.connections.east !== null) {
        mapData[room.centerY] = `${mapData[room.centerY].slice(0, room.width - 1)}+`;
      }
      if (room.connections.west !== null) {
        mapData[room.centerY] = `+${mapData[room.centerY].slice(1, room.width)}`;
      }

      // load the room data
      room.loadTilesFromArrayString(
        mapData,
        layout.charToTileType,
        'floor',
      );
    });
  }

  static loadColors(data) {
    // TODO clean up
    Object.keys(RL.Tile.Types).forEach((key) => {
      if (key !== undefined && key !== 'floor' && key !== 'wall') {
        if (RL.Tile.Types[key].color === RL.Tile.Types.floor.color) {
          RL.Tile.Types[key].color = data.floorForeground;
        } else if (RL.Tile.Types[key].color === RL.Tile.Types.floor.bgColor) {
          RL.Tile.Types[key].color = data.floorBackground;
        } else if (RL.Tile.Types[key].color === RL.Tile.Types.wall.color) {
          RL.Tile.Types[key].color = data.wallForeground;
        } else if (RL.Tile.Types[key].color === RL.Tile.Types.wall.bgColor) {
          RL.Tile.Types[key].color = data.wallBackground;
        }
        if (RL.Tile.Types[key].bgColor === RL.Tile.Types.floor.color) {
          RL.Tile.Types[key].bgColor = data.floorForeground;
        } else if (RL.Tile.Types[key].bgColor === RL.Tile.Types.floor.bgColor) {
          RL.Tile.Types[key].bgColor = data.floorBackground;
        } else if (RL.Tile.Types[key].bgColor === RL.Tile.Types.wall.color) {
          RL.Tile.Types[key].bgColor = data.wallForeground;
        } else if (RL.Tile.Types[key].bgColor === RL.Tile.Types.wall.bgColor) {
          RL.Tile.Types[key].bgColor = data.wallBackground;
        }
      }
    });
    RL.Tile.Types.floor.color = data.floorForeground;
    RL.Tile.Types.floor.bgColor = data.floorBackground;
    RL.Tile.Types.wall.color = data.wallForeground;
    RL.Tile.Types.wall.bgColor = data.wallBackground;
  }

  isolateRooms() {
    this.getAllRooms().forEach((room) => {
      if (
        room.countConnections() === 1
        && !room.hasTag('END')
        && !room.hasTag('START')
        && ROT.RNG.getUniform() < 0.25
      ) {
        room.isolate();
        room.addTag('ISOLATED');
      }
    });
  }

  addShortcuts() {
    this.getAllRooms().forEach((room) => {
      if (room.countConnections() === 2) {
        const directions = this.validDirections(room.x, room.y);
        RL.Util.shuffle(directions);
        directions.forEach((direction) => {
          const otherRoom = this.getRoomToDirection(room, direction);
          if (
            !otherRoom.hasTag('END')
            && !otherRoom.hasTag('TREASURE')
            && !otherRoom.hasTag('ISOLATED')
            && !room.hasConnection(direction)
            && ROT.RNG.getUniform() < 0.5
          ) {
            room.connect(otherRoom);
            room.addTag('SHORTCUT');
            room.addTag(`SHORTCUT_${direction.toUpperCase()}`);
            otherRoom.addTag('SHORTCUT');
            otherRoom.addTag(`SHORTCUT_${RL.Util.oppositeDirection(direction).toUpperCase()}`);
          }
        });
      }
    });
  }

  tagTreasureRooms() {
    this.getAllRooms().forEach((room) => {
      if (
        room.countConnections() === 1
        && !room.hasTag('END')
        && !room.hasTag('START')
      ) {
        room.addTag('TREASURE');
      }
    });
  }

  tagShop() {
    const treasureRooms = this.getRoomsWithTag('TREASURE');
    const shop = RL.Util.randomChoice(treasureRooms);
    shop.removeTag('TREASURE');
    shop.addTag('SHOP');
  }

  lockRooms() {
    this.getAllRooms().filter(room => room.hasTag('END') || room.hasTag('TREASURE')).forEach((room) => {
      const directions = ['north', 'south', 'east', 'west'];
      directions.forEach((direction) => {
        if (room.hasConnection(direction)) {
          const otherRoom = room.connections[direction];
          let fromX;
          let fromY;
          let toX;
          let toY;
          switch (direction) {
            case 'north':
              fromX = room.centerX;
              fromY = 0;
              toX = otherRoom.centerX;
              toY = otherRoom.height - 1;
              break;
            case 'south':
              fromX = room.centerX;
              fromY = room.height - 1;
              toX = otherRoom.centerX;
              toY = 0;
              break;
            case 'east':
              fromX = room.width - 1;
              fromY = room.centerY;
              toX = 0;
              toY = otherRoom.centerY;
              break;
            case 'west':
              fromX = 0;
              fromY = room.centerY;
              toX = otherRoom.width - 1;
              toY = otherRoom.centerY;
              break;
            default:
              // nothing
          }

          let type;
          if (room.hasTag('END')) {
            type = 'lockedDoor';
          } else {
            type = RL.Util.randomChoice([
              'lockedDoor',
              'lockedDoor',
              'lockedDoor',
              'weakWall',
            ]);
          }
          room.map.set(fromX, fromY, type);
          otherRoom.map.set(toX, toY, type);
        }
      });
    });
  }

  blockShortcuts() {
    this.getAllRooms().forEach((room) => {
      if (
        room.hasTag('SHORTCUT')
        && ROT.RNG.getUniform() < 0.25
      ) {
        let direction;
        let otherRoom;
        let fromX;
        let fromY;
        let toX;
        let toY;
        if (room.hasTag('SHORTCUT_NORTH')) {
          direction = 'north';
          otherRoom = room.connections[direction];
          fromX = room.centerX;
          fromY = 0;
          toX = otherRoom.centerX;
          toY = otherRoom.height - 1;
        } else if (room.hasTag('SHORTCUT_SOUTH')) {
          direction = 'south';
          otherRoom = room.connections[direction];
          fromX = room.centerX;
          fromY = room.height - 1;
          toX = otherRoom.centerX;
          toY = 0;
        } else if (room.hasTag('SHORTCUT_EAST')) {
          direction = 'east';
          otherRoom = room.connections[direction];
          fromX = room.width - 1;
          fromY = room.centerY;
          toX = 0;
          toY = otherRoom.centerY;
        } else if (room.hasTag('SHORTCUT_WEST')) {
          direction = 'west';
          otherRoom = room.connections[direction];
          fromX = 0;
          fromY = room.centerY;
          toX = otherRoom.width - 1;
          toY = otherRoom.centerY;
        }
        room.map.set(fromX, fromY, 'weakWall');
        room.addTag('BLOCKED_SHORTCUT');
        otherRoom.map.set(toX, toY, 'weakWall');
        otherRoom.addTag('BLOCKED_SHORTCUT');
      }
    });
  }

  static getMonsterTypes(levelData) {
    return Object
      .keys(RL.Entity.Types)
      .filter(monster => levelData.monsterTypes.includes(RL.Entity.Types[monster].type));
  }

  spawnMonsters(levelData) {
    // determine which monsters are suitable for level
    const monsters = Dungeon.getMonsterTypes(levelData);

    this.getAllRooms().forEach((room) => {
      let numMonsters = ROT.RNG.getUniformInt(
        levelData.minMonstersPerRoom,
        levelData.maxMonstersPerRoom,
      );
      if (room.hasTag('START') || room.hasTag('SHOP')) {
        numMonsters = 0;
      } else if (room.hasTag('END') || room.hasTag('TREASURE')) {
        numMonsters *= 2;
      }
      for (let i = 0; i < numMonsters; i += 1) {
        room.spawnMonster(monsters);
      }
    });
  }

  spawnItems() {
    const items = ['heart', 'gold', 'threeGold', 'key', 'bomb'];
    this.getAllRooms().forEach((room) => {
      room.spawnItem(items);
      if (room.hasTag('TREASURE')) {
        room.spawnItem(items);
        room.spawnItem(items);
        room.spawnItem(items);
        room.spawnItem(items);
      }
    });
  }

  loadLevelData(depth) {
    let newLevelData;
    this.levels[depth] = new RL.Array2d(this.width, this.height);
    this.rooms = this.levels[depth];
    if (this.levelData[depth] === undefined || this.levelData[depth] === []) {
      console.log(`No levels for depth ${depth}; using default`);
      newLevelData = this.defaultLevel;
    } else {
      newLevelData = RL.Util.randomChoice(this.levelData[depth]);
    }
    return newLevelData;
  }

  initLevel(levelData) {
    Dungeon.loadColors(levelData);
    this.rooms.reset(this.width, this.height);
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        this.rooms.set(x, y, new Room(this.game, x, y, this.roomWidth, this.roomHeight));
      }
    }
  }

  generate(depth, startX, startY) {
    const newLevelData = this.loadLevelData(depth);
    this.levelGenerationData = newLevelData;
    this.initLevel(newLevelData);
    this.makeMaze(startX, startY);
    this.isolateRooms(newLevelData);
    this.addShortcuts(newLevelData);
    this.tagTreasureRooms(newLevelData);
    if (depth % 4 === 0) this.tagShop(newLevelData);
    this.digRooms(newLevelData);
    this.lockRooms(newLevelData);
    this.blockShortcuts(newLevelData);
    this.spawnMonsters(newLevelData);
    this.spawnItems(newLevelData);
    console.log(this.toAsciiMap());
  }

  toAsciiMap() {
    const rows = [];
    for (let y = 0; y < this.height; y += 1) {
      let roomRow = '';
      let connectionRow = '';
      for (let x = 0; x < this.width; x += 1) {
        const room = this.rooms.get(x, y);

        let roomString = '[ ]';
        if (room.hasTag('START')) {
          roomString = '[S]';
        } else if (room.hasTag('END')) {
          roomString = '[E]';
        } else if (room.hasTag('SHOP')) {
          roomString = '[$]';
        } else if (room.hasTag('TREASURE')) {
          roomString = '[T]';
        } else if (room.hasTag('ISOLATED')) {
          roomString = '   ';
        } else {
          roomString = `[${room.countConnections()}]`;
        }

        roomRow += roomString;
        if (room.hasConnection('south')) {
          connectionRow += ' |  ';
        } else {
          connectionRow += '    ';
        }
        if (room.hasConnection('east')) {
          roomRow += '-';
        } else {
          roomRow += ' ';
        }
      }
      rows.push(roomRow);
      rows.push(connectionRow);
    }
    return rows.join('\n');
  }
}
