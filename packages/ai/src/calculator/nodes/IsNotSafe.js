import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const IsNotSafe = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

IsNotSafe.prototype = newChildObject(MyBaseNode.prototype);

IsNotSafe.prototype.tick = function(tree) {
  const { grid } = this.ref;
  const player = this.ref.getMyPlayer();
  const { currentPosition: { col:x, row: y } } = player;

  const node = grid.getNodeAt(x, y);
  const isSafe = this.isSafePlace(node);

  return isSafe ? FAILURE : SUCCESS;
};

IsNotSafe.prototype.isSafePlace = function(node) {
  const { flameRemain = [] } = node;

  return flameRemain.length <= 0;
};

export default IsNotSafe;
