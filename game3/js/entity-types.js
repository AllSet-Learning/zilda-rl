RL.Entity.Types = {
    rat: {
        name: 'Rat',
        char: 'r',
        color: '#AAA',
        bgColor: false,
        charStrokeColor: false,
        charStrokeWidth: 0,

        playerLastSeen: false,

        life: 1,
        maxLife: 1,
        damage: 1,
        fovRadius: 3,
        fireImmune: false,
        acidImmune: false,
        stumbleChance: 0.25,
        
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
        aggression: 'always',

        onDeath: null,//'explodes'
        drops: { //weighted drops
            'nothing':50,
            'gold':30,
            'threeGold':10,
            'bomb':10,
            'key':0
        }
    }
};
