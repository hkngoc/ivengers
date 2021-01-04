import {
  SUCCESS
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';
import { Pos } from '../variant/helper';

const UpdateHuman = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

UpdateHuman.prototype = newChildObject(MyBaseNode.prototype);

UpdateHuman.prototype.tick = function(tree) {
  const { map, grid } = this.ref;
  const { map_info: { human } } = map;

  for (const h of human) {
    this.drawPath(h, grid, this.updateFn);
  }
  return SUCCESS;
};

UpdateHuman.prototype.drawPath = function(human, grid, fn) {
  const { position, direction, index, infected } = human;
  const { col, row } = position;

  let directs = {};
  const pos = new Pos(col, row);
  if (direction) {
    directs[this.ref.getDirectOf(direction)] = pos;
  }

  fn.apply(this, [pos, grid, 0]);
  let step = 1;
  while (_.keys(directs).length > 0) {
    for (const direct in directs) {
      const p = directs[direct];
      const near = p.adj(direct);

      const stop = grid.wouldStopHumanAt(near.x, near.y);
      if (stop) {
        directs = _.omit(directs, direct);
      } else {
      // update grid at near
      fn.apply(this, [near, grid, step, index, infected]);

      directs[direct] = near;
      }
    }

    step++;
  }
};

UpdateHuman.prototype.updateFn = function(pos, grid, step, index, infected, which = 'humanTravel') {
  const { x, y } = pos;

  const node = grid.getNodeAt(x, y);
  node[which] = [ ...(node[which] || []), { index, step, infected } ];
};

export default UpdateHuman;
