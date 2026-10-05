// The LCD consumes only information already revealed by the game model.
// Motion follows game.time: pausing play freezes every glow and image movement.
const ART={rush:'/battles/moon-awakening.png',bonus:'/battles/eclipse-victory.png'};
const number=value=>Math.max(0,Math.floor(value)).toLocaleString('ja-JP');
export function mountRushScreen(lcd){
 const panel=document.createElement('section');
 panel.className='rush-screen';panel.hidden=true;panel.setAttribute('aria-label','右打ち遊技');
 panel.innerHTML=`<div class="rush-screen-art"></div><div class="rush-screen-light"></div><div class="rush-screen-vignette"></div><div class="rush-screen-heading"><small></small><strong></strong></div><div class="rush-screen-score"><span class="rush-screen-chain"></span><span class="rush-screen-total"></span></div><div class="rush-screen-focus"><svg class="rush-screen-orbit" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="53"/><circle class="rush-screen-remaining-arc" cx="60" cy="60" r="53"/></svg><small class="rush-screen-focus-label"></small><strong class="rush-screen-focus-value"></strong><span class="rush-screen-focus-unit"></span></div><div class="rush-screen-rounds"></div><div class="rush-screen-message"><strong></strong><span></span></div>`;
 lcd.append(panel);
 const find=selector=>panel.querySelector(selector),art=find('.rush-screen-art'),heading=find('.rush-screen-heading strong'),kicker=find('.rush-screen-heading small'),chain=find('.rush-screen-chain'),total=find('.rush-screen-total'),focus=find('.rush-screen-focus'),focusLabel=find('.rush-screen-focus-label'),focusValue=find('.rush-screen-focus-value'),focusUnit=find('.rush-screen-focus-unit'),arc=find('.rush-screen-remaining-arc'),rounds=find('.rush-screen-rounds'),message=find('.rush-screen-message'),messageTitle=message.querySelector('strong'),messageDetail=message.querySelector('span');
 let previousMode='',previousJackpot=null,previousRounds=0,reveal=null,roundKey='';
 function update(game){
  const j=game.jackpot,rush=game.rush;
  const failed=game.lastBonus&&!game.lastBonus.entryEligible?{kind:'bonus-result',endedAt:game.lastBonus.endedAt,total:game.lastBonus.payout,chain:1}:null;
  const ended=game.lastRush?{kind:'rush-result',endedAt:game.lastRush.endedAt,total:game.lastRush.total,chain:game.lastRush.chain}:null;
  const result=ended&&(!failed||ended.endedAt>failed.endedAt)?ended:failed;
  const recent=result&&game.time-result.endedAt<2.6;
  const mode=j?'bonus':rush?'rush':recent?result.kind:null;
  panel.hidden=!mode;if(!mode)return;
  panel.dataset.mode=mode;
  panel.dataset.cinematic=String(!!game.presentation);
  if(mode!==previousMode){art.style.backgroundImage=`url("${ART[mode.startsWith('bonus')?'bonus':'rush']}")`;previousMode=mode;}
  const time=game.time;if(j!==previousJackpot){previousJackpot=j;previousRounds=j?.displayRounds??0;reveal=null;}else if(j&&previousRounds!==j.displayRounds){reveal={from:previousRounds,to:j.displayRounds,at:time};previousRounds=j.displayRounds;}
  panel.style.setProperty('--rush-glow',String(.28+Math.sin(time*2.3)*.07));
  art.style.transform=`scale(${1.04+Math.sin(time*.16)*.012}) translateY(${Math.sin(time*.21)*.45}%)`;
  const chainCount=rush?rush.chain:j?1:result.chain,earned=rush?rush.total:j?j.payout:result.total;
  chain.textContent=`${number(chainCount)} 連`;
  total.textContent=`獲得 ${number(earned)} 玉`;
  message.hidden=true;rounds.hidden=mode!=='bonus';focus.hidden=false;
  if(mode.endsWith('-result')){
   kicker.textContent='通常遊技へ';heading.textContent=mode==='rush-result'?'RUSH':'BONUS';focus.hidden=true;rounds.hidden=true;message.hidden=false;panel.dataset.verdict='lose';panel.dataset.tension='normal';messageTitle.textContent=mode==='rush-result'?'RUSH 終了':'挑戦終了';messageDetail.textContent='左打ちで、次の大当りへ。';return;
  }
  if(mode==='rush'){
   kicker.textContent='月蝕の刻';heading.textContent='RUSH';
   focusLabel.textContent='残り';focusValue.textContent=number(rush.remaining);focusUnit.textContent='回転';
   arc.style.strokeDashoffset=String(333*(1-Math.max(0,Math.min(1,rush.remaining/game.machine.rightDraw.spins))));
   panel.dataset.tension=rush.remaining<=10?'final':'normal';
   panel.dataset.verdict='';
  }else{
   kicker.textContent=j.fromRush?'月蝕連撃':j.entryRevealed&&j.displayRounds>=6?'RUSH 獲得':'運命の一撃';heading.textContent='BONUS';
   const shown=j.displayRounds;
   focusLabel.textContent='ROUND';focusValue.textContent=number(j.round);focusUnit.textContent=`/ ${number(shown)} R`;
   arc.style.strokeDashoffset=String(333*(1-Math.min(1,j.round/shown)));
   const nextRoundKey=`${shown}:${j.round}`;if(nextRoundKey!==roundKey){roundKey=nextRoundKey;rounds.replaceChildren(...Array.from({length:shown},(_,i)=>{const marker=document.createElement('i');marker.className=i<j.round?'filled':'';marker.setAttribute('aria-hidden','true');return marker;}));}
   panel.dataset.tension='normal';
   panel.dataset.verdict='';
   if(reveal&&time-reveal.at<2.4){message.hidden=false;focus.hidden=true;panel.dataset.verdict='win';messageTitle.textContent=`${reveal.from}R → ${reveal.to}R`;messageDetail.textContent=j.fromRush?'まだ、終わらない。':'RUSH 獲得';}
   if(j.challenge){
    message.hidden=false;focus.hidden=true;
    const result=j.challenge.win;
    panel.dataset.verdict=result===null?'pending':result?'win':'lose';
    messageTitle.textContent=result===null?'月を呼び醒ませ':result?'RUSH 突入':'挑戦終了';
    messageDetail.textContent=result===null?'運命を、その一撃に。':result?'月蝕の刻、開幕。':'残りの賞球を受け取ろう';
   }
  }
 }
 return {update,dispose(){panel.remove();}};
}
