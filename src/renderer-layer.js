/**
 *
 * // return true if should draw
 * checkTile(x, y)
 * getTileData(x, y)
 * prepareTileData(obj, x, y)
 *
 *
 *
 * layers
 *
 *
 *
 *  explored (continue if not explored)
 *
 *  loop
 *      entities
 *          tile filters (lighting, hovered)
 *      items
 *          tile filters (lighting, hovered)
 *
 *      fov (shadow)
 *
 *
 */
(function(root) {
    'use strict';

    /**
    * Represents a map tile layer to be rendered.
    * @class RendererLayer
    * @constructor
    * @param {Game} game - Game instance this obj is attached to.
    * @param {String} type - Type of `RendererLayer`. When created this object is merged with the value of `RendererLayer.Types[type]`.
    */
    var RendererLayer = function RendererLayer(game, type, settings) {
        this.game = game;
        this.type = type;
        var typeData = RendererLayer.Types[type];
        RL.Util.merge(this, typeData);

        for(var key in settings){
            if(this[key] !== void 0){
                this[key] = settings[key];
            }
        }
    };

    RendererLayer.prototype = {
        constructor: RendererLayer,

        /**
        * Game instance this obj is attached to.
        * @property game
        * @type Game
        */
        game: null,

        /**
        * The type of `RendererLayer` this is.
        * When created this object is merged with the value of `RendererLayer.Types[type]`. See constructor.
        * @property type
        * @type {String}
        */
        type: null,

        /**
         * If true, `this.getTileData()` will merge the `tileData` it would otherwise return with the `prevTileData` param (if provided).
         * objects are  from this layer should be merged with layers below before drawing.
         * @property mergeWithPrevLayer
         * @type {Boolean}
         */
        mergeWithPrevLayer: false,

        /**
         * If true, when `this.getTileData(x, y)` returns a value that evaluates to false, all tile layers above this one are not drawn by the `Renderer` for this map tile coord.
         * @property cancelTileDrawWhenNotFound
         * @type {Boolean}
         */
        cancelTileDrawWhenNotFound: false,

        /**
         * If true, `tileData` is drawn to the canvas after processing this layer.
         * @type {Boolean}
         */
        draw: false,

        /**
         * Before draw function. Ignored if `this.draw = false`.
         * @type {Function} `function(x, y, tileData, ctx){}`
         */
        beforeDraw: false,

        /**
         * After draw function. Ignored if `this.draw = false`.
         * @type {Function} `function(x, y, tileData, ctx){}`
         */
        afterDraw: false,

        /**
         * Get layer's `tileData` for a given map tile coord.
         * @method getModifiedTileData
         * @param {Number} x - Map tile x coord.
         * @param {Object} y - Map tile y coord.
         * @param {Object} [prevTileData] - `tileData` object for the given map tile coord from previous layer.
         * @return {Object|Bool} false if nothing to render
         */
        getTileData: function(x, y, prevTileData){
            return false;
        },

        /**
         * Get layer's `tileData` for a given map tile coord.
         * Optionally modifying the `prevTileData` object param if `this.mergeWithPrevLayer = true`.
         * @method getModifiedTileData
         * @param {Number} x - Map tile x coord.
         * @param {Object} y - Map tile y coord.
         * @param {Object} [prevTileData] - `tileData` object for the given map tile coord from previous layer.
         * @return {Object|Bool} false if nothing to render
         */
        getModifiedTileData: function(x, y, prevTileData){
            var tileData = this.getTileData(x, y, prevTileData);
            if(this.mergeWithPrevLayer && prevTileData){
                return this.mergeTileData(prevTileData, tileData);
            }
            return tileData;
        },

        /**
         * Merges 2 `tileData` objects.
         * Used to Merges layers of the same tile before drawing them.
         * @method mergeTileData
         * @param {Object} tileData1 - `tileData` to merge to.
         * @param {Object} tileData2 - `tileData` to merge from, properties with values on tileData2 replace matching properties on tileData1
         * @return {Object} A new `tileData` object with merged values.
         */
        mergeTileData: function(tileData1, tileData2){
            var result = {},
                key, val;
            for(key in tileData1){
                result[key] = tileData1[key];
            }
            for(key in tileData2){
                val = tileData2[key];
                if(val !== false && val !== void 0){
                    result[key] = val;
                }
            }
            return result;
        },
    };

    /**
    * Describes different types of `RendererLayer`. Used by the `RendererLayer` constructor `type` param.
    *
    *     RendererLayer.Types = {
    *
    *         // ...
    *     }
    *
    * @class RendererLayer.Types
    * @static
    */
    RendererLayer.Types = {
        map: {
            merge: true,
            cancelTileDrawWhenNotFound: true,
            // draw: true,
            getTileData: function(x, y){

                if(!this.game){
                    return false;
                }

                var tile = this.game.map.get(x, y);

                if(!tile || !tile.explored){
                    return false;
                }

                var tileData = tile.getTileDrawData();

                if(tile.type === 'portal'){
                    console.log('z', tileData, this.game.portal);
                }
                var targets = this.game.player.actionTargets;
                if(targets){

                    var borderColor = 'rgba(0, 200, 0, 0.5)',
                        borderColorSelected = 'rgba(0, 200, 0, 0.85)';
                    var current = targets.getCurrent();
                    var find = function(x, y, list){
                        for(var i = list.length - 1; i >= 0; i--){
                            var item = list[i];
                            if(item.x === x && item.y === y){
                                return true;
                            }
                        }
                        return false;
                    };

                    if(current && current.x === x && current.y === y){
                        if(targets.ignoreCurrent){
                            tileData.borderColor = borderColor;
                        } else {
                            tileData.borderColor = borderColorSelected;
                        }

                        tileData.borderWidth = 2;
                    }

                    else if(find(x, y, targets.targets)){
                        tileData.borderColor = borderColor;
                        tileData.borderWidth = 2;
                    }
                }
                return tileData;
            }
        },
        furniture: {
            mergeWithPrevLayer: true,
            // draw: true,
            getTileData: function(x, y, prevTileData){
                if(!this.game){
                    return false;
                }

                var furniture = this.game.furnitureManager.get(x, y);

                if(furniture.length){
                    return furniture[furniture.length - 1].getTileDrawData();
                }
                return false;
            }
        },
        item: {
            mergeWithPrevLayer: true,
            getTileData: function(x, y, prevTileData){
                if(!this.game){
                    return false;
                }
                var item = this.game.itemManager.get(x, y);
                if(item){
                    return item.getTileDrawData();
                }
                return false;
            }
        },
        entity: {
            mergeWithPrevLayer: true,
            getTileData: function(x, y, prevTileData){
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
                    if(entity && entity.dead){
                        entity = false;
                    }
                }

                if(
                    this.game.player &&
                    this.game.player.fov &&
                    !this.game.player.fov.get(x, y)
                ){
                    return false;
                }

                if(entity){

                    var tileData = entity.getTileDrawData();
                    var rangedAttackTargets = this.game.player.rangedAttackTargets;
                    if(rangedAttackTargets){
                        var borderColor = 'rgba(0, 200, 0, 0.5)',
                            borderColorSelected = 'rgba(0, 200, 0, 0.85)';
                        var current = rangedAttackTargets.getCurrent();

                        if(current && current.value === entity){

                            tileData.borderColor = borderColorSelected;
                            tileData.borderWidth = 2;
                        }

                        else if(rangedAttackTargets.contains(entity)){

                            tileData.borderColor = 'red';
                            tileData.borderWidth = 2;
                        }
                    }

                    var smash = this.game.smashLayer.get(x, y);
                    if(smash){
                        var offsetX = (smash.targetX - smash.sourceX) * 0.5;
                        var offsetY = (smash.targetY - smash.sourceY) * 0.5;
                        tileData.smash = {
                            mask: true,
                            // x: smash.sourceX,
                            // y: smash.sourceY,
                            char: '✹',
                            color: 'rgba(255, 255, 255, 0.75)',
                            // color: 'rgba(255, 165, 0, 0)',
                            // fontSize: 30,
                            charStrokeWidth: 0.5,
                            // charStrokeColor: 'rgba(255,255,255,0.9)',
                            // color: 'rgba(255,255,255,0.5)',
                            offsetX: offsetX * this.game.renderer.tileSize,
                            offsetY: offsetY * this.game.renderer.tileSize
                        };
                    }

                    // if(entity.hordePushBonus){
                    //     tileData.char = entity.hordePushBonus;
                    // }

                    return tileData;
                }
                return false;
            }
        },
        lighting: {
            // this layer does mutate the prevTileData but not in the same way as merging
            mergeWithPrevLayer: false,
            draw: true,
            getTileData: function(x, y, prevTileData){
                if(!this.game){
                    return false;
                }
                if(this.game.lighting){
                    prevTileData = this.game.lighting.shadeTile(x, y, prevTileData);
                }
                return prevTileData;
            }
        },
        fov: {
            mergeWithPrevLayer: false,
            draw: true,
            beforeDraw: function(x, y, tileData, ctx){
                ctx.globalAlpha = this.game.renderer.nonVisibleTileAlpha;
            },
            afterDraw: function(x, y, tileData, ctx){
                ctx.globalAlpha = 1;
            },
            getTileData: function(x, y, prevTileData){
                if(!this.game){
                    return false;
                }
                if(
                    this.game.player &&
                    this.game.player.fov &&
                    this.game.player.fov.get(x, y)
                ){
                    return false;
                }

                return {
                    bgColor: this.game.renderer.bgColor
                };

            }
        },
        smash: {
            mergeWithPrevLayer: false,
            draw: true,
            // afterDraw: function(x, y, tileData, ctx){
            //     ctx.globalCompositeOpperation = 'destination-in';
            //     x -= this.game.renderer.originX;
            //     y -= this.game.renderer.originY;
            //     var tileSize = this.game.renderer.tileSize;
            //     ctx.fillStyle = 'red';
            //     ctx.fillRect(
            //         x * tileSize,
            //         y * tileSize,
            //         tileSize,
            //         tileSize
            //     );
            //     ctx.globalCompositeOpperation = 'source-over';
            // },
            getTileData: function(x, y, prevTileData){
                if(!this.game){
                    return false;
                }

                // change the bg color of the hovered tile
                var smash = this.game.smashLayer.get(x, y);
                if(smash){
                    var offsetX = (smash.targetX - smash.sourceX) * 0.5;
                    var offsetY = (smash.targetY - smash.sourceY) * 0.5;
                    return {
                        mask: true,
                        // x: smash.sourceX,
                        // y: smash.sourceY,
                        char: '✹',
                        color: 'rgba(255, 255, 255, 0.75)',
                        // color: 'rgba(255, 165, 0, 0)',
                        // fontSize: 30,
                        charStrokeWidth: 0.5,
                        // charStrokeColor: 'rgba(255,255,255,0.9)',
                        // color: 'rgba(255,255,255,0.5)',
                        offsetX: offsetX * this.game.renderer.tileSize,
                        offsetY: offsetY * this.game.renderer.tileSize
                    };
                }
                return false;
            }
        },

        hover: {
            mergeWithPrevLayer: true,
            draw: true,
            getTileData: function(x, y, prevTileData){
                if(!this.game){
                    return false;
                }
                // change the bg color of the hovered tile
                if(x == this.game.renderer.hoveredTileX && y == this.game.renderer.hoveredTileY){
                    return {
                        borderColor: 'green'
                    };
                }
                return false;
            }
        }
    };

    root.RL.RendererLayer = RendererLayer;

}(this));