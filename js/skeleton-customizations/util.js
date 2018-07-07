import RL from '../skeleton/rl.js';
import ROT from '../rotjs/rot.js';

// add-ons to util
RL.Util.randomChoice = function randomChoice(array) {
  const index = ROT.RNG.getUniformInt(0, array.length - 1);
  return array[index];
};

RL.Util.mappedWeightedChoice = function mappedWeightedChoice(map) {
  const [totalWeight, choices] = Object.keys(map).reduce(([prevTotal, prevChoices], choice) => [
    prevTotal + map[choice],
    [...prevChoices, choice],
  ], [0, []]);
  const chosenWeight = ROT.RNG.getUniformInt(0, totalWeight - 1);
  let currentWeight = 0;
  for (let i = 0; i < choices.length; i += 1) {
    const choice = choices[i];
    currentWeight += map[choice];
    if (chosenWeight < currentWeight) {
      return choice;
    }
  }
  return null;
};

RL.Util.weightedChoice = function weightedChoice(choices, weightFunc) {
  const totalWeight = choices
    .map(weightFunc)
    .reduce((prev, cur) => prev + cur, 0);
  const chosenWeight = ROT.RNG.getUniformInt(0, totalWeight - 1);
  let currentWeight = 0;
  for (let i = 0; i < choices.length; i += 1) {
    const choice = choices[i];
    currentWeight += weightFunc(choice);
    if (chosenWeight < currentWeight) {
      return choice;
    }
  }
  return null;
};

RL.Util.shuffle = function shuffle(array) {
  const copy = [...array];
  for (let i = 0; i < array.length; i += 1) {
    const foo = RL.Util.randomChoice(copy);
    array[i] = foo; // eslint-disable-line no-param-reassign
    copy.splice(copy.indexOf(foo), 1);
  }
  return array;
};

RL.Util.oppositeDirection = function oppositeDirection(direction) {
  const directions = [
    'n', 's', 'e', 'w',
    'N', 'S', 'E', 'W',
    'north', 'south', 'east', 'west',
  ];
  const opposites = [
    's', 'n', 'w', 'e',
    'S', 'N', 'W', 'E',
    'south', 'north', 'west', 'east',
  ];
  return opposites[directions.indexOf(direction)];
};
