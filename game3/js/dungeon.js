var makeDungeon = function(game, dungeonW, dungeonH, roomW, roomH) {
  var row = [];
  for ( var i=0; i<(dungeonW*roomW); i++ ) { row.push('#'); };
  var mapData = [];
  for ( var i=0; i<(dungeonH*roomH); i++ ) { mapData.push(row.slice(0,row.length)); };

  //create rooms
  for ( var roomX=0; roomX<(dungeonW*roomW); roomX+=roomW ) {
    for ( var roomY=0; roomY<(dungeonH*roomH); roomY+=roomH ) {
      game.rooms.push( new Room(roomX,roomY,roomW,roomH) );
    };
  };

  for ( var i=0; i<game.rooms.length; i++ ) {
    //dig room
    var room = game.rooms[i];
    for ( var x=(room.x+1); x<room.maxX; x++ ) {
      for ( var y=(room.y+1); y<room.maxY; y++ ) {
        mapData[y][x] = '.';
      };
    };
    //add doors
    var doors = [];
    if ( room.x>0 ) {
      doors.push( [room.x, room.centerY] );
    };
    if ( room.maxX<(roomW*dungeonW-1) ) {
      doors.push( [room.maxX, room.centerY] );
    };
    if ( room.y>0 ) {
      doors.push( [room.centerX, room.y] );
    };
    if ( room.maxY<(roomH*dungeonH-1) ) {
      doors.push( [room.centerX, room.maxY] );
    };
    for ( var j=0; j<doors.length; j++ ) {
      mapData[doors[j][1]][doors[j][0]] = '+';
    };
  };

  //convert 2d array to array of strings
  for ( var i=0; i<mapData.length; i++ ) {
    mapData[i] = mapData[i].join('');
  };

  var mapCharToType = {
    '#': 'wall',
    '.': 'floor',
    '+': 'door'
  };

  game.map.loadTilesFromArrayString(mapData, mapCharToType, 'floor');
  game.setMapSize(game.map.width, game.map.height);
};
