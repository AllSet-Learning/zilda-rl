var passageBump = function(entity,direction) {
  game = entity.game;
  if ( entity === game.player ) {
    var currentRoom = entity.room;
    if (direction==='n' && currentRoom.y > 0 ||
        direction==='s' && currentRoom.y < game.dungeon.h-1 ||
        direction==='e' && currentRoom.x < game.dungeon.w-1 ||
        direction==='w' && currentRoom.x > 0) {
      var newRoom = null
      currentRoom.entityManager.remove(entity);
      switch (direction) {
        case 'n':
          newRoom = game.dungeon.rooms.get(currentRoom.x,currentRoom.y-1)
          entity.y = newRoom.h-2;
          break;
        case 's':
          newRoom = game.dungeon.rooms.get(currentRoom.x,currentRoom.y+1)
          entity.y = 1;
          break;
        case 'e':
          newRoom = game.dungeon.rooms.get(currentRoom.x+1,currentRoom.y)
          entity.x = 1;
          break;
        case 'w':
          newRoom = game.dungeon.rooms.get(currentRoom.x-1,currentRoom.y)
          entity.x = newRoom.w-2;
          break;
      };
      newRoom.entityManager.add(entity.x,entity.y,entity);
      entity.room = newRoom;
      game.map = newRoom.map;
      game.entityManager = newRoom.entityManager;
      game.minimap.get(currentRoom.x,currentRoom.y).color = "blue";
      game.minimap.get(newRoom.x,newRoom.y).color = "yellow";
      game.renderer.draw();
      game.minimapRenderer.draw();
      console.log('Moved ' + direction + ' from ('+currentRoom.x+','+currentRoom.y + ') to (' + newRoom.x+','+newRoom.y+')');
    };
  };
};

var northBump = function(entity) {
  passageBump(entity,'n');
};
var southBump = function(entity) {
  passageBump(entity,'s');
};
var eastBump = function(entity) {
  passageBump(entity,'e');
};
var westBump = function(entity) {
  passageBump(entity,'w');
};

var makePassage = function(baseType,direction) {
  var newType = {};
  for (var key in baseType) {
    newType[key] = baseType[key];
  };
  newType.passable = false;
  if (direction==='n') {
    bump = northBump;
  } else if (direction==='s') {
    bump = southBump;
  } else if (direction==='e') {
    bump = eastBump;
  } else if (direction==='w') {
    bump = westBump;
  } else {
    console.log('Direction must be "n", "s", "e", or "w"');
  };
  newType.bump = bump;
  return newType;
};

RL.Tile.Types.floor = {
  name: 'Floor',
  char: '.',
  color: '#fff',
  bgColor: '#000',
  passable: true
};
RL.Tile.Types.wall = {
  name: 'Wall',
  char: '#',
  color: '#fff',
  bgColor: '#000',
  passable: false
};
RL.Tile.Types.door = {
  name: 'Door',
  char: '+',
  color: '#fff',
  bgColor: '#000',
  passable: true
};
RL.Tile.Types.minimapRoom = {
  name: 'Room',
  char: '■',
  color: '#000',
  bgColor: '#000',
}
