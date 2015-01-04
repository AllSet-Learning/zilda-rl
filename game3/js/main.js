//customize basic game "turn"
RL.Game.prototype.onKeyAction = function(action) {
    if(!this.gameOver){
        var result = this.player.update(action);
        if (result) {
            this.entityManager.update(this.player);
            
            //Don't update map the fov or lighting!
            //this.player.updateFov();
            //this.lighting.update();
            
            //don't follow player
            //this.renderer.setCenter(this.player.x, this.player.y);

            //update items
            this.itemManager.update();

            //update tiles
            for ( var x=0; x<this.map.width; x++ ) {
                for ( var y=0; y<this.map.height; y++ ) {
                    var tile = this.map.get(x,y);
                    if (tile.skip) {
                        tile.skip = false;
                    } else {
                        tile.update();
                    };
                };
            };

            this.renderer.draw();
            this.updateHud();
            this.hudRenderer.draw();
        } else if(this.queueDraw){
            this.renderer.draw();
        };
    };
    this.queueDraw = false;
};

//custom start function
RL.Game.prototype.start = function() {
    var playerRoom = this.player.room;

    this.entityManager = playerRoom.entityManager;
    this.itemManager = playerRoom.itemManager;
    this.map = playerRoom.map;

    this.entityManager.add(this.player.x, this.player.y, this.player);

    this.renderer.setCenter(playerRoom.centerX,playerRoom.centerY);
    this.renderer.draw();
    
    this.initHud();
    this.updateHud();
    this.hudRenderer.draw();
};

//New function to initializes the HUD tiles
RL.Game.prototype.initHud = function() {
    this.hudMap.get(0,0).char = "L";
    this.hudMap.get(0,0).color = "white";
    this.hudMap.get(1,0).char = "E";
    this.hudMap.get(1,0).color = "white";
    this.hudMap.get(2,0).char = "V";
    this.hudMap.get(2,0).color = "white";
    this.hudMap.get(3,0).char = "E";
    this.hudMap.get(3,0).color = "white";
    this.hudMap.get(4,0).char = "L";
    this.hudMap.get(4,0).color = "white";
    this.hudMap.get(5,0).char = " ";
    this.hudMap.get(5,0).color = "white";
    this.hudMap.get(6,0).char = "1";
    this.hudMap.get(6,0).color = "white";

    this.hudMap.get(this.dungeon.width+1,1).char  = "⁂";
    this.hudMap.get(this.dungeon.width+1,1).color = "yellow";
    this.hudMap.get(this.dungeon.width+2,1).char  = "X";
    this.hudMap.get(this.dungeon.width+2,1).color = "white";
    this.hudMap.get(this.dungeon.width+3,1).color = "white";
    this.hudMap.get(this.dungeon.width+4,1).color = "white";

    this.hudMap.get(this.dungeon.width+1,2).char  = "۴";//"স";// ۴ ߞ ߓ ᚩ ᚨ ᚡ শ  ไ ᶋ
    this.hudMap.get(this.dungeon.width+1,2).color = "orange";
    this.hudMap.get(this.dungeon.width+2,2).char  = "X";
    this.hudMap.get(this.dungeon.width+2,2).color = "white";
    this.hudMap.get(this.dungeon.width+3,2).color = "white";
    this.hudMap.get(this.dungeon.width+4,2).color = "white";

    this.hudMap.get(this.dungeon.width+1,3).char  = "ර"; //Ȯ Q ᵹ Ố
    this.hudMap.get(this.dungeon.width+1,3).color = "blue";
    this.hudMap.get(this.dungeon.width+2,3).char  = "X";
    this.hudMap.get(this.dungeon.width+2,3).color = "white";
    this.hudMap.get(this.dungeon.width+3,3).color = "white";
    this.hudMap.get(this.dungeon.width+4,3).color = "white";

    for ( var x=0; x<this.hudMap.width; x++ ) {
        for ( var y=0; y<this.hudMap.height; y++ ) {
            this.hudMap.get(x,y).explored = true;
        };
    };
    for ( var x=0; x<this.dungeon.width; x++ ) {
        for ( var y=0; y<this.dungeon.height; y++ ) {
            tile = this.hudMap.get(x,y+1);
            tile.explored = false;
            tile.color = "blue";
        };
    };
};

