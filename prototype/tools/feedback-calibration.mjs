import {createBoardFlow} from '../src/pixi/board-flow.js';
export function measure({pegSeed=101,power=.20,width=20,phase=0,seconds=300,gap=0,guide=28}={}){
 const m=createBoardFlow({lcd:true,pegSeed,normalPower:power});m.setMode('normal');
 const p=m.flow.physics,mouth=p.pockets.find(p=>p.kind==='start');mouth.w=width;
 for(const c of p.colliders.filter(c=>c.role==='start-rim'))c.a.x=c.b.x=mouth.x+Math.sign(c.a.x-mouth.x)*width/2;
 if(guide!=='tray')p.colliders=p.colliders.filter(c=>c.role!=='heso-guide');
 for(const pin of p.pins.filter(p=>p.role==='heso'))pin.x+=Math.sign(pin.x-mouth.x)*gap;
 if(guide&&guide!=='tray')for(const side of [-1,1])p.colliders.push({a:{x:mouth.x+side*(mouth.w/2+guide),y:mouth.y-23-(guide-28)*22/27},b:{x:mouth.x+side*(mouth.w/2+1),y:mouth.y-1},r:.6,material:'resin',role:'heso-guide',restitution:.12});
 let last=0,maxGap=0;const hit=m.flow.game.hit.bind(m.flow.game);m.flow.game.hit=(b,kind,id)=>{if(kind==='start'){maxGap=Math.max(maxGap,p.time-last);last=p.time;}hit(b,kind,id);};
 for(let i=0;i<Math.round(phase*120);i++)m.flow.step(1/120);m.flow.start();
 for(let i=0;i<seconds*120;i++)m.flow.step(1/120);m.flow.stop();for(let i=0;i<45*120;i++)m.flow.step(1/120);
 return {pegSeed,power,width,gap,guide,phase,shots:p.metrics.spawned,entries:m.flow.counts.start,maxGap:Math.round(Math.max(maxGap,seconds+phase-last)),remaining:p.balls.length};
}
if(process.argv[2]==='scan')for(const power of [.18,.19,.20,.21,.22,.23,.24,.25,.26,.27,.28,.29,.30])console.log(JSON.stringify(measure({power,guide:0})));

if(process.argv[2]==='verify')for(const guide of [28,'tray'])for(const phase of [0,.175,.35])console.log(JSON.stringify(measure({guide,phase})));
