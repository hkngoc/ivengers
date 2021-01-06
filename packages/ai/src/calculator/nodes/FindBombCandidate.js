import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const FindBombCandidate = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

FindBombCandidate.prototype = newChildObject(MyBaseNode.prototype);

FindBombCandidate.prototype.tick = function(tree) {
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

  const candidates = [];
  const tpc = this.ref.timeToCrossACell(myId);
  const remain = blackboard.get('bombRemain', true);

  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) {
      const node = grid.getNodeAt(j, i);
      const { travelCost } = node;

      const accept = this.conditionFn.apply(this, [node, tpc]);
      if (accept) {
      // if (accept && remain <= travelCost * tpc) {
        const score = this.ref.scoreFn.apply(this, [node]);
        const extreme = this.ref.extremeFn.apply(this, [score, travelCost]);

        candidates.push({
          position: {
            x: j,
            y: i
          },
          score,
          extreme,
          cost: travelCost,
          diff: remain - travelCost * tpc
        });
      }
    }
  }

  if (candidates.length <= 0) {
    return FAILURE;
  } else {
    blackboard.set('bombCandidates', candidates, true);

    return SUCCESS;
  }
};

FindBombCandidate.prototype.conditionFn = function(node, tpc) {
  const {
    travelCost,
    value,
    bombProfit = {},
    flameRemain = []
  } = node;

  const { box = 0, enemy = 0, safe } = bombProfit;

  const hasBenefit = travelCost >= 0 && safe && (box > 0 || enemy > 0);
  if (!hasBenefit) {
    return false;
  }

  // for (const remain of flameRemain) {
    
  // }

  return true;
};

export default FindBombCandidate;
