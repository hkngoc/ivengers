import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';
import Logger from 'js-logger';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const FindSafePlace = function(ref, faster = false) {
  MyBaseNode.apply(this, [ref]);
  this.faster = faster;
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

      const scare = this.ref.countingScareByRadar(node, grid);
      const {
        acceptFlame,
        acceptFaster,
        acceptScare
      } = this.conditionFn.apply(this, [node, grid, passive, scare]);

      // need implement 2 round with faster or not

      if (acceptFlame && acceptScare && acceptFaster) {
        const { travelCost } = node;
        const score = this.ref.scoreFn.apply(this.ref, [node, scare.length]);
        const extreme = this.ref.extremeFn.apply(this.ref, [score, travelCost]);

        candidates.push({
          position: {
            x: j,
            y: i
          },
          score,
          extreme,
          cost: travelCost,
          scare: scare.length
        });
      }
    }
  }

  Logger.debug(candidates);

  blackboard.set('safeCandidates', candidates, true);

  if (candidates.length > 0) {
    return SUCCESS;
  } else {
    return FAILURE;
  }
};

FindSafePlace.prototype.conditionFn = function(...params) {
  return this.ref.conditionSafeFn.apply(this.ref, [...params, this.faster]);
};

export default FindSafePlace;
