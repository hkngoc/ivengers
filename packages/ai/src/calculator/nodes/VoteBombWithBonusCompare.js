import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const VoteBombWithBonusCompare = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

VoteBombWithBonusCompare.prototype = newChildObject(MyBaseNode.prototype);

VoteBombWithBonusCompare.prototype.tick = function(tree) {
  const { blackboard } = this.ref;

  const key = blackboard.get('compareWithBomb', true);
  const compare = blackboard.get(key, true);

  return FAILURE;
};

export default VoteBombWithBonusCompare;
