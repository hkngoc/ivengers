import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const TargetSafeStillGood = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

TargetSafeStillGood.prototype = newChildObject(MyBaseNode.prototype);

TargetSafeStillGood.prototype.tick = function(tree) {
  const { blackboard, lastResult, grid } = this.ref;
  const candidates = blackboard.get('safeCandidates', true);
  const { winner: { position }, which } = lastResult;

  if (!which || !which.includes('safe')) {
    return FAILURE;
  }

  const index = _.findIndex(candidates, candidate => candidate.position.x == position.x && candidate.position.y == position.y);

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

  blackboard.set('targetCandidate', [{...candidates[index], isLastResult: true, which }], true);

  return SUCCESS;
};

export default TargetSafeStillGood;
