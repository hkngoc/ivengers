import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const KeepOldTarget = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

KeepOldTarget.prototype = newChildObject(MyBaseNode.prototype);

KeepOldTarget.prototype.tick = function(tree) {
  return FAILURE;
};

export default KeepOldTarget;
