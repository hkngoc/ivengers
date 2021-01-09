import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const HasTarget = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

HasTarget.prototype = newChildObject(MyBaseNode.prototype);

HasTarget.prototype.tick = function(tree) {
  return FAILURE;
};

export default HasTarget;
