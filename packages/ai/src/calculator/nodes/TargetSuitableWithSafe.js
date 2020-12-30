import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const TargetSuitableWithSafe = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

TargetSuitableWithSafe.prototype = newChildObject(MyBaseNode.prototype);

TargetSuitableWithSafe.prototype.tick = function(tree) {
  const { lastResult } = this.ref;

  if (!lastResult) {
    return FAILURE;
  }

  const { blackboard } = this.ref;
  const candidates = blackboard.get('safeCandidates', true);
  const { winner: { position } } = lastResult;

  const index = _.findIndex(candidates, candidate => candidate.position.x == position.x && candidate.position.y == position.y);

  if (index >= 0) {
    return SUCCESS;
  } else {
    return FAILURE;
  }
};

export default TargetSuitableWithSafe;
