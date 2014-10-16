(function(root) {
    'use strict';

    /**
    * Represents an entity in the game. Usually a character or enemy.
    * Manages state (position, health, stats, etc)
    * Occupies a single game map tile.
    * @class Entity
    * @constructor
    * @param {Game} game - Game instance this obj is attached to.
    * @param {String} type - Type of entity. When created this object is merged with the value of Entity.Types[type].
    */
    var Entity = function Entity(game, type) {
        this.game = game;
        this.type = type;
        var typeData = Entity.Types[type];
        if(!typeData){
            throw new Error('EntityType "' + type + '" not found.');
        }
        for(var key in typeData){
            this[key] = typeData[key];
        }

        if(this.initialize){
            this.initialize();
        }
    };

    Entity.prototype = {
        constructor: Entity,

        /**
        * Game instance this object is attached to.
        * @property game
        * @type Game
        */
        game: null,

        /**
        * The type of entity this is.
        * When created this object is merged with the value of Entity.Types[type].
        * @property type
        * @type String
        */
        type: null,

        /**
        * Called when the entity is first created. Intended to be assigned by Entity.Types.
        * @method initialize
        */
        initialize: function(){

        },

        /**
        * Name used when referencing or describing this entity.
        * Used in console messages.
        * @property name
        * @type String
        */
        name: null,

        /**
        * The x map tile coord of this entity.
        * @property x
        * @type Number
        */
        x: null,

        /**
        * The y map tile coord of this entity.
        * @property y
        * @type Number
        */
        y: null,

        /**
        * The character displayed when rendering this entity.
        * @property char
        * @type String
        */
        char: 'x',

        /**
        * The color of the character displayed when rendering this entity. Not rendered if false.
        * @property color
        * @type String|bool
        */
        color: '#fff',

        /**
        * The background color the character displayed when rendering this entity. Not rendered if false.
        * @property bgColor
        * @type String|bool
        */
        bgColor: false,

        /**
        * Determines if this entity has been killed and needs to be removed.
        * @property dead
        * @type bool
        */
        dead: false,

        /**
        * Determines if this entity can be pushed by the player.
        * @property pushable
        * @type bool
        */
        pushable: false,

        /**
        * Called after a player action has been resolved. Resolves this entities turn.
        * @method update
        */
        update: function() {

        },

        /**
        * Checks if an entity can move through a map tile.
        * Convenience method for this.game.canMoveThrough()
        * @method canMoveThrough
        * @param {Number} x - The tile map x coord to check if this entity can move to.
        * @param {Number} y - The tile map y coord to check if this entity can move to.
        * @return {Bool}
        */
        canMoveThrough: function(x, y){
            return this.game.entityCanMoveTo(this, x, y);
        },

        /**
        * Checks if an entity can move through and into a map tile and that tile is un-occupied.
        * Convenience method for this.game.entityCanMoveTo()
        * @method canMoveTo
        * @param {Number} x - The tile map x coord to check if this entity can move to.
        * @param {Number} y - The tile map y coord to check if this entity can move to.
        * @return {Bool}
        */
        canMoveTo: function(x, y){
            return this.game.entityCanMoveTo(this, x, y);
        },

        /**
        * Changes the position of this entity on the map.
        * Convenience method for this.game.entityMoveTo()
        * this.canMoveTo() and/or this.canMoveThrough() should always be checked before calling this.moveTo()
        * @method moveTo
        * @param {Number} x - The tile map x coord to move to.
        * @param {Number} y - The tile map y coord to move to.
        */
        moveTo: function(x, y) {
            return this.game.entityMoveTo(this, x, y);
        },

        /**
        * Checks if a map tile can be seen through.
        * Convenience method for this.game.entityCanSeeThrough()
        * @method canSeeThrough
        * @param {Number} x - The x map tile coord to check.
        * @param {Number} y - The y map tile coord to check.
        * @return {Bool}
        */
        canSeeThrough: function(x, y){
            return this.game.entityCanSeeThrough(this, x, y);
        },

        /**
        * Handles the behavior of a player or other entity attempting to move into the tile coord this entity is currently occupying.
        * @method bump
        * @param {Entity} entity - The player or entity attemplting to move into this entity's tile.
        */
        bump: function(entity){
            // if this entity can be pushed and the pushing entity is the player
            if(this.pushable && entity === this.game.player){
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

    /**
    * Describes different types of entities. Used by the Entity constructor 'type' param.
    *
    *     Entity.Types = {
    *         zombie: {
    *            name: 'Zombie',
    *            char: 'z',
    *            color: 'red',
    *            bgColor: '#222',
    *            pushable: false
    *         },
    *         // ...
    *     }
    *
    * @class Entity.Types
    * @static
    */
    Entity.Types = {
        zombie: {
            name: 'Zombie',
            char: '☃',
            color: 'red',
            bgColor: false,
			bump: function(entity){
				// if bumping entity is the player
				if(entity === this.game.player){
					// @TODO combat logic here
					this.game.console.log('You killed Zombie');
					this.dead = true;
					return true;
				}
				return false;
			}
        },
		next: {
			name: 'next',
			char: ',',
			color: 'white',
			bgColor: false,
			pushable: false
		},
        statue: {
            name: 'Statue',
            char: '♞',
            color: '#808080',
            bgColor: '#222',
            pushable: true
        },
        zhong: {
        	name: 'Zhong',
        	char: '中',
        	color: 'blue',
        	bgColor: '#222',
        	pushable: true
        },
        wen: {
        	name: 'Wen',
        	char: '文',
        	color: 'blue',
        	bgColor: '#222',
        	pushable: true
        },
        first: {
        	name: 'first',
        	char: '一',
        	color: 'blue',
        	bgColor: '#222',
        	pushable: true
        },
        second: {
        	name: 'second',
        	char: '二',
        	color: 'blue',
        	bgColor: '#222',
        	pushable: true
        },
        third: {
        	name: 'third',
        	char: '三',
        	color: 'blue',
        	bgColor: '#222',
        	pushable: true
        },
        fourth: {
        	name: 'fourth',
        	char: '四',
        	color: 'blue',
        	bgColor: '#222',
        	pushable: true
        },
        flee: {
			name: 'flee',
			char: 'f',
			color: 'red',
			bgColor: false,
			pushable: false,
			currentDirection: 'right',
			light_r: 100,
			light_g: 100,
			light_b: 255,

			initialize: function(){

			},

			/**
			* Gets the adjustment coord from a direction string.
			* @method directionToAdjustCoord
			* @param {String} direction - The current direction.
			* @return {Object} {x: 0, y: 0}
			*/
			directionToAdjustCoord: function(direction){
				var directionCoords = {
					up:     {x: 0, y:-1},
					right:  {x: 1, y: 0},
					down:   {x: 0, y: 1},
					left:   {x:-1, y: 0}
				};
				return directionCoords[direction];
			},

			/**
			* Gets the next direction in the list
			* @method getNextDirection
			* @param {String} direction - The current direction.
			* @return {String}
			*/
			getNextDirection: function(currentDirection){
				var directions = ['up', 'right', 'down', 'left'],
					currentDirIndex = directions.indexOf(currentDirection),
					newDirIndex;
				// if currentDirection is not valid or is the last in the array use the first direction in the array
				if(currentDirIndex === -1 || currentDirIndex === directions.length - 1){
					newDirIndex = 0;
				} else {
					newDirIndex = currentDirIndex + 1;
				}
				return directions[newDirIndex];
			},

			/**
			* Called every turn by the entityManger (entity turns are triggered after player actions are complete)
			* @method update
			*/
			update: function(){
				var startDir = this.currentDirection,
					currentDir = this.currentDirection;

				var i = 0;
				while(i < 6){
					i++;
					var currentDirAdjustCoords = this.directionToAdjustCoord(currentDir),
						targetX = this.x + currentDirAdjustCoords.x,
						targetY = this.y + currentDirAdjustCoords.y;

					if(this.canMoveTo(targetX, targetY)){
						this.currentDirection = currentDir;
						this.moveTo(targetX, targetY);
						return;
					}
					currentDir = this.getNextDirection(currentDir);
					// give up if all directions attempted
					if(currentDir === startDir){
						return false;
					}
				}
			},

			/**
			* Changes the position of this entity on the map.
			* @method moveTo
			* @param {Number} x - The tile map x coord to move to.
			* @param {Number} y - The tile map y coord to move to.
			*/
			moveTo: function(x, y) {
				// remove light from current position
				if(this.game.lighting.get(this.x, this.y)){
					this.game.lighting.remove(this.x, this.y);
				}
				// add to new position
				this.game.lighting.set(x, y, this.light_r, this.light_g, this.light_b);

				// coppied from Entity.prototype.moveTo()
				this.game.entityManager.move(x, y, this);
				var tile = this.game.map.get(x, y);
				if(tile){
					tile.onEntityEnter(this);
				}
			}
        }
    };

    root.RL.Entity = Entity;

}(this));
