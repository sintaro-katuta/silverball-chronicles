import test from 'node:test';
import assert from 'node:assert/strict';
import {Physics,BALL_RADIUS} from '../src/physics/physics.js';

const dummy=()=>({phase:'playing',time:0,hit(){},lose(){},emit(){},rng:()=>1,value:()=>0});
test('launcher holds new shots for an occupied muzzle or a returning ball',()=>{
 const p=new Physics(),g=dummy();
 assert.ok(p.launcher.throatWidth>=BALL_RADIUS*2);
 assert.ok(p.launcher.throatWidth<BALL_RADIUS*4);
 assert.equal(p.canLaunch(),true);
 const b=p.spawn({},.5);assert.equal(p.canLaunch(),false);
 p.step(.03,g);assert.equal(p.canLaunch(),true);
 b.y=400;b.vy=100;assert.equal(p.canLaunch(),false);
 for(let n=0;n<1200&&p.balls.length;n++)p.step(1/120,g);
 assert.equal(p.metrics.returned,1);assert.equal(p.canLaunch(),true);
});
test('single-file launcher drains after sustained maximum-rate and weak-shot firing',()=>{
 for(const power of [.1,.5,1]){
  const p=new Physics(),g=dummy();let clock=0,fired=0,waited=0;
  for(let n=0;n<120*15;n++){
   clock+=1/120;
   if(clock>=.01){if(p.canLaunch()){p.spawn({},power);fired++;clock-=.01;}else {waited++;clock=Math.min(clock,.01);}}
   p.step(1/120,g);
   for(const b of p.balls)if(b.y>210&&b.y<670&&b.x<40){
    for(const wall of [p.launcher.outerWallX,p.launcher.innerWallX])
     assert.ok(Math.abs(b.x-wall)>=b.r+1.3-1e-6,'pair contacts do not leave balls inside a guide');
   }
  }
  for(let n=0;n<120*30&&p.balls.length;n++)p.step(1/120,g);
  assert.ok(fired>10);assert.ok(waited>0);
  assert.equal(p.balls.length,0,`power ${power} must drain`);
  assert.equal(p.metrics.start+p.metrics.normal+p.metrics.bonus+p.metrics.rush+p.metrics.out+p.metrics.returned,fired);
 }
});

test('stage 6 normal firing keeps its full cadence without an upper-exit pileup',()=>{
 const rate=Math.round(100*1.6**5),interval=60/rate,seconds=60;
 for(const course of [0,1,2]){
  const p=new Physics(course),g=dummy();let clock=0,fired=0,waits=0,pileupTime=0;
  for(let n=0;n<120*seconds;n++){
   clock+=1/120;
   if(clock+1e-9>=interval){
    if(p.canLaunch()){p.spawn({},p.normalPower);fired++;clock-=interval;}
    else {waits++;clock=Math.min(clock,interval);}
   }
   p.step(1/120,g);g.time+=1/120;
   const crowded=p.balls.filter(b=>b.x<45&&b.y<210&&Math.hypot(b.vx,b.vy)<60).length>=6;
   pileupTime=crowded?pileupTime+1/120:0;
   assert.ok(pileupTime<.5,`course ${course}: upper exit must keep moving`);
  }
  assert.equal(waits,0,`course ${course}: do not solve congestion by delaying shots`);
  assert.equal(fired,rate);
  for(let n=0;n<120*30&&p.balls.length;n++)p.step(1/120,g);
  assert.equal(p.balls.filter(b=>b.x<45).length,0,'the launcher must completely drain');
  if(course===0)assert.equal(p.balls.length,0,'Moon course must completely drain');
  assert.equal(p.metrics.start+p.metrics.normal+p.metrics.bonus+p.metrics.rush+p.metrics.out+p.metrics.returned+p.balls.length,fired);
 }
});
