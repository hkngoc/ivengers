import { connect } from '@ivengers/hostp';

const GamePad = function(config) {
  this.config = config;
};

GamePad.prototype.onConnected = function() {
  const { gameId, playerId } = this.config;

  if (this.socket) {
    this.socket.emit('join game', { game_id: gameId, player_id: playerId });
  }
};

GamePad.prototype.ticktack = function(data) {
  // console.log(...data);
};

GamePad.prototype.connect = async function() {
  const socket = await connect(this.config, {
    onConnected: this.onConnected.bind(this),
    onTicktack: this.ticktack.bind(this),
    onPlayerDrive: this.onDrive.bind(this)
  });
  this.socket = socket;

  return socket;
};

GamePad.prototype.drive = function(directions) {
  if (this.socket) {
    this.socket.emit('drive player', { direction: directions });
  }
};

GamePad.prototype.disconnect = function() {
  if (this.socket) {
    this.socket.close();
  }

  this.socket = null;
};

GamePad.prototype.onDrive = function (data) {
  console.log(...data);
};

export default GamePad;
