import ai from '../calculator';
import { throttle } from '../utils';

const Brain = function(config, callback) {
  this.config = config;
  this.callback = callback;
  this.throttled = throttle(ai, this.onCalculated.bind(this));
  // this.lastResult = JSON.parse(`{"directs":"b11441444444111","positions":[{"x":8,"y":4,"visited":true,"timestamp":1610032774846},{"x":7,"y":4},{"x":6,"y":4},{"x":6,"y":5},{"x":6,"y":6},{"x":5,"y":6},{"x":5,"y":7},{"x":5,"y":8},{"x":5,"y":9},{"x":5,"y":10},{"x":5,"y":11},{"x":5,"y":12},{"x":4,"y":12},{"x":3,"y":12},{"x":2,"y":12}],"winner":{"position":{"x":2,"y":12},"score":6,"extreme":1.74,"cost":14},"which":"safe"}`);
  this.lastResult = null;
  this.lastMap = null;
  this.enemyDrive = null;
};

Brain.prototype.ticktack = function(map) {
  // some logic handle latest data, middleware ...
  this.lastMap = map;

  // invoke ai func with some data from preprocessing
  this.throttled.apply(this, [map, this.config, this.lastResult, this.enemyDrive]);
};

Brain.prototype.onDrive = function(data) {
  const { direction, player_id } = data;
  const { playerId } = this.config;

  if (!playerId.startsWith(player_id) && this.lastMap) {
    // enemy drive
    const { map_info: { players: { [player_id]: { currentPosition } } } } = this.lastMap;
    this.enemyDrive = {
      directs: direction,
      position: currentPosition
    }
  }
};

Brain.prototype.onCalculated = function(result) {
  this.lastResult = result;

  console.log(result);
  if (!result) {
    return;
  }

  const { watch } = result;
  // console.log(result, watch);

  if (this.callback && !watch) {
    this.callback(result);
  }
};

export default Brain;
