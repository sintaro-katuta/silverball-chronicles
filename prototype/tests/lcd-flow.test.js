import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {overlapsLcd} from '../src/pixi/lcd-layout.js';
for(const mode of ['normal','rush','bonus'])test(`${mode}: balls stay outside LCD, follow side lanes and drain`,()=>{
 const {flow,setMode}=createBoardFlow({lcd:true});setMode(mode);flow.start();
 const left=new Set(),right=new Set();
 const check=()=>{for(const b of flow.physics.balls){assert.equal(overlapsLcd(b),false,`LCD overlap: ${b.id} at ${b.x},${b.y}`);if(b.vy>0&&b.y>240&&b.y<376){if(b.x>40&&b.x<100)left.add(b.id);if(b.x>326)right.add(b.id);}}};
 for(let i=0;i<(mode==='normal'?120:40)*120;i++){flow.step(1/120);check();}
 // Natural HESO frequency is not a route invariant; exercise its sensor below.
 if(mode!=='normal')assert.ok(flow.counts[mode]>0);
 if(mode==='normal')assert.ok(left.size>right.size*2);else{assert.equal(left.size,0);assert.ok(right.size>50);}
 flow.stop();setMode('normal');for(let i=0;i<30*120;i++){flow.step(1/120);check();}
 assert.equal(flow.physics.balls.length,0);
 assert.equal(Object.values(flow.counts).reduce((a,b)=>a+b,0),flow.physics.metrics.spawned);
});

test('normal HESO mouth admits a real ball independently of natural cohort frequency',()=>{
 const {flow,setMode}=createBoardFlow({lcd:true});setMode('normal');
 const p=flow.physics.pockets.find(p=>p.kind==='start'),b=flow.physics.spawn({extra:true},.24);
 Object.assign(b,{x:p.x,y:p.y-4,vx:0,vy:60,leftLaunchPlane:true});
 for(let i=0;i<60;i++)flow.step(1/120);
 assert.equal(flow.counts.start,1);assert.equal(flow.physics.balls.length,0);
 assert.equal(flow.physics.metrics.spawned,1);
});

test('both modes launch at one origin no faster than 0.6 seconds',()=>{
 for(const mode of ['normal','rush']){
  const {flow,setMode}=createBoardFlow({lcd:true});setMode(mode);const shots=[];
  const spawn=flow.physics.spawn.bind(flow.physics);
  flow.physics.spawn=(...args)=>{const b=spawn(...args);shots.push({t:flow.game.time,x:b.x,y:b.y,power:b.power});return b;};
  flow.start();for(let i=0;i<12*120;i++)flow.step(1/120);
  assert.ok(shots.length>10&&shots.length<=20);
  for(let i=0;i<shots.length;i++){assert.equal(shots[i].x,29);assert.equal(shots[i].y,652);if(i)assert.ok(shots[i].t-shots[i-1].t>=.6-1e-8);}
 }
});

test('manual power changes only future normal shots',()=>{
 const m=createBoardFlow({lcd:true});m.setMode('normal');m.flow.start();for(let i=0;i<120;i++)m.flow.step(1/120);
 const balls=structuredClone(m.flow.physics.balls);m.setNormalPower(.25);assert.deepEqual(m.flow.physics.balls,balls);
 const previousId=m.flow.physics.nextId;for(let i=0;i<120;i++)m.flow.step(1/120);assert.ok(m.flow.physics.balls.some(b=>b.id>=previousId&&b.power===.25));
 m.setMode('rush');m.setNormalPower(.23);const nextId=m.flow.physics.nextId;for(let i=0;i<120;i++)m.flow.step(1/120);assert.ok(m.flow.physics.balls.some(b=>b.id>=nextId&&b.power===.85));
});
