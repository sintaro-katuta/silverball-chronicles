import {Game,freshProfile} from '../domain/game.js';
import {Physics} from '../physics/physics.js';
import {DenchuControl} from './denchu-control.js';
import {attachRightStartMotion} from '../pixi/right-start-motion.js';
const seeded=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
// Isolated RUSH demonstration using the existing Game draw/hold/prize logic; no persistence.
export function createDenchuFlow(){
 const physics=new Physics(),game=new Game(freshProfile(),0,seeded(19029),{endless:true}),control=new DenchuControl(seeded(7029));game.startRush();
 const counts={normal:0,start:0,rush:0,bonus:0,out:0,returned:0};
 const originalHit=game.hit.bind(game);game.hit=(b,kind,id)=>{counts[kind]++;originalHit(b,kind,id);};
 const lose=game.lose.bind(game);game.lose=b=>{counts.out++;lose(b);};
 const addStock=game.addStock.bind(game);game.addStock=(n,source)=>{if(source==='returned')counts.returned+=n;return addStock(n,source);};
 const advance=physics.advanceBall.bind(physics);physics.advanceBall=(b,dt,options={})=>{const previous=advance(b,dt,options),gate=control.spec.gate;
  if(!options.predict&&!b.denchuPassed&&previous.y<gate.y&&b.y>=gate.y&&b.y>previous.y){const x=previous.x+(b.x-previous.x)*(gate.y-previous.y)/(b.y-previous.y);if(x>=gate.left+b.r&&x<=gate.right-b.r){b.denchuPassed=true;control.pass();}}
  return previous;};
 let continuous=false,paused=false,accumulator=0,clock=.1;
 const flow={physics,game,counts,control,get paused(){return paused;},get continuous(){return continuous;},start(){continuous=true;},stop(){continuous=false;},pause(p){paused=p;accumulator=0;},
  snapshot(){return {...control.snapshot(),accepted:game.drawSerial,resolved:game.draws,holds:game.rushHolds.length,ordinaryHolds:control.queue.length,activeDraw:game.activeDraw?.id??null,prize:game.ledger.basePrize,jackpot:!!game.jackpot,rush:!!game.rush};},
  step(dt){if(paused||!Number.isFinite(dt)||dt<=0)return;accumulator+=Math.min(.05,dt);while(accumulator>=1/120){const h=1/120;accumulator-=h;game.tick(h);
   motion.request(control.tick(h,!!game.rush&&!game.jackpot&&game.phase==='playing'));
   clock=Math.min(.1,clock+h);if(continuous&&game.phase==='playing'&&clock>=.1&&physics.canLaunch()&&game.stock>0){physics.spawn(game.fire(),1,0);clock=0;}
   physics.step(h,game);
  }}
 };
 const motion=attachRightStartMotion(flow);flow.motion=motion;return flow;
}
