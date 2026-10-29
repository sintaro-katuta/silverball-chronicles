import {sourcePoint} from './source-layout.js';
import {prepareRecessedTrack} from '../physics/recessed-track.js';
// Confirmed: entrance 174.3,634.7; recessed passage; return to the nail
// plane directly above the heso. Interior points/depth are a local prototype,
// not a new transcription or a measured Tokyo Ghoul mechanism.
export const LEFT_STAGE_SOURCE=[
 [174.3,634.7,0],[185,645,12],[201,663,18],[201,695,18],
 [400,796,18],[430,805,18],[445,815,18],[445,823,12],[445,833,0]
];
export function installLeftStageRoute(physics){
 const points=LEFT_STAGE_SOURCE.map(([sx,sy,z])=>{const[x,y]=sourcePoint([sx,sy]);return{x,y,depth:z*.5};});
 physics.leftStageTrack=prepareRecessedTrack(points,{mouthWidth:12});
 physics.leftEntranceContactProfile='recessed-stage-v1';physics.leftStageMetrics={entered:0,exited:0};
}
