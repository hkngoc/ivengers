import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';
import Logger from 'js-logger';

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

      // bombable
      // travel time >= remainTime or
      // travel time < remain and safe place
      const accept = this.conditionFn.apply(this, [node, tpc, remain]);
      if (accept) {
      // if (accept && remain <= travelCost * tpc) {
        const score = this.ref.scoreFn.apply(this.ref, [node]);
        const extreme = this.ref.extremeFn.apply(this.ref, [score, travelCost]);

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

  Logger.debug(candidates);
  blackboard.set('bombCandidates', candidates, true);

  return SUCCESS;
};

FindBombCandidate.prototype.conditionFn = function(node, tpc, remain) {
  const {
    travelCost,
    value,
    bombProfit,
    flameRemain = []
  } = node;

  if (travelCost == undefined || travelCost == null || travelCost < 0) {
    return false;
  }
  if (!bombProfit) {
    return false;
  }

  const { box, enemy, safe } = bombProfit;

  const hasBenefit = travelCost >= 0 && safe == true && (this.ref.countingScore({ box, enemy }) > 0);

  if (!hasBenefit) {
    return false;
  }

  const travelTime = tpc * travelCost;

  const ff = _(flameRemain)
    .map(f => f + 400 + tpc/2 + 300 - travelTime)
    .filter(f => f > 0)
    .value();

  if (ff.length > 0/* && travelTime < remain + 50*/) {
    // that pos not safe and move to that pos can not drop bomb immediately
    return false;
  }

  return true;
};

export default FindBombCandidate;
