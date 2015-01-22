var Dungeon = function(game, dungeonWidth, dungeonHeight, roomWidth, roomHeight) {
    this.game = game;
    this.width = dungeonWidth;
    this.height = dungeonHeight;
    this.roomWidth = roomWidth;
    this.roomHeight = roomHeight;
    this.tilesWidth  = dungeonWidth*roomWidth;
    this.tilesHeight = dungeonHeight*roomHeight;
    this.rooms = new RL.Array2d(dungeonWidth,dungeonHeight);
    this.roomLayouts = {};
    this.defaultLayout = null;
    this.levels = {};
    this.defaultLevel = null;

    this.loadLevels = function(fnames) {
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
                if (this.levels[level.depth]===undefined) {
                    this.levels[level.depth] = [];
                }
                this.levels[level.depth].push(level);
            }
        }
    };

    this.loadLayouts = function(roomTypes) {
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

            //add default values to layouts if not overridden
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
            }
        }
    };

    this.validDirections = function(roomX, roomY) {
        var directions = ['n','s','e','w'];
        if (roomX===0) {
            directions.splice(directions.indexOf('w'),1);
        }
        if (roomX===this.width-1) {
            directions.splice(directions.indexOf('e'),1);
        }
        if (roomY===0) {
            directions.splice(directions.indexOf('n'),1);
        }
        if (roomY===this.height-1) {
            directions.splice(directions.indexOf('s'),1);
        }
        return directions;
    };

    this.getRoomToDirection = function(fromRoom,direction) {
        newRoomX = fromRoom.x;
        newRoomY = fromRoom.y;
        direction = direction.toLowerCase();
        switch (direction) {
        case 'n':
            newRoomY -= 1;
            break;
        case 's':
            newRoomY += 1;
            break;
        case 'e':
            newRoomX += 1;
            break;
        case 'w':
            newRoomX -= 1;
            break;
        }
        return this.rooms.get(newRoomX,newRoomY);
    };

    this.getAllRooms = function() {
        var roomArray = [];
        for ( var x=0; x<this.width; x++ ) {
            for ( var y=0; y<this.height; y++ ) {
                roomArray.push(this.rooms.get(x,y));
            }
        }
        return roomArray;
    };

    this.getRoomsWithTag = function(tag) {
        var roomsWithTag = [];
        var roomArray = this.getAllRooms();
        for ( var i=0; i<roomArray.length; i++ ) {
            var room = roomArray[i];
            if (room.hasTag(tag)) {
                roomsWithTag.push(room);
            }
        }
        return roomsWithTag;
    };

    this.tagDeadEnds = function() {
        var roomArray = this.getAllRooms();
        for ( var i=0; i<roomArray.length; i++ ) {
            var room = roomArray[i];
            var connections = room.countConnections();
            if ( !room.hasTag('START') ) {
                if (connections===1) {
                    room.untag('ISOLATED');
                    room.tag('DEADEND');
                } else if (connections===0) {
                    room.untag('DEADEND');
                    room.tag('ISOLATED');
                } else {
                    room.untag('DEADEND');
                    room.untag('ISOLATED');
                }
            }
        }
    };

    this.roomsAreAdjacent = function(room1,room2) {
        return (Math.abs(room1.x-room2.x)+Math.abs(room1.y-room2.y)===1);
    };

    this.roomsAreConnected = function(room1,room2) {
        if (this.roomsAreAdjacent(room1,room2)) {
            if ( (room1.x > room2.x && room1.hasTag('W') && room2.hasTag('E')) ||
                 (room1.x < room2.x && room1.hasTag('E') && room2.hasTag('W')) ||
                 (room1.y > room2.y && room1.hasTag('N') && room2.hasTag('S')) ||
                 (room1.y < room2.y && room1.hasTag('S') && room2.hasTag('N')) ) {
                return true;
            } else { return false; }
        } else { return false; }
    };

    this.connectRooms = function(room1,room2) {
        if (this.roomsAreAdjacent(room1,room2)) {
            if (room1.x > room2.x) {
                room1.tag('W');
                room2.tag('E');
            } else if (room1.x < room2.x) {
                room1.tag('E');
                room2.tag('W');
            } else if (room1.y > room2.y) {
                room1.tag('N');
                room2.tag('S');
            } else if (room1.y < room2.y) {
                room1.tag('S');
                room2.tag('N');
            }
        }
    };

    this.disconnectRooms = function(room1,room2) {
        if (this.roomsAreConnected(room1,room2)) {
            if (room1.x > room2.x) {
                room1.untag('W');
                room2.untag('E');
            } else if (room1.x < room2.x) {
                room1.untag('E');
                room2.untag('W');
            } else if (room1.y > room2.y) {
                room1.untag('N');
                room2.untag('S');
            } else if (room1.y < room2.y) {
                room1.untag('S');
                room2.untag('N');
            }
        }
    };

    this.makeMaze = function(startX,startY) {
        this.rooms.get(startX,startY).tag('START');
        var inMaze = [ this.rooms.get(startX,startY) ];
        var walls = [];
        var directions = this.validDirections(startX,startY);
        for ( var i=0; i<directions.length; i++ ) {
            walls.push( [[startX,startY],directions[i]] );
        }

        while (walls.length) {
            var wall = RL.Util.randomChoice(walls);
            var room = this.rooms.get(wall[0][0],wall[0][1]);
            var toRoom = this.getRoomToDirection(room,wall[1]);
            if ( inMaze.indexOf(toRoom) === -1 ) {
                this.connectRooms(room,toRoom);
                inMaze.push(toRoom);
                var newWalls = this.validDirections(toRoom.x,toRoom.y);
                for ( var i=0; i<newWalls.length; i++ ) {
                    walls.push( [[toRoom.x,toRoom.y],newWalls[i]] );
                }
            }
            walls.splice(walls.indexOf(wall),1);
        }
    };

    this.isolateRoom = function(room) {
        var directions = this.validDirections(room.x,room.y);
        for ( var i=0; i<directions.length; i++ ) {
            var d = directions[i];
            if (room.hasTag(d)) {
                room.untag(d);
                this.getRoomToDirection(room,d).untag(RL.Util.oppositeDirection(d));
            }
        }
        room.tags=[];
        room.tag('ISOLATED');
    };

    this.attemptNewConnection = function(room) {
        var validDirections = this.validDirections(room.x,room.y);
        var madeNewConnection = false;
        while ( (!madeNewConnection) && (validDirections.length) ) {
            var direction = RL.Util.randomChoice(validDirections);
            validDirections.splice(validDirections.indexOf(direction),1);
            if (!room.hasTag(direction)) {
                var toRoom = this.getRoomToDirection(room,direction);
                if ( !toRoom.hasTag('ISOLATED') ) {
                    this.connectRooms(room,toRoom);
                }
            }
        }
    };

    this.getCompatibleRoomLayouts = function(room,roomTypes) {
        var compatibleLayouts = [];
        for ( var key in this.roomLayouts ) {
            if ( roomTypes.indexOf(key)!==-1 ) {
                for ( var i=0; i<this.roomLayouts[key].length; i++ ) {
                    var layout = this.roomLayouts[key][i];
                    var compatible = true;
                    //room has connections where layout required doors
                    for ( var j=0; j<layout.requiredDoors.length; j++ ) {
                        if ( ! room.hasTag(layout.requiredDoors[j]) ) {
                            compatible = false;
                        }
                    }
                    //layout accepts doors where room has connections
                    var connectionTags = room.connectionTags();
                    for ( var j=0; j<connectionTags.length; j++ ) {
                        if ( layout.requiredDoors.indexOf(connectionTags[j].toUpperCase()) === -1 &&
                             layout.requiredDoors.indexOf(connectionTags[j].toLowerCase()) === -1 &&
                             layout.optionalDoors.indexOf(connectionTags[j].toUpperCase()) === -1 &&
                             layout.optionalDoors.indexOf(connectionTags[j].toLowerCase()) === -1 ) {
                            compatible = false;
                        }
                    }
                    if (compatible) {
                        compatibleLayouts.push(layout);
                    }
                }
            }
        }
        return compatibleLayouts;
    };

    this.digRooms = function(roomTypes) {
        var roomArray = this.getAllRooms();
        var usedLayouts = [];
        for ( var i=0; i<roomArray.length; i++ ) {
            var room = roomArray[i];
            var layouts = this.getCompatibleRoomLayouts(room,roomTypes);
            for ( var j=0; j<usedLayouts.length; j++ ) {
                var usedLayout = usedLayouts[j];
                if (layouts.indexOf(usedLayout)!==-1 && !usedLayout.reusable) {
                    layouts.splice(layouts.indexOf(usedLayout),1);
                }
            }

            if (layouts.length) {
                var layout = RL.Util.weightedChoice( layouts, function(layout) { return layout.weight; } );
                usedLayouts.push(layout);
            } else {
                var layout = this.defaultLayout;
            }

            //make a copy of mapData, so we're changing future layouts
            var mapData = layout.mapData.slice(0,layout.mapData.length)

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
            if ( room.hasTag('N') ) {
                mapData[0] = mapData[0].slice(0,room.centerX) + "+" + mapData[0].slice(room.centerX+1,room.width);
            }
            if ( room.hasTag('S') ) {
                mapData[room.height-1] = mapData[room.height-1].slice(0,room.centerX) + "+" + mapData[room.height-1].slice(room.centerX+1,room.width);
            }
            if ( room.hasTag('E') ) {
                mapData[room.centerY] = mapData[room.centerY].slice(0,room.width-1) + "+";
            }
            if ( room.hasTag('W') ) {
                mapData[room.centerY] = "+" + mapData[room.centerY].slice(1,room.width);
            }

            //load the room data
            room.loadTilesFromArrayString(mapData,layout.charToTileType,'floor');
        }
    };

    this.generate = function(depth,startX,startY) {
        var level; //LOAD LEVEL!!!
        if (this.levels[depth]===undefined || this.levels[depth]===[]) {
            console.log('No levels for depth '+depth+'; using default');
            level = this.defaultLevel;
        } else {
            level = RL.Util.randomChoice(this.levels[depth]);
        }

        RL.Tile.Types.floor.color           = level.floorForeground;
        RL.Tile.Types.floor.bgColor         = level.floorBackground;
        RL.Tile.Types.wall.color            =  level.wallForeground;
        RL.Tile.Types.wall.bgColor          =  level.wallBackground;
        RL.Tile.Types.weakWall.color        =  level.wallForeground;
        RL.Tile.Types.weakWall.bgColor      =  level.wallBackground;
        RL.Tile.Types.door.color            = level.floorBackground;
        RL.Tile.Types.door.bgColor          =  level.wallBackground;
        RL.Tile.Types.lockedDoor.bgColor    =  level.wallBackground;
        RL.Tile.Types.bombThree.bgColor     = level.floorBackground;
        RL.Tile.Types.bombTwo.bgColor       = level.floorBackground;
        RL.Tile.Types.bombOne.bgColor       = level.floorBackground;
        RL.Tile.Types.bombExploding.bgColor = level.floorBackground;
        RL.Tile.Types.embers.bgColor        = level.floorBackground;
        RL.Tile.Types.brazier.bgColor       = level.floorBackground;
        RL.Tile.Types.puddle.bgColor        = level.floorBackground;
        RL.Tile.Types.acidPuddle.bgColor    = level.floorBackground;
        RL.Tile.Types.tombstone.color       =  level.wallForeground;
        RL.Tile.Types.tombstone.bgColor     = level.floorBackground;
        RL.Tile.Types.pillar.color          =  level.wallBackground;
        RL.Tile.Types.pillar.bgColor        = level.floorBackground;

        this.rooms.reset(this.width, this.height);
        for ( var x=0; x<this.width; x++ ) {
            for ( var y=0; y<this.height; y++ ) {
                this.rooms.set(x,y, new Room(game,x,y,this.roomWidth,this.roomHeight));
            }
        }
        this.makeMaze(startX,startY);
        //handle dead ends
        this.tagDeadEnds();
        var deadEnds = this.getRoomsWithTag('DEADEND');
        RL.Util.shuffle(deadEnds);
        for ( var i=0; i<deadEnds.length; i++ ) {
            if (deadEnds[i].hasTag('START')) {
                console.log('WARNING: start tagged as dead end');
            }
        }
        //delete some dead ends
        for ( var i=0; i<deadEnds.length/2; i++ ) {
            var room = deadEnds[i];
            this.isolateRoom(room);
        }
        this.tagDeadEnds();
        deadEnds = this.getRoomsWithTag('DEADEND');
        RL.Util.shuffle(deadEnds);
        //connect remaining dead ends
        for ( var i=0; i<deadEnds.length/2; i++ ) {
            var room = deadEnds[i];
            this.attemptNewConnection(room);
        }
        this.tagDeadEnds();
        this.digRooms(level.roomTypes);

        //determine which monsters are suitable for level
        var monsters = [];
        for (var monsterID in RL.Entity.Types) {
            if (monsterID!==undefined) {
                if ( level.monsterTypes.indexOf(RL.Entity.Types[monsterID].type) !== -1 ) {
                    monsters.push(monsterID);
                }
            }
        }

        //spawn items and monsters
        var rooms = this.getAllRooms();
        for ( var i=0; i<rooms.length; i++ ) {
            rooms[i].spawnItem(['heart','gold','threeGold','key','bomb']);
            var numMonsters = Math.floor(Math.random()*(level.maxMonstersPerRoom-level.minMonstersPerRoom))+level.minMonstersPerRoom+1;
            for ( var j=0; j<numMonsters; j++ ) {
                rooms[i].spawnMonster(monsters);
            }
        }

        //lock dead ends
        deadEnds = this.getRoomsWithTag('DEADEND');
        for ( var i=0; i<deadEnds.length; i++ ) {
            var room = this.getRoomToDirection(deadEnds[i],deadEnds[i].connectionTags()[0]);
            var d = RL.Util.oppositeDirection(deadEnds[i].connectionTags()[0]);
            var x=0;
            var y=0;
            switch (d) {
            case 'N':
                x=room.centerX;
                break;
            case 'S':
                y=room.height-1;
                x=room.centerX;
                break;
            case 'E':
                x=room.width-1;
                y=room.centerY;
                break;
            case 'W':
                y=room.centerY;
                break;
            }
            room.map.get(x,y).changeType('lockedDoor');
            console.log('Locked '+d+' door in room at ('+room.x+','+room.y+')');
        }
    };
};
