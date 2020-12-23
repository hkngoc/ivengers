import {
  SUCCESS
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';
import { Pos } from '../helper';

const UpdateVirus = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

UpdateVirus.prototype = newChildObject(MyBaseNode.prototype);

UpdateVirus.prototype.tick = function(tree) {
  const { map, grid } = this.ref;
  const { map_info: { viruses } } = map;

  for (const virus of viruses) {
    const { alive } = virus;

    if (!alive) {
      continue;
    }

    this.drawPath(virus, grid, this.updateFn);
  }

  return SUCCESS;
};

UpdateVirus.prototype.drawPath = function(virus, grid, fn) {
  const { position, direction } = virus;
  const { x, y } = position;

  let directs = {};
  const pos = new Pos(x, y);
  directs[this.ref.getDirectOf(direction)] = pos;

  fn.apply(this, [pos, grid, 0]);
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
        fn.apply(this, [near, grid, step]);

        directs[direct] = near;
      }
    }

    step++;
  }
};

UpdateVirus.prototype.updateFn = function(pos, grid, step, which = 'virusTravel') {
  const { x, y } = pos;

  const node = grid.getNodeAt(x, y);
  node[which] = [ ...(node[which] || []), step ];
};

export default UpdateVirus;
