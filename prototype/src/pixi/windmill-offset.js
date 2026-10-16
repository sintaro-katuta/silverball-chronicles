// Trial-only swept material envelope; not a solid wheel or a ball passage guarantee.
export const WINDMILL_ARM_CONTACT_RADIUS=1.3;
const segmentDistance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
export function inspectWindmillOffset(physics,offset){
 if(!offset||Object.keys(offset).sort().join(',')!=='dx,dy'||!Number.isFinite(offset.dx)||!Number.isFinite(offset.dy)||Math.hypot(offset.dx,offset.dy)>.25+1e-12)throw new Error('Invalid windmill offset; maximum displacement0.25');
 const m=physics.mechanisms[0];if(physics.mechanisms.length!==1||m.kind!=='windmill'||m.x!==64||m.y!==476.5||m.radius!==10)throw new Error('Unexpected original windmill geometry');
 const centre={x:m.x+offset.dx,y:m.y+offset.dy},radius=m.radius+WINDMILL_ARM_CONTACT_RADIUS,margins=[];
 for(const pin of physics.pins)margins.push({kind:'pin',id:pin.id,gap:Math.hypot(centre.x-pin.x,centre.y-pin.y)-radius-pin.r});
 for(const c of [...physics.colliders,physics.gate,physics.rightChucker?.scoop,physics.rightChucker?.cover].filter(Boolean)){
  if(c.shape==='solid-polygon'){
   let inside=false;const points=c.points;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>centre.y)!==(b.y>centre.y)&&centre.x<(b.x-a.x)*(centre.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}
   const gap=Math.min(...points.map((a,i)=>segmentDistance(centre,a,points[(i+1)%points.length])))-radius;margins.push({kind:'wall',id:c.role,gap:inside?-radius:gap});
  }else margins.push({kind:'wall',id:c.role,gap:segmentDistance(centre,c.a,c.b)-radius-(c.r??0)});
 }
 for(const p of physics.pockets)margins.push({kind:'pocket',id:p.id,gap:segmentDistance(centre,{x:p.x-p.w/2,y:p.y},{x:p.x+p.w/2,y:p.y})-radius});
 const invalid=margins.find(v=>!Number.isFinite(v.gap)||v.gap<=0);if(invalid)throw new Error(`Windmill envelope interference: ${invalid.kind} ${invalid.id}`);
 return {centre,sweptRadius:radius,armContactRadius:WINDMILL_ARM_CONTACT_RADIUS,margins,note:'Positive material separation only. A rotating envelope is not solid; clearance below ball diameter does not establish blockage or passage.'};
}
export function applyWindmillOffset(physics,offset){const inspection=inspectWindmillOffset(physics,offset);Object.assign(physics.mechanisms[0],inspection.centre);return inspection;}
