// A formed receiving apron joins the LCD trim to the start mouth. The same
// closed perimeter supplies the artwork and capsule contacts; gravity alone feeds it.
export function hesoTrayShapes(mouth){
 return [-1,1].map(side=>[
  {x:mouth.x+side*(mouth.w/2+28),y:mouth.y-23},
  {x:mouth.x+side*(mouth.w/2+1),y:mouth.y-1},
  {x:mouth.x+side*(mouth.w/2+1),y:mouth.y+5},
  {x:mouth.x+side*(mouth.w/2+32),y:mouth.y-17}
 ]);
}
export function installHesoGuides(physics){
 const mouth=physics.pockets.find(p=>p.kind==='start');
 if(!mouth)return;
 for(const shape of hesoTrayShapes(mouth))for(let i=0;i<shape.length;i++)physics.colliders.push({
  a:shape[i],b:shape[(i+1)%shape.length],
  r:.6,material:'resin',role:'heso-guide',restitution:.12
 });
}
