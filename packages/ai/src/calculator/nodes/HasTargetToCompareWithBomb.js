import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const HasTargetToCompareWithBomb = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

HasTargetToCompareWithBomb.prototype = newChildObject(MyBaseNode.prototype);

HasTargetToCompareWithBomb.prototype.tick = function(tree) {
  return FAILURE;
};

export default HasTargetToCompareWithBomb;

