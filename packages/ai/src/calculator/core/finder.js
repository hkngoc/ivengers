import AI from './ai';
import _ from 'lodash';

AI.prototype.conditionSafeFn = function(node, grid, passive, scare, faster = true) {
  const {
    travelCost,
    flameRemain = []
  } = node;

  if (travelCost > 0) {
    const acceptFlame = flameRemain.length <= 0;

    scare = _(scare)
      .uniqBy(o => `${o.type}-${o.index}`)
      .filter(o => (o.step > 0 && o.main) || (o.step <= 3))
      .value();

    const acceptScare = passive >= scare.length;

    if (faster) {
      var acceptFaster = this.fasterEnemy(node, travelCost, 0);
    } else {
      acceptFaster = true;
    }

    return {
      acceptFlame,
      acceptScare,
      acceptFaster
    }
  } else {
    return {
      acceptFlame: false,
      acceptScare: false,
      acceptFaster: false
    }
  }
};

export default AI;
