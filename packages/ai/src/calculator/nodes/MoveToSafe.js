import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const MoveToSafe = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

MoveToSafe.prototype = newChildObject(MyBaseNode.prototype);

MoveToSafe.prototype.tick = function(tree) {
  const { blackboard, grid } = this.ref;

  const winner = blackboard.get('safeWinner', true);
  const { position } = winner;
  const { directs, positions } = this.ref.tracePath(position, grid);

  const prefix = blackboard.get('safeDirectPrefix', true);

  if (prefix) {
    blackboard.set('result', `${prefix}${directs}`, true);
  } else {
    blackboard.set('result', directs, true);
  }

  return SUCCESS;
};

export default MoveToSafe;
