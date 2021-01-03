import { createServer } from 'http';
// import Server from 'socket.io'; // for version 2
import { Server } from 'socket.io'; // for version 3

const sample = {
  "id": 1209,
  "timestamp": 1609662679978,
  "map_info": {
    "size": {
      "cols": 26,
      "rows": 14
    },
    "players": [{
      "id": "player1-xxx",
      "currentPosition": {
        "col": 19,
        "row": 9
      },
      "spawnBegin": {
        "col": 1,
        "row": 11
      },
      "score": 92,
      "lives": 999,
      "speed": 230,
      "power": 26,
      "delay": 1200,
      "box": 46,
      "pill": 28,
      "humanCured": 4,
      "virus": 2,
      "pillUsed": 6,
      "humanSaved": 1,
      "virusInfected": 0,
      "humanInfected": 0,
      "quarantine": 0
    }, {
      "id": "player2-xxx",
      "currentPosition": {
        "col": 7,
        "row": 9
      },
      "spawnBegin": {
        "col": 24,
        "row": 2
      },
      "score": 79,
      "lives": 995,
      "speed": 230,
      "power": 6,
      "delay": 1200,
      "box": 40,
      "pill": 27,
      "humanCured": 0,
      "virus": 3,
      "pillUsed": 3,
      "humanSaved": 3,
      "virusInfected": 0,
      "humanInfected": 0,
      "quarantine": 0
    }],
    "map": [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 7, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    "bombs": [],
    "spoils": [],
    "gameStatus": null,
    "viruses": [],
    "human": [{
      "position": {
        "col": 1,
        "row": 2
      },
      "infected": false,
      "direction": 4,
      "curedRemainTime": 0
    }],
    "virusSpeed": 52.5,
    "humanSpeed": 70
  },
  "tag": "update-data"
}


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
}

const sendBatch = () => {
  const data = sample;
  data.id = counter;

  for (const user of users) {
    user.emit('ticktack player', data);
  }
  counter++;

  timeout = setTimeout(() => {
    sendBatch();
  }, CYCLE);
}

const addUser= (user) => {
  const exist = users.find(u => u.id == user.id);
  if (!exist) {
    users.push(user);
  }
}

const removeUser = (user) => {
  users = users.filter(u => u.id != user.id);

  if (users.length <= 0) {
    clearBatch();
  }
}

// when each client connect to
io.on('connection', (socket) => {
  // identify by socket.id
  addUser(socket);

  socket.on('join game', () => {
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
