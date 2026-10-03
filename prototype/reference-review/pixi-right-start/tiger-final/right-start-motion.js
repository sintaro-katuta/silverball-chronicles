export const RIGHT_START_DROP=30;
// Independent preview: preserve the existing right-start endpoints and full-board launch.
export function attachRightStartMotion(flow){
 const {physics,game}=flow,update=physics.updateGate.bind(physics);
 const pocket=physics.pockets.find(p=>p.kind==='rush');
 const panel=p=>{const angle=p*Math.PI*.28,depth=Math.sin(angle),y=501+RIGHT_START_DROP-86*Math.cos(angle)+12*depth;return {hingeA:{x:305.5,y:501+RIGHT_START_DROP},hingeB:{x:353.5,y:501+RIGHT_START_DROP},freeA:{x:305.5-2*depth,y},freeB:{x:353.5+2*depth,y}};};
 const full=panel(1);pocket.captureTray={left:full.freeA.x,right:full.freeB.x,y:full.freeA.y,radius:physics.rightChucker.cover.r,role:'right-start-tray'};
 physics.rightStartReceipts=[];const hit=game.hit.bind(game);
 game.hit=(ball,kind,...args)=>{if(kind==='rush')physics.rightStartReceipts.push({id:ball.id,x:ball.x,y:ball.y,time:physics.time});hit(ball,kind,...args);};
 let start=0,from=0,target=0,duration=.55;
 const state=()=>{const t=Math.min(1,Math.max(0,(game.time-start)/duration));const progress=from+(target-from)*t*t*(3-2*t);return {progress,target,moving:Math.abs(progress-target)>1e-8};};
 physics.updateGate=function(g){const p=state().progress;g.electricChuckerOpen=p>=1-1e-8&&target===1;update(g);
  const mix=(a,b)=>a+(b-a)*p,c=this.rightChucker;c.progress=p;c.cover.active=p>=1-1e-8&&target===1;c.cover.role='right-start-tray';c.panel=panel(p);
  c.scoop.b={x:mix(346.313,377),y:mix(426,440)};
  c.cover.a={...c.panel.freeA};c.cover.b={...c.panel.freeB};
 };
 physics.updateGate(game);
 return {state,request(open){const next=open?1:0;if(next===target)return;from=state().progress;target=next;start=game.time;duration=Math.max(1e-8,.55*Math.abs(next-from));physics.updateGate(game);}};
}
