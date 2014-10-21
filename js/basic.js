// create the game instance
var game = new RL.Game();

// Tiles
RL.Tile.prototype.matched = false;

RL.Tile.Types.wall.char = '▧';

RL.Tile.Types.door.char = '▣';

RL.Tile.Types.gate = {
    name: 'Gate',
    char: 'o',
    color: '#777',
    bgColor: '#222',
    passable: false,
    blocksLos: true,
    onEntityEnter: function(entity){
        if(entity.name==='Player'){
            mapData = mapData1;
            game = new RL.Game();
            gameReady();
            game.start();
        }
    }
};

RL.Tile.Types.verifier1 = {
    name: 'Verifier1',
    char: 'X',
    color: '#444',
    bgColor: '#222',
    passable: true,
    blocksLos: false,
    matched: false,
    onEntityEnter: function (entity){
        var v2 = game.map.get(this.x+1, this.y).matched;
        var v3 = game.map.get(this.x+2, this.y).matched;
        var v4 = game.map.get(this.x+3, this.y).matched;
        if(entity.name==='first'){
            this.matched = true;
            if (v2 && v3 && v4) {
                game.map.get(this.x+5,this.y+2).color='yellow';
                game.map.get(this.x+5,this.y+2).passable=true;
            }
            return true;
        } else {
            this.matched = false;
            return false;
        }
    }
};

RL.Tile.Types.verifier2 = {
    name: 'Verifier2',
    char: 'X',
    color: '#444',
    bgColor: '#222',
    passable: true,
    blocksLos: false,
    matched: false,
    onEntityEnter: function(entity){
        var v1 = game.map.get(this.x-1, this.y).matched;
        var v3 = game.map.get(this.x+1, this.y).matched;
        var v4 = game.map.get(this.x+2, this.y).matched;
        if(entity.name==='second'){
            this.matched = true;
            if (v1 && v3 && v4) {
                game.map.get(this.x+4,this.y+2).color='yellow';
                game.map.get(this.x+4,this.y+2).passable=true;
            }
            return true;
        } else {
            this.matched = false;
            return false;
        }
    }
};

RL.Tile.Types.verifier3 = {
    name: 'Verifier3',
    char: 'X',
    color: '#444',
    bgColor: '#222',
    passable: true,
    blocksLos: false,
    matched: false,
    onEntityEnter: function(entity){
        var v1 = game.map.get(this.x-2, this.y).matched;
        var v2 = game.map.get(this.x-1, this.y).matched;
        var v4 = game.map.get(this.x+1, this.y).matched;
        if(entity.name==='third'){
            this.matched = true;
            if (v1 && v2 && v4) {
                game.map.get(this.x+3,this.y+2).color='yellow';
                game.map.get(this.x+3,this.y+2).passable=true;
            }
            return true;
        } else {
            this.matched = false;
            return false;
        }
    }
    
};

RL.Tile.Types.verifier4 = {
    name: 'Verifier4',
    char: 'X',
    color: '#444',
    bgColor: '#222',
    passable: true,
    blocksLos: false,
    matched: false,
    onEntityEnter: function(entity){
        var v1 = game.map.get(this.x-3, this.y).matched;
        var v2 = game.map.get(this.x-2, this.y).matched;
        var v3 = game.map.get(this.x-1, this.y).matched;
        if(entity.name==='fourth'){
            this.matched = true;
            if (v1 && v2 && v3) {
                game.map.get(this.x+2,this.y+2).color='yellow';
                game.map.get(this.x+2,this.y+2).passable=true;
            }
            return true;
        } else {
            this.matched = false;
            return false;
        }
    }
    
};

var mapData0 = [
    "########################",
    "#...........#..........#",
    "#..2........#....3.....#",
    "#...........#..........#",
    "#.....##+#####+###.....#",
    "#.....#..qwer....#.....#",
    "#.....#..........#.....#",
    "#######.......g..#######",
    "#.....#..........#.....#",
    "#..1..##+######+##.....#",
    "#...........#..........#",
    "#...........#.....4....#",
    "#...........#..........#",
    "########################",
];

var mapData1 = [
    "########################",
    "#...........#..........#",
    "#..1........#....2.....#",
    "#...........#..........#",
    "#.....##+#####+###.....#",
    "#.....#..qwer....#.....#",
    "#.....#..........#.....#",
    "#######.......g..#######",
    "#.....#..........#.....#",
    "#..4..##+######+##.....#",
    "#...........#..........#",
    "#...........#.....3....#",
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
    'g': 'gate',
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

