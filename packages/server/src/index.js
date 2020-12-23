import { createServer } from 'http';
// import Server from 'socket.io'; // for version 2
import { Server } from 'socket.io'; // for version 3

const sample = {
  "id": 5,
  "timestamp": 1608397456089,
  "map_info": {
    "size": {
      "cols": 26,
      "rows": 14
    },
    "players": [{
      "id": "player1-xxx",
      "currentPosition": {
        "col": 15,
        "row": 5
      },
      "spawnBegin": {
        "col": 15,
        "row": 5
      },
      "score": 0,
      "lives": 3,
      "gift": [],
      "speed": 200,
      "power": 3,
      "delay": 1200,
      "realityStone": 0,
      "powerStone": 0,
      "timeStone": 0,
      "box": 0,
      "hospital": 0,
      "pill": 0,
      "vaccine": 0,
      "human": 0,
      "virus": 0
    }, {
      "id": "player2-xxx",
      "currentPosition": {
        "col": 10,
        "row": 5
      },
      "spawnBegin": {
        "col": 10,
        "row": 5
      },
      "score": 0,
      "lives": 3,
      "gift": [],
      "speed": 200,
      "power": 1,
      "delay": 1200,
      "realityStone": 0,
      "powerStone": 0,
      "timeStone": 0,
      "box": 0,
      "hospital": 0,
      "pill": 0,
      "vaccine": 0,
      "human": 0,
      "virus": 0
    }],
    "map": [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 0, 1, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 1, 0, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 0, 1, 0, 2, 0, 2, 2, 2, 2, 0, 2, 0, 1, 0, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 4, 2, 2, 0, 1, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 1, 0, 2, 2, 5, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 0, 1, 2, 0, 0, 0, 2, 2, 0, 0, 0, 2, 1, 0, 2, 2, 2, 2, 2, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 0, 0, 1, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 2, 2, 2, 2, 2, 0, 1, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 1, 0, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 4, 2, 2, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 2, 2, 5, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 0, 1, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 0, 1, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    "bombs": [{
      "col": 15,
      "playerId": "player1-xxx",
      "remainTime": 2000,
      "row": 5
    }],
    "spoils": [],
    "gifts": [],
    "gameStatus": null,
    "viruses": [{
      "position": {
        "x": 19,
        "y": 2
      },
      "alive": true,
      "direction": 4
    }, {
      "position": {
        "x": 8,
        "y": 1
      },
      "alive": true,
      "direction": 2
    }, {
      "position": {
        "x": 19,
        "y": 10
      },
      "alive": true,
      "direction": 1
    }],
    "human": [{
      "position": {
        "x": 13,
        "y": 12
      },
      "alive": true,
      "infected": true,
      "direction": 3
    }, {
      "position": {
        "x": 6,
        "y": 9
      },
      "alive": true,
      "infected": true,
      "direction": 3
    }, {
      "position": {
        "x": 19,
        "y": 7
      },
      "alive": true,
      "infected": true,
      "direction": 1
    }, {
      "position": {
        "x": 13,
        "y": 1
      },
      "alive": true,
      "infected": true,
      "direction": 1
    }]
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
