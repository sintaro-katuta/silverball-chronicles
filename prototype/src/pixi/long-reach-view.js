import {Container,Graphics,Sprite,Texture,Rectangle,MeshPlane} from 'pixi.js';
import {pixelSurface} from './pixel-primitives.js';
import {longReachPose,REACH_LABELS,actorFrameLayout} from './long-reach-timeline.js';
// Wind follows the trailing cloth, with head/face and the right sword arm fixed.
export function clothVertex(x,y,t,wind=1){
 // Restrict wind to trailing hair/upper cloth. Planted boots stay registered.
 const weight=Math.max(0,1-x/240)*Math.max(0,Math.min(1,(y-130)/100))*Math.max(0,Math.min(1,(360-y)/70));
 return {x:x+Math.sin(t*2.2-y*.012)*5*weight*wind,y:y+Math.sin(t*1.6-y*.014)*2*weight*wind};
}
export function createLongReachView(atlas,landscape,{motionAtlas=null}={}){
 const root=new Container(),world=new Container(),textures=[],frames=[];root.addChild(world);
 const back=new Sprite(landscape);back.anchor.set(.5);back.width=238;back.height=159;world.addChild(back);
 const cellW=atlas.width/3,cellH=atlas.height/2;
 for(let i=0;i<6;i++)frames.push(new Texture({source:atlas.source,frame:new Rectangle(i%3*cellW,Math.floor(i/3)*cellH,cellW,cellH)}));
 if(motionAtlas){
  if(motionAtlas.width!==atlas.width||motionAtlas.height!==atlas.height)throw new Error('Motion atlas must use the same 3x2 cells');
  for(let i=0;i<6;i++)frames.push(new Texture({source:motionAtlas.source,frame:new Rectangle(i%3*cellW,Math.floor(i/3)*cellH,cellW,cellH)}));
 }
 const createActor=()=>{const group=new Container(),layers=Array.from({length:2},()=>{const mesh=new MeshPlane({texture:frames[0],verticesX:9,verticesY:9});group.addChild(mesh);return mesh;});world.addChild(group);return {group,layers};};
 const speedLines=Array.from({length:6},(_,i)=>{const g=new Graphics().rect(-70,0,100+i*9,.35).fill(0x7b9cbf);world.addChild(g);return g;});
 const hero=createActor(),enemy=createActor();
 const charge=new Graphics().circle(0,0,17).fill({color:0x79bef7,alpha:.08}).circle(0,0,10).fill({color:0x96d5fa,alpha:.12}).circle(0,0,3).fill({color:0xd7f4ff,alpha:.4}).circle(0,0,14).stroke({color:0x9adff1,width:.5});world.addChild(charge);
 const arc=[];for(let i=0;i<=24;i++){const u=i/24;arc.push(-24+48*u,4-12*Math.sin(Math.PI*u));}for(let i=24;i>=0;i--){const u=i/24;arc.push(-24+48*u,4-9*Math.sin(Math.PI*u));}
 const blade=new Graphics().poly(arc).fill(0xc6e9ff);world.addChild(blade);
 const impact=new Graphics().circle(0,0,3).fill(0xf4e8b7).circle(0,0,7).stroke({color:0xa9dcf5,width:.7});world.addChild(impact);
 const sparks=Array.from({length:12},(_,i)=>{const g=new Graphics().poly([-1,0,0,-.65,2,0,0,.65]).fill(i%3===0?0xf2daa1:0xc6e9ff);world.addChild(g);return g;});
 const motes=[];for(let i=0;i<32;i++){const g=new Graphics().circle(0,0,i%4===0?.7:.35).fill(i%4===0?0xe9e3c3:0x79b5d8);world.addChild(g);motes.push(g);}
 const dim=new Graphics().rect(0,0,210,140).fill(0x020714);root.addChild(dim);
 const titles={};for(const label of REACH_LABELS){
  const t=Texture.from(pixelSurface(210,26,c=>{c.textAlign='center';c.textBaseline='middle';c.font=(label==='上に注目'?'20':'15')+'px "DotGothic16"';c.lineWidth=4;c.strokeStyle='#061020';c.strokeText(label,105,13);c.fillStyle='#e4edf5';c.fillText(label,105,13);}));t.source.scaleMode='nearest';textures.push(t);const sprite=new Sprite(t);root.addChild(sprite);titles[label]=sprite;
 }
 const arrow=new Graphics().poly([0,-8,-7,0,-2,0,-2,8,2,8,2,0,7,0]).fill(0xe4d39e);arrow.position.set(105,43);root.addChild(arrow);
 root.visible=false;
 const updateActor=(actor,p,t,wind)=>{
  actor.group.position.set(p.x,p.y);actor.group.rotation=p.rotation;actor.group.alpha=p.alpha;
  const blend=p.frameBlend??1,indices=[p.blendFrame??p.frame,p.frame];
  actor.layers.forEach((mesh,layer)=>{
   const frame=indices[layer],layout=actorFrameLayout(frame);mesh.texture=frames[frame];mesh.pivot.set(cellW*layout.pivotX,cellH*layout.pivotY);mesh.scale.set(100/cellW*p.scale*layout.scale);
   mesh.alpha=layer===0?1-blend:blend;mesh.visible=mesh.alpha>0;
   if(!mesh.visible)return;
   const data=mesh.geometry.getBuffer('aPosition').data;
   for(let row=0;row<9;row++)for(let col=0;col<9;col++){const v=clothVertex(col/8*cellW,row/8*cellH,t,wind),i=(row*9+col)*2;data[i]=v.x;data[i+1]=v.y;}
   mesh.geometry.getBuffer('aPosition').update();
  });
 };
 return {root,textures,frames,render(t,options={}){
  const p=longReachPose(t,{...options,motionFrames:!!motionAtlas});root.visible=p.visible;if(!p.visible)return p;
  world.pivot.set(p.camera.x,p.camera.y);world.position.set(105,70);world.scale.set(p.camera.scale);
  back.position.set(105+p.backdrop.x*.3,70+p.backdrop.y*.2);back.scale.set(238/landscape.width*p.backdrop.scale,159/landscape.height*p.backdrop.scale);
  updateActor(hero,p.hero,t,p.wind);updateActor(enemy,p.enemy,t,0);
  charge.position.set(p.chargePosition.x,p.chargePosition.y);charge.visible=p.charge>0;charge.alpha=p.charge*.6;charge.rotation=(p.resolve?Math.min(t,49.05)*.18:t*.4);charge.scale.set(p.resolve?p.chargeScale:.8+.1*Math.sin(t));
  blade.position.set(p.slash.x,p.slash.y);blade.alpha=p.slash.alpha;blade.rotation=p.slash.rotation;blade.scale.set(p.slash.scale);blade.tint=p.slash.side==='enemy'?0xb49ce8:0xc6e9ff;
  impact.position.set(p.impact.x,p.impact.y);impact.alpha=p.impact.alpha;impact.scale.set(p.impact.scale);
  sparks.forEach((g,i)=>{const q=p.sparks[i];g.position.set(q.x,q.y);g.rotation=q.angle;g.alpha=q.alpha;g.scale.set(q.scale);});
  speedLines.forEach((g,i)=>{g.position.set(70+(i%2)*30,37+i*12);g.alpha=p.slash.alpha*.15;});
  motes.forEach((g,i)=>{
   if(p.resolve&&p.charge>0&&t>=24){
    const phase=(Math.min(t,49.05)*(.22+(i%3)*.035)+i*.618)%1,angle=i*2.39996+t*.13,radius=6+(1-phase)*(25+23*p.charge);
    g.position.set(p.chargePosition.x+Math.cos(angle)*radius,p.chargePosition.y+Math.sin(angle)*radius*.75);
    g.rotation=angle;g.scale.set(1+2*p.charge,1);g.alpha=p.atmosphere*p.charge*Math.sin(phase*Math.PI)*(1-p.resolveQuiet);
   }else{g.position.set((i*47+t*(2+i%3))%230-10,116-((i*19+t*(1+i%4))%106));g.scale.set(1);g.alpha=p.atmosphere*(.55+.45*Math.sin(t+i));}
  });
  dim.alpha=Math.max(p.dim,p.cutShade);
  for(const [label,s]of Object.entries(titles)){s.visible=label===p.label;s.y=4;s.alpha=p.captionAlpha;}
  arrow.visible=p.handoff>0;arrow.alpha=p.handoff;arrow.y=p.arrowY;
  return p;
 }};
}
