import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const MoveToBonusWithTarget = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

MoveToBonusWithTarget.prototype = newChildObject(MyBaseNode.prototype);

MoveToBonusWithTarget.prototype.tick = function(tree) {
  const { blackboard } = this.ref;
  const winner = blackboard.get('bonusWinner', true);

  // console.log(winner);

  blackboard.set('result', winner, true);

  return SUCCESS;
};

export default MoveToBonusWithTarget;
