import {sourcePoint,SCREEN_SOURCE,ELECTRIC_DEFLECTOR_SOURCE} from './source-layout.js';
const copy=ps=>ps.map(p=>[...p]);
const nearestIndex=(ps,p)=>ps.reduce((best,q,i)=>Math.hypot(q[0]-p[0],q[1]-p[1])<Math.hypot(ps[best][0]-p[0],ps[best][1]-p[1])?i:best,0);
function sectionY(ps,min,max){const out=[];for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],dy=b[1]-a[1];let lo=0,hi=1;if(dy){const ts=[(min-a[1])/dy,(max-a[1])/dy].sort((a,b)=>a-b);lo=Math.max(0,ts[0]);hi=Math.min(1,ts[1]);}else if(a[1]<min||a[1]>max)continue;if(lo>hi)continue;for(const t of[lo,hi]){const p=[a[0]+(b[0]-a[0])*t,a[1]+dy*t],last=out.at(-1);if(!last||Math.hypot(p[0]-last[0],p[1]-last[1])>1e-8)out.push(p);}}return out;}
// Every contact edge remains the authored line. The offset is only the material
// behind that edge; it does not create a collider or enlarge a passage.
export function materialStrip(points,width,side){const back=points.map((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[p[0]-dy/l*width*side,p[1]+dx/l*width*side];});return[...copy(points),...back.reverse()];}
export function sourceBoardSurfaces(physics){
 if(!physics.sourceGuideTraceVersion||!physics.sourceGuidePaths)return null;
 const guide=id=>{const p=physics.sourceGuidePaths.find(p=>p.id===id);if(!p)throw new Error(`Missing source board part ${id}`);return copy(p.points);};
 const left=guide('left-title-edge'),apron=guide('apron-outer'),step=guide('unit-right-step'),inner=guide('right-channel-inner'),outer=guide('right-channel-outer'),inlet=guide('left-inlet'),tube=guide('left-return');
 const corner=nearestIndex(apron,step.at(-1)),rightBody=sectionY(inner,345,613);
 const bridge=physics.sourceGuideBridge;
 const frame=[...left,...(bridge?copy(bridge.points.slice(1,-1)):[]),...apron.slice(0,corner+1),...step.slice().reverse(),...rightBody.slice().reverse()];
 const apronInside=guide('apron-inner'),apronMoulding=guide('apron-moulding');
 const rightWall=guide('right-return-wall'),returnInside=guide('right-return-inner'),outside=guide('right-outside-wall'),outsideBack=guide('right-outside-back-edge'),lower=guide('right-lower-guide'),electric=guide('electric-left-moulding'),electricBack=guide('electric-outer-bevel');
 const a=nearestIndex(rightWall,returnInside[0]),b=nearestIndex(rightWall,returnInside.at(-1));
 const upper=sectionY(inner,150,365);
 const strips=physics.sourceGuidePaths.filter(p=>p.contact&&p.id!==physics.userElectricDeflector?.id).map(p=>{const side=['left-title-edge','apron-outer','unit-right-step','right-channel-outer','right-outside-wall','right-return-inner'].includes(p.id)?-1:1,width=p.id==='right-outside-wall'?5.5:p.id==='left-inlet'?2.5:4;return{id:p.id,decorationLine:p.contactRole==='decoration'&&p.id!=='left-return',points:copy(p.points),r:p.r,face:materialStrip(p.points,width,side),side};});
 if(bridge)strips.push({id:bridge.id,decorationLine:bridge.contactRole==='decoration',points:copy(bridge.points),r:bridge.r,face:materialStrip(bridge.points,4,-1),side:-1});
 const slope=physics.sourceSlopeGuide;if(slope)strips.push({id:slope.id,points:copy(slope.points),r:slope.r,face:materialStrip(slope.points,4,-1),side:-1});
 return {sourceActuators:!!physics.sourceRightActuators,leftLowerGuide:physics.sourceLeftLowerGuide?.points??null,upperRightGuide:physics.sourceRightUpperGuide?.points??null,omitDecorativeLines:physics.guideMechanicsProfile==='continuous-source-v1',guideMechanicsProfile:physics.guideMechanicsProfile,returnDecoration:copy(tube),version:physics.sourceGuideTraceVersion,frame,exteriorRight:copy(outsideBack),deflector:copy(physics.userElectricDeflector?.points??ELECTRIC_DEFLECTOR_SOURCE),
  leftFloor:[...inlet,...sectionY(left,368,562).reverse()],
  rightFloor:[...sectionY(inner,368,613),...outer.slice().reverse()],
  lowerFloor:[...outside,...rightWall.slice().reverse()],
  outerWallFace:[...outside,...outsideBack.slice().reverse()],
  returnWallFace:[...rightWall.slice(a,b+1),...returnInside.slice().reverse()],
  electricFace:[...electric,...electricBack.slice().reverse()],
  apronBevel:[...apronMoulding,...apronInside.slice().reverse()],
  // Legacy preview cutout only. The adopted profile paints this part as
  // decoration behind the continuous guard, without an entrance.
  tubeCutout:[...tube,[130,tube.at(-1)[1]],[130,tube[0][1]]],
  upperRelief:[[189,346],[224,301],[238,253],[285,202],[279,185],[391,174],[445,158],...upper,[704,363],[558,367],[444,345],[322,369]],
  rightRelief:[[711,370],...sectionY(inner,370,613),...step.slice(0,3),[711,629]],
  claspClip:[[709,655],...sectionY(rightWall,659,733),...returnInside,...lower.slice(0,6).reverse()],
  opening:copy(SCREEN_SOURCE),
  innerLip:[...copy(SCREEN_SOURCE.slice(0,8)),...apronInside.slice().reverse(),...copy(SCREEN_SOURCE.slice(13))],
  strips,details:physics.sourceGuidePaths.filter(p=>!p.contact).map(p=>({id:p.id,points:copy(p.points),recessedGuide:p.contactRole==='recessed-guide',r:p.r}))};
}
const palette={frame:'#283f53',face:'#36546b',shadow:'#102637',metal:'#6e8999',edge:'#c4d5d7',floor:'#091c2b',inset:'#122c3e',gold:'#c4aa6c'};
function trace(c,points,at){c.beginPath();points.map(at).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
export function paintSourceBoardSurfaces(c,d,at,parts){
 const poly=(ps,col)=>d.poly(ps.map(at),col);
 // Recessed playfield remains visible between separate mechanical parts.
 for(const ps of[parts.leftFloor,parts.rightFloor,parts.lowerFloor])poly(ps,palette.floor);
 poly(parts.outerWallFace,palette.frame);poly(parts.returnWallFace,palette.frame);poly(parts.electricFace,palette.frame);
 c.save();trace(c,parts.frame,at);c.clip();poly(parts.frame,palette.frame);poly(parts.apronBevel,palette.face);c.restore();
 // The LCD is an opening. Only historical previews also cut out the return.
 c.save();c.globalCompositeOperation='destination-out';poly(parts.opening,'#000');if(parts.guideMechanicsProfile!=='continuous-source-v1')poly(parts.tubeCutout,'#000');c.restore();
 // Recess floors are not opaque material in front of the LCD presentation.
 c.save();c.globalCompositeOperation='destination-out';poly(parts.opening,'#000');c.restore();
 if(parts.guideMechanicsProfile==='continuous-source-v1')poly(parts.returnDecoration,palette.face);
 paintSourceBoardEdges(d,at,parts,{faces:true});
 if(!parts.omitDecorativeLines){const ps=parts.innerLip.map(at);for(let i=0;i<ps.length;i++)d.line(...ps[i],...ps[(i+1)%ps.length],palette.gold,2);}
}
export function paintSourceBoardEdges(d,at,parts,{faces=true}={}){
 // The solid right upper band is the source drawing's guide, not a nail.
 // Paint it again in the foreground so the superseded ellipse does not show
 // through its solid material. Collision uses the identical source vertices.
 for(const guide of [parts.upperRightGuide,parts.leftLowerGuide].filter(Boolean)){
  const ps=guide.map(at);d.poly(ps,palette.face);
  for(let i=0;i<ps.length;i++)d.line(...ps[i],...ps[(i+1)%ps.length],palette.metal,1);
 }
 for(const s of parts.strips){
  if(parts.omitDecorativeLines&&s.decorationLine)continue;
  if(faces)d.poly(s.face.map(at),palette.frame);
  const ps=s.points.map(at);
  // The dark/metal core shares the collider diameter. One small highlight
  // stays inside it; there are no new parallel white rails or outside shadows.
  const core=Math.max(1,s.r*6);
  for(let i=1;i<ps.length;i++){d.line(...ps[i-1],...ps[i],palette.shadow,core);d.line(...ps[i-1],...ps[i],palette.metal,Math.max(1,core-1));d.line(...ps[i-1],...ps[i],palette.edge,1);}
 }
 d.poly(parts.deflector.map(at),palette.frame);const deflector=parts.deflector.map(at);for(let i=1;i<deflector.length;i++)d.line(...deflector[i-1],...deflector[i],palette.metal,1);
 for(const detail of parts.details){if(parts.omitDecorativeLines&&!detail.recessedGuide)continue;const ps=detail.points.map(at);for(let i=parts.omitDecorativeLines?2:1;i<ps.length;i++)d.line(...ps[i-1],...ps[i],detail.recessedGuide?palette.metal:detail.id==='apron-inner'?palette.gold:'#59778d',detail.recessedGuide&&i>1?detail.r*6:1);}
}
export const sourceBoardTexturePoint=([sx,sy])=>{const[x,y]=sourcePoint([sx,sy]);return[Math.round(x*3),Math.round((y-130)*3)];};
