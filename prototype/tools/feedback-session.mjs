import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {SessionGame} from '../src/domain/session-game.js';
// Fixed losing rolls isolate finite-stock admission/hold losses from jackpot supply.
for(const guides of [false,true]){
 const game=new SessionGame(()=>.9),m=createBoardFlow({lcd:true,pegSeed:101,fire:()=>game.fire()});m.setMode('normal');
 if(!guides)m.flow.physics.colliders=m.flow.physics.colliders.filter(c=>c.role!=='heso-guide');
 attachNormalSpin(m.flow,{sessionGame:game,roundModel:m,lifecycle:true,presentationPatterns:true});
 const lose=m.flow.game.lose.bind(m.flow.game);m.flow.game.lose=b=>{lose(b);game.lose(b);};
 const returned=m.flow.game.addStock.bind(m.flow.game);m.flow.game.addStock=n=>{returned(n);game.addStock(n,'returned');};m.flow.start();
 for(let n=0;n<900*120&&game.phase!=='result';n++){game.pendingBalls=m.flow.physics.balls.length;m.flow.step(1/120);}
 console.log(JSON.stringify({guides,stock:game.stock,shots:game.accounting.spent,entries:m.flow.counts.start,draws:game.draws,jackpots:game.jackpots,phase:game.phase,time:Math.round(game.time),reconciled:game.accounting.reconciled}));
}
