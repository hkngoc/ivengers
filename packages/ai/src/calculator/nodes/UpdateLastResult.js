import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const UpdateLastResult = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

UpdateLastResult.prototype = newChildObject(MyBaseNode.prototype);

UpdateLastResult.prototype.tick = function(tree) {
  const { lastResult, map: { timestamp } } = this.ref;

  if (!lastResult) {
    return SUCCESS;
  }

  const { positions } = lastResult;
  const player = this.ref.getMyPlayer();
  const { currentPosition: { col, row } } = player;

  const index = _.findLastIndex(positions, pos => pos.visited);
  const current = positions[index];
  const next = positions[index + 1];

  if (current.x == col && current.y == row) {
    // same as last event
  } else {
    if (next.x == col && next.y == row) {
      // new pos, collect visited
      this.ref.lastResult.positions[index + 1].visited = true;
      this.ref.lastResult.positions[index + 1].timestamp = timestamp;

      if (index == positions.length - 2) {
        // meet target, remove target
        this.ref.lastResult = null;
      }
    } else {
      // wrong way, remove target
      this.ref.lastResult = null;
    }
  }

  console.log(this.ref.lastResult);

  return SUCCESS;
};

export default UpdateLastResult;
