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
  const { lastResult } = this.ref;

  if (!lastResult) {
    return FAILURE;
  }

  const { blackboard } = this.ref;
  const candidates = blackboard.get('bombCandidates', true);
  const { winner: { position } } = lastResult;

  const index = _.findIndex(candidates, candidate => candidate.position.x == position.x && candidate.position.y == position.y);
  // console.log(index, position, 'keep old bomb');

  if (index >= 0) {
    return SUCCESS;
  } else {
    return FAILURE;
  }
};

export default TargetSuitableWithBomb;
