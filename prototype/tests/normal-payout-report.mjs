// Diagnostic only: isolate ordinary physical prizes with no jackpots or upgrades.
import fs from 'node:fs';
import {Game,freshProfile} from '../src/game.js';
import {Physics} from '../src/physics.js';
const rows=[];
for(const course of [0,1,2])for(const stage of (process.argv.includes('--stage6')?[6]:course===0?[1,2,3,4,5,6,7,8,9,10]:[1,6])){
 const g=new Game(freshProfile(),course,()=>.9),p=new Physics(course);
 g.stage=stage;g.stock=g.initial=g.stageStartStock=1e7;
 // Freeze the measured stage and suppress draws, not the start-pocket prize.
 g.checkStage=()=>{};g.enqueueDraw=()=>0;
 const hits={},prizes={};const hit=g.hit.bind(g);
 g.hit=(ball,kind,id)=>{const key=`${kind}:${id}`,before=g.total;hit(ball,kind,id);hits[key]=(hits[key]||0)+1;prizes[key]=(prizes[key]||0)+g.total-before;};
 const count=course===0&&[1,3,6,10].includes(stage)?1000:500;
 let clock=0,steps=0,waits=0;const interval=60/g.fireRate;
 while(g.ledger.spent<count&&steps<120*1800){
  clock+=1/120;
  if(clock+1e-9>=interval){if(p.canLaunch()){p.spawn(g.fire(),p.normalPower);clock=Math.min(interval,Math.max(0,clock-interval));}else {waits++;clock=Math.min(clock,interval);}}
  p.step(1/120,g);g.time+=1/120;g.events=[];steps++;
 }
 const firingSeconds=g.time;
 for(let n=0;n<120*30&&p.balls.length;n++){p.step(1/120,g);g.time+=1/120;g.events=[];}
 const paid=g.ledger.spent,normal=Object.entries(prizes).filter(([k])=>k.startsWith('normal:')).reduce((s,[,v])=>s+v,0),start=prizes['start:4']||0;
 const row={course:g.course.name,stage,power:p.normalPower,rate:g.fireRate,bonusMultiplier:g.course.scale*g.payoutMultiplier,ordinaryMultiplier:1,requiredGain:g.requiredGain,paid,firingSeconds,actualRate:paid/firingSeconds*60,waits,hits,prizes,normal,start,returned:g.ledger.returned,out:p.metrics.out,inFlight:p.balls.length,payout:g.total,net:g.stock-g.initial,returnPer100:100*(g.total+g.ledger.returned)/paid,normalShare:g.total?normal/g.total:0,reconciled:g.accounting.reconciled};
 rows.push(row);console.log(JSON.stringify(row));
}
fs.writeFileSync(new URL('../reference-review/balance-audit/normal-payout-separated-2026-09-25.json',import.meta.url),JSON.stringify({date:'2026-09-25',conditions:'Current geometry, normal power 0.50, no skills/upgrades/free balls, fixed stage, draws disabled, 10M diagnostic stock to prevent failure, 30s drain. Not a full campaign or an estimate including jackpots.',rows},null,2)+'\n');
