// Original authored story windows. Display only: no game/RNG/result dependency.
const freezeCuts=cuts=>Object.freeze(cuts.map(([at,frame,event])=>Object.freeze({at,frame,event})));
export const STORY_PRESENTATIONS=Object.freeze({
 step:Object.freeze({seconds:3,cuts:freezeCuts([[0,0,'footstep'],[.55,1,'trace'],[1,2,'grip'],[1.55,3,'blade'],[2,4,'look'],[2.55,5,'resolve']])}),
 memory:Object.freeze({seconds:4.5,cuts:freezeCuts([[0,0,'courtyard'],[.65,1,'promise'],[1.4,2,'token'],[2.15,3,'separation'],[3,4,'present'],[3.8,5,'remember']])}),
 episode:Object.freeze({seconds:6,cuts:freezeCuts([[0,0,'gate'],[1,1,'civilians'],[2,2,'brace'],[3,3,'passage'],[4,4,'threat'],[5,5,'guard']])}),
 pursuit:Object.freeze({seconds:4.8,cuts:freezeCuts([[0,0,'shadow'],[.8,1,'tracks'],[1.5,2,'run'],[2.3,3,'leap'],[3.1,4,'landing'],[3.9,5,'destination']])}),
 rescue:Object.freeze({seconds:6,cuts:freezeCuts([[0,0,'collapse'],[1,1,'notice'],[2,2,'step'],[3,3,'reach'],[4,4,'block'],[5,5,'protect']])})
});
export const STORY_FAMILY_MAPPING=Object.freeze({step:'step',character:'step',story:'memory',identity:'memory',episode:'episode',trail:'pursuit',search:'pursuit',pursuit:'pursuit',long:'pursuit',resolve:'rescue'});
export function storyPredictionPose({family,time,start=0,duration,mode='normal',reducedEffects=false}={}){
 const kind=STORY_FAMILY_MAPPING[family]??(Object.hasOwn(STORY_PRESENTATIONS,family)?family:null);
 if(!kind)throw new RangeError('Unsupported story family');
 if(!['normal','rush'].includes(mode))throw new RangeError('Unknown mode');
 const story=STORY_PRESENTATIONS[kind];duration??=story.seconds;
 if(!Number.isFinite(time)||!Number.isFinite(start)||!Number.isFinite(duration)||duration<1.2||duration>12)throw new RangeError('Finite story window of 1.2–12 seconds required');
 const age=time-start,visible=age>=0&&age<duration,progress=Math.max(0,Math.min(1,age/duration));
 // Brief cues use purposeful entry/action/resolve cuts rather than racing six
 // cuts past the player. Full scenes retain every authored event.
 const selected=duration<1.8?[0,5]:duration<3?({rescue:[0,3,5],episode:[0,2,5],pursuit:[0,3,5],memory:[0,2,5],step:[0,2,5]}[kind]):duration===5||duration<story.seconds?(kind==='memory'?[0,1,2,4,5]:[0,1,3,4,5]):[0,1,2,3,4,5];
 const cuts=selected.map(i=>story.cuts[i]);
 // Edited versions give every selected event its own reading time. They do
 // not compress the omitted events into the shorter mechanical window.
 const authored=selected.length===6;
 const fraction=i=>authored?cuts[i].at/story.seconds:i/cuts.length;
 const cutIndex=Math.max(0,cuts.findLastIndex((c,i)=>progress>=fraction(i)));
 const cut=cuts[cutIndex],cutAt=fraction(cutIndex)*duration;
 const nextAt=cutIndex+1<cuts.length?fraction(cutIndex+1)*duration:duration;
 const local=age-cutAt,transition=cutIndex>0?Math.max(0,Math.min(1,local/.09)):1;
 const previousFrame=cutIndex>0?cuts[cutIndex-1].frame:cut.frame;
 const contact=['block','brace','landing','step','footstep'].includes(cut.event);
 const reaction=contact&&local>=0&&local<.16?(1-local/.16)**2:0;
 const cameraX=reducedEffects?0:kind==='pursuit'?Math.min(1,Math.max(0,local/(nextAt-cutAt)))*1.5:0;
 return {kind,family,mode,visible,finished:age>=duration,duration,age,progress,frame:cut.frame,previousFrame,event:cut.event,cutIndex,cutAge:local,transition,
  alpha:visible?Math.min(1,age/.12,(duration-age)/.18):0,cameraX,
  impact:reducedEffects?0:reaction,particleCount:reducedEffects?0:kind==='rescue'?10:kind==='pursuit'?7:kind==='episode'?8:0,
  memoryWarmth:kind==='memory'&&cut.frame<4?1:0,shortened:duration<3,
  overlaySafeRect:{x:75,y:3,width:60,height:27},result:null};
}
