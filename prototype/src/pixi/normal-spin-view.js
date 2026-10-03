import {revivalReels} from './revival-entry-motion.js';
import {rushEndPose} from './rush-end-motion.js';
import {reachSeconds} from './win-sequence.js';
import {rushWinPose} from './rush-win-motion.js';
import {createRushEndView} from './rush-end-view.js';
import {Container,Graphics,Sprite,Texture} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
import {reviewReelState,linkedWinScale} from './review-reel-state.js';
import {createRushEntryView} from './rush-entry-view.js';
import {createHoldView} from './hold-view.js';
import {LCD_REEL_LAYOUT} from './lcd-safe-layout.js';
import {createBackgroundTransition} from './background-transition.js';
const GLYPHS=['00100/01100/00100/00100/00100/00100/01110','11110/00001/00001/01110/10000/10000/11111','11110/00001/00001/01110/00001/00001/11110','10010/10010/10010/11111/00010/00010/00010','11111/10000/10000/11110/00001/00001/11110','01110/10000/10000/11110/10001/10001/01110','11111/00001/00010/00100/01000/01000/01000','01110/10001/10001/01110/10001/10001/01110','01110/10001/10001/01111/00001/00001/01110'];
const mod=n=>((n%9)+9)%9;
const RAINBOW=['#ff6282','#ffc75b','#f7ff91','#65f1b4','#75d8ff','#bc9aff'];
function digitTexture(n,rainbow=-1){const t=Texture.from(pixelSurface(120,150,c=>{const d=painter(c),red=n%2===1;
 d.poly([[8,8],[108,8],[116,23],[109,135],[61,146],[12,135],[4,23]],'#372a25');
 d.poly([[11,10],[106,10],[112,24],[105,130],[60,140],[16,130],[8,24]],'#d1a355');
 d.poly([[16,17],[101,17],[105,26],[99,124],[60,132],[22,124],[15,26]],'#071831');
 d.rect(21,20,77,3,'#fff0af');d.rect(23,118,73,3,'#916932');
 d.diamond(60,10,7,'#f4d58a');d.diamond(60,10,3,'#80beed');
 const cells=[];GLYPHS[n-1].split('/').forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')cells.push([27+x*13,29+y*12]);}));
 for(const [x,y]of cells)d.rect(x+4,y+6,15,14,red?'#4e1826':'#082554');
 for(const [x,y]of cells)d.rect(x-3,y-3,18,17,'#ffe4a2');
 for(const [x,y]of cells){if(rainbow<0)d.rect(x,y,13,12,red?'#bd3547':'#287fcd');else for(let k=0;k<12;k+=3)d.rect(x,y+k,13,3,RAINBOW[(Math.floor((y+k+x*.3)/16)+rainbow)%6]);}
 for(const [x,y]of cells)if(!cells.some(([a,b])=>a===x&&b===y-12))d.rect(x,y,13,3,rainbow>=0?'#f4fcff':red?'#ff8a89':'#91d9f5');
 }));t.source.scaleMode='nearest';return t;}
