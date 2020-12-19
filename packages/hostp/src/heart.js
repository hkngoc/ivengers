const CYCLE = process.env.REACT_APP_HEART_CYCLE;

const Heart = function(callback) {
  this.callback = callback;
  this.timeout = null;
};

Heart.prototype.start = function() {
  this.timeout = setTimeout(() => {
    if (this.callback && typeof(this.callback) == "function") {
      this.callback();
    }
    this.start();
  }, CYCLE);
};

Heart.prototype.idle = function() {
  clearTimeout(this.timeout);
};

export default Heart;
