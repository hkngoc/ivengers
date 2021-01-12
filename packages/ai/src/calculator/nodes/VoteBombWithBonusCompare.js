import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import _ from 'lodash';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const VoteBombWithBonusCompare = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

VoteBombWithBonusCompare.prototype = newChildObject(MyBaseNode.prototype);

VoteBombWithBonusCompare.prototype.tick = function(tree) {
  // const { blackboard, grid } = this.ref;

  // const key = blackboard.get('compareWithBomb', true);
  // const compare = blackboard.get(key, true);
  // const ordered = _.orderBy(compare, ['extreme', 'score', 'cost'], ['desc', 'desc', 'asc']);

  // // need more implement to pick the best or not
  // const winner =  _.first(ordered);

  // const { position } = winner;
  // const { directs, positions } = this.ref.tracePath(position, grid);
  // blackboard.set('result', { directs, positions, winner, which: 'bonus' }, true);

  // return SUCCESS;
  return FAILURE;
};

export default VoteBombWithBonusCompare;
