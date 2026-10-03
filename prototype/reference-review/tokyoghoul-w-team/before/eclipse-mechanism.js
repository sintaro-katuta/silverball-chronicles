import {mechanismTime} from './win-sequence.js';
import {Container,Graphics,Sprite,Texture} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
const clamp=x=>Math.max(0,Math.min(1,x));
export function eclipsePose(t){
 const enter=clamp((t-.06)/.3),leave=clamp((t-1.38)/.5);
 const travel=t<1.38?enter**.65:1-leave*leave;
 const age=t-.36,bounce=age>=0&&age<.16?Math.round(Math.sin(age/.16*Math.PI)*4):0;
 return {visible:t>=0&&t<1.9,travel,bounce,light:t>=.36&&t<1.38?1:0,flash:t>=.36&&t<.5?1-(t-.36)/.14:0};
}
function plate(char){return pixelSurface(110,118,c=>{
 const d=painter(c),shape=[[3,16],[22,4],[88,4],[105,17],[101,88],[84,107],[18,107],[4,92]];
 // Raised mounting body, its lower/right extrusion, and the cut metal face.
 d.poly(shape.map(([x,y])=>[x+4,y+8]),'#030710');
 d.poly(shape.map(([x,y])=>[x+2,y+5]),'#4a352c');d.poly(shape,'#a98248');
 d.poly([[7,18],[24,8],[85,8],[100,20],[97,85],[81,102],[22,102],[8,89]],'#dce4ec');
 d.poly([[11,22],[25,12],[82,12],[95,22],[92,83],[78,98],[25,98],[12,86]],'#172b49');
 d.line(23,9,84,9,'#fff3cf',2);d.line(99,24,95,83,'#674b37',3);
 // Broad ribs and exposed fasteners tie the letters to mechanical carriers.
 for(const x of [13,94]){d.rect(x,30,3,48,'#658094');for(const y of [24,86]){d.diamond(x+1,y,3,'#e9d7a1');d.rect(x,y,3,1,'#352b27');}}
 c.textAlign='center';c.textBaseline='middle';c.font='82px "DotGothic16"';c.lineJoin='miter';
 for(let z=6;z>=1;z--){c.lineWidth=7;c.strokeStyle=z>3?'#060a16':'#86552c';c.strokeText(char,53+z,56+z);}
 c.lineWidth=6;c.strokeStyle='#fff0b4';c.strokeText(char,53,56);c.fillStyle='#d6aa54';c.fillText(char,53,56);
 // Separate translucent face highlights preserve the authored pixel font.
 const face=pixelSurface(110,118,f=>{f.font=c.font;f.textAlign='center';f.textBaseline='middle';f.fillStyle='#ffffff';f.fillText(char,53,56);});
 const light=pixelSurface(110,118,f=>{for(let y=0;y<118;y++){f.fillStyle=y<38?'#fffbea':y<64?'#ffdb7e':y<85?'#b97a37':'#ffe6a0';f.fillRect(0,y,110,1);}});
 const fc=face.getContext('2d');fc.globalCompositeOperation='source-in';fc.drawImage(light,0,0);c.drawImage(face,0,0);
 d.diamond(54,104,5,'#f2cd74');d.diamond(54,104,2,'#72d7ff');
 });}
export function createEclipseMechanism({height=140,leftHeight=height}={}){
 const root=new Container(),textures=[];
 const own=canvas=>{const t=Texture.from(canvas);t.source.scaleMode='nearest';textures.push(t);return t;};
 const veil=new Graphics().rect(0,0,210,height).fill(0x010510);root.addChild(veil);
 const body=new Container();body.y=(height-140)/2;root.addChild(body);
 const mask=new Graphics().rect(0,-2,210,144).fill(0xffffff);body.addChild(mask);body.mask=mask;
 const dim=new Graphics().rect(0,0,210,140).fill(0x010510);body.addChild(dim);
 const rails=new Graphics();for(const y of [28,112])rails.rect(0,y,210,5).fill(0x23364a).rect(0,y,210,1).fill(0x9d9f92);body.addChild(rails);
 const pieces=[];
 for(const char of ['月','蝕']){const texture=own(plate(char)),shadow=new Sprite(texture),sprite=new Sprite(texture);shadow.tint=0x000000;shadow.alpha=.7;body.addChild(shadow,sprite);pieces.push({sprite,shadow});}
 const crest=new Sprite(own(pixelSurface(124,38,c=>{const d=painter(c);
  d.poly([[0,8],[18,12],[28,3],[45,10],[62,0],[79,10],[96,3],[106,12],[123,8],[107,28],[80,31],[62,37],[44,31],[17,28]],'#382b25');
  d.poly([[2,8],[28,7],[46,14],[62,3],[78,14],[95,7],[121,8],[104,23],[77,27],[62,33],[47,27],[19,23]],'#e4bd6f');
  d.poly([[11,12],[29,12],[47,19],[62,7],[77,19],[94,12],[112,12],[100,19],[75,23],[62,29],[49,23],[23,19]],'#364c6a');
  d.diamond(62,18,12,'#ffe6a1');d.diamond(62,18,9,'#173269');d.diamond(65,16,7,'#e1f5ff');d.diamond(68,14,6,'#173269');
 })));body.addChild(crest);
 const glow=new Graphics();for(const x of [10,198])glow.rect(x,22,2,88).fill(0xa4e6ff);glow.rect(22,8,166,2).fill(0xffe8ab);body.addChild(glow);
 // Housing lips stay attached to the existing frame; the plates pass behind them.
 const housing=new Graphics();for(const x of [-5,207]){const h=x<0?leftHeight:height;housing.rect(x,-2,8,h+4).fill(0x503e30).rect(x,0,3,h).fill(0xd2b37c).rect(x+3,4,2,h-8).fill(0x152239);}housing.rect(40,-8,130,7).fill(0x3c3940).rect(42,-8,126,2).fill(0xf6d28a);root.addChild(housing);
 return {root,textures,render(game,overrideTime){const t=overrideTime??mechanismTime(game),p=eclipsePose(t);body.visible=p.visible;veil.visible=p.visible;veil.alpha=.65*p.travel;housing.visible=true;
  dim.alpha=.58*p.travel;rails.alpha=.75*p.travel;
  pieces.forEach(({sprite,shadow},i)=>{const x=i===0?-112+113*p.travel-p.bounce:212-107*p.travel+p.bounce;const y=20+(i===0?-1:1)*p.bounce; sprite.position.set(Math.round(x),Math.round(y));shadow.position.set(Math.round(x+5),Math.round(y+7));});
  crest.position.set(43,Math.round(-43+48*p.travel-p.bounce));glow.alpha=p.light*(.65+.35*Math.sin(Math.max(0,t-.36)*12));
 }};
}
