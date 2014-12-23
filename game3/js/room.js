var Room = function Room(game,x,y,w,h) {
  this.game = game;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.map = new RL.Map(game);
  this.entityManager = new RL.ObjectManager(game, RL.Entity, w, h);

  this.loadTilesFromArrayString = function(mapData, charToType, defaultTileType) {
    this.map.loadTilesFromArrayString(mapData,charToType,defaultTileType);
    for ( var x=0; x<this.w; x++ ) {
      northTile = this.map.get(x,0);
      southTile = this.map.get(x,this.h-1);
      if (northTile.passable) {
        if ( ! (northTile.type+'PassageN' in RL.Tile.Types) ) {
          RL.Tile.Types[northTile.type+'PassageN'] = makePassage(RL.Tile.Types[northTile.type],'n');
        }; 
        this.map.set(x,0,northTile.type+'PassageN');
      };
      if (southTile.passable) {
        if ( ! (southTile.type+'PassageS' in RL.Tile.Types) ) {
          RL.Tile.Types[southTile.type+'PassageS'] = makePassage(RL.Tile.Types[southTile.type],'s');
        };
        this.map.set(x,this.h-1,southTile.type+'PassageS');
      };
    };
    for ( var y=0; y<this.h; y++ ) {
      eastTile = this.map.get(this.w-1,y);
      westTile = this.map.get(0,y);
      if (eastTile.passable) {
        if ( ! (eastTile.type+'PassageE' in RL.Tile.Types) ) {
          RL.Tile.Types[eastTile.type+'PassageE'] = makePassage(RL.Tile.Types[eastTile.type],'e');
        };
        this.map.set(this.w-1,y,eastTile.type+'PassageE');
      };
      if (westTile.passable) {
        if ( ! (westTile.type+'PassageW' in RL.Tile.Types) ) {
          RL.Tile.Types[westTile.type+'PassageW'] = makePassage(RL.Tile.Types[westTile.type],'w');
        };
        this.map.set(0,y,westTile.type+'PassageW');
      };
    };
  };

  this.loadEntitiesFromArrayString = function(mapData, charToType, defaultType, replaceCurrentObjects) {
    this.entityManager.loadFromArrayString(mapData, charToType, defaultType, replaceCurrentObjects);
  };

  this.setSize = function(w,h) {
    this.map.setSize(w,h);
    this.entityManager.setSize(w,h);
  };

  this.setSize();
};
