RL.Item.Types = {
    heart: {
        name: "Heart",
        color: "red",
        bgColor: false,
        char: "♥",
        canAttachTo: function(entity) {
            if ( this.game.player === entity ) {
                return true;
            } else {
                return false;
            };
        },
        attachTo: function(entity) {
            entity.heal(1);
        }
    },
    gold: {
        name: "Gold",
        color: "yellow",
        bgColor: false,
        char: "*",
        canAttachTo: function(entity) {
            if ( this.game.player === entity ) {
                return true;
            } else {
                return false;
            };
        },
        attachTo: function(entity) {
            entity.addGold(1);
        }
    },
    threeGold: {
        name: "3 Gold",
        color: "yellow",
        bgColor: false,
        char: "⁂",
        canAttachTo: function(entity) {
            if ( this.game.player === entity ) {
                return true;
            } else {
                return false;
            };
        },
        attachTo: function(entity) {
            entity.addGold(3);
        }
    },
    key: {
        name: "Key",
        color: "gray",
        bgColor: false,
        char: "۴",
        canAttachTo: function(entity) {
            if ( this.game.player === entity ) {
                return true;
            } else {
                return false;
            };
        },
        attachTo: function(entity) {
            entity.addKeys(1);
        }
    },
    bomb: {
        name: "Bomb",
        color: "blue",
        bgColor: false,
        char: "ර",
        canAttachTo: function(entity) {
            if ( this.game.player === entity ) {
                return true;
            } else {
                return false;
            };
        },
        attachTo: function(entity) {
            entity.addBombs(1);
        }
    }
}
