import {
  SUCCESS
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';
import { Pos } from '../variant/helper';

const UpdateVirus = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

UpdateVirus.prototype = newChildObject(MyBaseNode.prototype);

UpdateVirus.prototype.tick = function(tree) {
  const { map, grid } = this.ref;
  const { map_info: { viruses } } = map;

  for (const virus of viruses) {
    this.drawPath(virus, grid, this.updateFn);
  }

  return SUCCESS;
};

UpdateVirus.prototype.drawPath = function(virus, grid, fn) {
  const { position, direction, index } = virus;
  const { col, row } = position;

  let directs = {};
  const pos = new Pos(col, row);
  if (direction) {
    directs[this.ref.getDirectOf(direction)] = pos;
  }

  fn.apply(this, [pos, grid, 0, index]);
  let step = 1;
  while (_.keys(directs).length > 0) {
    for (const direct in directs) {
      const p = directs[direct];
      const near = p.adj(direct);

      const stop = grid.wouldStopVirusAt(near.x, near.y);
      if (stop) {
        directs = _.omit(directs, direct);
      } else {
        // update grid at near
        fn.apply(this, [near, grid, step, index]);

        directs[direct] = near;
      }
    }

    step++;
  }
};

UpdateVirus.prototype.updateFn = function(pos, grid, step, index, which = 'virusTravel') {
  const { x, y } = pos;

  const node = grid.getNodeAt(x, y);
  node[which] = [ ...(node[which] || []), { step, index } ];
};

export default UpdateVirus;
