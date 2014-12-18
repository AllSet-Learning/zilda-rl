(function(root) {
    'use strict';

    var proto = root.RL.Player.prototype;

    var NewPlayer = function Player(game){
        proto.constructor.call(this, game);
        this.meleeWeapon = new RL.Item(this.game, 'radical');
        this.meleeWeapon1 = new RL.Item(this.game, 'radical');
        this.meleeWeapon2 = new RL.Item(this.game, 'radical');
        this.meleeWeapon3 = new RL.Item(this.game, 'radical');
        this.meleeWeapon4 = new RL.Item(this.game, 'radical');
        this.rangedWeapon = new RL.Item(this.game, 'pistol');

        RL.Actions.Performable.add(this, 'open');
        RL.Actions.Performable.add(this, 'close');
        RL.Actions.Performable.add(this, 'grab');
        RL.Actions.Performable.add(this, 'push');
        RL.Actions.Performable.add(this, 'melee_attack');
        RL.Actions.Performable.add(this, 'melee_attack1');
        //RL.Actions.Performable.add(this, 'melee_attack2');
        //RL.Actions.Performable.add(this, 'melee_attack3');
        //RL.Actions.Performable.add(this, 'melee_attack4');
        RL.Actions.Performable.add(this, 'ranged_attack');
        RL.Actions.Resolvable.add(this, 'melee_attack');
        RL.Actions.Resolvable.add(this, 'melee_attack1');
        RL.Actions.Resolvable.add(this, 'melee_attack2');
        RL.Actions.Resolvable.add(this, 'melee_attack3');
        RL.Actions.Resolvable.add(this, 'melee_attack4');

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
        meleeWeapon1: null,
        meleeWeapon2: null,
        meleeWeapon3: null,
        meleeWeapon4: null,
        rangedWeapon: null,

        hpEl: null,
        hpMaxEl: null,
        meleeWeaponEl: null,
        meleeWeaponEl1: null,
        meleeWeaponEl2: null,
        meleeWeaponEl3: null,
        meleeWeaponEl4: null,
        rangedWeaponEl: null,

        pendingAction: false,

        bleeds: true,

        update: function(action) {

            this.renderHtml();
            if(action === 'cancel'){
                this.clearPendingAction();
            }

            if(this.pendingAction){
                return this.pendingAction(action);
            }

            var isMoveDirection = RL.Util.DIRECTIONS_4.indexOf(action) !== -1;
            if(isMoveDirection){
                return this.move(action);
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

            if(action === 'melee_attack'){
                return this.meleeAttack();
            }

            if(action === 'melee_attack1'){
                return this.meleeAttack1();
            }

            if(action === 'melee_attack2'){
                return this.meleeAttack2();
            }

            if(action === 'melee_attack3'){
                return this.meleeAttack3();
            }

            if(action === 'melee_attack4'){
                return this.meleeAttack4();
            }            

            if(action === 'ranged_attack'){
                return this.rangedAttack();
            }
            return false;
        },

        // action
        move: function(direction){
            var offset = RL.Util.getOffsetCoordsFromDirection(direction),
                x = this.x + offset.x,
                y = this.y + offset.y;

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
                return _this.canPerformAction('push', furniture);
            });

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
            if(entity.type === 'character1'){
                return this.performAction('melee_attack1', entity);
            }
            if(entity.type === 'character2'){
                return this.performAction('melee_attack2', entity);
            }
            if(entity.type === 'character3'){
                return this.performAction('melee_attack3', entity);
            }
            if(entity.type === 'character4'){
                return this.performAction('melee_attack4', entity);
            }
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
            if(this.grabTarget){
                return this.performAction('grab', this.grabTarget);
            }
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

        // action

        meleeAttack: function(){
            this.pendingActionName = 'melee_attack';
            return this.actionAdjacentTargetSelect('melee_attack');
        },

        meleeAttack1: function(){
            this.pendingActionName = 'melee_attack1';
            return this.actionAdjacentTargetSelect('melee_attack1');
        },

        meleeAttack2: function(){
            this.pendingActionName = 'melee_attack2';
            return this.actionAdjacentTargetSelect('melee_attack2');
        },

        meleeAttack3: function(){
            this.pendingActionName = 'melee_attack3';
            return this.actionAdjacentTargetSelect('melee_attack3');
        },

        meleeAttack4: function(){
            this.pendingActionName = 'melee_attack4';
            return this.actionAdjacentTargetSelect('melee_attack4');
        },

        // action
        rangedAttack: function(){
            this.pendingActionName = 'ranged_attack';

            var targets = this.getTargetsForAction(this.pendingActionName);
            if(!targets.length){
                this.game.console.logNothingTo(this.pendingActionName);
                return false;
            }

            // uncomment this to auto perform an action when there is only one target
            // if(targets.length === 1){
            //     return this.performAction(this.pendingActionName, targets[0].value, this.pendingActionSettings);
            // }
            this.actionTargets = new RL.ValidTargets(this.game, targets);
            this.game.queueDraw = true;
            this.pendingAction = this.actionTargetSelect;
            this.game.console.directionsSelectActionTarget(this.pendingActionName);
            this.game.console.logSelectActionTarget(this.pendingActionName, this.actionTargets.getCurrent().value);

            return false;
        },

        actionAdjacentTargetSelect: function(action){
            var targets = this.getTargetsForAction(this.pendingActionName);
            if(!targets.length){
                this.game.console.logNothingTo(this.pendingActionName);
                this.clearPendingAction();
                return false;
            }

            // auto perform an action when there is only one target
            // if(targets.length === 1){
            //     return this.performAction(this.pendingActionName, targets[0].value, this.pendingActionSettings);
            // }
            this.actionTargets = new RL.ValidTargets(this.game, targets);
            this.actionTargets.ignoreCurrent = true;
            this.game.queueDraw = true;

            this.pendingAction = this.actionAdjacentDirectionTargetSelect;
            this.game.console.logChooseDirection(this.pendingActionName);
            return false;
        },

        // pending action
        actionAdjacentDirectionTargetSelect: function(action){
            var pendingActionName = this.pendingActionName;
            var actionTargets = this.actionTargets;

            if(action === pendingActionName){
                if(actionTargets.targets.length === 1){
                    this.clearPendingAction();
                    return this.performAction(pendingActionName, actionTargets.targets[0].value);
                }
                return false;
            }

            var isMoveDirection = RL.Util.DIRECTIONS_4.indexOf(action) !== -1;
            if(!isMoveDirection){
                this.clearPendingAction();
                return false;
            }

            var _this = this;
            var moveOffsetCoord = RL.Util.getOffsetCoordsFromDirection(action),
                moveToX = this.x + moveOffsetCoord.x,
                moveToY = this.y + moveOffsetCoord.y,
                objects = this.game.getObjectsAtPostion(moveToX, moveToY).filter(function(obj){
                    return _this.canPerformActionOnTarget(pendingActionName, obj);
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
                this.clearPendingAction();
                return false;
            }

            if(objects.length === 1){
                this.clearPendingAction();
                return this.performAction(pendingActionName, objects[0].value);
            }
            this.clearPendingAction();
            this.actionTargets = new RL.ValidTargets(this.game, objects);
            this.pendingAction = this.actionTargetSelect;
            this.game.console.directionsSelectActionTarget(this.pendingActionName);
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
                this.clearPendingAction();
                return true;
            }
            this.clearPendingAction();
            return false;
        },

        takeDamage: function(amount, source) {
            if(this.game.gameOver){
                return;
            }
            this.hp -= amount;
            if (this.hp <= 0) {
                this.color = 'red';
                this.game.gameOver = true;
                this.game.console.logDied(this);
            }
        },

        clearPendingAction: function(){
            this.actionTargets = false;
            this.pendingAction = false;
            this.pendingActionName = false;
            this.pendingActionSettings = false;
            this.game.queueDraw = true;
            this.game.console.clearDirections();
        },

        heal: function(amount){
            this.hp += amount;
            if(this.hp > this.hpMax){
                this.hp = this.hpMax;
            }
        },

        renderHtml: function(){
            this.hpEl.innerHTML = this.hp;
            this.hpMaxEl.innerHTML = this.hpMax;
            if(this.meleeWeaponNameEl){
                var meleeWeaponConsoleName = this.meleeWeapon.getConsoleName();
                this.meleeWeaponNameEl.innerHTML = meleeWeaponConsoleName.name;
                this.meleeWeaponStatsEl.innerHTML = meleeWeaponConsoleName.stats;
            }
            if(this.meleeWeapon1NameEl){
                var meleeWeapon1ConsoleName = this.meleeWeapon1.getConsoleName();
                this.meleeWeapon1NameEl.innerHTML = meleeWeapon1ConsoleName.name;
                this.meleeWeapon1StatsEl.innerHTML = meleeWeapon1ConsoleName.stats;
            }
            if(this.meleeWeapon2NameEl){
                var meleeWeapon2ConsoleName = this.meleeWeapon2.getConsoleName();
                this.meleeWeapon2NameEl.innerHTML = meleeWeapon2ConsoleName.name;
                this.meleeWeapon2StatsEl.innerHTML = meleeWeapon2ConsoleName.stats;
            }
            if(this.meleeWeapon3NameEl){
                var meleeWeapon3ConsoleName = this.meleeWeapon3.getConsoleName();
                this.meleeWeapon3NameEl.innerHTML = meleeWeapon3ConsoleName.name;
                this.meleeWeapon3StatsEl.innerHTML = meleeWeapon3ConsoleName.stats;
            }
            if(this.meleeWeapon4NameEl){
                var meleeWeapon4ConsoleName = this.meleeWeapon4.getConsoleName();
                this.meleeWeapon4NameEl.innerHTML = meleeWeapon4ConsoleName.name;
                this.meleeWeapon4StatsEl.innerHTML = meleeWeapon4ConsoleName.stats;
            }

            if(this.rangedWeapon){
                var rangedWeaponConsoleName = this.rangedWeapon.getConsoleName();
                this.rangedWeaponNameEl.innerHTML = rangedWeaponConsoleName.name;
                this.rangedWeaponStatsEl.innerHTML = rangedWeaponConsoleName.stats;
            }
        },

        getConsoleName: function(){
            return {
                name: this.name,
                color: this.consoleColor
            };
        },
    };

    RL.Util.merge(NewPlayer.prototype, proto);
    RL.Util.merge(NewPlayer.prototype, newPlayerPrototype);

    root.RL.Player = NewPlayer;

}(this));
