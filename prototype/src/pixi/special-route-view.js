import {Container,Graphics,Sprite,Texture} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
import {specialRoutePose,specialReelStrip} from './special-route-motion.js';
import {LCD_REEL_LAYOUT} from './lcd-safe-layout.js';
import {weaponPose} from './long-reach-timeline.js';
const GLYPHS=['00100/01100/00100/00100/00100/00100/01110','11110/00001/00001/01110/10000/10000/11111','11110/00001/00001/01110/00001/00001/11110','10010/10010/10010/11111/00010/00010/00010','11111/10000/10000/11110/00001/00001/11110','01110/10000/10000/11110/10001/10001/01110','11111/00001/00010/00100/01000/01000/01000','01110/10001/10001/01110/10001/10001/01110','01110/10001/10001/01111/00001/00001/01110'];
const spectrum=[0xff7eaa,0xffd171,0xecffa5,0x79edbf,0x87dbff,0xc3a0ff];
function digit(n){
 const texture=Texture.from(pixelSurface(120,150,c=>{
  const p=painter(c);p.poly([[8,8],[108,8],[116,23],[109,135],[61,146],[12,135],[4,23]],'#372a25');
  p.poly([[11,10],[106,10],[112,24],[105,130],[60,140],[16,130],[8,24]],'#d1a355');
  p.poly([[16,17],[101,17],[105,26],[99,124],[60,132],[22,124],[15,26]],'#071831');
  p.rect(21,20,77,3,'#fff0af');p.rect(23,118,73,3,'#916932');p.diamond(60,10,7,'#f4d58a');p.diamond(60,10,3,'#80beed');
  const cells=[];GLYPHS[n-1].split('/').forEach((r,y)=>[...r].forEach((v,x)=>{if(v==='1')cells.push([27+x*13,29+y*12]);}));
  for(const [x,y]of cells)p.rect(x+4,y+6,15,14,n%2?'#4e1826':'#082554');
  for(const [x,y]of cells)p.rect(x-3,y-3,18,17,'#ffe4a2');
  for(const [x,y]of cells){p.rect(x,y,13,12,n%2?'#bd3547':'#287fcd');if(!cells.some(([a,b])=>a===x&&b===y-12))p.rect(x,y,13,3,n%2?'#ff8a89':'#91d9f5');}
 }));texture.source.scaleMode='nearest';return texture;
}
// Match the gold, italic pixel glyphs used by the production RUSH reels.
function rushDigit(n){
 const t=Texture.from(pixelSurface(120,150,c=>{
  const d=painter(c),cells=[];
  GLYPHS[n-1].split('/').forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')cells.push([18+x*15+(6-y)*2,20+y*15]);}));
  for(const [x,y]of cells)d.rect(x+6,y+10,18,18,'#090719');
  for(const [x,y]of cells)d.rect(x+3,y+6,17,18,'#855022');
  for(const [x,y]of cells)d.rect(x-3,y-3,21,21,'#ffe4a0');
  for(const [x,y]of cells){d.rect(x,y,15,15,y<60?'#fff5d8':y<95?'#f5b74e':'#ad5c30');d.rect(x+2,y+10,13,5,y<60?'#d6b5dd':'#cc8139');if(!cells.some(([a,b])=>a===x+2&&b===y-15))d.rect(x,y,15,3,'#ffffff');}
  d.rect(18,132,74,2,'#65414c');d.diamond(57,133,3,'#efc376');
 }));t.source.scaleMode='nearest';return t;
}
// root uses the existing LCD's 210 x 140 coordinates. Optional background is
// borrowed; every internally generated texture belongs to this view.
export function createSpecialRouteView({background=null}={}){
 const root=new Container(),textures=Array.from({length:9},(_,i)=>digit(i+1));
 const rushTextures=Array.from({length:9},(_,i)=>rushDigit(i+1));textures.push(...rushTextures);
 const mask=new Graphics().rect(0,0,210,140).fill(0xffffff);root.addChild(mask);root.mask=mask;
 const base=new Container();root.addChild(base);
 if(background){const s=new Sprite(background);s.width=210;s.height=140;base.addChild(s);}
 const shade=new Graphics().rect(24,37,162,57).fill({color:0x061024,alpha:.58});base.addChild(shade);
 const reels=new Container();base.addChild(reels);
 const columns=Array.from({length:3},(_,i)=>{
  const column=new Container();column.position.set(32+i*53,40);reels.addChild(column);
  const m=new Graphics().rect(0,0,40,50).fill(0xffffff);column.addChild(m);
  const strip=new Container();column.addChild(strip);strip.mask=m;
  const sprites=Array.from({length:3},()=>{const s=new Sprite(textures[6]);s.scale.set(1/3);strip.addChild(s);return s;});
  return {column,sprites};
 });
 const glow=new Graphics();base.addChild(glow);
 const titleTexture=Texture.from(pixelSurface(190,58,c=>{c.font='46px "DotGothic16"';c.textAlign='center';c.textBaseline='middle';c.lineWidth=5;c.strokeStyle='#16375c';c.strokeText('リーチ',95,29);c.fillStyle='#e2f4ff';c.fillText('リーチ',95,29);}));
 titleTexture.source.scaleMode='nearest';textures.push(titleTexture);
 const title=new Sprite(titleTexture);title.anchor.set(.5);title.position.set(105,70);base.addChild(title);
 const premiumLayer=new Container();root.addChild(premiumLayer);
 const moon=new Graphics(),sigil=new Graphics(),sparkles=new Graphics();premiumLayer.addChild(moon,sigil,sparkles);
 let destroyed=false;
 function render(input){
  if(destroyed)throw new Error('Special-route view is destroyed');
  const p=specialRoutePose(input);root.visible=p.visible;base.visible=p.route!=='battle';
  root.position.set(p.shake,0);title.visible=p.banner;title.alpha=p.bannerAlpha;title.scale.set(p.bannerScale);
  columns.forEach(({column,sprites},i)=>{
   const rush=p.mode==='rush',scale=rush?1.5:1;
   column.position.set(rush?10+i*65:32+i*53,rush?LCD_REEL_LAYOUT.rushTop:LCD_REEL_LAYOUT.normalTop);
   column.scale.set(scale,scale*(1+p.landing));const strip=specialReelStrip(p.positions[i]);
   sprites.forEach((s,j)=>{s.texture=(rush?rushTextures:textures)[strip[j].digit-1];s.y=strip[j].y;});
  });
  glow.clear();if(p.winGlow){
   for(let i=0;i<12;i++){const a=i*Math.PI/6;glow.moveTo(105+Math.cos(a)*70,65+Math.sin(a)*39).lineTo(105+Math.cos(a)*98,65+Math.sin(a)*62).stroke({color:spectrum[i%6],width:1,alpha:p.winGlow*.7});}
  }
  premiumLayer.visible=p.premiumVisible;premiumLayer.alpha=p.premiumAlpha;
  moon.clear();sigil.clear();sparkles.clear();
  if(p.premiumVisible){
   const q=p.construction;let cx=174,cy=22,particleRadius=18;
   if(p.premium==='moon'){
    // Two oppositely tracing rings are the identifying phenomenon. A plain moon
    // disk or ordinary upper-device colour is never treated as the premium.
    moon.circle(cx,cy,8).fill({color:0xbceaff,alpha:.08});
    for(const [r,start,reverse]of [[10,-Math.PI/2,false],[14,Math.PI/2,true]]){
     const end=start+(reverse?-1:1)*Math.PI*2*q;
     moon.moveTo(cx+Math.cos(start)*r,cy+Math.sin(start)*r).arc(cx,cy,r,start,end,reverse).stroke({color:p.formed?0xffe4a5:0xace6ff,width:p.formed?1.1:.7,alpha:.95});
    }
    if(p.formed)for(let i=0;i<6;i++){const a=i*Math.PI/3;moon.circle(cx+Math.cos(a)*12,cy+Math.sin(a)*12,.7).fill(spectrum[i]);}
   }else{
    // Bind the emblem to the very same atlas landmarks and actor/camera used by
    // the ongoing battle. No replacement sword, background or character cut-in.
    const bp=input.battlePose;
    if(!bp?.hero||!bp?.camera)throw new TypeError('Sword premium requires the current battlePose');
    const w=weaponPose(bp.hero),cam=bp.camera;
    const transform=v=>({x:105+(v.x-cam.x)*cam.scale,y:70+(v.y-cam.y)*cam.scale});
    const a=transform(w.grip),b=transform(w.tip);cx=a.x+(b.x-a.x)*.58;cy=a.y+(b.y-a.y)*.58;
    const angle=Math.atan2(b.y-a.y,b.x-a.x),length=Math.hypot(b.x-a.x,b.y-a.y);
    const extent=Math.min(8,length*.22),halfWidth=Math.min(3,length*.075),c=Math.cos(angle),s=Math.sin(angle);
    const point=([x,y])=>[cx+x*c-y*s,cy+x*s+y*c];
    const segments=[[[0,-halfWidth],[extent,0]],[[extent,0],[0,halfWidth]],[[0,halfWidth],[-extent,0]],[[-extent,0],[0,-halfWidth]],[[-extent*1.3,0],[extent*1.3,0]],[[0,-halfWidth*1.5],[0,halfWidth*1.5]]];
    segments.forEach(([a,b],i)=>{const u=Math.max(0,Math.min(1,q*segments.length-i));if(u>0){const from=point(a),to=point([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]);sigil.moveTo(...from).lineTo(...to).stroke({width:.8,color:p.formed?0xffe6a2:0x88dfff});}});
    particleRadius=extent+4;
    if(p.formed)sigil.ellipse(cx,cy,extent+2,halfWidth+2).stroke({width:.5,color:0xf3cf87,alpha:.55});
   }
   if(p.formed)for(let i=0;i<p.sparkleCount;i++){
    const a=i*2.399+p.orbit,r=particleRadius+(i%3)*2,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.65;
    sparkles.rect(x-.5,y,1.5,.5).rect(x,y-.5,.5,1.5).fill({color:spectrum[i%6],alpha:.45+.35*Math.sin(p.premiumAge*3+i)**2});
   }
  }
  return p;
 }
 function destroy(){if(destroyed)return;destroyed=true;root.destroy({children:true});for(const t of textures)t.destroy(true);}
 return {root,textures,render,destroy,inspectReels:()=>columns.map(({column,sprites})=>({x:column.x,y:column.y,scaleX:column.scale.x,scaleY:column.scale.y,strip:sprites.map(s=>({digit:textures.indexOf(s.texture)%9+1,y:s.y}))}))};
}
