import {
  Grid,
  DiagonalMovement
} from 'pathfinding';

const Direct = {
  LEFT: '1',
  RIGHT: '2',
  UP: '3',
  DOWN: '4'
};

const Pos = function(x, y) {
  this.x = x;
  this.y = y;
}

Pos.prototype.adj = function(direct) {
  switch (direct) {
    case Direct.LEFT:
      return new Pos(this.x - 1, this.y);
    case Direct.RIGHT:
      return new Pos(this.x + 1, this.y);
    case Direct.UP:
      return new Pos(this.x, this.y - 1);
    case Direct.DOWN:
      return new Pos(this.x, this.y + 1);
  }
}

Pos.prototype.directTo = function(other) {
  if (this.x == other.x) {
    if (this.y < other.y) {
      return Direct.DOWN;
    } else {
      return Direct.UP;
    }
  } else {
    if (this.x < other.x) {
      return Direct.RIGHT;
    } else {
      return Direct.LEFT;
    }
  }
}

class MyGrid extends Grid {
  constructor(width, height, matrix) {
    super(width, height, matrix);

    this.matrix = matrix;
  }

  dropBomb(x, y) {
    this.matrix[y][x] = 3;
    this.setWalkableAt(x, y, false);
  }
}

export {
  Direct,
  Pos
}
