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

    RL.Game.prototype.test = function(){
        console.log('hello');
    }

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
                    	levelsDoneAudio.play();
                        game.console.log('Congratulations! All levels are done.');
                    }
                }
            }
        }
    };




    RL.Tile.Types.verifier1 = {
        name: 'Character Pedestal',
        char: 'X',
        color: '#444',
        bgColor: '#222',
        passable: true,
        blocksLos: false,
        matched: false,
        onEntityEnter: function (entity){
            if(entity.name==='Player'){
                this.game.introduceVerifier();
            } else if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            var handzis = this.game.hanzi
            if(entity.type === 'hanzi1' || (entity.type === 'hanzi2' && handzis[2].char===handzis[1].char) || (entity.type === 'hanzi3' && handzis[3].char===handzis[1].char) || (entity.type === 'hanzi4' && handzis[4].char===handzis[1].char)){
                this.matched = true;
            } else {
                this.matched = false;
            }
            this.game.checkPuzzle();
        }
    };

    RL.Tile.Types.verifier2 = {
        name: 'Character Pedestal',
        char: 'X',
        color: '#444',
        bgColor: '#222',
        passable: true,
        blocksLos: false,
        matched: false,
        onEntityEnter: function(entity){
            if(entity.name==='Player'){
                this.game.introduceVerifier();
            } else if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            var handzis = this.game.hanzi
            if(entity.type === 'hanzi2' || (entity.type === 'hanzi1' && handzis[1].char===handzis[2].char) || (entity.type === 'hanzi3' && handzis[3].char===handzis[2].char) || (entity.type === 'hanzi4' && handzis[4].char===handzis[2].char)){
                this.matched = true;
            } else {
                this.matched = false;
            }
            this.game.checkPuzzle();
        }
    };

    RL.Tile.Types.verifier3 = {
        name: 'Character Pedestal',
        char: 'X',
        color: '#444',
        bgColor: '#222',
        passable: true,
        blocksLos: false,
        matched: false,
        onEntityEnter: function(entity){
            if(entity.name==='Player'){
                this.game.introduceVerifier();
            } else if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            var handzis = this.game.hanzi
            if(entity.type === 'hanzi3' || (entity.type === 'hanzi1' && handzis[1].char===handzis[3].char) || (entity.type === 'hanzi2' && handzis[2].char===handzis[3].char) || (entity.type === 'hanzi4' && handzis[4].char===handzis[3].char)){
                this.matched = true;
            } else {
                this.matched = false;
            }
            this.game.checkPuzzle();
        }

    };

    RL.Tile.Types.verifier4 = {
        name: 'Character Pedestal',
        char: 'X',
        color: '#444',
        bgColor: '#222',
        passable: true,
        blocksLos: false,
        matched: false,
        onEntityEnter: function(entity){
            if(entity.name==='Player'){
                this.game.introduceVerifier();
            } else if(entity.name!='Player'){
                verifierOnAudio.play();
            }
            var handzis = this.game.hanzi
            if(entity.type === 'hanzi4' || (entity.type === 'hanzi1' && handzis[1].char===handzis[4].char) || (entity.type === 'hanzi2' && handzis[2].char===handzis[4].char) || (entity.type === 'hanzi3' && handzis[3].char===handzis[4].char)){
                this.matched = true;
            } else {
                this.matched = false;
            }
            this.game.checkPuzzle();
        }

    };

    // Entities

    RL.Furniture.Types.hanzi1 = {
        codeName: 'Hanzi1',
        name: 'character "一"',
        char: '一',
        color: 'blue',
        consoleColor: 'blue',
        // bgColor: '#222',
        passable: false,
        init: function(){
            RL.Actions.Resolvable.add(this, 'grab');
            RL.Actions.Resolvable.add(this, 'push');
        }
    };

    RL.Furniture.Types.hanzi2 = {
        codeName: 'Hanzi2',
        name: 'character "二"',
        char: '二',
        color: 'blue',
        consoleColor: 'blue',
        // bgColor: '#222',
        passable: false,
        init: function(){
            RL.Actions.Resolvable.add(this, 'grab');
            RL.Actions.Resolvable.add(this, 'push');
        }
    };

    RL.Furniture.Types.hanzi3 = {
        codeName: 'Hanzi3',
        name: 'character "三"',
        char: '三',
        color: 'blue',
        consoleColor: 'blue',
        // bgColor: '#222',
        init: function(){
            RL.Actions.Resolvable.add(this, 'grab');
            RL.Actions.Resolvable.add(this, 'push');
        }
    };

    RL.Furniture.Types.hanzi4 = {
        codeName: 'Hanzi4',
        name: 'character "四"',
        char: '四',
        color: 'blue',
        consoleColor: 'blue',
        // bgColor: '#222',
        init: function(){
            RL.Actions.Resolvable.add(this, 'grab');
            RL.Actions.Resolvable.add(this, 'push');
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
    grab: ['G'],
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
    'a': 'verifier1',
    'b': 'verifier2',
    'c': 'verifier3',
    'd': 'verifier4',
    'p': 'portal'
};

var furnitureCharToType = {
    '+': 'door'
};
Math.floor((Math.random() * 3) + 1)

var rendererWidth = 10;
var rendererHeight = 14;

var level = 1;
var charArray = [];
// add more phrases here
charArray.push(['人','山','人','海']);
charArray.push(['入','乡','随','俗']);
charArray.push(['五','湖','四','海']);
charArray.push(['杀','鸡','儆','猴']);
charArray.push(['垂','头','丧','气']);
charArray.push(['无','动','于','衷']);
charArray.push(['滔','滔','不','绝']);
charArray.push(['无','懈','可','击']);
charArray.push(['雷','厉','风','行']);
charArray.push(['震','耳','欲','聋']);
charArray.push(['头','头','是','道']);
charArray.push(['咄','咄','逼','人']);

// levels shuffled
charArray = shuffle(charArray);


function addChar(){

    RL.Furniture.Types.hanzi4.char = charArray[level-1].pop();
    RL.Furniture.Types.hanzi4.name = 'Character "'+RL.Furniture.Types.hanzi4.char+'"';
    RL.Furniture.Types.hanzi3.char = charArray[level-1].pop();
    RL.Furniture.Types.hanzi3.name = 'Character "'+RL.Furniture.Types.hanzi3.char+'"';
    RL.Furniture.Types.hanzi2.char = charArray[level-1].pop();
    RL.Furniture.Types.hanzi2.name = 'Character "'+RL.Furniture.Types.hanzi2.char+'"';
    RL.Furniture.Types.hanzi1.char = charArray[level-1].pop();
    RL.Furniture.Types.hanzi1.name = 'Character "'+RL.Furniture.Types.hanzi1.char+'"';
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

reset();
addChar();

gameReady();


function initHanziFurniture(){

    var hanzi1 = new RL.Furniture(game, 'hanzi1');
    var hanzi2 = new RL.Furniture(game, 'hanzi2');
    var hanzi3 = new RL.Furniture(game, 'hanzi3');
    var hanzi4 = new RL.Furniture(game, 'hanzi4');

    game.hanzi = {
        1: hanzi1,
        2: hanzi2,
        3: hanzi3,
        4: hanzi4
    };

    var hanziTiles = shuffle([hanzi1, hanzi2, hanzi3, hanzi4]);

    y = Math.floor((Math.random() * 3) + 1);
    x = Math.floor((Math.random() * 8) + 1);
    game.furnitureManager.add(x, y, hanziTiles.pop());
    game.lighting.set(x, y, 150, 0, 150);

    y = Math.floor((Math.random() * 3) + 1);
    x = Math.floor((Math.random() * 9) + 14);
    game.furnitureManager.add(x, y, hanziTiles.pop());
    game.lighting.set(x, y, 150, 0, 150);

    y = Math.floor((Math.random() * 3) + 10);
    x = Math.floor((Math.random() * 8) + 1);
    game.furnitureManager.add(x, y, hanziTiles.pop());
    game.lighting.set(x, y, 150, 0, 150);

    y = Math.floor((Math.random() * 3) + 10);
    x = Math.floor((Math.random() * 8) + 15);
    game.furnitureManager.add(x, y, hanziTiles.pop());
    game.lighting.set(x, y, 150, 0, 150);

}

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
        "########################",
    ];

    game.map.loadTilesFromArrayString(mapData, mapCharToType, 'floor');


    game.verifierTiles = {};
    game.map.each(function(value, x, y){
        if(value.type === 'verifier1'){
            game.verifierTiles.verifier1 = value;
        }
        else if(value.type === 'verifier2'){
            game.verifierTiles.verifier2 = value;
        }
        else if(value.type === 'verifier3'){
            game.verifierTiles.verifier3 = value;
        }
        else if(value.type === 'verifier4'){
            game.verifierTiles.verifier4 = value;
        }
        else if(value.type === 'portal'){
            game.portal = value;
        }
    });

    // add some lights
    game.lighting.set(10, 5, 0, 0, 150);
    game.lighting.set(11, 5, 0, 0, 150);

    // generate and assign a map object (repaces empty default)
    game.setMapSize(game.map.width, game.map.height);

    // game.entityManager.loadEntitiesFromArrayString(mapData, entityCharToType);
    // game.itemManager.loadFromArrayString(mapData, itemsCharToType);
    game.furnitureManager.loadFromArrayString(mapData, furnitureCharToType);

    initHanziFurniture();

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