import ai from '../calculator';
import { throttle } from '../utils';

const Brain = function(config, callback) {
  this.config = config;
  this.throttled = throttle(ai, callback);
};

Brain.prototype.ticktack = function(map) {
  // some logic handle latest data, middleware ...
  // const { tag } = map;

  // invoke ai func with some data from preprocessing
  this.throttled.apply(this, [map, this.config]);
};

export default Brain;
