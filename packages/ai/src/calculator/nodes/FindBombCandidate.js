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
  const milestone = remain > 0 ? parseInt(remain / tpc) : 0;

  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) {
      const node = grid.getNodeAt(j, i);

      const accept = this.conditionFn.apply(this, [node]);
      if (accept) {
        const { travelCost } = node;
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
          diff: Math.abs(milestone - travelCost)
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

FindBombCandidate.prototype.conditionFn = function(node) {
  const {
    travelCost,
    value,
    bombProfit = {}
  } = node;

  const { box = 0, enemy = 0, safe } = bombProfit;

  return travelCost >= 0 && safe && (box > 0 || enemy > 0);
};

export default FindBombCandidate;
