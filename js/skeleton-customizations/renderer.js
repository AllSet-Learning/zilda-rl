import RL from '../skeleton/rl.js';

// make tiles bigger for Hanzi readability
RL.Renderer.prototype.tileSize = 32;
// change font to something more Zelda-like
RL.Renderer.prototype.font = 'Arial Black';

// Customize renderer to ignore field of view
RL.RendererLayer.Types.entity.getTileData = function getTileData(x, y) {
  if (!this.game) {
    return false;
  }
  const { player } = this.game;
  let entity = false;
  if (player && x === player.x && y === player.y) {
    entity = player;
  } else if (this.game.entityManager) {
    entity = this.game.entityManager.get(x, y);
  }
  if (entity) {
    const tileData = entity.getTileDrawData();
    return tileData;
  }
  return false;
};

// New Renderer layer for item
RL.RendererLayer.Types.item = {
  merge: true,
  cancelTileDrawWhenNotFound: true,
  getTileData(x, y) {
    if (!this.game) {
      return false;
    }
    const item = this.game.itemManager.get(x, y);
    if (item) {
      return item.getTileDrawData();
    }
    return false;
  },
};

// New type of renderer layer for hud
RL.RendererLayer.Types.hud = {
  merge: true,
  cancelTileDrawWhenNotFound: true,
  getTileData(x, y) {
    if (!this.game) {
      return false;
    }
    const tile = this.game.hudMap.get(x, y);
    if (!tile.explored) {
      return false;
    }
    const tileData = tile.getTileDrawData();
    return tileData;
  },
};
