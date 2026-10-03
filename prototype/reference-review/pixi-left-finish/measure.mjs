import {createBoardFlow} from '../../src/pixi/board-flow.js';
import {overlapsLcd} from '../../src/pixi/lcd-layout.js';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const results=[];
for(const normalPower of [.22,.23,.24,.25,.26]){
 const m=createBoardFlow({lcd:true,normalPower});m.setMode('normal');m.flow.start();let overlaps=0;
 for(let i=0;i<120*120;i++){m.flow.step(1/120);for(const b of m.flow.physics.balls)if(overlapsLcd(b))overlaps++;}
 m.flow.stop();for(let i=0;i<30*120;i++)m.flow.step(1/120);
 const result={power:normalPower,spawned:m.flow.physics.metrics.spawned,counts:m.flow.counts,...m.leftMetrics.snapshot(),remaining:m.flow.physics.balls.length,overlaps};
 assert.equal(result.overlaps,0);assert.equal(result.remaining,0);assert.equal(Object.values(result.counts).reduce((a,b)=>a+b,0),result.spawned);results.push(result);console.log(JSON.stringify(result));
}
await writeFile(`reference-review/pixi-left-finish/${process.argv[2]??'after'}.json`,JSON.stringify(results,null,2));
