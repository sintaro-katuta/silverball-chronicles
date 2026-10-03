// Both manual play and assistance feed the same physical launcher.
export function shotInterval(game,{manual=false}={}) {
 // The narrow right lane cannot carry a 100-ball/second stream without
 // collisions sending most bonus balls back down the launch rail.
 const rate=game.rightPlay&&!manual?Math.min(600,game.fireRate):game.fireRate;
 return 60/rate;
}
export function shotSettings(game,physics,{manual=false,power=.57,angle=0}={}) {
 const right=game.rightPlay??!!(game.jackpot||game.rush);
 return manual ? {power,angle} : {power:right?(physics.bonusPower??1):(physics.normalPower??.57),angle:0};
}
export function shotStatus(game,physics,settings,{assisted=true}={}) {
 const flow=physics.flowSummary?.(game.time)??{};
 const recentRight=flow.right??0,recentLeft=flow.left??0;
 const right=game.rightPlay??!!(game.jackpot||game.rush);
 const waiting=right&&physics.shouldWaitToFire(game,settings.power,settings.angle);
 if(game.jackpot)return {waiting:waiting&&assisted,label:waiting?(assisted?'ラウンド待機 ── 止め打ち中':'アタッカー閉鎖 ── 発射を止めてください'):recentLeft>recentRight?'右打ちしてください ── 発射を強める':'右打ち ── アタッカー開放',warning:false};
 if(game.rush)return {waiting:waiting&&assisted,label:waiting?(assisted?'RUSH ── 保留消化を待っています':'RUSH ── 保留を消化中'):recentLeft>recentRight?'右打ちしてください ── 発射を強める':'RUSH ── 右側の始動口を狙う',warning:false};
 return {waiting:false,label:'自動発射中',warning:recentRight>0&&recentRight>=recentLeft};
}
