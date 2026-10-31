import {createBoardFlow} from '/Users/sintaro.katuta/dev/silverball-chronicles/prototype/.cache/s08-live-loading/prototype/src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '/Users/sintaro.katuta/dev/silverball-chronicles/prototype/.cache/s08-live-loading/prototype/src/app/production-board-profile.js';
import {installSourceElectricBody} from '/Users/sintaro.katuta/dev/silverball-chronicles/prototype/.cache/s08-live-loading/prototype/src/pixi/source-electric-body.js';
import {writeFileSync,mkdirSync} from 'node:fs';
const out='/Users/sintaro.katuta/dev/silverball-chronicles/prototype/.cache/s08-live-loading/prototype/reference-review/s8-residuals-20261025';mkdirSync(out,{recursive:true});
for(const candidate of [false,true]){
 const m=createBoardFlow({lcd:true,...productionBoardFlowOptions()}),p=m.flow.physics;if(candidate)installSourceElectricBody(p);m.setMode('normal');m.flow.start();let stopped=null;
 for(let i=0;i<240*120;i++){if(p.metrics.spawned===250&&stopped===null){m.flow.stop();stopped=p.time;}m.flow.step(1/120);if(stopped!==null&&p.time-stopped>=45)break;}
 const r={candidate,counts:m.flow.counts,remaining:p.balls.map(b=>({id:b.id,x:b.x*2+28,y:(b.y-120)*2,speed:Math.hypot(b.vx,b.vy),last:b.lastContact})),reconciled:Object.values(m.flow.counts).reduce((s,n)=>s+n,0)+p.balls.length===p.metrics.spawned};writeFileSync(out+`/electric-pilot-${candidate}.json`,JSON.stringify(r,null,2));console.log(r);
}
