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
        const score = this.scoreFn.apply(this, [node]);
        const extreme = this.extremeFn.apply(this, [score, travelCost]);

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

FindBonusCandidate.prototype.scoreFn = function(node) {
  const {
    travelCost,
    scoreProfit = {},
    bombProfit = {}
  } = node;

  const { box = 0, enemy = 0, safe } = bombProfit;
  const { gifts = [], spoils = [] } = scoreProfit;

  let score = 0;
  if (safe) {
    score = score + box + enemy;
  }
  score = score + 1 * gifts.length;
  score = score + 1 * spoils.length;

  return score;
};

FindBonusCandidate.prototype.extremeFn = function(score, cost) {
  if (cost <= 0) {
    cost = 1;
  }

  if (cost > 1) {
    cost = cost - 0.5;
  }

  score = 1.0 * score / cost;
  // round by 0.25
  score = Math.round((1.0 * score) / 0.25) * 0.25;
  if (score == 0) {
    score = 0.25;
  }

  return score;
};

export default FindBonusCandidate;
