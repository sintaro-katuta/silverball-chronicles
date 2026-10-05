// Artwork compositing in 600 × 800 logical pixels. All motion is a pure function
// of the presentation clock: pause, replay and frame stepping remain identical.
const W=600,H=800,TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>1-(1-clamp(x))**3;
const pulse=(x,center,width)=>Math.exp(-(((x-center)/width)**2));
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const sceneSeed=id=>[...String(id??'eclipse')].reduce((n,c)=>n*1.03+c.charCodeAt(0),7);
const colors={ice:'#8eefff',white:'#f2ffff',gold:'#ffdf9c',red:'#f23547',violet:'#9b48db'};
const SLASH_A=[[-90,710],[160,760],[335,342],[690,345]];
const SLASH_B=[[700,706],[474,451],[136,276],[-95,353]];
function bezier(points,t){const s=1-t,[a,b,c,d]=points;return {x:s*s*s*a[0]+3*s*s*t*b[0]+3*s*t*t*c[0]+t*t*t*d[0],y:s*s*s*a[1]+3*s*s*t*b[1]+3*s*t*t*c[1]+t*t*t*d[1]};}
function tangent(points,t){const s=1-t,[a,b,c,d]=points;return {x:3*s*s*(b[0]-a[0])+6*s*t*(c[0]-b[0])+3*t*t*(d[0]-c[0]),y:3*s*s*(b[1]-a[1])+6*s*t*(c[1]-b[1])+3*t*t*(d[1]-c[1])};}
function glow(c,x,y,r,color,alpha){if(alpha<=0)return;c.save();c.globalCompositeOperation='screen';c.globalAlpha=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(.22,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
function stroke(c,color,width,alpha,path,blur=0){if(alpha<=0)return;c.save();c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';if(blur){c.shadowColor=color;c.shadowBlur=blur;}c.beginPath();path(c);c.stroke();c.restore();}
function ribbon(c,points,from,to,width,color,alpha,dx=0,dy=0){
 if(to<=from||alpha<=0)return;const edgeA=[],edgeB=[];
 for(let n=0;n<=36;n++){const k=n/36,t=from+(to-from)*k,p=bezier(points,t),v=tangent(points,t),len=Math.hypot(v.x,v.y)||1,thickness=width*Math.sin(k*Math.PI)**.6;edgeA.push([p.x-v.y/len*thickness+dx,p.y+v.x/len*thickness+dy]);edgeB.push([p.x+v.y/len*thickness+dx,p.y-v.x/len*thickness+dy]);}
 c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.moveTo(...edgeA[0]);for(const p of edgeA.slice(1))c.lineTo(...p);for(const p of edgeB.reverse())c.lineTo(...p);c.closePath();c.fill();c.restore();
}
function sword(c,q,points,strength=1,warm=false){
 if(q<=0||q>=1)return;const head=ease(q/.67),tail=ease((q-.29)/.71)*.97,fade=Math.sin(q*Math.PI)**.55,accent=warm?colors.gold:colors.ice;
 c.save();c.globalCompositeOperation='screen';
 // Separated echoes follow the swept blade, rather than moving the illustration.
 for(let echo=3;echo>=1;echo--){const lag=echo*.046;const h=ease((q-lag)/.67),a=ease((q-lag-.27)/.73)*.96;ribbon(c,points,a,h,10+echo*3,accent,fade*.1*strength,-echo*7,echo*8);}
 ribbon(c,points,tail,head,28,accent,fade*.12*strength);
 ribbon(c,points,tail,head,12,accent,fade*.55*strength);
 ribbon(c,points,tail,head,4.2,colors.white,fade*.88*strength);
 ribbon(c,points,tail,head,1.1,'#ffffff',fade*strength);
 const tip=bezier(points,head);glow(c,tip.x,tip.y,63,accent,fade*.29*strength);
 stroke(c,colors.white,1.3,fade*.65*strength,p=>{const a=bezier(points,clamp(head-.11));p.moveTo(a.x,a.y);p.lineTo(tip.x+26,tip.y-8);},6);
 c.restore();
}
function impact(c,age,x,y,strength,seed,warm=false){
 if(age<0||age>1.1)return;const life=clamp(age/1.1),fade=(1-life)**1.5,accent=warm?colors.gold:colors.ice;
 c.save();c.globalCompositeOperation='screen';
 // A localized contact core. It does not turn the entire display white.
 glow(c,x,y,145,accent,Math.exp(-age*11)*.57*strength);
 glow(c,x,y,38,'#ffffff',Math.exp(-age*20)*.88*strength);
 for(let ring=0;ring<3;ring++){const q=clamp(life-ring*.045),r=8+q*(200+ring*40);if(q<=0)continue;stroke(c,ring?accent:colors.white,ring?1.1:2.3,fade*(ring?.22:.48)*strength,p=>p.ellipse(x,y,r,r*.46,-.35,0,TAU));}
 for(let n=0;n<54;n++){const rand=hash(n+seed),a=hash(n*7+seed)*TAU,speed=80+rand*500,travel=age*speed;
  const px=x+Math.cos(a)*travel,py=y+Math.sin(a)*travel*.66+age*age*84,trail=(5+rand*27)*(1-life),ex=px-Math.cos(a)*trail,ey=py-Math.sin(a)*trail*.66;
  stroke(c,n%5?accent:colors.white,n%5?1:2.1,fade*(.28+rand*.55)*strength,p=>{p.moveTo(ex,ey);p.lineTo(px,py);});
 }
 // Fine fragments split away from the cut; the picture itself stays intact.
 for(let n=0;n<15;n++){const a=hash(n+seed*2)*TAU,r=age*(75+hash(n+91)*230),x1=x+Math.cos(a)*r,y1=y+Math.sin(a)*r*.6+age*age*115,size=(2+hash(n+17)*4)*(1-life);
  c.save();c.translate(x1,y1);c.rotate(a+age*5);c.globalAlpha=fade*.5*strength;c.fillStyle=n%3?accent:colors.white;c.beginPath();c.moveTo(-size,0);c.lineTo(0,-size*.25);c.lineTo(size,0);c.lineTo(0,size*.25);c.closePath();c.fill();c.restore();
 }
 c.restore();
}
function speedLines(c,t,amount,color,seed,origin={x:326,y:447}){
 c.save();c.globalCompositeOperation='screen';
 for(let n=0;n<38;n++){const a=hash(n+seed)*TAU,cycle=(t*(.5+hash(n*2)*.3)+hash(n+17))%1,r=315+cycle*240,len=35+hash(n+seed+5)*125;
  stroke(c,color,n%8?1:2.1,Math.sin(cycle*Math.PI)*amount*(.2+hash(n+4)*.45),p=>{p.moveTo(origin.x+Math.cos(a)*r,origin.y+Math.sin(a)*r*1.35);p.lineTo(origin.x+Math.cos(a)*(r+len),origin.y+Math.sin(a)*(r+len)*1.35);});
 }
 c.restore();
}
function edgeCracks(c,amount,seed,color){
 for(let side=0;side<2;side++)for(let n=0;n<3;n++){
  const x=side?W:0,y=140+n*219+hash(seed+n)*55,direction=side?-1:1;
  const points=Array.from({length:7},(_,i)=>({x:x+direction*i*(12+hash(n+seed)*4),y:y+i*12+(hash(i+n*19+seed)-.5)*37}));
  stroke(c,'#08000e',6,amount*.75,p=>{p.moveTo(points[0].x,points[0].y);points.slice(1).forEach(q=>p.lineTo(q.x,q.y));});
  stroke(c,color,.9,amount*.65,p=>{p.moveTo(points[0].x,points[0].y);points.slice(1).forEach(q=>p.lineTo(q.x,q.y));});
  for(const i of [2,4])stroke(c,color,.6,amount*.35,p=>{p.moveTo(points[i].x,points[i].y);p.lineTo(points[i].x+direction*18,points[i].y-24);p.lineTo(points[i].x+direction*29,points[i].y-31);});
 }
}
function claws(c,q,seed,strength){
 if(q<=0||q>=1)return;const head=ease(q/.44),fade=(1-q)**.8;
 c.save();c.globalCompositeOperation='screen';
 for(let n=0;n<3;n++){
  const points=[[654+n*36,285+n*25],[488+n*16,441+n*23],[315+n*28,537+n*21],[191+n*31,694+n*13]];
  ribbon(c,points,clamp(head-.5),head,8,colors.red,fade*.32*strength);
  ribbon(c,points,clamp(head-.46),head,1.6,'#ffbea7',fade*.8*strength);
 }
 impact(c,q-.32,327,541,.45*strength,seed,true);c.restore();
}
function enemy(c,t,u,intensity,seed,id){
 const hit=pulse(u,.38,.075)+pulse(u,.76,.045)*.6;
 c.save();c.globalCompositeOperation='source-over';
 // Heavy, irregular silhouettes stay on the perimeter, leaving the enemy's face legible.
 for(let side=0;side<2;side++)for(let n=0;n<5;n++){
  const x=side?W:0,sgn=side?-1:1,y=H+75-n*38,bend=45+hash(seed+n)*65,wind=Math.sin(t*1.7+n)*12;
  c.globalAlpha=intensity*(.18+n*.025);c.fillStyle=n%2?'#17051e':'#090412';c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+sgn*(bend+wind),y-130,x+sgn*22,y-330,x+sgn*(62+n*8),y-520);c.bezierCurveTo(x+sgn*12,y-300,x+sgn*(bend-20),y-140,x,y-45);c.closePath();c.fill();
  stroke(c,n%2?colors.violet:colors.red,1.6,intensity*.21,p=>{p.moveTo(x,y);p.bezierCurveTo(x+sgn*(bend+wind),y-130,x+sgn*22,y-330,x+sgn*(62+n*8),y-520);},8);
 }
 c.restore();
 glow(c,580,510,250,colors.red,intensity*(.13+hit*.11));glow(c,15,400,235,colors.violet,intensity*.13);
 speedLines(c,t,intensity*.63,'#e36482',seed,{x:365,y:350});
 c.save();c.globalCompositeOperation='screen';
 for(let n=0;n<46;n++){
  const z=hash(seed+n),life=(t*(.11+z*.14)+hash(n*3+seed))%1,side=n%2,px=side?530+Math.sin(life*4+n)*80:65+Math.sin(life*5+n)*70,py=850-life*970,size=1+z*2.4;
  c.globalAlpha=Math.sin(life*Math.PI)*intensity*(.15+z*.5);c.fillStyle=n%4?'#fc744d':'#d890ff';c.beginPath();c.ellipse(px,py,size*.55,size*2,-.4,0,TAU);c.fill();
 }
 c.restore();edgeCracks(c,intensity*(.3+hit*.55),seed,'#f17885');
 if(id==='enemy')claws(c,(u-.29)/.57,seed,intensity);
}
function pillar(c,x,width,t,amount,color){
 const g=c.createLinearGradient(x-width,0,x+width,0);g.addColorStop(0,'transparent');g.addColorStop(.35,color);g.addColorStop(.5,'#f1fcff');g.addColorStop(.65,color);g.addColorStop(1,'transparent');c.save();c.globalCompositeOperation='screen';c.globalAlpha=amount;c.fillStyle=g;c.beginPath();c.moveTo(x-width*.32,805);c.lineTo(x-width+Math.sin(t*.8)*11,-35);c.lineTo(x+width+Math.sin(t*.8)*11,-35);c.lineTo(x+width*.32,805);c.closePath();c.fill();c.restore();
}
function radiance(c,t,u,strength,seed,revival=false){
 const enter=ease(u/.36),power=strength*enter;
 c.save();c.globalCompositeOperation='screen';
 // Off-axis shafts and an illuminated lower silhouette, never a symbol stamped over a face.
 pillar(c,79,58,t,power*.2,colors.ice);pillar(c,518,65,t+.9,power*.16,colors.gold);pillar(c,145,24,t+.4,power*.1,colors.white);pillar(c,572,23,t+.7,power*.12,colors.ice);
 glow(c,214,536,285,colors.ice,power*.14);glow(c,255,689,192,colors.gold,power*.17);
 for(let n=0;n<3;n++){
  const shift=n*8;
  stroke(c,n?colors.ice:colors.white,n?1:2,power*(n?.22:.43),p=>{p.moveTo(218-shift,757);p.bezierCurveTo(32-shift,664,-16-shift,404,154-shift,302);},n?0:9);
 }
 for(let n=0;n<3;n++){
  const wave=(u*1.45+n*.34)%1,r=50+wave*265;
  stroke(c,n%2?colors.gold:colors.ice,1.2,power*(1-wave)*.52,p=>p.ellipse(286,738,r,r*.17,-.08,0,TAU),4);
 }
 for(let n=0;n<66;n++){
  const z=hash(n+seed),life=(t*(.16+z*.14)+hash(n*3+seed))%1,px=(n*173.61+Math.sin(t*.8+n)*13)%660-30,py=840-life*920,size=(.65+z*2)*(n%13?1:1.8),alpha=Math.sin(life*Math.PI)*power*(.25+z*.58);
  c.globalAlpha=alpha;c.fillStyle=n%5?colors.ice:colors.gold;c.beginPath();c.ellipse(px,py,size*.55,size*(1.6+z),.1,0,TAU);c.fill();
  if(n%13===0){stroke(c,colors.white,.9,alpha,p=>{p.moveTo(px-size*4,py);p.lineTo(px+size*4,py);p.moveTo(px,py-size*6);p.lineTo(px,py+size*6);},5);}
 }
 c.restore();
 if(revival){impact(c,u*2.5-.13,260,690,.8,seed,true);speedLines(c,t,power*.28,colors.ice,seed,{x:260,y:595});}
}
function spent(c,t,u,seed,intensity=1){
 c.save();c.globalCompositeOperation='screen';for(let n=0;n<18;n++){const life=(t*.06+hash(n+seed))%1,x=hash(n*9+seed)*W,y=510+life*310;stroke(c,'#8794a5',.8,Math.sin(life*Math.PI)*.13*intensity,p=>{p.moveTo(x,y);p.lineTo(x+3,y+8);});}c.restore();
}

export class BattleEffects {
 constructor(){this.canvas=typeof OffscreenCanvas==='function'?new OffscreenCanvas(W,H):Object.assign(document.createElement('canvas'),{width:W,height:H});this.ctx=this.canvas.getContext('2d');}
 render(ctx,{t=0,id='',u=0,pattern='defeat',win=false,sceneId='eclipse',reducedMotion=false}={}){
  if(!Number.isFinite(t)||!Number.isFinite(u))return;u=clamp(u);const c=this.ctx,seed=sceneSeed(sceneId),suppressed=pattern==='defeat'||pattern==='revival'&&t<17.8;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.save();
  if(reducedMotion){
   // The same cues remain readable without sweeps, impact flicker or racing particles.
   if(['warning','enemy','clash','crisis'].includes(id)){glow(c,580,510,240,colors.red,.13);glow(c,12,540,220,colors.violet,.1);}
   if(!suppressed&&['awakening','revival','strike','judgment'].includes(id))radiance(c,.35,.7,.3,seed);
   if(id==='resolve'&&win&&!suppressed)glow(c,240,660,300,colors.gold,.16);
   if(id==='silence'||id==='resolve'&&!win)spent(c,.1,u,seed,.2);
  }else{
  if(id==='warning')enemy(c,t,u,.23+u*.26,seed,id);
  if(id==='enemy')enemy(c,t,u,.75,seed,id);
  if(id==='clash')enemy(c,t,u,.15,seed,id);
  if(id==='crisis'){enemy(c,t,u,.16,seed,id);spent(c,t,u,seed);}
  if(id==='awakening'){if(suppressed){spent(c,t,u,seed);enemy(c,t,u,.18*(1-u),seed,id);}else radiance(c,t,u,pattern==='feint'?.76:1,seed);}
  if(id==='revival'&&!suppressed)radiance(c,t,u,1.1,seed,true);
  if(id==='strike'){
   // One directed blow is drawn by battle-direction at the persistent scar.
   spent(c,t,u,seed,.25);speedLines(c,t,pulse(u,.6,.13)*.32,colors.ice,seed,{x:386,y:438});
  }
  if(id==='judgment'){if(win&&!suppressed){radiance(c,t,.9,.4*(1-u),seed);impact(c,u*.8,352,483,.47*(1-u),seed,true);}else{spent(c,t,u,seed);edgeCracks(c,(1-u)*.4,seed,'#98517c');}}
  if(id==='silence')spent(c,t,u,seed,.3);
  if(id==='resolve'){if(win&&!suppressed){radiance(c,t,.85,.48,seed);glow(c,300,730,250,colors.gold,.13);}else spent(c,t,u,seed,.55);}
  }
  c.restore();
  // A soft compositing mask protects the central / upper-right eyes and facial detail.
  // No hard geometric clipping edge appears when a trail passes behind the face.
  c.save();c.globalCompositeOperation='destination-out';const protection=c.createRadialGradient(362,252,58,362,252,206);protection.addColorStop(0,'rgba(0,0,0,.94)');protection.addColorStop(.48,'rgba(0,0,0,.82)');protection.addColorStop(1,'transparent');c.fillStyle=protection;c.fillRect(128,0,470,475);c.restore();
  ctx.save();ctx.drawImage(this.canvas,0,0,W,H);ctx.restore();
 }
 dispose(){this.canvas.width=1;this.canvas.height=1;}
}
