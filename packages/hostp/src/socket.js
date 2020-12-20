import io from 'socket.io-client';

const connect = (config, { ticktack, onConnected }) => {
  return new Promise((resolve, reject) => {
    const { host } = config;

    const socket = io(host);

    const handleTicktack = (...params) => {
      if (ticktack && typeof (ticktack) == "function") {
        ticktack(params);
      }
    };

    socket.on('connect', onConnected)
    socket.on('ticktack player', handleTicktack);

    resolve(socket);
  });
}

const disconnect = (socket) => {
  if (socket) {
    socket.close();
  }
}

export default connect;
export {
  disconnect
}
