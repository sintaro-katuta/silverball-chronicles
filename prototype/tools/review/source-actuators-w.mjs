import {writeFileSync} from 'node:fs';
import {createBoardFlow} from '../../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../../src/app/production-board-profile.js';
import {SessionGame} from '../../src/domain/session-game.js';
import {attachNormalSpin} from '../../src/pixi/normal-spin-flow.js';
const resultPath=process.argv[2]??'reference-review/s8-actuator-implementation-20261026/w-natural-flow.json';
const g=new SessionGame(()=>.9),m=createBoardFlow({lcd:true,...productionBoardFlowOptions(),fire:()=>g.fire()});
attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true});
g.startRush();g.w.rng=()=>0;m.setMode('rush');m.flow.start();
const result=()=>({time:g.time,payout:g.wBatch?.payout,counts:m.flow.counts,spawned:m.flow.physics.metrics.spawned,remaining:m.flow.physics.balls.map(q=>({id:q.id,source:[q.x*2+28,(q.y-120)*2],contact:q.lastContact})),reconciled:g.accounting.reconciled,wEvents:g.w.events.filter(e=>['vDetected','bonusEnd','attackerOpen','attackerClose','electricOpen','electricClose'].includes(e.type))});
for(let n=0;n<360*60&&(g.wBatch?.payout??0)<3000;n++){
 m.flow.step(1/60);
 if(n%1200===0){writeFileSync(resultPath,JSON.stringify(result(),null,2));console.log(g.time,g.wBatch?.payout,m.flow.physics.balls.length);}
}
m.flow.stop();for(let n=0;n<45*60&&m.flow.physics.balls.length;n++)m.flow.step(1/60);
const r=result();writeFileSync(resultPath,JSON.stringify(r,null,2));console.log(JSON.stringify(r));if(r.payout!==3000||r.remaining.length||!r.reconciled)process.exitCode=1;
