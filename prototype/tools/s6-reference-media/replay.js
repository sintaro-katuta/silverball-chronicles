import {mountBoard} from '../../src/pixi/board-runtime.js';
const canvas=document.querySelector('#view'),ctx=canvas.getContext('2d');let boards=[],input;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function sample(run,time){const f=run.replayFrames;let l=0,h=f.length;while(l<h){const m=(l+h)>>1;if(f[m].time<=time+1e-8)l=m+1;else h=m;}return {index:Math.max(0,l-1),frame:f[Math.max(0,l-1)]};}
window.referenceReview={canvas,async load(data){
 if(boards.length||data.cases.length!==2)throw Error('Two actual cases required; reload before another pair');input=data;const geometry=[];
 for(const c of data.cases){const host=document.createElement('div');host.className='source';host.innerHTML='<div id="canvas"></div>';document.querySelector('.sources').append(host);let model;
 const api=await mountBoard(host,{production:true,trialReplay:true,flowOptions:c.run.flowOptions,reviewHook:({model:m})=>model=m});api.setView('board');api.setSound(false);const p=model.flow.physics;
 if(!same(p.pins,c.run.pins)||Math.abs(p.ballRadius-c.run.conditions.ballRadius)>1e-9)throw Error('Actual renderer pins/radius mismatch');
 const solids=p.colliders.filter(c=>c.shape==='solid-polygon');for(const s of solids){const v=p.railVisibleShape?.components.find(v=>v.id===s.sourceComponentId);if(v&&!same(v.worldPoints,s.solid.points))throw Error('Shared rail polygon differs');}
 boards.push({api,c});geometry.push({id:c.run.config.id,pins:p.pins,colliders:p.colliders,ballRadius:p.ballRadius,displayBallDiameter:p.displayBallDiameter});}
 return geometry;
 },paint(time,{crop=null}={}){
 if(!input||!Number.isFinite(time)||time<0||time>input.duration+1e-7)throw Error('Time outside full actual replay');ctx.fillStyle='#071421';ctx.fillRect(0,0,1280,1080);ctx.fillStyle='#fff';ctx.font='bold 31px sans-serif';ctx.fillText('左上の狙いを保つ釘比較：実試射の同時刻',28,46);ctx.font='21px sans-serif';ctx.fillText(`${crop?'同倍率拡大再掲':'同倍率の盤面全体'}／発射0.14は未採用の実験対照／条件・壁・レール・球径は固定`,28,87);const states=[];
 for(let i=0;i<boards.length;i++){const {api,c}=boards[i],s=sample(c.run,time),f=s.frame,x=24+i*632;api.applyTrialFrame(f);const snap=api.snapshot();if(snap.spawned!==f.spawned||snap.inFlight!==f.balls.length||!same(snap.counts,f.counts))throw Error('Display counters differ from actual frame');const ca=api.canvas;ctx.fillStyle='#fff';ctx.font='bold 26px sans-serif';ctx.fillText(c.label,x,130);ctx.font='21px sans-serif';ctx.fillText(`試射${f.time.toFixed(3)}秒／開始条件${input.phase}／実記録${c.run.replayFPS}Hz`,x,169);
 if(crop){const rx=ca.width/396,ry=ca.height/436;ctx.drawImage(ca,crop.x*rx,crop.y*ry,crop.w*rx,crop.h*ry,x,195,600,738);}else ctx.drawImage(ca,x,195,600,660.606);
 ctx.fillStyle='#d2e5f3';ctx.font='22px sans-serif';ctx.fillText(`発射${f.spawned}／ヘソ${f.counts.start}／一般${f.counts.normal}`,x,925);ctx.fillText(`OUT${f.counts.out}／返却${f.counts.returned}／残球${f.balls.length}`,x,967);states.push({id:c.run.config.id,requestedTime:time,actualTime:f.time,index:s.index,counts:f.counts,spawned:f.spawned,inFlight:f.balls.length});}
 ctx.font='19px sans-serif';ctx.fillText('保存した実座標・層・機構角を再生。補間/物理再計算なし。内部単位で実寸mm未校正。本編未適用。',28,1045);return states;
 },dispose(){for(const b of boards)b.api.dispose();boards=[];input=null;}};
