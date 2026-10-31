import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {sourcePoint} from '../src/pixi/source-layout.js';
import {sourceAttackerPose} from '../src/pixi/source-right-actuators.js';
import {pocketCrossing} from '../src/physics/pocket-sensor.js';
const make=()=>createBoardFlow({lcd:true,...productionBoardFlowOptions()});
test('observed attacker tip endpoints retain the fixed lower hinge through opening and closing',()=>{
 const b=make();b.setMode('bonus');
 for(let i=0;i<100;i++){b.flow.step(1/120);const pose=b.flow.physics.gate.panel;assert.deepEqual([pose.hinge.x,pose.hinge.y],sourcePoint([721.7,777.5]));assert.deepEqual(b.flow.physics.gate.a,pose.tip);}
 assert.deepEqual([b.flow.physics.gate.a.x,b.flow.physics.gate.a.y],sourcePoint([670.5,655]));
 b.setMode('right-closed');for(let i=0;i<100;i++)b.flow.step(1/120);
 assert.deepEqual([b.flow.physics.gate.a.x,b.flow.physics.gate.a.y],sourcePoint([725.4,658]));assert.equal(b.flow.physics.gate.active,false);
 for(const p of [0,.25,.5,.75,1])assert.deepEqual(sourceAttackerPose(p).hinge,sourceAttackerPose(0).hinge);
});
test('lower intake accepts a downward crossing only when its independent electric opening is complete',()=>{
 const b=make(),p=b.flow.physics.pockets.find(q=>q.kind==='rush');
 const [x,y]=sourcePoint([572,852]),ball={x,y:y+1,vy:10,r:3};
 assert.ok(pocketCrossing({x,y:y-1},ball,p));
 b.setMode('rush');assert.equal(b.flow.game.electricChuckerOpen,false);
 for(let i=0;i<60;i++)b.flow.step(1/120);
 assert.equal(b.flow.game.electricChuckerOpen,true);assert.equal(b.flow.physics.gate.active,false);
 b.setMode('right-closed');assert.equal(b.flow.game.electricChuckerOpen,false);
 assert.ok(!b.flow.physics.colliders.some(q=>q.denchuShelf));
});
for(const mode of ['right-closed','rush','bonus'])test(`natural right launch drains in ${mode} without crossing a closed intake`,()=>{
 const b=make();b.setMode(mode);b.flow.start();let stopAt=null;
 for(let i=0;i<9000;i++){
  b.flow.step(1/60);
  if(!stopAt&&b.flow.physics.metrics.spawned>=20){b.flow.stop();stopAt=b.flow.game.time+30;}
  if(stopAt&&(b.flow.physics.balls.length===0||b.flow.game.time>=stopAt))break;
 }
 assert.equal(b.flow.physics.metrics.spawned,20);assert.equal(b.flow.physics.balls.length,0,JSON.stringify(b.flow.physics.balls.map(q=>[q.x,q.y,q.lastContact])));
 assert.equal(Object.values(b.flow.counts).reduce((a,b)=>a+b,0),20);
 if(mode==='right-closed'){assert.equal(b.flow.counts.rush,0);assert.equal(b.flow.counts.bonus,0);assert.ok(b.flow.counts.fuzu>0);assert.ok(b.flow.counts.out>0);}
 if(mode==='rush'){assert.ok(b.flow.counts.rush>0);assert.equal(b.flow.counts.bonus,0);}
 if(mode==='bonus'){assert.equal(b.flow.counts.bonus,20);assert.equal(b.flow.counts.rush,0);}
});

test('upper diverter is not an intake; right admissions occur at the user specified lower 15 receiver',()=>{
 const b=make(),p=b.flow.physics,receiver=p.pockets.find(q=>q.kind==='bonus');
 assert.equal(receiver.captureRegion,undefined);assert.equal(receiver.captureTray,undefined);
 assert.deepEqual([receiver.x,receiver.y],sourcePoint([739.6,807]));
 b.setMode('bonus');b.flow.single();let sawUpper=false,sawLower=false;
 for(let i=0;i<1200&&b.flow.counts.bonus===0;i++){
  b.flow.step(1/120);const ball=p.balls[0];if(!ball)continue;
  const y=(ball.y-120)*2;if(ball.x*2+28>660&&y>684&&y<774){sawUpper=true;assert.equal(b.flow.counts.bonus,0);}
  if(ball.lastContact==='source-upper-diverter')sawLower=true;
 }
 assert.ok(sawUpper);assert.ok(sawLower);assert.equal(b.flow.counts.bonus,1);
 assert.ok(p.attackerReceipts[0].y>=sourcePoint([739.6,807])[1]);
});

test('the same incoming ball takes the left continuation or the lower right receiver according to the diverter state',()=>{
 for(const [mode,expected] of [['right-closed','fuzu'],['bonus','bonus']]){
  const b=make();b.setMode(mode);b.flow.single();let left=false;
  for(let i=0;i<1800;i++){b.flow.step(1/120);const q=b.flow.physics.balls[0];if(q&&q.x*2+28>=600&&q.x*2+28<700&&(q.y-120)*2>750&&(q.y-120)*2<805)left=true;if(b.flow.counts[expected])break;}
  assert.equal(b.flow.counts[expected],1);assert.equal(left,mode==='right-closed');
 }
});
