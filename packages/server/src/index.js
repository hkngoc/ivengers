import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.REACT_APP_SERVER_PORT;
const CYCLE = process.env.REACT_APP_SERVER_CYCLE;

console.log(`start server at ${PORT} with CYCLE=${CYCLE}`);

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

let counter = 0;
let timeout = null;
let users = [];

const clearBatch = () => {
  counter = 0;
  clearTimeout(timeout);
  timeout = null;
};

const sendBatch = () => {
  for (const user of users) {
    user.emit('batch', [ counter ]);
  }
  counter++;

  timeout = setTimeout(() => {
    sendBatch();
  }, CYCLE);
};

const addUser= (user) => {
  const exist = users.find(u => u.id == user.id);
  if (!exist) {
    users.push(user);
  }
};

const removeUser = (user) => {
  users = users.filter(u => u.id != user.id);

  if (users.length <= 0) {
    clearBatch();
  }
};

// when each client connect to
io.on('connection', (socket) => {
  // identify by socket.id
  addUser(socket);

  socket.on('start', () => {
    if (timeout == null) {
      clearBatch();
      sendBatch();
    }
  });

  socket.on('end', () => {
    clearBatch();
  });

  socket.on('disconnect', () => {
    removeUser(socket);
  });
});

httpServer.listen(PORT);
