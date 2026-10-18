import {mountBoard} from '../../src/pixi/board-runtime.js';
import {PLAY_CAMERA} from '../../src/pixi/intro-camera.js';
import {same,validateRun,validateSummary,representatives,floorSample,diagnosticSamples,frontClearCross} from './trial-input.mjs';
const canvas=document.querySelector('#view'),ctx=canvas.getContext('2d');
let input,api,model,geometry,samples=[],disposed=false;
function geometryEqual(a,b,label){
 const visit=(x,y,p)=>{if(typeof x==='number'&&typeof y==='number'){if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x-y)>1e-10)throw Error(label+' '+p);return;}if(x&&y&&typeof x==='object'&&typeof y==='object'){same(Object.keys(x).sort(),Object.keys(y).sort(),label+' fields '+p);for(const k of Object.keys(x))visit(x[k],y[k],p+'.'+k);}else if(x!==y)throw Error(label+' '+p);};visit(a,b,'root');
}
function text(s,x,y,size=20,color='#d1e4ef'){ctx.font=`${size}px sans-serif`;ctx.fillStyle=color;ctx.fillText(s,x,y);}
function lines(s,x,y,width,size=18){let line='',n=0;ctx.font=`${size}px sans-serif`;for(const c of s){if(ctx.measureText(line+c).width>width){text(line,x,y+26*n,size);line=c;n++;}else line+=c;}if(line)text(line,x,y+26*n,size);return n+1;}
function circle(p,r,project,color,fill=false){const q=project(p);ctx.beginPath();ctx.arc(q.x,q.y,r*project.scale,0,Math.PI*2);ctx.strokeStyle=color;ctx.fillStyle=color;fill?ctx.fill():ctx.stroke();}
function path(points,project,color,width=1,close=false){if(!points?.length)return;ctx.beginPath();for(const [i,p]of points.entries()){const q=project(p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}if(close)ctx.closePath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function areaProject(crop,area){const scale=Math.min(area.w/crop.w,area.h/crop.h),ox=area.x+(area.w-crop.w*scale)/2,oy=area.y+(area.h-crop.h*scale)/2;const project=p=>({x:ox+(p.x-crop.x)*scale,y:oy+(p.y-crop.y)*scale});project.scale=scale;return project;}
const boardPoint=p=>({x:p.x*PLAY_CAMERA.scale+PLAY_CAMERA.x,y:p.y*PLAY_CAMERA.scale+PLAY_CAMERA.y});
function drawBoard(frame,area,crop,ballId){
 api.applyTrialFrame(frame);const snap=api.snapshot();same(snap.counts,frame.counts,'Actual board count mismatch');if(snap.spawned!==frame.spawned||snap.inFlight!==frame.inFlight)throw Error('Actual board shot/residual mismatch');
 const a=crop??{x:0,y:0,w:396,h:436},p=areaProject(a,area),top=p(a);ctx.drawImage(api.canvas,a.x*api.canvas.width/396,a.y*api.canvas.height/436,a.w*api.canvas.width/396,a.h*api.canvas.height/436,top.x,top.y,a.w*p.scale,a.h*p.scale);
 const ball=frame.balls.find(b=>b.id===ballId);if(ball){const q=p(boardPoint(ball));ctx.strokeStyle='#ffe39a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,Math.max(5,ball.r*PLAY_CAMERA.scale*p.scale+3),0,Math.PI*2);ctx.stroke();}return {index:input.run.replayFrames.indexOf(frame),time:frame.time,counts:frame.counts,spawned:frame.spawned,inFlight:frame.inFlight,trackedBall:ball??null};
}
const outcomeName=k=>({out:'OUT',start:'ヘソ入賞',normal:'一般入賞',returned:'返却',fuzu:'普図始動',rush:'右の始動口',bonus:'アタッカー入賞'}[k]??k);
function partName(c,id){const p=c.part;if(p.kind==='pin')return `釘${p.id}`;if(p.kind==='windmill-arm')return `風車の羽根${(p.armIndex??p.index)+1}`;if(p.kind==='ball-pair')return `別の玉ID${c.before.id===id?c.peerBefore?.id:c.before.id}`;if(p.role==='out-left')return p.a.y>=583?'下の壁（OUT側）':p.a.y<=444?'左の壁（風車の左）':'左下の壁';if(p.role==='heso-guide')return 'ヘソの追加受け皿';if(p.role?.startsWith('lcd-boundary'))return '液晶枠の壁';if(p.role?.startsWith('launch-'))return '発射レール';if(p.role==='normal-rim')return '一般入賞口の縁';if(p.role==='start-rim')return 'ヘソ口の縁';return `その他の接触部材（${p.role??p.kind}）`;}
function contactPart(part,project){
 if(!part)return;if(part.kind==='pin'){circle(part,part.r,project,'#ffad75');return;}
 if(part.shape==='solid-polygon'){path(part.solid.points,project,'#ffad75',2,true);return;}
 if(part.a&&part.b){path([part.a,part.b],project,'#ffad75',Math.max(1,(part.r??.7)*2*project.scale));}
}
window.s8RouteReview={canvas,async load(data){
 if(input||disposed)throw Error('Reload for new observation');validateRun(data.run);validateSummary(data.summary);input=data;
 samples=diagnosticSamples(data.trace,data.ballId);if(!samples.length)throw Error('No actual substep after snapshots');
 try{api=await mountBoard(document.querySelector('.source'),{production:true,trialReplay:true,flowOptions:data.run.flowOptions,reviewHook:v=>{model=v.model;}});api.setSound(false);api.setView('board');
  const p=model.flow.physics;same(p.pins,data.run.pins,'101 actual renderer pins');for(const k of ['ballRadius','colliders','pockets','mechanisms','outlet','launchExit','launchSpeedOffset','gate','rightChucker','returnOutlet','separateLaunchPlane'])geometryEqual(p[k],data.run.fixed[k],'Fixed geometry '+k);
  same({ballRadius:p.ballRadius,displayBallScale:p.displayBallScale,displayBallDiameter:p.displayBallDiameter??null,textureExtent:28,spriteScaleDivisor:3,spriteBoundingDiameter:28*p.displayBallScale/3},data.run.display,'Actual default ball display');
  geometry={pins:p.pins,fixed:data.run.fixed,display:data.run.display,camera:PLAY_CAMERA,sourceSHA:data.run.sourceSHA,groups:representatives(data.summary)};return geometry;
 }catch(e){this.dispose();throw e;}
},paint(time,{mode='scene',speed=1,traceSeq=null,endpoint=null,diagnosticCrop={x:20,y:390,w:450,h:310}}={}){
 if(!input||disposed||!['scene','diagnostic','map'].includes(mode)||![1,.5,.25,.125].includes(speed))throw Error('Invalid display mode/speed');
 const r=input.run,id=input.ballId,row=input.summary.balls.find(b=>b.ballId===id);if(!row)throw Error('Ball not in all250 summary');
 const selectedEvent=traceSeq===null?null:input.trace.find(e=>e.seq===traceSeq);if(traceSeq!==null&&!selectedEvent)throw Error('Unknown actual trace sequence');
 const effectiveTime=selectedEvent?.time??time;const regular=floorSample(r.replayFrames,Math.min(effectiveTime,r.replayFrames.at(-1).time));const frame=endpoint?r.replayEndpoints[endpoint]:regular.frame;if(!frame)throw Error('No actual endpoint');
 ctx.fillStyle='#071421';ctx.fillRect(0,0,1280,1080);text(mode==='map'?'元配置250球：場所別の観測図':mode==='diagnostic'?'実盤面30Hzとsubstep計測図（別表示）':'元配置250球：保存した実盤面の記録',24,43,30,'#fff');
 text('元101釘・強度0.18・球/物理/レール/口20/皿/風車位置は固定。改善比較ではありません。',24,77,19);
 text(`球ID${id} ／ ${speed}倍 ／ 補間・物理再計算なし ／ ${endpoint?'実'+endpoint+'端点（30Hz列とは別）':'保存sampleのみ'}`,24,108,20);
 const receipt={mode,speed,ballId:id,requestedTime:time,endpoint,sourceSHA:r.sourceSHA};
 if(mode==='map'){
  const project=areaProject({x:25,y:440,w:310,h:250},{x:24,y:153,w:850,h:720});
  r.pins.forEach(p=>circle(p,p.r,project,'#f4d594'));for(const g of input.summary.gaps){const centre=new Set(input.summary.balls.filter(b=>b.gapCrossings.some(c=>c.gapId===g.id&&c.sourceKind==='kinematic-motion'&&c.direction==='descending')).map(b=>b.ballId)),unique=new Set(input.summary.balls.filter(b=>b.gapCrossings.some(c=>c.gapId===g.id&&frontClearCross(c))).map(b=>b.ballId));path([g.a,g.b],project,g.classification==='large-break'?'#ffbda0':'#91d5ed',1);if(centre.size){const p=project({x:(g.a.x+g.b.x)/2,y:(g.a.y+g.b.y)/2});text(`${g.id}:中${centre.size}/前円${unique.size}`,p.x,p.y-5,12);}}
  text('中＝全中心線cross／前円＝両端前面・接触円余白あり（球ID一意）',24,912,19);text('法線の下側へのcrossで、鉛直自由落下・連続通過・OUT原因の証明ではありません。',24,942,17);text('複数gapを通る球があるため各場所の球数は合算して250にしません。',24,972,17);let y=180;for(const g of geometry.groups){lines(`${g.key}：${g.count}球／最小ID${g.representativeId}`,900,y,350,17);y+=72;}receipt.groups=geometry.groups;
 }else{
  text(`実盤面：物理時刻${frame.time.toFixed(6)}秒`,24,146,21,'#fff');receipt.scene=drawBoard(frame,{x:24,y:176,w:600,h:690},null,id);
  if(mode==='scene'){
   text(`同じ30Hz記録の下流拡大：${frame.time.toFixed(6)}秒`,656,146,21,'#fff');drawBoard(frame,{x:656,y:176,w:600,h:690},{x:12,y:208,w:240,h:228},id);
  }else{
   if(endpoint)throw Error('Diagnostic uses trace sequence, not replay endpoint');
   const event=selectedEvent;
   let sample;if(event){sample=samples.find(s=>s.substepIndex===event.substepIndex)??null;}else sample=floorSample(samples,time).frame;
   if(!sample)throw Error('Missing actual substep');const seq=event?.seq??sample.seq,actualTime=event?.time??sample.time;
   const contacts=input.trace.filter(e=>e.seq<=seq&&e.type==='contact'&&(e.before.id===id||e.peerBefore?.id===id));const gaps=input.trace.filter(e=>e.seq<=seq&&e.type==='gap-cross'&&e.ballId===id);
   const ball=event?(event.after?.id===id?event.after:event.peerAfter?.id===id?event.peerAfter:event.ball?.id===id?event.ball:null):sample.ball;
   const project=areaProject(diagnosticCrop,{x:656,y:176,w:600,h:600});ctx.save();ctx.beginPath();ctx.rect(656,176,600,600);ctx.clip();
   for(const c of r.fixed.colliders){ctx.setLineDash(c.active===false?[3,4]:[]);if(c.shape==='solid-polygon')path(c.solid.points,project,'#536c80',1,true);else if(c.a&&c.b)path([c.a,c.b],project,'#536c80',Math.max(1,c.r*2*project.scale));}ctx.setLineDash([]);
   for(const p of r.pins){circle(p,p.r,project,'#f4d594');if([1,2,10,11,22,23,26,90,91,92].includes(p.id)){const q=project(p);text(String(p.id),q.x+3,q.y-3,12);}}
   for(const g of input.summary.gaps)path([g.a,g.b],project,g.classification==='large-break'?'#e5a3d7':'#6b8698',.5);
   const wheel=r.fixed.mechanisms[0];ctx.setLineDash([5,4]);circle(wheel,11.3,project,'#b8b8ef');ctx.setLineDash([]);const wc=project(wheel);path([{x:wheel.x-1.5,y:wheel.y},{x:wheel.x+1.5,y:wheel.y}],project,'#b8b8ef');path([{x:wheel.x,y:wheel.y-1.5},{x:wheel.x,y:wheel.y+1.5}],project,'#b8b8ef');text('風車中心',wc.x+5,wc.y-6,13);
   const recent=input.trace.filter(e=>e.type==='motion'&&e.after.id===id&&e.seq<=seq&&e.time>=actualTime-.8);for(const e of recent)path([e.before,e.after],project,'#63cbea',1);
   for(const e of contacts.filter(e=>e.time>=actualTime-.8)){const a=e.after.id===id?e.before:e.peerBefore,b=e.after.id===id?e.after:e.peerAfter;path([a,b],project,'#ffad75',2);}
   if(contacts.length)contactPart(contacts.at(-1).part,project);if(ball){circle(ball,ball.r,project,ball.front?'#fff':'#a99de7');const q=project(ball);text(`ID${id}${ball.front?'前':'背'}`,q.x+7,q.y,15);}
   ctx.restore();text(`計測図：実時刻${actualTime.toFixed(9)}秒／seq${seq}`,656,146,20,'#fff');text('青：実積分sample線／橙：実位置補正・接触形状',656,804,17);text('破線R11.3：回転包絡。接触部材そのものではありません。',656,827,16);text('接触軸の計測図。実角度のない4腕を推定描画しません。',656,848,15);
   const c=contacts.at(-1),g=gaps.at(-1),cb=c?.before.id===id?c?.before:c?.peerBefore,ca=c?.after.id===id?c?.after:c?.peerAfter,trackedVelocityChanged=!!c&&(cb.vx!==ca.vx||cb.vy!==ca.vy);lines(c?`最後の実変更接触：${partName(c,id)}／${trackedVelocityChanged?'当該球の速度変化あり':'当該球の位置補正のみ'}／${c.time.toFixed(6)}秒／終点まで${(row.outcome.time-c.time).toFixed(3)}秒`:'この時点まで実変更接触なし',656,878,600,16);
   lines(g?`幾何gap観測：${g.gapId} ${g.direction==='descending'?'列の上側→下側':'列の下側→上側'}／${g.sourceKind}／前面${g.frontBefore&&g.frontAfter?'両端':'非一致'}・円余白${g.discClearAtCentreCross?'有':'無'}（原因未認定）`:'この時点まで有限gap中心線crossなし',656,947,600,15);
   receipt.diagnostic={seq,time:actualTime,substepIndex:event?.substepIndex??sample.substepIndex,ball,lastContact:c??null,trackedVelocityChanged,lastGapCross:g??null,crop:diagnosticCrop,pixelsPerInternalUnit:project.scale,windmillEnvelope:{center:{x:wheel.x,y:wheel.y},radius:11.3,meaning:'Swept arm bound, not a solid contact part; no inferred angle'}};
  }
  text(`30Hz実計数：発射${frame.spawned}／ヘソ${frame.counts.start}／一般${frame.counts.normal}／OUT${frame.counts.out}／返却${frame.counts.returned}／残${frame.inFlight}`,24,1011,19);
 }
 text(`この玉の記録上の終点：${outcomeName(row.outcome.kind)}／実時刻${row.outcome.time.toFixed(9)}秒`,24,1035,16);
 text('観測は原因の証明・修正の採用ではありません。内部座標／実寸mm未校正。無音検証資料。',24,1056,18);return receipt;
},dispose(){disposed=true;api?.dispose();api=null;input=null;}};
