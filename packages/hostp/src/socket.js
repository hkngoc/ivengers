import io from 'socket.io-client';

const connect = (config, { onTicktack, onPlayerDrive, onConnected }) => {
  return new Promise((resolve, reject) => {
    const { host } = config;

    const socket = io(host);

    const handler = (calback, ...params) => {
      onTicktack.apply(this, [params]);
    };

    socket.on('connect', onConnected)
    socket.on('ticktack player', handler.bind(this, onTicktack));

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
