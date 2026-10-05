import {Container,Graphics} from 'pixi.js';
import {createHoldMotion} from './hold-motion.js';
import {LCD_REEL_LAYOUT} from './lcd-safe-layout.js';
import {queuedHoldPrediction} from './hold-prediction.js';
export function createHoldView(){
 const root=new Container(),motion=createHoldMotion(),orbs=new Map(),slots=[];
 root.x=LCD_REEL_LAYOUT.holdOffsetX;
 root.addChild(new Graphics().rect(36,124,119,14).fill({color:0x071225,alpha:.9}).rect(38,137,115,1).fill(0x72583e));
 for(const x of [45,69,87,105,123,141]){
  const g=new Graphics().rect(-5,3,10,2).fill(0x8e764e).rect(-4,3,8,1).fill(0xcbb682).rect(-4,-3,8,6).fill(0x152a40);
  g.position.set(x,130);root.addChild(g);slots.push(g);
 }
 root.addChild(new Graphics().rect(56,127,1,7).fill(0x67563f));
 return {root,render(game){
  const capacity=game.isWMachine?(game.rush?(game.policy.fuzuHoldLimit??0):4):5;
  slots.forEach((slot,i)=>{slot.visible=i===0||i<=capacity;});
  const states=motion.update(game.time,game.rush?'rush':'normal',game.acceptedDraws.map(d=>d.id),game.activeDraw?.id??game.presentation?.drawId??null);
  const ids=new Set(states.map(s=>s.id));
  for(const [id,g]of orbs)if(!ids.has(id)){g.root.destroy({children:true});orbs.delete(id);}
  for(const s of states){let g=orbs.get(s.id);if(!g){
   const orb=new Graphics().rect(-2,-4,4,1).fill(0xa3d5e5).rect(-3,-3,6,6).fill(0x3770a5)
    .rect(-4,-2,1,4).fill(0x6cb4d7).rect(3,-2,1,4).fill(0x163453)
    .rect(-2,3,4,1).fill(0x12263d).rect(-2,-3,3,2).fill(0xe0f5f5)
    .rect(-3,-1,2,3).fill(0x9edbe7).rect(0,1,3,2).fill(0x21436b);
   // The corner brackets identify the draw in progress without relying on colour.
   const activeMark=new Graphics().moveTo(-6,-2).lineTo(-6,-6).lineTo(-2,-6)
    .moveTo(2,-6).lineTo(6,-6).lineTo(6,-2).stroke({color:0xf7e6ad,width:1,pixelLine:true});
   const omen=new Graphics();
   const token=new Container();token.addChild(orb,omen,activeMark);
   g={root:token,orb,omen,activeMark};root.addChild(token);orbs.set(s.id,g);
  }g.root.position.set(Math.round(s.x),Math.round(s.y));g.orb.tint=s.active?0xffffff:0xc7e2ff;g.activeMark.visible=s.active;
   const cue=s.active?(game.presentation?.predictionPlan??game.spinResult?.predictionPlan)?.holdCue??'none':queuedHoldPrediction(game.acceptedDraws.find(d=>d.id===s.id),game);
   if(g.cue!==cue){g.cue=cue;g.omen.clear();
    if(cue!=='none'){
     const color=cue==='gold'?0xffd681:cue==='red'?0xff7384:0xafe9ff;
     g.omen.circle(0,0,5).stroke({color,width:1});
     if(cue==='red')g.omen.poly([0,-7,2,-5,0,-3,-2,-5]).fill(color);
     if(cue==='gold')g.omen.circle(0,0,7).stroke({color,width:.7}).rect(-1,-8,2,2).fill(color);
    }
   }
   g.omen.alpha=game.reducedEffects?.9:.7+.25*Math.sin(game.time*2+s.id)**2;
  }
 }};
}
