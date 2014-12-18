// changes also made in actions.js, enetity-types.js, item.js

var portalOpenAudio = new Audio('assets/audio/portalOpen.wav');
var verifierOnAudio = new Audio('assets/audio/verifierOn.wav');
var doorOpenAudio = new Audio('assets/audio/doorOpen.wav');
var newLevelAudio = new Audio('assets/audio/newLevel.wav');
var levelsDoneAudio = new Audio('assets/audio/levelsDone.wav');
var entityDeadAudio = new Audio('assets/audio/entityDead.wav');
var itemPickedAudio = new Audio('assets/audio/itemPicked.wav');

var level = 1;
var charArray = [];
// add more radicals and characters here, one radical matches only one hanzi
charArray.push([ ['水','滑'], ['木','林'], ['日','明'], ['人','体'] ]);
// charArray.push(['火','口','耳','月','煮','喝','聆','胖']);

// randomize the levels
charArray = shuffle(charArray);

// Game



function reset(){
	RL.Game.prototype.checkDead = function(){

        var allDead = true;

        for(var key in this.characters){
            var character = this.characters[key];

            if(character.dead){
                // tile.bgColor = '#fff';
            } else {
                allDead = false;
                // tile.bgColor = '#222';
            }
        }

        if(allDead){
            this.portal.color = 'yellow';
            this.portal.opened = true;
            portalOpenAudio.play();
        } else {
            this.portal.color = '#777';
            this.portal.opened = false;
        }

    };
    // Renderer
    RL.Renderer.prototype.tileSize = 30;

    RL.Game.prototype.furnitureMoveTo = function(entity, x, y){
        this.furnitureManager.move(x, y, entity);
        var tile = this.map.get(x, y);
        if(tile){
            tile.onEntityEnter(entity);
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
        opened: false,
        onEntityEnter: function(entity){
            if (this.opened) {
                if(entity.name==='Player'){
                    level++;
                    if (level<=charArray.length){
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
    A: 'character1',
    B: 'character2',
    C: 'character3',
    D: 'character4',
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
    '2': 'radical2',
    '3': 'radical3',
    '4': 'radical4',
    '5': 'pointy_stick',
    m: 'medkit',
    b: 'bandage',
    a: 'asprin',
};

Math.floor((Math.random() * 3) + 1)

var rendererWidth = 10;
var rendererHeight = 15;

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

function addChar() {
    // add char to entities
    for ( var i=0; i<charArray[level-1].length; i++ ) {
	entityType = 'character' + (i+1).toString();
	entity = RL.Entity.Types[entityType];
	entity.char = charArray[level-1][i][1];
	entity.name = 'Character ' + charArray[level-1][i][1];
	entity.radical = 'Character ' + charArray[level-1][i][0];

	itemType = 'radical' + (i+1).toString();
	item = RL.Item.Types[itemType];
	item.char = charArray[level-1][i][0];
	item.name = 'Radical ' + charArray[level-1][i][0];
    };
}

function initRadicals(){

	var radical1 = new RL.Item(game, 'radical1');
	var radical2 = new RL.Item(game, 'radical2');
	var radical3 = new RL.Item(game, 'radical3');
	var radical4 = new RL.Item(game, 'radical4');

	var radicalItems = shuffle([radical1, radical2, radical3, radical4]);
	x = 1;
	y = 1;
	game.itemManager.add(x, y, radicalItems.pop());
	game.lighting.set(x, y, 150, 0, 150);

	x = mapData[0].length - 2;
	y = 1;
	game.itemManager.add(x, y, radicalItems.pop());
	game.lighting.set(x, y, 150, 0, 150);

	x = mapData[0].length - 2;
	y = mapData.length - 2;
	game.itemManager.add(x, y, radicalItems.pop());
	game.lighting.set(x, y, 150, 0, 150);

	x = 1;
	y = mapData.length - 2;
	game.itemManager.add(x, y, radicalItems.pop());
	game.lighting.set(x, y, 150, 0, 150);
}

function initCharacters(){
    var character1 = new RL.Entity(game, 'character1');
    var character2 = new RL.Entity(game, 'character2');
    var character3 = new RL.Entity(game, 'character3');
    var character4 = new RL.Entity(game, 'character4');

    game.characters = {
        1: character1,
        2: character2,
        3: character3,
        4: character4
    };

	var characterEntities = shuffle([character1, character2, character3, character4]);
    x = Math.floor((Math.random() * (mapData[0].length - 4)) + 2);
    y = Math.floor((Math.random() * (mapData.length - 4)) + 2);
	game.entityManager.add(x, y, characterEntities.pop());
	game.lighting.set(x, y, 150, 0, 150);

    x = Math.floor((Math.random() * (mapData[0].length - 4)) + 2);
    y = Math.floor((Math.random() * (mapData.length - 4)) + 2);
	game.entityManager.add(x, y, characterEntities.pop());
	game.lighting.set(x, y, 150, 0, 150);

    x = Math.floor((Math.random() * (mapData[0].length - 4)) + 2);
    y = Math.floor((Math.random() * (mapData.length - 4)) + 2);
	game.entityManager.add(x, y, characterEntities.pop());
	game.lighting.set(x, y, 150, 0, 150);

    x = Math.floor((Math.random() * (mapData[0].length - 4)) + 2);
    y = Math.floor((Math.random() * (mapData.length - 4)) + 2);
	game.entityManager.add(x, y, characterEntities.pop());
	game.lighting.set(x, y, 150, 0, 150);
}

function gameReady() {

    mapData = [
        "######################",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#..........p.........#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "#....................#",
        "######################",
    ];

    game.map.loadTilesFromArrayString(mapData, mapCharToType, 'floor');

    game.map.each(function(value, x, y){
        if(value.type === 'portal'){
            game.portal = value;
        }
    });

    // add some lights
    game.lighting.set(1, 1, 0, 0, 150);
    game.lighting.set(1, 20, 0, 0, 150);
    game.lighting.set(20, 1, 0, 0, 150);
    game.lighting.set(20, 20, 0, 0, 150);
    game.lighting.set(11, 1, 0, 0, 150);
    game.lighting.set(11, 20, 0, 0, 150);
    game.lighting.set(20, 11, 0, 0, 150);
    game.lighting.set(1, 11, 0, 0, 150);
    game.lighting.set(11, 11, 0, 150, 150);

    // generate and assign a map object (repaces empty default)
    game.setMapSize(game.map.width, game.map.height);

    game.entityManager.loadFromArrayString(mapData, entityCharToType);
    game.itemManager.loadFromArrayString(mapData, itemsCharToType);
    game.furnitureManager.loadFromArrayString(mapData, furnitureCharToType);

    // add input keybindings
    game.input.addBindings(keyBindings);

    var playerStartX = Math.floor((Math.random() * (mapData[0].length - 4)) + 2);
    var playerStartY = Math.floor((Math.random() * (mapData.length - 4)) + 2);
    while (game.map.get(playerStartX, playerStartY).name==='Character Pedestal'||game.map.get(playerStartX, playerStartY).name==='Portal') {
        playerStartX = Math.floor((Math.random() * (mapData[0].length - 4)) + 2);
        playerStartY = Math.floor((Math.random() * (mapData.length - 4)) + 2);
    }

    addChar();
    initRadicals();
    initCharacters();

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
        meleeWeapon1NameEl: document.getElementById('stat-melee-weapon1-name'),
        meleeWeapon1StatsEl: document.getElementById('stat-melee-weapon1-stats'),
        meleeWeapon2NameEl: document.getElementById('stat-melee-weapon2-name'),
        meleeWeapon2StatsEl: document.getElementById('stat-melee-weapon2-stats'),
        meleeWeapon3NameEl: document.getElementById('stat-melee-weapon3-name'),
        meleeWeapon3StatsEl: document.getElementById('stat-melee-weapon3-stats'),
        meleeWeapon4NameEl: document.getElementById('stat-melee-weapon4-name'),
        meleeWeapon4StatsEl: document.getElementById('stat-melee-weapon4-stats'),
        rangedWeaponNameEl: document.getElementById('stat-ranged-weapon-name'),
        rangedWeaponStatsEl: document.getElementById('stat-ranged-weapon-stats'),
    };

    RL.Util.merge(game.player, statElements);

    game.player.renderHtml();
};

game.console.log('The game starts.');
// start the game
game.start();
