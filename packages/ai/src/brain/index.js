import ai from '../calculator';
import { throttle } from '../utils';

const Brain = function(config, callback) {
  this.config = config;
  this.throttled = throttle(ai, callback);
};

Brain.prototype.ticktack = function(data) {
  // some logic handle latest data, middleware ...
  this.lastData = data;

  // invoke ai func with some data from preprocessing
  this.throttled.apply(this, [...data, "moredata"]);
};

export default Brain;
