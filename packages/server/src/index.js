import { createServer } from 'http';
// import Server from 'socket.io'; // for version 2
import { Server } from 'socket.io'; // for version 3

const sample = {
  "id": 132,
  "timestamp": 1610032774972,
  "map_info": {
    "size": {
      "cols": 26,
      "rows": 14
    },
    "players": {
      "player1-xxx": {
        "id": "player1-xxx",
        "currentPosition": {
          "col": 8,
          "row": 4
        },
        "spawnBegin": {
          "col": 1,
          "row": 11
        },
        "score": 40,
        "lives": 1000,
        "speed": 230,
        "power": 4,
        "delay": 1200,
        "box": 27,
        "pill": 9,
        "humanCured": 0,
        "virus": 2,
        "pillUsed": 2,
        "humanSaved": 0,
        "virusInfected": 0,
        "humanInfected": 0,
        "quarantine": 0
      },
      "player2-xxx": {
        "id": "player2-xxx",
        "currentPosition": {
          "col": 24,
          "row": 2
        },
        "spawnBegin": {
          "col": 24,
          "row": 2
        },
        "score": 0,
        "lives": 1000,
        "speed": 230,
        "power": 1,
        "delay": 1200,
        "box": 0,
        "pill": 0,
        "humanCured": 0,
        "virus": 0,
        "pillUsed": 0,
        "humanSaved": 0,
        "virusInfected": 0,
        "humanInfected": 0,
        "quarantine": 0
      }
    },
    "map": [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 1, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 1],
      [1, 0, 2, 0, 0, 6, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1],
      [1, 2, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 2, 0, 2, 0, 1, 1, 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 1, 7, 7, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 1, 2, 0, 0, 0, 2, 2, 0, 2, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 2, 1, 1, 2, 1, 1, 1, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 1, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 6, 0, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    "bombs": [{
      "row": 6,
      "col": 8,
      "remainTime": 360,
      "playerId": "player1-xxx",
      "power": 4,
      "index": 0
    }, {
      "row": 4,
      "col": 8,
      "remainTime": 2000,
      "playerId": "player1-xxx",
      "power": 4,
      "index": 1
    }],
    "spoils": [{
      "row": 12,
      "col": 5,
      "spoil_type": 5
    }, {
      "row": 12,
      "col": 2,
      "spoil_type": 4
    }, {
      "row": 8,
      "col": 1,
      "spoil_type": 5
    }, {
      "row": 4,
      "col": 7,
      "spoil_type": 5
    }, {
      "row": 4,
      "col": 2,
      "spoil_type": 5
    }, {
      "row": 12,
      "col": 3,
      "spoil_type": 5
    }, {
      "row": 5,
      "col": 1,
      "spoil_type": 4
    }, {
      "row": 6,
      "col": 5,
      "spoil_type": 5
    }, {
      "row": 5,
      "col": 6,
      "spoil_type": 5
    }, {
      "row": 8,
      "col": 10,
      "spoil_type": 5
    }],
    "gameStatus": null,
    "viruses": [{
      "position": {
        "col": 15,
        "row": 6
      },
      "direction": 4,
      "index": 0
    }],
    "human": [{
      "position": {
        "col": 18,
        "row": 6
      },
      "infected": true,
      "direction": 2,
      "curedRemainTime": 0,
      "index": 0
    }, {
      "position": {
        "col": 9,
        "row": 12
      },
      "infected": true,
      "direction": 1,
      "curedRemainTime": 0,
      "index": 1
    }, {
      "position": {
        "col": 18,
        "row": 5
      },
      "infected": true,
      "direction": 4,
      "curedRemainTime": 0,
      "index": 2
    }, {
      "position": {
        "col": 19,
        "row": 9
      },
      "infected": false,
      "direction": 2,
      "curedRemainTime": 0,
      "index": 3
    }],
    "virusSpeed": 52.5,
    "humanSpeed": 70,
    "gifts": []
  },
  "tag": "bomb:setup",
  "player_id": "player1-xxx",
  "myId": "player1-xxx",
  "enemyId": "player2-xxx",
  "playerNumber": {
    "player1-xxx": 9,
    "player2-xxx": 10
  }
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
