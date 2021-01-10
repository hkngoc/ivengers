import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';
import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const IsNotSafe = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

IsNotSafe.prototype = newChildObject(MyBaseNode.prototype);

IsNotSafe.prototype.tick = function(tree) {
  const { grid } = this.ref;
  const player = this.ref.getMyPlayer();
  const { id, currentPosition: { col:x, row: y } } = player;

  const node = grid.getNodeAt(x, y);
  const isSafe = this.isSafePlace(node);

  return isSafe ? FAILURE : SUCCESS;
};

IsNotSafe.prototype.isSafePlace = function(node, playerId) {
  const {
    flameRemain = [],
    travelCost,
    humanTravel = [],
    virusTravel = [],
  } = node;

  if (flameRemain.length > 0) {
    return false;
  }

  const passive = this.ref.playerPassiveNumber(playerId);
  const scareCount = _.filter([...humanTravel, ...virusTravel], step => step == 1);

  if (passive < scareCount) {
    return false;
  }

  return true;
};

export default IsNotSafe;
