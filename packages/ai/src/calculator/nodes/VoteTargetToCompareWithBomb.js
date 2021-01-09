import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const VoteTargetToCompareWithBomb = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

VoteTargetToCompareWithBomb.prototype = newChildObject(MyBaseNode.prototype);

VoteTargetToCompareWithBomb.prototype.tick = function(tree) {
  return FAILURE;
};

export default VoteTargetToCompareWithBomb;
