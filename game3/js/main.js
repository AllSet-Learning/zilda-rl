//customize basic game "turn"
RL.Game.prototype.onKeyAction = function(action) {
    if(!this.gameOver){
        var result = this.player.update(action);
        if(result){
            this.entityManager.update(this.player);
            
            //Don't update map the fov or lighting!
            //this.player.updateFov();
            //this.lighting.update();
            
            //center in current room instead of on player
            //this.renderer.setCenter(this.player.x, this.player.y);
            //var room = this.getRoom(this.player.x, this.player.y);
            //this.renderer.setCenter(room.centerX, room.centerY);
            this.renderer.draw();
            this.updateHud();
            this.hudRenderer.draw();
        } else if(this.queueDraw){
            this.renderer.draw();
        }
    }
    this.queueDraw = false;
};

//custom start function
RL.Game.prototype.start = function() {
    this.entityManager.add(this.player.x, this.player.y, this.player);
    this.renderer.setCenter(this.player.x,this.player.y);
    this.renderer.draw();
    
    var playerRoom = this.player.room;
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

    this.hudMap.get(this.dungeon.width+1,1).char  = "$";
    this.hudMap.get(this.dungeon.width+1,1).color = "yellow";
    this.hudMap.get(this.dungeon.width+2,1).char  = "X";
    this.hudMap.get(this.dungeon.width+2,1).color = "white";
    this.hudMap.get(this.dungeon.width+3,1).char  = "0";
    this.hudMap.get(this.dungeon.width+3,1).color = "white";

    this.hudMap.get(this.dungeon.width+1,2).char  = "k";
    this.hudMap.get(this.dungeon.width+1,2).color = "gray";
    this.hudMap.get(this.dungeon.width+2,2).char  = "X";
    this.hudMap.get(this.dungeon.width+2,2).color = "white";
    this.hudMap.get(this.dungeon.width+3,2).char  = "0";
    this.hudMap.get(this.dungeon.width+3,2).color = "white";

    this.hudMap.get(this.dungeon.width+1,3).char  = "b";
    this.hudMap.get(this.dungeon.width+1,3).color = "blue";
    this.hudMap.get(this.dungeon.width+2,3).char  = "X";
    this.hudMap.get(this.dungeon.width+2,3).color = "white";
    this.hudMap.get(this.dungeon.width+3,3).char  = "0";
    this.hudMap.get(this.dungeon.width+3,3).color = "white";

    this.hudMap.get(this.dungeon.width+4,1).char  = "-";
    this.hudMap.get(this.dungeon.width+4,1).color = "red";
    this.hudMap.get(this.dungeon.width+5,1).char  = "L";
    this.hudMap.get(this.dungeon.width+5,1).color = "red";
    this.hudMap.get(this.dungeon.width+6,1).char  = "I";
    this.hudMap.get(this.dungeon.width+6,1).color = "red";
    this.hudMap.get(this.dungeon.width+7,1).char  = "F";
    this.hudMap.get(this.dungeon.width+7,1).color = "red";
    this.hudMap.get(this.dungeon.width+8,1).char  = "E";
    this.hudMap.get(this.dungeon.width+8,1).color = "red";
    this.hudMap.get(this.dungeon.width+9,1).char  = "-";
    this.hudMap.get(this.dungeon.width+9,1).color = "red";

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
    for ( var i=0; i<this.player.maxLife; i++ ) {
        var x=i;
        var y=2;
        while (x>5) { x-=6; };
        x += this.dungeon.width+4;
        if (i>5)  { y=3; };
        if (i>11) { y=4; };
        tile = this.hudMap.get(x,y);
        tile.char = "♥";
        if (i>=this.player.life) {
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
    this.map = toRoom.map;
    this.updateHud();
    this.renderer.draw();
    this.hudRenderer.draw();
    console.log('Player moved from ('+fromRoom.x+','+fromRoom.y + ') to (' + toRoom.x+','+toRoom.y+')');
};

//make tiles bigger for Hanzi readability
RL.Renderer.prototype.tileSize = 32;
//make tiles explored by default
RL.Tile.prototype.explored = true;

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

RL.Player.prototype.takeDamage = function(amount) {
    this.game.console.log('You take <strong>'+amount+'</strong> damage.');
    this.life -= amount;
    if (this.life<0) { this.life=0; };
    if (this.life===0) { this.dead=true; };
};
RL.Player.prototype.heal = function(amount) {
    this.life += amount;
    if (this.life>this.maxLife) { this.life=this.maxLife; };
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
game.map = game.dungeon.rooms.get(0,0).map;
game.entityManager = game.dungeon.rooms.get(0,0).entityManager;

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
    new RL.RendererLayer(game, 'entity', {draw: true, mergeWithPrevLayer: true})
];

var keyBindings = {
    up: ['UP_ARROW'],
    down: ['DOWN_ARROW'],
    left: ['LEFT_ARROW'],
    right: ['RIGHT_ARROW']
};
game.input.addBindings(keyBindings);

var playerStartX = Math.floor(roomW/2);
var playerStartY = Math.floor(roomH/2);

game.player.x = playerStartX;
game.player.y = playerStartY;
game.player.room = game.dungeon.rooms.get(0,0);
game.player.life = 2
game.player.maxLife = 3
//var startingRoom = game.getRoom(game.player.x, game.player.y)
//game.renderer.setCenter(startingRoom.centerX, startingRoom.centerY)

//set up map
var mapContainerEl = document.getElementById('map-container');
var consoleContainerEl = document.getElementById('console-container');
var hudContainerEl = document.getElementById('hud-container');

mapContainerEl.appendChild(game.renderer.canvas);
hudContainerEl.appendChild(game.hudRenderer.canvas);
consoleContainerEl.appendChild(game.console.el);

game.start();
