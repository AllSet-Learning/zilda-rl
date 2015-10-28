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
    
    hasTag: function(tag) {
        return ( this.tags.indexOf(tag.toUpperCase()) != -1 );
    },
    
    tag: function(tag) {
        if ( ! this.hasTag(tag) ) {
            this.tags.push(tag.toUpperCase())
        }
    },
    
    untag: function(tag) {
        if ( this.hasTag(tag) ) {
            this.tags.splice(this.tags.indexOf(tag.toUpperCase()),1);
        }
    },
    
    connectionTags: function() {
        var connectionTags = [];
        var directions = ['N','S','E','W'];
        for ( var i=0; i<4; i++ ) {
            if ( this.hasTag(directions[i]) ) {
                connectionTags.push(directions[i]);
            }
        }
        return connectionTags;
    },

    countConnections: function() {
        return this.connectionTags().length;
    },
    
    loadTilesFromArrayString: function(mapData, charToType, defaultTileType) {
        this.map.loadTilesFromArrayString(mapData,charToType,defaultTileType);
        for ( var x=0; x<this.width; x++ ) {
            northTile = this.map.get(x,0);
            southTile = this.map.get(x,this.height-1);
            if (northTile.passable) {
                if ( ! (northTile.type+'PassageN' in RL.Tile.Types) ) {
                    RL.Tile.Types[northTile.type+'PassageN'] = makePassage(RL.Tile.Types[northTile.type],'n');
                } 
                this.map.set(x,0,northTile.type+'PassageN');
            }
            if (southTile.passable) {
                if ( ! (southTile.type+'PassageS' in RL.Tile.Types) ) {
                    RL.Tile.Types[southTile.type+'PassageS'] = makePassage(RL.Tile.Types[southTile.type],'s');
                }
                this.map.set(x,this.height-1,southTile.type+'PassageS');
            }
        }
        for ( var y=0; y<this.height; y++ ) {
            eastTile = this.map.get(this.width-1,y);
            westTile = this.map.get(0,y);
            if (eastTile.passable) {
                if ( ! (eastTile.type+'PassageE' in RL.Tile.Types) ) {
                    RL.Tile.Types[eastTile.type+'PassageE'] = makePassage(RL.Tile.Types[eastTile.type],'e');
                }
                this.map.set(this.width-1,y,eastTile.type+'PassageE');
            }
            if (westTile.passable) {
                if ( ! (westTile.type+'PassageW' in RL.Tile.Types) ) {
                    RL.Tile.Types[westTile.type+'PassageW'] = makePassage(RL.Tile.Types[westTile.type],'w');
                }
                this.map.set(0,y,westTile.type+'PassageW');
            }
        }
    },
    
    loadEntitiesFromArrayString: function(mapData, charToType, defaultType, replaceCurrentObjects) {
        this.entityManager.loadFromArrayString(mapData, charToType, defaultType, replaceCurrentObjects);
    },

    setSize: function(w,h) {
        this.map.setSize(w,h);
        this.entityManager.setSize(w,h);
        this.itemManager.setSizE(w,h)
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

