(function(root) {
    'use strict';

    var overlay = function(c1, c2){
        var out = c1.slice();
        for (var i = 0; i < 3; i++) {
            var a = c1[i],
                b = c2[i];
            if(b < 128){
                out[i] = Math.round(2 * a * b / 255);
            } else {
                out[i] = Math.round(255 - 2 * (255 - a) * (255 - b) / 255);
            }
        }
        return out;
    };

    var getTileDrawData = RL.Tile.prototype.getTileDrawData;
    var extendedTile = {

        blood: 0,
        maxBlood: 0.7,

        charBloodIntensity: 1.4,
        bgBloodIntensity: 0.5,
        _cachedBlood: null,
        _cachedTileData: null,
        getConsoleName: function(){
            return {
                name: this.name,
                color: this.consoleColor
            };
        },
    };

    RL.Util.merge(root.RL.Tile.prototype, extendedTile);


    root.RL.Tile.Types.exit = {
            name: 'Exit',
            char: 'X',
            color: RL.Util.COLORS.red,
            consoleColor: RL.Util.COLORS.red_alt,
            charStrokeColor: '#000',
            charStrokeWidth: 2,
            passable: true,
            blocksLos: false,
            onEntityEnter: function(entity){
                this.game.console.logExit(entity);
                this.game.gameOver = true;
            }
        };

}(this));
