console.log('Loading dungeon.js');
var Dungeon = function(game, dungeonW, dungeonH, roomW, roomH) {
  this.game = game;
  this.w = dungeonW;
  this.h = dungeonH;
  this.roomW = roomW;
  this.roomH = roomH;
  this.tilesWidth  = dungeonW*roomW;
  this.tilesHeight = dungeonH*roomH;
  this.rooms = new RL.Array2d(dungeonW,dungeonH);
  for ( var x=0; x<dungeonW; x++ ) {
    for ( var y=0; y<dungeonH; y++ ) {
      var room = new Room(game,x,y,roomW,roomH);
      var roomData = ['######NN######',
                      '#............#',
                      '#............#',
                      '#............#',
                      'W............E',
                      '#............#',
                      '#............#',
                      '#............#',
                      '######SS######'];
      var charToTile = {
        '#':'wall',
        'N':'northDoor',
        'S':'southDoor',
        'E':'eastDoor',
        'W':'westDoor'
      };
      room.loadTilesFromArrayString(roomData, charToTile, 'floor');
      this.rooms.set(x,y,room);
    };
  };
};
