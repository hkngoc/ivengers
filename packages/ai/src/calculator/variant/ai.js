import {
  BehaviorTree,
  Blackboard,
  Priority, // Selector
} from 'behavior3js';

import _ from 'lodash';
import {
  Pos,
  Direct,
  DirectOf,
  getDirect
} from './helper';

const AI = function(map, config, lastResult, enemyDrive) {
  const tree = new BehaviorTree(null, {
    title: 'BTs of iVengers'
  });
  tree.root = this.buildTree();

  const blackboard = new Blackboard();

  this.map        = map;
  this.tree       = tree;
  this.config     = config;
  this.blackboard = blackboard;
  this.lastResult = lastResult;
};

AI.prototype.buildTree = function() {
  return new Priority({
    children:[]
  });
};

//===============================================================
/*common func here*/
AI.prototype.getPlayerSortId = function(id) {
  const split = id.split('-');
  return `${split[0]}-${split[1]}`;
};

AI.prototype.getPlayerNumber = function(id) {
  const { playerNumber: { [id]: number } } = this.map;

  return number;
};

AI.prototype.getPlayerPower = function(id) {
  const { map_info: { players: { [id]: player } } } = this.map;
  const { power } = player;

  return power;
};

AI.prototype.playerPassiveNumber = function(id) {
  const { map_info: { players: { [id]: player } } } = this.map;
  const { pill = 0, pillUsed = 0 } = player;

  return pill;
};

AI.prototype.getPlayer = function(id) {
  const { map_info: { players: { [id]: player } } } = this.map;

  return player;
};

AI.prototype.getMyPlayer = function() {
  const { myId }= this.map;

  return this.getPlayer(myId);
};

AI.prototype.getDirectOf = function(direction) {
  return DirectOf[direction];
};

AI.prototype.drawBombFlames = function(bomb, grid, fn, which) {
  const { col, row, remainTime, power, index, playerId } = bomb;

  const pos = new Pos(col, row);

  let directs = {};
  directs[Direct.LEFT] = pos;
  directs[Direct.RIGHT] = pos;
  directs[Direct.UP] = pos;
  directs[Direct.DOWN] = pos;

  let flameSize = power;//boot bomb power
  // let score = 0;

  let profit = fn.apply(this, [playerId, pos, grid, remainTime, index, {}, which]);

  while (flameSize > 0 && _.keys(directs).length > 0) {
    for (const direct in directs) {
      const p = directs[direct];
      const near = p.adj(direct);

      // update grid at near
      profit = fn.apply(this, [playerId, near, grid, remainTime, index, profit, which]);
      directs[direct] = near;

      const stop = grid.wouldStopFlameAt(near.x, near.y, remainTime);
      if (stop) {
        directs = _.omit(directs, direct);
      }
    }

    flameSize--;
  }

  return profit;
};

AI.prototype.mergeProfit = function(left, right) {
  return _.mergeWith.apply(_, [{...left}].concat([{...right}], (obj, src, key) => {
    if (Array.isArray(src)) {
      return [ ...(obj || []), ...src ];
    }
    return (obj || 0) + src;
  }));
};

AI.prototype.updateFlameFunction = function(playerId, pos, grid, remainTime, index, profit = {}, which = 'flameRemain') {
  const { x, y } = pos;

  const node = grid.getNodeAt(x, y);
  node[which] = [ ...(node[which] || []), remainTime];

  const score = this.scoreForBombing(playerId, pos, grid, remainTime);

  return this.mergeProfit(profit, score);
};

AI.prototype.reverseFlameFunction = function(playerId, pos, grid, remainTime, index, profit = {}, which = 'tempFlameRemain') {
  const { x, y } = pos;

  const node = grid.getNodeAt(x, y);
  delete node[which];

  return 0;
};

AI.prototype.scoreForBombing = function(playerId, pos, grid, remainTime) {
  const playerNumber = this.getPlayerNumber(playerId);
  const score = {};

  const { x, y } = pos;
  const node = grid.getNodeAt(x, y);

  // kill enemy
  const { myId, enemyId, map_info: { players } } = this.map;
  const id = myId == playerId ? enemyId : myId;
  const { [id]: { currentPosition: { col, row } } } = players;
  if (x == col && y == row) {
    score.enemy = 1;
  }

  if (node.value == 2 && grid.wouldStopFlameAt(x, y, remainTime)) {
    score.box = 1;
  }

  return score;
};

AI.prototype.scoreForWalk = function(playerId, pos, grid) {
  const score = {};

  const { x, y } = pos;
  const { map_info: { gifts, spoils } } = this.map;

  for (const spoil of spoils) {
    const { col, row, spoil_type } = spoil;
    if (x == col && y == row) {
      score['spoils'] = [ spoil_type ];
    }
  }
  for (const gift of gifts) {
    const { col, row, gift_type } = spoil;
    if (x == col && y == row) {
      score['gifts'] = [ gift_type ];
    }
  }

  return score;
};

