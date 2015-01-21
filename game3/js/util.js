//add-ons to util

RL.Util.randomChoice = function(array) {
    var i=Math.floor(Math.random()*array.length);
    return array[i];
};

RL.Util.mappedWeightedChoice = function(map) {
    var totalWeight = 0;
    var choices = [];
    for (var choice in map) {
        if (choice !== undefined) {
            choices.push(choice);
            totalWeight += map[choice];
        }
    }
    var chosenWeight = Math.floor(Math.random()*totalWeight);
    var currentWeight = 0;
    for ( var i=0; i<choices.length; i++ ) {
        currentWeight += map[choices[i]];
        if (chosenWeight < currentWeight) {
            return choices[i];
        }
    }
};

RL.Util.weightedChoice = function(array, weightFunc) {
    var totalWeight = 0;
    for ( var i=0; i<array.length; i++ ) {
        totalWeight += weightFunc(array[i]);
    }
    var choice = Math.floor(Math.random()*totalWeight);
    var currentWeight = 0;
    for ( var i=0; i<array.length; i++ ) {
        currentWeight += weightFunc(array[i]);
        if (choice < currentWeight) {
            return array[i];
        }
    }
};

RL.Util.shuffle = function(array) {
    var tempArray = array.slice(0,array.length);
    for ( var i=0; i<array.length; i++ ) {
        var foo = RL.Util.randomChoice(tempArray);
        array[i] = foo;
        tempArray.splice(tempArray.indexOf(foo),1);
    }
    return array;
};

RL.Util.oppositeDirection = function(direction) {
    var directions = ['n','s','e','w','N','S','E','W'];
    var oppositeDirections = ['s','n','w','e','S','N','W','E'];
    return oppositeDirections[directions.indexOf(direction)];
};
