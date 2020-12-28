import {
  BehaviorTree,
  Blackboard,
  Priority, // Selector
  Sequence, //
  Inverter,
  Failer
} from 'behavior3js';

import _ from 'lodash';
import Logger from 'js-logger';

import {
  SyncData,
  UpdateFlame,
  UpdateVirus,
  UpdateHuman,
  UpdateGrid,
  FindBonusCandidate,
  NoBombLeft,
  VoteBonus,
  VoteBonusWithBombLeft,
  MoveToBonus,
  CalculateBombDelay,
  FindBombCandidate,
  VoteBomb,
  MoveToDropBomb,
  IsNotSafe,
  FindSafePlace,
  VoteSafePlace,
  MoveToSafe,
} from './nodes';

import {
  Pos,
  Direct,
  DirectOf,
  getDirect
} from './helper';

//===============================================================
const wait = (amount) => {
  return new Promise(resolve => {
    return setTimeout(resolve, amount);
  });
};

//===============================================================
/*definitation here*/
const AI = function(map, config) {
  const tree = new BehaviorTree(null, {
    title: 'BTs of iVengers'
  });
  tree.root = this.buildTree();

  const blackboard = new Blackboard();

  this.map        = map;
  this.tree       = tree;
  this.config     = config;
  this.blackboard = blackboard;
};

AI.prototype.buildTree = function() {
  return new Priority({
    children:[
      new Sequence({
        name: 'pre-processing',
        children: [
          new SyncData(this),
          new UpdateFlame(this),
          // need implement guest path of virus/human more precision. Currently, ignore Hazard from virus/human
          new UpdateVirus(this),
          new UpdateHuman(this),
          // need implement update enemy grid in future
          new UpdateGrid(this),
          new Failer() // make sequence pre-process alway Fail
        ]
      }),
      new Sequence({
        name: 'Eat',
        children: [
          // new Inverter({
          //   child: new IsNotSafe(this)
          // }),
          // // new NoBombLeft(this), // dump
          // new CalculateBombDelay(this),
          // new FindBonusCandidate(this),
          // new Priority({
          //   children: [
          //     new Sequence({
          //       children: [
          //         new NoBombLeft(this),
          //         new VoteBonus(this)
          //       ]
          //     }),
          //     new Priority({
          //       children: [
          //         new VoteBonusWithBombLeft(this),
          //         new VoteBonus(this)
          //       ]
          //     })
          //   ]
          // }),
          // new MoveToBonus(this)
          new Failer()
        ]
      }),
      new Sequence({
        name: 'Bomb',
        children: [
          new Inverter({
            child: new IsNotSafe(this)
          }),
          new CalculateBombDelay(this),
          new FindBombCandidate(this),
          new VoteBomb(this),
          new MoveToDropBomb(this)
        ]
      }),
      new Sequence({
        name: 'Safe',
        children: [
          new IsNotSafe(this),
          new Priority({
            children: [
              new FindSafePlace(this) // find really safe place
              // dead or alive. implement case all place are not safe -> find best place in that context
            ]
          }),
          new VoteSafePlace(this),
          new MoveToSafe(this)
        ]
      })
    ]
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

AI.prototype.drawBombFlames = function(bomb, grid, fn) {
  const { col, row, remainTime, power, index, playerId } = bomb;

  const pos = new Pos(col, row);

  let directs = {};
  directs[Direct.LEFT] = pos;
  directs[Direct.RIGHT] = pos;
  directs[Direct.UP] = pos;
  directs[Direct.DOWN] = pos;

  let flameSize = power;//boot bomb power
  // let score = 0;

  let profit = fn.apply(this, [playerId, pos, grid, remainTime, index]);

  while (flameSize > 0 && _.keys(directs).length > 0) {
    for (const direct in directs) {
      const p = directs[direct];
      const near = p.adj(direct);

      // update grid at near
      profit = fn.apply(this, [playerId, near, grid, remainTime, index, profit]);

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

AI.prototype.scoreForBombing = function(playerId, pos, grid, remainTime) {
  const playerNumber = this.getPlayerNumber(playerId);
  const score = {};

  const { x, y } = pos;
  const node = grid.getNodeAt(x, y);

  // kill enemy
  if ([9, 10].includes(node.value) && node.value != playerNumber) {
    score.enemy = 1;
  }

  // need implement with remainTime for better. Other bomb with smaller remain will explore that box early
  if (node.value == 2) {
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

AI.prototype.timeToCrossACell = function(id) {
  const { map_info: { players: { [id]: player } } } = this.map;
  const { speed } = player;

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

  positions[0].visited = true;

  return {
    directs,
    positions
  };
};

//===============================================================
/*invoking here*/
AI.prototype.tick = function() {
  this.tree.tick({}, this.blackboard);

  const result = this.blackboard.get('result', true);

  return result;
};

const wrapper = async (...params) => {
  // console.log(JSON.stringify(params));
  // console.log(params);

  Logger.useDefaults();
  Logger.time('logic');
  const result = await new Promise((resolve) => {
    const directions = new AI(...params).tick();

    resolve(directions);
  });
  Logger.timeEnd('logic');

  // just mock for currenly implement
  await wait(170);

  return result;
};

export default wrapper;
