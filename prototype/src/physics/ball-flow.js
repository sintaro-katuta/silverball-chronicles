import {Physics} from './physics.js';
// Development-only open/closed fixture, with real launch/contact/crossing physics.
// No Game, draw, payout or profile storage is instantiated.
export function createPartFlow(mode='normal',options={}){
 const physics=new Physics(0,options.pegSeed??0);
 const counts={fuzu:0,normal:0,start:0,rush:0,bonus:0,out:0,returned:0};
 const game={time:0,phase:'playing',presentation:null,jackpot:mode==='bonus'?{gap:0,count:0,displayRounds:4}:null,rush:mode==='rush'?{}:null,machine:{countLimit:10},
  rng:()=>1,value:()=>0,hit(_ball,kind){counts[kind]++;},lose(){counts.out++;},addStock(){counts.returned++;},emit(){}};
 const interval=options.launchInterval??.1;
 let continuous=false,pending=0,clock=interval,accumulator=0,paused=false;
 physics.updateGate(game);
 return {physics,game,counts,get paused(){return paused;},get continuous(){return continuous;},get pending(){return pending;},
  single(){pending=Math.min(20,pending+1);},start(){continuous=true;},stop(){continuous=false;pending=0;},pause(value){paused=value;accumulator=0;},
  step(dt){if(paused||!Number.isFinite(dt)||dt<=0)return;accumulator+=Math.min(.05,dt);
   while(accumulator>=1/120){const h=1/120;accumulator-=h;game.time+=h;clock=Math.min(interval,clock+h);
    if((continuous||pending>0)&&clock>=interval-1e-9&&physics.canLaunch()){
     const ball=options.fire?options.fire():{gold:false,large:false,hits:0,extra:false,after:false};if(ball){physics.spawn(ball,options.launchPower??1,0);clock=0;if(pending)pending--;}
    }
    physics.step(h,game);
   }
  }
 };
}
