import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProfile} from '../src/game.js';
import {Physics,GRAVITY,attackerOpen} from '../src/physics.js';
const dummy=()=>({phase:'playing',time:0,hit(){},lose(){},emit(){},rng:()=>1,value:()=>0});
const run=(p,g,seconds=8)=>{for(let n=0;n<seconds*120&&p.balls.length;n++){p.step(1/120,g);g.time+=1/120;}};

test('launch strength changes only initial velocity, then gravity integrates in free space',()=>{
 for(const power of [.4,.5,1]){const p=new Physics(),g=dummy();p.launchTolerance=0;p.colliders=[];p.pins=[];p.mechanisms=[];const b=p.spawn({hits:0},power);assert.equal(b.x,p.launcher.origin.x);assert.equal(b.y,p.launcher.origin.y);const vy=b.vy;p.step(.1,g);assert.ok(Math.abs(b.vy-(vy+GRAVITY*.1))<1e-8);assert.equal(b.x,p.launcher.origin.x);assert.ok(b.y<p.launcher.origin.y);assert.equal(b.rail,undefined);assert.equal(b.channel,undefined);}
});

test('the same upper geometry sends ordinary shots left and stronger shots right through actual contacts',()=>{
 for(const power of [.5,.9,1]){const p=new Physics(),g=dummy();const b=p.spawn({right:power>=.8,hits:0},power);run(p,g);assert.equal(b.observedSide,power===.5?'left':'right');assert.ok(b.contactCount>0);assert.equal(p.balls.length,0);}
 // Removing the upper reflector changes the strong shot's result: outcome is geometry-dependent.
 const p=new Physics(),g=dummy();p.colliders=p.colliders.filter(c=>c.role!=='upper-reflector');const b=p.spawn({},1);run(p,g);assert.notEqual(b.observedSide,'right');
});

test('weak shots physically return through the launcher instead of teleporting to the left',()=>{const p=new Physics(),g=dummy();p.spawn({},.1);run(p,g);assert.equal(p.metrics.returned,1);assert.equal(p.metrics.left+p.metrics.right,0);});

test('right arrivals drop under gravity between real guides without pins or locked x coordinates',()=>{
 const p=new Physics(),g=dummy();assert.ok(p.pins.every(pin=>pin.x+pin.r<334));const b=p.spawn({},1);let min=Infinity,max=-Infinity,samples=0;
 for(let i=0;i<600&&p.balls.length;i++){p.step(1/120,g);if(b.y>250&&b.y<540&&b.vy>0&&b.observedSide==='right'){min=Math.min(min,b.x);max=Math.max(max,b.x);samples++;assert.ok(b.x>345&&b.x<376);}}
 assert.ok(samples>10);assert.ok(max-min>.5,'right chute must not lock x');assert.equal(p.metrics.out,1);
});

test('closed physical gate diverts right shots to the outlet without awarding or hiding old balls',()=>{
 const p=new Physics(),g=dummy();let awards=0,losses=0;g.hit=()=>awards++;g.lose=()=>losses++;
 for(let n=0;n<30;n++){p.spawn({},1);for(let i=0;i<72;i++){p.step(1/120,g);g.time+=1/120;}}run(p,g,12);
 assert.equal(awards,0);assert.equal(losses,30);assert.equal(p.balls.length,0);assert.equal(p.metrics.right,30);
});

test('automatic shooting predicts physical arrivals and clears ten rounds without inter-round loss',()=>{
 for(let course=0;course<3;course++){const g=new Game(freshProfile(),course,()=>.5),p=new Physics(course);g.rules.targetBase=1e8;g.pendingGrade=10;g.startJackpot();let fired=0,clock=0;
 for(let n=0;n<22000&&(g.jackpot||p.balls.length);n++){clock+=1/120;if(g.jackpot&&clock>=.6){clock=0;if(!p.shouldWaitToFire(g,1)){const b=g.fire();if(b){fired++;p.spawn(b,1);}}}p.step(1/120,g);g.tick(1/120);}
 assert.equal(g.jackpot,null);assert.equal(p.metrics.bonus,100);assert.equal(fired,100);assert.equal(p.metrics.out+p.metrics.returned,0);assert.equal(g.total,1500*g.course.scale);assert.equal(p.balls.length,0);
 }
});

test('ball contacts separate overlapping balls and exchange momentum',()=>{
 const p=new Physics(),g=dummy();p.colliders=[];p.pins=[];p.mechanisms=[];
 p.balls=[{id:1,x:100,y:300,vx:80,vy:0,r:4.6,age:0,hits:0},{id:2,x:108,y:300,vx:-80,vy:0,r:4.6,age:0,hits:0}];p.step(1/600,g);
 assert.ok(p.balls[0].vx<0);assert.ok(p.balls[1].vx>0);assert.ok(Math.hypot(p.balls[0].x-p.balls[1].x,p.balls[0].y-p.balls[1].y)>=9.19);assert.equal(p.metrics.ballContacts,1);
});

