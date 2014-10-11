// create the game instance
var game = new RL.Game();


// RL.Entity.Types.next = {
// 		name: 'next',
// 		char: ',',
// 		color: 'white',
// 		bgColor: false,
// 		bump: function(entity){
// 			// if bumping entity is the player
// 			if(entity === this.game.player){
// 				// @TODO combat logic here
// 				mapData = mapData1;
// 				game = new RL.Game();
// 				gameReady();
// 				game.console.log('You are entering next level');
// 				game.start();
// 				
// 			}
// 			return false;
// 		}
// };

var mapData0 = [
    "########################",
    "#...........#..........#",
    "#..2........#....3.....#",
    "#...........#..........#",
    "#.....##+#####+###.....#",
    "#.....#..qwer....#.....#",
    "#.....#..........#.....#",
    "#######..........#######",
    "#.....#..........#.....#",
    "#..1..##+######+##.....#",
    "#...........#..........#",
    "#...........#.....4....#",
    "#...........#..........#",
    "########################",
];

var mapData = mapData0;

var mapCharToType = {
    '#': 'wall',
    '.': 'floor',
    '+': 'door',
    'q': 'verifier1',
    'w': 'verifier2',
    'e': 'verifier3',
    'r': 'verifier4',
};

var entityCharToType = {
	'1': 'first',
	'2': 'second',
	'3': 'third',
	'4': 'fourth'
};

var keyBindings = {
    up: ['UP_ARROW', 'K', 'W'],
    down: ['DOWN_ARROW', 'J', 'S'],
    left: ['LEFT_ARROW', 'H', 'A'],
    right: ['RIGHT_ARROW', 'L', 'D'],
};

gameReady()

function gameReady() {
	game.map.loadTilesFromArrayString(mapData, mapCharToType, 'floor');
	game.entityManager.loadEntitiesFromArrayString(mapData, entityCharToType);

	// add some lights
	game.lighting.set(10, 5, 255, 0, 0);
	game.lighting.set(11, 5, 0, 0, 255);
	game.lighting.set(12, 5, 0, 0, 255);
	game.lighting.set(13, 5, 0, 0, 255);

	// generate and assign a map object (repaces empty default)
	game.setMapSize(game.map.width, game.map.height);

	// add input keybindings
	game.input.addBindings(keyBindings);

	// create entities and add to game.entityManager
// 	var entZombie = new RL.Entity(game, 'zombie');
// 	game.entityManager.add(2, 8, entZombie);
// 
// 	// or just add by entity type
// 	game.entityManager.add(5, 9, 'zombie');
// 
// 	game.entityManager.add(3, 11, 'next');

	// set player starting position
	game.player.x = 3;
	game.player.y = 3;

// 	game.lighting.set(20, 1, 0, 255, 0);
// 	game.lighting.set(7, 14, 0, 0, 255);
// 	game.lighting.set(20, 12, 255, 255, 255);

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
};

game.console.log('The game starts.');
// start the game
game.start();

