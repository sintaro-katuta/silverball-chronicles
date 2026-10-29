import {RIGHT_USER_LAYOUT_LINES,RIGHT_USER_LAYOUT_VERSION} from './source-right-user-layout-data.js';
import {sourcePath} from './source-layout.js';

// Install after the recessed left-stage construction: editing a front/right
// guide must not silently reshape the accepted left route's rear floor.
export function installRightUserLayout(physics,{rearElectricDecoration=true}={}){
 const ids=new Set(RIGHT_USER_LAYOUT_LINES.map(l=>l.id));
 physics.colliders=physics.colliders.filter(c=>!ids.has(c.sourceGuideId)&&!c.role.startsWith('right-channel-7-'));
 for(const line of RIGHT_USER_LAYOUT_LINES){
  const existing=physics.sourceGuidePaths.find(p=>p.id===line.id);
  const points=line.points.map(p=>[...p]);
  const path={region:5,role:`user-right-${line.id}`,contact:line.kind==='guide',r:.65,material:'resin',restitution:.04,
   ...existing,id:line.id,name:line.name,points,closed:line.closed,
   worldPoints:sourcePath(points).map(([x,y])=>({x,y})),userLayout:true};
  if(line.id==='electric-left-moulding'&&!rearElectricDecoration){
   delete path.contactRole;delete path.depthPlane;
  }
  if(existing)physics.sourceGuidePaths[physics.sourceGuidePaths.indexOf(existing)]=path;
  else physics.sourceGuidePaths.push(path);
  if(path.contact){
   const ps=path.closed?[...path.worldPoints,path.worldPoints[0]]:path.worldPoints;
   for(let i=1;i<ps.length;i++)physics.colliders.push({a:{...ps[i-1]},b:{...ps[i]},r:path.r,material:path.material,
    restitution:path.restitution,role:path.role,sourceGuideId:path.id,sourceGuideSegment:i-1,
    ...(path.contactRole==='rear-decoration'?{active:false,contactRole:'rear-decoration',depthPlane:'behind-pins'}:{})});
  }
  if(line.name==='右下ひし形')physics.userElectricDeflector={id:line.id,points};
 }
 physics.sourceGuideTraceVersion=RIGHT_USER_LAYOUT_VERSION;
 physics.rightUserLayoutVersion=RIGHT_USER_LAYOUT_VERSION;
}
