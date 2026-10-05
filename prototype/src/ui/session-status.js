// Only public phases are read here. Queued rolls and pending presentation wins
// must never be inspected: the panel cannot reveal an unannounced result.
export function sessionStatus(game){
 if(game.phase==='result')return {label:'遊技終了',remaining:null};
 const remaining=game.rush?.remaining??null;
 if(game.jackpot)return {label:game.jackpot.charge?'チャージ・獲得中':'大当り・獲得中',remaining};
 if(game.w?.pendingV)return {label:'右打ちを続けて',remaining};
 if(game.w?.electricOpen)return {label:'右打ちを続けて',remaining};
 if(game.presentation)return {label:'リーチ演出中・結果待ち',remaining};
 if(game.spinActive)return {label:game.rush?'RUSH・チャンス演出中':'図柄回転中',remaining};
 return {label:game.rush?'RUSH':'左打ちでスタート',remaining};
}
export function wAcquisitionLabel(game){
 if(game.phase==='result'||game.jackpot||game.presentation||game.entryPrelude)return null;
 if(game.w?.pendingV)return '右打ちを続けて';
 if(game.w?.electricOpen)return '右打ちを続けて';
 return null;
}
