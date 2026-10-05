// Reproducible physical-flow audit, independent from presentation and RNG winnings.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Physics} from '../src/physics/physics.js';
import {Game,freshProfile} from '../src/domain/game.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const destination=path.join(root,'reference-review','physics-audit');fs.mkdirSync(destination,{recursive:true});
const dummy=()=>({phase:'playing',time:0,hit(){},lose(){},emit(){},rng:()=>1,value:()=>0});
const normal=[];for(let course=0;course<3;course++){
 const p=new Physics(course),g=dummy();for(let n=0;n<500;n++){p.spawn({},p.normalPower);for(let step=0;step<72;step++){p.step(1/120,g);g.time+=1/120;}}
 for(let step=0;step<2400&&p.balls.length;step++){p.step(1/120,g);g.time+=1/120;}
 normal.push({course,...p.diagnostics()});
}
const jackpots=[];for(let course=0;course<3;course++){
 const g=new Game(freshProfile(),course,()=>.5),p=new Physics(course);g.rules.targetBase=1e8;g.pendingGrade=10;g.startJackpot();let fired=0,clock=0,elapsed=0;
 for(let n=0;n<22000&&(g.jackpot||p.balls.length);n++){clock+=1/120;if(g.jackpot&&clock>=.6){clock=0;if(!p.shouldWaitToFire(g,p.bonusPower)){const b=g.fire();if(b){fired++;p.spawn(b,p.bonusPower);}}}p.step(1/120,g);g.tick(1/120);elapsed+=1/120;}
 jackpots.push({course,fired,elapsed:+elapsed.toFixed(3),finished:!g.jackpot,...p.diagnostics()});
}
const rush=[];for(let course=0;course<3;course++){
 const g=new Game(freshProfile(),course,()=>.9),p=new Physics(course);g.rules.targetBase=1e8;g.startRush();let fired=0,clock=0,elapsed=0;
 for(let n=0;n<120000&&(g.rush||p.balls.length);n++){clock+=1/120;if(g.rush&&clock>=.6&&!p.shouldWaitToFire(g,p.bonusPower)){const b=g.fire();if(b){fired++;p.spawn(b,p.bonusPower);clock=0;}}p.step(1/120,g);g.tick(1/120);elapsed+=1/120;}
 rush.push({course,fired,spins:g.draws,elapsed:+elapsed.toFixed(3),finished:!g.rush,...p.diagnostics()});
}
const traces=[];
for(const [name,power,color] of [['NORMAL',new Physics().normalPower,'#6ce5cd'],['RIGHT',new Physics().bonusPower,'#ffcc6c']]){
 const p=new Physics(),g=dummy(),b=p.spawn({},power),points=[];for(let n=0;n<1200&&p.balls.length;n++){p.step(1/120,g);g.time+=1/120;if(n%2===0)points.push([+b.x.toFixed(2),+b.y.toFixed(2)]);}
 traces.push({name,power,color,points});
}
const p=new Physics();
const line=(c,color,width)=>`<line x1="${c.a.x}" y1="${c.a.y}" x2="${c.b.x}" y2="${c.b.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
const geometry=[...p.colliders,p.rightChucker.scoop,p.rightChucker.cover].map(c=>line(c,c.material==='rubber'?'#ff8695':'#637183',2*c.r)).join('');
const pins=p.pins.map(pin=>`<circle cx="${pin.x}" cy="${pin.y}" r="${pin.r}" fill="#9da5b2"/>`).join('');
const trajectories=traces.map(t=>`<polyline points="${t.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${t.color}" stroke-width="1.6"/>`).join('');
const pockets=p.pockets.map(q=>`<line x1="${q.x-q.w/2}" y1="${q.y}" x2="${q.x+q.w/2}" y2="${q.y}" stroke="#a0aebf" stroke-width="3"/>`).join('');
fs.writeFileSync(path.join(destination,'trajectories.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="650" height="730" viewBox="0 0 650 730"><rect width="650" height="730" fill="#111722"/><g transform="translate(10 20)">${geometry}${pins}${pockets}${line(p.gate,'#af8e65',2.8)}${trajectories}</g><g fill="#e2e7ed" font-family="sans-serif" font-size="14"><text x="440" y="48">PHYSICAL FLOW</text><text x="440" y="83" fill="#6ce5cd">NORMAL / 57%</text><text x="440" y="108" fill="#ffcc6c">RIGHT / 100%</text><text x="440" y="150">Same geometry</text><text x="440" y="177">Gravity + contacts</text><text x="440" y="204">No route switching</text><text x="440" y="250">Closed gate shown</text><text x="440" y="277">Both drain to OUT</text><text x="440" y="330">2D prototype model</text><text x="440" y="357">Not a real machine</text><text x="440" y="384">measurement</text></g></svg>`);
const result={normal,jackpots,rush,settings:{normalPower:new Physics().normalPower,bonusPower:new Physics().bonusPower,launchTolerance:.007,ballRadius:4.6,pinRadius:2.1,gravity:690},limitations:['2D sphere cross-sections; no needle bending or depth simulation','Sample entry rates are prototype measurements, not real-machine odds','Manual firing can waste balls while the attacker is closed']};
fs.writeFileSync(path.join(destination,'measurements.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
