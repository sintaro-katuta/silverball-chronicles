import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {SessionGame} from '../src/domain/session-game.js';
for(const power of [.18,.20,.25]){
 const game=new SessionGame(()=>.5),model=createBoardFlow({...productionBoardFlowOptions(),lcd:true,normalPower:power,fire:()=>game.fire()});
 attachNormalSpin(model.flow,{sessionGame:game});model.setMode('normal');model.flow.start();
 for(let i=0;i<60*120;i++)model.flow.step(1/120);model.flow.stop();
 for(let i=0;i<45*120;i++)model.flow.step(1/120);
 const {counts,physics}=model.flow;assert.equal(physics.balls.length,0);assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),physics.metrics.spawned);
 assert.equal(game.normalCount,counts.normal);assert.equal(game.ledger.spent,physics.metrics.spawned);assert.equal(game.ledger.basePrize,counts.normal*5+counts.start);
 console.log(JSON.stringify({power,spawned:physics.metrics.spawned,counts,pocketCounts:game.pocketCounts,stock:game.stock,payout:game.total,basePrize:game.ledger.basePrize,inFlight:physics.balls.length}));
}
