var Room = function Room(game,x,y,width,height) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.centerX = Math.floor(width/2);
    this.centerY = Math.floor(height/2);
    this.map = new RL.Map(game);
    this.entityManager = new RL.ObjectManager(game, RL.Entity, width, height);
    this.itemManager = new RL.ObjectManager(game, RL.Item, width, height);
    this.tags = [];
    this.connections = {
        north: null,
        south: null,
        east: null,
        west: null
    };
};

Room.prototype = {
    constructor: Room,
    game: null,
    x: null,
    y: null,
    width: null,
    height: null,
    centerX: null,
    centerY: null,
    explored: false,
    tags: null,
    map: null,
    entityManager: null,
    itemManager: null,

    update: function(exclude) {
        this.entityManager.update(exclude);
        this.itemManager.update(exclude);
        
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var tile = this.map.get(x, y);
                if (tile.skip) {
                    tile.skip = false;
                } else if (tile.update) {
                    tile.update();
                }
            }
        }

        // change connection terrains to match
        var oldType, newType; // for debugging
        if (this.hasConnection('north')) {
            var north = this.connections.north;
            oldType = north.map.get(north.centerX, north.height - 1).type;
            newType = this.map.get(this.centerX, 0).type;
            if (oldType !== newType) {
                north.map.set(north.centerX, north.height - 1, newType);
                console.log('Changed north connection from ' + oldType + ' to ' + newType);
            }
        }
        if (this.hasConnection('south')) {
            var south = this.connections.south;
            oldType = south.map.get(south.centerX, 0).type;
            newType = this.map.get(this.centerX, this.height - 1).type;
            if (oldType !== newType) {
                south.map.set(south.centerX, 0, newType);
                console.log('Changed south connection from ' + oldType + ' to ' + newType);
            }
        }
        if (this.hasConnection('east')) {
            var east = this.connections.east;
            oldType = east.map.get(0, east.centerY).type;
            newType = this.map.get(this.width - 1, this.centerY).type;
            if (oldType !== newType) {
                east.map.set(0, east.centerY, newType);
                console.log('Changed east connection from ' + oldType + ' to ' + newType);
            }

        }
        if (this.hasConnection('west')) {
            var west = this.connections.west;
            oldType = west.map.get(west.width - 1, west.centerY).type;
            newType = this.map.get(0, this.centerY).type;
            if (oldType !== newType) {
                west.map.set(west.width - 1, west.centerY, newType);
                console.log('Changed west connection from ' + oldType + ' to ' + newType);
            }
        }

        // special case to handle bombs
        this.getConnectedRooms().forEach(function(room) {
            for (x = 0; x < room.width; x++) {
                for (y = 0; y < room.height; y++) {
                    var tile = room.map.get(x, y);
                    if (tile.type === 'bombThree') {
                        tile.changeType('bombTwo');
                    } else if (tile.type === 'bombTwo') {
                        tile.changeType('bombOne');
                    } else if (tile.type === 'bombOne') {
                        tile.changeType('bombExploding');
                    } else if (tile.type === 'bombExploding') {
                        room.game.console.log('You hear a distant explosion');
                        for (var x2 = x - 1; x2 < x + 2; x2++) {
                            for (var y2 = y - 1; y2 < y + 2; y2++) {
                                if (room.map.get(x2, y2).bombable) {
                                    room.map.set(x2, y2, 'embers');
                                }
                            }
                        }
                    }
                }
            }
        });

        if (this === this.game.player.room) {
            // move player to next room if needed
            var player = this.game.player;
            var connectionDirection = this.getConnectionForEntity(player);
            
            if (connectionDirection !== null) {
                this.entityManager.remove(player);
                var connection = this.connections[connectionDirection];
                switch (connectionDirection) {
                case 'north':
                    player.y = connection.height - 2;
                    break;
                case 'south':
                    player.y = 1;
                    break;
                case 'east':
                    player.x = 1;
                    break;
                case 'west':
                    player.x = connection.width - 2;
                    break;
                }
                connection.entityManager.add(player.x, player.y, player);
                this.game.movePlayerRoom(this, connection);
            }
        }
    },

    /**
     * Checks if an entity is at a connection location, and returns the direction
     * @method getConnectionForEntity
     * @param {Player|Entity} entity - The entity to check
     * @return {String|null} string of direction of connection (eg 'north') or null if not at connection
     */
    getConnectionForEntity: function(entity) {
        var x = entity.x;
        var y = entity.y;

        if (x === this.centerX &&
            y === 0 &&
            this.connections.north !== null) {
            return 'north';
        }

        if (x === this.centerX &&
            y === this.height - 1 &&
            this.connections.south !== null) {
            return 'south';
        }

        if (x === this.width - 1 &&
            y === this.centerY &&
            this.connections.east) {
            return 'east';
        }

        if (x === 0 &&
            y === this.centerY &&
            this.connections.west !== null) {
            return 'west';
        }

        return null;
    },

    /**
     * Gets all the rooms the 
     * @method getConnectedRooms
     * @returns {Array} - Array of room objects
     */
    getConnectedRooms: function() {
        var results = [];
        
        if (this.connections.north !== null) {
            results.push(this.connections.north);
        }
        
        if (this.connections.south !== null) {
            results.push(this.connections.south);
        }
        
        if (this.connections.east !== null) {
            results.push(this.connections.east);
        }
        
        if (this.connections.west !== null) {
            results.push(this.connections.west);
        }
        
        return results;
    },

    /**
     * Checks if the room has a connections in a certain direction
     * @method hasConnection
     * @param {String} direction - one of the four cardinal directions, can be written in the following forms: 'n', 'N', 'north', 'North', 'NORTH'
     * @returns {Bool}
     */
    hasConnection: function(direction) {
        switch(direction) {
        case 'n': // fall through
        case 'N': // fall through
        case 'north': // fall through
        case 'North': // fall through
        case 'NORTH':
            return this.connections.north !== null;
            break;
        case 's': // fall through
        case 'S': // fall through
        case 'south': // fall through
        case 'South': // fall through
        case 'SOUTH': // fall through
            return this.connections.south !== null;
            break;
        case 'e': // fall through
        case 'E': // fall through
        case 'east': // fall through
        case 'East': // fall through
        case 'EAST': // fall through
            return this.connections.east !== null;
            break;
        case 'w': // fall through
        case 'W': // fall through
        case 'west': // fall through
        case 'West': // fall through
        case 'WEST': // fall through
            return this.connections.west !== null;
            break;
        default:
            return false;
        }
    },
    
    countConnections: function() {
        var count = 0;
        if (this.connections.north !== null) {
            count++;
        }
        if (this.connections.south !== null) {
            count++;
        }
        if (this.connections.east !== null) {
            count++;
        }
        if (this.connections.west !== null) {
            count++;
        }
        return count;
    },

    isAdjacentTo: function(room) {
        return Math.abs(this.x - room.x) + Math.abs(this.y - room.y) === 1;
    },

    connect: function(room, direction) {
        if (direction === undefined) {
            if (this.x > room.x) {
                direction = 'west';
            } else if (this.x < room.x) {
                direction = 'east';
            } else if (this.y > room.y) {
                direction = 'north';
            } else if (this.y < room.y) {
                direction = 'south';
            }
        }
        this.connections[direction] = room;
        room.connections[RL.Util.oppositeDirection(direction)] = this;
    },

    disconnect: function(direction) {
        var opposite = RL.Util.oppositeDirection(direction);
        this.connections[direction].connections[opposite] = null;
        this.connections[direction] = null;
    },

    isolate: function() {
        var room = this;
        ['north', 'south', 'east', 'west'].forEach(function(direction) {
            if (room.hasConnection(direction)) {
                room.disconnect(direction);
            }
        });
    },

    isConnected: function(room) {
        return (this.getConnectedRooms().indexOf(room) !== -1 &&
                room.getConnectedRooms().indexOf(this) !== -1);
    },

    hasTag: function(tag) {
        return ( this.tags.indexOf(tag.toUpperCase()) != -1 );
    },
    
    addTag: function(tag) {
        if ( ! this.hasTag(tag) ) {
            this.tags.push(tag.toUpperCase());
        }
    },
    
    removeTag: function(tag) {
        if ( this.hasTag(tag) ) {
            this.tags.splice(this.tags.indexOf(tag.toUpperCase()),1);
        }
    },
    
    spawnItem: function(itemTypes) {
        var x=0;//this.centerX;
        var y=0;//this.centerY;
        while ( (x===this.centerX && y===1) ||
                (x===this.centerX && y===this.height-2) ||
                (y===this.centerY && x===1) ||
                (y===this.centerY && x===this.width-2) ||
                this.map.get(x,y).type !== 'floor' ) {
            x = ROT.RNG.getUniformInt(0,this.width-1);
            y = ROT.RNG.getUniformInt(0,this.height-1);
        }
        var itemType = RL.Util.randomChoice(itemTypes);
        var item = new RL.Item(this.game,itemType,x,y);
        this.itemManager.add(x,y,item);
    },
    
    spawnMonster: function(monsterTypes, respawn) {
        var x=0;
        var y=0;
        // spawn only on floors and away from doors
        while ( this.map.get(x, y).type !== 'floor' ||
                (x === this.centerX && y === 1) ||
                (x === this.centerX && y === 2) ||
                (x === this.centerX + 1 && y === 1) ||
                (x === this.centerX - 1 && y === 1) ||
                (x === this.centerX && y === this.height - 2) ||
                (x === this.centerX && y === this.height - 3) ||
                (x === this.centerX + 1 && y === this.height - 2) ||
                (x === this.centerX - 1 && y === this.height - 2) ||
                (y === this.centerY && x === 1) ||
                (y === this.centerY && x === 2) ||
                (y === this.centerY + 1 && x === 1) ||
                (y === this.centerY - 1 && x === 1) ||
                (y === this.centerY && x === this.width - 2) ||
                (y === this.centerY && x === this.width - 3) ||
                (y === this.centerY + 1 && x === this.width - 2) ||
                (y === this.centerY - 1 && x === this.width - 2) ) {
            x = ROT.RNG.getUniformInt(0,this.width-1);
            y = ROT.RNG.getUniformInt(0,this.height-1);
        }
        var monsterType = RL.Util.randomChoice(monsterTypes);
        monster = new RL.Entity(this.game,monsterType);
        if (respawn) {
            monster.drops = { nothing: 100 };
        }
        this.entityManager.add(x,y,monster);
    },
    
    loadTilesFromArrayString: function(mapData, charToType, defaultTileType) {
        // TODO rewrite or remove (esp. passage code)
        this.map.loadTilesFromArrayString(mapData,charToType,defaultTileType);
    },
    
    loadEntitiesFromArrayString: function(mapData, charToType, defaultType, replaceCurrentObjects) {
        this.entityManager.loadFromArrayString(mapData, charToType, defaultType, replaceCurrentObjects);
    },

    setSize: function(w,h) {
        this.map.setSize(w,h);
        this.entityManager.setSize(w,h);
        this.itemManager.setSizE(w,h);
    }

};

