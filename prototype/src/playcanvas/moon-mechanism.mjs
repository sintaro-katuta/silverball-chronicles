import {Entity} from 'playcanvas';
import {moonMechanismState} from './moon-mechanism-state.mjs';

/** Decorative assembly, owned (including generated geometry/materials) by Cabinet. */
export class MoonMechanism {
 constructor(cabinet){
  this.c=cabinet;this.root=cabinet.group('moon-eclipse-mechanism');this.halves=[];this.doors=[];
  this.light=cabinet.material('moon-internal-light','#c3f5ff',.25,.64);this.light.emissive.fromString('#73d8f0');
  this.coreLight=cabinet.material('announced-round-reactor','#ffe4a5',.2,.65);this.coreLight.emissive.fromString('#ffbc52');
  for(const side of [-1,1]){
   const root=new Entity(side<0?'moon-left':'moon-right',cabinet.app);this.root.addChild(root);
   const start=side<0?90:-90,end=start+180;
   cabinet.arc('moon-armour',0,0,49,49,start,end,13,63,12,cabinet.m.black,root);
   cabinet.arc('moon-chrome',0,0,48,48,start,end,5,76,4,cabinet.m.chrome,root);
   cabinet.arc('moon-luminous-channel',0,0,41,41,start+3,end-3,3,77,4,this.light,root);
   cabinet.arc('moon-inner-blade',0,0,36,36,start,end,2,75,5,cabinet.m.gold,root);
   for(let i=0;i<5;i++){
    const a=(start+18+i*36)*Math.PI/180,x=Math.cos(a)*44,y=Math.sin(a)*44;
    cabinet.sphere('moon-fastener',x,y,82,3,3,2,cabinet.m.steel,root);
   }
   this.halves.push({side,root});
  }
  // Below the LCD: all ten sealed cells exist physically, their light follows only announced rounds.
  this.reactor=new Entity('announced-round-engine',cabinet.app);this.root.addChild(this.reactor);
  this.reactor.setLocalPosition(.5,-157,0);
  cabinet.box('reactor-seat',0,0,117,22,14,9,cabinet.m.black,5,this.reactor);
  this.cells=[];
  for(let i=0;i<10;i++)this.cells.push(cabinet.box('reactor-cell',-45+i*10,0,5,10,25,3,this.coreLight,1,this.reactor));
  for(const side of [-1,1]){
   const door=new Entity(side<0?'reactor-left-shutter':'reactor-right-shutter',cabinet.app);this.reactor.addChild(door);
   cabinet.box('reactor-shutter',side*27,0,54,19,30,6,cabinet.m.steel,4,door);
   cabinet.line('reactor-shutter-inlay',[[side*3,0],[side*45,0]],1.8,37,cabinet.m.gold,door);
   this.doors.push({side,root:door});
  }
  this.update({},null,null);
 }
 update(game,p,beat){
  const state=moonMechanismState(game,p,beat);this.state=state;
  for(const {side,root} of this.halves){
   root.setLocalPosition(.5+side*(125*(1-state.closure)+state.opening*24),231-state.closure*50,0);
   root.setLocalEulerAngles(0,side*state.opening*18,side*state.angle);
   // Parked blades tuck behind the upper corners; only the decision has the full silhouette.
   const size=.57+.43*state.closure;root.setLocalScale(size,size,size);
  }
  // Use the game clock, never wall time; repeated paused renders have delta zero.
  const now=Number(game.time)||0,dt=Math.max(0,Math.min(.1,now-(this.lastTime??now)));this.lastTime=now;
  if(!game.jackpot)this.openAmount=0;
  else this.openAmount=(this.openAmount||0)+(state.bonusOpen-(this.openAmount||0))*Math.min(1,dt*6);
  for(const {side,root} of this.doors)root.setLocalPosition(side*this.openAmount*29,0,0);
  const announced=game.jackpot?Math.max(0,Math.min(10,game.jackpot.displayRounds||4)):0;
  this.cells.forEach((cell,i)=>cell.enabled=i<announced);
  if(this.lastLight!==state.light){this.lastLight=state.light;this.light.emissiveIntensity=state.light;this.light.update();}
  if(this.lastCore!==state.bonusLight){this.lastCore=state.bonusLight;this.coreLight.emissiveIntensity=state.bonusLight;this.coreLight.update();}
 }
}
