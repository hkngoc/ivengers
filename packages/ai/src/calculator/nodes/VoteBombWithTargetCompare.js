import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const VoteBombWithTargetCompare = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

VoteBombWithTargetCompare.prototype = newChildObject(MyBaseNode.prototype);

VoteBombWithTargetCompare.prototype.tick = function(tree) {
  const { blackboard } = this.ref;

  const key = blackboard.get('compareWithBomb', true);
  const compare = blackboard.get(key, true);
  const target = _.first(compare);
  const candidates = blackboard.get('bombCandidates', true);

  const index = _.findIndex(candidates, candidate => candidate.position.x == target.position.x && candidate.position.y == target.position.y);

  let accept = false;
  if (index >= 0) {
    if (index <= Math.round(candidates.length / 2.0)) {
      accept = true;
    }
  } else {
    const ordered = _.orderBy(candidates, ['extreme', 'score', 'cost'], ['desc', 'desc', 'asc']);
    const best = _.first(ordered);

    if (target.extreme > 1.5 * best.extreme) {
      accept = true;
    }
  }

  console.log('compare', accept);
  if (accept) {
    const { lastResult } = this.ref;
    blackboard.set('result', { ...lastResult, watch: true }, true);
  }

  return FAILURE;
};

export default VoteBombWithTargetCompare;
