// Game
RL.Game.prototype.onClick =  function(x, y){
    var coords = this.renderer.mouseToTileCoords(x, y),
    tile = this.map.get(coords.x, coords.y);
    if(!tile){
        return;
    }
    var entityTile = this.entityManager.get(tile.x, tile.y);
    if(entityTile){
        this.console.log('This is a <strong>' + entityTile.name + '</strong> standing on a <strong>' + tile.name + '</strong>.');
    }
    else{
        this.console.log('This is a <strong>' + tile.name + '</strong>.');
    }
};

var protalOpenAudio = new Audio('assets/audio/portalOpen.wav');
var verifierOnAudio = new Audio('assets/audio/verifierOn.wav');
var doorOpenAudio = new Audio('assets/audio/doorOpen.wav');

// create the game instance
var game = new RL.Game();

function reset(){

    // Renderer
    RL.Renderer.prototype.tileSize = 30;

    // Tiles
    RL.Tile.prototype.matched = false;

    RL.Tile.prototype.introduced = false;

    RL.Tile.prototype.bump = function(entity){
        if(!this.passable){
            // this.game.console.log('<strong style="color:#00a185">You</strong> are facing the <strong>' + this.name + '</strong>, but cannot pass through it.');
            return false;
        }
        return true;
    };

    RL.Tile.Types.wall.char = '▧';

    RL.Tile.Types.door.char = '▣';

    RL.Tile.Types.door.bump = function(entity){
        if(!this.passable){
            this.passable = true;
            this.blocksLos = false;
            this.char = "'";
            this.game.console.log('You open the <strong>' + this.name + '</strong>.');
            doorOpenAudio.play();
            return true;
        }
        return false;
    }

    RL.Tile.Types.portal = {
        name: 'Portal',
        char: 'Ω',
        color: '#777',
        bgColor: '#222',
        passable: true,
        blocksLos: false,
        opened: false,
        onEntityEnter: function(entity){
            var tiles = RL.Tile.Types
            if (entity.name==='Player' && !this.introduced){
                this.game.console.log('The <strong>' + this.name + '</strong> is closed, but there must be some way to open it.');
                this.introduced = true;
            }
            if (this.opened) {
                if(entity.name==='Player'){
                    mapData = mapData1;
                    game = new RL.Game();
                    reset()
                    gameReady();
                    game.start();
                    game.console.log('The next level starts.');
                }
            }
        }
    };

    RL.Tile.Types.verifier1 = {
        name: 'Verifier',
        char: 'X',
        color: '#444',
        bgColor: '#222',
        passable: true,
        blocksLos: false,
        matched: false,
        onEntityEnter: function (entity){
            if(entity.name==='Player' && !this.introduced){
                this.game.console.log('Move the characters here in the right order to open the Portal.');
                this.introduced = true;
                game.map.get(this.x+1, this.y).introduced = true;
                game.map.get(this.x+2, this.y).introduced = true;
                game.map.get(this.x+3, this.y).introduced = true;
            }
            var v2 = game.map.get(this.x+1, this.y).matched;
            var v3 = game.map.get(this.x+2, this.y).matched;
            var v4 = game.map.get(this.x+3, this.y).matched;
            if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            if(entity.codeName==='First'){
                this.matched = true;
                if (v2 && v3 && v4) {
                    game.map.get(this.x+5,this.y+2).color='yellow';
                    game.map.get(this.x+5,this.y+2).opened=true;
                    protalOpenAudio.play();

                }
                return true;
            } else {
                this.matched = false;
                return false;
            }
        }
    };

    RL.Tile.Types.verifier2 = {
        name: 'Verifier',
        char: 'X',
        color: '#444',
        bgColor: '#222',
        passable: true,
        blocksLos: false,
        matched: false,
        onEntityEnter: function(entity){
            if(entity.name==='Player' && !this.introduced){
                this.game.console.log('Move the characters here in the right order to open the Portal.');
                this.introduced = true;
                game.map.get(this.x-1, this.y).introduced = true;
                game.map.get(this.x+1, this.y).introduced = true;
                game.map.get(this.x+2, this.y).introduced = true;
            }
            var v1 = game.map.get(this.x-1, this.y).matched;
            var v3 = game.map.get(this.x+1, this.y).matched;
            var v4 = game.map.get(this.x+2, this.y).matched;
            if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            if(entity.codeName==='Second'){
                this.matched = true;
                if (v1 && v3 && v4) {
                    game.map.get(this.x+4,this.y+2).color='yellow';
                    game.map.get(this.x+4,this.y+2).opened=true;
                    protalOpenAudio.play();
                }
                return true;
            } else {
                this.matched = false;
                return false;
            }
        }
    };

    RL.Tile.Types.verifier3 = {
        name: 'Verifier',
        char: 'X',
        color: '#444',
        bgColor: '#222',
        passable: true,
        blocksLos: false,
        matched: false,
        onEntityEnter: function(entity){
            if(entity.name==='Player' && !this.introduced){
                this.game.console.log('Move the characters here in the right order to open the Portal.');
                this.introduced = true;
                game.map.get(this.x-2, this.y).introduced = true;
                game.map.get(this.x-1, this.y).introduced = true;
                game.map.get(this.x+1, this.y).introduced = true;
            }
            var v1 = game.map.get(this.x-2, this.y).matched;
            var v2 = game.map.get(this.x-1, this.y).matched;
            var v4 = game.map.get(this.x+1, this.y).matched;
            if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            if(entity.codeName==='Third'){
                this.matched = true;
                if (v1 && v2 && v4) {
                    game.map.get(this.x+3,this.y+2).color='yellow';
                    game.map.get(this.x+3,this.y+2).opened=true;
                    protalOpenAudio.play();
                }
                return true;
            } else {
                this.matched = false;
                return false;
            }
        }
        
    };

    RL.Tile.Types.verifier4 = {
        name: 'Verifier',
        char: 'X',
        color: '#444',
        bgColor: '#222',
        passable: true,
        blocksLos: false,
        matched: false,
        onEntityEnter: function(entity){
            if(entity.name==='Player' && !this.introduced){
                this.game.console.log('Move the characters here in the right order to open the Portal.');
                this.introduced = true;
                game.map.get(this.x-3, this.y).introduced = true;
                game.map.get(this.x-2, this.y).introduced = true;
                game.map.get(this.x-1, this.y).introduced = true;
            }
            var v1 = game.map.get(this.x-3, this.y).matched;
            var v2 = game.map.get(this.x-2, this.y).matched;
            var v3 = game.map.get(this.x-1, this.y).matched;
            if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            if(entity.codeName==='Fourth'){
                this.matched = true;
                if (v1 && v2 && v3) {
                    game.map.get(this.x+2,this.y+2).color='yellow';
                    game.map.get(this.x+2,this.y+2).opened=true;
                    protalOpenAudio.play();
                }
                return true;
            } else {
                this.matched = false;
                return false;
            }
        }
        
    };

    // Entities

    RL.Entity.Types.first = {
        codeName: 'First',
        name: 'character "一"',
        char: '一',
        color: 'blue',
        bgColor: '#222',
        bump: function(entity){
            // bumping entity is the player
            if(entity === this.game.player){
                var pusherX = entity.x,
                    pusherY = entity.y,
                    directionX = this.x - pusherX,
                    directionY = this.y - pusherY,
                    targetX = this.x + directionX,
                    targetY = this.y + directionY;

                // check if can be pushed into destination
                var targetPushEnt = this.game.entityManager.get(targetX, targetY);
                if(!targetPushEnt){
                    var targetPushTile = this.game.map.get(targetX, targetY);
                    if(targetPushTile.passable){
                        var prevX = this.x,
                            prevY = this.y;
                        // push target entity into tile
                        this.moveTo(targetX, targetY);
                        // move player into previously occupied tile
                        entity.moveTo(prevX, prevY);
                        return true;
                    }
                }
            }
            return false;
        }
    };

    RL.Entity.Types.second = {
        codeName: 'Second',
        name: 'character "二"',
        char: '二',
        color: 'blue',
        bgColor: '#222',
        bump: function(entity){
            // bumping entity is the player
            if(entity === this.game.player){
                var pusherX = entity.x,
                    pusherY = entity.y,
                    directionX = this.x - pusherX,
                    directionY = this.y - pusherY,
                    targetX = this.x + directionX,
                    targetY = this.y + directionY;

                // check if can be pushed into destination
                var targetPushEnt = this.game.entityManager.get(targetX, targetY);
                if(!targetPushEnt){
                    var targetPushTile = this.game.map.get(targetX, targetY);
                    if(targetPushTile.passable){
                        var prevX = this.x,
                            prevY = this.y;
                        // push target entity into tile
                        this.moveTo(targetX, targetY);
                        // move player into previously occupied tile
                        entity.moveTo(prevX, prevY);
                        return true;
                    }
                }
            }
            return false;
        }
    };

    RL.Entity.Types.third = {
        codeName: 'Third',
        name: 'character "三"',
        char: '三',
        color: 'blue',
        bgColor: '#222',
        bump: function(entity){
            // bumping entity is the player
            if(entity === this.game.player){
                var pusherX = entity.x,
                    pusherY = entity.y,
                    directionX = this.x - pusherX,
                    directionY = this.y - pusherY,
                    targetX = this.x + directionX,
                    targetY = this.y + directionY;

                // check if can be pushed into destination
                var targetPushEnt = this.game.entityManager.get(targetX, targetY);
                if(!targetPushEnt){
                    var targetPushTile = this.game.map.get(targetX, targetY);
                    if(targetPushTile.passable){
                        var prevX = this.x,
                            prevY = this.y;
                        // push target entity into tile
                        this.moveTo(targetX, targetY);
                        // move player into previously occupied tile
                        entity.moveTo(prevX, prevY);
                        return true;
                    }
                }
            }
            return false;
        }
    };

    RL.Entity.Types.fourth = {
        codeName: 'Fourth',
        name: 'character "四"',
        char: '四',
        color: 'blue',
        bgColor: '#222',
        bump: function(entity){
            // bumping entity is the player
            if(entity === this.game.player){
                var pusherX = entity.x,
                    pusherY = entity.y,
                    directionX = this.x - pusherX,
                    directionY = this.y - pusherY,
                    targetX = this.x + directionX,
                    targetY = this.y + directionY;

                // check if can be pushed into destination
                var targetPushEnt = this.game.entityManager.get(targetX, targetY);
                if(!targetPushEnt){
                    var targetPushTile = this.game.map.get(targetX, targetY);
                    if(targetPushTile.passable){
                        var prevX = this.x,
                            prevY = this.y;
                        // push target entity into tile
                        this.moveTo(targetX, targetY);
                        // move player into previously occupied tile
                        entity.moveTo(prevX, prevY);
                        return true;
                    }
                }
            }
            return false;
        }
    };

    // Player

    RL.Player.prototype.char = '☺';
    RL.Player.prototype.move = function (x, y){

        if(this.canMoveTo(x, y)){
            this.moveTo(x, y);
            return true;
        } else {
            // entity occupying target tile (if any)
            var targetTileEnt = this.game.entityManager.get(x, y);
            // if already occupied
            if(targetTileEnt){
                // this.game.console.log('<strong style="color:#00a185">You</strong> are pushing <strong>"' + targetTileEnt.char + '"</strong>.');
                return targetTileEnt.bump(this);
            } else {
                // targeted tile (attempting to move into)
                var targetTile = this.game.map.get(x, y);
                return targetTile.bump(this);
            }
        }
        return false;
    };
};

reset()

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
    'g': 'portal',
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
	game.player.x = 7;
	game.player.y = 8;

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

