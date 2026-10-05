import {Container,Graphics,Sprite,Texture,Rectangle} from 'pixi.js';
import {storyPredictionPose,STORY_PRESENTATIONS,STORY_FAMILY_MAPPING} from './story-prediction-motion.js';
// Six unique authored shots per sheet: 3 columns × 2 rows. Sheet textures are
// borrowed. Frame textures are owned, and destroyed without destroying sources.
export function createStoryPredictionView({sheets={}}={}){
 const root=new Container(),mask=new Graphics().rect(0,0,210,140).fill(0xffffff);root.addChild(mask);root.mask=mask;
 const picture=new Container();root.addChild(picture);
 const previous=new Sprite(),current=new Sprite();picture.addChild(previous,current);
 const frames={},owned=[];
 for(const [kind,sheet]of Object.entries(sheets)){
  if(!Object.hasOwn(STORY_PRESENTATIONS,kind))continue;
  const cw=sheet.width/3,ch=sheet.height/2;
  frames[kind]=Array.from({length:6},(_,i)=>{const t=new Texture({source:sheet.source,frame:new Rectangle(i%3*cw,Math.floor(i/3)*ch,cw,ch)});owned.push(t);return t;});
 }
 const details=new Graphics(),particles=new Graphics(),safeShade=new Graphics().rect(75,3,60,27).fill({color:0x071223,alpha:.18});root.addChild(details,particles,safeShade);
 let disposed=false,lastPose=null;
 const hasFamily=family=>!!frames[STORY_FAMILY_MAPPING[family]??family];
 const fit=(sprite,texture,kind,frame)=>{sprite.texture=texture;const scale=Math.max(210/texture.width,140/texture.height);sprite.scale.set(scale);const topAligned=kind==='rescue'&&frame===4||kind==='episode'&&frame===2||kind==='step'&&frame===3;const bottomAligned=kind==='pursuit'&&frame===4;sprite.position.set((210-texture.width*scale)/2,topAligned?0:bottomAligned?140-texture.height*scale:(140-texture.height*scale)/2);};
 function update(input){
  if(disposed)throw new Error('Story prediction view destroyed');
  if(!hasFamily(input.family)||input.duration<1.2){root.visible=false;return lastPose={supported:false,visible:false,finished:false,result:null};}
  const p={...storyPredictionPose(input),supported:true};lastPose=p;root.visible=p.visible;root.alpha=p.alpha;
  if(!p.visible)return p;
  const shots=frames[p.kind];if(!shots)throw new RangeError(`Missing ${p.kind} story sheet`);
  fit(previous,shots[p.previousFrame],p.kind,p.previousFrame);fit(current,shots[p.frame],p.kind,p.frame);current.alpha=p.transition;previous.visible=p.transition<1;
  picture.x=-p.cameraX;picture.y=p.impact*.4;
  details.clear();particles.clear();safeShade.visible=!!input.upperAttention;
  if(p.kind==='pursuit'){
   if(p.event==='run'||p.event==='leap')for(let i=0;i<5;i++)details.moveTo(24,75+i*9).lineTo(55,75+i*9).stroke({width:.5,color:0x9dcce0,alpha:.15});
  }
  const falling=p.kind==='rescue'&&(p.event==='collapse'||p.event==='block');
  const dust=p.kind==='pursuit'&&(p.event==='landing'||p.event==='run')||p.kind==='episode'&&p.event==='brace';
  if(falling||dust)for(let i=0;i<p.particleCount;i++){
   const age=Math.max(0,p.cutAge),x=(falling?35+i*15:60+i*12)+Math.sin(i*2.4)*age*8;
   const y=falling?27+(i*13+age*64)%98:113-Math.sin(i*1.7)*age*10;
   const alpha=falling?.3:Math.max(0,.3-age*.35);
   particles.rect(x,y,i%3?1:2,1).fill({color:falling?0x97b2c8:0xc5ba99,alpha});
  }
  return p;
 }
 function destroy(){if(disposed)return;disposed=true;root.destroy({children:true});owned.forEach(t=>t.destroy(false));}
 return {root,frames:owned,textures:[],available:Object.freeze(Object.keys(frames)),hasFamily,update,render:update,destroy,pose:()=>lastPose};
}
