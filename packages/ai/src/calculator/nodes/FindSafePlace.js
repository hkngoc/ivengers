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
      }
    },
    grid,
    blackboard
  } = this.ref;

  const candidates = [];

  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) {
      const node = grid.getNodeAt(j, i);

      const accept = this.conditionFn.apply(this, [node]);
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
  if (candidates.length <= 0) {
    return FAILURE;
  } else {
    blackboard.set('safeCandidates', candidates, true);

    return SUCCESS;
  }
};

FindSafePlace.prototype.conditionFn = function(node) {
  const { travelCost, flameRemain = [] } = node;

  // flameRemain < 0 when move to that pos
  return travelCost >= 0 && flameRemain.length <= 0;
};

export default FindSafePlace;
