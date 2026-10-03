import {createBoardFlow} from '../../src/pixi/board-flow.js';
import {overlapsLcd} from '../../src/pixi/lcd-layout.js';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const results=[];
for(const launchInterval of [.6,.1,.05,.025])for(const mode of ['normal','rush','bonus']){
 const {flow,setMode}=createBoardFlow({lcd:true,launchInterval});setMode(mode);flow.start();let peakBalls=0,maxSpeed=0,overlaps=0;
 const observe=()=>{peakBalls=Math.max(peakBalls,flow.physics.balls.length);for(const b of flow.physics.balls){maxSpeed=Math.max(maxSpeed,Math.hypot(b.vx,b.vy));if(overlapsLcd(b))overlaps++;}};
 for(let i=0;i<30*120;i++){flow.step(1/120);observe();}
 flow.stop();setMode('normal');for(let i=0;i<45*120;i++){flow.step(1/120);observe();}
 const r={mode,requestedInterval:launchInterval,spawned:flow.physics.metrics.spawned,actualShotsPerSecond:flow.physics.metrics.spawned/30,counts:flow.counts,peakBalls,maxSpeed,overlaps,remaining:flow.physics.balls.length,drained:flow.physics.balls.length===0,remainingPositions:flow.physics.balls.map(b=>({x:b.x,y:b.y}))};results.push(r);
 assert.equal(overlaps,0,JSON.stringify(r));assert.equal(Object.values(flow.counts).reduce((a,b)=>a+b,0)+r.remaining,r.spawned);assert.ok(maxSpeed<2000,JSON.stringify(r));
 console.log(JSON.stringify(r));
}
await writeFile('reference-review/pixi-lcd/stress.json',JSON.stringify(results,null,2));
