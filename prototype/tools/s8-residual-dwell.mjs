import {createBoardFlow} from '../src/pixi/board-flow.js';import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';import {installSourceResidualContacts} from '../src/pixi/source-residual-contact.js';import {writeFileSync} from 'node:fs';
const m=createBoardFlow({lcd:true,...productionBoardFlowOptions()}),p=m.flow.physics;installSourceResidualContacts(p);const rests=new Map(),stops=new Map();
for(let i=0;i<21;i++)m.flow.step(1/120);m.setMode('normal');m.flow.start();let stopped;
for(let i=0;i<240*120;i++){if(p.metrics.spawned===250&&stopped===undefined){m.flow.stop();stopped=p.time;}m.flow.step(1/120);
for(const b of p.balls){const rest=Math.hypot(b.vx,b.vy)<1?(rests.get(b.id)??0)+1/120:0;rests.set(b.id,rest);if(rest>=1&&(stops.get(b.id)?.seconds??0)<rest)stops.set(b.id,{id:b.id,seconds:rest,time:p.time,source:[b.x*2+28,(b.y-120)*2],speed:Math.hypot(b.vx,b.vy),last:b.lastContact,onStage:!!b.onSourceStage,onRamp:!!b.onStageRamp,omega:b.omega,leftLaunchPlane:b.leftLaunchPlane});}
if(stopped!==undefined&&p.time-stopped>=45)break;}
const result={stops:[...stops.values()],counts:m.flow.counts,remaining:p.balls.length};writeFileSync('reference-review/s8-residuals-20261025/dwell.json',JSON.stringify(result,null,2));console.log(result);
