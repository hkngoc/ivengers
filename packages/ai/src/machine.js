import { connect } from '@ivengers/hostp';
import Brain from './brain';

const Machine = function(config) {
  const applied = {
    ...config,
    other: {
      rejectByStop: false // some other config. currenly, hardcode here
    }
  };

  this.config = applied;

  this.brain = new Brain(applied, this.onCalculated.bind(this));
};

Machine.prototype.onHeart = function() {
  // console.log('on heart');
  // flush throttled or request server event if no longer working
};

Machine.prototype.onCalculated = function({ directs } = {}) {
  if (this.socket && directs) {
    // socket emit drive result to server
    this.socket.emit('drive player', { direction: directs });
  }
};

Machine.prototype.onConnected = function() {
  const { gameId, playerId } = this.config;

  if (this.socket) {
    this.socket.emit('join game', { game_id: gameId, player_id: playerId });
  }
};

Machine.prototype.connect = async function() {
  const socket = await connect(this.config, {
    onConnected: this.onConnected.bind(this),
    onTicktack: this.ticktack.bind(this),
    // onPlayerDrive: this.onDrive.bind(this)
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
  this.brain.ticktack.apply(this.brain, data);
};

Machine.prototype.onDrive = function(data) {
  this.brain.onDrive.apply(this.brain, data);
};

export default Machine;
