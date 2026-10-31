// Three visible metal guard sections. Keep the two authored spill gaps open.
export function installPixelRoadGuards(physics){
 for(const [index,ids] of [[1,10],[11,22],[23,26]].entries()){
  const pins=physics.pins.filter(p=>p.id>=ids[0]&&p.id<=ids[1]),first=pins[0],last=pins.at(-1),dx=last.x-first.x,dy=last.y-first.y,length=Math.hypot(dx,dy),normal={x:dy/length,y:-dx/length};
  const offset=Math.max(...pins.map(p=>(p.x-first.x)*normal.x+(p.y-first.y)*normal.y+p.r))+1;
  const move=p=>({x:p.x+normal.x*offset,y:p.y+normal.y*offset});
  physics.colliders.push({a:move(first),b:move(last),r:.35,restitution:.08,material:'metal',role:`pixel-road-guard-${index}`,pixelGuard:true,guardNormal:normal,guardDepth:4,pinIds:pins.map(p=>p.id)});
 }
}
