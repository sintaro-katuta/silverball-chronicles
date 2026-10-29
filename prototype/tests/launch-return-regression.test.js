import test from 'node:test';import assert from 'node:assert/strict';
import {feedbackOptions} from '../tools/s8-play-feedback.mjs';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {collideNonReturnValve} from '../src/physics/physics.js';
import {LAUNCH_EXIT} from '../src/pixi/board-rails.js';
test('exit flap blocks a returning front ball without accelerating it, while the rear launch plane passes',()=>{
 const p=createBoardFlow({lcd:true,...feedbackOptions('guarded-exit')}).flow.physics,c=p.colliders.find(c=>c.nonReturnValve);assert.equal(p.launchRailProfile,'guarded-exit');assert.deepEqual(c.a,LAUNCH_EXIT.a);assert.deepEqual(c.b,LAUNCH_EXIT.b);
 const n=c.normal,b={x:(c.a.x+c.b.x)/2+n.x*3,y:(c.a.y+c.b.y)/2+n.y*3,r:3,vx:-n.x*80,vy:-n.y*80,leftLaunchPlane:true};assert.ok(collideNonReturnValve(b,c)>0);assert.ok(b.vx*n.x+b.vy*n.y>0);assert.ok(Math.hypot(b.vx,b.vy)<=80);
 const rear={...b,leftLaunchPlane:false},before={...rear};assert.equal(collideNonReturnValve(rear,c),0);assert.deepEqual(rear,before);
 const legacy=createBoardFlow({lcd:true,...feedbackOptions('guarded-exit'),launchRailProfile:'legacy'}).flow.physics;assert.deepEqual(p.colliders.filter(c=>!c.nonReturnValve),legacy.colliders);assert.equal(legacy.nonReturnValve,undefined);
});
for(const phase of [0,.175,.35])test(`continuous default-power launches do not return or retain balls, initial phase ${phase}`,()=>{
 const m=createBoardFlow({lcd:true,...productionBoardFlowOptions()});m.setMode('normal');const p=m.flow.physics;for(let i=0;i<Math.round(phase*120);i++)m.flow.step(1/120);m.flow.start();let stop=null;
 for(let i=0;i<100*120;i++){if(p.metrics.spawned>=30&&stop===null){m.flow.stop();stop=p.time;}m.flow.step(1/120);if(stop!==null&&p.time-stop>45)break;}
 assert.equal(p.metrics.spawned,30);assert.equal(m.flow.counts.returned,0);assert.equal(p.balls.length,0);assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),30);assert.ok(p.nonReturnValve.forwardPasses>=30);
});
test('insufficient launch energy still returns a rear ball to stock instead of being forced into the field',()=>{
 const m=createBoardFlow({lcd:true,...feedbackOptions('guarded-exit')});m.setMode('normal');m.setNormalPower(0);m.flow.single();for(let i=0;i<20*120;i++)m.flow.step(1/120);assert.equal(m.flow.physics.metrics.spawned,1);assert.equal(m.flow.counts.returned,1);assert.equal(m.flow.physics.nonReturnValve.forwardPasses,0);assert.equal(m.flow.physics.balls.length,0);
});

test('adopted right road supports the ball on its heads and leaves the adjacent bypass clear',()=>{
 const p=createBoardFlow({lcd:true,...productionBoardFlowOptions()}).flow.physics,pins=p.pins.filter(q=>q.id>=97&&q.id<=101);
 for(let i=1;i<pins.length;i++){const a=pins[i-1],b=pins[i];const gap=Math.hypot(b.x-a.x,b.y-a.y)-a.r-b.r;assert.ok(gap>0);assert.ok(gap<p.ballRadius*2);}
 const a=pins[0],b=p.pins.find(q=>q.id===93);assert.ok(Math.hypot(b.x-a.x,b.y-a.y)-a.r-b.r>p.ballRadius*2);
});
test('historical large-ball trial bypasses a closed electric shutter at the highest normal slider power',()=>{
 const m=createBoardFlow({lcd:true,...feedbackOptions('guarded-exit')});m.setMode('normal');m.setNormalPower(.30);const p=m.flow.physics;m.flow.start();let stop=null;
 for(let i=0;i<100*120;i++){if(p.metrics.spawned>=50&&stop===null){m.flow.stop();stop=p.time;}m.flow.step(1/120);if(stop!==null&&p.time-stop>45)break;}
 assert.equal(p.metrics.spawned,50);assert.equal(m.flow.counts.returned,0);assert.equal(m.flow.counts.rush,0);assert.equal(p.balls.length,0);assert.equal(p.rightChucker.open,false);assert.equal(p.rightChucker.scoop.active,true);
 const pocket=p.pockets.find(q=>q.kind==='rush');assert.equal(p.rightChucker.scoop.a.y,pocket.y+.5+2*(p.ballRadius-1.8));
});
