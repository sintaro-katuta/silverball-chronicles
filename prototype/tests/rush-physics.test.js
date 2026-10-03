import test from 'node:test';
import assert from 'node:assert/strict';
import {Physics,rightStartOpen} from '../src/physics.js';
import {Game,freshProfile} from '../src/game.js';
const dummy=()=>({phase:'playing',time:0,rush:null,jackpot:null,rng:()=>1,value:()=>0,hit(){},lose(){},emit(){},machine:{countLimit:10,holdLimit:5}});
const settle=(p,g)=>{for(let i=0;i<1440&&p.balls.length;i++){p.step(1/120,g);g.time+=1/120;}};

test('electric chucker opens only during RUSH and its physical scoop catches falling right shots',()=>{
 for(const open of [false,true]){const p=new Physics(),g=dummy();if(open)g.rush={remaining:100};let hits=0;g.hit=(b,kind)=>{assert.equal(kind,'rush');hits++;};
  const b=p.spawn({},1);settle(p,g);assert.equal(hits,open?1:0);assert.equal(p.metrics.out,open?0:1);assert.equal(p.balls.length,0);assert.equal(p.rightChucker.open,open);assert.equal(b.observedSide,'right');
  if(open)assert.equal(b.lastContact,'right-chucker-scoop');
 }
});

test('physical port and predictor switch RUSH to attacker and back without changing the launch',()=>{
 const p=new Physics(),g=dummy();g.rush={remaining:100};const kinds=[];g.hit=(b,kind)=>kinds.push(kind);
 for(const mode of ['rush','bonus','rush']){
  g.jackpot=mode==='bonus'?{count:0,gap:0,round:1,rounds:4}:null;
  const b=p.spawn({},1);assert.equal(p.predictArrival(b,g).kind,mode);settle(p,g);assert.equal(kinds.at(-1),mode);assert.equal(b.rail,undefined);assert.equal(b.channel,undefined);
 }
 assert.deepEqual(kinds,['rush','bonus','rush']);assert.equal(p.metrics.out,0);assert.equal(p.balls.length,0);
});

test('a full RUSH hold pool stops automatic firing while open-port entry still awards its prize',()=>{
 const g=new Game(freshProfile(),0,()=>.9),p=new Physics();g.rules.targetBase=1e8;g.startRush();g.queue=5;
 assert.ok(rightStartOpen(g));assert.equal(g.canAcceptRushDraw,false);assert.equal(p.shouldWaitToFire(g,1),true);
 const before=g.total;p.spawn({},1);settle(p,g);assert.equal(g.total-before,1);assert.equal(g.rushHolds.length,5);assert.equal(p.metrics.rush,1);
});

test('automatic RUSH shooting reserves remaining draws and consumes ten spins with no surplus paid shots',()=>{
 const g=new Game(freshProfile(),0,()=>.9),p=new Physics();g.rules.targetBase=1e8;g.rules.rushSpins=10;g.startRush();let clock=0,fired=0;
 for(let i=0;i<30000&&(g.rush||p.balls.length);i++){clock+=1/120;if(g.rush&&clock>=.6&&!p.shouldWaitToFire(g,1)){p.spawn(g.fire(),1);fired++;clock=0;}p.step(1/120,g);g.tick(1/120);}
 assert.equal(fired,10);assert.equal(p.metrics.rush,10);assert.equal(g.draws,10);assert.equal(g.rush,null);assert.equal(p.metrics.out+p.metrics.returned,0);assert.equal(g.stock,400);assert.equal(p.balls.length,0);
});

test('RUSH assist counts the actual active draw and predicted arrivals against both hold and spin limits',()=>{
 const g=new Game(freshProfile(),0,()=>.9),p=new Physics();g.startRush();g.rush.remaining=3;g.enqueueDraw(1,'rush','rush');p.spawn({},1);p.spawn({},1);assert.equal(p.shouldWaitToFire(g,1),true);
 p.balls.pop();assert.equal(p.shouldWaitToFire(g,1),false);
 g.rush.remaining=100;g.rushHolds=[];g.queue=4;assert.equal(p.shouldWaitToFire(g,1),true);
});

test('dense right-play streams keep reservations even when a temporary prediction says OUT',()=>{
 for(const mode of ['rush','bonus']){
  const g=new Game(freshProfile(),0,()=>.9),p=new Physics();
  if(mode==='rush'){g.startRush();g.rush.remaining=3;}else{g.pendingGrade=4;g.startJackpot();g.jackpot.count=7;}
  for(let i=0;i<3;i++)p.spawn(g.fire(),1);
  p.predictArrival=()=>({kind:'out',seconds:.1});
  assert.equal(p.shouldWaitToFire(g,1),true);
  p.balls.pop();assert.equal(p.shouldWaitToFire(g,1),false);
 }
});
