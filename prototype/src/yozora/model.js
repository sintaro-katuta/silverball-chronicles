// Published, rounded aggregate values. This is not the manufacturer's firmware.
export const SPEC = Object.freeze({normalOdds:199.9,rightOdds:51.6,rushSpins:53,wouSpins:70,counts:10,award:15,holdLimit:4});
const pick=(rng,rows)=>{let n=rng()*rows.reduce((s,r)=>s+r[0],0);for(const [w,value] of rows){n-=w;if(n<0)return value;}return rows.at(-1)[1];};
export function drive(rng=Math.random){
 let units=0,repeats=0;
 for(;;){const result=pick(rng,[[8.2,1],[28.1,2],[36.1,3],[20.7,4],[4.4,5],[1.5,6],[1,'again']]);
  if(result!=='again')return {units:units+result,repeats};
  units+=5;repeats++;
  if(repeats>1000)throw new Error('Invalid random source: DRIVE never terminates');
 }
}
export function awardFor(mode,rng=Math.random){
 const branch=rng();
 if(mode==='normal'){
  if(branch<.5)return {rounds:2,next:'normal',name:'LAST FLOOR BONUS',drive:false};
  if(branch<.985)return {rounds:2,next:'rush',name:'LAST FLOOR BONUS',drive:false};
  return {rounds:(1+drive(rng).units)*10,next:'wou',name:'ぼくの英雄',drive:true};
 }
 if(mode==='rush'){
  if(branch<.45)return {rounds:10,next:'rush',name:'BONUS',drive:false};
  if(branch<.78)return {rounds:10,next:'rush',name:'決意の刃',drive:false};
  if(branch<.89)return {rounds:10,next:'wou',name:'決意の刃',drive:false};
  return {rounds:(1+drive(rng).units)*10,next:'wou',name:'咲け、花たち',drive:true};
 }
 return branch<.6?{rounds:10,next:'wou',name:'BONUS',drive:false}:{rounds:drive(rng).units*10,next:'wou',name:'SWORD DRIVE',drive:true};
}
export class YozoraGame {
 constructor({rng=Math.random,fxRng=Math.random}={}){this.rng=rng;this.fxRng=fxRng;this.reset();}
 reset(){Object.assign(this,{phase:'ready',mode:'normal',stock:2500,total:0,shots:0,starts:0,jackpots:0,remaining:0,queue:[],active:null,bonus:null,clock:0,shotClock:0,auto:false,paused:false,events:[],fairCount:0,fairHits:0,plusHits:0,stage:0,demo:false,lastDigits:[3,7,1],message:'左打ちでスタート',serial:0});}
 event(type,data={}){this.events.push({type,...data});}
 start(){if(this.phase==='ready')this.phase='playing';this.auto=true;}
 pause(){this.paused=true;}
 resume(){this.paused=false;}
 addStock(){this.stock+=250;this.event('supply');}
 // Route receipt is separate from the lottery. The view uses a simplified trajectory model.
 launch(){if(this.phase!=='playing'||this.paused||this.stock<=0)return null;
  this.stock--;this.shots++;
  let route='out';
  if(this.bonus)route='attacker';
  else if(this.mode!=='normal')route='right';
  else if(this.shots%5===0){route='fair';this.fairCount++;}
  else if(this.fxRng()<.012)route='plus';
  const shot={id:++this.serial,route,slot:route==='fair'?Math.floor(this.fxRng()*6):null};this.event('shot',{shot});return shot;
 }
 receive(shot){
  if(this.phase!=='playing'||this.paused)return;
  if(shot.route==='attacker'){if(this.bonus)this.countBonus();return;}
  if(shot.route==='fair'&&shot.slot%3===0){this.fairHits++;this.stock++;this.total++;this.enter('normal');this.event('entry');}
  if(shot.route==='plus'){this.plusHits++;this.stock++;this.total++;this.enter('normal');this.event('entry');}
  if(shot.route==='right'&&this.mode!=='normal'&&!this.bonus){this.stock++;this.total++;this.enter(this.mode);this.event('entry');}
 }
 enter(source=this.mode,forced=null){
  if(this.bonus||source!==this.mode||this.queue.length>=SPEC.holdLimit)return false;
  if(this.mode!=='normal'&&this.queue.length+(this.active?1:0)>=this.remaining)return false;
  const win=forced?forced!=='miss':this.rng()<1/(source==='normal'?SPEC.normalOdds:SPEC.rightOdds);
  const award=win?awardFor(source,this.rng):null;
  const reach=win||this.fxRng()<.085;
  this.queue.push({id:++this.serial,source,win,award,reach,digit:1+Math.floor(this.fxRng()*9),duration:reach?9.4:source==='normal'?3.2:1.1});return true;
 }
 update(dt){
  if(this.phase!=='playing'||this.paused)return;
  dt=Math.max(0,Math.min(dt,.05));this.clock+=dt;
  if(this.auto){this.shotClock+=dt;if(this.shotClock>=.6){this.shotClock-=.6;this.launch();}}
  if(this.bonus)return;
  if(!this.active&&this.queue.length){this.active={...this.queue.shift(),elapsed:0};this.event('spin');}
  if(!this.active)return;
  this.active.elapsed+=dt;
  if(this.active.elapsed>=this.active.duration)this.resolve();
 }
 resolve(){const a=this.active;if(!a)return;this.active=null;this.starts++;
  if(a.source!=='normal')this.remaining--;
  this.lastDigits=a.win?[a.digit,a.digit,a.digit]:[a.digit,1+(a.digit+2)%9,a.digit];
  if(a.win){this.jackpots++;this.bonus={...a.award,count:0,paid:0};this.message=a.award.name;this.event('win');}
  else{this.event('miss');if(this.mode!=='normal'&&this.remaining<=0){this.mode='normal';this.remaining=0;this.stage=0;this.queue=[];this.message='左打ちに戻してください';this.event('end');}}
 }
 countBonus(){const b=this.bonus;if(!b)return;this.stock+=SPEC.award;this.total+=SPEC.award;b.paid+=SPEC.award;b.count++;this.event('payout');
  if(b.count>=b.rounds*SPEC.counts){
   const old=this.mode;this.mode=b.next;this.remaining=this.mode==='normal'?0:this.mode==='rush'?53:70;
   if(this.mode==='wou'&&old!=='wou')this.stage=0;else if(this.mode==='wou'&&b.drive)this.stage=Math.min(2,this.stage+1);
   // Existing same-mode holds retain their pre-drawn outcomes. A mode change clears the
   // simplified queue: real special-symbol / residual-hold control is not publicly specified.
   if(old!==this.mode)this.queue=[];
   this.message=this.mode==='normal'?'左打ちに戻してください':this.mode==='rush'?'SWORD RUSH':'War of Underworld';
   this.bonus=null;this.event('mode');
  }
 }
 push(){if(this.active?.reach)this.event('push');}
 demoScene(kind){this.reset();this.start();this.auto=false;this.demo=true;
  if(kind==='rush'||kind==='wou'){this.mode=kind;this.remaining=kind==='rush'?53:70;this.message=kind==='rush'?'SWORD RUSH':'War of Underworld';}
  else if(kind==='bonus'||kind==='drive'){
   this.mode=kind==='drive'?'wou':'normal';this.jackpots=1;
   this.bonus={rounds:kind==='drive'?30:2,next:kind==='drive'?'wou':'rush',name:kind==='drive'?'SWORD DRIVE':'LAST FLOOR BONUS',drive:kind==='drive',count:0,paid:0};this.auto=true;
  }else{this.enter('normal',kind==='miss'?'miss':'win');this.queue[0].reach=true;this.queue[0].duration=9.4;}
 }
 snapshot(){return {phase:this.phase,mode:this.mode,stock:this.stock,total:this.total,shots:this.shots,starts:this.starts,jackpots:this.jackpots,remaining:this.remaining,holds:this.queue.length,active:this.active?{elapsed:this.active.elapsed,reach:this.active.reach}:null,bonus:this.bonus?{name:this.bonus.name,count:this.bonus.count,paid:this.bonus.paid,rounds:this.bonus.rounds}:null,paused:this.paused,clock:this.clock,demo:this.demo};}
}
