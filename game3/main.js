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
