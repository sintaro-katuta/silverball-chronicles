import {Container,Sprite,Texture} from 'pixi.js';

// Authoring grid: two integer pixels per existing board unit. Physics stays unrounded.
export const ATTACKER_GRID=Object.freeze({width:256,height:320,scale:2,offsetX:65,offsetY:71});
export const PALETTE=Object.freeze({ink:'#060d1a',deep:'#0d1b31',navy:'#183451',steel:'#355675',silver:'#9fb6ca',light:'#e6f2f4',gold:'#c29b4b',goldLight:'#f1d68a',goldDark:'#705126',blue:'#2874b1',cyan:'#65d5f6',shadow:'#091321'});
// Pixel primitives author source textures directly. No filtered reference image is used.
export function pixelSurface(width,height,paint){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;paint(c);return canvas;}
function painter(c){return {
 rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));},
 line(x0,y0,x1,y1,color,width=1){x0=Math.round(x0);x1=Math.round(x1);y0=Math.round(y0);y1=Math.round(y1);const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy;for(;;){c.fillStyle=color;c.fillRect(x0-Math.floor(width/2),y0-Math.floor(width/2),width,width);if(x0===x1&&y0===y1)break;const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}},
 diamond(x,y,r,color){c.fillStyle=color;for(let dy=-r;dy<=r;dy++){const w=r-Math.abs(dy);c.fillRect(x-w,y+dy,w*2+1,1);}}
};}
export class AttackerView {
 constructor(physics){
  this.physics=physics;this.pocket=physics.pockets.find(p=>p.kind==='bonus');
  this.origin={x:this.pocket.x-ATTACKER_GRID.offsetX,y:this.pocket.y-ATTACKER_GRID.offsetY};
  this.root=new Container();this.textures=[];this.balls=new Map();
  this.back=this.sprite((c,d)=>this.paintCase(c,d));this.root.addChild(this.back);
  this.rails=this.sprite((c,d)=>this.paintRails(d));this.root.addChild(this.rails);
  this.authoredGate={};this.gates={};for(const name of ['closed','open'])this.gates[name]=this.sprite((c,d)=>this.paintGate(d,name==='open'));
  this.root.addChild(this.gates.closed,this.gates.open);
  this.ballTexture=this.texture(pixelSurface(19,19,c=>{const d=painter(c),p=PALETTE;d.diamond(9,9,9,p.ink);d.rect(3,3,13,13,p.silver);d.rect(2,6,15,7,p.silver);d.rect(6,2,7,15,p.silver);d.rect(5,4,8,6,p.light);d.rect(4,5,3,3,'#ffffff');d.rect(6,13,8,3,p.steel);d.rect(14,7,2,7,p.steel);}));
  this.render();
 }
 point({x,y}){return {x:Math.round((x-this.origin.x)*2),y:Math.round((y-this.origin.y)*2)};}
 texture(canvas){const t=Texture.from(canvas);t.source.scaleMode='nearest';this.textures.push(t);return t;}
 sprite(paint){const canvas=pixelSurface(256,320,c=>paint(c,painter(c)));return new Sprite(this.texture(canvas));}
 paintCase(c,d){const p=PALETTE,{x,y}=this.point({x:this.pocket.x-this.pocket.w/2,y:this.pocket.y});
  d.rect(0,0,256,320,p.ink);
  // Quiet backing separates silver balls from the component.
  for(let i=0;i<8;i++){d.rect(6+i*31,0,1,320,p.deep);d.rect(0,16+i*40,256,1,p.deep);}
  d.rect(x-22,y-31,165,120,p.shadow);d.rect(x-18,y-27,157,112,p.goldDark);
  d.rect(x-16,y-25,153,108,p.silver);d.rect(x-12,y-21,145,100,p.steel);
  d.rect(x-8,y-17,137,92,p.deep);
  // Rear wall and bottom, always present behind the moving gate.
  d.rect(x,y-2,120,64,p.ink);d.rect(x+4,y+8,112,45,p.navy);d.rect(x+8,y+12,104,37,p.deep);
  for(let i=0;i<7;i++)d.rect(x+13+i*14,y+18,2,24,p.navy);
  d.rect(x+4,y+54,112,4,p.blue);d.rect(x+8,y+58,104,3,p.steel);
  // Silver chamfer and narrow gold inlays are authored pixel bands.
  for(const dx of [-14,126]){d.rect(x+dx,y-18,7,90,p.light);d.rect(x+dx+2,y-15,3,84,p.silver);}
  d.rect(x-12,y-22,144,3,p.light);d.rect(x-12,y+73,144,4,p.goldDark);d.rect(x-10,y+71,140,2,p.goldLight);
  d.rect(x-8,y-16,136,3,p.gold);d.rect(x+1,y-12,118,2,p.goldLight);
  for(const dx of [0,60,120]){d.diamond(x+dx,y-20,7,p.goldDark);d.diamond(x+dx,y-21,5,p.goldLight);d.diamond(x+dx,y-22,2,p.light);}
  d.diamond(x+60,y+72,7,p.gold);d.diamond(x+60,y+71,4,p.blue);d.diamond(x+60,y+70,2,p.cyan);
 }
 paintRails(d){const p=PALETTE;for(const segment of this.physics.colliders.filter(s=>s.role.startsWith('right-')||s.role==='out-right')){const a=this.point(segment.a),b=this.point(segment.b);d.line(a.x,a.y,b.x,b.y,p.steel,5);d.line(a.x,a.y,b.x,b.y,p.silver,3);d.line(a.x,a.y,b.x,b.y,p.light,1);}}
 paintGate(d,open){const p=PALETTE,left=this.pocket.x-this.pocket.w/2,y=this.pocket.y;
  // Exact existing Physics.updateGate states. No independent cosmetic tween.
  const a=this.point({x:left,y:open?y:y+15}),b=this.point({x:open?left:left+this.pocket.w,y:open?y+27:y-2});
  this.authoredGate[open?'open':'closed']={a,b};
  d.line(a.x,a.y,b.x,b.y,p.ink,7);d.line(a.x,a.y,b.x,b.y,p.goldDark,5);d.line(a.x,a.y,b.x,b.y,p.silver,3);d.line(a.x,a.y-1,b.x,b.y-1,p.light,1);
  d.line(a.x,a.y+1,b.x,b.y+1,open?p.cyan:p.gold,1);
  d.diamond(a.x,a.y,3,p.goldLight);d.diamond(a.x,a.y,1,p.steel);
 }
 render(){const open=this.physics.gate.open;this.gates.open.visible=open;this.gates.closed.visible=!open;const alive=new Set();
  for(const b of this.physics.balls){alive.add(b.id);let s=this.balls.get(b.id);if(!s){s=new Sprite(this.ballTexture);s.anchor.set(.5);this.root.addChild(s);this.balls.set(b.id,s);}const pt=this.point(b);s.position.set(pt.x,pt.y);s.visible=pt.x>=-10&&pt.x<=266&&pt.y>=-10&&pt.y<=330;}
  for(const[id,s]of this.balls)if(!alive.has(id)){s.destroy();this.balls.delete(id);}
 }
 diagnostics(){return {authoredGate:this.authoredGate[this.physics.gate.open?'open':'closed'],origin:this.origin,pocket:{...this.pocket},gate:{open:this.physics.gate.open,a:this.point(this.physics.gate.a),b:this.point(this.physics.gate.b)},grid:ATTACKER_GRID};}
 dispose(){this.root.destroy({children:true});for(const t of this.textures)t.destroy(true);this.balls.clear();}
}
