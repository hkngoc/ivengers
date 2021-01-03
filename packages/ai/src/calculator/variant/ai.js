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

const AI = function(map, config, lastResult) {
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
  if ([9, 10].includes(node.value) && node.value != playerNumber) {
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

AI.prototype.safeScoreForWalk = function(node, neighbor) {
  const { flameRemain: f1 = [] } = node;
  const max1 = _(f1).maxBy() || 0;

  const { flameRemain: f2 = [] } = neighbor;
  const max2 = _(f2).maxBy() || 0;

  if (max2 < max1) {
    return 1;
  }

  return 0;
};

AI.prototype.timeToCrossACell = function(id) {
  const { timestamp, map_info: { virusSpeed, humanSpeed, players } } = this.map;

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
  return 1000 * 55 / speed;
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

AI.prototype.extremeFn = function(score, cost) {
  if (cost <= 0) {
    cost = 0.7;
  }

  if (cost > 1) {
    cost = cost - 0.5;
  }

  score = 1.0 * score / cost;
  // round by 0.1
  score = Math.round((1.0 * score) / 0.1) * 0.1;
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