AI.prototype.safeScoreForWalk = function(playerId, node, neighbor, travelCost) {
  const tpc = this.timeToCrossACell(playerId);

  const { flameRemain: f1 = [] } = node;
  const m1 = _(f1)
    .map(f => f - tpc * (travelCost - 1))
    .filter(f => f >= 0)
    .minBy() || 2000;

  const { flameRemain: f2 = [] } = neighbor;
  const m2 = _(f2)
    .map(f => f - tpc * travelCost)
    .filter(f => f >= 0)
    .minBy() || 2000;

  if (m2 > m1) {
    return 1;
  }

  return 0;
};

AI.prototype.timeToCrossACell = function(id) {
  const { timestamp, myId, map_info: { virusSpeed, humanSpeed, players } } = this.map;

  if (id == 'human') {
    var speed = humanSpeed;
  } else if (id == 'virus') {
    speed = virusSpeed;
  } else {
    speed = players[id].speed;
  }

  // need Q&A and confirm from BTC
  // current by hack of source code
  // I found that the value is 35 in traning mode and 55 in fighting mode
  const SIZE = myId.includes('player') ? 55 : 55;
  return 1000 * SIZE / speed;
};

AI.prototype.acceptFlame = function(remain, cost, preCost, tpc, offset) {
  const travelTime = tpc * cost;
  const remainOffet = tpc * preCost;

  // need so much more thinking about that formula about range time of flame effect
  // currenly, I approve that with:
  // flame time = 400ms
  // offset = 200
  const left = remain - tpc/2 - offset - remainOffet;
  const right = remain + 400 - remainOffet + tpc/2 + offset;

  if (travelTime > left && travelTime < right) {
    return false;
  } else {
    return true;
  }
};

AI.prototype.canPlayerWalkByFlame = function(playerId, node, neighbor, grid, cost, preCost = 0, offset = 200, includeTemp = true) {
  const tpc = this.timeToCrossACell(playerId);
  const travelTime = tpc * cost;

  let safe = true;

  /* check travel time with flame */
  const { flameRemain = [], tempFlameRemain = [] } = neighbor;
  const remainTime = [
    ..._.map(flameRemain, remain => ({ remain, preCost })),
  ];
  if (includeTemp) {
    remainTime.push(..._.map(tempFlameRemain, remain => ({ remain, preCost: 0 })));
  }

  for (const flame of remainTime) {
    const { remain, preCost } = flame;

    const accept = this.acceptFlame(remain, cost, preCost, tpc, offset);

    if (!accept) {
      safe = false;
      break;
    }
  }

  return safe;
};

AI.prototype.canPlayerWalkBySarsCov = function(playerId, node, neighbor, grid, cost, preCost = 0, offset = 200) {
  const tpc = this.timeToCrossACell(playerId);
  const travelTime = tpc * cost;

  /* check travel time with virus, human infected */
  const passive = this.playerPassiveNumber(playerId);
  const { virusTravel = [], humanTravel = [] } = node;
  const htpc = this.timeToCrossACell('human');
  const vtpc = this.timeToCrossACell('virus');

  let count = 0;

  for (const step of virusTravel) {
    const left = vtpc * step - vtpc/2 - 200;
    const right = vtpc * step + vtpc/2 + 200;

    if (travelTime > left && travelTime < right) {
      count++;
    }
  }

  for (const human of humanTravel) {
    const { step, infected } = human;

    if (!infected) {
      continue;
    }

    const left = htpc * step - htpc/2 - 200;
    const right = htpc * step + htpc/2 + 200;

    if (travelTime > left && travelTime < right) {
      count++;
    }
  }

  if (count > passive) {
    return false;
  }

  return true;
};

AI.prototype.tracePath = function(pos, grid) {
  let node = grid.getNodeAt(pos.x, pos.y);
  let directs = '';
  const positions = [{
    x: pos.x,
    y: pos.y
  }];

  while (node.parent) {
    const { parent } = node;
    const direct = getDirect({ x: parent.x, y: parent.y }, { x: node.x, y: node.y });
    directs = direct + directs;
    positions.splice(0, 0, {
      x: parent.x,
      y: parent.y
    });

    node = parent;
  }

  const { timestamp } = this.map;
  positions[0].visited = true;
  positions[0].timestamp = timestamp;

  return {
    directs,
    positions
  };
};

AI.prototype.scoreFn = function(node) {
  const {
    travelCost,
    scoreProfit = {},
    bombProfit = {}
  } = node;

  const { box = 0, enemy = 0, safe } = bombProfit;
  const { gifts = [], spoils = [] } = scoreProfit;

  let score = 0;

  if (safe) {
    score = score + 1 * box +  1 * enemy;
  }

  score = score + 1 * gifts.length;
  score = score + 1 * spoils.length;

  return score;
};

AI.prototype.roundScore = function(score) {
  return +(Math.round(score + 'e+2') + 'e-2');
};

AI.prototype.extremeFn = function(score, cost) {
  if (cost <= 0) {
    cost = 0.8;
  }

  if (cost > 1) {
    // cost = cost - 0.5;
    cost = cost * 0.85;
    cost = Math.sqrt(cost);
    // cost = cost * 0.9;
  }

  score = 1.0 * score / cost;
  // round by 0.1
  score = this.roundScore(score);
  if (score == 0) {
    score = 0.1;
  }

  return score;
};
//===============================================================
/*invoking here*/
AI.prototype.tick = function() {
  this.tree.tick({}, this.blackboard);

  const result = this.blackboard.get('result', true);

  return result;
};

export default AI;
