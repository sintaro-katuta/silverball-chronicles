// Preview-only twin-wing tulip. The receiver sits inside the right lane.
export function attachRightStartMotion(flow){
 const {physics,game}=flow,update=physics.updateGate.bind(physics);
 const guide=physics.colliders.find(c=>c.role==='right-inner-lower');guide.a.x=336;guide.b.x=338;
 const pocket=physics.pockets.find(p=>p.kind==='rush');Object.assign(pocket,{x:359.5,y:493,w:20});delete pocket.captureTray;
 physics.rightStartReceipts=[];const hit=game.hit.bind(game);
 game.hit=(ball,kind,...args)=>{if(kind==='rush')physics.rightStartReceipts.push({id:ball.id,x:ball.x,y:ball.y,time:physics.time});hit(ball,kind,...args);};
 let start=0,from=0,target=0,duration=.4;
 const state=()=>{const t=Math.min(1,Math.max(0,(game.time-start)/duration)),progress=from+(target-from)*t*t*(3-2*t);return {progress,target,moving:Math.abs(progress-target)>1e-8};};
 physics.updateGate=function(g){const p=state().progress;g.electricChuckerOpen=p>=1-1e-8&&target===1;update(g);
  for(const wall of this.colliders)if(wall.denchuShelf)wall.active=p>=1-1e-8&&target===1;
  const c=this.rightChucker,angle=(-Math.asin(6.5/18)+(Math.asin(7/18)+Math.asin(6.5/18))*p),dx=18*Math.sin(angle)*(pocket.geometryScale??1),dy=18*Math.cos(angle)*(pocket.geometryScale??1);
  const left=pocket.x-6.5*(pocket.geometryScale??1),right=pocket.x+6.5*(pocket.geometryScale??1),hingeY=pocket.y-3;
  c.progress=p;c.scoop.a={x:left,y:hingeY};c.scoop.b={x:left-dx,y:hingeY-dy};c.cover.a={x:right,y:hingeY};c.cover.b={x:right+dx,y:hingeY-dy};
  c.scoop.active=true;c.cover.active=true;c.scoop.role='denchu-left-wing';c.cover.role='denchu-right-wing';
  if(pocket.referenceSlot){c.scoop.a={x:pocket.x-9.5,y:pocket.y+.5};c.scoop.b={x:pocket.x+13,y:pocket.y-1};c.scoop.active=p<1-1e-8;c.cover.active=false;}
 };
 physics.updateGate(game);
 return {state,request(open){const next=open?1:0;if(next===target)return;from=state().progress;target=next;start=game.time;duration=Math.max(1e-8,.4*Math.abs(next-from));physics.updateGate(game);}};
}
