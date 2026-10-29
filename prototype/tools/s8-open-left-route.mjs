import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {PROTECTED_TITLE_SOLID} from '../src/pixi/left-title-guide.js';
import {circlePolygonContact} from '../src/physics/solid-polygon-contact.js';
import {classifyLCDContact} from '../src/dev/pin-adjustment-measurement.js';
import {readFileSync,readdirSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';import {gzipSync} from 'node:zlib';import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const phase=Number(process.argv[2]??0),tag=process.argv[3]??'final';if(![0,.175,.35].includes(phase)||!/^[a-zA-Z0-9_-]+$/.test(tag))throw Error('Invalid condition');
const out=`reference-review/s8-open-left-route-20261024/${tag}-${phase}`;if(existsSync(out+'/result.json'))throw Error('Existing evidence protected');mkdirSync(out,{recursive:true});
const hash=()=>Object.fromEntries(readdirSync('src',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>e.parentPath+'/'+e.name).sort().map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
const sourceBefore=hash(),options=productionBoardFlowOptions(),m=createBoardFlow({lcd:true,...options}),p=m.flow.physics;m.setMode('normal');for(let i=0;i<Math.round(phase*120);i++)m.flow.step(1/120);
const entered=new Map(),exit=new Set(),pins=new Set(),intrusions=new Set(),frames=[];let stopped=null;
m.flow.start();for(let i=0;i<150*120;i++){
 if(p.metrics.spawned>=50&&stopped===null){m.flow.stop();stopped=p.time;}if(stopped!==null&&p.time-stopped>45)break;m.flow.step(1/120);
 for(const b of p.balls)if(b.leftLaunchPlane){if(classifyLCDContact(b)==='centre')intrusions.add(b.id);const hit=circlePolygonContact({...b,r:.001},PROTECTED_TITLE_SOLID);if(hit?.inside&&!entered.has(b.id))entered.set(b.id,{time:p.time,x:b.x,y:b.y});if(entered.has(b.id)&&b.y>=395)exit.add(b.id);if(entered.has(b.id)&&b.y>=404.25)pins.add(b.id);}
 if(i%6===0)frames.push({time:p.time,balls:p.balls.map(b=>({id:b.id,x:b.x,y:b.y,r:b.r,front:!!b.leftLaunchPlane})),counts:{...m.flow.counts}});
}
const result={scope:'Natural mechanical launches; entry into former title region and subsequent exit to individual pins, not lottery or payout',phase,shots:p.metrics.spawned,counts:m.flow.counts,remaining:p.balls.length,residual:p.balls,formerTitleEntries:[...entered].map(([id,at])=>({id,...at})),rearRouteExitIds:[...exit],rearRoutePinAreaIds:[...pins],frontLCDIntrusions:[...intrusions],reconciled:Object.values(m.flow.counts).reduce((a,b)=>a+b,0)+p.balls.length===p.metrics.spawned,options,sourceBefore,sourceAfter:hash()};result.sourceUnchanged=JSON.stringify(result.sourceBefore)===JSON.stringify(result.sourceAfter);
writeFileSync(out+'/result.json',JSON.stringify(result,null,2));writeFileSync(out+'/frames.json.gz',gzipSync(JSON.stringify(frames)));
console.log(JSON.stringify({phase,shots:result.shots,counts:result.counts,remaining:result.remaining,formerTitleEntries:entered.size,rearRouteExits:exit.size,rearRoutePinArea:pins.size,LCDIntrusions:intrusions.size,sourceUnchanged:result.sourceUnchanged}));
if(!result.sourceUnchanged||!result.reconciled||p.metrics.spawned!==50||!entered.size||exit.size!==entered.size||pins.size!==entered.size||intrusions.size||m.flow.counts.returned)throw Error('Open-route acceptance failed');
