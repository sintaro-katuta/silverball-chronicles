import {createBoardFlow} from '../../src/pixi/board-flow.js';
import {writeFile} from 'node:fs/promises';
const rows=[];
for(const candidate of [false,true])for(const power of [.23,.24,.25]){
 const m=createBoardFlow({lcd:true,normalPower:power});
 if(candidate){const pins=m.flow.physics.pins.filter(p=>p.role==='michi'&&p.x<130).sort((a,b)=>a.x-b.x);[[84,406],[100,411],[116,418]].forEach(([x,y],i)=>Object.assign(pins[i],{x,y}));}
 m.setMode('normal');m.flow.start();for(let i=0;i<120*120;i++)m.flow.step(1/120);m.flow.stop();for(let i=0;i<30*120;i++)m.flow.step(1/120);
 const row={candidate,power,counts:m.flow.counts,...m.leftMetrics.snapshot(),remaining:m.flow.physics.balls.length};rows.push(row);console.log(JSON.stringify(row));
}
await writeFile('reference-review/pixi-left-entry/comparison.json',JSON.stringify(rows,null,2));
