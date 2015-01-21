RL.Entity.prototype.update = function() {
};
RL.Entity.prototype.takeDamage = function(amount) {
    this.life -= amount;
    if (this.life<0) { this.life=0; }
    if (this.life===0) { this.die(); }
};
RL.Entity.prototype.die = function() {
    console.log('dying');
    this.dead = true;
    var itemType = RL.Util.mappedWeightedChoice(this.drops);
    if (RL.Item.Types.hasOwnProperty(itemType)) {
        var item = new RL.Item(this.game, itemType,this.x,this.y);
        this.game.itemManager.add(item.x,item.y,itemType);
    }
};
