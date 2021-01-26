import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';
import Logger from 'js-logger';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const FindCandidate = function(ref, faster = false) {
  MyBaseNode.apply(this, [ref]);
  this.faster = faster;
};

FindCandidate.prototype = newChildObject(MyBaseNode.prototype);

FindCandidate.prototype.tick = function(tree) {
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

  const safeCandidates = [];

  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) {
      const node = grid.getNodeAt(j, i);

      const { travelCost } = node;

      if (!travelCost || travelCost < 0) {
        continue;
      }

      const scare = this.ref.countingScareByRadar(node, grid);
      const passive = this.ref.playerPassiveNumber(myId);
    }
  }
};


FindCandidate.prototype.conditionSafe = function(...params) {
  return this.ref.conditionSafeFn.apply(this.ref, [...params]);
};

export default FindCandidate;