function rushDigitTexture(n,rainbow=-1){
 const t=Texture.from(pixelSurface(120,150,c=>{const d=painter(c);
 const cells=[];GLYPHS[n-1].split('/').forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')cells.push([18+x*15+(6-y)*2,20+y*15]);}));
 for(const [x,y]of cells)d.rect(x+6,y+10,18,18,'#090719');
 for(const [x,y]of cells)d.rect(x+3,y+6,17,18,'#855022');
 for(const [x,y]of cells)d.rect(x-3,y-3,21,21,'#ffe4a0');
 for(const [x,y]of cells){d.rect(x,y,15,15,rainbow>=0?RAINBOW[(Math.floor(y/15)+rainbow)%6]:y<60?'#fff5d8':y<95?'#f5b74e':'#ad5c30');d.rect(x+2,y+10,13,5,y<60?'#d6b5dd':'#cc8139');if(!cells.some(([a,b])=>a===x+2&&b===y-15))d.rect(x,y,15,3,'#ffffff');}
 d.rect(18,132,74,2,'#65414c');d.diamond(57,133,3,'#efc376');
 }));t.source.scaleMode='nearest';return t;
}
// Pre-render the travelling light inside the digit face only, on the pixel grid.
function rushShineTexture(frame){
 const t=Texture.from(pixelSurface(120,150,c=>{
  GLYPHS[6].split('/').forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')c.fillRect(18+x*15+(6-y)*2,20+y*15,15,15);}));
  const light=pixelSurface(120,150,l=>{const sweep=-80+frame*22;
   for(let y=0;y<150;y+=3){for(let k=0;k<6;k++){l.fillStyle=RAINBOW[k];l.fillRect(sweep-Math.floor(y/3)*2+k*4,y,4,3);}l.fillStyle='#ffffff';l.fillRect(sweep-Math.floor(y/3)*2+10,y,5,3);}
  });c.globalCompositeOperation='source-in';c.drawImage(light,0,0);
 }));t.source.scaleMode='nearest';return t;
}
export function createNormalSpinView(rushScene=null){
 const root=new Container(),textures=Array.from({length:9},(_,i)=>digitTexture(i+1));
 const lcdMask=new Graphics().rect(0,0,210,140).fill(0xffffff);root.addChild(lcdMask);root.mask=lcdMask;
 const shade=new Graphics().rect(24,LCD_REEL_LAYOUT.normalTop-3,162,57).fill({color:0x061024,alpha:.6});root.addChild(shade);
 const rushBackdrop=new Container();root.addChild(rushBackdrop);
 if(rushScene){const t=Texture.from(pixelSurface(210,140,c=>c.drawImage(rushScene.source.resource,0,0,210,140)));t.source.scaleMode='nearest';textures.push(t);rushBackdrop.addChild(new Sprite(t));}
 else rushBackdrop.addChild(new Graphics().rect(0,0,210,140).fill(0x160c29));
 const backgroundTransition=createBackgroundTransition(.8);
 const sparks=[];for(let i=0;i<16;i++){const g=new Graphics().rect(0,0,i%3===0?8:3,1).fill(i%3===0?0xc89555:0x795987);rushBackdrop.addChild(g);sparks.push(g);}
 const rushDigits=Array.from({length:9},(_,i)=>rushDigitTexture(i+1));textures.push(...rushDigits);
 const columns=[];
 for(let i=0;i<3;i++){
  const column=new Container();column.position.set(32+i*53,LCD_REEL_LAYOUT.normalTop);root.addChild(column);
  const mask=new Graphics().rect(0,0,40,50).fill(0xffffff);column.addChild(mask);
  const strip=new Container();column.addChild(strip);strip.mask=mask;
  const sprites=Array.from({length:3},()=>{const s=new Sprite(textures[0]);s.scale.set(1/3);strip.addChild(s);return s;});
  const rim=new Graphics().rect(0,51,40,1).fill(0xb88d49);column.addChild(rim);columns.push({column,sprites,rim});
 }
 const celebration=new Container();root.addChild(celebration);
 const impactShade=new Graphics().rect(0,0,210,140).fill(0x04020c);celebration.addChild(impactShade);
 const fan=new Container();fan.position.set(105,70);celebration.addChild(fan);
 for(let i=0;i<16;i++){const a=i*Math.PI/8,b=a+.075;fan.addChild(new Graphics().poly([0,0,Math.cos(a)*190,Math.sin(a)*190,Math.cos(b)*190,Math.sin(b)*190]).fill({color:RAINBOW[i%6],alpha:.3}));}
 const rainbowTextures=Array.from({length:6},(_,i)=>digitTexture(7,i));textures.push(...rainbowTextures);
 const rushWinners=Array.from({length:6},(_,i)=>rushDigitTexture(7,i));textures.push(...rushWinners);
 const reelGroup=new Container();reelGroup.pivot.set(105,LCD_REEL_LAYOUT.normalCenterY);reelGroup.position.set(105,LCD_REEL_LAYOUT.normalCenterY);celebration.addChild(reelGroup);
 const shineTextures=Array.from({length:16},(_,i)=>rushShineTexture(i));textures.push(...shineTextures);
 const winners=[];for(let i=0;i<3;i++){const c=new Container(),back=new Sprite(textures[6]),front=new Sprite(rainbowTextures[0]);for(const v of [back,front])v.anchor.set(.5);back.tint=0x273569;back.position.set(9,6);const shine=new Sprite(shineTextures[0]);shine.anchor.set(.5);c.addChild(back,front,shine);reelGroup.addChild(c);winners.push({c,front,back,shine});}
 reelGroup.addChild(winners[1].c);
 const rushImpact=new Graphics().poly([-20,113,225,26,225,32,-20,119]).fill(0xffc55f).poly([-20,116,225,29,225,31,-20,118]).fill(0xffffff);celebration.addChild(rushImpact);
 const shards=[];for(let i=0;i<28;i++){const g=new Graphics().poly([0,-3,3,0,0,4,-2,1]).fill(i%3===0?0xffffff:i%2?0xffd36b:0xd88b36);celebration.addChild(g);shards.push(g);}
 const rushGlints=[];for(let i=0;i<12;i++){const g=new Graphics().rect(-4,-1,8,2).rect(-1,-4,2,8).fill(i%2?0xffdfa1:0xffffff);celebration.addChild(g);rushGlints.push(g);}
 celebration.visible=false;
 const holdView=createHoldView();root.addChild(holdView.root);
 const banner=new Container();banner.position.set(105,70);root.addChild(banner);
 banner.addChild(new Graphics().poly([-88,-21,88,-21,100,0,88,21,-88,21,-100,0]).fill({color:0x07162c,alpha:.94}));
 banner.addChild(new Graphics().rect(-81,21,162,2).fill(0x7fc5e9));
 const titleTexture=Texture.from(pixelSurface(184,58,c=>{c.font='48px "DotGothic16"';c.textAlign='center';c.textBaseline='middle';c.lineJoin='miter';c.lineWidth=5;c.strokeStyle='#16375c';c.strokeText('リーチ',92,29);c.fillStyle='#e2f4ff';c.fillText('リーチ',92,29);}));titleTexture.source.scaleMode='nearest';textures.push(titleTexture);const title=new Sprite(titleTexture);title.anchor.set(.5);banner.addChild(title);banner.visible=false;
 const rays=new Graphics();for(let i=0;i<10;i++){const a=i*Math.PI/5;rays.rect(Math.round(105+Math.cos(a)*83),Math.round(70+Math.sin(a)*53),3,3).fill(0xffe6a5);}root.addChild(rays);rays.visible=false;
 const rushCanvas=pixelSurface(210,28,()=>{}),rushTexture=Texture.from(rushCanvas);rushTexture.source.scaleMode='nearest';textures.push(rushTexture);const rushStatus=new Sprite(rushTexture);root.addChild(rushStatus);let rushKey='';
 const rushEntry=createRushEntryView();root.addChild(rushEntry.root);textures.push(...rushEntry.textures);
 const rushEnd=createRushEndView();root.addChild(rushEnd.root);textures.push(rushEnd.texture);
 const chargeTexture=Texture.from(pixelSurface(210,90,c=>{
  c.fillStyle='rgba(4,14,31,.94)';c.fillRect(12,7,186,76);
  c.fillStyle='#8edff1';c.fillRect(12,7,186,2);c.fillRect(12,81,186,2);
  c.textAlign='center';c.textBaseline='middle';c.font='24px "DotGothic16"';c.fillStyle='#d8f4ff';c.fillText('CHARGE',105,29);
  c.font='30px "DotGothic16"';c.fillStyle='#f5d78d';c.fillText('300',105,61);
 }));chargeTexture.source.scaleMode='nearest';textures.push(chargeTexture);
 const chargeBanner=new Sprite(chargeTexture);chargeBanner.position.set(0,25);chargeBanner.visible=false;root.addChild(chargeBanner);
 let previousPosition=0,reachStart=null;
 return {root,textures,render(game,payout=false){const ending=rushEndPose(game.time,game.lastRush?.endedAt,!!game.rush||!!game.jackpot);const isRush=!game.entryPrelude&&((!!game.rush&&!game.jackpot)||ending.visible);const state=revivalReels(game,reviewReelState(game)),winTime=game.entryPrelude||game.previewWinAt===undefined?-1:game.time-game.previewWinAt,reach=game.presentation?.basicReach?game.presentation:null;
  const transitionMix=backgroundTransition.update(game.time,(isRush&&game.previewWinAt===undefined&&(!ending.visible||ending.age<.25))||(!!game.previewRushWin&&winTime>=0));const mix=game.entryBackdropReady&&game.time-game.entryGuideAt<1.5?1:transitionMix;rushBackdrop.visible=mix>0;rushBackdrop.alpha=mix;shade.visible=mix<1;shade.alpha=1-mix;
  for(let i=0;i<sparks.length;i++){sparks[i].position.set(i%2===0?3+(i*3)%14:192+(i*3)%12,28+Math.floor(((i*19-game.time*7)%105+105)%105));sparks[i].alpha=.25+.15*Math.sin(game.time*.8+i);}
  for(let i=0;i<3;i++){const c=columns[i];c.column.position.set(isRush?10+i*65:32+i*53,isRush?LCD_REEL_LAYOUT.rushTop:LCD_REEL_LAYOUT.normalTop);c.column.scale.set(isRush?1.5:1);c.rim.visible=!isRush;}
  for(let i=0;i<3;i++){const c=columns[i];if(isRush&&state.stopped[i]&&!c.wasStopped)c.landedAt=game.time;c.wasStopped=state.stopped[i];const age=game.time-(c.landedAt??-100);if(isRush&&age>=0&&age<.18)c.column.scale.y=1.5+.12*Math.sin(age/.18*Math.PI);}
  rushStatus.visible=!game.entryPrelude&&!!game.rush&&!game.hasPendingWBonus&&!game.jackpot&&!reach;
  if(rushStatus.visible){const key=game.rush.remaining;if(key!==rushKey){rushKey=key;const c=rushCanvas.getContext('2d');c.clearRect(0,0,210,28);c.fillStyle='#160c29';c.fillRect(0,0,210,28);c.font='17px "DotGothic16"';c.textAlign='center';c.fillStyle='#ffe2a1';c.fillText(`RUSH  残り ${key} 回`,105,20);rushTexture.source.update();}}
  rays.visible=winTime>=0&&winTime<5.8&&!game.previewRushWin;
  celebration.visible=winTime>=0;for(const c of columns)c.column.visible=winTime<0;
  if(winTime>=0){const rushWin=!!game.previewRushWin,centerY=rushWin?LCD_REEL_LAYOUT.rushCenterY:LCD_REEL_LAYOUT.normalCenterY;reelGroup.pivot.set(105,centerY);reelGroup.position.set(105,centerY);reelGroup.scale.set(rushWin?1:linkedWinScale(winTime));fan.visible=!rushWin;const pose=rushWinPose(winTime);impactShade.visible=rushWin;impactShade.alpha=pose.darkAlpha;
   reelGroup.position.set(105+(rushWin?pose.shake:0),centerY+(rushWin?Math.round(pose.shake/2):0));
   shards.forEach((g,i)=>{g.visible=rushWin&&pose.sparkAlpha>0;const a=i*2.39996,r=15+(45+i%5*13)*(1-(1-pose.burst)**2);g.position.set(Math.round(105+Math.cos(a)*r),Math.round(72+Math.sin(a)*r*.7+pose.burst*pose.burst*18));g.alpha=pose.sparkAlpha;g.scale.set(i%4===0?1.5:1);});rushImpact.visible=rushWin&&pose.slashAlpha>0;rushImpact.alpha=pose.slashAlpha;rushGlints.forEach((g,i)=>{g.visible=rushWin&&pose.sparkAlpha>0;const a=i*Math.PI/6,r=30+Math.min(1,winTime/.85)*65;g.position.set(Math.round(105+Math.cos(a)*r),Math.round(70+Math.sin(a)*r*.6));g.alpha=pose.sparkAlpha;});fan.rotation=winTime*.18;fan.alpha=winTime<5.8?.8:.25;
   winners.forEach(({c,front,back,shine},i)=>{c.position.set(105+(i-1)*(rushWin?65+pose.offset:53),centerY);c.scale.set(rushWin?.5*pose.scale:1/3);c.skew.set(0,0);c.rotation=0;back.texture=rushWin?rushDigits[6]:textures[6];front.texture=(rushWin?rushWinners:rainbowTextures)[Math.floor(winTime*(rushWin?3:9))%6];shine.visible=rushWin&&pose.shineAlpha>0;shine.texture=shineTextures[Math.min(15,Math.floor(pose.shine*16))];shine.alpha=pose.shineAlpha;});
  }


  if(rays.visible)rays.alpha=Math.max(0,1-winTime/5.8);
  if(reach&&reachStart===null)reachStart=previousPosition;if(!reach)reachStart=null;
  const reachDuration=reach?.win?.45:reachSeconds(reach,isRush);
  banner.visible=!!reach&&reach.time<reachDuration;
  if(reach){const t=reach.time;const scale=t<.1?1.24-.24*(1-(1-t/.1)**3):t<.23?1-.045*Math.sin((t-.1)/.13*Math.PI):1;banner.scale.set(scale);banner.position.set(105+(t<.2?Math.round(Math.sin(t*125)*2*(1-t/.2)):0),70);const fade=Math.min(.2,reachDuration*.25);banner.alpha=Math.min(1,Math.max(0,(reachDuration-t)/fade));}

  for(let i=0;i<3;i++){
   const index=game.previewCenterPending?[0,2,1][i]:i,remaining=game.drawTempo+index*game.reelStopGap-game.drawTimer,speed=8+index*.6,target=game.spinResult?.reels[index]??state.numbers[i];
   const offset=state.stopped[i]?0:remaining>.28?speed*(remaining-.14):speed*Math.max(0,remaining)**2/.56;
   let position=target-1+offset;
   if(reach&&i===1){const target=game.reelOutcome[2]-1,end=target-9*Math.ceil((target-reachStart+18)/9),progress=Math.min(1,reach.time/reachSeconds(reach,isRush));position=end+(reachStart-end)*(1-progress)**1.6;}
   if(i===1)previousPosition=position;
   const base=Math.floor(position),fraction=position-base;
   columns[i].sprites.forEach((s,j)=>{const row=base+j-1;s.texture=(isRush?rushDigits:textures)[mod(row)];s.y=Math.round((j-1-fraction)*50);});
   columns[i].rim.alpha=state.stopped[i]?1:.25;
  }
  for(const c of columns)c.column.alpha=ending.visible?1-ending.dim:1;
  holdView.render(game);
  rushEntry.render(game.time,!game.entryPrelude&&!!game.rush&&!game.hasPendingWBonus&&!game.jackpot&&game.previewWinAt===undefined,game.time-game.entryGuideAt<.2?(game.entryTitleOffset||0):0);
  rushEnd.render(game);
  const charge=!!game.jackpot?.charge;
  chargeBanner.visible=charge&&!payout;
  if(charge){celebration.visible=false;rays.visible=false;banner.visible=false;for(const c of columns)c.column.visible=false;}
  if(rushEntry.root.visible||rushEnd.root.visible)for(const c of columns)c.column.visible=false;
  // Reuse the live reel backdrop during payout without drawing reels or win overlays.
  for(const child of root.children)if(child!==lcdMask)child.renderable=!payout||child===rushBackdrop;
 }};
}
