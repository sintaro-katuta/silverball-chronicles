import {directionFrame,drawBattleDirection} from './battle-direction.js';
import {loadedImage,GUARDIAN_ART} from './assets.js';
import {timeline,beatAt,reachBeat} from './cinematic.js';
import {imagePath,PATTERNS} from './reach-scenes.js';
import {BattleEffects} from './battle-effects.js';

// Illustrated cinematics: preserve the source artwork, animate framing and FX.
// Every effect follows game time so pause and skill selection freeze the image.
export class Battle {
 constructor(host){this.host=host;this.effects=new BattleEffects();this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;this.canvas=document.createElement('canvas');this.canvas.setAttribute('aria-label','月影機関のイラストによる戦闘演出');host.append(this.canvas);this.ctx=this.canvas.getContext('2d');this.frames=new Map();this.sceneId=null;this.art=loadedImage('/eclipse-battle.png');this.portrait=loadedImage(GUARDIAN_ART);this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();}
 resize(){const {width,height}=this.host.getBoundingClientRect();this.canvas.width=Math.max(1,Math.round(width* Math.min(devicePixelRatio,2)));this.canvas.height=Math.max(1,Math.round(height* Math.min(devicePixelRatio,2)));this.canvas.style.width=`${width}px`;this.canvas.style.height=`${height}px`;this.ctx.imageSmoothingEnabled=true;}
 picture(img,zoom,fx,fy,shake=0,rotation=0){if(!img?.width)return;const c=this.ctx,w=600,h=800,scale=Math.max(w/img.width,h/img.height)*zoom,iw=img.width*scale,ih=img.height*scale;const x=Math.max(w-iw,Math.min(0,w*.5-iw*fx)),y=Math.max(h-ih,Math.min(0,h*.5-ih*fy));c.save();c.translate(w/2+shake,h/2);c.rotate(rotation);c.drawImage(img,x-w/2,y-h/2,iw,ih);c.restore();}
 glow(x,y,r,color,power){const c=this.ctx;c.save();c.globalCompositeOperation='screen';c.globalAlpha=power;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(0,0,600,800);c.restore();}
 slash(q,reverse=false){if(q<0||q>1)return;const c=this.ctx;c.save();c.globalCompositeOperation='screen';c.globalAlpha=Math.sin(q*Math.PI);const end=850*q-100;c.translate(reverse?600:0,0);c.scale(reverse?-1:1,1);for(const [width,color]of [[38,'#13789d'],[15,'#45d9ed'],[4,'#efffff']]){c.beginPath();c.moveTo(-80,650);c.quadraticCurveTo(end*.4,550-end*.25,end,590-end*.65);c.strokeStyle=color;c.lineWidth=width;c.shadowBlur=width;c.shadowColor=color;c.stroke();}c.restore();}
 cutin(u,t){
 const c=this.ctx,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-clamp(x))**3;
 // 2.5 s: gather .00–.15, enter .15–.45, hold .45–2.10, leave 2.10–2.50.
 const enter=ease((u-.06)/.12),exit=clamp((u-.84)/.16),visibility=enter*(1-exit);
 const dx=this.reducedMotion?0:-720*(1-enter)+720*exit**3;
 c.save();c.fillStyle=`rgba(2,10,28,${.72*ease(u/.12)*(1-exit)})`;c.fillRect(0,0,600,800);
 c.globalAlpha=visibility;
 // Far trails move independently of the portrait, along the same rising diagonal.
 c.save();c.globalCompositeOperation='screen';for(let i=0;i<18;i++){
 const y=140+(i*43)%570,x=(((this.reducedMotion?0:t)*280+i*131)%1100)-250;
 c.beginPath();c.moveTo(x,y);c.lineTo(x+110+(i%4)*38,y-23-(i%4)*8);
 c.strokeStyle=i%4?'#2998cb':'#dcfaff';c.globalAlpha=visibility*(.15+(i%3)*.1);c.lineWidth=i%4?1:2;c.stroke();}c.restore();
 c.save();c.translate(dx,-dx*.12);
 const border=()=>{c.beginPath();c.moveTo(-40,230);c.lineTo(640,140);c.lineTo(640,555);c.lineTo(-40,645);c.closePath();};
 c.save();border();c.clip();
 this.picture(this.portrait,this.reducedMotion?1.22:1.24-.025*ease((u-.18)/.66),.65,.4);
 c.restore();
 // Dark metal separates the luminous edge from the drawing. No sweep across the eyes.
 for(const [width,color,blur]of [[16,'#031625',0],[9,'#126185',12],[4,'#69e5ff',7],[1.5,'#f0ffff',0]]){
 border();c.strokeStyle=color;c.lineWidth=width;c.shadowColor=color;c.shadowBlur=blur;c.stroke();}c.shadowBlur=0;
 c.save();c.globalCompositeOperation='screen';
 const sweep=this.reducedMotion?.5:clamp((u-.12)/.28),sx=-100+sweep*800;
 for(const offset of [225,630]){c.beginPath();c.moveTo(sx-65,offset-(sx-65)*.132);c.lineTo(sx+65,offset-(sx+65)*.132);c.strokeStyle='#efffff';c.lineWidth=3;c.globalAlpha=visibility*(this.reducedMotion?.25:Math.sin(sweep*Math.PI));c.shadowColor='#8deaff';c.shadowBlur=12;c.stroke();}c.restore();
 c.restore();
 // Foreground fragments stay beside the band, clear of eyes, title and dialogue.
 c.save();c.globalCompositeOperation='screen';for(let i=0;i<4;i++){
 const phase=this.reducedMotion?0:t,x=i%2?557:43,y=210+i*112+Math.sin(phase*1.3+i)*12;
 c.save();c.translate(x,y);c.rotate(phase*.6+i);c.scale(.55+Math.abs(Math.sin(phase*2+i))*.45,1);
 c.strokeStyle=i%2?'#ffe69d':'#a4f0ff';c.lineWidth=2;c.shadowColor=c.strokeStyle;c.shadowBlur=6;c.beginPath();c.arc(0,0,8+i%2*3,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(-4,0);c.lineTo(0,-6);c.lineTo(4,0);c.lineTo(0,6);c.closePath();c.stroke();c.restore();}c.restore();c.restore();
 }
 loadScene(id){if(this.sceneId===id)return;this.sceneId=id;this.frames.clear();for(const p of PATTERNS){const img=loadedImage(imagePath(id,p.id));this.frames.set(p.id,img);}}
 asset(pattern){const img=this.frames.get(pattern);return img?.width?img:this.art;}
 render(game){const p=timeline(game);if(!p)return;this.loadScene(p.scene.id);const t=p.t,beat=reachBeat(p),u=(t-beat.from)/(beat.to-beat.from),id=beat.id,c=this.ctx;c.setTransform(this.canvas.width/600,0,0,this.canvas.height/800,0,0);c.fillStyle='#071222';c.fillRect(0,0,600,800);
 if(id==='reach'){this.picture(this.portrait,1.04,.5,.4);this.glow(300,430,430,p.reachColor==='red'?'#ff2135':'#bceaff',.16);return;}
 let image=this.asset('feint'),zoom=1.05,x=.5,y=.5,shake=0,rotation=0;
 if(id==='warning'){zoom=1.1+u*.12;x=.65;y=.35;}
 if(id==='enemy'){const lunge=Math.exp(-Math.pow((u-.34)*9,2));zoom=1.5+u*.16+lunge*.13;x=.79;y=.29;shake=Math.sin(t*37)*lunge*7;rotation=Math.sin(t*21)*lunge*.012;}
 if(id==='clash'){if(u<.38){zoom=1.5-u*.25;x=.27;y=.61;}else if(u<.7){zoom=1.65-(u-.38)*.4;x=.79;y=.29;}else{zoom=1.1+(u-.7)*.1;}const hit=Math.exp(-Math.pow((u-.7)*23,2));shake=Math.sin(t*65)*9*hit;rotation=Math.sin(t*45)*.009*hit;}
 if(id==='crisis'){image=this.asset(p.pattern==='feint'?'feint':'defeat');zoom=1.3-u*.1;x=.35;y=.58;rotation=-.025;}
 if(id==='awakening'){image=this.asset(['defeat','revival'].includes(p.pattern)?'defeat':p.pattern==='feint'?'feint':'awakening');zoom=1.09-u*.04;x=.47;y=.51;}
 if(id==='strike'){image=this.asset(p.pattern==='revival'&&t<17.8?'defeat':p.pattern);zoom=1.25-u*.2;x=.42;y=.53;const hit=Math.exp(-Math.pow((u-.5)*13,2));shake=Math.sin(t*67)*12*hit;rotation=.025*Math.sin(u*Math.PI);}
 if(id==='judgment'){image=this.asset(p.pattern);zoom=1.1;x=.65;y=.4;}
 if(id==='silence'){image=this.asset('defeat');zoom=1.1;x=.4;y=.55;}
 if(id==='revival'){image=this.asset('revival');zoom=1.08+u*.05;x=.45;y=.48;}
 if(id==='resolve'){image=this.asset(p.pattern);zoom=1.04+u*.03;x=.5;y=.5;}
 // Keep the enemy, weapon and point of contact in one spatial frame until judgment.
 // Result assets are reserved for the result beat, including losing feints.
 const direction=directionFrame(p,id,u);
 if(['clash','crisis','awakening','strike'].includes(id)){
  image=this.asset(direction.art);zoom=1.04;x=.5;y=.5;rotation=0;
  shake=id==='strike'?Math.sin(t*67)*4*Math.exp(-Math.pow((u-.6)*22,2)):0;
 }
 this.picture(image,zoom,x,y,this.reducedMotion?0:shake,this.reducedMotion?0:rotation);
 if(id==='warning')this.glow(480,150,470,'#db361e',.2+u*.12);
 if(id==='enemy')this.glow(460,220,300,'#ff4925',.16);
 if(id==='crisis'){c.fillStyle=`rgba(8,13,28,${.18+u*.12})`;c.fillRect(0,0,600,800);this.glow(100,600,500,'#9d1735',.18);}
 const hasCutin=id==='revival';
 if(id==='silence'){c.fillStyle=`rgba(0,3,10,${.35+u*.35})`;c.fillRect(0,0,600,800);}
 if(id==='judgment'&&p.win){c.fillStyle=`rgba(210,245,255,${.65*(1-u)**2})`;c.fillRect(0,0,600,800);}
 if(id==='resolve'&&!p.win){c.fillStyle=`rgba(0,4,14,${.15+u*.35})`;c.fillRect(0,0,600,800);}
 if(id==='resolve'&&p.win)this.glow(300,450,550,'#ffc66c',.23);
 // Embers / moonlight motes move over the artwork without warping characters.
 c.save();c.globalCompositeOperation='screen';const suppressed=p.pattern==='defeat'||(p.pattern==='revival'&&t<17.8),cool=!suppressed&&['awakening','strike','judgment'].includes(id),gold=id==='resolve'&&p.win;
 for(let i=0;i<18;i++){const seed=((i*137.51)%601)/601,life=(t*(.1+seed*.07)+i*.137)%1,px=(i*197.3+t*(cool?10:4))%630-15,py=820-life*850;const alpha=Math.sin(life*Math.PI)*(.25+seed*.45);c.globalAlpha=alpha;c.fillStyle=gold?'#ffe3a3':cool?'#b8f6ff':'#ffc186';const size=1+seed*2;c.beginPath();c.ellipse(px,py,size,size*(cool?2:1),.4,0,Math.PI*2);c.fill();}
 c.restore();this.effects.render(c,{t,id,u,pattern:p.pattern,win:p.win,sceneId:p.scene.id,reducedMotion:this.reducedMotion});
 drawBattleDirection(c,p,id,u,this.reducedMotion);
 // The broad radiance belongs behind the cut-in, not over the character's face.
 if(hasCutin)this.cutin(u,t);
 const vignette=c.createRadialGradient(300,380,220,300,400,590);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#030812a6');c.fillStyle=vignette;c.fillRect(0,0,600,800);
 }
 dispose(){this.effects.dispose?.();this.observer.disconnect();this.host.replaceChildren();}
}
