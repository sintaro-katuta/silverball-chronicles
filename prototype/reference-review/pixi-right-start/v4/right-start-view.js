import {Container,Sprite,Texture} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
const P={ink:'#060d1a',deep:'#101e35',navy:'#1e3755',steel:'#45627d',silver:'#9fb5cc',light:'#e5eff2',gold:'#b48c45',goldLight:'#f3d88d',goldDark:'#655031',blue:'#287ec2',cyan:'#89e5ff'};
export class RightStartView{
 constructor(physics){this.physics=physics;this.origin={x:270,y:390};this.root=new Container();this.textures=[];this.balls=new Map();
  this.back=this.sprite(d=>this.paintCase(d));this.root.addChild(this.back);
  this.mechanism=this.sprite(()=>{});this.root.addChild(this.mechanism);
  this.rails=this.sprite(d=>this.paintRails(d));this.root.addChild(this.rails);
  this.ballTexture=this.texture(pixelSurface(19,19,c=>{const d=painter(c);d.diamond(9,9,9,P.ink);d.rect(3,3,13,13,P.silver);d.rect(2,6,15,7,P.silver);d.rect(6,2,7,15,P.silver);d.rect(5,4,8,6,P.light);d.rect(4,5,3,3,'#fff');d.rect(6,13,8,3,P.steel);d.rect(14,7,2,7,P.steel);}));this.render();
 }
 point(p){return {x:Math.round((p.x-this.origin.x)*2),y:Math.round((p.y-this.origin.y)*2)};}
 texture(c){const t=Texture.from(c);t.source.scaleMode='nearest';this.textures.push(t);return t;}
 sprite(paint){return new Sprite(this.texture(pixelSurface(256,320,c=>paint(painter(c)))));}
 paintCase(d){const p=P;d.rect(0,0,256,320,p.ink);
  // Tall silver beast relief and blue well: authored to reference sheet panel 09.
  d.rect(72,56,93,175,'#030810');d.rect(75,53,88,172,p.goldDark);d.rect(77,55,84,167,p.goldLight);d.rect(80,58,78,161,p.steel);d.rect(83,61,72,155,p.deep);
  d.rect(85,66,68,5,p.silver);d.rect(88,73,62,133,'#030a18');
  d.poly([[89,128],[97,137],[97,193],[89,205]],p.steel);d.poly([[150,128],[140,137],[140,193],[150,205]],p.navy);
  d.rect(99,137,39,53,'#061021');
  for(let i=0;i<5;i++)d.rect(101+i*7,151,2,38,i%2?p.blue:p.navy);
  d.poly([[97,193],[140,193],[151,207],[87,207]],p.blue);d.line(91,206,148,206,p.cyan,2);
  d.line(82,62,82,213,p.light);d.line(156,62,156,213,p.gold);d.line(82,214,157,214,p.goldLight,2);
  for(const x of [79,159])for(const y of [59,89,119,149,179,213]){d.diamond(x,y,4,p.goldDark);d.diamond(x,y-1,2,p.goldLight);}
  // The tiger is the centre of a cast ornamental assembly, not an isolated badge.
  const relief=(points,color=p.gold)=>{for(let i=1;i<points.length;i++){const [x,y]=points[i-1],[X,Y]=points[i];d.line(x+1,y+2,X+1,Y+2,'#020712',5);d.line(x,y,X,Y,p.goldDark,4);d.line(x,y,X,Y,color,2);d.line(x,y-1,X,Y-1,p.goldLight);}};
  for(const sign of [-1,1]){const path=pts=>pts.map(([x,y])=>[119+sign*x,y]);
   relief(path([[0,75],[12,68],[25,73],[32,67],[38,60]]));
   relief(path([[17,80],[29,78],[36,85],[34,97],[29,101],[26,97],[29,93]]));
   relief(path([[35,89],[38,108],[33,126],[35,141],[29,153],[19,158],[15,153]]));
   relief(path([[34,142],[37,158],[31,170],[32,187],[38,204]]));
   relief(path([[21,150],[13,156],[7,155],[0,165]]));
   d.poly(path([[29,144],[23,148],[22,159],[16,166],[24,163],[29,156]]),p.steel);
   d.line(119+sign*27,149,119+sign*23,159,p.light);
   d.diamond(119+sign*35,177,4,p.goldDark);d.diamond(119+sign*35,176,2,p.blue);
  }
  d.poly([[119,59],[124,70],[137,74],[125,81],[119,91],[113,81],[101,74],[114,70]],p.goldDark);
  d.poly([[119,61],[121,74],[133,74],[121,78],[119,87],[116,76],[106,74],[116,72]],p.goldLight);
  d.diamond(119,75,5,p.silver);d.diamond(119,75,3,p.blue);d.line(119,72,119,75,p.cyan);
  // Snarling cast-silver tiger: recessed eyes, low brows and a deep open jaw.
  const oval=(cx,cy,rx,ry,color)=>{for(let yy=-ry;yy<=ry;yy++){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-yy*yy/(ry*ry))));d.rect(cx-w,cy+yy,w*2+1,1,color);}};
  for(const x of [98,140]){oval(x,94,7,8,p.steel);oval(x,93,5,6,p.silver);oval(x,94,3,4,p.deep);}
  d.poly([[100,93],[110,87],[128,87],[139,93],[146,110],[144,124],[134,141],[119,148],[104,141],[94,124],[92,110]],'#35485d');
  d.poly([[103,94],[113,89],[125,89],[136,94],[143,109],[137,126],[126,139],[112,139],[101,126],[95,109]],'#71869b');
  d.poly([[109,92],[119,89],[125,94],[121,106],[116,110],[111,103]],'#a8bbc9');
  for(const sign of [-1,1]){const poly=(pts,color)=>d.poly(pts.map(([x,y])=>[119+sign*x,y]),color);
   // Swept cheek fur, modeled with narrow specular edges and deep recesses.
   poly([[19,103],[30,108],[26,116],[32,115],[28,125],[31,125],[22,137],[13,141],[12,121]],p.steel);
   poly([[21,107],[27,109],[22,116],[27,119],[21,126],[25,126],[18,134],[14,133],[18,119]],p.silver);
   poly([[25,111],[23,118],[20,121],[22,123],[18,129],[16,129],[19,118]],p.light);
   poly([[5,91],[17,94],[12,98],[4,96]],p.deep);
   poly([[9,100],[23,98],[20,103],[13,106]],p.deep);
   poly([[24,112],[29,112],[24,118],[18,120]],p.deep);
   poly([[25,125],[28,123],[23,132],[16,135]],p.deep);
   // Heavy brow slopes down toward the nose; eyes are narrow blue slits.
   poly([[3,105],[11,105],[22,103],[19,110],[8,117],[3,114]],p.deep);
   poly([[5,109],[10,107],[21,104],[16,111],[8,115]],'#7590a7');
   poly([[7,113],[18,107],[17,110],[9,115]],p.cyan);
   poly([[7,113],[12,110],[11,114],[8,115]],p.light);
   poly([[2,103],[8,100],[15,102],[24,101],[20,105],[8,109],[3,109]],p.silver);
   poly([[4,102],[8,100],[15,102],[21,101],[15,104],[7,105]],p.light);
   poly([[4,116],[10,117],[13,126],[5,127]],p.steel);
   // Raised whisker pads, shaded instead of large flat white circles.
   poly([[7,120],[15,121],[20,127],[16,132],[7,130],[3,126]],p.silver);
   poly([[9,120],[14,122],[17,125],[8,126],[5,124]],'#c4d0da');
   poly([[17,130],[22,128],[20,134],[14,138],[8,137]],p.steel);
   for(const yy of [125,128])d.rect(119+sign*14,yy,1,1,p.deep);
  }
  d.poly([[117,95],[121,95],[120,104],[119,109],[117,103]],p.deep);
  // Broad feline nose and dark snarling mouth, with visible upper canines.
  d.poly([[113,117],[119,114],[125,117],[127,121],[120,126],[118,126],[111,121]],p.steel);
  d.poly([[113,119],[125,119],[122,123],[116,123]],p.ink);d.line(114,118,123,118,p.light);
  d.poly([[107,131],[114,128],[119,130],[124,128],[131,131],[129,140],[124,145],[114,145],[109,140]],'#030711');
  d.poly([[108,130],[115,130],[112,143],[109,138]],p.light);
  d.poly([[123,130],[130,130],[129,138],[126,143]],p.light);
  d.rect(117,132,5,2,p.silver);
  d.poly([[114,143],[116,139],[118,143]],p.silver);d.poly([[121,143],[123,139],[125,143]],p.silver);
  d.line(109,142,114,147,p.steel,2);d.line(114,147,125,147,p.silver,2);d.line(125,147,130,142,p.steel,2);
  d.line(116,148,123,148,p.light);
  // Deep eye sockets and low, slanted brows give the relief a severe expression.
  for(const sign of [-1,1]){
   const path=pts=>pts.map(([x,y])=>[119+sign*x,y]);
   d.poly(path([[4,109],[10,108],[22,104],[18,112],[8,117],[4,115]]),'#030914');
   d.line(119+sign*7,114,119+sign*17,109,p.blue,3);
   d.line(119+sign*8,113,119+sign*16,110,p.cyan);
   d.rect(119+sign*9,112,1,1,p.light);
   d.poly(path([[3,106],[9,102],[15,103],[25,99],[20,105],[8,110]]),p.steel);
   d.line(119+sign*7,106,119+sign*21,102,p.silver);
   // Thin gold inlays join the temple to the surrounding scrollwork.
   relief(path([[29,101],[26,105],[29,111],[25,116]]),p.gold);
  }
  d.poly([[116,151],[122,151],[127,159],[122,166],[119,172],[115,164],[111,159]],p.goldDark);
  d.poly([[119,153],[123,159],[119,168],[115,159]],p.silver);
  d.poly([[119,156],[121,160],[119,164],[117,160]],p.blue);
  d.line(119,157,119,161,p.cyan);
  // The lower rim repeats the crest, visually tying the head to the blue well.
  relief([[87,208],[98,211],[108,206],[119,212],[130,206],[140,211],[151,208]]);


 }
 paintRails(d){for(const c of this.physics.colliders.filter(s=>s.role.startsWith('right-'))){const a=this.point(c.a),b=this.point(c.b),dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy),nx=-dy/n,ny=dx/n;
  d.line(a.x,a.y,b.x,b.y,'rgba(139,201,222,.18)',9);d.line(a.x,a.y,b.x,b.y,'rgba(15,37,53,.5)',3);
  d.line(a.x+nx*4,a.y+ny*4,b.x+nx*4,b.y+ny*4,'#9cbfc9');d.line(a.x-nx*4,a.y-ny*4,b.x-nx*4,b.y-ny*4,'#43677a');
 }}
 render(){const canvas=this.mechanism.texture.source.resource,c=canvas.getContext('2d');c.clearRect(0,0,256,320);const d=painter(c),p=P,mech=this.physics.rightChucker;
  this.pose={};for(const name of ['scoop','cover']){const {a:wa,b:wb}=mech[name],a=this.point(wa),b=this.point(wb);this.pose[name]={a,b};
   if(name==='cover'){d.poly([[a.x,a.y],[b.x,b.y],[b.x,b.y+19],[a.x,a.y+19]],p.steel);d.line(a.x,a.y+12,b.x,b.y+12,p.gold);}
   d.line(a.x+2,a.y+3,b.x+2,b.y+3,p.ink,8);d.line(a.x,a.y,b.x,b.y,p.goldDark,7);d.line(a.x,a.y,b.x,b.y,p.silver,5);d.line(a.x-1,a.y,b.x-1,b.y,p.light);d.line(a.x+1,a.y,b.x+1,b.y,mech.open?p.cyan:p.blue);
   d.diamond(a.x,a.y,4,p.goldLight);d.diamond(a.x,a.y,2,p.steel);
  }
  if(mech.open){d.rect(100,194,38,3,p.cyan);d.rect(105,191,28,2,p.blue);}
  this.mechanism.texture.source.update();const alive=new Set();for(const ball of this.physics.balls){alive.add(ball.id);let s=this.balls.get(ball.id);if(!s){s=new Sprite(this.ballTexture);s.anchor.set(.5);this.root.addChild(s);this.balls.set(ball.id,s);}const q=this.point(ball);s.position.set(q.x,q.y);s.visible=q.x>-10&&q.x<266&&q.y>-10&&q.y<330;}
  for(const [id,s]of this.balls)if(!alive.has(id)){s.destroy();this.balls.delete(id);}
 }
 diagnostics(){return {origin:this.origin,pocket:{...this.physics.pockets.find(p=>p.kind==='rush')},pose:this.pose,chucker:structuredClone(this.physics.rightChucker)};}
 dispose(){this.root.destroy({children:true});for(const t of this.textures)t.destroy(true);}
}
