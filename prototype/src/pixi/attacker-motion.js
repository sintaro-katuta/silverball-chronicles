import {panelPose} from './attacker-panel.js';
// Preview-only receiving panel with a fixed lower hinge. The production Physics defaults are unchanged.
export function attachAttackerMotion(flow){
 const {physics,game}=flow,update=physics.updateGate.bind(physics);
 const pocket=physics.pockets.find(p=>p.kind==='bonus');
 // Widen the left side of this preview's falling channel; render uses these same colliders.
 const inner=physics.colliders.find(c=>c.role==='right-inner-lower');
 inner.a.x=327.486;inner.b.x=330;
 const outer=physics.colliders.find(c=>c.role==='right-outer');
 // Panel centre is pocket.x - 2.75. Centre it between the channel exits.
 pocket.x=(inner.b.x+outer.b.x)/2+2.75;pocket.y=581;
 const full=panelPose(pocket,1);
 pocket.captureTray={left:full.freeA.x,right:full.freeB.x,y:full.freeA.y,radius:physics.gate.r};
 physics.attackerReceipts=[];
 const hit=game.hit.bind(game);game.hit=(ball,kind,...args)=>{if(kind==='bonus')physics.attackerReceipts.push({id:ball.id,x:ball.x,y:ball.y,time:physics.time,contact:ball.lastContact});hit(ball,kind,...args);};
 let from=0,target=0,started=game.time,duration=.65;
 const value=()=>{const t=Math.min(1,Math.max(0,(game.time-started)/duration)),e=t*t*(3-2*t);return from+(target-from)*e;};
 const state=()=>{const progress=value();return {progress,target,moving:Math.abs(progress-target)>1e-8};};
 physics.updateGate=function(g){
  const p=value();g.jackpot=p>=1-1e-8&&target===1?{gap:0,count:0,displayRounds:4}:null;
  update(g);
  this.gate.panel=panelPose(pocket,p);
  this.gate.a={...this.gate.panel.freeA};this.gate.b={...this.gate.panel.freeB};
  this.gate.active=p>=1-1e-8&&target===1;

 };
 physics.updateGate(game);
 return {state,request(open){const next=open?1:0;if(next===target)return;from=value();target=next;started=game.time;duration=Math.max(1e-8,(open?.65:.5)*Math.abs(target-from));physics.updateGate(game);}};
}
