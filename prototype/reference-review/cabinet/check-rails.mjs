import {Physics} from '../../src/physics.js';
for(const power of [.1,.3,.45,.57,.65,.8,.9,1]){
 const p=new Physics(),g={phase:'playing',time:0,hit(){},lose(){},emit(){},rng:()=>1,value:()=>0};const b=p.spawn({},power);let top=680;
 for(let i=0;i<2400&&p.balls.length;i++){p.step(1/120,g);g.time+=1/120;top=Math.min(top,b.y);}
 console.log(power,{side:b.observedSide,top:Math.round(top),x:Math.round(b.x),out:p.metrics.out,returned:p.metrics.returned,normal:p.metrics.normal,start:p.metrics.start,alive:p.balls.length});
}
