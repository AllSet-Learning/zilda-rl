/* global document, window */
import ROT from './rotjs/rot.js';
import RL from './RL.js';
import Dungeon from './Dungeon.js';

// define various data files to be loaded
const roomFiles = [
  'start',
  'end',
  'shop',
  'basic',
  'debris',
  'cave',
  'inferno',
  'closed',
  'labyrinth',
];
const levelFiles = ['test'];
const monsterFiles = ['test'];

// set RNG seed
function getUrlVars() {
  const vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
    vars[key] = value;
  });
  return vars;
}
const seed = Number(getUrlVars().s);
if (Number.isFinite(seed)) {
  ROT.RNG.setSeed(seed);
}

async function start() {
  const game = new RL.Game();

  // load monsters
  await game.loadMonsters(monsterFiles);

  // adding dungeon to game
  const dungeonW = 5;
  const dungeonH = 4;
  const roomW = 15;
  const roomH = 9;
  game.dungeon = new Dungeon(game, dungeonW, dungeonH, roomW, roomH);
  await game.dungeon.loadLayouts(roomFiles);
  await game.dungeon.loadLevels(levelFiles);
  game.depth = 1;
  game.dungeon.generate(1, 0, 0);

  // set up hud
  game.hudMap = new RL.Map(game);
  game.hudMap.setSize(roomW, dungeonH + 1);
  for (let x = 0; x < game.hudMap.width; x += 1) {
    for (let y = 0; y < game.hudMap.height; y += 1) {
      game.hudMap.set(x, y, 'hud');
    }
  }
  game.hudRenderer = new RL.Renderer(game);
  game.hudRenderer.resize(game.hudMap.width, game.hudMap.height);
  game.hudRenderer.layers = [new RL.RendererLayer(game, 'hud', { draw: true })];

  // set up the renderer
  const rendererWidth = roomW;
  const rendererHeight = roomH;
  game.renderer.resize(rendererWidth, rendererHeight);
  game.renderer.layers = [
    new RL.RendererLayer(game, 'map', {
      draw: false,
      mergeWithPrevLayer: false,
    }),
    new RL.RendererLayer(game, 'item', {
      draw: false,
      mergeWithPrevLayer: true,
    }),
    new RL.RendererLayer(game, 'entity', {
      draw: true,
      mergeWithPrevLayer: true,
    }),
  ];

  // set up key bindings
  const keyBindings = {
    up: ['UP_ARROW', 'K', 'NUMPAD_8'],
    down: ['DOWN_ARROW', 'J', 'NUMPAD_2'],
    left: ['LEFT_ARROW', 'H', 'NUMPAD_4'],
    right: ['RIGHT_ARROW', 'L', 'NUMPAD_6'],
    wait: ['SPACE', 'PERIOD', 'NUMPAD_5'],
    placeBomb: ['B'],
  };
  game.input.addBindings(keyBindings);

  // set up player and starting room
  const startRoom = game.dungeon.rooms.get(0, 0);
  let playerStartX = 0;
  let playerStartY = 0;
  while (startRoom.map.get(playerStartX, playerStartY).type !== 'floor' || startRoom.itemManager.get(playerStartX, playerStartY)) {
    playerStartX = ROT.RNG.getUniformInt(0, startRoom.width - 1);
    playerStartY = ROT.RNG.getUniformInt(0, startRoom.height - 1);
  }
  game.player.x = playerStartX;
  game.player.y = playerStartY;
  game.player.room = startRoom;

  // hook up to document
  const mapContainerEl = document.getElementById('map-container');
  const consoleContainerEl = document.getElementById('console-container');
  const hudContainerEl = document.getElementById('hud-container');
  mapContainerEl.appendChild(game.renderer.canvas);
  hudContainerEl.appendChild(game.hudRenderer.canvas);
  consoleContainerEl.appendChild(game.console.el);

  game.start();
}

start();
