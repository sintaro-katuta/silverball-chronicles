import {pocketCrossing} from './pocket-sensor.js';
// All positions are board-space pixels. Motion uses a single gravity/contact solver.
export const BALL_RADIUS=4.6;
export const GRAVITY=690;
export const PIN_ROLES={heso:'ヘソ釘（命釘）',jump:'ジャンプ釘',michi:'道釘',yori:'寄り釘',spread:'振り分け釘',prize:'一般入賞口周辺'};
export const LAUNCHER=Object.freeze({origin:Object.freeze({x:29,y:652}),axis:Object.freeze({x:0,y:-1}),mouth:Object.freeze({x:29,y:632}),innerWallX:36,outerWallX:22,throatWidth:11.4});
export const LAUNCH_LANE=[LAUNCHER.origin,{x:29,y:155}]; // Diagnostic reference, never a motion path.
export const RIGHT_LANE=[{x:365,y:200},{x:365,y:581}];
export function attackerOpen(game){const j=game.jackpot;return !!j&&j.gap<=0&&j.count<(game.machine?.countLimit??10);}
export function rightStartOpen(game){return typeof game?.electricChuckerOpen==='boolean'?game.electricChuckerOpen&&!game.jackpot:!!game?.rush&&!game.jackpot;}
const point=(x,y)=>({x,y});
const segment=(x1,y1,x2,y2,material='resin',role='',restitution=.08,r=1.3)=>({a:point(x1,y1),b:point(x2,y2),r,material,role,restitution});
// One left-side barrel. Its exit and upper rubber stop are physical surfaces;
// every power uses these same colliders and differs only in initial velocity.
// A shallower kicker and a lower inner lip clear the stream before it
// falls back into incoming shots; gravity and launch cadence stay unchanged.
function makeLaunchRails(){
 return [
  segment(LAUNCHER.innerWallX,680,LAUNCHER.innerWallX,200,'rail','launch-inner',.05),
  segment(LAUNCHER.innerWallX,200,39,190,'rail','launch-inner-exit',.05),
  segment(LAUNCHER.outerWallX,680,LAUNCHER.outerWallX,200,'rail','launch-outer',.05),
  segment(LAUNCHER.outerWallX,200,18,165,'rail','launch-outer-exit',.05),
  segment(18,165,68,90,'rail','launch-kicker',.95),
  segment(379,10,379,155,'rubber','upper-reflector',.05),
  segment(20,10,402,10,'rail','board-top',.4)
 ];
}
export function makePins(course=0,pegSeed=0){
 const pins=[];const add=(role,x,y)=>pins.push({x:Math.max(56,x),y,r:2.1,id:pins.length,role});
 const shift=[0,-8,8][course]??0, heso=210+shift, halfGap=[10.5,10,9.5][course]??10.5;
 add('heso',heso-halfGap,522);add('heso',heso+halfGap,522);
 add('jump',heso-27,507);add('jump',heso+27,507);
 // Each road has one deliberate spill rather than an unbroken collecting wall.
 for(const side of [-1,1])for(let n=0;n<6;n++){
  if(n===([3,2,4][course]??3))continue;
  add('michi',heso+side*(105-n*17),429+n*14);
 }
 const yoriX=[75,63,87][course]??75;
 for(let n=0;n<3;n++){add('yori',yoriX-38+n*13,291+n*22);add('yori',yoriX+40-n*12,291+n*22);}
 add('yori',yoriX-40,354);add('yori',yoriX+39,360);
 // Orderly dividers feed outer, windmill and inner routes. Course offsets preserve spacing.
 for(const [cx,cy] of [[85+shift,170],[205+shift,170],[62,240],[158+shift,240],[263,240]]){
  add('spread',cx,cy);for(const side of [-1,1])for(let i=1;i<=2;i++)add('spread',cx+side*i*18,cy+i*15);
 }
 for(const [x,y] of [[159,306],[180,329],[201,352],[156,386],[180,403],[245,366],[267,389]])add('spread',x+shift,y);
 for(const x of [Math.max(67,67+shift),139-shift,268+shift]){add('prize',x-18,565);add('prize',x,584);add('prize',x+18,603);}
 // Keep the same nail count and roles per model. A stable per-unit seed gives
 // repeated cabinets their own small, persistent physical layout variation.
 if(pegSeed){
  let state=(Math.floor(Number(pegSeed))||1)>>>0;
  const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
  for(const pin of pins){pin.x=Math.max(56,pin.x+(random()*2-1)*2.2);pin.y+=(random()*2-1)*2.2;}
 }
 return pins;
}
// Circle against a capsule. No directional nudge or velocity replacement is used.
export function collideSegment(b,a,c,restitution=.57,surfaceVelocity={x:0,y:0},radius=1.3){
 const reach=b.r+radius;if(b.x<Math.min(a.x,c.x)-reach||b.x>Math.max(a.x,c.x)+reach||b.y<Math.min(a.y,c.y)-reach||b.y>Math.max(a.y,c.y)+reach)return 0;
 const dx=c.x-a.x,dy=c.y-a.y,len2=dx*dx+dy*dy;
 const u=Math.max(0,Math.min(1,((b.x-a.x)*dx+(b.y-a.y)*dy)/(len2||1)));
 const px=a.x+u*dx,py=a.y+u*dy,ox=b.x-px,oy=b.y-py,d=Math.hypot(ox,oy),min=b.r+radius;
 if(d>=min)return 0;
 let nx,ny;if(d>1e-9){nx=ox/d;ny=oy/d;}else{const length=Math.sqrt(len2)||1;nx=-dy/length;ny=dx/length;if(b.vx*nx+b.vy*ny>0){nx=-nx;ny=-ny;}}
 b.x=px+nx*min;b.y=py+ny*min;
 const v=(b.vx-surfaceVelocity.x)*nx+(b.vy-surfaceVelocity.y)*ny;
 if(v>=0)return 0;b.vx-=(1+restitution)*v*nx;b.vy-=(1+restitution)*v*ny;return -v;
}
function collidePin(b,p){
 const dx=b.x-p.x,dy=b.y-p.y,min=b.r+p.r;if(Math.abs(dx)>=min||Math.abs(dy)>=min)return false;const d=Math.hypot(dx,dy);
 if(d>=min)return false;
 const nx=d>1e-9?dx/d:0,ny=d>1e-9?dy/d:-1;b.x=p.x+nx*min;b.y=p.y+ny*min;
 const v=b.vx*nx+b.vy*ny;if(v>=0)return false;b.vx-=1.46*v*nx;b.vy-=1.46*v*ny;return true;
}
function pairContact(a,b){
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r;if(d>=min)return false;
 const nx=d>1e-9?dx/d:1,ny=d>1e-9?dy/d:0,overlap=(min-d)/2;
 a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
 const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
 if(relative<0){const impulse=-(1+.55)*relative/2;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}
 return true;
}
export class Physics {
 constructor(course=0,pegSeed=0){
 this.course=course;this.pegSeed=pegSeed;this.launcher=LAUNCHER;this.pins=makePins(course,pegSeed);this.balls=[];this.nextId=1;this.time=0;this.normalPower=.5;this.bonusPower=1;this.launchTolerance=.007;
 this.flow=[];this.roleFlow=Object.fromEntries([...Object.keys(PIN_ROLES),'windmill'].map(role=>[role,{contacts:0,balls:0,start:0,normal:0,bonus:0,rush:0,out:0,returned:0}]));this.routeFlow={};this.metrics={spawned:0,left:0,right:0,start:0,normal:0,bonus:0,rush:0,out:0,returned:0,ballContacts:0,stalled:0};
 this.mechanisms=[{kind:'windmill',x:[75,63,87][course]??75,y:384,angle:.28,omega:0,radius:18,armRadius:1.3},{kind:'windmill',x:290,y:405,angle:-.3,omega:0,radius:17,armRadius:1.3}];
 this.colliders=[
  ...makeLaunchRails(),
  segment(340,200,346.313,426,'resin','right-inner-upper',.08),segment(347.486,468,350,558,'resin','right-inner-lower',.08),segment(379,155,379,665,'resin','right-outer',.08),
  segment(60,640,176,668,'resin','out-left',.05),segment(379,635,244,668,'resin','out-right',.05)
 ];
 const shift=[0,-8,8][course]??0;
 this.pockets=[{x:Math.max(67,67+shift),y:617,w:19,kind:'normal',id:0},{x:139-shift,y:617,w:18,kind:'normal',id:1},{x:268+shift,y:617,w:19,kind:'normal',id:2},{x:210+shift,y:535,w:20,kind:'start',id:4},{x:359,y:581,w:60,kind:'bonus',id:5},{x:330,y:477,w:34,kind:'rush',id:6}];
 for(const p of this.pockets.filter(p=>p.kind!=='bonus'&&p.kind!=='rush'))for(const side of [-1,1])this.colliders.push(segment(p.x+side*p.w/2,p.y,p.x+side*p.w/2,p.y+15,'pocket',`${p.kind}-rim`,.15,1));
 this.gate=segment(329,596,389,579,'gate','attacker-door',.08,1.4);this.gate.open=false;
 this.rightChucker={open:false,scoop:segment(347.486,468,346.313,426,'gate','right-chucker-scoop',.06,1.3),cover:segment(313,480,347,470,'gate','right-chucker-cover',.08,1.3)};
 this.outlet={x:210,y:668,w:68};this.returnOutlet={x:this.launcher.origin.x,y:668,w:22};this.rails=[];this.launchLane=LAUNCH_LANE;this.rightLane=RIGHT_LANE;
 }
 // Hold both paid and free shots before stock is consumed. Returning balls
 // need the single-file barrel to drain before another upward shot enters it.
 // Balls beyond the straight barrel are already leaving toward the playfield,
 // so their downward motion must not trigger a false launch hold.
 canLaunch(){
 const {origin,outerWallX,innerWallX}=this.launcher;
 return !this.balls.some(b=>!b.dead&&(Math.hypot(b.x-origin.x,b.y-origin.y)<b.r+(this.ballRadius??BALL_RADIUS)+2||
  (b.y>200&&b.y<680&&b.x>outerWallX&&b.x<innerWallX&&b.vy>=0)));
 }
 spawn(data,power=.56,angle=0){
 if(!data)return null;power=Math.max(0,Math.min(1,power));angle=Math.max(-1,Math.min(1,angle));
 // Small spring-power tolerance acts only at launch; no later trajectory corrections.
 const speed=(635+465*power+(this.launchSpeedOffset??0))*(1+this.launchTolerance*Math.sin(this.time*17.17)),theta=angle*.012;
 const b={...data,id:this.nextId++,x:this.launcher.origin.x,y:this.launcher.origin.y,vx:(this.launcher.axis.x*Math.cos(theta)-this.launcher.axis.y*Math.sin(theta))*speed,vy:(this.launcher.axis.x*Math.sin(theta)+this.launcher.axis.y*Math.cos(theta))*speed,r:this.ballRadius??BALL_RADIUS,age:0,power,angle,hits:data.hits??0,contactCount:0,observedSide:null,contactRoles:[]};
 this.balls.push(b);this.metrics.spawned++;return b;
 }
 updateGate(game){const rushOpen=rightStartOpen(game),chucker=this.rightChucker;chucker.open=rushOpen;chucker.scoop.b=point(rushOpen?377:346.313,rushOpen?440:426);chucker.cover.a=point(313,rushOpen?477:480);chucker.cover.b=point(rushOpen?313:347,rushOpen?497:470);const open=attackerOpen(game);this.gate.open=open;this.gate.a=point(329,open?581:596);this.gate.b=point(open?329:389,open?608:579);}
 flowSummary(time=this.time){const recent=this.flow.filter(f=>time-f.time<4);return {left:recent.filter(f=>f.side==='left').length,right:recent.filter(f=>f.side==='right').length};}
 diagnostics(){return {...this.metrics,roleFlow:this.roleFlow,routeFlow:this.routeFlow,inFlight:this.balls.length,flow:this.flowSummary(),stalled:this.balls.filter(b=>b.age>12&&Math.hypot(b.vx,b.vy)<8).length};}
 recordRole(b,role){
  const stats=this.roleFlow[role];if(!stats)return;stats.contacts++;b.contactRoles??=[];
  if(!b.contactRoles.includes(role)&&b.contactRoles.length<7){b.contactRoles.push(role);stats.balls++;}
 }
 recordOutcome(b,outcome){
  if(b.recordedOutcome)return;b.recordedOutcome=outcome;
  for(const role of b.contactRoles??[])if(this.roleFlow[role])this.roleFlow[role][outcome]++;
  let key=`${b.observedSide??'unclassified'}:${(b.contactRoles??[]).join('>')||'no-pin'}`;
  if(!this.routeFlow[key]&&Object.keys(this.routeFlow).length>=64)key='other';
  this.routeFlow[key]??={start:0,normal:0,bonus:0,rush:0,out:0,returned:0};this.routeFlow[key][outcome]++;
 }
 // Shared collision solver is also used to forecast arrivals; prediction never changes motion.
 advanceBall(b,dt,{predict=false,game=null}={}){
 const previous={x:b.x,y:b.y};if(this.separateLaunchPlane&&b.x>80&&b.y<300)b.leftLaunchPlane=true;b.vy+=GRAVITY*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
 for(const c of this.colliders){if(c.active===false)continue;if(this.separateLaunchPlane&&b.leftLaunchPlane&&['launch-inner','launch-outer'].includes(c.role))continue;const impulse=collideSegment(b,c.a,c.b,c.restitution,undefined,c.r);if(impulse&&!predict){b.contactCount++;b.lastContact=c.role;}}
 for(const c of [this.gate,this.rightChucker.scoop,this.rightChucker.cover]){if(c.active===false)continue;const impulse=collideSegment(b,c.a,c.b,c.restitution,undefined,c.r);if(impulse&&!predict){b.contactCount++;b.lastContact=c.role;}}
 for(const p of this.pins)if(!(this.separateLaunchPlane&&!b.leftLaunchPlane)&&collidePin(b,p)){
  if(!predict){b.hits++;b.contactCount++;b.lastContact=p.role;this.recordRole(b,p.role);
   if(p.role==='jump'&&!b.extra&&!b.split&&game?.rng()<game.value('split')/100){b.split=true;this.additions.push({...b,id:this.nextId++,x:b.x+b.r*2.05,extra:true,vx:-b.vx,contactRoles:[],recordedOutcome:null});}
  }
 }
 for(const m of this.mechanisms){
  if(Math.hypot(b.x-m.x,b.y-m.y)>m.radius+b.r+2)continue;
  for(let arm=0;arm<4;arm++){
   const theta=m.angle+arm*Math.PI/2,end={x:m.x+Math.cos(theta)*m.radius,y:m.y+Math.sin(theta)*m.radius};
   const oldVx=b.vx,oldVy=b.vy,impulse=collideSegment(b,m,end,.3,{x:-(b.y-m.y)*m.omega,y:(b.x-m.x)*m.omega},1.3);
   if(impulse&&!predict){this.recordRole(b,'windmill');const torque=(b.x-m.x)*(oldVy-b.vy)-(b.y-m.y)*(oldVx-b.vx);m.omega=Math.max(-7,Math.min(7,m.omega+torque*.0005));m.lastHit=game?.time;game?.emit?.('mechanism',{kind:m.kind});}
  }
 }
 return previous;
 }
 predictArrival(ball,game=null){
 if(game)this.updateGate(game);
 const b={...ball};for(let n=0;n<2400;n++){
  const previous=this.advanceBall(b,1/600,{predict:true});
  for(const p of this.pockets){
   if((p.kind==='rush'&&!rightStartOpen(game))||(p.kind==='bonus'&&game&&!attackerOpen(game)))continue;
   const crossing=pocketCrossing(previous,b,p);if(crossing)return {kind:p.kind,seconds:(n+crossing.t)/600,x:crossing.x};
  }
  if(b.y>675||b.x<0||b.x>415)return {kind:'out',seconds:(n+1)/600};
 }
 return {kind:'unknown',seconds:4};
 }
 shouldWaitToFire(game,power=this.bonusPower,angle=0){
 const j=game.jackpot,rush=game.rush;if(!j&&!rush)return false;
 if(j&&!attackerOpen(game))return true;if(!j&&game.canAcceptRushDraw===false)return true;
 const kind=j?'bonus':'rush',state=`${kind}:${j?.round??rush?.remaining??0}:${j?.gap??0}`;
 const incoming=this.balls.reduce((count,b)=>{
  if(b.dead)return count;
  // Dense streams collide: an isolated trajectory prediction may temporarily
  // say OUT before a later contact returns the ball to the right pocket.
  // Keep a right-play shot reserved until its actual entry or exit.
  if(b.right)return count+1;
  if(!b.prediction||b.predictionState!==state||this.time-b.predictionAt>.15){b.prediction=this.predictArrival(b,game);b.predictionAt=this.time;b.predictionState=state;}
  return count+(b.prediction.kind===kind?1:0);
 },0);
 if(j)return j.count+incoming>=(game.machine?.countLimit??10);
 const active=game.activeDraw?.mode==='rush'?1:0,pending=(game.rushHolds?.length??0)+active;
 const immediate=!game.spinActive&&!game.presentation&&!game.jackpot&&(game.stopTimer??0)<=0;
 const capacity=(game.machine?.holdLimit??5)+(active||immediate?1:0);
 return pending+incoming>=Math.min(capacity,rush.remaining??0);
 }

