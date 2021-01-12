import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const FindSafePlace = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

FindSafePlace.prototype = newChildObject(MyBaseNode.prototype);

FindSafePlace.prototype.tick = function(tree) {
  const {
    map: {
      map_info: {
        size: { cols, rows }
      },
      myId
    },
    grid,
    blackboard
  } = this.ref;

  const passive = this.ref.playerPassiveNumber(myId);
  const candidates = [];

  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) {
      const node = grid.getNodeAt(j, i);

      const accept = this.conditionFn.apply(this, [node, passive]);
      if (accept) {
        const { travelCost } = node;
        const score = this.ref.scoreFn.apply(this.ref, [node]);
        const extreme = this.ref.extremeFn.apply(this.ref, [score, travelCost]);

        candidates.push({
          position: {
            x: j,
            y: i
          },
          score,
          extreme,
          cost: travelCost
        });
      }
    }
  }

  // console.log(candidates);

  blackboard.set('safeCandidates', candidates, true);

  return SUCCESS;
};

FindSafePlace.prototype.conditionFn = function(node, passive) {
  const { travelCost, flameRemain = [] } = node;

  if (travelCost == 0) {
    const {
      humanTravel = [],
      virusTravel = [],
    } = node;

    const scareCount = _.filter([...humanTravel, ...virusTravel], o => o.main || o.step <= 2);

    return flameRemain.length <= 0 && passive > scareCount.length;
  } else if (travelCost > 0) {
    return flameRemain.length <= 0;
  }

  return false;
};

export default FindSafePlace;
