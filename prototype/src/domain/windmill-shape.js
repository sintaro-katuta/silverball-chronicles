// Visible authored outline in board units. Unknown transparent housing is not solid.
export const WINDMILL_VISIBLE_SHAPE_VERSION='photo-three-vane-v1';
const EPS=1e-10;
const cross=(a,b)=>a.x*b.y-a.y*b.x;
const rotate=(x,y,angle)=>({x:Math.cos(angle)*x-Math.sin(angle)*y,y:Math.sin(angle)*x+Math.cos(angle)*y});
const inside=(p,polygon,tolerance=EPS)=>polygon.every((a,i)=>{const b=polygon[(i+1)%polygon.length];return cross({x:b.x-a.x,y:b.y-a.y},{x:p.x-a.x,y:p.y-a.y})>=-tolerance;});
function exposedBoundary(components,hub){
 const boundary=[];
 for(const owner of components)for(let i=0;i<owner.points.length;i++){
  const a=owner.points[i],b=owner.points[(i+1)%owner.points.length],delta={x:b.x-a.x,y:b.y-a.y},length=Math.hypot(delta.x,delta.y),outward={x:delta.y/length,y:-delta.x/length},ts=[0,1];
  for(const other of components)if(other!==owner)for(let j=0;j<other.points.length;j++){
   const c=other.points[j],d=other.points[(j+1)%other.points.length],edge={x:d.x-c.x,y:d.y-c.y},offset={x:c.x-a.x,y:c.y-a.y},den=cross(delta,edge);
   if(Math.abs(den)>EPS){const t=cross(offset,edge)/den,u=cross(offset,delta)/den;if(t>EPS&&t<1-EPS&&u>=-EPS&&u<=1+EPS)ts.push(t);}
   else if(Math.abs(cross(offset,delta))<EPS)for(const p of [c,d]){const t=((p.x-a.x)*delta.x+(p.y-a.y)*delta.y)/(length*length);if(t>EPS&&t<1-EPS)ts.push(t);}
  }
  const aa=delta.x**2+delta.y**2,bb=2*(a.x*delta.x+a.y*delta.y),cc=a.x*a.x+a.y*a.y-hub.radius**2,disc=bb*bb-4*aa*cc;
  if(disc>=0)for(const t of [(-bb-Math.sqrt(disc))/(2*aa),(-bb+Math.sqrt(disc))/(2*aa)])if(t>EPS&&t<1-EPS)ts.push(t);
  const sorted=[...new Set(ts)].sort((x,y)=>x-y);
  for(let j=1;j<sorted.length;j++){
   const lo=sorted[j-1],hi=sorted[j];if(hi-lo<EPS)continue;
   const mid=(lo+hi)/2,test={x:a.x+mid*delta.x+outward.x*1e-8,y:a.y+mid*delta.y+outward.y*1e-8};
   if(Math.hypot(test.x,test.y)<hub.radius||components.some(other=>other!==owner&&inside(test,other.points)))continue;
   boundary.push({type:'line',ownerId:owner.id,kind:owner.kind,a:{x:a.x+lo*delta.x,y:a.y+lo*delta.y},b:{x:a.x+hi*delta.x,y:a.y+hi*delta.y},outward});
  }
 }
 // Circle/polygon intersections split the analytic hub boundary into exposed arcs.
 const angles=[0,2*Math.PI];
 for(const c of components)for(let i=0;i<c.points.length;i++){
  const a=c.points[i],b=c.points[(i+1)%c.points.length],dx=b.x-a.x,dy=b.y-a.y,A=dx*dx+dy*dy,B=2*(a.x*dx+a.y*dy),C=a.x*a.x+a.y*a.y-hub.radius**2,D=B*B-4*A*C;
  if(D>=0)for(const t of [(-B-Math.sqrt(D))/(2*A),(-B+Math.sqrt(D))/(2*A)])if(t>=0&&t<=1){let q=Math.atan2(a.y+t*dy,a.x+t*dx);if(q<0)q+=2*Math.PI;angles.push(q);}
 }
 angles.sort((a,b)=>a-b);
 for(let i=1;i<angles.length;i++){const startAngle=angles[i-1],endAngle=angles[i];if(endAngle-startAngle<EPS)continue;const mid=(startAngle+endAngle)/2,test={x:Math.cos(mid)*(hub.radius+1e-8),y:Math.sin(mid)*(hub.radius+1e-8)};if(components.some(c=>inside(test,c.points)))continue;boundary.push({type:'arc',ownerId:'hub',kind:'hub',centre:{x:0,y:0},radius:hub.radius,startAngle,endAngle,a:rotate(hub.radius,0,startAngle),b:rotate(hub.radius,0,endAngle)});}
 return boundary;
}
let cached=null;
export function windmillVisibleShape(radius,angle){
 if(!Number.isFinite(radius)||radius<=0||!Number.isFinite(angle))throw Error('Invalid visible windmill geometry');
 if(cached?.radius===radius&&cached.angle===angle)return cached;
 const authored=[[2.4,-1.7],[5.3,-1.65],[9.2,-.9],[9.5,-.35],[9.5,.35],[9.2,.9],[5.3,1.65],[2.4,1.7]],scale=radius/10;
 const blades=Array.from({length:3},(_,i)=>({id:`blade-${i}`,kind:'blade',armIndex:i,points:authored.map(([x,y])=>rotate(x*scale,y*scale,angle+i*2*Math.PI/3))}));
 // points are a display/export aid; contact uses the exact circle radius and arcs.
 const hub={id:'hub',kind:'hub',shape:'circle',centre:{x:0,y:0},radius:3.5*scale,points:Array.from({length:64},(_,i)=>rotate(3.5*scale,0,i*2*Math.PI/64))};
 const components=[...blades,hub],boundary=exposedBoundary(blades,hub),points=components.flatMap(c=>c.points);
 cached={version:WINDMILL_VISIBLE_SHAPE_VERSION,radius,angle,components,boundary,plate:{radius,contact:false,depth:'front',rotatesWithRotor:true,angle},axis:{radius:.2*scale,contact:false,reason:'Contained in rotor hub'},bounds:{minX:Math.min(...points.map(p=>p.x)),maxX:Math.max(...points.map(p=>p.x)),minY:Math.min(...points.map(p=>p.y)),maxY:Math.max(...points.map(p=>p.y))},numericalTolerance:EPS};return cached;
}
export function pointInWindmillUnion(point,geometry){return geometry.components.some(c=>c.shape==='circle'?Math.hypot(point.x-c.centre.x,point.y-c.centre.y)<=c.radius:inside(point,c.points,0));}
export function windmillContactGeometry(m){
 const profile=m.shapeProfile??'legacy-capsules',world=p=>({x:p.x+m.x,y:p.y+m.y});
 if(profile==='legacy-capsules')return {profile,centre:{x:m.x,y:m.y},angle:m.angle,capsules:Array.from({length:4},(_,armIndex)=>({armIndex,a:{x:m.x,y:m.y},b:world(rotate(m.radius,0,m.angle+armIndex*Math.PI/2)),r:1.3})),components:[],boundary:[]};
 if(profile!=='photo-three-vane')throw Error('Unknown windmill shape profile');
 const g=windmillVisibleShape(m.radius,m.angle);return {...g,profile,centre:{x:m.x,y:m.y},localBounds:g.bounds,bounds:{minX:g.bounds.minX+m.x,maxX:g.bounds.maxX+m.x,minY:g.bounds.minY+m.y,maxY:g.bounds.maxY+m.y},components:g.components.map(c=>({...c,...(c.centre?{centre:world(c.centre)}:{}),points:c.points.map(world)})),boundary:g.boundary.map(e=>({...e,...(e.centre?{centre:world(e.centre)}:{}),a:world(e.a),b:world(e.b)}))};
}
