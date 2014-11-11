var portalOpenAudio = new Audio('assets/audio/portalOpen.wav');
var verifierOnAudio = new Audio('assets/audio/verifierOn.wav');
var doorOpenAudio = new Audio('assets/audio/doorOpen.wav');
var newLevelAudio = new Audio('assets/audio/newLevel.wav');
var levelsDoneAudio = new Audio('assets/audio/levelsDone.wav');

// Game

function reset(){

    // Renderer
    RL.Renderer.prototype.tileSize = 30;

    RL.Game.prototype.furnitureMoveTo = function(entity, x, y){
        this.furnitureManager.move(x, y, entity);
        var tile = this.map.get(x, y);
        if(tile){
            tile.onEntityEnter(entity);
        }
    };

    RL.Entity.Types.zombie.char = '滑';

    RL.Game.prototype.checkPuzzle = function(){

        var solved = true;

        for(var key in this.verifierTiles){
            var tile = this.verifierTiles[key];

            if(tile.matched){
                // tile.bgColor = '#fff';
            } else {
                solved = false;
                // tile.bgColor = '#222';
            }
        }

        if(solved){
            this.portal.color = 'yellow';
            this.portal.opened = true;
            portalOpenAudio.play();
        } else {
            this.portal.color = '#777';
            this.portal.opened = false;
        }

    };

    RL.Game.prototype.introduceVerifier = function(){
        if(!this.introduced){
            this.console.log('Move the characters here in the right order to open the Portal.');
            this.introduced = true;
        }
    };


    RL.Furniture.prototype.moveTo = function(x, y) {
        return this.game.furnitureMoveTo(this, x, y);
    };


    // Tiles
    RL.Tile.prototype.matched = false;

    RL.Tile.prototype.introduced = false;

    RL.Tile.Types.wall.char = '▧';

    RL.Furniture.Types.door.char = '▣';

    RL.Tile.Types.portal = {
        name: 'Portal',
        char: 'Ω',
        color: '#777',
        bgColor: '#222',
        passable: true,
        blocksLos: false,
        opened: true,
        onEntityEnter: function(entity){
            if (this.opened) {
                if(entity.name==='Player'){
                    level++;
                    if (level<10){
                        newLevelAudio.play();
                        game = new RL.Game();
                        reset();
                        gameReady();
                        game.start();
                        game.console.log('The level ' + level.toString() + ' starts.');
                        this.passable = false;
                    } else{
                    	levelsDoneAudio.play();
                        game.console.log('Congratulations! All levels are done.');
                    }
                }
            }
        }
    };

    // Player

    RL.Player.prototype.char = '☺';
    RL.Player.prototype.name = 'Player';
};

var keyBindings = {
    up: ['UP_ARROW', 'K', 'W'],
    down: ['DOWN_ARROW', 'J', 'S'],
    left: ['LEFT_ARROW', 'H', 'A'],
    right: ['RIGHT_ARROW', 'L', 'D'],
    close: ['C'],
    open: ['O'],
    prev_target: ['COMMA'],
    next_target: ['PERIOD'],
    select: ['ENTER'],
    melee_attack: ['E'],
    ranged_attack: ['F'],
    wait: ['SPACE'],
    grab: ['G'],
    cancel: ['ESC']
};

var controlsEL = document.getElementById('controls');
var mapContainerEl = document.getElementById('map-container');
var consoleContainerEl = document.getElementById('console-container');
var consoleDirectionsEl = document.getElementById('console-directions');
var controlsHtml = '';
 controlsHtml += '<div class="tr"><div class="td">Action</div> <div class="td">Keys</div></div>';
for(var action in keyBindings){
    controlsHtml += '<div class="tr">';
    controlsHtml += '<div class="td">' + action + '</div>';

    var val = keyBindings[action];
    controlsHtml += '<div class="td">';
    controlsHtml += val.join(', ');
    controlsHtml += '</div>';
    controlsHtml += '</div>';
}

    controlsEL.innerHTML = controlsHtml;

var mapData = [];

var mapCharToType = {
    '#': 'wall',
    '.': 'floor',
    'p': 'portal'
};

var entityCharToType = {
    z: 'zombie'
};

var furnitureCharToType = {
    h: 'chair',
    T: 'table',
    S: 'shelves',
    U: 'trashcan',
    '-': 'box',
    '+': 'door'
};

