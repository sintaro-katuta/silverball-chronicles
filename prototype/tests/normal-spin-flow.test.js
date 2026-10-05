import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {reelState} from '../src/domain/reels.js';
test('physical admissions start spins, pause freezes and all accepted holds drain',()=>{
 const m=createBoardFlow({lcd:true,normalPower:.24,launchInterval:.6}),s=attachNormalSpin(m.flow);m.setMode('normal');m.flow.start();let maxHolds=0,states=new Set();
 for(let i=0;i<120*120;i++){m.flow.step(1/120);maxHolds=Math.max(maxHolds,s.game.holdCount);states.add(reelState(s.game).stopped.join());}
 // Exercise a queue with real mouth crossings, independently of natural entry frequency.
 const mouth=m.flow.physics.pockets.find(p=>p.kind==='start');
 for(let n=0;n<3;n++){
  const b=m.flow.physics.spawn({extra:true},.24);
  Object.assign(b,{x:mouth.x,y:mouth.y-4,vx:0,vy:60,leftLaunchPlane:true});
  for(let i=0;i<24;i++){m.flow.step(1/120);maxHolds=Math.max(maxHolds,s.game.holdCount);states.add(reelState(s.game).stopped.join());}
 }
 assert.equal(s.events.length,m.flow.counts.start);assert.ok(maxHolds>0);assert.ok(maxHolds<=5);
 m.flow.pause(true);const snap=s.snapshot();m.flow.step(1);assert.deepEqual(s.snapshot(),snap);m.flow.pause(false);m.flow.stop();for(let i=0;i<40*120;i++){m.flow.step(1/120);states.add(reelState(s.game).stopped.join());}
 assert.ok(states.has('true,false,false'));assert.ok(states.has('true,true,false'));
 assert.equal(s.game.holdCount,0);assert.equal(s.game.spinActive,false);assert.equal(s.game.draws,s.snapshot().accepted);assert.equal(s.game.jackpots,0);assert.ok(new Set(s.game.stoppedReels).size>1);
 console.log(JSON.stringify({entries:s.events.length,draws:s.game.draws,maxHolds}));
});
test('active draw is separate from five holds, full holds do not add a draw',()=>{
 const m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow);
 for(let i=0;i<8;i++)m.flow.game.hit({id:i,x:210,y:480,power:.24},'start',4);
 assert.equal(s.game.holdCount,5);assert.equal(s.snapshot().accepted,6);assert.equal(m.flow.counts.start,8);
 const target=[...s.game.spinResult.reels];m.flow.start();for(let i=0;i<400;i++)m.flow.step(1/120);
 assert.ok(s.game.stopTimer>0);assert.deepEqual(s.game.stoppedReels,target);
});
