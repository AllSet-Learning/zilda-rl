var passageBump = function(entity,direction) {
    game = entity.game;
    if ( entity === game.player ) {
        var currentRoom = entity.room;
        if (direction==='n' && currentRoom.y > 0 ||
            direction==='s' && currentRoom.y < game.dungeon.height-1 ||
            direction==='e' && currentRoom.x < game.dungeon.width-1 ||
            direction==='w' && currentRoom.x > 0) {
            var newRoom = null
            currentRoom.entityManager.remove(entity);
            switch (direction) {
            case 'n':
                newRoom = game.dungeon.rooms.get(currentRoom.x,currentRoom.y-1)
                entity.y = newRoom.height-2;
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
                entity.x = newRoom.width-2;
                break;
            };
            game.movePlayerRoom(currentRoom,newRoom);
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
    color: '#444',
    bgColor: '#222',
    passable: true
};
RL.Tile.Types.wall = {
    name: 'Wall',
    char: '#',
    color: '#777',
    bgColor: '#2e2e2e',
    passable: false
};
RL.Tile.Types.door = {
    name: 'Door',
    char: '+',
    color: 'yellow',
    bgColor: '#222',
    passable: true
};
RL.Tile.Types.fire = {
    name: 'Fire',
    char: '火',
    color: 'red',
    bgColor: '#522',
    passable: true,
    onEntityEnter: function(entity) {
        entity.takeDamage(1);
    }
};
RL.Tile.Types.hud = {
    name: 'HUD',
    char: '■',
    color: '#000',
    bgColor: '#000',
}
