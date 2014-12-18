var game = new RL.Game();

//set up the map
var mapData = [
  '#######',
  '#.....#',
  '#.....#',
  '#.....#',
  '#.....#',
  '#.....#',
  '#######'
];

var mapCharToType = {
  '#': 'wall',
  '.': 'floor'
};

game.map.loadTilesFromArrayString(mapData, mapCharToType, 'floor');
game.setMapSize(game.map.width, game.map.height);

//set up the renderer
var rendererWidth  = mapData[0].length;
var rendererHeight = mapData.length;

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

var playerStartX = 3;
var playerStartY = 3;

game.player.x = playerStartX;
game.player.y = playerStartY;

//set up map
var mapContainerEl = document.getElementById('map-container')
var consoleContainerEl = document.getElementById('console-container')

mapContainerEl.appendChild(game.renderer.canvas);
consoleContainerEl.appendChild(game.console.el);

game.start();
