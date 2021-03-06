import AI from './ai';
import _ from 'lodash';

AI.prototype.scoreForSpoils = function(spoils) {
  return _(spoils)
    .map(spoil => {
      switch (spoil) {
        case 5:
          // pill
          return 2.5;
        case 3:
          // increase power 1
          return 1.0;
        case 4:
          // decrease delay 400
          return 1.0;
        default:
          return 0.5;
      }
    })
    .sum();
};

AI.prototype.scoreForHuman = function(human) {
  const { infected = true } = human;

  return infected ? 0.6 : 1.5;
};

AI.prototype.scoreFor = function(which) {
  switch (which) {
    case 'box':
      return 0.75;
    case 'enemy':
      return 1.0;
    case 'virus':
      return 0.4;
    case 'gifts':
      return 1.5;
    default:
      return 0.5;
  }
};

AI.prototype.scoreForWalk = function(playerId, node, neighbor, grid, travelCost, offset = 700, scoreProfit = {}) {
  const { map_info: { gifts, spoils } } = this.map;

  const { x, y, virusTravel = [], humanTravel = [] } = neighbor;
  const score = {};

  for (const spoil of spoils) {
    const { col, row, spoil_type } = spoil;
    if (x == col && y == row) {
      score['spoils'] = [ spoil_type ];
    }
  }
  for (const gift of gifts) {
    const { col, row, gift_type } = spoil;
    if (x == col && y == row) {
      score['gifts'] = [ gift_type ];
    }
  }

  const tpc = this.timeToCrossACell(playerId);
  const travelTime = tpc * travelCost;
  const left = travelTime - tpc/2;
  const right = travelTime + tpc/2;

  const vtpc = this.timeToCrossACell('virus');
  for (const v of virusTravel) {
    const { index, step, main = false } = v;

    const vTravelTime = step * vtpc;
    const vLeft       = vTravelTime - vtpc/2 - offset;
    const vRight      = vTravelTime + vtpc/2 + offset

    if ((vLeft < left && left < vRight) || (vLeft < right && right < vRight)) {
      score['virus'] = [ ...score['virus'] || [], v ];
    }
  }

  const htpc = this.timeToCrossACell('human');

  let human = 0;
  for (const h of humanTravel) {
    const { step, curedRemainTime = 0, main = false } = h;

    const hTravelTime = curedRemainTime + step * htpc;
    const hLeft       = hTravelTime - htpc/2 - offset;
    const hRight      = hTravelTime + htpc/2 + offset;

    if ((hLeft < left && left < hRight) || (hLeft < right && right < hRight)) {
      score['human'] = [ ...score['human'] || [], h ];
    }
  }

  // const { scoreProfit = {} } = node;
  return {
    score,
    merged: this.mergeProfit(scoreProfit, score)
  };
};

AI.prototype.safeScoreForWalk = function(playerId, node, neighbor, travelCost) {
  const tpc = this.timeToCrossACell(playerId);

  const { flameRemain: f1 = [] } = node;
  const m1 = _(f1)
    .map(f => f - tpc * (travelCost - 1))
    .filter(f => f >= 0)
    .minBy() || 0;

  const { flameRemain: f2 = [] } = neighbor;
  const m2 = _(f2)
    .map(f => f - tpc * travelCost)
    .filter(f => f >= 0)
    .minBy() || 0;

  if (m1 > 0) {
    if (m2 > 0 && m2 <= m1) {
      return -1;
    } else {
      return 1;
    }
  } else {
    if (m2 > 0) {
      return -1;
    }
  }

  return 0;
};

AI.prototype.countingScore = function(obj) {
  const { box = 0, enemy = 0, gifts = [], spoils = [], virus = [], human = [], scare = 0 } = obj;

  let score = 0;

  score = score + box * this.scoreFor('box');
  score = score + enemy * this.scoreFor('enemy');
  score = score + this.scoreFor('virus') * _(virus).filter(v => v.main == true).sumBy(v => 1);
  score = score + _(human).filter(h => h.main == true).sumBy(h => this.scoreForHuman(h));
  score = score + this.scoreFor('gifts') * gifts.length; // can be score by type of gift or spoil...
  score = score + this.scoreForSpoils(spoils);
  score = score - 0.3 * scare;

  return score;
};

AI.prototype.scoreFn = function(node, scare = 0) {
  const {
    travelCost,
    scoreProfit = {},
    bombProfit = {}
  } = node;

  const { box = 0, enemy = 0, safe } = bombProfit;
  const { gifts = [], spoils = [], virus = [], human = [] } = scoreProfit;

  return this.countingScore({
    gifts,
    spoils,
    box: safe ? box : 0,
    enemy: safe ? enemy : 0,
    virus,
    human,
    scare
  });
};

AI.prototype.roundScore = function(score, offset = 0.00005) {

  return +(Math.round((Math.round(score /offset) * offset) + 'e+5') + 'e-5');
};

AI.prototype.extremeFn = function(score, cost) {
  if (cost <= 0) {
    cost = 0.85;
  } else if (cost == 1) {
    cost = 1.1;
  } else {
    // cost = cost - 0.5;
    cost = cost * 0.85;
    cost = Math.pow(cost, 6/10);
    // cost = cost * 0.9;
  }

  score = 1.0 * score / cost;
  // round by 0.1
  score = this.roundScore(score);

  // why ??
  // if (score == 0) {
  //   score = 0.1;
  // }

  return score;
};

export default AI;
