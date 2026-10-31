import {prepareSolidPolygon} from './solid-polygon-contact.js';
// Split the existing filled outline at proper crossings, without moving any
// edge. Intended for the three non-overlapping lobes of the electric moulding,
// whose Canvas nonzero fill already paints these same regions.
export function solidOutlineParts(points){
 function split(ps,depth=0){
  if(depth>16)throw Error('Too many outline crossings');
  for(let i=0;i<ps.length;i++)for(let j=i+2;j<ps.length;j++){
   if(i===0&&j===ps.length-1)continue;
   const a=ps[i],b=ps[(i+1)%ps.length],c=ps[j],d=ps[(j+1)%ps.length],ux=b.x-a.x,uy=b.y-a.y,vx=d.x-c.x,vy=d.y-c.y,wx=c.x-a.x,wy=c.y-a.y,den=ux*vy-uy*vx;
   if(Math.abs(den)<1e-14)continue;
   const t=(wx*vy-wy*vx)/den,s=(wx*uy-wy*ux)/den;
   if(t>1e-10&&t<1-1e-10&&s>1e-10&&s<1-1e-10){
    const q={x:a.x+t*ux,y:a.y+t*uy};
    return [...split([q,...ps.slice(i+1,j+1)],depth+1),...split([q,...ps.slice(j+1),...ps.slice(0,i+1)],depth+1)];
   }
  }
  return [prepareSolidPolygon(ps)];
 }
 return split(points);
}
