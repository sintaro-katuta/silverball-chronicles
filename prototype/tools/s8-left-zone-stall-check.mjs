import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {ROAD_SOURCE} from '../src/pixi/source-layout.js';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out=process.argv[2];if(!out)throw Error('Output directory required');mkdirSync(out,{recursive:true});
const baseline=process.env.S8_STALL_BASELINE==='1',shots=process.env.S8_STALL_LONG==='1'?250:100;
const selectedPhase=process.env.S8_STALL_PHASE===undefined?null:Number(process.env.S8_STALL_PHASE);
if(selectedPhase!==null&&![0,.175,.35,.525].includes(selectedPhase))throw Error('Unsupported phase');
const files=['physics/physics.js','physics/sphere-friction.js','domain/pin-dimensions.js','pixi/source-guide-mechanics.js','pixi/source-layout.js','pixi/source-guide-trace.js','pixi/pin-texture.js','pixi/board-runtime.js','app/production-board-profile.js'];
const hash=()=>Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(new URL('../src/'+f,import.meta.url))).digest('hex')]));
const before=hash();
function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);}
const inRoad=(x,y)=>ROAD_SOURCE.some((a,i)=>i&&segmentDistance(x,y,ROAD_SOURCE[i-1],a)<=10);
const inEntry=(x,y)=>x>=148&&x<=190&&y>=600&&y<=685;
const dx=ROAD_SOURCE.at(-1)[0]-ROAD_SOURCE[0][0],dy=ROAD_SOURCE.at(-1)[1]-ROAD_SOURCE[0][1],length=Math.hypot(dx,dy),tx=dx/length,ty=dy/length;
const cases=selectedPhase===null?[...([0,.175,.35,.525].map(phase=>({mode:'normal',phase,shots}))),{mode:'rush',phase:.35,shots:50},{mode:'bonus',phase:.35,shots:50}]:[{mode:'normal',phase:selectedPhase,shots}];
const reports=[];
for(const config of cases){
 const {mode,phase,shots}=config,m=createBoardFlow({lcd:true,...productionBoardFlowOptions()}),p=m.flow.physics;
 if(baseline){
  for(const pin of p.pins)if(pin.id<=ROAD_SOURCE.length){pin.r=pin.shaftRadius??.2;delete pin.shaftRadius;}
  p.pinContactFriction=0;p.roadPinContactProfile='shaft-baseline';p.leftEntranceContactProfile='closed-bridge-baseline';
  for(const c of p.colliders)if(c.sourceGuideId==='left-guide-bridge'||c.sourceGuideId==='left-title-edge'&&c.sourceGuideSegment===22){c.active=true;c.contactRole='physical-baseline';}
 }
 for(let i=0;i<Math.round(phase*120);i++)m.flow.step(1/120);
 m.setMode(mode);m.flow.start();let stoppedAt=null,maxBacktrack=0,maxRise=0;
 const longest={road:0,entry:0},stationary={road:0,entry:0},low=new Map(),still=new Map(),roadProgress=new Map(),rises=new Map(),entered=new Set();
 for(let step=0;step<Math.ceil((shots*.6+60)*120);step++){
  if(p.metrics.spawned>=shots&&stoppedAt===null){m.flow.stop();stoppedAt=p.time;}
  m.flow.step(1/120);
  for(const b of p.balls){
   if(b.leftLaunchPlane)entered.add(b.id);const x=b.x*2+28,y=(b.y-120)*2,onRoad=inRoad(x,y),progress=(x-ROAD_SOURCE[0][0])*tx+(y-ROAD_SOURCE[0][1])*ty;
   if(onRoad){const peak=Math.max(progress,roadProgress.get(b.id)??progress);roadProgress.set(b.id,peak);maxBacktrack=Math.max(maxBacktrack,peak-progress);}else roadProgress.delete(b.id);
   if(onRoad&&b.vy<0&&!rises.has(b.id))rises.set(b.id,{y,time:p.time});
   const rise=rises.get(b.id);if(rise){maxRise=Math.max(maxRise,rise.y-y);if(b.vy>=0||p.time-rise.time>2)rises.delete(b.id);}
   for(const [key,inside]of [['road',onRoad],['entry',inEntry(x,y)]]){
    const tag=key+':'+b.id,speed=Math.hypot(b.vx,b.vy),value=inside&&b.leftLaunchPlane&&speed<8?(low.get(tag)??0)+1/120:0,rest=inside&&b.leftLaunchPlane&&speed<1?(still.get(tag)??0)+1/120:0;
    low.set(tag,value);still.set(tag,rest);longest[key]=Math.max(longest[key],value);stationary[key]=Math.max(stationary[key],rest);
   }
  }
  if(stoppedAt!==null&&p.time-stoppedAt>=25)break;
 }
 const remaining=p.balls.map(b=>({id:b.id,x:b.x*2+28,y:(b.y-120)*2,speed:Math.hypot(b.vx,b.vy),omega:b.omega??0,lastContact:b.lastContact}));
 const report={variant:baseline?'before-entry-and-head':'visible-head-rolling',mode,phase,pinContactFriction:p.pinContactFriction,roadRestitution:p.pins[0].restitution,roadPinRadius:p.pins[0].r,ballRadius:p.ballRadius,spawned:p.metrics.spawned,entered:entered.size,counts:m.flow.counts,maxRoadBacktrackSourcePx:maxBacktrack,maxRoadRiseSourcePx:maxRise,longestLowSpeedSeconds:longest,longestStationarySeconds:stationary,roadRemaining:remaining.filter(b=>inRoad(b.x,b.y)),entryRemaining:remaining.filter(b=>inEntry(b.x,b.y)),remaining,reconciled:Object.values(m.flow.counts).reduce((a,b)=>a+b,0)+remaining.length===p.metrics.spawned};
 reports.push(report);console.log(JSON.stringify(report));writeFileSync(out+'/cases.json',JSON.stringify(reports,null,2));
 if(report.spawned!==shots||!report.reconciled)throw Error('Shot/accounting mismatch');
}
const after=hash();writeFileSync(out+'/manifest.json',JSON.stringify({before,after,unchanged:JSON.stringify(before)===JSON.stringify(after),baseline,roadRegion:'within 10 source px of authored road-pin segments',entryRegion:'source x148..190,y600..685',lowSpeed:'speed < 8 world units/s, continuous per ball in region',stationary:'speed < 1 world unit/s, continuous per ball in region',scope:'real launches in mechanical fixture; lottery and wallet excluded'},null,2));
if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Source changed during measurement');
