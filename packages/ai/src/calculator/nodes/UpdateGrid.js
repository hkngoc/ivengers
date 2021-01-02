import {
  SUCCESS
} from 'behavior3js';

import {
  DiagonalMovement
} from 'pathfinding';

import Heap from 'heap';
import _ from 'lodash';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';
import { Pos } from '../variant/helper';

const UpdateGrid = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

UpdateGrid.prototype = newChildObject(MyBaseNode.prototype);

UpdateGrid.prototype.tick = function(tree) {
  const { grid } = this.ref;
  const player = this.ref.getMyPlayer();
  const { id, currentPosition: { col:x, row: y } } = player;

  this.travelGrid(id, { x, y }, grid);

  console.log(grid);

  return SUCCESS;
};

UpdateGrid.prototype.travelGrid = function(playerId, pos, grid) {
  let openList = new Heap((nodeA, nodeB) => {
    return nodeA.f - nodeB.f;
  });

  const playerNumber = this.ref.getPlayerNumber(playerId);
  const { x, y } = pos;
  const startNode = grid.getNodeAt(x, y);
  startNode.f = 0;
  startNode.travelCost = 0;
  startNode.bombProfit = {};
  startNode.scoreProfit = {};
  startNode.opened = true;

  openList.push(startNode);

  while (!openList.empty()) {
    const node = openList.pop();
    node.closed = true;

    // try place bomb and calculate score of that bomb
    const bombProfit = this.tryPlaceBomb(playerId, node, grid);
    node.bombProfit = bombProfit;

    const nextTravelCost = node.travelCost + 1;
    const neighbors = grid.getNeighbors(node, DiagonalMovement.Never, playerNumber);

    for (const neighbor of neighbors) {
      // really walkable under bomb flame remain
      const walkable = this.canPlayerWalk(playerId, neighbor, grid, nextTravelCost, 0);
      if (neighbor.closed || !walkable) {
        continue;
      }

      const scoreProfit = this.ref.scoreForWalk(playerId, neighbor, grid);
      const safeProfit = this.ref.safeScoreForWalk(node, neighbor);

      // collect gift bonus on this path, it make better path
      const adder = 1 - this.getProfitAdder(bombProfit, scoreProfit) - safeProfit;
      const ng = node.f + adder;

      if (!neighbor.opened || ng < neighbor.g) {
        neighbor.f = ng;
        neighbor.parent = node;
        neighbor.travelCost = neighbor.travelCost || nextTravelCost;
        neighbor.scoreProfit = this.ref.mergeProfit(node.scoreProfit, scoreProfit)

        if (!neighbor.opened) {
          openList.push(neighbor);
          neighbor.opened = true;
        } else {
          // the neighbor can be reached with smaller cost.
          // Since its f value has been updated, we have to
          // update its position in the open list
          openList.updateItem(neighbor);
        }
      }
    }
  }
};

UpdateGrid.prototype.canPlayerWalk = function(playerId, node, grid, cost, preCost = 0) {
  const tpc = this.ref.timeToCrossACell(playerId);
  const travelTime = tpc * cost;

  const { flameRemain = [], tempFlameRemain = [] } = node;
  const remainTime = [
    ..._.map(flameRemain, remain => ({ remain, preCost })),
    ..._.map(tempFlameRemain, remain => ({ remain, preCost: 0 }))
  ];

  if (remainTime.length > 0) {
    for (const flame of remainTime) {
      const { remain, preCost } = flame;

      //  bomb time: remain -> remain + 400
      // danger time: remain - tpc/2 -> remain + 400 + tpc/2
      const offset = 200;
      const remainOffet = tpc * preCost;

      // need so much more thinking about that formula about range time of flame effect
      // currenly, I approve that with:
      // flame time = 400ms
      // offset = 200
      const left = remain - tpc/2 - offset - remainOffet;
      const right = remain + 400 - remainOffet + tpc/2 + offset;

      if (travelTime > left && travelTime < right) {
        return false;
      }
    }
  }

  return true;
};

UpdateGrid.prototype.tryPlaceBomb = function(playerId, pos, grid) {
  const tpc = this.ref.timeToCrossACell(playerId);
  const power = this.ref.getPlayerPower(playerId);

  // place bomb at node to grid clone
  const { x, y } = pos;
  grid.dropBombAt(x, y);
  //col, row, remainTime, power, index
  const tempBomb = {
    col: x,
    row: y,
    index: 0, // hardcode, current implement no need infor about index of bomb, but it may need in future
    playerId,
    power,
    remainTime: 2000
  };

  // calculate score of explore and kill enemy...
  const profit = this.ref.drawBombFlames(tempBomb, grid, this.ref.updateFlameFunction, 'tempFlameRemain');

  // check where can find safe place/path
  const safe = this.findSafePlace(playerId, pos, grid);
  profit.safe = safe;

  // reverse state
  grid.removeBombAt(x, y);
  this.ref.drawBombFlames(tempBomb, grid, this.ref.reverseFlameFunction, 'tempFlameRemain');

  return profit;
};

UpdateGrid.prototype.findSafePlace = function(playerId, pos, grid) {
  const playerNumber = this.ref.getPlayerNumber(playerId);

  const { x, y, travelCost: preCost } = pos;
  const startNode = grid.getNodeAt(x, y);
  startNode.safeOpened = true;
  startNode.safeTravelCost = 0;

  const openList = [];
  openList.push(startNode);

  while (openList.length > 0) {
    const node = openList.shift();
    node.safeClosed = true;

    if (this.isSafePlace(node)) {
      return true;
    }

    const nextTravelCost = node.safeTravelCost + 1;
    const neighbors = grid.getNeighbors(node, DiagonalMovement.Never, playerNumber);
    for (const neighbor of neighbors) {
      // skip this neighbor if it has been inspected before
      if (neighbor.safeClosed || neighbor.safeOpened) {
        continue;
      }

      const walkable = this.canPlayerWalk(playerId, neighbor, grid, nextTravelCost, preCost);
      if (walkable) {
        openList.push(neighbor);
        neighbor.safeOpened = true;
        neighbor.safeTravelCost = nextTravelCost;
      }
    }
  }

  return false;
};

UpdateGrid.prototype.isSafePlace = function(node) {
  const { flameRemain = [] } = node;

  return flameRemain.length <= 0;
};

UpdateGrid.prototype.getProfitAdder = function(bomb, items) {
  const { box = 0, enemy = 0, safe } = bomb;
  const { gifts = [], spoils = [] } = items;

  let score = 0;

  // if (safe) {
  //   score = score + box + enemy;
  // }

  score = score + gifts.length;
  score = score + spoils.length;

  return score / 10;
};

export default UpdateGrid;
