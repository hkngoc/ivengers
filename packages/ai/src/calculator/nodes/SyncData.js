import {
  SUCCESS
} from 'behavior3js';
import _ from 'lodash';

import { newChildObject } from '../../utils';
import MyBaseNode from './MyBaseNode';

const SyncData = function(ref) {
  MyBaseNode.apply(this, [ref]);
};

SyncData.prototype = newChildObject(MyBaseNode.prototype);

SyncData.prototype.tick = function(tree) {
  let { map, config: { playerId } } = this.ref;
  let { map_info: { players, bombs, size: { cols, rows } } } = map;

  // map players from array to map
  players = _.keyBy(players, "id");
  map.map_info.players = players;

  // sync bomb power by reference bomb.playerId to 
  bombs = _.map(bombs, bomb => {
    const { playerId } = bomb;

    return {
      ...bomb,
      power: players[playerId].power
    };
  });
  map.map_info.bombs = bombs;

  // map player sort Id
  const myId = this.ref.getPlayerSortId(playerId);
  const enemies = _(players)
    .keys()
    .filter(k => k !== myId)
    .value();

  const enemyId = enemies[0];
  const { col, row } = players[enemyId].currentPosition;
  map.map_info.map[row][col] = 6;

  map.myId = myId;
  map.enemyId = enemyId;

  // hot fix
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (map.map_info.map[i][j] == null) {
        map.map_info.map[i][j] = 5;
      }
    }
  }

  this.ref.map =  map;

  return SUCCESS;
}

export default SyncData;
