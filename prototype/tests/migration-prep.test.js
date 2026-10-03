import test from 'node:test';
import assert from 'node:assert/strict';
import {startFrameLoop} from '../src/runtime/frame-loop.js';
import {MACHINE_VIEW,boardToMachine,machineToBoard} from '../src/machine-layout.js';
import {Physics,LAUNCHER} from '../src/physics.js';
import {FLOOR_ONE} from '../src/floor-catalog.js';
function driver(){let id=0,time=0;const queue=new Map();return {queue,request:f=>{queue.set(++id,f);return id;},cancel:id=>queue.delete(id),now:()=>time,step(t){time=t;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(f=>f());}};}
test('game clock runs once per browser frame, cancels pending/stale callbacks and can restart',()=>{
 const d=driver(),times=[];const stop=startFrameLoop(t=>times.push(t),d);
 d.step(16);d.step(32);assert.deepEqual(times,[16,32]);assert.equal(d.queue.size,1);
 const stale=[...d.queue.values()][0];stop();stop();stale();d.step(48);assert.deepEqual(times,[16,32]);assert.equal(d.queue.size,0);
 const stop2=startFrameLoop(t=>times.push(t),d);d.step(64);assert.deepEqual(times,[16,32,64]);stop2();
});
test('leaving a game from inside a frame cannot schedule another update',()=>{
 const d=driver();let count=0;const stop=startFrameLoop(()=>{count++;stop();},d);d.step(16);d.step(32);assert.equal(count,1);assert.equal(d.queue.size,0);
});
test('all five unit pin layouts and mechanism endpoints preserve board/display alignment',()=>{
 for(const unit of FLOOR_ONE.filter(x=>x.kind==='main')){
  const p=new Physics(0,unit.pegSeed);
  for(const point of [...p.pins,...p.pockets,...p.mechanisms,LAUNCHER.origin,p.gate.a,p.gate.b]){
   const rendered=boardToMachine(point),restored=machineToBoard(rendered);
   assert.ok(Math.abs(restored.x-point.x)<1e-10);assert.ok(Math.abs(restored.y-point.y)<1e-10);
   // Existing PlayCanvas orthographic mapping: x - 210, 340 - y.
   assert.ok(Math.abs(rendered.x-(point.x-210+MACHINE_VIEW.width/2))<1e-10);
   assert.ok(Math.abs(rendered.y-(MACHINE_VIEW.height/2-(340-point.y)))<1e-10);
  }
 }
 assert.deepEqual(boardToMachine(LAUNCHER.origin),{x:89,y:752});
 assert.ok(Object.isFrozen(MACHINE_VIEW.lcd)&&Object.isFrozen(MACHINE_VIEW.boardOffset));
});

test('migration baseline locks per-unit contacts and closed/open mechanism geometry',async()=>{
 const {readFile}=await import('node:fs/promises');
 const baseline=JSON.parse(await readFile(new URL('../migration-prep/physical-baseline.json',import.meta.url),'utf8'));
 assert.deepEqual(baseline.view,MACHINE_VIEW);
 for(const layout of baseline.layouts){
  const p=new Physics(layout.course,layout.pegSeed);
  for(const key of ['pins','colliders','pockets','mechanisms','outlet','returnOutlet'])assert.deepEqual(p[key],layout[key],`${layout.id} ${key}`);
  for(const [name,game] of Object.entries({normal:{},rush:{rush:{}},bonus:{jackpot:{gap:0,count:0}},bonusGap:{jackpot:{gap:1,count:0}}})){
   p.updateGate(game);assert.deepEqual({gate:p.gate,rightChucker:p.rightChucker},layout.states[name],`${layout.id} ${name}`);
  }
 }
});
