import {createBoardFlow} from '../pixi/board-flow.js';
import {productionBoardFlowOptions} from '../app/production-board-profile.js';
import {sourcePoint} from '../pixi/source-layout.js';
export const APRON_SEGMENT={id:'apron-outer',segment:2};
export const APRON_DROP_POINTS=[[205,728],[280,767],[350,804]];
// Dev-only hypothesis. Never imported by production callers or persisted.
export function createApronComparisonModel({decorative=false}={}){
 const model=createBoardFlow({lcd:true,...productionBoardFlowOptions(),guideMechanicsProfile:'legacy'}),{flow}=model,p=flow.physics;
 const edge=p.colliders.find(c=>c.sourceGuideId===APRON_SEGMENT.id&&c.sourceGuideSegment===APRON_SEGMENT.segment);
 if(!edge)throw new Error('Comparison segment is missing');
 if(decorative)edge.active=false;
 let nextId=1;
 return {flow,physics:p,edge,
  drop(point=APRON_DROP_POINTS[0]){
   const [x,y]=sourcePoint(point),ball={id:nextId++,x,y,vx:0,vy:0,r:p.ballRadius,age:0,hits:0,contactCount:0,contactRoles:[],leftLaunchPlane:true,launchExitCrossed:true,nonReturnValveCrossed:true};
   p.balls.push(ball);return ball;
  },
  step:dt=>flow.step(dt)
 };
}
export function apronClearance(physics){
 const edge=physics.colliders.find(c=>c.sourceGuideId===APRON_SEGMENT.id&&c.sourceGuideSegment===APRON_SEGMENT.segment),dx=edge.b.x-edge.a.x,dy=edge.b.y-edge.a.y,len2=dx*dx+dy*dy;
 const gaps=physics.pins.slice(2,26).map(p=>{const t=Math.max(0,Math.min(1,((p.x-edge.a.x)*dx+(p.y-edge.a.y)*dy)/len2));return Math.hypot(p.x-edge.a.x-t*dx,p.y-edge.a.y-t*dy)-p.r-edge.r;});
 return {min:Math.min(...gaps),max:Math.max(...gaps),diameter:physics.ballRadius*2};
}
