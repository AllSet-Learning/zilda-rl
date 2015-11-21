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
        if (this === this.game.player.room) {
            console.log('Checking if player at connection');
            var player = this.game.player;
            var connectionDirection = this.getConnectionForEntity(player);
            console.log(connectionDirection, this.connections);
            
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
                    player.x = connection.width - 2;
                    break;
                case 'west':
                    player.x = 1;
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

        if (x === 0 &&
            y === this.centerY &&
            this.connections.east !== null) {
            return 'east';
        }

        if (x === this.width - 1 &&
            y === this.centerY &&
            this.connections.west) {
            return 'west';
        }

        return null;
    },
    
    hasTag: function(tag) {
        return ( this.tags.indexOf(tag.toUpperCase()) != -1 );
    },
    
    tag: function(tag) {
        if ( ! this.hasTag(tag) ) {
            this.tags.push(tag.toUpperCase());
        }
    },
    
    untag: function(tag) {
        if ( this.hasTag(tag) ) {
            this.tags.splice(this.tags.indexOf(tag.toUpperCase()),1);
        }
    },
    
    connectionTags: function() { // TODO rewrite or remove
        var connectionTags = [];
        var directions = ['N','S','E','W'];
        for ( var i=0; i<4; i++ ) {
            if ( this.hasTag(directions[i]) ) {
                connectionTags.push(directions[i]);
            }
        }
        return connectionTags;
    },

    countConnections: function() { // TODO rewrite or remove
        return this.connectionTags().length;
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
    
    spawnMonster: function(monsterTypes) {
        var x=0;
        var y=0;
        while ( (x===this.centerX && y===1) ||
                (x===this.centerX && y===this.height-2) ||
                (y===this.centerY && x===1) ||
                (y===this.centerY && x===this.width-2) ||
                this.map.get(x,y).type !== 'floor' ) {
            x = ROT.RNG.getUniformInt(0,this.width-1);
            y = ROT.RNG.getUniformInt(0,this.height-1);
        }
        var monsterType = RL.Util.randomChoice(monsterTypes);
        monster = new RL.Entity(this.game,monsterType);
        this.entityManager.add(x,y,monster);
    }
};

