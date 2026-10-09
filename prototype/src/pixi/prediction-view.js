import {presentationSurface,smoothTexture} from './presentation-quality.js';
import {Container,Graphics,Sprite,Texture} from 'pixi.js';
import {predictionPose,PREDICTION_LABELS} from './prediction-plan.js';
import {createStoryPredictionView} from './story-prediction-view.js';
import {storyPredictionWindow} from './story-prediction-window.js';

const colors={blue:0xa6dfff,red:0xff7983,gold:0xffdc83,none:0xd5eaff};
const out=u=>1-(1-Math.max(0,Math.min(1,u)))**3;
// Prediction layers accompany live reels and authored battle cuts. Text is
// cached per label; no texture allocation, random call or game write per frame.
export function createPredictionView({character=null,landscape=null,storySheets=null}={}){
 const root=new Container(),textures=[],labels=new Map();root.label='prediction';
 const scene=new Container();root.addChild(scene);
 if(landscape){const s=new Sprite(landscape);s.width=210;s.height=140;scene.addChild(s);}
 const darkness=new Graphics().rect(0,0,210,140).fill({color:0x020b20,alpha:.55});scene.addChild(darkness);
 let portrait=null;
 if(character){
  const resource=character.source.resource;
  const texture=Texture.from(presentationSurface(210,140,c=>c.drawImage(resource,0,0,resource.width,resource.height,0,0,210,140)));
  smoothTexture(texture);textures.push(texture);portrait=new Sprite(texture);portrait.width=210;portrait.height=140;scene.addChild(portrait);
 }
 const veil=new Graphics().rect(0,96,210,44).fill({color:0x020817,alpha:.76});scene.addChild(veil);
 const story=storySheets?createStoryPredictionView({sheets:storySheets}):null;
 if(story)root.addChild(story.root);
 const symbols=new Graphics(),lines=new Graphics();root.addChild(symbols,lines);
 const caption=new Container();root.addChild(caption);
 const captionShade=new Graphics().rect(20,96,170,26).fill({color:0x040a19,alpha:.8});caption.addChild(captionShade);
 const textLayer=new Container();caption.addChild(textLayer);
 const edge=new Graphics();root.addChild(edge);
 function label(text){
  if(labels.has(text))return labels.get(text);
  const t=Texture.from(presentationSurface(180,32,c=>{
   c.textAlign='center';c.textBaseline='middle';let size=22;
   do{c.font=`${size}px "DotGothic16"`;if(c.measureText(text).width<=156)break;size--;}while(size>12);
   c.lineJoin='round';c.lineWidth=4;c.strokeStyle='#041027';c.strokeText(text,90,16);c.fillStyle='#ffffff';c.fillText(text,90,16);
  }));smoothTexture(t);textures.push(t);const s=new Sprite(t);s.width=180;s.height=32;s.position.set(15,94);s.visible=false;textLayer.addChild(s);labels.set(text,s);return s;
 }
 // Owned textures are exposed separately; board-runtime captures its texture
 // list at construction. Dynamically cached labels are released by dispose.
 for(const text of PREDICTION_LABELS)label(text);
 const initialTextures=[...textures];
 return {root,textures:initialTextures,render(game){
  const reach=game.presentation?.basicReach?game.presentation:null;
  const prediction=reach?.predictionPlan??(game.spinActive?game.spinResult?.predictionPlan:null);
  const phase=reach?'reach':'spin',age=reach?.time??game.drawTimer;
  const p=prediction?predictionPose(prediction,age,{phase}):{visible:false};
  root.visible=p.visible&&!game.jackpot&&game.previewWinAt===undefined;
  if(!root.visible)return p;
  const reduced=!!game.reducedEffects,color=colors[p.tier]??colors.blue;
  const precursor=p.stage==='precursor'||p.stage==='development',chance=p.stage==='chanceUp';
  const family=p.family??'';
  const storyWindow=story?storyPredictionWindow(prediction,age,{phase,available:Object.keys(storySheets)}):null;
  if(story){story.root.visible=!!storyWindow;if(storyWindow)story.update({...storyWindow,reducedEffects:reduced});}
  scene.visible=precursor&&!storyWindow;
  if(portrait){portrait.visible=precursor;portrait.width=210+(reduced?0:5*out(p.progress));portrait.height=140+(reduced?0:3*out(p.progress));portrait.x=precursor&&family==='long'?-4*out(p.progress):0;portrait.alpha=family==='long'?.7:1;}
  const alpha=Math.max(0,Math.min(1,p.progress*8,(1-p.progress)*9));
  // The title has its own entrance/exit; it must not fade the story halfway
  // through when precursor changes to development on the same film timeline.
  root.alpha=storyWindow?1:alpha;caption.alpha=storyWindow?alpha:1;
  symbols.alpha=lines.alpha=edge.alpha=storyWindow?alpha:1;
  for(const s of labels.values())s.visible=false;
  const text=label(p.text);text.visible=true;text.tint=color;
  caption.position.set(0,chance?-8:0);captionShade.alpha=chance?.65:.9;
  text.x=15+(reduced?0:Math.round(5*(1-out(p.progress*6))));
  symbols.clear();lines.clear();edge.clear();
  symbols.y=phase==='spin'&&prediction.mode==='rush'?18:0;lines.y=symbols.y;
  if(precursor&&!storyWindow){
   const moonX=family==='long'?155:172,moonY=35;
   symbols.circle(moonX,moonY,17).fill({color,alpha:.22}).circle(moonX,moonY,12).stroke({color,width:1,alpha:.8});
   // A broken seal gathers, then opens towards the authored battle. This is
   // development, never a winning seal or an extra gameplay lottery.
   for(let i=0;i<6;i++){const a=i*Math.PI/3,r=20+8*(1-out(p.progress));symbols.moveTo(moonX+Math.cos(a)*r,moonY+Math.sin(a)*r).lineTo(moonX+Math.cos(a)*(r+4),moonY+Math.sin(a)*(r+4)).stroke({color,width:1});}
  }else if(!chance&&!storyWindow){
   if(family==='serial'||family==='story'||family==='step'){
    const n=Math.min(3,1+(p.step??Math.floor(p.progress*3)));
    for(let i=0;i<n;i++){const x=29+i*75;symbols.circle(x,23,8).stroke({color,width:1.2}).poly([x-2,16,x+2,23,x-2,30]).stroke({color,width:1});}
   }else if(family==='roulette'||family==='search'){
    for(let i=0;i<3;i++){const x=45+i*60,chosen=i===Math.min(2,Math.floor(p.progress*3));symbols.poly([x,13,x+10,23,x,33,x-10,23]).stroke({color,width:chosen?2:1,alpha:chosen?1:.25});}
   }else if(family==='eye'||family==='awakening'){
    symbols.moveTo(67,27).quadraticCurveTo(105,3,143,27).quadraticCurveTo(105,47,67,27).stroke({color,width:1.2}).circle(105,26,5+3*out(p.progress)).fill({color,alpha:.8});
   }else if(family==='trail'||family==='pursuit'){
    for(let i=0;i<5;i++){const x=35+i*29+8*out(p.progress);symbols.moveTo(x-7,14+i%2*8).lineTo(x+8,21+i%2*8).lineTo(x-7,28+i%2*8).stroke({color,width:1,alpha:.35+i*.12});}
   }else if(family==='approach'){
    for(let i=0;i<3;i++){const r=12+i*9*(1-p.progress);symbols.ellipse(105,25,r,r*.55).stroke({color,width:1,alpha:1-i*.23});}
   }else if(family==='alert'){
    const x=26+158*out(p.progress);symbols.moveTo(24,24).lineTo(186,24).stroke({color,width:1,alpha:.4}).rect(x-2,12,4,24).fill({color,alpha:.8});
   }else if(family==='resolve'){
    symbols.poly([96,40,104,12,108,8,110,15,104,40]).fill({color,alpha:.8}).moveTo(90,34).lineTo(116,38).stroke({color,width:2});
   }else if(family==='crest'||family==='identity'){
    symbols.poly([105,7,125,25,105,43,85,25]).stroke({color,width:1.2}).moveTo(89,25).lineTo(121,25).moveTo(105,11).lineTo(105,39).stroke({color,width:1});
   }else if(family==='moon'){
    symbols.circle(105,25,17).fill({color,alpha:.8}).circle(113,20,14).cut();
   }else{
    const radius=12+12*out(p.progress);symbols.circle(105,25,radius).stroke({color,width:1,alpha:.7});
   }
  }
  if(!reduced&&!chance&&!storyWindow)for(let i=0;i<8;i++){const x=(i*31+age*28)%210,y=precursor?30+i*8:8+i*4;lines.moveTo(x,y).lineTo(x+5,y-2).stroke({color,width:.7,alpha:.3});}
  if(chance||p.tier==='red'||p.tier==='gold')edge.moveTo(14,15).lineTo(14,117).lineTo(31,117).moveTo(196,15).lineTo(196,117).lineTo(179,117).stroke({color,width:chance?1:1.5,alpha:.6});
  return p;
 },dispose(){story?.destroy();for(const t of textures)if(!initialTextures.includes(t))t.destroy(true);labels.clear();}};
}
