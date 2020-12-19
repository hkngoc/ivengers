import ai from '@test/ai';
import connect from './socket';
import throttle from './throttle';

const Machine = function(config) {
  this.config = config;
  this.throttled = throttle(ai);
};

Machine.prototype.onHeart = function() {
  // console.log("on heart");
  // flush throttled or request server event if no longer working
};

Machine.prototype.onConnected = function() {
  const { gameId, playerId } = this.config;

  if (this.socket) {
    this.socket.emit('join game', { game_id: gameId, player_id: playerId });
  }
};

Machine.prototype.connect = async function() {
  const socket = await connect(this.config, {
    ticktack: this.ticktack.bind(this),
    onConnected: this.onConnected.bind(this)
  });
  this.socket = socket;

  return socket;
};

Machine.prototype.disconnect = function() {
  if (this.socket) {
    this.socket.close();
  }

  this.socket = null;
};

Machine.prototype.ticktack = function(data) {
  this.throttled.apply(this, data);
};

export default Machine;
