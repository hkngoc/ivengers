import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const FindBonusCandidate = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

FindBonusCandidate.prototype = newChildObject(MyBaseNode.prototype);

FindBonusCandidate.prototype.tick = function(tree) {
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
        const score = this.ref.scoreFn.apply(this, [node]);
        const extreme = this.ref.extremeFn.apply(this, [score, travelCost]);

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

  if (candidates.length <= 0) {
    return FAILURE;
  } else {
    blackboard.set('bonusCandidates', candidates, true);

    return SUCCESS;
  }
};

FindBonusCandidate.prototype.conditionFn = function(node) {
  const {
    travelCost,
    value,
    scoreProfit = {}
  } = node;

  const { gifts = [], spoils = [] } = scoreProfit;

  return travelCost >= 0 && (gifts.length > 0 || spoils.length > 0);
};

export default FindBonusCandidate;
