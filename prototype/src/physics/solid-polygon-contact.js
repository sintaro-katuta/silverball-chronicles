// A visible rail band and its collision solid share these exact vertices.
// This helper is not connected to a production/trial shape until its outline
// has been accepted. No source-image dimensions are assumed here.
export function prepareSolidPolygon(points){
 if(!Array.isArray(points)||points.length<3||points.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw new Error('Invalid solid polygon vertices');
 const vertices=points.map(({x,y})=>({x,y}));if(vertices.length>3&&vertices[0].x===vertices.at(-1).x&&vertices[0].y===vertices.at(-1).y)vertices.pop();
 const edges=vertices.map((a,i)=>{const b=vertices[(i+1)%vertices.length],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);if(length===0)throw new Error('Degenerate polygon edge');return {a,b,dx,dy,length,bounds:{minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minY:Math.min(a.y,b.y),maxY:Math.max(a.y,b.y)}};});
 const area2=edges.reduce((n,{a,b})=>n+a.x*b.y-b.x*a.y,0);if(!Number.isFinite(area2)||Math.abs(area2)<1e-12)throw new Error('Degenerate polygon area');
 const orientation=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),between=(p,a,b)=>p.x>=Math.min(a.x,b.x)&&p.x<=Math.max(a.x,b.x)&&p.y>=Math.min(a.y,b.y)&&p.y<=Math.max(a.y,b.y);
 for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){
  if(j===i+1||i===0&&j===edges.length-1)continue;const eb=edges[i].bounds,fb=edges[j].bounds;if(eb.maxX<fb.minX||fb.maxX<eb.minX||eb.maxY<fb.minY||fb.maxY<eb.minY)continue;const {a,b}=edges[i],{a:c,b:d}=edges[j],u=orientation(a,b,c),v=orientation(a,b,d),w=orientation(c,d,a),z=orientation(c,d,b);
  if(u*v<0&&w*z<0||u===0&&between(c,a,b)||v===0&&between(d,a,b)||w===0&&between(a,c,d)||z===0&&between(b,c,d))throw new Error('Self-intersecting solid polygon');
 }
 for(const e of edges)e.outward=area2>0?{x:e.dy/e.length,y:-e.dx/e.length}:{x:-e.dy/e.length,y:e.dx/e.length};
 const edgeBinSize=4,edgeBins=Object.create(null);for(let i=0;i<edges.length;i++)for(let key=Math.floor(edges[i].bounds.minY/edgeBinSize);key<=Math.floor(edges[i].bounds.maxY/edgeBinSize);key++)(edgeBins[key]??=[]).push(i);
 return {points:vertices,edges,edgeBinSize,edgeBins,bounds:{minX:Math.min(...vertices.map(p=>p.x)),maxX:Math.max(...vertices.map(p=>p.x)),minY:Math.min(...vertices.map(p=>p.y)),maxY:Math.max(...vertices.map(p=>p.y))}};
}
export function circlePolygonContact(ball,solid){
 const {x,y,r}=ball;if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(r)||r<=0)throw new Error('Invalid contact circle');
 const box=solid.bounds;if(x<box.minX-r||x>box.maxX+r||y<box.minY-r||y>box.maxY+r)return null;
 let inside=false,nearest=null;
 for(const index of solid.edgeBins[Math.floor(y/solid.edgeBinSize)]??[]){const {a,b}=solid.edges[index];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;}
 let indices;if(inside)indices=solid.edges.map((_,i)=>i);else{const nearby=new Set();for(let key=Math.floor((y-r)/solid.edgeBinSize);key<=Math.floor((y+r)/solid.edgeBinSize);key++)for(const i of solid.edgeBins[key]??[])nearby.add(i);indices=[...nearby].sort((a,b)=>a-b);}
 for(const i of indices){const e=solid.edges[i],{a,b,dx,dy,length}=e;
  if(!inside&&(x<e.bounds.minX-r||x>e.bounds.maxX+r||y<e.bounds.minY-r||y>e.bounds.maxY+r))continue;
  const t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(length*length))),px=a.x+t*dx,py=a.y+t*dy,distance=Math.hypot(x-px,y-py);
  if(!nearest||distance<nearest.distance)nearest={point:{x:px,y:py},distance,outward:e.outward};
 }
 if(!nearest||!inside&&nearest.distance>=r)return null;
 const {distance,point,outward}=nearest,normal=distance>1e-12?(inside?{x:(point.x-x)/distance,y:(point.y-y)/distance}:{x:(x-point.x)/distance,y:(y-point.y)/distance}):outward;
 return {inside,distance,point,normal,penetration:inside?distance+r:r-distance};
}
export function collideSolidPolygon(ball,collider){
 if(!Number.isFinite(collider.restitution)||collider.restitution<0||collider.restitution>1)throw new Error('Invalid polygon restitution');
 const contact=circlePolygonContact(ball,collider.solid);if(!contact)return 0;
 const {point,normal}=contact;if(collider.contactYRange&&(point.y<collider.contactYRange.min||point.y>collider.contactYRange.max))return 0;ball.x=point.x+normal.x*ball.r;ball.y=point.y+normal.y*ball.r;
 const v=ball.vx*normal.x+ball.vy*normal.y;if(v>=0)return 0;
 ball.vx-=(1+collider.restitution)*v*normal.x;ball.vy-=(1+collider.restitution)*v*normal.y;return -v;
}