var itemsCharToType = {
    '1': 'radical1',
    '2': 'umbrella',
    '3': 'folding_chair',
    '4': 'meat_tenderizer',
    '5': 'pointy_stick',
    m: 'medkit',
    b: 'bandage',
    a: 'asprin',
};

Math.floor((Math.random() * 3) + 1)

var rendererWidth = 10;
var rendererHeight = 15;

var level = 1;

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

reset();

gameReady();


function gameReady() {

    mapData = [
        "######################",
        "#1...................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#.............m......#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#........z.p.........#",
        "#....................#",
        "#.....z..............#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#.....z..............#",
        "#....................#",
        "#....................#",
        "#....................#",
        "######################",
    ];

    game.map.loadTilesFromArrayString(mapData, mapCharToType, 'floor');

    // add some lights
    game.lighting.set(1, 1, 0, 0, 150);
    game.lighting.set(1, 20, 0, 0, 150);
    game.lighting.set(20, 1, 0, 0, 150);
    game.lighting.set(20, 20, 0, 0, 150);
    game.lighting.set(11, 1, 0, 0, 150);
    game.lighting.set(11, 20, 0, 0, 150);
    game.lighting.set(20, 11, 0, 0, 150);
    game.lighting.set(1, 11, 0, 0, 150);
    game.lighting.set(11, 11, 255, 255, 255);

    // generate and assign a map object (repaces empty default)
    game.setMapSize(game.map.width, game.map.height);

    game.entityManager.loadFromArrayString(mapData, entityCharToType);
    game.itemManager.loadFromArrayString(mapData, itemsCharToType);
    game.furnitureManager.loadFromArrayString(mapData, furnitureCharToType);

    // add input keybindings
    game.input.addBindings(keyBindings);

    var playerStartX = Math.floor((Math.random() * 10) + 7);
    var playerStartY = Math.floor((Math.random() * 4) + 5);
    while (game.map.get(playerStartX, playerStartY).name==='Character Pedestal'||game.map.get(playerStartX, playerStartY).name==='Portal') {
        playerStartX = Math.floor((Math.random() * 10) + 7);
        playerStartY = Math.floor((Math.random() * 4) + 5);
    }

    // set player starting position
    game.player.x = playerStartX;
    game.player.y = playerStartY;

    // make the view a little smaller
    game.renderer.resize(rendererWidth, rendererHeight);

    game.renderer.layers = [
        new RL.RendererLayer(game, 'map',       {draw: false,   mergeWithPrevLayer: false}),

        new RL.RendererLayer(game, 'furniture', {draw: false,   mergeWithPrevLayer: true}),
        new RL.RendererLayer(game, 'item',      {draw: false,   mergeWithPrevLayer: true}),
        new RL.RendererLayer(game, 'entity',    {draw: true,   mergeWithPrevLayer: true}),

        new RL.RendererLayer(game, 'lighting',  {draw: true,    mergeWithPrevLayer: false}),
        new RL.RendererLayer(game, 'fov',       {draw: true,    mergeWithPrevLayer: false}),
    ];

    game.renderer.uiLayers = [

    ];

    // get existing DOM elements
    mapContainerEl.appendChild(game.renderer.canvas);
    consoleContainerEl.appendChild(game.console.el);

    // empty existing elements
    mapContainerEl.innerHTML = '';
    consoleContainerEl.innerHTML = '';

    // append elements created by the game to the DOM
    mapContainerEl.appendChild(game.renderer.canvas);
    consoleContainerEl.appendChild(game.console.el);
    game.console.directionsEl = document.getElementById('console-directions');

    var statElements = {
        hpEl: document.getElementById('stat-hp'),
        hpMaxEl: document.getElementById('stat-hp-max'),
        meleeWeaponNameEl: document.getElementById('stat-melee-weapon-name'),
        meleeWeaponStatsEl: document.getElementById('stat-melee-weapon-stats'),
        rangedWeaponNameEl: document.getElementById('stat-ranged-weapon-name'),
        rangedWeaponStatsEl: document.getElementById('stat-ranged-weapon-stats'),
    };

    RL.Util.merge(game.player, statElements);

    game.player.renderHtml();
};

game.console.log('The game starts.');
// start the game
game.start();