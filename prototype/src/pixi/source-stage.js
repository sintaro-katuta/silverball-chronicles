import {sourcePoint,sourcePath,SCREEN_SOURCE} from './source-layout.js';
import {prepareSolidPolygon} from '../physics/solid-polygon-contact.js';
// User-marked points identify this existing path. Its coordinates are never
// replaced with an invented tunnel. Depth is a local 2.5D calibration only.
export function installSourceStage(physics){
 const path=physics.sourceGuidePaths.find(p=>p.id==='apron-moulding'),front=physics.sourceGuidePaths.find(p=>p.id==='apron-outer');
 const points=sourcePath(path.points).map(([x,y])=>({x,y})),radius=.65;
 path.contactRole='recessed-guide';path.depthPlane='stage';
 const guides=points.slice(2).map((b,i)=>({a:points[i+1],b,r:radius,restitution:.08,role:'source-stage-guide',sourceGuideId:path.id,sourceGuideSegment:i+1,depthPlane:'stage'}));
 const end=physics.sourceGuidePaths.find(p=>p.id==='unit-right-step');for(let i=1;i<end.worldPoints.length;i++)guides.push({a:{...end.worldPoints[i-1]},b:{...end.worldPoints[i]},r:end.r,restitution:.08,role:'source-stage-end',sourceGuideId:end.id,sourceGuideSegment:i-1,depthPlane:'stage'});
 // Use the actual central U and front edge from the drawing for the return
 // slope's cross section. These bounds add no new authored picture lines.
 const backY=points[8].y,left=points[7].x,right=points[10].x,frontY=sourcePoint(front.points.find(p=>p[0]===438))[1];
 const depth=9,drop=frontY-backY,length=Math.hypot(depth,drop),[x,y]=sourcePoint([174.3,634.7]);
 const lcd={shape:'solid-polygon',solid:prepareSolidPolygon(sourcePath(SCREEN_SOURCE).map(([x,y])=>({x,y}))),restitution:.08,role:'source-lcd-exclusion',playfieldOnly:true};
 const frontWorld=sourcePath(front.points.slice(2,14)).map(([x,y])=>({x,y}));
 const floorPoints=[...points.slice(1),{...end.worldPoints.at(-1)},...frontWorld.reverse()];
 const floor={shape:'solid-polygon',solid:prepareSolidPolygon(floorPoints),restitution:.08,role:'source-stage-guide'};floor.a=floorPoints[0];floor.b=floorPoints.at(-1);
 lcd.a=lcd.solid.points[0];lcd.b=lcd.solid.points.at(-1);
 physics.sourceStage={floor,neck:{a:points[0],b:points[1],r:radius,restitution:.08,role:'source-stage-neck'},pathId:path.id,points:points.map(p=>({...p})),guides,radius,depth,lcd,entrance:{x,y,width:12,normal:{x:1,y:0}},ramp:{left,right,backLeft:points[4].x,backRight:points[13].x,backY,frontY,length,ty:drop/length,tz:depth/length}};
 physics.sourceStageMetrics={entered:0,exited:0,spilled:0};physics.colliders.push(lcd);
 physics.leftEntranceContactProfile='source-recessed-guide-v1';
}
