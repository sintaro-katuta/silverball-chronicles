import {createBoardFlow} from '../../src/pixi/board-flow.js';
const cases=[{power:.2,interval:.6},{power:.24,interval:.6},{power:.28,interval:.6},{power:.25,interval:.6},{power:.24,interval:.05}];
for(const c of cases){const m=createBoardFlow({lcd:true,normalPower:c.power,launchInterval:c.interval}),p=m.flow.physics;let count=0,max=0,first=null,frames=0;const ids=new Set();m.setMode('normal');
 if(process.argv.includes('--before-algorithm')){const advance=p.advanceBall.bind(p),resolve=p.resolvePins.bind(p);let inAdvance=false;p.advanceBall=(...args)=>{inAdvance=true;try{return advance(...args);}finally{inAdvance=false;}};p.resolvePins=(...args)=>{if(inAdvance)return resolve(...args);};}
 m.flow.start();for(let i=0;i<20*120;i++){m.flow.step(1/120);for(const b of p.balls){if(!b.leftLaunchPlane)continue;for(const pin of p.pins){const overlap=b.r+pin.r-Math.hypot(b.x-pin.x,b.y-pin.y);if(overlap>1e-6){count++;max=Math.max(max,overlap);ids.add(b.id);first??={ball:{id:b.id,x:b.x,y:b.y,vx:b.vx,vy:b.vy},pin:{...pin},overlap,time:m.flow.game.time};}}}frames++;}
 m.flow.stop();for(let i=0;i<30*120;i++)m.flow.step(1/120);
 console.log(JSON.stringify({...c,frames,count,max,balls:ids.size,first,remain:p.balls.length,spawned:p.metrics.spawned,counts:m.flow.counts}));}
