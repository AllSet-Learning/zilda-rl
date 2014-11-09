(function(root) {
    'use strict';

    var proto = root.RL.Player.prototype;

    var NewPlayer = function Player(game){
        proto.constructor.call(this, game);

        this.meleeWeapon = new RL.Item(this.game, 'fists');
        this.rangedWeapon = new RL.Item(this.game, 'pistol');

        RL.Actions.Performable.add(this, 'open');
        RL.Actions.Performable.add(this, 'close');
        RL.Actions.Performable.add(this, 'grab');
        RL.Actions.Performable.add(this, 'push');
        RL.Actions.Performable.add(this, 'melee_attack');
        RL.Actions.Performable.add(this, 'ranged_attack');

    };

    var newPlayerPrototype = {
        constructor: NewPlayer,

        name: 'You',

        fovMaxViewDistance: 20,
        charStrokeColor: '#000',
        consoleColor: '#00a185',
        charStrokeWidth: 3,
        hp: 20,
        hpMax: 20,

        meleeWeapon: null,
        rangedWeapon: null,

        hpEl: null,
        hpMaxEl: null,
        meleeWeaponEl: null,
        rangedWeaponEl: null,

        pendingAction: false,

        bleeds: true,

        update: function(action) {
            this.renderHtml();

            if(this.pendingAction){
                return this.pendingAction(action);
            }

            var isMoveDirection = RL.Util.DIRECTIONS.indexOf(action) !== -1;
            if(isMoveDirection){
                var moveOffsetCoord = RL.Util.getOffsetCoordsFromDirection(action),
                    moveToX = this.x + moveOffsetCoord.x,
                    moveToY = this.y + moveOffsetCoord.y;
                return this.move(moveToX, moveToY, moveOffsetCoord);
            }

            if(action === 'wait'){
                return this.wait();
            }

            if(action === 'grab'){
                return this.grab();
            }

            if(action === 'close'){
                return this.close();
            }

            if(action === 'open'){
                return this.open();
            }

            if(action === 'ranged_attack'){
                return this.rangedAttack();
            }
            return false;
        },

        // action
        move: function(x, y, offset){

            if(this.canMoveTo(x, y)){

                // move grab target or let go
                if(this.grabTarget){
                    var grabTargetToX = this.grabTarget.x + offset.x,
                        grabTargetToY = this.grabTarget.y + offset.y,
                        pullingToPlayer = (this.x === grabTargetToX && this.y === grabTargetToY);

                    if(pullingToPlayer || this.grabTarget.canMoveTo(grabTargetToX, grabTargetToY)){
                        this.grabTarget.moveTo(grabTargetToX, grabTargetToY);
                    } else {
                        this.game.console.logGrabLetGo(this, this.grabTarget);
                        this.grabTarget = false;
                    }
                }
                this.moveTo(x, y);
                return true;

            } else {
                if(this.movePush(x, y)){
                    return true;
                }

                if(this.moveAttack(x, y)){
                    return true;
                }

                if(this.moveOpen(x, y)){
                    return true;
                }
            }
            return false;
        },

        movePush: function(x, y){
            var _this = this;
            var furniture = this.game.furnitureManager.getFirst(x, y, function(furniture){
                return _this.canPerformActionOnTarget('push', furniture);
            });
            // console.log(furniture, furniture.canResolveAction('push', this));
            if(!furniture){
                return false;
            }
            return this.performAction('push', furniture);
        },

        moveAttack: function(x, y){
            var entity = this.game.entityManager.get(x, y);
            if(!entity){
                return false;
            }
            return this.performAction('melee_attack', entity);
        },

        moveOpen: function(x, y){
            var _this = this;
            var furniture = this.game.furnitureManager.getFirst(x, y, function(furniture){
                return _this.canPerformAction('open', furniture);
            });

            if(!furniture){
                return false;
            }
            return this.performAction('open', furniture);
        },

        // action
        wait: function(){
            this.game.console.logWait(this);
            return true;
        },

        // action
        grab: function(){
            this.pendingActionName = 'grab';
            return this.actionAdjacentTargetSelect('grab');
        },


        // action
        close: function(){
            this.pendingActionName = 'close';
            return this.actionAdjacentTargetSelect('close');
        },

        // action
        open: function(){
            this.pendingActionName = 'open';
            return this.actionAdjacentTargetSelect('open');
        },

        actionAdjacentTargetSelect: function(action){
            var targets = this.getTargetsForAction(this.pendingActionName);
            if(!targets.length){
                this.game.console.logNothingTo(this.pendingActionName);
                return false;
            }

            if(targets.length === 1){
                return this.performAction(this.pendingActionName, targets[0].value, this.pendingActionSettings);
            }
            this.actionTargets = new RL.ValidTargets(targets);
            this.actionTargets.ignoreCurrent = true;
            this.game.queueDraw = true;

            this.pendingAction = this.actionAdjacentDirectionTargetSelect;
            this.game.console.logChooseDirection(this.pendingActionName);
            return false;
        },

        // pending action
        actionAdjacentDirectionTargetSelect: function(action){
            this.pendingAction = false;
            var isMoveDirection = RL.Util.DIRECTIONS.indexOf(action) !== -1;
            if(!isMoveDirection){
                this.actionTargets = false;
                return false;
            }

            var pendingActionName = this.pendingActionName;

            var _this = this;
            var moveOffsetCoord = RL.Util.getOffsetCoordsFromDirection(action),
                moveToX = this.x + moveOffsetCoord.x,
                moveToY = this.y + moveOffsetCoord.y,
                objects = this.game.getObjectsAtPostion(moveToX, moveToY, function(obj){
                    return _this.canPerformAction(pendingActionName, obj);
                })
                // needs to be the same format as RL.ValidTargetsFinder.getValidTargets();
                .map(function(obj){
                    return {
                        x: obj.x,
                        y: obj.y,
                        range: 1,
                        value: obj
                    };
                });

            if(!objects.length){
                this.game.console.logNothingTo(pendingActionName);
                this.actionTargets = false;
                return false;
            }

            if(objects.length === 1){
                this.actionTargets = false;
                return this.performAction(pendingActionName, objects[0]);
            }

            this.actionTargets = new RL.ValidTargets(objects);
            this.pendingAction = this.actionTargetSelect;
            this.game.console.logMultipleActionTargetsFound(pendingActionName);
            this.game.console.logSelectActionTarget(pendingActionName, this.actionTargets.getCurrent().value);
            return false;
        },

        // pending action
        actionTargetSelect: function(action){
            this.actionTargets.ignoreCurrent = false;
            if(
                action === 'prev_target' ||
                action === 'left' ||
                action === 'down'
            ){

                this.game.queueDraw = true;
                this.actionTargets.prev();
                this.game.console.logSelectActionTarget(this.pendingActionName, this.actionTargets.getCurrent().value);
                return false;
            }

            if(
                action === 'next_target' ||
                action === 'right' ||
                action === 'up'
            ){
                this.game.queueDraw = true;
                this.actionTargets.next();
                this.game.console.logSelectActionTarget(this.pendingActionName, this.actionTargets.getCurrent().value);
                return false;
            }

            if(action === this.pendingActionName || action === 'select'){
                var target = this.actionTargets.getCurrent().value;
                this.performAction(this.pendingActionName, target, this.pendingActionSettings);
                this.actionTargets = false;
                this.pendingAction = false;
                this.pendingActionName = false;
                this.pendingActionSettings = false;
                return true;
            }
        },
        rangedAttack: function(){
            this.pendingActionName = 'ranged_attack';

            var targets = this.getTargetsForAction(this.pendingActionName);
            console.log('targets', targets);
            if(!targets.length){
                this.game.console.logNothingTo(this.pendingActionName);
                return false;
            }

            if(targets.length === 1){
                return this.performAction(this.pendingActionName, targets[0].value, this.pendingActionSettings);
            }
            this.actionTargets = new RL.ValidTargets(targets);
            this.game.queueDraw = true;
            this.pendingAction = this.actionTargetSelect;

            return false;
        },

        takeDamage: function(amount, source) {
            if(this.game.gameOver){
                return;
            }
            this.hp -= amount;
            var killed = this.hp <= 0;

            if (killed) {
                this.color = 'red';
                this.game.gameOver = true;
                this.game.console.logDied(this);

            }
        },

        heal: function(amount){
            this.hp += amount;
            if(this.hp > this.hpMax){
                this.hp = this.hpMax;
            }
        },

        renderHtml: function(){
            // this.hpEl.innerHTML = this.hp;
            // this.hpMaxEl.innerHTML = this.hpMax;
            // if(this.meleeWeaponNameEl){
            //     var meleeWeaponConsoleName = this.meleeWeapon.getConsoleName();
            //     this.meleeWeaponNameEl.innerHTML = meleeWeaponConsoleName.name;
            //     this.meleeWeaponStatsEl.innerHTML = meleeWeaponConsoleName.stats;
            // }
            // if(this.rangedWeapon){
            //     var rangedWeaponConsoleName = this.rangedWeapon.getConsoleName();
            //     this.rangedWeaponNameEl.innerHTML = rangedWeaponConsoleName.name;
            //     this.rangedWeaponStatsEl.innerHTML = rangedWeaponConsoleName.stats;
            // }
        },

        moveTo: function(x, y){

            proto.moveTo.call(this, x, y);
        },

        // util
        getConsoleName: function(){
            return {
                name: this.name,
                color: this.consoleColor
            };
        },

        getTileDrawData: function(){
            return RL.Util.getTileDrawData(this);
        },

    };

    var key;
    for (key in proto) {
        NewPlayer.prototype[key] = proto[key];
    }

    for (key in newPlayerPrototype) {
        NewPlayer.prototype[key] = newPlayerPrototype[key];
    }

    root.RL.Player = NewPlayer;

}(this));