test('adaptive collision steps prevent a fast ball from tunnelling through a thin guide',()=>{
 const p=new Physics(),g=dummy();p.pins=[];p.mechanisms=[];p.colliders=[{a:{x:200,y:250},b:{x:200,y:350},r:1.3,restitution:.5,role:'test'}];
 const b={id:1,x:150,y:300,vx:12000,vy:0,r:4.6,age:0,hits:0};p.balls=[b];p.step(1/60,g);assert.ok(b.vx<0);assert.ok(b.x<200);
});

test('attacker door uses the configured count limit and never opens in round gaps',()=>{const g=dummy();g.machine={countLimit:8};g.jackpot={count:7,gap:0};assert.ok(attackerOpen(g));g.jackpot.count=8;assert.equal(attackerOpen(g),false);g.jackpot.count=0;g.jackpot.gap=.1;assert.equal(attackerOpen(g),false);});

test('a weak paid shot returns to stock through the return outlet without an OUT loss',()=>{const g=new Game(freshProfile()),p=new Physics();p.spawn(g.fire(),.1);assert.equal(g.stock,399);run(p,g);assert.equal(g.stock,400);assert.equal(g.ledger.spent,1);assert.equal(g.ledger.returned,1);assert.equal(g.lost,0);assert.equal(p.metrics.returned,1);p.spawn(g.fire(true),.1);run(p,g);assert.equal(g.stock,400);assert.equal(g.ledger.returned,1);});

test('queued salute and twin balls can share the physical launcher without paid-ball loss',()=>{
 const g=new Game(freshProfile(),0,()=>.1),p=new Physics();g.rules.targetBase=1e8;g.rules.continuationRate=0;g.skills.salute=5;g.skills.twin=5;g.pendingGrade=10;g.startJackpot();
 let pending=0,muzzle=0,clock=0,paid=0,free=0;
 const events=()=>{for(const e of g.events.splice(0))if(e.type==='extra')pending++;};events();
 for(let n=0;n<22000&&(g.jackpot||p.balls.length||pending);n++){
  muzzle+=1/120;clock+=1/120;const power=g.jackpot?p.bonusPower:p.normalPower;
  if(pending&&muzzle>=.15&&!p.shouldWaitToFire(g,power)){const b=g.fire(true);if(b){p.spawn(b,power);pending--;free++;muzzle=0;}}
  if(g.jackpot&&clock>=.6&&muzzle>=.15&&!p.shouldWaitToFire(g,power)){const b=g.fire();if(b){p.spawn(b,power);paid++;clock=0;muzzle=0;}}
  p.step(1/120,g);g.tick(1/120);events();
 }
 assert.equal(g.jackpot,null);assert.equal(p.metrics.bonus,100);assert.equal(p.metrics.out+p.metrics.returned,0);assert.equal(p.balls.length,0);assert.equal(pending,0);assert.equal(paid+free,100);assert.ok(free>=20);assert.equal(g.ledger.spent,paid);assert.equal(g.ledger.extraBalls,free);
});

test('left launcher origin, muzzle, initial velocity and guide opening share one physical definition',()=>{
 for(const power of [.1,.5,1]){
  const p=new Physics(),g=dummy(),launcher=p.launcher,b=p.spawn({},power);
  assert.ok(launcher.origin.x<40,'the ball enters from the left, while the control handle stays on the right');
  assert.deepEqual({x:b.x,y:b.y},launcher.origin);assert.equal(b.vx,0);assert.ok(b.vy<0);
  assert.equal(launcher.mouth.x,launcher.origin.x);assert.ok(launcher.mouth.y<launcher.origin.y);assert.ok(launcher.throatWidth>=b.r*2);
  const inner=p.colliders.find(c=>c.role==='launch-inner'),outer=p.colliders.find(c=>c.role==='launch-outer'),kicker=p.colliders.find(c=>c.role==='launch-kicker');
  assert.equal(inner.a.x,launcher.innerWallX);assert.equal(outer.a.x,launcher.outerWallX);assert.deepEqual(p.colliders.find(c=>c.role==='launch-outer-exit').b,kicker.a);
  assert.ok(b.x+b.r<inner.a.x-inner.r);assert.ok(b.x-b.r>outer.a.x+outer.r);
  for(let n=0;n<360&&!b.dead;n++){p.step(1/120,g);if(b.x>39){assert.ok(b.y<155,'the ball can enter the board only above the barrel exit');break;}}
  assert.equal(p.returnOutlet.x,launcher.origin.x);
 }
});