//New function to update the hud
RL.Game.prototype.updateHud = function() {
    for ( var x=0; x<this.dungeon.width; x++ ) {
        for ( var y=0; y<this.dungeon.height; y++ ) {
            tile = this.hudMap.get(x,y+1);
            if (this.player.room.x == x && this.player.room.y == y) {
                tile.explored = true;
                tile.color = "yellow";
            } else {
                tile.color = "blue";
            };
        };
    };

    var goldString = this.player.gold.toString();
    if (goldString.length===1) { goldString="0"+goldString; };
    this.hudMap.get(this.dungeon.width+3,1).char = goldString[0];
    this.hudMap.get(this.dungeon.width+4,1).char = goldString[1];

    var keysString = this.player.keys.toString();
    if (keysString.length===1) { keysString="0"+keysString; };
    this.hudMap.get(this.dungeon.width+3,2).char = keysString[0];
    this.hudMap.get(this.dungeon.width+4,2).char = keysString[1];

    var bombsString = this.player.bombs.toString();
    if (bombsString.length===1) { bombsString="0"+bombsString; };
    this.hudMap.get(this.dungeon.width+3,3).char = bombsString[0];
    this.hudMap.get(this.dungeon.width+4,3).char = bombsString[1];

    for ( var x=this.hudMap.width-this.player.maxLife; x<this.hudMap.width; x++ ) {
        var y=0;
        tile = this.hudMap.get(x,y);
        tile.char = "♥";
        if (x-(this.hudMap.width-this.player.maxLife) >= this.player.life) {
            tile.color = "gray";
        } else {
            tile.color = "red";
        };
    };
};

//New function that handles player moving from one room to another
RL.Game.prototype.movePlayerRoom = function(fromRoom,toRoom) {
    toRoom.entityManager.add(this.player.x,this.player.y,this.player);
    this.player.room = toRoom;
    this.entityManager = toRoom.entityManager;
    this.itemManager = toRoom.itemManager;
    this.map = toRoom.map;
    this.updateHud();
    this.renderer.draw();
    this.hudRenderer.draw();
    console.log('Player moved from ('+fromRoom.x+','+fromRoom.y + ') to (' + toRoom.x+','+toRoom.y+')');
};

//make tiles bigger for Hanzi readability
RL.Renderer.prototype.tileSize = 32;
//change font to something more Zelda-like
RL.Renderer.prototype.font = "Arial Black";
//make tiles explored by default
RL.Tile.prototype.explored = true;
//give tiles update method placeholder;
RL.Tile.prototype.update = function() {};
RL.Tile.prototype.skip = false;
RL.Tile.prototype.bombable = true; //tiles are by default bombable
//change type function
RL.Tile.prototype.changeType = function(type) {
    this.type = type;
    var typeData = RL.Tile.Types[this.type];
    RL.Util.merge(this, typeData);
    if (!typeData.update) {
        this.update = function() {};
    };
    if (!typeData.onEntityEnter) {
        this.onEntityEnter = function(entity) {};
    };
};

//Get rid of black border around items
RL.Item.prototype.charStrokeColor = false;
RL.Item.prototype.charStrokeWidth = 0;

//Update item - if on same tile as player pick them up
RL.Item.prototype.update = function() {
    if ( this.x === this.game.player.x &&
         this.y === this.game.player.y ) {
        this.attachTo(this.game.player);
        this.game.itemManager.remove(this);
    };
};

