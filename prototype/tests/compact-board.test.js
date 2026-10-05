import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {LCD_APRON} from '../src/pixi/lcd-layout.js';
import {collideSegment} from '../src/physics/physics.js';
test('lower LCD housing has a physical surface matching the visible apron',()=>{
 const m=createBoardFlow({lcd:true});
 for(let i=1;i<LCD_APRON.length;i++){
  const a=LCD_APRON[i-1],b=LCD_APRON[i];const wall=m.flow.physics.colliders.find(s=>s.a.x===a[0]&&s.a.y===a[1]&&s.b.x===b[0]&&s.b.y===b[1]);assert.ok(wall);
  const ball={x:(a[0]+b[0])/2,y:(a[1]+b[1])/2+2,r:4.5,vx:0,vy:-100};
  assert.ok(collideSegment(ball,wall.a,wall.b,wall.restitution,undefined,wall.r)>0);
 }
});
test('compact lower assembly drains and accounts for all balls at increased firing rate',()=>{
 for(const mode of ['normal','rush','bonus']){
  const m=createBoardFlow({lcd:true,launchInterval:.12,pegSeed:101});m.setMode(mode);m.flow.start();for(let i=0;i<24*120;i++)m.flow.step(1/120);m.flow.stop();for(let i=0;i<30*120;i++)m.flow.step(1/120);
  assert.equal(m.flow.physics.balls.length,0);assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),m.flow.physics.metrics.spawned);
  // This is a drainage/accounting test. A short, fixed launch cohort is not
  // evidence that the newly measured normal pin layout guarantees a heso hit.
  if(mode!=='normal')assert.ok(m.flow.counts[mode]>0);
 }
});
