import {createBoardFlow} from '../pixi/board-flow.js';
import {productionBoardFlowOptions} from '../app/production-board-profile.js';
import {overlapsLcd} from '../pixi/lcd-layout.js';
import {sourcePoint,sourcePath,SCREEN_SOURCE} from '../pixi/source-layout.js';
export const FRAME_DECORATIVE_IDS=['left-title-edge','left-return','apron-outer','unit-right-step'];
export const FRAME_TRIALS={
 current:{label:'現在',radius:3,speedOffset:125},
 'diagonal-only':{label:'斜線1区間だけ外す',radius:3,speedOffset:125},
 'lcd-only':{label:'枠の接触だけ見直す',radius:3,speedOffset:125},
 calibrated:{label:'小径玉と元の初速で切り分け',radius:1.8,speedOffset:55}
};
// Deliberately dev-only. The smaller ball and original launch offset are a
// declared control, not production adoption and not a disguised contact radius.
export function createFrameRouteTrial(kind='current'){
 const config=FRAME_TRIALS[kind];if(!config)throw new Error('Unknown frame route trial');
 const model=createBoardFlow({lcd:true,...productionBoardFlowOptions(),guideMechanicsProfile:'legacy',ballRadius:config.radius,normalLaunchSpeedOffset:config.speedOffset}),{flow}=model,p=flow.physics;
 if(kind==='diagonal-only')p.colliders.find(c=>c.sourceGuideId==='apron-outer'&&c.sourceGuideSegment===2).active=false;
 if(!['current','diagonal-only'].includes(kind)){
  for(const c of p.colliders)if(FRAME_DECORATIVE_IDS.includes(c.sourceGuideId))c.active=false;
  const points=sourcePath(SCREEN_SOURCE).map(([x,y])=>({x,y}));
  for(let i=0;i<points.length;i++)p.colliders.push({a:points[i],b:points[(i+1)%points.length],r:.5,material:'resin',role:'trial-lcd-opening',restitution:.08,playfieldOnly:true,trialLcdEdge:true});
 }
 model.setMode('normal');let id=1;
 return{flow,physics:p,config,
  drop(point){const[x,y]=sourcePoint(point),b={id:id++,x,y,vx:0,vy:0,r:p.ballRadius,age:0,hits:0,contactCount:0,contactRoles:[],leftLaunchPlane:true,launchExitCrossed:true,nonReturnValveCrossed:true};p.balls.push(b);return b;},
  step:dt=>flow.step(dt)
 };
}
export function runFrameRouteTrial(kind,{shots=30,phase=0,drainSeconds=25}={}){
 const m=createFrameRouteTrial(kind),p=m.physics,entered=new Set(),lcdIntrusions=new Set();
 for(let i=0;i<Math.round(phase*120);i++)m.step(1/120);
 m.flow.start();let stoppedAt=null,maxAge=0;
 for(let i=0;i<100*120;i++){
  if(p.metrics.spawned>=shots&&stoppedAt===null){m.flow.stop();stoppedAt=p.time;}
  m.step(1/120);for(const b of p.balls){if(b.leftLaunchPlane)entered.add(b.id);maxAge=Math.max(maxAge,b.age);if(b.leftLaunchPlane&&overlapsLcd(b))lcdIntrusions.add(b.id);}
  if(stoppedAt!==null&&p.time-stoppedAt>=drainSeconds)break;
 }
 const remaining=p.balls.map(({id,x,y,vx,vy,leftLaunchPlane,lastContact})=>({id,x,y,speed:Math.hypot(vx,vy),front:!!leftLaunchPlane,lastContact}));
 return{kind,phase,requested:shots,spawned:p.metrics.spawned,entered:entered.size,counts:{...m.flow.counts},remaining,seconds:p.time,maxAge,lcdIntrusions:[...lcdIntrusions],roadContacts:p.roleFlow.michi.balls,config:m.config,reconciled:Object.values(m.flow.counts).reduce((a,b)=>a+b,0)+remaining.length===p.metrics.spawned};
}
