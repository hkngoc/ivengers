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
  let candidates = [];

  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) {
      const node = grid.getNodeAt(j, i);

      const scare = this.ref.countingScareByRadar(node, grid);
      const {
        acceptFlame,
        acceptFaster
      } = this.conditionFn.apply(this, [node, grid, passive, scare]);
      const acceptScare = this.ref.filterSafeScareLevel0(passive, scare);

      if (acceptFlame && acceptFaster && acceptScare) {
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
          scare: scare
        });
      }
    }
  }

  let interview = true;

  if (interview && candidates.length > 0) {
    const temp = _.filter(candidates, candidate => {
      const { scare } = candidate;
      return this.ref.filterSafeScareLevel1(passive, scare);
    });

    if (temp.length > 0) {
      candidates = temp;
    } else {
      interview = false;
    }
  }

  if (interview && candidates.length > 0) {
    const temp = _.filter(candidates, candidate => {
      const { scare } = candidate;
      return this.ref.filterSafeScareLevel2(passive, scare);
    });

    if (temp.length > 0) {
      candidates = temp;
    } else {
      interview = false;
    }
  }

  if (interview && candidates.length > 0) {
    const temp = _.filter(candidates, candidate => {
      const { scare } = candidate;
      return this.ref.filterSafeScareLevel3(passive, scare);
    });

    if (temp.length > 0) {
      candidates = temp;
    } else {
      interview = false;
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
