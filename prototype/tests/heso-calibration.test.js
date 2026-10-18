import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {SessionGame} from '../src/domain/session-game.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';

const advance=(flow,seconds)=>{for(let i=0;i<seconds*120;i++)flow.step(1/120);};

test('production shots without receiving guides complete W normal spins with exact accounting',()=>{
 const game=new SessionGame(()=>.9);
 const m=createBoardFlow({lcd:true,...productionBoardFlowOptions(),fire:()=>game.fire()});
 const spin=attachNormalSpin(m.flow,{sessionGame:game,roundModel:m,lifecycle:true});
 assert.equal(m.flow.physics.colliders.some(c=>c.role==='heso-guide'),false);
 m.setMode('normal');m.flow.start();advance(m.flow,180);
 m.flow.stop();advance(m.flow,45);
 // Exercise the adopted production profile through natural admission, draws and accounting.
 // The guided-board rate floor does not apply after removal; verify admission and accounting.
 assert.ok(m.flow.counts.start>0,`only ${m.flow.counts.start} natural admissions`);
 assert.equal(m.flow.physics.balls.length,0);
 assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),m.flow.physics.metrics.spawned);
 assert.equal(spin.snapshot().accepted,m.flow.counts.start);
 assert.equal(game.draws,m.flow.counts.start);
 assert.equal(game.holdCount,0);assert.equal(game.spinActive,false);
 assert.equal(game.jackpots,0);assert.equal(game.accounting.reconciled,true);
 assert.equal(game.accounting.spent,m.flow.physics.metrics.spawned);
});

test('real mouth crossings capture lateral entries but do not capture outside the visible rims',()=>{
 for(const side of [-1,1])for(const outside of [false,true]){
  const m=createBoardFlow({lcd:true,leftAdmissionGuides:false}),p=m.flow.physics;
  const mouth=p.pockets.find(q=>q.kind==='start'),b=p.spawn({extra:true},.24);
  // No admission callback or trajectory warp during play.
  Object.assign(b,{x:mouth.x+side*(outside?mouth.w/2+3:mouth.w/2-3),y:mouth.y-4,vx:0,vy:40,leftLaunchPlane:true});
  advance(m.flow,.15);
  assert.equal(m.flow.counts.start,outside?0:1);
 }
});
