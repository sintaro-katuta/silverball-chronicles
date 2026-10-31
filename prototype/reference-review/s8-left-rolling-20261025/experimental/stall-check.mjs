import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {ROAD_SOURCE} from '../src/pixi/source-layout.js';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out=process.argv[2];if(!out)throw Error('Output directory required');mkdirSync(out,{recursive:true});
const files=['physics/physics.js','physics/sphere-friction.js','pixi/source-guide-mechanics.js','pixi/source-layout.js','pixi/source-guide-trace.js','app/production-board-profile.js'];
const hash=()=>Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(new URL('../src/'+f,import.meta.url))).digest('hex')]));const before=hash();
function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);}
const inRoad=(x,y)=>ROAD_SOURCE.some((a,i)=>i&&segmentDistance(x,y,ROAD_SOURCE[i-1],a)<=10);
const inEntry=(x,y)=>x>=148&&x<=190&&y>=600&&y<=685;
const roadHead=process.env.S8_ROAD_PIN_HEAD==='1';
const restingSpeed=process.env.S8_PIN_RESTING_SPEED?Number(process.env.S8_PIN_RESTING_SPEED):null;
if(restingSpeed!==null&&![2,5].includes(restingSpeed))throw Error('Unsupported resting speed');
const roughnessRatio=process.env.S8_PIN_ROUGHNESS?Number(process.env.S8_PIN_ROUGHNESS):null;
if(roughnessRatio!==null&&![.5,1].includes(roughnessRatio))throw Error('Unsupported roughness ratio');
const tangentResponse=process.env.S8_TANGENTIAL_RESTITUTION?Number(process.env.S8_TANGENTIAL_RESTITUTION):null;
if(tangentResponse!==null&&![.5,.75,1].includes(tangentResponse))throw Error('Unsupported tangential response');
const curveName=process.env.S8_PIN_NORMAL_CURVE??null;const curves={'elastic-low':{lowRestitution:1,lowSpeed:20,highSpeed:50},'20-50':{lowRestitution:.9,lowSpeed:20,highSpeed:50},'40-80':{lowRestitution:.9,lowSpeed:40,highSpeed:80}};
if(curveName&&!curves[curveName])throw Error('Unsupported pin curve');
const trialLeftRestitution=process.env.S8_LEFT_PIN_RESTITUTION?Number(process.env.S8_LEFT_PIN_RESTITUTION):null;
if(trialLeftRestitution!==null&&trialLeftRestitution!==.85)throw Error('Unsupported left pin trial');
const trialRestitution=process.env.S8_ROAD_RESTITUTION?Number(process.env.S8_ROAD_RESTITUTION):null;
if(trialRestitution!==null&&![.12,.35,.5,.65,.85].includes(trialRestitution))throw Error('Unsupported road trial');
const reports=[],trialFriction=process.env.S8_CONTACT_FRICTION?Number(process.env.S8_CONTACT_FRICTION):null;
if(trialFriction!==null&&![.2,.3,.35,.4,.5,1].includes(trialFriction))throw Error('Unsupported contact trial');
for(const [mode,phase,shots]of [['normal',0,100],['normal',.175,100],['normal',.35,100],['normal',.525,100],['rush',.35,50],['bonus',.35,50]]){
 if(process.env.S8_CONTACT_CASE==='first'&&(mode!=='normal'||phase!==0))continue;
 const m=createBoardFlow({lcd:true,...productionBoardFlowOptions()}),p=m.flow.physics;if(trialFriction!==null){p.pinContactFriction=trialFriction;p.pinContactFrictionMaxX=190;}if(roadHead)for(const pin of p.pins)if(pin.id<=26)pin.r=6*.52/3;
 if(tangentResponse!==null)p.pinTangentialRestitution=tangentResponse;if(roughnessRatio!==null)p.pinRoughnessRatio=roughnessRatio;if(restingSpeed!==null)p.pinRestingContactSpeed=restingSpeed;
 if(curveName){p.pinNormalResponse=curves[curveName];p.pinNormalResponseMaxId=26;}
 if(trialLeftRestitution!==null)for(const pin of p.pins)if(pin.x<=190)pin.restitution=trialLeftRestitution;
 if(trialRestitution!==null)for(const pin of p.pins)if(pin.id<=26)pin.restitution=trialRestitution;for(let i=0;i<Math.round(phase*120);i++)m.flow.step(1/120);m.setMode(mode);m.flow.start();let stoppedAt=null,maxBacktrack=0,maxRise=0;const roadProgress=new Map(),rises=new Map();const longest={road:0,entry:0},stationary={road:0,entry:0},still=new Map(),low=new Map(),entered=new Set();
 for(let step=0;step<120*100;step++){
  if(p.metrics.spawned>=shots&&stoppedAt===null){m.flow.stop();stoppedAt=p.time;}
  m.flow.step(1/120);
  for(const b of p.balls){if(b.leftLaunchPlane)entered.add(b.id);const x=b.x*2+28,y=(b.y-120)*2;
   const onRoad=inRoad(x,y),progress=(x-173)*.88558+(y-736)*.46449;
   if(onRoad){const peak=Math.max(progress,roadProgress.get(b.id)??progress);roadProgress.set(b.id,peak);maxBacktrack=Math.max(maxBacktrack,peak-progress);}else roadProgress.delete(b.id);
   if(onRoad&&b.vy<0&&!rises.has(b.id))rises.set(b.id,{y,time:p.time});
   const rise=rises.get(b.id);if(rise){maxRise=Math.max(maxRise,rise.y-y);if(b.vy>=0||p.time-rise.time>2)rises.delete(b.id);}
   for(const [key,inside]of [['road',inRoad(x,y)],['entry',inEntry(x,y)]]){const tag=key+':'+b.id,value=inside&&b.leftLaunchPlane&&Math.hypot(b.vx,b.vy)<8?(low.get(tag)??0)+1/120:0;low.set(tag,value);longest[key]=Math.max(longest[key],value);const rest=inside&&b.leftLaunchPlane&&Math.hypot(b.vx,b.vy)<1?(still.get(tag)??0)+1/120:0;still.set(tag,rest);stationary[key]=Math.max(stationary[key],rest);}}
  if(stoppedAt!==null&&p.time-stoppedAt>=25)break;
 }
 const remaining=p.balls.map(b=>({id:b.id,x:b.x*2+28,y:(b.y-120)*2,speed:Math.hypot(b.vx,b.vy),omega:b.omega??0,lastContact:b.lastContact}));
 const report={mode,phase,pinContactFriction:p.pinContactFriction,roadRestitution:p.pins[0].restitution,roadPinRadius:p.pins[0].r,leftPinRestitution:trialLeftRestitution,pinNormalResponse:p.pinNormalResponse,pinTangentialRestitution:p.pinTangentialRestitution,pinRoughnessRatio:p.pinRoughnessRatio,pinRestingContactSpeed:p.pinRestingContactSpeed,spawned:p.metrics.spawned,entered:entered.size,counts:m.flow.counts,maxRoadBacktrackSourcePx:maxBacktrack,maxRoadRiseSourcePx:maxRise,longestLowSpeedSeconds:longest,longestStationarySeconds:stationary,roadRemaining:remaining.filter(b=>inRoad(b.x,b.y)),entryRemaining:remaining.filter(b=>inEntry(b.x,b.y)),remaining,reconciled:Object.values(m.flow.counts).reduce((a,b)=>a+b,0)+remaining.length===p.metrics.spawned};reports.push(report);console.log(JSON.stringify(report));writeFileSync(out+'/cases.json',JSON.stringify(reports,null,2));
}
writeFileSync(out+'/manifest.json',JSON.stringify({before,after:hash(),unchanged:JSON.stringify(before)===JSON.stringify(hash()),roadRegion:'within 10 source px of authored road-pin segments',entryRegion:'source x148..190,y600..685',lowSpeed:'speed < 8 world units/s, continuous per ball in region',scope:'real launches in mechanical fixture, lottery and wallet excluded'},null,2));
