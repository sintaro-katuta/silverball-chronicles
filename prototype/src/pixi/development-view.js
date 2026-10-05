import {createLongReachView} from './long-reach-view.js';
import {Container,Graphics,Sprite,Texture} from 'pixi.js';
import {pixelSurface} from './pixel-primitives.js';
import {developmentPose} from './win-sequence.js';

// Light and sword trails accompany the adopted live character art underneath.
// Neither the art nor the preselected moon cue is replaced by this presentation.
export function createDevelopmentView(atlas=null,landscape=null,motionAtlas=null){
 const root=new Container(),textures=[];
 const shade=new Graphics().rect(0,0,210,140).fill({color:0x05132b,alpha:.42});root.addChild(shade);
 const beams=[];
 for(let i=0;i<12;i++){
  const beam=new Graphics().rect(-12,-1,24,2).fill(i%3===0?0xf2ead0:0x83c9e6);
  root.addChild(beam);beams.push(beam);
 }
 const swordLight=new Graphics().poly([0,0,5,-2,72,-88,69,-88]).fill(0xc8ecf5).poly([0,0,2,-1,68,-85,67,-84]).fill(0xffffff);swordLight.position.set(78,119);root.addChild(swordLight);
 const slash=new Graphics().poly([-12,129,220,-3,220,3,-12,136]).fill(0xa8d9ed).poly([-12,132,220,0,220,2,-12,134]).fill(0xffffff);root.addChild(slash);
 const labels={};
 for(const [key,text] of Object.entries({entry:'月光が集う',gather:'剣に宿る光',slash:'月影の一閃'})){
  const texture=Texture.from(pixelSurface(210,30,c=>{c.font='19px "DotGothic16"';c.textAlign='center';c.textBaseline='middle';c.lineJoin='miter';c.lineWidth=4;c.strokeStyle='#071225';c.strokeText(text,105,15);c.fillStyle='#e7f4fa';c.fillText(text,105,15);}));texture.source.scaleMode='nearest';textures.push(texture);const s=new Sprite(texture);s.y=3;root.addChild(s);labels[key]=s;
 }
 const long=atlas&&landscape?createLongReachView(atlas,landscape,{motionAtlas}):null;if(long){root.addChild(long.root);textures.push(...long.textures);}
 root.visible=false;
 return {root,textures,frames:long?.frames??[],render(presentation,fromRush,options={}){
  if(presentation?.longReach&&long){root.visible=true;root.alpha=1;for(const child of root.children)child.visible=child===long.root;return long.render(presentation.time,{...options,variant:presentation.reachVariant,ending:presentation.reachEnding,win:presentation.win,upperCueActive:!presentation.displayRoute||!!presentation.moonCue});}
  for(const child of root.children)child.visible=child!==long?.root;
  const pose=developmentPose(presentation,fromRush),t=presentation?.time??0;root.visible=pose.visible;root.alpha=pose.alpha;
  if(!pose.visible)return pose;
  Object.entries(labels).forEach(([key,s])=>{s.visible=key===pose.stage;});
  beams.forEach((beam,i)=>{
   const a=i*Math.PI/6,travel=((t*1.5+i/12)%1),r=78*(1-travel),x=105+Math.cos(a)*r,y=76+Math.sin(a)*r*.6;
   beam.position.set(Math.round(x),Math.round(y));beam.rotation=a;beam.alpha=pose.stage==='slash'?0:.25+.55*travel;beam.scale.x=.4+.6*(1-travel);
  });
  swordLight.visible=pose.stage!=='entry';swordLight.alpha=pose.stage==='gather'?Math.min(1,(t-1)/.55):Math.max(0,1-pose.slash*3);
  slash.visible=pose.stage==='slash';slash.alpha=Math.max(0,1-pose.slash);slash.x=Math.round(-34+pose.slash*68);
  return pose;
 }};
}
