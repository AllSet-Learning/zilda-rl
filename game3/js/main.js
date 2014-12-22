//add room list and getRoom
RL.Game.prototype.rooms=[]
RL.Game.prototype.getRoom = function(x,y) {
  for ( var i=0; i<this.rooms.length; i++ ) {
    if ( x>=this.rooms[i].x &&
         x< this.rooms[i].x+this.rooms[i].w &&
         y>=this.rooms[i].y &&
         y< this.rooms[i].y+this.rooms[i].h ) {
      return this.rooms[i];
    };
  };
};

//customize basic game "turn"
RL.Game.prototype.onKeyAction = function(action) {
 if(!this.gameOver){
   var result = this.player.update(action);
   if(result){
     this.entityManager.update(this.player);

     //Don't update map the fov or lighting!
     //this.player.updateFov();
     //this.lighting.update();

     //center in current room instead of on player
     //this.renderer.setCenter(this.player.x, this.player.y);
     var room = this.getRoom(this.player.x, this.player.y);
     this.renderer.setCenter(room.centerX, room.centerY);
     this.renderer.draw();
   } else if(this.queueDraw){
     this.renderer.draw();
   }
 }
 this.queueDraw = false;
};

//make tiles bigger for Hanzi readability
RL.Renderer.prototype.tileSize = 32;
//make tiles explored by default
RL.Tile.prototype.explored = true;

RL.RendererLayer.Types.entity.getTileData = function(x, y, prevTileData) {
  if(!this.game){
    return false;
  }
  var player = this.game.player;
  var entity = false;
  if (
    player &&
    x === player.x &&
    y === player.y
  ) {
    entity = player;
  } else if(this.game.entityManager){
    entity = this.game.entityManager.get(x, y);
  }
  //skip the fov check
  /*
  if(
    this.game.player &&
    this.game.player.fov &&
    !this.game.player.fov.get(x, y)
  ){
    return false;
  }
  */
  if(entity){
    var tileData = entity.getTileDrawData();
    return tileData;
  }
  return false;
};


var game = new RL.Game();

//make map
var dungeonW = 2;
var dungeonH = 2;
var roomW = 13;
var roomH = 7;
makeDungeon(game, dungeonW, dungeonH, roomW, roomH);

//set up the renderer
var rendererWidth  = roomW;
var rendererHeight = roomH;

game.renderer.resize(rendererWidth, rendererHeight);

game.renderer.layers = [
  new RL.RendererLayer(game, 'map', {draw: false, mergeWithPrevLayer: false}),
  new RL.RendererLayer(game, 'entity', {draw: true, mergeWithPrevLayer: true})
]

var keyBindings = {
  up: ['UP_ARROW'],
  down: ['DOWN_ARROW'],
  left: ['LEFT_ARROW'],
  right: ['RIGHT_ARROW']
};
game.input.addBindings(keyBindings);

var playerStartX = Math.floor(roomW/2);
var playerStartY = Math.floor(roomH/2);

game.player.x = playerStartX;
game.player.y = playerStartY;
var startingRoom = game.getRoom(game.player.x, game.player.y)
game.renderer.setCenter(startingRoom.centerX, startingRoom.centerY)

//set up map
var mapContainerEl = document.getElementById('map-container')
var consoleContainerEl = document.getElementById('console-container')

mapContainerEl.appendChild(game.renderer.canvas);
consoleContainerEl.appendChild(game.console.el);

game.start();
