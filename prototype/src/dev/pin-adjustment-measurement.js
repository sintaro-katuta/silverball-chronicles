// Local comparison uses existing factory and qa05 conditions, never modifies production.
import {createBoardFlow} from '../pixi/board-flow.js';
import {attachNormalSpin} from '../pixi/normal-spin-flow.js';
import {GRAVITY} from '../physics/physics.js';
import {LCD_LAYOUT,LCD_OPENING,overlapsLcd} from '../pixi/lcd-layout.js';
import {SessionGame} from '../domain/session-game.js';
import {resolvePinAdjustment} from './pin-adjustment.js';
export const isFrontPlaneBall=(physics,ball)=>!physics.separateLaunchPlane||ball.leftLaunchPlane===true;
export function classifyLCDContact(b){
 if(b.x<LCD_LAYOUT.x-b.r||b.x>LCD_LAYOUT.x+LCD_LAYOUT.width+b.r||b.y<LCD_LAYOUT.y-b.r||b.y>LCD_LAYOUT.y+LCD_LAYOUT.height+b.r)return 'none';
 let inside=false;for(let i=0,j=LCD_OPENING.length-1;i<LCD_OPENING.length;j=i++){const a=LCD_OPENING[i],c=LCD_OPENING[j];if((a[1]>b.y)!==(c[1]>b.y)&&b.x<(c[0]-a[0])*(b.y-a[1])/(c[1]-a[1])+a[0])inside=!inside;}
 return inside?'centre':overlapsLcd(b)?'boundary-only':'none';
}
export const COMPARISON_CONDITIONS=Object.freeze({phases:[0,.175,.35,.525],kinds:['mechanical','finite-stock-fixed-loss'],seconds:300,drain:45,power:.20,launchInterval:.6,updateSeconds:1/120,mouthWidth:20,gravity:GRAVITY,guide:'current-factory-tray',initialStock:400,finiteLottery:'constant .9 fixed-loss calibration'});
export function gapSummary(times,seconds){const inside=times.filter(t=>t>=0&&t<=seconds).sort((a,b)=>a-b);let previous=0,maxGap=0;for(const t of inside){maxGap=Math.max(maxGap,t-previous);previous=t;}return {entries:inside.length,maxGap:Math.max(maxGap,seconds-previous),first:inside[0]??null,last:inside.at(-1)??null,windowSeconds:seconds};}
export function measurePinAdjustment(config,{phase=0,kind='mechanical',seconds=300,drain=45,replaySeconds=0,replayFPS=60,mode='normal',normalPower=config.normalPower??.20,onProgress=()=>{}}={}){
 if(![30,60].includes(replayFPS))throw new Error('Unsupported replay FPS');
 if(config.normalPower!==undefined&&normalPower!==config.normalPower)throw new Error('Normal power override disagrees with trial configuration');
 if(!Number.isFinite(normalPower)||normalPower<0||normalPower>1)throw new Error('Invalid trial normal power');
 // Short windows are explicitly recorded for direct tests, not accepted full comparison.
 if(!['normal','rush','bonus'].includes(mode)||(kind!=='mechanical'&&mode!=='normal')||!COMPARISON_CONDITIONS.phases.includes(phase)||!COMPARISON_CONDITIONS.kinds.includes(kind)||!Number.isFinite(seconds)||seconds<=0||seconds>300||!Number.isFinite(drain)||drain<0||drain>45||Math.abs(seconds*120-Math.round(seconds*120))>1e-6||Math.abs(drain*120-Math.round(drain*120))>1e-6)throw new Error('Unsupported measurement conditions');
 const {pins,flowOptions}=resolvePinAdjustment(config),game=kind==='finite-stock-fixed-loss'?new SessionGame(()=>.9):null;
 const model=createBoardFlow({lcd:true,...flowOptions,normalPower,launchInterval:.6,...(game?{fire:()=>game.fire()}:{})});
 model.flow.physics.pins=structuredClone(pins);model.setMode(mode);
 const flow=model.flow,p=flow.physics,events=[],frames=[],replayFrames=[];
 const fixed=structuredClone({gravity:GRAVITY,ballRadius:p.ballRadius,colliders:p.colliders,pockets:p.pockets,mechanisms:p.mechanisms,outlet:p.outlet,launchExit:p.launchExit,...(p.nonReturnValve?{nonReturnValve:structuredClone(p.nonReturnValve)}:{}),launchSpeedOffset:p.launchSpeedOffset,gate:p.gate,rightChucker:p.rightChucker,returnOutlet:p.returnOutlet,separateLaunchPlane:p.separateLaunchPlane});
 if(p.pockets.find(q=>q.kind==='start').w!==(config.hesoMouthWidth??20))throw new Error('Factory mouth width changed; comparison requires review');
 const spin=game?attachNormalSpin(flow,{sessionGame:game,roundModel:model,lifecycle:true,presentationPatterns:true}):null;
 if(game){const lose=flow.game.lose.bind(flow.game);flow.game.lose=b=>{lose(b);game.lose(b);};const returned=flow.game.addStock.bind(flow.game);flow.game.addStock=n=>{returned(n);game.addStock(n,'returned');};}
 for(let i=0;i<Math.round(phase*120);i++)flow.step(1/120);
 const start=p.time,initial=game?.stock??null;
 const launchDiagnostics={canLaunchChecks:0,blockedChecks:0,firstBlocked:null,exitCrossedBallIds:[],frontPlaneBallIds:[],integrationSteps:0,physicsCalls:0,minSubsteps:null,maxSubsteps:0,firstFront:null};
 const exitIds=new Set(),frontIds=new Set();
 const canLaunch=p.canLaunch.bind(p);p.canLaunch=()=>{const ok=canLaunch();launchDiagnostics.canLaunchChecks++;if(!ok){launchDiagnostics.blockedChecks++;launchDiagnostics.firstBlocked??={time:p.time-start,remaining:p.balls.length};}return ok;};
 const advance=p.advanceBall.bind(p);p.advanceBall=(b,dt,options)=>{const oldCross=!!b.launchExitCrossed,oldFront=!!b.leftLaunchPlane,result=advance(b,dt,options);if(!options?.predict){if(!oldCross&&b.launchExitCrossed)exitIds.add(b.id);if(!oldFront&&b.leftLaunchPlane){frontIds.add(b.id);launchDiagnostics.firstFront??={time:p.time-start,ballId:b.id,x:b.x,y:b.y};}}return result;};
 let observingPhysics=false,gateCalls=0;const update=p.updateGate.bind(p);p.updateGate=(...args)=>{if(observingPhysics)gateCalls++;return update(...args);};
 const physicsStep=p.step.bind(p);p.step=(...args)=>{gateCalls=0;observingPhysics=true;try{return physicsStep(...args);}finally{observingPhysics=false;const substeps=Math.max(0,gateCalls-1);launchDiagnostics.physicsCalls++;launchDiagnostics.integrationSteps+=substeps;launchDiagnostics.minSubsteps=Math.min(launchDiagnostics.minSubsteps??substeps,substeps);launchDiagnostics.maxSubsteps=Math.max(launchDiagnostics.maxSubsteps,substeps);}};

 const log=(type,details={})=>events.push({time:p.time-start,type,...details});
 const spawn=p.spawn.bind(p);p.spawn=(...args)=>{const ball=spawn(...args);log('shot',{ballId:ball.id});return ball;};
 const hit=flow.game.hit.bind(flow.game);flow.game.hit=(ball,kind,id)=>{const before=game?.accounting.payout??0;hit(ball,kind,id);log('admission',{ballId:ball.id,kind,pocketId:id,payoutDelta:game?game.accounting.payout-before:null});};
 const outcome=p.recordOutcome.bind(p);p.recordOutcome=(ball,kind)=>{outcome(ball,kind);log('outcome',{ballId:ball.id,kind});};
 const stockUnavailable=[];let unavailable=false;
 const lcdIntrusion={sampling:'after each fixed 1/120 flow step; centre inside vs radius-only boundary overlap are separate',centreBallIds:[],boundaryOnlyBallIds:[],centreSamples:0,boundaryOnlySamples:0,firstCentre:null,firstBoundaryOnly:null,frontCentreBallIds:[],frontBoundaryOnlyBallIds:[],frontCentreSamples:0,frontBoundaryOnlySamples:0,firstFrontCentre:null,firstFrontBoundaryOnly:null,frontDefinition:'Physical LCD-opening overlap after fixed step, with separateLaunchPlane disabled or actual leftLaunchPlane true; all-layer overlaps retained separately.'};
 const centreIds=new Set(),boundaryIds=new Set(),frontCentreIds=new Set(),frontBoundaryIds=new Set();
 const observeLCD=()=>{for(const b of p.balls){const kind=classifyLCDContact(b),front=isFrontPlaneBall(p,b),point={time:p.time-start,ballId:b.id,x:b.x,y:b.y,r:b.r,leftLaunchPlane:!!b.leftLaunchPlane,onRightSurface:!!b.onRightSurface};
  if(kind==='centre'){centreIds.add(b.id);lcdIntrusion.centreSamples++;lcdIntrusion.firstCentre??=point;if(front){frontCentreIds.add(b.id);lcdIntrusion.frontCentreSamples++;lcdIntrusion.firstFrontCentre??=point;}}
  else if(kind==='boundary-only'){boundaryIds.add(b.id);lcdIntrusion.boundaryOnlySamples++;lcdIntrusion.firstBoundaryOnly??=point;if(front){frontBoundaryIds.add(b.id);lcdIntrusion.frontBoundaryOnlySamples++;lcdIntrusion.firstFrontBoundaryOnly??=point;}}
 }};
 const replayFrame=()=>({time:p.time-start,...(p.nonReturnValve?{nonReturnValve:structuredClone(p.nonReturnValve)}:{}),balls:p.balls.map(b=>({id:b.id,x:b.x,y:b.y,r:b.r,vx:b.vx,vy:b.vy,leftLaunchPlane:!!b.leftLaunchPlane,launchExitCrossed:!!b.launchExitCrossed,...(p.nonReturnValve?{nonReturnValveCrossed:!!b.nonReturnValveCrossed}:{}),onRightSurface:!!b.onRightSurface,routeDepth:b.routeDepth??null})),counts:{...flow.counts},mechanisms:structuredClone(p.mechanisms),spawned:p.metrics.spawned,inFlight:p.balls.length});
 if(replaySeconds>0)replayFrames.push(replayFrame());
 const step=()=>{if(game)game.pendingBalls=p.balls.length;flow.step(1/120);observeLCD();if(game&&flow.continuous&&(game.stock<1)!==unavailable){unavailable=game.stock<1;stockUnavailable.push({time:p.time-start,unavailable});}};
 const frame=()=>frames.push({time:p.time-start,balls:p.balls.map(b=>({id:b.id,x:b.x,y:b.y,r:b.r})),counts:{...flow.counts}});
 frame();flow.start();const total=Math.round((seconds+drain)*120);let n=0;
 for(let i=0;i<Math.round(seconds*120);i++){step();n++;if(replaySeconds>0&&n%(120/replayFPS)===0&&n<=replaySeconds*120)replayFrames.push(replayFrame());if(n%120===0){frame();onProgress({phase,kind,completedSeconds:n/120,totalSeconds:total/120,stage:'firing'});}}
 flow.stop();const atStop={time:p.time-start,remaining:p.balls.length,counts:{...flow.counts},stock:game?.stock??null};
 for(let i=0;i<Math.round(drain*120);i++){step();n++;if(replaySeconds>0&&n%(120/replayFPS)===0&&n<=replaySeconds*120)replayFrames.push(replayFrame());if(n%120===0){frame();onProgress({phase,kind,completedSeconds:n/120,totalSeconds:total/120,stage:'drain'});}}
 frame();const end={time:p.time-start,remaining:p.balls.length,counts:{...flow.counts},stock:game?.stock??null},shots=p.metrics.spawned,outcomes=events.filter(e=>e.type==='outcome');
 const ids=outcomes.map(e=>e.ballId),shotIds=new Set(events.filter(e=>e.type==='shot').map(e=>e.ballId));
 const physical={shots,outcomes:outcomes.length,remaining:end.remaining,reconciled:shots===outcomes.length+end.remaining,uniqueOutcomeIds:new Set(ids).size===ids.length,allOutcomesFromShots:ids.every(id=>shotIds.has(id)),countsMatchOutcomes:Object.values(end.counts).reduce((a,b)=>a+b,0)===outcomes.length};
 const ledger=game?{initial,final:game.stock,...game.accounting}:null;
 if(ledger){const expected=initial+ledger.payout+ledger.returned+ledger.supply+ledger.debugAdjustment-ledger.spent;ledger.check={expectedStock:expected,stockDelta:game.stock-expected,spentMatchesShots:ledger.spent===shots,reconciled:game.stock===expected};}
 const observed=Math.min(seconds,atStop.time),starts=events.filter(e=>e.type==='admission'&&e.kind==='start').map(e=>e.time);
 const observation={requestedFiringSeconds:seconds,observedPhysicsFiringSeconds:observed,firingPaddingSeconds:Math.max(0,seconds-observed),requestedDrainSeconds:drain,observedPhysicsDrainSeconds:Math.max(0,end.time-atStop.time),observedFiringGap:gapSummary(starts,observed),requestedWindowGapIncludingPadding:gapSummary(starts,seconds),stopPhase:game?.phase??'mechanical'};
 lcdIntrusion.centreBallIds=[...centreIds];lcdIntrusion.boundaryOnlyBallIds=[...boundaryIds];lcdIntrusion.frontCentreBallIds=[...frontCentreIds];lcdIntrusion.frontBoundaryOnlyBallIds=[...frontBoundaryIds];
 launchDiagnostics.exitCrossedBallIds=[...exitIds];launchDiagnostics.frontPlaneBallIds=[...frontIds];
 const result={...(p.nonReturnValve?{nonReturnValve:structuredClone(p.nonReturnValve)}:{}),railGeometry:{profile:p.launchRailProfile??'legacy',reference:p.launchRailReference??null},launchDiagnostics,display:{ballRadius:p.ballRadius,displayBallScale:p.displayBallScale,displayBallDiameter:p.displayBallDiameter??null,textureExtent:28,spriteScaleDivisor:3,spriteBoundingDiameter:28*p.displayBallScale/3},lcdIntrusion,endDiagnostics:p.diagnostics(),config:structuredClone(config),replayFrames,replayFPS,phase,kind,conditions:{phase,kind,mode,seconds,drain,power:mode==='normal'?normalPower:.85,launchInterval:.6,updateSeconds:1/120,mouthWidth:config.hesoMouthWidth??20,ballRadius:p.ballRadius,solver:'Existing radius-dependent Physics.step substeps, observed via updateGate calls minus initial call; unchanged.',gravity:GRAVITY,guide:config.leftAdmissionGuides?'current-factory-tray':'source-walls-retained-no-added-heso-tray',initialStock:initial,lottery:game?'constant .9 fixed-loss calibration':'no SessionGame/lottery/stock'},events,frames,pins,fixed,atStop,end,physical,ledger,observation,routeMetrics:model.leftMetrics.snapshot(),mechanismEndState:structuredClone(p.mechanisms),drainEntries:starts.filter(t=>t>seconds).length,session:game?{phase:game.phase,time:game.time,draws:game.draws,accepted:spin.snapshot().accepted,hold:game.holdCount,active:game.spinActive,jackpots:game.jackpots,stockUnavailable}:null};
 if(!physical.reconciled||!physical.uniqueOutcomeIds||!physical.allOutcomesFromShots||!physical.countsMatchOutcomes||ledger&&(!ledger.check.reconciled||!ledger.check.spentMatchesShots))throw Object.assign(new Error('Measurement count/accounting mismatch'),{result});
 return result;
}
