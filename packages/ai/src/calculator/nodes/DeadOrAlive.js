import {
  SUCCESS,
  FAILURE
} from 'behavior3js';

import {
  DiagonalMovement
} from 'pathfinding';

import _ from 'lodash';
import Logger from 'js-logger';

import { newChildObject } from '../../utils';
import { Pos, Queue } from '../core/helper';
import MyBaseNode from './MyBaseNode';

const DeadOrAlive = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

DeadOrAlive.prototype = newChildObject(MyBaseNode.prototype);

DeadOrAlive.prototype.tick = function(tree) {
  const { grid, blackboard } = this.ref;
  const player = this.ref.getMyPlayer();
  const { id, currentPosition: { col:x, row: y } } = player;

  const candidates = this.travelGrid(id, { x, y }, grid);
  if (candidates.length > 0) {
    blackboard.set('safeCandidates', candidates, true);
    blackboard.set('tracePathKey', 'doaParent', true);
    return SUCCESS;
  } else {
    return FAILURE;
  }

};

DeadOrAlive.prototype.travelGrid = function(playerId, pos, grid) {
  const playerNumber = this.ref.getPlayerNumber(playerId);
  const { x, y } = pos;

  const startNode = grid.getNodeAt(x, y);
  startNode.doaOpened = true;
  startNode.doaTravelCost = 0;

  const currentMinRemain = this.minRemain(startNode);

  const openList = new Queue();
  openList.enqueue(startNode);

  const candidates = [];

  while (!openList.isEmpty()) {
    const node = openList.dequeue();
    node.doaClosed = true;

    const accept = this.acceptDOA(node, grid);
    const minRemain = this.minRemain(node);
    if (accept || minRemain > currentMinRemain) {
      candidates.push({
        position: {
          x: node.x,
          y: node.y
        },
        score: 1.0,
        extreme: 1.0,
        cost: node.doaTravelCost
      });
    }

    const nextTravelCost = node.doaTravelCost + 1;

    const neighbors = grid.getNeighbors(node, DiagonalMovement.Never, playerNumber);
    for (const neighbor of neighbors) {
      if (neighbor.doaClosed || neighbor.doaOpened) {
        continue;
      }

      neighbor.doaOpened = true;
      neighbor.doaParent = node;
      neighbor.doaTravelCost = nextTravelCost;
      openList.enqueue(neighbor);
    }
  }
  // const after = openList.elements();

  // for (const node of after) {
  //   delete node['doaOpened'];
  //   delete node['doaClosed'];
  //   delete node['doaTravelCost'];
  // }

  return candidates;
};

DeadOrAlive.prototype.acceptDOA = function(node, grid) {
  const { flameRemain = [] } = node;
  return flameRemain.length <= 0;
};

DeadOrAlive.prototype.minRemain = function(node) {
  const { flameRemain = [] } = node;

  const min = _(flameRemain)
    .filter(f => f >= 0)
    .minBy() || 0;

  return min;
};

export default DeadOrAlive;
