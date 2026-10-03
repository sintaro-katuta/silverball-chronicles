// Code-authored resin rib and recessed mounting ears. Both views share the same art.
export function paintResinGuide(d,a,b,{mountSide,depth=0}={}){
 const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
 // Mounts sit below the running edge, on the board-facing side of the guide.
 const side=mountSide??(ny>=0?1:-1),ux=nx*side,uy=ny*side,tx=dx/len,ty=dy/len;
 if(depth){
  const at=(p,v)=>[p.x+ux*v,p.y+uy*v];
  d.poly([at(a,-4),at(b,-4),at(b,depth+4),at(a,depth+4)],'#0c1926');
  d.poly([at(a,-4),at(b,-4),at(b,depth),at(a,depth)],'#294b60');
  d.poly([at(a,3),at(b,3),at(b,depth-3),at(a,depth-3)],'#416d7f');
  d.line(...at(a,depth),...at(b,depth),'#142a3d',3);
 }
 for(const t of [.08,.92]){
  const x=a.x+dx*t,y=a.y+dy*t;
  const at=(u,v)=>[x+tx*u+ux*v,y+ty*u+uy*v];
  d.poly([at(-10,3),at(10,3),at(10,20),at(6,25),at(-6,25),at(-10,20)],'#1b3345');
  d.poly([at(-8,4),at(8,4),at(8,19),at(5,22),at(-5,22),at(-8,19)],'#41677d');
  const edge0=at(-8,5),edge1=at(-8,18);d.line(...edge0,...edge1,'#91bcc9',2);
  const [sx,sy]=at(0,15),cx=Math.round(sx),cy=Math.round(sy);
  d.diamond(cx,cy,7,'#101d2d');d.rect(cx-4,cy-5,9,11,'#829bac');d.rect(cx-5,cy-3,11,7,'#829bac');
  d.rect(cx-3,cy-4,6,3,'#dae8ec');d.rect(cx-3,cy+4,6,2,'#426077');
  d.rect(cx-3,cy-1,7,2,'#273b4d');d.rect(cx-1,cy-3,2,6,'#273b4d');
 }
 d.poly([[a.x-4*nx,a.y-4*ny],[b.x-4*nx,b.y-4*ny],[b.x+4*nx,b.y+4*ny+7],[a.x+4*nx,a.y+4*ny+7]],'rgba(93,157,179,.22)');
 d.line(a.x,a.y,b.x,b.y,'rgba(143,209,226,.25)',8);
 d.line(a.x-4*nx,a.y-4*ny,b.x-4*nx,b.y-4*ny,'#a9d4de',2);
 d.line(a.x+4*nx,a.y+4*ny,b.x+4*nx,b.y+4*ny,'#41677d',2);
 d.line(a.x+2*nx,a.y+2*ny,b.x+2*nx,b.y+2*ny,'#789aaa');
}
