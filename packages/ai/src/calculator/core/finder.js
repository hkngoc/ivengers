import AI from './ai';
import _ from 'lodash';

AI.prototype.conditionSafeFn = function(node, grid, passive, scare, faster = true) {
  const {
    travelCost,
    flameRemain = []
  } = node;

  if (travelCost > 0) {
    const acceptFlame = flameRemain.length <= 0;

    if (faster) {
      var acceptFaster = this.fasterEnemy(node, travelCost, 0);
    } else {
      acceptFaster = true;
    }

    return {
      acceptFlame,
      acceptFaster
    }
  } else {
    return {
      acceptFlame: false,
      acceptFaster: false
    }
  }
};

AI.prototype.filterSafeScareLevel0 = function(scare, passive) {
  const filtered = _(scare)
    .uniqBy(o => `${o.type}-${o.index}`)
    .filter(o => o.main && (o.dx == 0 || o.dy == 0) && o.distance <= 1 && o.step >= 0 && o.step <= 3)
    .value();

  return passive >= filtered.length
};

AI.prototype.filterSafeScareLevel1 = function(scare, passive) {
  const filtered = _(scare)
    .uniqBy(o => `${o.type}-${o.index}`)
    .filter(o => o.main && (o.dx == 0 || o.dy == 0) && o.step >= 0 && o.step <= 3)
    .value();

  return passive >= filtered.length
};

AI.prototype.filterSafeScareLevel2 = function(scare, passive) {
  const filtered = _(scare)
    .uniqBy(o => `${o.type}-${o.index}`)
    .filter(o => o.main && o.step >= 0)
    .value();

  return passive >= filtered.length;
};

AI.prototype.filterSafeScareLevel3 = function(scare, passive) {
  const filtered = _(scare)
    .uniqBy(o => `${o.type}-${o.index}`)
    .filter(o => (o.main && o.step >= 0) || o.step <= 3)
    .value();

  return passive >= filtered.length;
};

export default AI;