 step(dt,game){
 if(!(dt>0)||!Number.isFinite(dt)||(game.phase&&game.phase!=='playing'))return;this.additions=[];this.updateGate(game);
 // A ball travels at most half its radius per substep, including unusually fast debug balls.
 const maxSpeed=Math.max(this.ballRadius?600:1100,...this.balls.map(b=>Math.hypot(b.vx,b.vy)+GRAVITY*dt));
 const steps=Math.max(1,Math.ceil(dt*Math.max(600,maxSpeed/((this.ballRadius??BALL_RADIUS)*.45)))),h=dt/steps;
 integration: for(let step=0;step<steps;step++){
  this.time+=h;this.updateGate(game);
  for(const m of this.mechanisms){m.omega*=Math.exp(-h*.7);m.angle+=m.omega*h;}
  for(const b of this.balls){
   if(b.dead)continue;b.age+=h;const previous=this.advanceBall(b,h,{game});
   if(!b.observedSide&&b.vy>0&&previous.y<210&&b.y>=210&&b.x>40&&b.x<379){b.observedSide=b.x>=344?'right':'left';this.metrics[b.observedSide]++;this.flow.push({side:b.observedSide,time:game.time??this.time,ballId:b.id,power:b.power});if(this.flow.length>100)this.flow.shift();}
   for(const p of this.pockets){
    if((p.kind==='bonus'&&!attackerOpen(game))||(p.kind==='rush'&&!rightStartOpen(game)))continue;
    if(pocketCrossing(previous,b,p)){game.hit(b,p.kind,p.id);this.recordOutcome(b,p.kind);this.metrics[p.kind]++;b.dead=true;if(game.phase&&game.phase!=='playing')break integration;break;}
   }
   if(!b.dead&&b.y>675){const returned=Math.abs(b.x-this.returnOutlet.x)<=this.returnOutlet.w/2;if(returned){if(!b.extra){game.addStock?.(1,'returned');game.emit?.('return');}}else game.lose(b);this.recordOutcome(b,returned?'returned':'out');this.metrics[returned?'returned':'out']++;b.dead=true;}
  }
  for(let i=0;i<this.balls.length;i++)for(let j=i+1;j<this.balls.length;j++)if(!this.balls[i].dead&&!this.balls[j].dead&&pairContact(this.balls[i],this.balls[j])){this.metrics.ballContacts++;this.balls[i].prediction=null;this.balls[j].prediction=null;}
  // Resolve static surfaces after dense-stream separation as well: otherwise
  // neighbouring balls can push one another through a thin guide into its body.
  if(this.separateLaunchPlane)for(let pass=0;pass<2;pass++)for(const b of this.balls)if(!b.dead&&b.leftLaunchPlane)for(const c of this.colliders){
   if(c.active===false||['launch-inner','launch-outer'].includes(c.role))continue;
   collideSegment(b,c.a,c.b,c.restitution,undefined,c.r);
  }
  // Ball-pair separation can push a crowded barrel ball back into a wall.
  // Resolve those same physical surfaces again before the next integration step.
  for(const b of this.balls)if(!b.dead&&b.y>155&&b.x<45&&!(this.separateLaunchPlane&&b.leftLaunchPlane))for(const c of this.colliders){
   if(c.role.startsWith('launch-')&&c.role!=='launch-kicker')collideSegment(b,c.a,c.b,c.restitution,undefined,c.r);
  }
  if(game.phase&&game.phase!=='playing')break;
 }
 this.balls=this.balls.filter(b=>!b.dead);this.balls.push(...this.additions);
 }
}
