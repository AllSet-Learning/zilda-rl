RL.Entity.prototype.update = function() {
};
RL.Entity.prototype.takeDamage = function(amount) {
    this.life -= amount;
    if (this.life<0) { this.life=0; }
    if (this.life===0) { this.dead=true; }
};
