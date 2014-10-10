// create the game instance
var game = new RL.Game();

var mapData = [
    "#####################",
    "#.........#.........#",
    "#....Z.S..#....##...#",
    "#.........+....##...#",
    "#.........#.........#",
    "#.#..#..#.#.........#",
    "#.........#...####+##",
    "#.........#...#.....#",
    "#.........#...#.....#",
    "#.........#...#.....#",
    "#####################"
];

var mapCharToType = {
    '#': 'wall',
    '.': 'floor',
    '+': 'door'
};

var entityCharToType = {
    'Z': 'zombie',
    'S': 'statue'
};

var keyBindings = {
    up: ['UP_ARROW', 'K', 'W'],
    down: ['DOWN_ARROW', 'J', 'S'],
    left: ['LEFT_ARROW', 'H', 'A'],
    right: ['RIGHT_ARROW', 'L', 'D'],
};

game.map.loadTilesFromArrayString(mapData, mapCharToType, 'floor');
game.entityManager.loadEntitiesFromArrayString(mapData, entityCharToType);

// add some lights
game.lighting.set(3, 7, 255, 0, 0);
game.lighting.set(7, 7, 0, 0, 255);

// generate and assign a map object (repaces empty default)
game.setMapSize(game.map.width, game.map.height);

// add input keybindings
game.input.addBindings(keyBindings);

// create entities and add to game.entityManager
var entZombie = new RL.Entity(game, 'zombie');
game.entityManager.add(2, 8, entZombie);

// or just add by entity type
game.entityManager.add(5, 9, 'zombie');

// set player starting position
game.player.x = 3;
game.player.y = 3;

game.lighting.set(3, 14, 255, 0, 0);
game.lighting.set(7, 14, 0, 0, 255);

// make the view a little smaller
game.renderer.resize(10, 14);

// get existing DOM elements
var mapContainerEl = document.getElementById('example-map-container');
var consoleContainerEl = document.getElementById('example-console-container');

// empty existing elements
mapContainerEl.innerHTML = '';
consoleContainerEl.innerHTML = '';

// append elements created by the game to the DOM
mapContainerEl.appendChild(game.renderer.canvas);
consoleContainerEl.appendChild(game.console.el);

game.console.log('The game starts.');
// start the game
game.start();
