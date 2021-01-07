import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const VoteBomb = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

VoteBomb.prototype = newChildObject(MyBaseNode.prototype);

VoteBomb.prototype.tick = function(tree) {
  const { blackboard } = this.ref;

  const candidates = blackboard.get('bombCandidates', true);

  const ordered = _.orderBy(candidates, ['extreme', 'score', 'cost'], ['desc', 'desc', 'asc']);
  // need reject position can drop bomb but remain time so small, that more safer. Maybe implement in Find Candidate node.

  // console.log(ordered);
  const winner = _.first(ordered);

  blackboard.set('bombWinner', winner, true);

  return SUCCESS;
};

export default VoteBomb;
