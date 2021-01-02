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

  const remain = blackboard.get('bombRemain', true);
  const candidates = blackboard.get('bombCandidates', true);

  const ordered = _.orderBy(candidates, ['extreme', 'score', 'cost'], ['desc', 'desc', 'asc']);
  const winner =  _.first(ordered);

  blackboard.set('bombWinner', winner, true);

  return SUCCESS;
};

export default VoteBomb;
