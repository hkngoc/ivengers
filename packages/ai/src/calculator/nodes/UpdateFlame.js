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
  const { map } = this.ref;
  const { map_info: { bombs } } = map;

  for (const bomb of boms) {
    this.ref.drawBombFlames(bomb);
  }

  return SUCCESS;
}

export default UpdateFlame;
