console.log('Loading room.js');
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
