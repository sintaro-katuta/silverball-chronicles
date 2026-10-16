// Visible authored outline in board units. Unknown transparent housing is not solid.
export const WINDMILL_VISIBLE_SHAPE_VERSION='visible-shared-v1';
const EPS=1e-10;
const cross=(a,b)=>a.x*b.y-a.y*b.x;
const rotate=(x,y,angle)=>({x:Math.cos(angle)*x-Math.sin(angle)*y,y:Math.sin(angle)*x+Math.cos(angle)*y});
const inside=(p,polygon,tolerance=EPS)=>polygon.every((a,i)=>{const b=polygon[(i+1)%polygon.length];return cross({x:b.x-a.x,y:b.y-a.y},{x:p.x-a.x,y:p.y-a.y})>=-tolerance;});
function exposedBoundary(components){
 const boundary=[];
 for(const owner of components)for(let i=0;i<owner.points.length;i++){
  const a=owner.points[i],b=owner.points[(i+1)%owner.points.length],delta={x:b.x-a.x,y:b.y-a.y},length=Math.hypot(delta.x,delta.y),outward={x:delta.y/length,y:-delta.x/length},ts=[0,1];
  for(const other of components)if(other!==owner)for(let j=0;j<other.points.length;j++){
   const c=other.points[j],d=other.points[(j+1)%other.points.length],edge={x:d.x-c.x,y:d.y-c.y},offset={x:c.x-a.x,y:c.y-a.y},den=cross(delta,edge);
   if(Math.abs(den)>EPS){const t=cross(offset,edge)/den,u=cross(offset,delta)/den;if(t>EPS&&t<1-EPS&&u>=-EPS&&u<=1+EPS)ts.push(t);}
   else if(Math.abs(cross(offset,delta))<EPS)for(const p of [c,d]){const t=((p.x-a.x)*delta.x+(p.y-a.y)*delta.y)/(length*length);if(t>EPS&&t<1-EPS)ts.push(t);}
  }
  const sorted=[...new Set(ts)].sort((x,y)=>x-y);
  for(let j=1;j<sorted.length;j++){
   const lo=sorted[j-1],hi=sorted[j];if(hi-lo<EPS)continue;
   const mid=(lo+hi)/2,test={x:a.x+mid*delta.x+outward.x*1e-8,y:a.y+mid*delta.y+outward.y*1e-8};
   if(components.some(other=>other!==owner&&inside(test,other.points)))continue;
   boundary.push({ownerId:owner.id,kind:owner.kind,a:{x:a.x+lo*delta.x,y:a.y+lo*delta.y},b:{x:a.x+hi*delta.x,y:a.y+hi*delta.y},outward});
  }
 }
 return boundary;
}
let cached=null;
export function windmillVisibleShape(radius,angle){
 if(!Number.isFinite(radius)||radius<=8/3||!Number.isFinite(angle))throw Error('Invalid visible windmill geometry');
 if(cached?.radius===radius&&cached.angle===angle)return cached;
 const w=4/3,blade=[[0,-w],[radius-w,-w],[radius,0],[radius-w,w],[0,w]],components=Array.from({length:4},(_,i)=>({id:`blade-${i}`,kind:'blade',armIndex:i,points:blade.map(([x,y])=>rotate(x,y,angle+i*Math.PI/2))}));
 components.push({id:'cap',kind:'cap',points:[{x:0,y:-8/3},{x:8/3,y:0},{x:0,y:8/3},{x:-8/3,y:0}]});
 const boundary=exposedBoundary(components),points=components.flatMap(c=>c.points);
 cached={version:WINDMILL_VISIBLE_SHAPE_VERSION,radius,angle,components,boundary,bounds:{minX:Math.min(...points.map(p=>p.x)),maxX:Math.max(...points.map(p=>p.x)),minY:Math.min(...points.map(p=>p.y)),maxY:Math.max(...points.map(p=>p.y))},numericalTolerance:EPS,cap:'Fixed visible diamond; zero surface velocity and no torque. Rotating blades retain existing response.'};return cached;
}
export function pointInWindmillUnion(point,geometry){return geometry.components.some(c=>inside(point,c.points,0));}
export function windmillContactGeometry(m){
 const profile=m.shapeProfile??'legacy-capsules',world=p=>({x:p.x+m.x,y:p.y+m.y});
 if(profile==='legacy-capsules')return {profile,centre:{x:m.x,y:m.y},angle:m.angle,capsules:Array.from({length:4},(_,armIndex)=>({armIndex,a:{x:m.x,y:m.y},b:world(rotate(m.radius,0,m.angle+armIndex*Math.PI/2)),r:1.3})),components:[],boundary:[]};
 if(profile!=='visible-polygons')throw Error('Unknown windmill shape profile');
 const g=windmillVisibleShape(m.radius,m.angle);return {...g,profile,centre:{x:m.x,y:m.y},localBounds:g.bounds,bounds:{minX:g.bounds.minX+m.x,maxX:g.bounds.maxX+m.x,minY:g.bounds.minY+m.y,maxY:g.bounds.maxY+m.y},components:g.components.map(c=>({...c,points:c.points.map(world)})),boundary:g.boundary.map(e=>({...e,a:world(e.a),b:world(e.b)}))};
}
