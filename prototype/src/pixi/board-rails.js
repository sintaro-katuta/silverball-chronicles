import {getReferenceRailShape} from './reference-rail-shapes.js';
import {prepareSolidPolygon} from '../physics/solid-polygon-contact.js';
import {sourcePath,sourcePoint,LAUNCH_EXIT_CONTACT_SOURCE,LAUNCH_EXIT_VISIBLE_SOURCE,LAUNCH_EXIT_WHITE_MARK_SOURCE,LAUNCH_EXIT_RAIL_EDGE_SOURCE,LAUNCH_VALVE_CONTACT_SOURCE} from './source-layout.js';
const arc=(rx,ry,end,n)=>Array.from({length:n+1},(_,i)=>{const a=Math.PI+(end-Math.PI)*i/n;const [x,y]=sourcePoint([444+rx*Math.cos(a),530+ry*Math.sin(a)]);return {x,y};});
export const OUTER_ARC=arc(372,410,Math.PI*2,80);
const EXIT_ANGLE=Math.PI*1.23;
export const INNER_ARC=arc(352,390,EXIT_ANGLE,24);
// Existing estimated contact scale; the visible core shares this diameter.
export const LAUNCH_RAIL_RADIUS=.7;
export const LAUNCH_RAIL_CORE_WIDTH=LAUNCH_RAIL_RADIUS*2;
const outerExit=arc(372,410,EXIT_ANGLE,1).at(-1),innerExit=INNER_ARC.at(-1);
const dx=outerExit.x-innerExit.x,dy=outerExit.y-innerExit.y,length=Math.hypot(dx,dy);
export const LAUNCH_EXIT=Object.freeze({a:innerExit,b:outerExit,normal:{x:-dy/length,y:dx/length},width:length,railRadius:LAUNCH_RAIL_RADIUS});
export const PLAYFIELD_APERTURE=[...OUTER_ARC.map(p=>[p.x,p.y]),...sourcePath([[814,615],[814,924],[610,940],[444,940],[280,927],[215,872],[147,769],[94,645],[72,530]])];
// Opt-in local structural trial. Legacy default and saved tool geometry are unchanged.
export function boardRailGeometry(profile='legacy'){
 if(!['legacy','guarded-exit','reference-exit'].includes(profile))throw new Error('Unknown launch rail profile');
 if(profile!=='reference-exit')return {profile,inner:INNER_ARC,outer:OUTER_ARC,exit:LAUNCH_EXIT};
 const visibleShape=getReferenceRailShape(),outerVisible=visibleShape.components.find(c=>c.id==='outer-thin-band'),a={};
 // SOURCE conversion is a uniform picture transform, not an internal measurement.
 const [ax,ay]=sourcePoint(LAUNCH_VALVE_CONTACT_SOURCE[0]);a.x=ax;a.y=ay;
 const sourceY=LAUNCH_VALVE_CONTACT_SOURCE[0][1],edge=outerVisible.sampledRightSource,i=edge.findIndex(p=>p[1]>=sourceY),q=edge[Math.max(0,i-1)],p=edge[i],t=(sourceY-q[1])/(p[1]-q[1]||1),[bx,by]=sourcePoint([q[0]+t*(p[0]-q[0]),sourceY]),b={x:bx,y:by},length=Math.hypot(b.x-a.x,b.y-a.y);
 return {profile,inner:INNER_ARC,outer:OUTER_ARC,visibleShape,exit:{a,b,normal:{x:0,y:-1},width:length,railRadius:0},reference:{visibleShapeVersion:visibleShape.version,contactSource:LAUNCH_EXIT_CONTACT_SOURCE,supersededContactSource:true,visibleSource:LAUNCH_EXIT_VISIBLE_SOURCE,whiteMarkSource:LAUNCH_EXIT_WHITE_MARK_SOURCE,valveContactSource:LAUNCH_VALVE_CONTACT_SOURCE,retainedLegacyInnerThroughIndex:null,confirmedContactIds:['outer-thin-band SOURCE245..430','inner-gray-band SOURCE313..430','upper-rim-left front-only','upper-rim-right front-only','black-valve-body front-only'],contactModel:'Visible upper band polygons adopted as a trial model, not verified real-machine depths. Upper U-rim strips and black body are adopted front-only trial contacts following observed penetration; white interior stays open. Lower/parallel/stem/white shapes are not walls.',unmeasuredLauncher:'Legacy ellipse/barrel contacts outside SOURCE245..430 are retained as an explicitly unmeasured model; may differ from visible lower support. No visible ellipse-return bulge is added.',note:'Visible edges and contact solids share exact sampled vertices. Finite crossing plane uses passage-side outer edge and remains distinct from ideal diagonal valve. Real depth/hinge inertia are unmeasured.'}};

}
export function installBoardRails(physics,{profile='legacy'}={}){
 const geometry=boardRailGeometry(profile);physics.launchExit=geometry.exit;physics.launchRailProfile=profile;if(geometry.reference)physics.launchRailReference=geometry.reference;
 physics.colliders=physics.colliders.filter(c=>!c.role.startsWith('launch-')&&!['upper-reflector','board-top','out-left','out-right'].includes(c.role));
 const add=(a,b,role)=>physics.colliders.push({a,b,r:role.startsWith('launch-')?LAUNCH_RAIL_RADIUS:.7,material:'rail',role,restitution:.05});
 add({x:22,y:680},OUTER_ARC[0],'launch-outer');add({x:36,y:680},INNER_ARC[0],'launch-inner');
 if(profile!=='reference-exit'){for(const [ps,role] of [[geometry.outer,'launch-outer-arc'],[geometry.inner,'launch-inner-arc']])for(let i=1;i<ps.length;i++)add(ps[i-1],ps[i],role);}
 else{
  const min=sourcePoint([0,245])[1],max=sourcePoint([0,430])[1];
  // Preserve model-only launcher contacts outside the adopted picture interval.
  // Split at exact interval boundaries; do not draw these as matching new bands.
  for(const [ps,role]of [[OUTER_ARC,'launch-outer-arc'],[INNER_ARC,'launch-inner-arc']])for(let i=1;i<ps.length;i++){
   const a=ps[i-1],b=ps[i],dx=b.x-a.x,dy=b.y-a.y,ts=[0,1];if(dy)for(const y of [min,max]){const t=(y-a.y)/dy;if(t>0&&t<1)ts.push(t);}ts.sort((a,b)=>a-b);
   for(let j=1;j<ts.length;j++){const lo=ts[j-1],hi=ts[j],mid=(lo+hi)/2,x=a.x+mid*dx,y=a.y+mid*dy;if(x<150&&y>=min&&y<=max)continue;add({x:a.x+lo*dx,y:a.y+lo*dy},{x:a.x+hi*dx,y:a.y+hi*dy},role);const kept=physics.colliders.at(-1);kept.modelClassification='retained-unmeasured-outside-upper-source-interval';if(x<150){kept.excludeCapA=lo>0;kept.excludeCapB=hi<1;kept.excludedSurfaceYRange={min,max};}}
  }
  physics.referenceRailVisual=true;physics.railVisibleShape=geometry.visibleShape;
  for(const [id,start]of [['outer-thin-band',245],['inner-gray-band',313]]){const component=geometry.visibleShape.components.find(c=>c.id===id);physics.colliders.push({a:component.worldPoints[0],b:component.worldPoints.at(-1),r:0,material:'rail',role:id==='outer-thin-band'?'launch-outer-visible-band':'launch-inner-visible-band',shape:'solid-polygon',sourceComponentId:id,solid:prepareSolidPolygon(component.worldPoints),contactYRange:{min:sourcePoint([0,start])[1],max},restitution:.05,modelClassification:'adopted-upper-picture-shape; lower surfaces not inferred'});}
  // Accepted visible structures: trial front-plane contacts only. Back-plane
  // launch balls pass; component interiors between the thin U strips stay empty.
  for(const id of ['upper-rim-left','upper-rim-right','black-valve-body']){
   const component=geometry.visibleShape.components.find(c=>c.id===id);
   physics.colliders.push({a:component.worldPoints[0],b:component.worldPoints.at(-1),r:0,material:'rail',role:`launch-visible-${id}`,shape:'solid-polygon',sourceComponentId:id,solid:prepareSolidPolygon(component.worldPoints),playfieldOnly:true,restitution:.05,modelClassification:'PM-adopted visible component front-plane trial contact; real machine depth unmeasured'});
  }

 }

 if(profile==='guarded-exit'){
  const {a,b,normal}=geometry.exit;
  physics.colliders.push({a:{...a},b:{...b},normal:{...normal},r:LAUNCH_RAIL_RADIUS,material:'rail',role:'launch-non-return-valve',restitution:.05,playfieldOnly:true,nonReturnValve:true});
  physics.nonReturnValve={a:{...a},b:{...b},normal:{...normal},observationPlane:geometry.exit,radius:LAUNCH_RAIL_RADIUS,restitution:.05,model:'Finite one-way flap at the existing rail exit; authored trial geometry',forwardPasses:0,reverseContacts:0,lastForward:null,lastReverse:null};
 }

 if(profile==='reference-exit'){
  const [a,b]=sourcePath(LAUNCH_VALVE_CONTACT_SOURCE).map(([x,y])=>({x,y})),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),normal={x:-dy/len,y:dx/len};
  physics.colliders.push({a,b,normal,r:LAUNCH_RAIL_RADIUS,material:'rail',role:'launch-non-return-valve',restitution:.05,playfieldOnly:true,nonReturnValve:true});
  physics.nonReturnValve={a,b,normal,contactSource:LAUNCH_VALVE_CONTACT_SOURCE,observationPlane:geometry.exit,radius:LAUNCH_RAIL_RADIUS,restitution:.05,model:'User-described ideal finite one-way capsule; hinge mass/angle not measured',forwardPasses:0,reverseContacts:0,lastForward:null,lastReverse:null};
 }

 const drain=sourcePath([[92,648],[149,770],[218,871],[286,926],[550,940]]);
 for(let i=1;i<drain.length;i++)add({x:drain[i-1][0],y:drain[i-1][1]},{x:drain[i][0],y:drain[i][1]},'out-left');
 const right=sourcePath([[811,615],[811,924],[647,940]]);
 for(let i=1;i<right.length;i++)add({x:right[i-1][0],y:right[i-1][1]},{x:right[i][0],y:right[i][1]},'out-right');
}

