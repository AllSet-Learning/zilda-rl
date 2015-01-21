RL.Entity.Types = {
    a: {
        name: 'A',
        char: 'A',
        color: '#006600',

        maxLife: 1,
        damage: 1,
        fovRadius: 3,
        stumbleChance: 0.25,
        fireImmune: false,
        acidImmune: false,
        
        /**
        * 'random': moves randomly
        * 'towards': moves towards player
        * 'away': moves away from player
        * 'stationary': doesn't move
        */
        movement: 'random',
        /**
        * 'always': always attacks if it can
        * 'never': never attacks
        * 'provoked': only attacks when attacked
        */
        aggression: 'never',

        drops: { //weighted drops
            'nothing':50,
            'gold':30,
            'threeGold':10,
            'bomb':10
        }
    },

    b: {
        name: 'B',
        char: 'B',
        color: '#006600',

        maxLife: 3,
        damage: 10,
        fovRadius: 10,
        stumbleChance: 0.1,
        
        movement: 'stationary',
        aggression: 'provoked',

        drops: {
            'threeGold':100
        }
    },

    c: {
        name: 'C',
        char: 'C',
        color: '#006600',

        fovRadius: 100,
        stumbleChance: 0.5,

        movement: 'towards',
        aggression: 'always'
    },

    d: {
        name: 'D',
        char: 'D',
        color: '#006600'
    }
};
