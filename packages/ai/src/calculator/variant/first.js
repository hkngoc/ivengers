import {
  Priority, // Selector
  Sequence,
  Failer,
  Inverter
} from 'behavior3js';

import {
  FilterEvent,

  SyncData,
  UpdateFlame,
  UpdateVirus,
  UpdateHuman,
  UpdateGrid,
  UpdateLastResult,

  CalculateEmpty,
  CalculateBombDelay,

  TargetBonusStillGood,
  TargetSafeStillGood,
  KeepOldTarget,
  HasTarget,
  VoteTargetToCompareWithBomb,
  VoteBonusToCompareWithBomb,
  HasTargetToCompareWithBomb,

  FindBonusCandidate,
  HasBonusCandidate,
  TargetSuitableWithBonus,
  VoteBonusWithTarget,
  MoveToBonusWithTarget,
  NoBombLeft,
  VoteBonus,
  VoteBonusWithBombLeft,
  MoveToBonus,

  FindBombCandidate,
  HasBombCandidate,
  TargetSuitableWithBomb,
  VoteBombWithTarget,
  MoveToDropBombWithTarget,
  VoteBomb,
  MoveToDropBomb,

  SequenceAlwaysSuccess,
  CleanGrid,
  IsBombPrefix,
  IsNotSafe,
  FindSafePlace,
  TargetSuitableWithSafe,
  VoteSafePlaceWithTarget,
  MoveToSafeWithTarget,
  VoteSafePlace,
  MoveToSafe,
} from '../nodes';

import AI from './ai';

import { newChildObject } from '../../utils';

const First = function(...params) {
  AI.apply(this, [...params]);
};

First.prototype = newChildObject(AI.prototype);

First.prototype.buildTree = function() {
  return new Sequence({
    children:[
      // new FilterEvent(this),
      new SequenceAlwaysSuccess({
        name: 'pre-processing',
        children: [
          new SyncData(this),
          new UpdateLastResult(this),
          new UpdateFlame(this),
          // need implement guest path of virus/human more precision. Currently, ignore Hazard from virus/human
          new UpdateVirus(this),
          new UpdateHuman(this),
          // need implement update enemy grid in future
          new CalculateBombDelay(this),
          new CalculateEmpty(this),
          new UpdateGrid(this),
        ]
      }),
      new SequenceAlwaysSuccess({
        children: [
          new FindBombCandidate(this),
          new FindBonusCandidate(this)
        ]
      }),
      new Priority({
        children: [
          // new Sequence({
          //   name: 'Eat',
          //   children: [
          //     new HasBonusCandidate(this),
          //     new Priority({
          //       children: [
          //         new Sequence({
          //           name: 'keep old target if you can',
          //           children: [
          //             new HasTarget(this),
          //             new Priority({
          //               children: [
          //                 new TargetBonusStillGood(this),
          //                 // new TargetBombStillGood(this),
          //                 new TargetSafeStillGood(this)
          //               ]
          //             }),
          //             new Priority({
          //               children: [
          //                 new VoteTargetToCompareWithBomb(this),
          //                 new KeepOldTarget(this)
          //               ]
          //             })
          //           ]
          //         }),
          //         new Sequence({
          //           children: [
          //             new HasBombCandidate(this),
          //             new Priority({
          //               children: [
          //                 new Sequence({
          //                   children: [
          //                     new NoBombLeft(this),
          //                     new VoteBonus(this),
          //                     new MoveToBonus(this)
          //                   ]
          //                 }),
          //                 new VoteBonusToCompareWithBomb(this)
          //               ]
          //             })
          //           ]
          //         }),
          //         new Sequence({
          //           children: [
          //             new VoteBonus(this),
          //             new MoveToBonus(this)
          //           ]
          //         })
          //       ]
          //     }),
          //     new Inverter({
          //       child: new HasTargetToCompareWithBomb(this)
          //     })
          //   ]
          // }),
          new Sequence({
            children: [
              new HasBombCandidate(this),
              new Priority({
                children: [
                  new Sequence({
                    children: [
                      new TargetSuitableWithBomb(this),
                      new VoteBombWithTarget(this),
                      new MoveToDropBombWithTarget(this)
                    ]
                  }),
                  new Sequence({
                    children: [
                      new VoteBomb(this),
                      new MoveToDropBomb(this)
                    ]
                  })
                ]
              })
            ]
          }),
          new Sequence({
            name: 'Safe',
            children: [
              new SequenceAlwaysSuccess({
                children: [
                  new IsBombPrefix(this),
                  new CleanGrid(this),
                  new CalculateBombDelay(this), // drop virtual bomb in next step, so re-update map... my lost
                  new UpdateGrid(this),
                ]
              }),
              new IsNotSafe(this),
              new Priority({
                children: [
                  new FindSafePlace(this) // find fully safe place
                  // dead or alive. implement case all place are not safe -> find best place in that context
                ]
              }),
              new Priority({
                children: [
                  new Sequence({
                    children: [
                      new TargetSuitableWithSafe(this),
                      new VoteSafePlaceWithTarget(this),
                      new MoveToSafeWithTarget(this)
                    ]
                  }),
                  new Sequence({
                    children: [
                      new VoteSafePlace(this),
                      new MoveToSafe(this)
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
};

export default First;
