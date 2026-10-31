import {writeFileSync} from 'node:fs';
import {createBoardFlow} from '../../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../../src/app/production-board-profile.js';
const resultPath=process.argv[2]??'reference-review/s8-actuator-implementation-20261026/measurements.json';
const results=[];
for(const [mode,shots] of [['right-closed',50],['rush',50],['bonus',50],['normal',250]]){
 const b=createBoardFlow({lcd:true,...productionBoardFlowOptions()});b.setMode(mode);b.flow.start();let end=null;
 for(let i=0;i<24000;i++){
  b.flow.step(1/60);
  if(!end&&b.flow.physics.metrics.spawned>=shots){b.flow.stop();end=b.flow.game.time+45;}
  if(end&&(b.flow.physics.balls.length===0||b.flow.game.time>=end))break;
 }
 const p=b.flow.physics,result={mode,shots:p.metrics.spawned,counts:b.flow.counts,time:b.flow.game.time,remaining:p.balls.map(q=>({id:q.id,source:[q.x*2+28,(q.y-120)*2],speed:Math.hypot(q.vx,q.vy),contact:q.lastContact}))};
 results.push(result);writeFileSync(resultPath,JSON.stringify(results,null,2));console.log(JSON.stringify(result));
}
