import {Entity,StandardMaterial,Color} from 'playcanvas';
import {studio} from '../playcanvas/runtime.js';
export class YozoraCabinet {
 constructor(host){
  this.view=studio(host);this.app=this.view.app;this.app.autoRender=true;this.materials=[];this.balls=[];this.time=0;
  const material=(hex,metal=0,glow=0)=>{const m=new StandardMaterial();m.diffuse=new Color().fromString(hex);m.useMetalness=true;m.metalness=metal;m.gloss=.75;if(glow){m.emissive=new Color().fromString(hex);m.emissiveIntensity=glow;}m.update();this.materials.push(m);return m;};
  this.chrome=material('#d5dfed',.95);this.black=material('#101222',.65);this.purple=material('#6d31cd',.6,.3);this.ice=material('#3ab8e0',.5,.35);this.gold=material('#e6b649',.8,.1);this.dark=material('#02030a',.1);this.ballMat=material('#ffffff',1);
  const shape=(name,type,x,y,z,sx,sy,sz,m,parent=this.app.root)=>{const e=new Entity(name,this.app);e.addComponent('render',{type,material:m});e.setLocalPosition(x,y,z);e.setLocalScale(sx,sy,sz);parent.addChild(e);return e;};this.shape=shape;
  shape('housing','box',0,0,-25,438,710,54,this.black);
  shape('glass field','box',0,18,5,386,557,8,this.dark);
  for(const sign of [-1,1]){
   shape('silver edge','box',sign*215,0,12,11,691,28,this.chrome);
   shape('purple light','box',sign*204,15,29,5,649,8,this.purple);
   for(let i=0;i<9;i++){const fin=shape('faceted frame','box',sign*(186+4*Math.sin(i)),252-i*57,24,24,52,30,i%2?this.black:this.chrome);fin.setLocalEulerAngles(0,0,sign*10);}
   const speaker=shape('speaker surround','cylinder',sign*162,248,42,66,13,66,this.chrome);speaker.setLocalEulerAngles(90,0,0);
   const cone=shape('speaker','cylinder',sign*162,248,51,55,6,55,this.dark);cone.setLocalEulerAngles(90,0,0);
   for(let k=0;k<6;k++)shape('speaker grille','box',sign*162,230+k*7,56,43,1.3,2,this.black);
  }
  shape('crown','box',0,313,12,310,50,40,this.black);
  shape('crown silver','box',0,287,26,360,8,16,this.chrome);
  shape('top rose','box',0,198,38,233,12,17,this.ice).setLocalEulerAngles(0,0,7);
  shape('top crystal','box',30,213,32,95,15,20,this.purple).setLocalEulerAngles(0,0,-12);
  for(let i=0;i<52;i++){let a=(i/51)*Math.PI*1.84+.25;const e=shape('launch rail','box',Math.sin(a)*189,Math.cos(a)*259-9,26,5,29,5,this.chrome);e.setLocalEulerAngles(0,0,-a*180/Math.PI-90);}
  for(let row=0;row<6;row++)for(let col=0;col<6;col++){
   const x=-150+col*24+(row%2)*12,y=-107-row*18;
   if(Math.hypot(x+120,y+178)<47)continue;
   shape('pin','sphere',x,y,31,4,4,5,this.chrome);
  }
  for(let row=0;row<8;row++)for(let col=0;col<2;col++)shape('left pins','sphere',-171+col*16,154-row*29,31,4,4,5,this.chrome);
  this.wheel=new Entity('FAIR START six pocket rotor',this.app);this.wheel.setLocalPosition(-119,-178,34);this.app.root.addChild(this.wheel);
  const disc=shape('rotor','cylinder',0,0,0,77,9,77,this.chrome,this.wheel);disc.setLocalEulerAngles(90,0,0);
  for(let i=0;i<6;i++){let a=i*Math.PI/3;const hole=shape('pocket '+i,'cylinder',Math.sin(a)*26,Math.cos(a)*26,8,16,3,16,i%3===0?this.gold:this.dark,this.wheel);hole.setLocalEulerAngles(90,0,0);}
  shape('plus start','box',0,-225,29,37,20,25,this.chrome);shape('plus opening','box',0,-216,44,22,5,5,this.dark);
  shape('attacker casing','box',136,-183,29,69,36,23,this.chrome);
  this.gate=shape('attacker door','box',136,-180,44,57,23,6,this.ice);
  shape('lower tray','box',0,-300,49,393,55,78,this.black);shape('tray lip','box',0,-331,90,397,10,15,this.chrome);
  const push=shape('push button','cylinder',0,-282,95,80,22,80,this.chrome);push.setLocalEulerAngles(90,0,0);
  const handle=shape('handle','cylinder',151,-287,101,61,31,61,this.black);handle.setLocalEulerAngles(90,0,0);
  this.swords=[];
  for(const [i,x] of [-1,1].entries()){
   const root=new Entity('decorative sword',this.app);root.setLocalPosition(x*156,28,53);root.setLocalEulerAngles(0,0,x*-16);this.app.root.addChild(root);
   shape('blade','box',0,0,0,10,209,9,i?this.gold:this.ice,root);shape('guard','box',0,-94,4,43,8,13,this.chrome,root);shape('grip','box',0,-116,0,13,34,13,this.black,root);this.swords.push(root);
  }
  this.observer=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();this.view.resize(width,height);});this.observer.observe(host);
 }
 spawn(shot){const entity=this.shape('ball','sphere',-180,-240,54,6,6,6,this.ballMat);this.balls.push({shot,entity,t:0});}
 update(dt,game){this.time+=dt;this.wheel.setLocalEulerAngles(0,0,this.time*70);this.gate.setLocalEulerAngles(game.bonus?75:0,0,0);
  const reach=game.active?.reach&&game.active.elapsed>6,celebrate=!!game.bonus;
  this.swords.forEach((e,i)=>e.setLocalEulerAngles(0,0,(i?1:-1)*(reach?-48:celebrate?-27:-16)));
  for(const ball of this.balls){ball.t+=dt;const t=ball.t;let x,y;
   if(t<1.1){const a=t/1.1*Math.PI;x=-186*Math.cos(a);y=-230+480*Math.sin(a/2);}
   else{const u=Math.min(1,(t-1.1)/1.7),r=ball.shot.route,right=r==='attacker'||r==='right';const endX=r==='fair'?-119:r==='plus'?0:right?136:40;
    x=186*(1-u)+endX*u+(right?8:35)*Math.sin(u*13+ball.shot.id)*Math.sin(Math.PI*u);y=250-(right?430:r==='fair'?428:485)*u;}
   ball.entity.setLocalPosition(x,y,62);
   if(t>=2.8){game.receive(ball.shot);ball.entity.destroy();ball.done=true;}
  }this.balls=this.balls.filter(b=>!b.done);
 }
 clear(){for(const b of this.balls)b.entity.destroy();this.balls=[];this.time=0;}
 destroy(){this.observer.disconnect();this.clear();this.view.destroy();this.materials.forEach(m=>m.destroy());}
}
