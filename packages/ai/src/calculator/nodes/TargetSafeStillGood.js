import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const TargetSafeStillGood = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

TargetSafeStillGood.prototype = newChildObject(MyBaseNode.prototype);

TargetSafeStillGood.prototype.tick = function(tree) {
  return FAILURE;
};

export default TargetSafeStillGood;
