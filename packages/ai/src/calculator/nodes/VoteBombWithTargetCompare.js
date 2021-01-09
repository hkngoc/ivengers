import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const VoteBombWithTargetCompare = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

VoteBombWithTargetCompare.prototype = newChildObject(MyBaseNode.prototype);

VoteBombWithTargetCompare.prototype.tick = function(tree) {
  const { blackboard, lastResult } = this.ref;

  const key = blackboard.get('compareWithBomb', true);
  const compare = blackboard.get(key, true);
  const candidates = blackboard.get('bombCandidates', true);

  console.log('compare bomb with other candidates');
  return FAILURE;
};

export default VoteBombWithTargetCompare;
