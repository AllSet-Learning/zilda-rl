var game = new RL.Game();

//set up the map
var mapData = [
  '##############',
  '#.....##.....#',
  '#.....##.....#',
  '#.....++.....#',
  '#.....##.....#',
  '#.....##.....#',
  '###+######+###',
  '###+######+###',
  '#.....##.....#',
  '#.....##.....#',
  '#.....++.....#',
  '#.....##.....#',
  '#.....##.....#',
  '##############'
];

var mapCharToType = {
  '#': 'wall',
  '.': 'floor',
  '+': 'door'
};

game.map.loadTilesFromArrayString(mapData, mapCharToType, 'floor');
game.setMapSize(game.map.width, game.map.height);

//set up rooms
var roomW = 7;
var roomH = 7;
game.rooms = []
game.rooms.push( new Room(0,0,roomW,roomH) );
game.rooms.push( new Room(7,0,roomW,roomH) );
game.rooms.push( new Room(0,7,roomW,roomH) );
game.rooms.push( new Room(7,7,roomW,roomH) );

//set up the renderer
var rendererWidth  = roomW;
var rendererHeight = roomH;

game.renderer.resize(rendererWidth, rendererHeight);
game.renderer.setCenter(3,3)

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
