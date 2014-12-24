//add-ons to util

RL.Util.randomChoice = function(array) {
    return array[ Math.floor( Math.random() * array.length ) ];
};

RL.Util.oppositeDirection = function(direction) {
    var directions = ['n','s','e','w'];
    var oppositeDirections = ['s','n','w','e'];
    return oppositeDirections[directions.indexOf(direction)];
};
