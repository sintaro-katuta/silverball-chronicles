import {createBoardFlow} from '../../src/pixi/board-flow.js';
const results=[];
for(const mode of ['normal','right-closed'])for(const power of mode==='normal'?[.20,.24,.28]:[.85]){
 const m=createBoardFlow({lcd:true,normalPower:power});m.setMode(mode);const p=m.flow.physics;
 p.pins.forEach(pin=>pin.r=.2);p.colliders.filter(c=>c.role.startsWith('right-channel-6-')).forEach(c=>c.r=.4);
 m.flow.start();for(let i=0;i<30*120;i++)m.flow.step(1/120);m.flow.stop();for(let i=0;i<30*120;i++)m.flow.step(1/120);
 results.push({mode,power,remain:p.balls.map(b=>({x:b.x,y:b.y,vx:b.vx,vy:b.vy})),counts:m.flow.counts,spawned:p.metrics.spawned});
}console.log(JSON.stringify(results,null,2));
