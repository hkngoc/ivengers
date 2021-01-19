import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';
import Logger from 'js-logger';

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

      const { accept, scare } = this.conditionFn.apply(this, [node, passive]);
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
          cost: travelCost,
          scare: scare.length
        });
      }
    }
  }

  Logger.debug(candidates);

  blackboard.set('safeCandidates', candidates, true);

  return SUCCESS;
};

FindSafePlace.prototype.conditionFn = function(node, passive) {
  const {
    travelCost,
    flameRemain = [],
    humanTravel = [],
    virusTravel = [],
  } = node;

  if (travelCost > 0) {
    let accept = flameRemain.length <= 0;
    const scare = _.filter([...humanTravel, ...virusTravel], o => o.main || o.step <= 2);
    accept = accept && passive >= scare.length;

    return {
      accept,
      scare
    }
  } else {
    return {
      accept: false,
      scare: []
    }
  }
};

export default FindSafePlace;
