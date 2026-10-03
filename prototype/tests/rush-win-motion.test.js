import test from 'node:test';import assert from 'node:assert/strict';import {rushWinPose,RUSH_WIN_SECONDS} from '../src/pixi/rush-win-motion.js';
test('RUSH hit darkens, bursts once, settles and sweeps a digit-shaped shine',()=>{
 assert.equal(rushWinPose(.05).darkAlpha,.9);assert.ok(rushWinPose(.24).scale>1.6);
 assert.ok(rushWinPose(.27).slashAlpha>.9);assert.equal(rushWinPose(.4).slashAlpha,0);
 assert.notEqual(rushWinPose(.25).shake,0);assert.equal(rushWinPose(.5).shake,0);
 assert.ok(rushWinPose(.7).sparkAlpha>0);assert.equal(rushWinPose(1.1).sparkAlpha,0);
 assert.equal(rushWinPose(.8).shineAlpha,1);assert.equal(rushWinPose(1.2).shineAlpha,0);
 assert.equal(rushWinPose(2.2).scale,1);assert.equal(rushWinPose(2.2).darkAlpha,0);
 assert.equal(rushWinPose(RUSH_WIN_SECONDS).visible,false);
});
