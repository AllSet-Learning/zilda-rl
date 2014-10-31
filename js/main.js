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
var newLevelAudio = new Audio('assets/audio/newLevel.wav');

var level = 1;
var charArray = [];
// add more phrases here
charArray.push(['人','山','人','海']);
charArray.push(['入','乡','随','俗']);
charArray.push(['五','湖','四','海']);
charArray.push(['杀','鸡','儆','猴']);

function addChar(){

    RL.Entity.Types.fourth.char = charArray[level-1].pop();
    RL.Entity.Types.fourth.name = 'Character "'+RL.Entity.Types.fourth.char+'"';
    RL.Entity.Types.third.char = charArray[level-1].pop();
    RL.Entity.Types.third.name = 'Character "'+RL.Entity.Types.third.char+'"';
    RL.Entity.Types.second.char = charArray[level-1].pop();
    RL.Entity.Types.second.name = 'Character "'+RL.Entity.Types.second.char+'"';
    RL.Entity.Types.first.char = charArray[level-1].pop();
    RL.Entity.Types.first.name = 'Character "'+RL.Entity.Types.first.char+'"';
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

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
                    level++;
                    if (level <= charArray.length){
                        newLevelAudio.play();
                        game = new RL.Game();
                        reset();
                        addChar();
                        gameReady();
                        game.start();
                        game.console.log('The level ' + level.toString() + ' starts.');
                        this.passable = false;
                    } else{
                        game.console.log('Congratulations! All levels are done.');
                    }
                }
            }
        }
    };

    RL.Tile.Types.reset = {
        name: 'ResetLevel',
        char: 'o',
        color: '#444',
        bgColor: '#222',
        passable: true,
        blocksLos: false,
        matched: false,
        onEntityEnter: function (entity){
            game = new RL.Game();
            gameReady();
            game.start();
            game.console.log('The current level is reset.');
            this.passable = false;
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
            var v2 = game.map.get(this.x+1, this.y);
            var v3 = game.map.get(this.x+2, this.y);
            var v4 = game.map.get(this.x+3, this.y);
            if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            if(entity.codeName==='First'||(this.char==v2.char&&entity.codeName==='Second')||(this.char==v3.char&&entity.codeName==='Third')||(this.char==v2.char&&entity.codeName==='Fourth')){
                this.matched = true;
                if (v2.matched && v3.matched && v4.matched) {
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
            var v1 = game.map.get(this.x-1, this.y);
            var v3 = game.map.get(this.x+1, this.y);
            var v4 = game.map.get(this.x+2, this.y);
            if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            if(entity.codeName==='Second'||(this.char==v1.char&&entity.codeName==='First')||(this.char==v3.char&&entity.codeName==='Third')||(this.char==v4.char&&entity.codeName==='Fourth')){
                this.matched = true;
                if (v1.matched && v3.matched && v4.matched) {
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
            var v1 = game.map.get(this.x-2, this.y);
            var v2 = game.map.get(this.x-1, this.y);
            var v4 = game.map.get(this.x+1, this.y);
            if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            if(entity.codeName==='Third'||(this.char==v1.char&&entity.codeName==='First')||(this.char==v2.char&&entity.codeName==='Second')||(this.char==v4.char&&entity.codeName==='Fourth')){
                this.matched = true;
                if (v1.matched && v2.matched && v4.matched) {
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
            var v1 = game.map.get(this.x-3, this.y);
            var v2 = game.map.get(this.x-2, this.y);
            var v3 = game.map.get(this.x-1, this.y);
            if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            if(entity.codeName==='Fourth'||(this.char==v1.char&&entity.codeName==='First')||(this.char==v2.char&&entity.codeName==='Second')||(this.char==v3.char&&entity.codeName==='Third')){
                this.matched = true;
                if (v1.matched && v2.matched && v3.matched) {
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

var mapData = [];

String.prototype.setCharAt = function(index,chr) {
    if(index > this.length-1) return str;
    return this.substr(0,index) + chr + this.substr(index+1);
}

var mapCharToType = {
    '#': 'wall',
    '.': 'floor',
    '+': 'door',
    'a': 'verifier1',
    'b': 'verifier2',
    'c': 'verifier3',
    'd': 'verifier4',
    'p': 'portal',
    'r': 'reset'
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

addChar();

gameReady()

function gameReady() {

    mapData = [
        "########################",
        "#........#####.........#",
        "#........#####.........#",
        "#........#####.........#",
        "########+#####+#########",
        "#######..abcd....#######",
        "#######..........#######",
        "#######.......p..#######",
        "#######..........#######",
        "########+######+########",
        "#........######........#",
        "#........######........#",
        "#........######........#",
        "#######+################",
        "####......r#############",
        "########################",
    ];

    nums = ['1','2','3','4'];
    shuffle(nums);

    y = Math.floor((Math.random() * 2) + 2);
    x = Math.floor((Math.random() * 7) + 2);
    mapData[y] = mapData[y].setCharAt(x,nums.pop());
    game.lighting.set(x, y, 255, 0, 255);

    y = Math.floor((Math.random() * 2) + 2);
    x = Math.floor((Math.random() * 8) + 14);
    mapData[y] = mapData[y].setCharAt(x,nums.pop());
    game.lighting.set(x, y, 255, 0, 255);

    y = Math.floor((Math.random() * 2) + 10);
    x = Math.floor((Math.random() * 7) + 2);
    mapData[y] = mapData[y].setCharAt(x,nums.pop());
    game.lighting.set(x, y, 255, 0, 255);

    y = Math.floor((Math.random() * 2) + 10);
    x = Math.floor((Math.random() * 7) + 15);
    mapData[y] = mapData[y].setCharAt(x,nums.pop());
    game.lighting.set(x, y, 255, 0, 255);

    game.map.loadTilesFromArrayString(mapData, mapCharToType, 'floor');
    game.entityManager.loadEntitiesFromArrayString(mapData, entityCharToType);

	// add some lights
	game.lighting.set(10, 5, 0, 0, 255);
	game.lighting.set(11, 5, 0, 0, 255);

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