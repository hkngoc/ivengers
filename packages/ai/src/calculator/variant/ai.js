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

  // return 0; // mock
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

AI.prototype.getEnemyPlayer = function() {
  const { enemyId } = this.map;

  return this.getPlayer(enemyId);
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
      const merged =  [ ...(obj || []), ...src ];
      if (key == 'virus' || key == 'human') {
        return _.uniqBy(merged, 'index');
      } else {
        return merged;
      }
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

AI.prototype.scoreForWalk = function(playerId, node, neighbor, grid, travelCost, offset = 100, scoreProfit = {}) {
  const { map_info: { gifts, spoils } } = this.map;

  const { x, y, virusTravel = [], humanTravel = [] } = neighbor;
  const score = {};

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

  const tpc = this.timeToCrossACell(playerId);
  const travelTime = tpc * travelCost;
  const left = travelTime - tpc/2;
  const right = travelTime + tpc/2;

  const vtpc = this.timeToCrossACell('virus');
  for (const v of virusTravel) {
    const { index, step, main = false } = v;

    const vTravelTime = step * vtpc;
    const vLeft       = vTravelTime - vtpc/2 - offset;
    const vRight      = vTravelTime + vtpc/2 + offset

    if ((vLeft < left && left < vRight) || (vLeft < right && right < vRight)) {
      score['virus'] = [ ...score['virus'] || [], v ];
    }
  }

  const htpc = this.timeToCrossACell('human');

  let human = 0;
  for (const h of humanTravel) {
    const { step, curedRemainTime = 0, main = false } = h;

    const hTravelTime = curedRemainTime + step * htpc;
    const hLeft       = hTravelTime - htpc/2 - offset;
    const hRight      = hTravelTime + htpc/2 + offset;

    if ((hLeft < left && left < hRight) || (hLeft < right && right < hRight)) {
      score['human'] = [ ...score['human'] || [], h ];
    }
  }

  // const { scoreProfit = {} } = node;
  return {
    score,
    merged: this.mergeProfit(scoreProfit, score)
  };
};

AI.prototype.safeScoreForWalk = function(playerId, node, neighbor, travelCost) {
  const tpc = this.timeToCrossACell(playerId);

  const { flameRemain: f1 = [] } = node;
  const m1 = _(f1)
    .map(f => f - tpc * (travelCost - 1))
    .filter(f => f >= 0)
    .minBy() || 0;

  const { flameRemain: f2 = [] } = neighbor;
  const m2 = _(f2)
    .map(f => f - tpc * travelCost)
    .filter(f => f >= 0)
    .minBy() || 0;

  if (m1 > 0) {
    if (m2 > 0 && m2 <= m1) {
      return -1;
    } else {
      return 1;
    }
  } else {
    if (m2 > 0) {
      return -1;
    }
  }

  return 0;
};

AI.prototype.fasterEnemy = function(node, travelCost, preCost = 0) {
  const { enemyTravelCost } = node;

  if (enemyTravelCost >= 0 && enemyTravelCost <= travelCost + preCost) {
    return false;
  }

  return true;
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
  const travelTime = tpc * (cost + preCost);

  // need so much more thinking about that formula about range time of flame effect
  // currenly, I approve that with:
  // flame time = 400ms
  // offset = 200

  if ((travelTime - tpc/2 > remain + 400 + offset * 1.5) || (travelTime + tpc/2 < remain - offset)) {
    return true;
  } else {
    return false;
  }
};

AI.prototype.canPlayerWalkByFlame = function(playerId, node, neighbor, grid, cost, preCost = 0, offset = 300, includeTemp = true) {
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

AI.prototype.canPlayerWalkBySarsCov = function(playerId, node, neighbor, grid, cost, preCost = 0, offset = 300, byPassParam, profit = {}) {
  const tpc = this.timeToCrossACell(playerId);
  const travelTime = tpc * cost;

  /* check travel time with virus, human infected */
  const passive = this.playerPassiveNumber(playerId);
  const { virus = [], human = [] } = profit;

  const passiveNeededByHuman = _(human)
    .groupBy('index')
    .map((v, k) => {
      const infected = _.find(v, h => h.infected == true);
      return infected ? 1 : 0
    })
    .sum();

  if (passive < virus.length + passiveNeededByHuman) {
    return false;
  }

  return true;
};

AI.prototype.countingScareByRadar = function(node, grid, offset = 2) {
  const { x, y } = node;
  const scare = [];

  for (let i = -1 * offset; i <= offset; i++) {
    for (let j = -1 * offset; j <= offset; j++) {
      if (!grid.isInside(x + i, y + j)) {
        continue;
      }
      const near = grid.getNodeAt(x + i, y + j);
      if (!near.travelCost || near.travelCost > (Math.abs(i) + Math.abs(j))) {
        continue;
      }
      const { humanTravel = [], virusTravel = [] } = near;
      scare.push(..._.map(humanTravel, h => ({ ...h, type: 'human' })));
      scare.push(..._.map(virusTravel, v => ({ ...v, type: 'virus' })));
    }
  }

  return scare;
};

AI.prototype.humanCanBeInfected = function(pos, grid, cost, offset = 300) {
  const { x, y } = pos;
  const node = grid.getNodeAt(x, y);
  const { humanTravel = [], virusTravel = [] } = node;

  const htpc = this.timeToCrossACell('human');
  const vtpc = this.timeToCrossACell('virus');

  const travelTime = htpc * cost;
  const left = travelTime - htpc/2;
  const right = travelTime + htpc/2;

  for (const h of humanTravel) {
    if (h.infected == false) {
      continue;
    }

    const { step, curedRemainTime = 0, main = false } = h;

    if (main == false && step > 3) {
      continue;
    }

    const hTravelTime = curedRemainTime + step * htpc;
    const hLeft       = hTravelTime - htpc/2 - offset;
    const hRight      = hTravelTime + htpc/2 + offset;

    if ((hLeft < left && left < hRight) || (hLeft < right && right < hRight)) {
      return true;
    }
  }

  for (const v of virusTravel) {
    const { index, step, main = false } = v;
    if (main == false && step > 3) {
      continue;
    }

    const vTravelTime = step * vtpc;
    const vLeft       = vTravelTime - vtpc/2 - offset;
    const vRight      = vTravelTime + vtpc/2 + offset

    if ((vLeft < left && left < vRight) || (vLeft < right && right < vRight)) {
      return true;
    }
  }

  return false;
};

AI.prototype.checkPathCanWalk = function(positions) {
  const { map: { myId }, grid }= this;

  const index = _.findLastIndex(positions, p => p.visited == true);

  let wakable = true;
  let travelCost = 1;
  let profit = {};
  for (let i = index; i < positions.length - 1; i++) {
    const node = positions[i];
    const neighbor = positions[i+1];

    const { score, merged } = this.scoreForWalk(myId, node, neighbor, grid, travelCost, 100, profit);
    wakable = this.canPlayerWalkByFlame(
      myId,
      grid.getNodeAt(node.x, node.y),
      grid.getNodeAt(neighbor.x, neighbor.y),
      grid,
      travelCost,
      0,
      300,
      false
    ) && this.canPlayerWalkBySarsCov(
      myId,
      grid.getNodeAt(node.x, node.y),
      grid.getNodeAt(neighbor.x, neighbor.y),
      grid,
      travelCost,
      0,
      300,
      false,
      profit
    )
    profit = merged;
    travelCost++;

    if (!wakable) {
      break;
    }
  }

  return wakable;
};

AI.prototype.checkPathInDanger = function(positions) {
  const { map: { myId }, grid }= this;

  const index = _.findLastIndex(positions, p => p.visited == true);
  const left = index >= 2 ? index - 2 : 0;

  let profit = {};
  let accept = true;
  for (let i = left; i <= index; i++) {
    const node = grid.getNodeAt(positions[i].x, positions[i].y);

    const { flameRemain = [], humanTravel = [], virusTravel = [] } = node;
    profit = this.mergeProfit(profit, { humanTravel, virusTravel });
    if (flameRemain.length > 0) {
      accept = false;
      break;
    }
  }

  if (accept) {
    const passive = this.playerPassiveNumber(myId);
    const { humanTravel = [], virusTravel = []} = profit;
    if (passive < humanTravel.length + virusTravel) {
      accept = false;
    }
  }

  return accept;
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

AI.prototype.scoreForSpoils = function(spoils) {
  return _(spoils)
    .map(spoil => {
      switch (spoil) {
        case 5:
          return 4.0;
        case 3:
        case 4:
          return 1.0;
        default:
          return 0.5;
      }
    })
    .sum();
};

AI.prototype.countingScore = function(obj) {
  const { box = 0, enemy = 0, gifts = [], spoils = [], virus = [], human = [] } = obj;

  let score = 0;

  score = score + 0.75 * box;
  score = score + 1.0 * enemy; // disable to debug
  score = score + 0.5 * virus.length;
  score = score + _.sumBy(human, h => h.infected ? 0.5 : 1.0);
  score = score + 1.8 * gifts.length; // can be score by type of gift or spoil...
  score = score + this.scoreForSpoils(spoils);

  return score;
};

AI.prototype.scoreFn = function(node) {
  const {
    travelCost,
    scoreProfit = {},
    bombProfit = {}
  } = node;

  const { box = 0, enemy = 0, safe } = bombProfit;
  const { gifts = [], spoils = [], virus = [], human = [] } = scoreProfit;

  return this.countingScore({
    gifts,
    spoils,
    box: safe ? box : 0,
    enemy: safe ? enemy : 0
  });
};

AI.prototype.roundScore = function(score, offset = 0.00005) {

  return +(Math.round((Math.round(score /offset) * offset) + 'e+5') + 'e-5');
};

AI.prototype.extremeFn = function(score, cost) {
  if (cost <= 0) {
    cost = 0.85;
  } else if (cost == 1) {
    cost = 1.1;
  } else {
    // cost = cost - 0.5;
    cost = cost * 0.85;
    cost = Math.pow(cost, 6/10);
    // cost = cost * 0.9;
  }

  score = 1.0 * score / cost;
  // round by 0.1
  score = this.roundScore(score);

  // why ??
  // if (score == 0) {
  //   score = 0.1;
  // }

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
