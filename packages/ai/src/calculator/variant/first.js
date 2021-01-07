import {
  Priority, // Selector
  Sequence,
  Failer,
  Inverter
} from 'behavior3js';

import {
  SyncData,
  UpdateFlame,
  UpdateVirus,
  UpdateHuman,
  UpdateGrid,
  UpdateLastResult,

  CalculateEmpty,
  CalculateBombDelay,

  FindBonusCandidate,
  TargetSuitableWithBonus,
  VoteBonusWithTarget,
  MoveToBonusWithTarget,
  NoBombLeft,
  VoteBonus,
  VoteBonusWithBombLeft,
  MoveToBonus,

  FindBombCandidate,
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
          new FindBombCandidate(this),
          new FindBonusCandidate(this)
        ]
      }),
      new Priority({
        children: [
          // new Priority({
          //   name: 'Eat',
          //   children: [
          //     new Sequence({
          //       name: 'keep old target if you can',
          //       children: [
          //         new TargetSuitableWithBonus(this),
          //         new VoteBonusWithTarget(this),
          //         new MoveToBonusWithTarget(this)
          //       ]
          //     }),
          //     new Sequence({
          //       children: [
          //         new Priority({
          //           children: [
          //             new Sequence({
          //               name: 'find best bonus when no bomb left',
          //               children: [
          //                 new NoBombLeft(this),
          //                 new VoteBonus(this)
          //               ]
          //             }),
          //             new Sequence({
          //               name: 'find best bonus when has bomb left',
          //               children: [
          //                 new VoteBonusWithBombLeft(this),
          //               ]
          //             }),
          //           ]
          //         }),
          //         new MoveToBonus(this)
          //       ]
          //     })
          //   ]
          // }),
          new Priority({
            name: 'Bomb',
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
              }),
            ]
          })
        ]
      })
    ]
  });
};

export default First;
