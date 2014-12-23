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
      var roomData = ['######++######',
                      '#............#',
                      '#............#',
                      '#............#',
                      '+............+',
                      '#............#',
                      '#............#',
                      '#............#',
                      '######++######'];
      var charToTile = {
        '.':'floor',
        '#':'wall',
        '+':'door'
      };
      room.loadTilesFromArrayString(roomData, charToTile, 'floor');
      this.rooms.set(x,y,room);
    };
  };
};
