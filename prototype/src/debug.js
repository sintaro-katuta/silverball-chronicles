import {MAX_FIRE_RATE,FIRE_GROWTH} from './game.js';
// Temporary prototype panel. Set false to remove all entry points.
export const DEBUG_ENABLED=true;
export function debugPanel(game,sfx,{close,resume,events,notice}){
 const fields=[
  ['fireRate','基準発射速度（発／分）',game.rules.fireRate??100,10,MAX_FIRE_RATE,1],['stock','持ち玉',game.stock,0,10000000,1],['stage','ステージ',game.stage,1,game.endless?10000:10,1],
  ['odds','通常の大当り確率 1 /',game.course.odds,1,100000,1],['tempo','通常変動時間（秒）',game.course.tempo,.1,30,.1],
  ['scale','コース倍率（大当り賞球・目標）',game.course.scale,.1,100,.1],['pityLimit','天井の回転数',game.rules.pityLimit,1,10000,1],['pityCount','大当り後の消化回転数',game.pityCount,0,10000,1],
  ['targetBase','ステージ1の必要な持ち玉増加',game.rules.targetBase,1,10000000,1],['growth','目標の増加倍率',game.rules.growth,1,3,.01],
  ['weight4','初当り4R比率',game.rules.weights[0],0,100,1],['weight6','初当り6R比率',game.rules.weights[1],0,100,1],['weight10','初当り10R比率',game.rules.weights[2],0,100,1],
  ['rushEntryRate','4RからのRUSH突入率（％）',game.rules.rushEntryRate*100,0,100,1],
  ['rushOdds','RUSH大当り確率 1 /',game.rules.rushOdds,1,100000,'any'],['rushSpins','RUSHの回転数',game.rules.rushSpins,1,1000,1],['rushTempo','RUSH変動時間（秒）',game.rules.rushTempo,.1,10,.05],
  ['rushWeight4',game.machine.rightDraw.payouts?'RUSH中1000玉比率':'RUSH中4R比率',game.rules.rushWeights[0],0,100,1],['rushWeight6',game.machine.rightDraw.payouts?'RUSH中1500玉比率':'RUSH中6R比率',game.rules.rushWeights[1],0,100,1],['rushWeight10',game.machine.rightDraw.payouts?'RUSH中3000玉比率':'RUSH中10R比率',game.rules.rushWeights[2],0,100,1],
  ['volume','効果音の音量',sfx.volume??.65,0,1,.05],['impact','確定音の重さ',sfx.impactLevel??1,.2,2,.1]
 ];
 const dialog=document.createElement('dialog');dialog.className='debug-panel';
 dialog.innerHTML=`<h2>一時デバッグ</h2><p>発射速度・持ち玉・抽選など遊技の設定を変更したプレイは新しいチケット・解放・記録を保存しません。獲得済みチケットは保持します。音量・確定音の重さだけの変更や、変更なしの適用では報酬は有効です。設定は今回のプレイのみ。保留済みの抽選結果は維持します。RUSH回転数の変更は次の突入・再セットから適用します。基準発射速度は10〜${MAX_FIRE_RATE.toLocaleString('ja-JP')}発／分（初期100）。ステージごとに×${FIRE_GROWTH}、実際の発射速度は最大${MAX_FIRE_RATE.toLocaleString('ja-JP')}発／分です。演出・玉の速度は変わらず、オートの止め打ち中は発射を待ちます。</p><form>${fields.map(([id,label,value,min,max,step])=>`<label>${label}<input name="${id}" type="number" value="${value}" min="${min}" max="${max}" step="${step}" required></label>`).join('')}<p id="debugError" role="alert"></p><button class="primary" type="submit">適用して再開</button></form><div class="training-options"><button type="button" id="debugFill" class="secondary">保留を5個追加</button><button type="button" id="debugRush" class="secondary">RUSHを開始</button>${[4,6,10].map(r=>`<button type="button" data-rounds="${r}" class="secondary">${r}R大当りを再生</button>`).join('')}<button type="button" id="debugSound" class="secondary">確定音を試聴</button></div><button type="button" id="debugClose" class="secondary">変更せず戻る</button>`;
 document.body.append(dialog);dialog.showModal();
 const end=()=>{dialog.close();dialog.remove();close();resume();};
 dialog.querySelector('form').onsubmit=e=>{
  e.preventDefault();const data=Object.fromEntries(new FormData(e.target));for(const k in data)data[k]=Number(data[k]);
  if(fields.some(([k,,v,min,max])=>!Number.isFinite(data[k])||data[k]<min||data[k]>max)||data.weight4+data.weight6+data.weight10<=0||data.rushWeight4+data.rushWeight6+data.rushWeight10<=0){dialog.querySelector('#debugError').textContent='範囲内の数値を入力し、それぞれの振分け比率を1つ以上正にしてください。';return;}
  const gameplayChanged=fields.some(([key,,value])=>!['volume','impact'].includes(key)&&data[key]!==value);
  if(gameplayChanged){
  game.debug=true;game.rules.fireRate=data.fireRate;game.setStock(data.stock,'debug');game.zeroTime=0;
  if(game.stage!==data.stage){game.stage=data.stage;game.cleared=data.stage-1;game.beginStage();}
  game.course.odds=data.odds;game.course.tempo=data.tempo;game.course.scale=data.scale;
  game.rules.pityLimit=data.pityLimit;game.pityCount=Math.min(data.pityCount,data.pityLimit-1);game.rules.targetBase=data.targetBase;game.rules.growth=data.growth;
  game.rules.weights=[data.weight4,data.weight6,data.weight10];game.rules.rushWeights=[data.rushWeight4,data.rushWeight6,data.rushWeight10];
  game.rules.rushEntryRate=data.rushEntryRate/100;game.rules.rushOdds=data.rushOdds;game.rules.rushSpins=data.rushSpins;game.rules.rushTempo=data.rushTempo;
  game.recordBalance();
  }
  sfx.volume=data.volume;sfx.impactLevel=data.impact;if(sfx.master)sfx.master.gain.value=data.volume;
  end();notice(game.debug?'デバッグ設定を適用しました（チケット対象外）':'設定を適用しました（チケット獲得は有効）');
 };
 dialog.querySelector('#debugClose').onclick=end;dialog.oncancel=e=>{e.preventDefault();end();};
 dialog.querySelector('#debugSound').onclick=()=>{sfx.setEnabled(true);sfx.stop();sfx.volume=Number(dialog.querySelector('[name=volume]').value);sfx.impactLevel=Number(dialog.querySelector('[name=impact]').value);if(sfx.master)sfx.master.gain.value=Math.max(0,Math.min(1,sfx.volume));sfx.play('win');};
 dialog.querySelector('#debugFill').onclick=()=>{game.debug=true;game.enqueueDraw(5,'debug',game.rush?'rush':'normal');end();};
 dialog.querySelector('#debugRush').onclick=()=>{game.debug=true;game.presentation=null;game.jackpot=null;game.spinActive=false;game.spinResult=null;game.activeDraw=null;end();game.startRush();events();};
 dialog.querySelectorAll('[data-rounds]').forEach(b=>b.onclick=()=>{game.debug=true;game.presentation=null;game.jackpot=null;game.pendingGrade=Number(b.dataset.rounds);end();game.beginPresentation(true);events();});
}
