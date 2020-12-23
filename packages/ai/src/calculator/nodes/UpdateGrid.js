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
import { Pos } from '../helper';

const UpdateGrid = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

UpdateGrid.prototype = newChildObject(MyBaseNode.prototype);

UpdateGrid.prototype.tick = function(tree) {
  const {
    grid,
    map: {
      myId,
      map_info
    }
  } = this.ref;

  const { players: { [myId]: player } } =  map_info;
  const { currentPosition: { col: x, row: y } } = player;

  this.travelGrid(myId, { x, y }, grid);

  return SUCCESS;
};

UpdateGrid.prototype.travelGrid = function(playerId, pos, grid) {
  let openList = new Heap((nodeA, nodeB) => {
    return nodeA.f - nodeB.f;
  });

  const playerNumber = this.ref.getPlayerNumber(playerId);
  const { x, y } = pos;
  let startNode = grid.getNodeAt(x, y);
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
      const walkable = this.canPlayerWalk(playerId, neighbor, nextTravelCost, grid);
      if (neighbor.closed || !walkable) {
        continue;
      }

      const scoreProfit = this.ref.scoreForWalk(playerId, neighbor, grid);

      // collect gift bonus on this path, it make better path
      const adder = 1 - this.getProfitAdder(bombProfit, scoreProfit);
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

  console.log(grid);
};

UpdateGrid.prototype.canPlayerWalk = function(playerId, node, cost, grid) {
  const tpc = this.ref.timeToCrossACell(playerId);
  const travelTime = tpc * cost;

  const { flameRemain = [] } = node;

  if (flameRemain.length > 0) {
    for (const remain of flameRemain) {
      //  bomb time: flameRemain -> flameRemain + 400
      // danger time: flameRemain - tpc/2 -> flameRemain + 400 + tpc/2
      const left = flameRemain - tpc/2;
      const right = flameRemain + 400 + tpc/2;

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

  // clone grid
  const tempGrid = _.cloneDeep(grid);

  // place bomb at node to grid clone
  const { x, y } = pos;
  tempGrid.dropBombAt(x, y);
  //col, row, remainTime, power, index
  const tempBomb = {
    col: x,
    row: y,
    index: 0, // hardcode, current implement no need infor about index of bomb, but it may need in future
    playerId,
    power,
  };

  // calculate score of explore and kill enemy...
  const profit = this.ref.drawBombFlames(tempBomb, tempGrid, this.ref.updateFlameFunction);

  // check where can find safe place/path

  return profit;
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
