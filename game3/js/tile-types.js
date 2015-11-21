RL.Tile.Types.floor = {
    name: 'Floor',
    char: '.',
    color: '#444',
    bgColor: '#222',
    passable: true
};
RL.Tile.Types.wall = {
    name: 'Wall',
    char: '#',
    color: '#777',
    bgColor: '#2e2e2e',
    passable: false,
    bombable: false
};
RL.Tile.Types.weakWall = {
    name: 'Weak Wall',
    char: '≠',
    color: '#777',
    bgColor: '#2e2e2e',
    passable: false,
    bombable: true
};
RL.Tile.Types.door = {
    name: 'Door',
    char: '▇',
    color: '#222',
    bgColor: '#2e2e2e',
    passable: true,
    bombable: false
};
RL.Tile.Types.lockedDoor = {
    name: 'Locked Door',
    char: '▇',
    color: '#8B4513',
    bgColor: '#2e2e2e',
    passable: false,
    bombable: false,
    bump: function(entity) {
        if (entity.keys) {
            this.game.console.log('You unlock the door');
            entity.keys -= 1;
            this.game.map.set(this.x,this.y,'door');
        }
        this.game.renderer.draw();
    }
};


RL.Tile.Types.fire = {
    name: 'Fire',
    char: '火',
    color: 'red',
    bgColor: '#522',
    passable: true,
    update: function() {
        entity = this.game.entityManager.get(this.x,this.y);
        if (entity) {
            entity.takeDamage(1);
        }
    }
};
RL.Tile.Types.bombThree = {
    name: 'Bomb',
    char: 'ර',
    color: 'blue',
    bgColor: '#222',
    passable: true,
    update: function() {
        this.game.console.log('Three.');
        this.changeType('bombTwo');
    }        
};
RL.Tile.Types.bombTwo = {
    name: 'Bomb',
    char: 'ර',
    color: 'blue',
    bgColor: '#222',
    passable: true,
    update: function() {
        this.game.console.log('Two!');
        this.changeType('bombOne');
    }        
};
RL.Tile.Types.bombOne = {
    name: 'Bomb',
    char: 'ර',
    color: 'red',
    bgColor: '#222',
    passable: true,
    update: function() {
        this.game.console.log('ONE!');
        this.changeType('bombExploding');
    }        
};
RL.Tile.Types.bombExploding = {
    name: 'Bomb',
    char: 'ර',
    color: 'red',
    bgColor: '#222',
    passable: true,
    update: function() {
        for ( var x=this.x-1; x<this.x+2; x++ ) {
            for ( var y=this.y-1; y<this.y+2; y++ ) {
                var t = this.game.map.get(x,y);
                if (t.bombable) {
                    this.game.map.get(x,y).changeType('explosion');
                    if (x>this.x || (x===this.x && y>this.y)) {
                        this.game.map.get(x,y).skip = true;
                    }
                    entity = this.game.entityManager.get(x,y);
                    if (entity) {
                        entity.takeDamage(1);
                    }
                }
            }
        }
        this.changeType('explosion');
    }
};
RL.Tile.Types.explosion = {
    name: 'Explosion',
    char: '火',
    color: 'red',
    bgColor: '#522',
    passable: true,
    update: function() {
        this.changeType('embers');
    }
};
RL.Tile.Types.embers = {
    name: 'Embers',
    char: '.',
    color: '#522',
    bgColor: '#222',
    passable: true
};
RL.Tile.Types.brazier = {
    name: 'Brazier',
    char: '♨',
    color: 'red',
    bgColor: '#222',
    passable: false,
    bombable: true
};
RL.Tile.Types.puddle = {
    name: 'Puddle',
    char: '~',
    color: 'blue',
    bgColor: '#222',
    passable: true,
    bombable: true
};
RL.Tile.Types.acidPuddle = {
    name: 'Puddle',
    char: '~',
    color: 'blue',
    bgColor: '#222',
    passable: true,
    bombable: true,
    update: function() {
        entity = this.game.entityManager.get(this.x,this.y);
        if (entity) {
            entity.takeDamage(1);
        }
    }
};
RL.Tile.Types.tombstone = {
    name: 'Tombstone',
    char: '☗',
    color: '#777',
    bgColor: '#222',
    passable: true,
    bombable: true
};
RL.Tile.Types.pillar = {
    name: 'Pillar',
    char: '●',
    color: '#2e2e2e',
    bgColor: '#222',
    passable: false,
    bombable: false
};
RL.Tile.Types.downStairs = {
    name: 'Stairs',
    char: 'Ω',
    color: '#CC2EFA',
    bgColor: '#222',
    passable: true,
    bombdable: false,
    onEntityEnter: function(entity) {
        if (entity===this.game.player) {
            this.game.depth += 1;
            console.log(this.game.dungeon.levels.length);
            if (this.game.dungeon.levels.length===this.game.depth) {
                console.log('generating new level');
                this.game.dungeon.generate(this.game.depth,
                                           this.game.player.room.x,
                                           this.game.player.room.y);
            } else {
                console.log('level already generated');
                this.game.dungeon.rooms = this.game.dungeon.levels[this.game.depth];
            }
            console.log(this.game.dungeon.levels.length);
            this.game.player.room.entityManager.remove(this.game.player);
            this.game.dungeon.getRoomsWithTag('START')[0].entityManager.add(this.game.player.x, this.game.player.y, this.game.player);
            this.game.movePlayerRoom(this.game.player.room, this.game.dungeon.getRoomsWithTag('START')[0]);
        }
    }
};

RL.Tile.Types.upStairs = {
    name: 'Stairs',
    char: '<',
    color: '#777',
    bgColor: '#222',
    passable: true,
    bombdable: false
    /*onEntityEnter: function(entity) {
     if (entity===this.game.player) {
     console.log(this.game.dungeon.depth);
     this.game.dungeon.depth += 1;
     console.log(this.game.dungeon.depth);
     this.game.dungeon.generate(this.game.dungeon.depth,
     this.game.player.room.x,
     this.game.player.room.y)
     this.game.movePlayerRoom(this.game.player.room, this.game.dungeon.getRoomsWithTag('START')[0]);
     }
     }*/
};

RL.Tile.Types.hud = {
    name: 'HUD',
    char: '■',
    color: '#000',
    bgColor: '#000'
};
