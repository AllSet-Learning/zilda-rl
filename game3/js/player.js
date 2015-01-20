//Extend players update to include new actions
RL.Player.prototype.update = function(action) {
    if (RL.Util.DIRECTIONS_8.indexOf(action) !== -1) {
        var offsetCoord = RL.Util.getOffsetCoordsFromDirection(action),
        moveToX = this.x+offsetCoord.x,
        moveToY = this.y+offsetCoord.y;
        return this.move(moveToX,moveToY);
    }
    if (action === 'wait' ) {
        this.wait();
        return true;
    } else if (action === 'placeBomb') {
        if (this.bombs) {
            this.bombs -= 1;
            this.game.map.get(this.x,this.y).changeType('bombThree');
            return true;
        } else {
            return false;
        }
    }
    return false;
};

//initial stats
RL.Player.prototype.maxLife = 6;
RL.Player.prototype.life = 3;
RL.Player.prototype.gold = 3;
RL.Player.prototype.keys = 3;
RL.Player.prototype.bombs = 3;

//increase and decrease max life
RL.Player.prototype.addHeart = function() {
    if (this.maxLife<6) {
        this.maxLife += 1;
        this.life += 1;
    }
};
RL.Player.prototype.removeHeart = function() {
    this.maxLife -= 1;
    if (this.life > this.maxLife) { this.life=this.maxLife; }
};

//Damage and healing
RL.Player.prototype.takeDamage = function(amount) {
    this.game.console.log('You take <strong>'+amount+'</strong> damage.');
    this.life -= amount;
    if (this.life<0) { this.life=0; }
    if (this.life===0) { this.dead=true; }
};
RL.Player.prototype.heal = function(amount) {
    this.life += amount;
    if (this.life>this.maxLife) { this.life=this.maxLife; }
};

//Adding and removing gold
RL.Player.prototype.addGold = function(amount) {
    this.gold += amount;
    if (this.gold>99) { this.gold=99; }
};
RL.Player.prototype.removeGold = function(amount) {
    this.gold -= amount;
    if (this.gold<0) { this.gold=0; }
};

//Adding and removing keys
RL.Player.prototype.addKeys = function(amount) {
    this.keys += amount;
    if (this.keys>99) { this.keys=99; }
};
RL.Player.prototype.removeKeys = function(amount) {
    this.keys -= amount;
    if (this.keys<0) { this.keys=0; }
};

//Adding and removing bombs
RL.Player.prototype.addBombs = function(amount) {
    this.bombs += amount;
    if (this.bombs>99) { this.boms=99; }
};
RL.Player.prototype.removeBombs = function(amount) {
    this.bombs -= amount;
    if (this.bombs<0) { this.bombs=0; }
};
