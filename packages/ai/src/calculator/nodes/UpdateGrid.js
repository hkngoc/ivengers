import {
  SUCCESS
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const UpdateGrid = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

UpdateGrid.prototype = newChildObject(MyBaseNode.prototype);

UpdateGrid.prototype.tick = function(tree) {
  const { map } = this.ref;
  return SUCCESS;
}

export default UpdateGrid;
