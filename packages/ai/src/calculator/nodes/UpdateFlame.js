import {
  SUCCESS
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const UpdateFlame = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

UpdateFlame.prototype = newChildObject(MyBaseNode.prototype);

UpdateFlame.prototype.tick = function(tree) {
  const { map, grid } = this.ref;
  const { map_info: { bombs } } = map;

  for (const bomb of bombs) {
    const { col, row } = bomb;

    grid.dropBombAt(col, row);
    this.ref.drawBombFlames(bomb, grid, this.ref.updateFlameFunction, 'flameRemain');
  }

  return SUCCESS;
};

export default UpdateFlame;
