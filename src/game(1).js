(function() {
    'use strict';

    var proto = RL.Game.prototype;

    var NewGame = function Game(){
        proto.constructor.call(this);
        this.items = new RL.Array2d();
        this.furnitureManager = new RL.MultiObjectManager(this, RL.Furniture);
        this.itemManager = new RL.ObjectManager(this, RL.Item);
        this.smashLayer = new RL.Array2d();
    };

    var newGamePrototype = {
        constructor: NewGame,

        itemManager: null,

        furnitureManager: null,

        queueRender: false,
        setMapSize: function(width, height){
            proto.setMapSize.call(this, width, height);
            this.itemManager.setSize(width, height);
            this.furnitureManager.setSize(width, height);
            this.smashLayer.setSize(width, height);
        },

        entityCanMoveThrough: function(entity, x, y, ignoreFurniture){
            ignoreFurniture = ignoreFurniture !== void 0 ? ignoreFurniture : false;
            if(!ignoreFurniture){
                var furniture = this.furnitureManager.getFirst(x, y, function(furniture){
                    return !furniture.passable;
                });
                if(furniture){
                    return false;
                }
            }

            return proto.entityCanMoveThrough.call(this, entity, x, y);
        },

        /**
        * Checks if an entity can move through and into a map tile and that tile is un-occupied.
        * @method entityCanMoveTo
        * @param {Entity} entity - The entity to check.
        * @param {Number} x - The x map tile coord to check.
        * @param {Number} y - The y map tile coord to check.
        * @return {Bool}
        */
        entityCanMoveTo: function(entity, x, y, ignoreFurniture){
            if(!this.entityCanMoveThrough(entity, x, y, ignoreFurniture)){
                return false;
            }
            // check if occupied by entity
            if(this.entityManager.get(x, y)){
                return false;
            }
            return true;
        },
        entityMoveTo: function(entity, x, y){
            var hpRatio = entity.hp / entity.hpMax;
            var bleedChance = ( 1 - hpRatio) * 0.5;
            if(hpRatio < 1 && Math.random() < bleedChance){
                this.map.get(entity.x, entity.y).blood += bleedChance * 0.5;
            }
            proto.entityMoveTo.call(this, entity, x, y);
            var item = this.itemManager.get(x, y);
            if(item && item.canAttachTo(entity)){
                item.attachTo(entity);
                this.itemManager.remove(item);
            }
        },

        entityCanSeeThrough: function(entity, x, y){
            var tile = this.map.get(x, y);
            if(!tile || tile.blocksLos){
                return false;
            }
            var furniture = this.furnitureManager.getFirst(x, y, function(furniture){
                return furniture.blocksLos;
            });

            if(furniture){
                return false;
            }
            return true;
        },

        getObjectsAtPostion: function(x, y){
            var result = [];

            var entity = this.entityManager.get(x, y);
            if(entity){
                result.push(entity);
            }
            var furniture = this.furnitureManager.get(x, y);
            if(furniture){
                result = result.concat(furniture);
            }
            var item = this.itemManager.get(x, y);
            if(item){
                result.push(item);
            }
            return result;
        },

        onClick: function(x, y){

            var coords = this.renderer.mouseToTileCoords(x, y),
                tile = this.map.get(coords.x, coords.y);
            if(!tile){
                return;
            }

            console.log('click', tile.x, tile.y);

            if(!this.player.fov.get(tile.x, tile.y)){
                return;
            }

            this.console.logTileInspect(tile, this.getObjectsAtPostion(tile.x, tile.y));
        },

        resolveAttack: function(source, weapon, target){

            var targetIsFurniture = target instanceof RL.Furniture;
            var damage = weapon.damage;
            if(targetIsFurniture && source.hordePushBonus){
                damage += source.hordePushBonus;
                source.hordePushBonus = 0;
            }
            target.takeDamage(damage);

            weapon = {
                name: weapon.name,
                damage: damage
            };
            this.console.logAttack(source, weapon, target);

            var smash = {
                source: source,
                target: target,
                targetX: target.x,
                targetY: target.y,
                sourceX: source.x,
                sourceY: source.y
            };
            this.smashLayer.set(source.x, source.y, smash);

            if(target === this.player || target instanceof RL.Entity){
                var splatter = damage / 10;
                if(target.dead){
                    splatter *= 1.5;
                }
                this.splatter(target.x, target.y, splatter);
            }

            return true;
        },

        onHover: function(){

        },

        splatter: function(x, y, amount){
            var tile = this.map.get(x, y);
            tile.blood += amount;
            var adj = this.map.getAdjacent(x, y);
            for(var i = adj.length - 1; i >= 0; i--){
                var a = adj[i];
                a.blood += Math.random() * amount;
            }
        },
    };

    RL.Util.merge(NewGame.prototype, proto);
    RL.Util.merge(NewGame.prototype, newGamePrototype);

    RL.Game = NewGame;

}());
