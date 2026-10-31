import {Container,Sprite,Texture} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
import {sourcePoint} from './source-layout.js';
import {sourceAttackerPose,sourceElectricPose} from './source-right-actuators.js';

// Same two-pixels-per-board-unit placement contract as existing component views.
export class SourceActuatorView{
 constructor(physics,kind){
  this.physics=physics;this.kind=kind;const[x,y]=sourcePoint(kind==='attacker'?[650,630]:[510,790]);
  this.origin={x,y};this.root=new Container();this.rails=new Container();
  this.canvas=pixelSurface(256,320,()=>{});const texture=Texture.from(this.canvas);texture.source.scaleMode='nearest';
  this.textures=[texture];this.sprite=new Sprite(texture);this.root.addChild(this.sprite,this.rails);this.previous=null;this.render();
 }
 render(){
  const progress=this.kind==='attacker'?(this.physics.gate.panel?.progress??0):(this.physics.rightChucker.progress??0);
  if(progress===this.previous)return;this.previous=progress;
  const c=this.canvas.getContext('2d');c.clearRect(0,0,256,320);const d=painter(c);
  const pt=p=>[Math.round((p.x-this.origin.x)*2),Math.round((p.y-this.origin.y)*2)];
  const src=p=>{const[x,y]=sourcePoint(p);return pt({x,y});},poly=(ps,col)=>d.poly(ps.map(src),col);
  if(this.kind==='attacker'){
   // No receiving cavity behind the upper diverter: render only its solid blade.
   // The separate fixed receiver is below, at the user specified 15 location.
   const receiver=this.physics.pockets.find(p=>p.kind==='bonus'),R=pt(receiver),half=Math.round(receiver.w);
   d.rect(R[0]-half,R[1]-2,half*2,5,'#020711');
   d.line(R[0]-half,R[1]+3,R[0]+half,R[1]+3,'#a9c2d3',1);
   c.fillStyle='#dfc879';c.font='bold 10px monospace';c.textAlign='center';c.fillText('15',R[0],R[1]+14);
   const pose=sourceAttackerPose(progress),a=pose.tip,b=pose.hinge,dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy),n={x:dy/l*8,y:-dx/l*8};
   const quad=[a,{x:a.x+n.x,y:a.y+n.y},{x:b.x+n.x*.65,y:b.y+n.y*.65},b];
   d.poly(quad.map(pt),'#7893a3');
   const inset=quad.map((p,i)=>({x:p.x+(i<2?0:.3),y:p.y}));d.poly(inset.map(pt),'#28445c');
   const A=pt(a),B=pt(b),C=pt(quad[1]),D=pt(quad[2]);
   d.line(...A,...B,'#c8ae65',2);d.line(...C,...D,'#8298aa',2);
   const mid=pt({x:(a.x+b.x)/2+n.x*.4,y:(a.y+b.y)/2+n.y*.4});d.diamond(...mid,4,'#76b9d1');
   const H=pt(b);d.rect(H[0]-3,H[1]-3,7,6,'#c8ae65');d.rect(H[0]-1,H[1]-1,3,2,'#122539');
  }else{
   poly([[559,898],[582,898],[582,906],[559,906]],'#020711');
   poly([[590,897],[632,897],[632,905],[590,905]],'#020711');
   poly([[553,843],[607,833],[612,837],[611,863],[553,867]],'#243d52');
   poly([[558,848],[604,848],[604,860],[558,860]],'#020711');
   const pose=sourceElectricPose(progress),A=pt(pose.a),B=pt(pose.b),width=Math.max(1,Math.round(7*(1-progress)));
   d.line(...A,...B,progress===1?'#1b2f43':'#8fa6b5',width);
   if(progress===1)d.line(...pt(pose.feedA),...pt(pose.feedB),'#bcd1d6',2);
   d.line(...src([558,861]),...src([604,861]),'#6e8999',1);
  }
  this.sprite.texture.source.update();
 }
 diagnostics(){return{sourceProfile:true,kind:this.kind,pose:this.kind==='attacker'?sourceAttackerPose(this.previous):sourceElectricPose(this.previous)};}
 dispose(){this.root.destroy({children:true});for(const texture of this.textures)texture.destroy(true);}
}
