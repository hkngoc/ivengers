import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const TargetSuitableWithBomb = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

TargetSuitableWithBomb.prototype = newChildObject(MyBaseNode.prototype);

TargetSuitableWithBomb.prototype.tick = function(tree) {
  const { grid, lastResult } = this.ref;

  if (!lastResult) {
    return FAILURE;
  }

  const { blackboard } = this.ref;
  const candidates = blackboard.get('bombCandidates', true);

  const { winner: { position } } = lastResult;

  const index = _.findIndex(candidates, candidate => candidate.position.x == position.x && candidate.position.y == position.y);
  // console.log(index, position, 'keep old bomb');

  if (index < 0) {
    return FAILURE;
  }
  // if (index < 0 || (index >= 0 && candidates.length > 10 && index > candidates.length / 3)) {
  //   return FAILURE;
  // }

  const { directs: rDirects } = lastResult;
  const { directs } = this.ref.tracePath(position, grid);

  if (!rDirects.endsWith(directs)) {
    // not same path
    return FAILURE;
  }

  return SUCCESS;
};

export default TargetSuitableWithBomb;