// Treat the picture's narrow gray face as the front layer in this model.
// The larger production ball launches behind it along the existing inner rail.
// This is an authored depth model, not a measurement of the source machine.
export function installReferenceLaunchDepth(physics){
 if(physics.launchRailProfile!=='reference-exit'||!physics.separateLaunchPlane||physics.ballRadius<=1.8)return;
 physics.colliders.find(c=>c.role==='launch-inner-visible-band').playfieldOnly=true;
 const min=sourcePoint([0,245])[1],max=sourcePoint([0,430])[1];
 for(let i=1;i<INNER_ARC.length;i++){
  const a=INNER_ARC[i-1],b=INNER_ARC[i],dx=b.x-a.x,dy=b.y-a.y,ts=[0,1];
  if(dy)for(const y of [min,max]){const t=(y-a.y)/dy;if(t>0&&t<1)ts.push(t);}
  ts.sort((a,b)=>a-b);
  for(let j=1;j<ts.length;j++){
   const lo=ts[j-1],hi=ts[j],y=a.y+(lo+hi)/2*dy;if(y<min||y>max)continue;
   physics.colliders.push({a:{x:a.x+lo*dx,y:a.y+lo*dy},b:{x:a.x+hi*dx,y:a.y+hi*dy},r:LAUNCH_RAIL_RADIUS,material:'rail',role:'launch-rear-inner-arc',restitution:.05,rearOnly:true,modelClassification:'existing model inner rail behind unchanged front gray face'});
  }
 }
 physics.launchFrontClearance=true;
}
