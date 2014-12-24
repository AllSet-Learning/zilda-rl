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
            this.minimapRenderer.draw();
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
    this.minimap.get(playerRoom.x,playerRoom.y).color = "yellow";
    this.minimapRenderer.draw();
};

//make tiles bigger for Hanzi readability
RL.Renderer.prototype.tileSize = 32;
//make tiles explored by default
RL.Tile.prototype.explored = true;

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


var game = new RL.Game();

//adding dungeon to game
console.log('Adding dungeon to game');
var dungeonW = 5;
var dungeonH = 4;
var roomW = 14;
var roomH = 9;
game.dungeon = new Dungeon(game,dungeonW,dungeonH,roomW,roomH);
game.dungeon.generate(0,0);
game.map = game.dungeon.rooms.get(0,0).map;
game.entityManager = game.dungeon.rooms.get(0,0).entityManager;

//add minimap
game.minimap = new RL.Map(game);
game.minimap.setSize(dungeonW,dungeonH);
for ( var x=0; x<game.minimap.width; x++ ) {
    for ( var y=0; y<game.minimap.height; y++ ) {
        game.minimap.set(x,y,'minimapRoom');
    };
};
game.minimapRenderer = new RL.Renderer(game,dungeonW,dungeonH,'minimap');
RL.RendererLayer.Types.minimap = {
  merge: true,
    cancelTileDrawWhenNotFound: true,
    getTileData: function(x,y) {
        if (!this.game) {
            return false;
        };
        var tile = this.game.minimap.get(x,y);
        var tileData = tile.getTileDrawData();
        return tileData;
    }
};
game.minimapRenderer.layers = [ new RL.RendererLayer(game, 'minimap', {draw: true}) ];

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
//var startingRoom = game.getRoom(game.player.x, game.player.y)
//game.renderer.setCenter(startingRoom.centerX, startingRoom.centerY)

//set up map
var mapContainerEl = document.getElementById('map-container');
var consoleContainerEl = document.getElementById('console-container');
var minimapContainerEl = document.getElementById('minimap-container');

mapContainerEl.appendChild(game.renderer.canvas);
minimapContainerEl.appendChild(game.minimapRenderer.canvas);
consoleContainerEl.appendChild(game.console.el);

game.start();