//Customize renderer to ignore field of view
RL.RendererLayer.Types.entity.getTileData = function(x, y, prevTileData) {
    if(!this.game){
        return false;
    }
    var player = this.game.player;
    var entity = false;
    if (
        player &&
            x === player.x &&
            y === player.y
    ) {
        entity = player;
    } else if(this.game.entityManager){
        entity = this.game.entityManager.get(x, y);
  }
    //skip the fov check
    /*
      if(
      this.game.player &&
      this.game.player.fov &&
      !this.game.player.fov.get(x, y)
      ){
      return false;
      }
    */
    if(entity){
        var tileData = entity.getTileDrawData();
        return tileData;
    }
    return false;
};

//New Renderer layer for item
RL.RendererLayer.Types.item = {
    merge: true,
    cancelTileDrawWhenNotFound: true,
    getTileData: function(x,y,prevTileData) {
        if (!this.game) {
            return false;
        };
        var item = this.game.itemManager.get(x,y);
        if (item) {
            return item.getTileDrawData();
        };
        return false;
    }
};

//New type of renderer layer for hud
RL.RendererLayer.Types.hud = {
    merge: true,
    cancelTileDrawWhenNotFound: true,
    getTileData: function(x,y) {
        if (!this.game) {
            return false;
        };
        var tile = this.game.hudMap.get(x,y);
        if (!tile.explored) {
            return false;
        };
        var tileData = tile.getTileDrawData();
        return tileData;
    }
};

var game = new RL.Game();

//adding dungeon to game
console.log('Adding dungeon to game');
var dungeonW = 5;
var dungeonH = 4;
var roomW = 15;
var roomH = 9;
game.dungeon = new Dungeon(game,dungeonW,dungeonH,roomW,roomH);
game.dungeon.generate(0,0);

//add hud
game.hudMap = new RL.Map(game);
game.hudMap.setSize(roomW,dungeonH+1);
for ( var x=0; x<game.hudMap.width; x++ ) {
    for ( var y=0; y<game.hudMap.height; y++ ) {
        game.hudMap.set(x,y,'hud');
    };
};

game.hudRenderer = new RL.Renderer(game,game.hudMap.width,game.hudMap.height,'hud');

game.hudRenderer.layers = [ new RL.RendererLayer(game, 'hud', {draw: true}) ];

//set up the renderer
var rendererWidth  = roomW;
var rendererHeight = roomH;

game.renderer.resize(rendererWidth, rendererHeight);

game.renderer.layers = [
    new RL.RendererLayer(game, 'map', {draw: false, mergeWithPrevLayer: false}),
    new RL.RendererLayer(game, 'item', {draw: false, mergeWithPrevLayer: true}),
    new RL.RendererLayer(game, 'entity', {draw: true, mergeWithPrevLayer: true})
];

var keyBindings = {
    up: ['UP_ARROW'],
    down: ['DOWN_ARROW'],
    left: ['LEFT_ARROW'],
    right: ['RIGHT_ARROW'],
    placeBomb: ['B']
};
game.input.addBindings(keyBindings);

var startRoomX = 0
var startRoomY = 0
var startRoom = game.dungeon.rooms.get(0,0);
var playerStartX = 0
var playerStartY = 0
while ( startRoom.map.get(playerStartX,playerStartY).type !== 'floor' ||
        startRoom.itemManager.get(playerStartX,playerStartY) ) {
    playerStartX = Math.floor(Math.random()*startRoom.width);
    playerStartY = Math.floor(Math.random()*startRoom.height);
};
game.player.x = playerStartX;
game.player.y = playerStartY;
game.player.room = startRoom;

//set up map
var mapContainerEl = document.getElementById('map-container');
var consoleContainerEl = document.getElementById('console-container');
var hudContainerEl = document.getElementById('hud-container');

mapContainerEl.appendChild(game.renderer.canvas);
hudContainerEl.appendChild(game.hudRenderer.canvas);
consoleContainerEl.appendChild(game.console.el);

game.start();
