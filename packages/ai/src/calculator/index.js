import {
  BehaviorTree,
  Blackboard,
  Priority, // Selector
  Sequence, //
  Failer
} from 'behavior3js';

import {
  SyncData,
  UpdateGrid,
  UpdateFlame
} from './nodes';

//===============================================================
const wait = (amount) => {
  return new Promise(resolve => {
    return setTimeout(resolve, amount);
  });
}

//===============================================================
/*definitation here*/
const AI = function(map, config) {
  const tree = new BehaviorTree(null, {
    title: "BTs of iVengers"
  });
  tree.root = this.buildTree();

  const blackboard = new Blackboard();

  this.map = map;
  this.blackboard = blackboard;
  this.tree       = tree;
  this.config     = config;
}

AI.prototype.buildTree = function() {
  return new Priority({
    children:[
      new Sequence({
        name: 'pre-processing',
        children: [
          new SyncData(this),
          new UpdateFlame(this),
          new UpdateGrid(this),
          new Failer() // make sequence pre-process alway Fail
        ]
      }),
      new Sequence({
        name: 'Eat',
        children: [
        ]
      }),
      new Sequence({
        name: 'Bomb',
        children: []
      }),
      new Sequence({
        name: 'Safe',
        children: []
      })
    ]
  });
}

//===============================================================
/*common func here*/
AI.prototype.getPlayerSortId = function(id) {
  const split = id.split('-');
  return `${split[0]}-${split[1]}`;
}

AI.prototype.drawBombFlames = function(bomb, grid) {

}

//===============================================================
/*invoking here*/
AI.prototype.tick = function() {
  this.tree.tick({}, this.blackboard);
}

const wrapper = async (...params) => {
  // console.log(JSON.stringify(params));

  const result = await new Promise((resolve) => {
    const directions = new AI(...params).tick();

    resolve(directions);
  });

  // just mock for currenly implement
  await wait(250);

  return result;
}

export default wrapper;
