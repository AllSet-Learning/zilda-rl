var Dungeon = function(game, dungeonWidth, dungeonHeight, roomWidth, roomHeight) {
    this.game = game;
    this.width = dungeonWidth;
    this.height = dungeonHeight;
    this.roomWidth = roomWidth;
    this.roomHeight = roomHeight;
    this.tilesWidth  = dungeonWidth*roomWidth;
    this.tilesHeight = dungeonHeight*roomHeight;
    this.rooms = new RL.Array2d(dungeonWidth,dungeonHeight);
    this.levels = [null];
    this.roomLayouts = {};
    this.levelData = {};
    this.connections = [];
};

Dungeon.prototype = {
    constructor: Dungeon,
    game: null,
    width: null,
    height: null,
    roomWidth: null,
    roomHeight: null,
    tilesWidth: null,
    tilesHeight: null,
    rooms: null,
    levels: null,
    roomLayouts: null,
    defaultLayout: null,
    levelData: null,
    defaultLevel: null,

    update: function() {
        var player = this.game.player;
        player.room.explored = true;
        player.room.update(player);
    },
    
    loadLevels: function(fnames) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET","data/levels/default.json",false);
        xmlHttp.send(null);
        this.defaultLevel = JSON.parse(xmlHttp.responseText);
        for ( var i=0; i<fnames.length; i++ ) {
            xmlHttp.open("GET","data/levels/"+fnames[i]+".json",false);
            xmlHttp.send(null);
            var data = JSON.parse(xmlHttp.responseText);
            for ( var j=0; j<data.length; j++ ) {
                var level = data[j];
                for ( var key in this.defaultLevel ) {
                    if (level[key]===undefined) {
                        level[key] = this.defaultLevel[key];
                    }
                }
                if (this.levelData[level.depth]===undefined) {
                    this.levelData[level.depth] = [];
                }
                this.levelData[level.depth].push(level);
            }
        }
    },

    loadLayouts: function(roomTypes) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET","data/rooms/default.json",false);
        xmlHttp.send(null);
        this.defaultLayout = JSON.parse(xmlHttp.responseText);
        for ( var i=0; i<roomTypes.length; i++ ) {
            var roomType = roomTypes[i];
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET","data/rooms/"+roomType+".json",false);
            xmlHttp.send(null);
            this.roomLayouts[roomType] = JSON.parse(xmlHttp.responseText);

            // add default values to layouts if not overridden
            // standardize directions 'north', 'south', 'east', 'west'
            for ( var j=0; j<this.roomLayouts[roomType].length; j++ ) {
                var layout = this.roomLayouts[roomType][j];
                for ( var key in this.defaultLayout ) {
                    if (layout[key]===undefined) {
                        layout[key] = this.defaultLayout[key];
                    }
                }
                for ( var char in this.defaultLayout.charToTileType ) {
                    if (layout.charToTileType[char]===undefined) {
                        layout.charToTileType[char]=this.defaultLayout.charToTileType[char];
                    }
                }

                var standardizeDirection = function(direction, index, array) {
                    var directionMap = {
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
                        WEST: 'west'
                    };
                    array[index] = directionMap[direction];
                };
                if (layout.requiredDoors) {
                    layout.requiredDoors.forEach(standardizeDirection);
                }
                if (layout.optionalDoors) {
                    layout.optionalDoors.forEach(standardizeDirection);
                }
            }
        }
    },

    validDirections: function(roomX, roomY) {
        var directions = ['north','south','east','west'];
        if (roomX === 0) {
            directions.splice(directions.indexOf('west'),1);
        }
        if (roomX === this.width - 1) {
            directions.splice(directions.indexOf('east'),1);
        }
        if (roomY === 0) {
            directions.splice(directions.indexOf('north'),1);
        }
        if (roomY === this.height - 1) {
            directions.splice(directions.indexOf('south'),1);
        }
        return directions;
    },

    getRoomToDirection: function(fromRoom,direction) {
        newRoomX = fromRoom.x;
        newRoomY = fromRoom.y;
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
        }
        return this.rooms.get(newRoomX,newRoomY);
    },

    getAllRooms: function() {
        var roomArray = [];
        for ( var x=0; x<this.width; x++ ) {
            for ( var y=0; y<this.height; y++ ) {
                roomArray.push(this.rooms.get(x,y));
            }
        }
        return roomArray;
    },

    getRoomsWithTag: function(tag) {
        var roomsWithTag = [];
        var roomArray = this.getAllRooms();
        for ( var i=0; i<roomArray.length; i++ ) {
            var room = roomArray[i];
            if (room.hasTag(tag)) {
                roomsWithTag.push(room);
            }
        }
        return roomsWithTag;
    },

    makeMaze: function(startX,startY) {
        this.rooms.get(startX,startY).addTag('START');
        var inMaze = [this.rooms.get(startX, startY)];
        var walls = [];
        var directions = this.validDirections(startX, startY);
        for (var i = 0; i < directions.length; i++) {
            walls.push([[startX, startY], directions[i]]);
        }
        while (walls.length > 0) {
            var wall = RL.Util.randomChoice(walls);
            var room = this.rooms.get(wall[0][0], wall[0][1]);
            var toRoom = this.getRoomToDirection(room, wall[1]);
            //console.log('Trying to connect room(' + room.x + ', ' + room.y + ') to room(' + toRoom.x + ', ' + toRoom.y + ')');
            if (inMaze.indexOf(toRoom) === -1) {
                room.connect(toRoom);
                inMaze.push(toRoom);
                var newWalls = this.validDirections(toRoom.x, toRoom.y);
                //console.log('Adding rooms to ' + newWalls.join(', ') + ' of room(' + toRoom.x + ', ' + toRoom.y + ')');
                for (var j = 0; j < newWalls.length; j++) {
                    walls.push([[toRoom.x, toRoom.y], newWalls[j]]);
                }
            } else {
                //console.log('Room(' + toRoom.x + ', ' + toRoom.y + ') already in maze');
            }
            walls.splice(walls.indexOf(wall), 1);
        }
        inMaze[inMaze.length - 1].addTag('END');
    },

    getCompatibleRoomLayouts: function(room,roomTypes) {
        var compatibleLayouts = [];
        for ( var key in this.roomLayouts ) {
            if ( roomTypes.indexOf(key)!==-1 ) {
                for ( var i=0; i<this.roomLayouts[key].length; i++ ) {
                    var layout = this.roomLayouts[key][i];
                    var compatible = true;

                    //room has connections where layout required doors
                    for ( var j=0; j<layout.requiredDoors.length; j++ ) {
                        if (!room.hasConnection(layout.requiredDoors[j])) {
                            compatible = false;
                        }
                    }
                    
                    //layout accepts doors where room has connections
                    ['north', 'south', 'east', 'west'].forEach(function(d) {
                        if (room.hasConnection(d) &&
                            layout.requiredDoors.indexOf(d) === -1 &&
                            layout.optionalDoors.indexOf(d) === -1) {
                            compatible = false;
                        }
                    });
                    
                    if (compatible) {
                        compatibleLayouts.push(layout);
                    }
                }
            }
        }
        return compatibleLayouts;
    },

    digRooms: function(levelData) {
        var roomTypes = levelData.roomTypes;
        var startRooms = levelData.startRooms;
        var endRooms = levelData.endRooms;
        
        // TODO clean up
        var roomArray = this.getAllRooms();
        var usedLayouts = [];
        for ( var i=0; i<roomArray.length; i++ ) {
            var room = roomArray[i];
            var layout = {name:'foobar'};
            if (room.hasTag("START")) {
                while (startRooms.indexOf(layout.name)===-1) {
                    layout = RL.Util.randomChoice(this.roomLayouts["start"]);
                }
            } else if (room.hasTag("END")) {
                while (endRooms.indexOf(layout.name)===-1) {
                    layout = RL.Util.randomChoice(this.roomLayouts["end"]);
                }
            } else if (room.hasTag("SHOP")) {
                layout = RL.Util.randomChoice(this.roomLayouts["shop"]); 
            } else {
                var layouts = this.getCompatibleRoomLayouts(room,roomTypes);
                for ( var j=0; j<usedLayouts.length; j++ ) {
                    var usedLayout = usedLayouts[j];
                    if (layouts.indexOf(usedLayout)!==-1 && !usedLayout.reusable) {
                        layouts.splice(layouts.indexOf(usedLayout),1);
                    }
                }
                
                if (layouts.length) {
                    layout = RL.Util.weightedChoice(layouts, function(layout) {
                        return layout.weight;
                    });
                    usedLayouts.push(layout);
                } else {
                    layout = this.defaultLayout;
                }
            }

            //make a copy of mapData so we're not changing future layouts
            var mapData = layout.mapData.slice(0,layout.mapData.length);

            //add walls around room
            for ( var j=0; j<mapData.length; j++ ) {
                mapData[j] = "#" + mapData[j] + "#";
            }
            var wallNS = '';
            for ( var j=0; j<room.width; j++ ) {
                wallNS += "#";
            }
            mapData.unshift(wallNS);
            mapData.push(wallNS);

            //add doors in walls
            if (room.connections.north !== null) {
                mapData[0] = mapData[0].slice(0,room.centerX) + "+" + mapData[0].slice(room.centerX+1,room.width);
            }
            if (room.connections.south !== null) {
                mapData[room.height-1] = mapData[room.height-1].slice(0,room.centerX) + "+" + mapData[room.height-1].slice(room.centerX+1,room.width);
            }
            if (room.connections.east !== null) {
                mapData[room.centerY] = mapData[room.centerY].slice(0,room.width-1) + "+";
            }
            if (room.connections.west !== null) {
                mapData[room.centerY] = "+" + mapData[room.centerY].slice(1,room.width);
            }

            //load the room data
            room.loadTilesFromArrayString(mapData,
                                          layout.charToTileType,
                                          'floor');
        }
    },
    
    loadColors: function(data) {
        // TODO clean up
        for (var key in RL.Tile.Types) {
            if (key!==undefined && key!=="floor" && key!=="wall") {
                if (RL.Tile.Types[key].color===RL.Tile.Types.floor.color) {
                    RL.Tile.Types[key].color = data.floorForeground;
                } else if (RL.Tile.Types[key].color===RL.Tile.Types.floor.bgColor) {
                    RL.Tile.Types[key].color = data.floorBackground;
                } else if (RL.Tile.Types[key].color===RL.Tile.Types.wall.color) {
                    RL.Tile.Types[key].color = data.wallForeground;
                } else if (RL.Tile.Types[key].color===RL.Tile.Types.wall.bgColor) {
                    RL.Tile.Types[key].color = data.wallBackground;
                }
                if (RL.Tile.Types[key].bgColor===RL.Tile.Types.floor.color) {
                    RL.Tile.Types[key].bgColor = data.floorForeground;
                } else if (RL.Tile.Types[key].bgColor===RL.Tile.Types.floor.bgColor) {
                    RL.Tile.Types[key].bgColor = data.floorBackground;
                } else if (RL.Tile.Types[key].bgColor===RL.Tile.Types.wall.color) {
                    RL.Tile.Types[key].bgColor = data.wallForeground;
                } else if (RL.Tile.Types[key].bgColor===RL.Tile.Types.wall.bgColor) {
                    RL.Tile.Types[key].bgColor = data.wallBackground;
                }
            }
        }
        RL.Tile.Types.floor.color           = data.floorForeground;
        RL.Tile.Types.floor.bgColor         = data.floorBackground;
        RL.Tile.Types.wall.color            =  data.wallForeground;
        RL.Tile.Types.wall.bgColor          =  data.wallBackground;
    },

    isolateRooms: function(levelData) {
        this.getAllRooms().forEach(function(room) {
            if (room.countConnections() === 1 &&
                !room.hasTag('END') &&
                !room.hasTag('START') &&
                ROT.RNG.getUniform() < 0.25) {
                room.isolate();
                room.addTag('ISOLATED');
            }
        });
    },

    addShortcuts: function(levelData) {
        var dungeon = this;
        this.getAllRooms().forEach(function(room) {
            if (room.countConnections() == 2) {
                var directions = dungeon.validDirections(room.x, room.y);
                RL.Util.shuffle(directions);
                directions.forEach(function(direction) {
                    //console.log('Trying to create shortcut at room(' + room.x + ', ' + room.y + ') going ' + direction);
                    var otherRoom = dungeon.getRoomToDirection(room, direction);
                    if (!otherRoom.hasTag('END') &&
                        !otherRoom.hasTag('TREASURE') &&
                        !otherRoom.hasTag('ISOLATED') &&
                        !room.hasConnection(direction) &&
                        ROT.RNG.getUniform() < 0.5) {
                        room.connect(otherRoom);
                        room.addTag('SHORTCUT');
                        room.addTag('SHORTCUT_' + direction.toUpperCase());
                        otherRoom.addTag('SHORTCUT');
                        otherRoom.addTag('SHORTCUT_' + RL.Util.oppositeDirection(direction).toUpperCase());
                        return;
                    }
                });
            }
        });
    },
    
    tagTreasureRooms: function(levelData) {
        this.getAllRooms().forEach(function(room) {
            if (room.countConnections() === 1 &&
                !room.hasTag('END') &&
                !room.hasTag('START')) {
                room.addTag('TREASURE');
            }
        });
    },

    tagShop: function(levelData) {
        let treasureRooms = this.getRoomsWithTag('TREASURE');
        let shop = RL.Util.randomChoice(treasureRooms);
        shop.removeTag('TREASURE');
        shop.addTag('SHOP');
    },

    lockRooms: function(levelData) {
        this.getAllRooms().forEach(function(room) {
            if (room.hasTag('END') || room.hasTag('TREASURE')) {
                //console.log('Locking room with tags: ' + room.tags.join(', '));
                ['north', 'south', 'east', 'west'].forEach(function(direction) {
                    if (room.hasConnection(direction)) {
                        //console.log('Locking connection to ' + direction);
                        var otherRoom = room.connections[direction];
                        var fromX, fromY, toX, toY;
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
                        }
                        //console.log('Locking ' + RL.Util.oppositeDirection(direction) + ' room at (' + fromX + ', ' + fromY + ')');
                        //console.log('Locking ' + direction + ' room at (' + toX + ', ' + toY + ')');

                        var type;
                        if (room.hasTag('END')) {
                            type = 'lockedDoor';
                        } else {
                            type = RL.Util.randomChoice(['lockedDoor',
                                                      'lockedDoor',
                                                      'lockedDoor',
                                                      'weakWall']);
                        }
                        room.map.set(fromX, fromY, type);
                        otherRoom.map.set(toX, toY, type);
                    }
                });
            }
        });
    },
    
    blockShortcuts: function(levelData) {
        this.getAllRooms().forEach(function(room) {
            if (room.hasTag('SHORTCUT') &&
                       ROT.RNG.getUniform() < 0.25) {
                var direction, otherRoom, fromX, fromY, toX, toY;
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
    },

    spawnMonsters: function(levelData) {
        //determine which monsters are suitable for level
        var monsters = [];
        for (var monsterID in RL.Entity.Types) {
            if (monsterID!==undefined) {
                if ( levelData.monsterTypes.indexOf(RL.Entity.Types[monsterID].type) !== -1 ) {
                    monsters.push(monsterID);
                }
            }
        }

        this.getAllRooms().forEach(function(room) {
            var numMonsters = ROT.RNG.getUniformInt(levelData.minMonstersPerRoom, levelData.maxMonstersPerRoom);
            if (room.hasTag('START') || room.hasTag("SHOP")) {
                numMonsters = 0;
            } else if (room.hasTag('END') || room.hasTag('TREASURE')) {
                numMonsters *= 2;
            }
            for ( var i=0; i<numMonsters; i++ ) {
                room.spawnMonster(monsters);
            }
        });
    },

    spawnItems: function(levelData) {
        var items = ['heart','gold','threeGold','key','bomb'];
        this.getAllRooms().forEach(function(room) {
            room.spawnItem(items);
            if (room.hasTag('TREASURE')) {
                room.spawnItem(items);
                room.spawnItem(items);
                room.spawnItem(items);
                room.spawnItem(items);
            }
        });
    },

    loadLevelData: function(depth) {
        var newLevelData;
        this.levels[depth] = new RL.Array2d(this.width,this.height);
        this.rooms = this.levels[depth];
        if (this.levelData[depth]===undefined || this.levelData[depth]===[]) {
            console.log('No levels for depth '+depth+'; using default');
            newLevelData = this.defaultLevel;
        } else {
            newLevelData = RL.Util.randomChoice(this.levelData[depth]);
        }
        return newLevelData;
    },
    
    initLevel: function(levelData) {
        this.loadColors(levelData);
        this.rooms.reset(this.width, this.height);
        for ( var x=0; x<this.width; x++ ) {
            for ( var y=0; y<this.height; y++ ) {
                this.rooms.set(x,y, new Room(game,x,y,this.roomWidth,this.roomHeight));
            }
        }
    },
    
    generate: function(depth,startX,startY) {
        var newLevelData = this.loadLevelData(depth);
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
    },

    toAsciiMap: function() {
        var rows = [];
        for (var y = 0; y < this.height; y++) {
            var roomRow = '';
            var connectionRow = '';
            for (var x = 0; x < this.width; x++) {
                var room = this.rooms.get(x, y);

                var roomString = '[ ]';
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
                    roomString = '[' + room.countConnections() + ']';
                    //roomString = '[ ]';
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
};
