import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const TargetBonusStillGood = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

TargetBonusStillGood.prototype = newChildObject(MyBaseNode.prototype);

TargetBonusStillGood.prototype.tick = function(tree) {
  return FAILURE;
};

export default TargetBonusStillGood;
