import {installHesoGuides} from './heso-guide.js';
import {installRightResinRoute,attachRightRouteDepth} from './right-resin-route.js';
import {attachPassGate} from './pass-gate.js';
import {attachLeftRouteMetrics} from './left-route-metrics.js';
import {installLcdBoundary} from './lcd-layout.js';
import {createPartFlow} from '../physics/ball-flow.js';
import {attachRightStartMotion} from './right-start-motion.js';
import {attachAttackerMotion} from './attacker-motion.js';
// Combined mechanical review only. Individual approved previews remain unchanged.
export function createBoardFlow({lcd=false,normalPower=.20,launchInterval=.6,rightPower=.85,passGate=true,fire=null,pegSeed=0}={}){
 const options={fire,pegSeed,launchPower:.5,launchInterval:lcd?launchInterval:.1},flow=createPartFlow('normal',options);
 const tulip=attachRightStartMotion(flow),attacker=attachAttackerMotion(flow);
 // Shared guide: keep the tulip's upper clearance and the attacker's lower centre.
 const guide=flow.physics.colliders.find(c=>c.role==='right-inner-lower');guide.a.x=336;guide.b.x=330;
 if(lcd){installLcdBoundary(flow.physics);installHesoGuides(flow.physics);installRightResinRoute(flow.physics);attachRightRouteDepth(flow.physics);}
 let currentMode='normal';
 const setMode=mode=>{currentMode=mode;options.launchPower=mode==='normal'?(lcd?normalPower:.5):(lcd?rightPower:1);flow.game.rush=mode==='rush'?{}:null;attacker.request(mode==='bonus');tulip.request(mode==='rush');};
 const leftMetrics=lcd?attachLeftRouteMetrics(flow):null;
 const setNormalPower=value=>{if(!Number.isFinite(value))return;normalPower=Math.max(0,Math.min(1,value));if(lcd&&currentMode==='normal')options.launchPower=normalPower;};
 const gate=lcd&&passGate?attachPassGate(flow):null;
 return {flow,tulip,attacker,getMode:()=>currentMode,setMode,leftMetrics,setNormalPower,gate};
}
