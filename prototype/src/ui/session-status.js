// Only public phases are read here. Queued rolls and pending presentation wins
// must never be inspected: the panel cannot reveal an unannounced result.
export function sessionStatus(game,{feeding=true,paused=false}={}){
 if(game.phase==='result')return {label:'遊技終了',remaining:null};
 const remaining=game.rush?.remaining??null;
 if(paused)return {label:'一時停止中',remaining};
 if(!feeding&&(game.jackpot||game.w?.pendingV||game.w?.electricOpen||game.rush))return {label:'発射開始を押して右打ち',remaining};
 if(game.jackpot)return {label:game.jackpot.charge?'チャージ・獲得中':'大当り・獲得中',remaining};
 if(game.w?.pendingV)return {label:'右打ちを続けて',remaining};
 if(game.w?.electricOpen)return {label:'右打ちを続けて',remaining};
 if(game.presentation)return {label:'リーチ演出中・結果待ち',remaining};
 if(game.spinActive)return {label:game.rush?'RUSH・チャンス演出中':'図柄回転中',remaining};
 if(game.entryPrelude)return {label:'RUSH突入演出中',remaining};
 if(game.stopTimer>0)return {label:'図柄停止・次の変動待ち',remaining};
 return {label:game.rush?'RUSH':game.stock<=0?'玉切れ・残り玉を確認中':feeding?'左打ち中・始動口への入賞待ち':'発射停止中・再開できます',remaining};
}
export function wAcquisitionLabel(game){
 if(game.phase==='result'||game.jackpot||game.presentation||game.entryPrelude)return null;
 if(game.w?.pendingV)return '右打ちを続けて';
 if(game.w?.electricOpen)return '右打ちを続けて';
 return null;
}
