import ai from '../calculator';
import { throttle } from '../utils';

const Brain = function(config, callback) {
  this.config = config;
  this.callback = callback;
  this.throttled = throttle(ai, this.onCalculated.bind(this));
  this.lastResult = null;
};

Brain.prototype.ticktack = function(map) {
  // some logic handle latest data, middleware ...
  // const { tag } = map;

  // invoke ai func with some data from preprocessing
  this.throttled.apply(this, [map, this.config, this.lastResult]);
};

Brain.prototype.onCalculated = function(result) {
  this.lastResult = result;

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
