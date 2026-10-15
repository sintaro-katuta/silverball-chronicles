import {mountBoard} from '../../src/pixi/board-runtime.js';
import {PLAY_CAMERA} from '../../src/pixi/intro-camera.js';

const canvas=document.querySelector('#view'),ctx=canvas.getContext('2d');
let boards=[],input=null;
const canonical=v=>JSON.stringify(v===undefined?null:normalize(v));
function normalize(v){if(Array.isArray(v))return v.map(normalize);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])]));return v;}
function same(a,b,label){if(canonical(a)!==canonical(b)){const details=Array.isArray(a)&&Array.isArray(b)?a.map((v,i)=>canonical(v)!==canonical(b[i])?{index:i,actual:v,recorded:b[i]}:null).filter(Boolean).slice(0,4):{actual:a,recorded:b};throw Error(label+' mismatch '+JSON.stringify(details));}}
function sameGeometry(actual,recorded,label){
 let maximumDelta=0,numericLeaves=0;const a=JSON.parse(canonical(actual)),b=JSON.parse(canonical(recorded));
 function visit(x,y,path){if(typeof x==='number'&&typeof y==='number'&&Number.isFinite(x)&&Number.isFinite(y)){const d=Math.abs(x-y);maximumDelta=Math.max(maximumDelta,d);numericLeaves++;if(d>1e-10)throw Error(label+' coordinate differs beyond1e-10 at '+path);return;}if(x&&y&&typeof x==='object'&&typeof y==='object'){if(canonical(Object.keys(x))!==canonical(Object.keys(y)))throw Error(label+' structure differs at '+path);for(const k of Object.keys(x))visit(x[k],y[k],path+'.'+k);return;}if(x!==y)throw Error(label+' non-numeric field differs at '+path);}
 visit(a,b,'root');return {label,numericLeaves,maximumDelta,tolerance:1e-10,scope:'Cross-runtime floating point geometry only; paired Node raws remain exact'};
}
function sample(run,time){const frames=run.replayFrames;let l=0,h=frames.length;while(l<h){const m=(l+h)>>1;if(frames[m].time<=time+1e-8)l=m+1;else h=m;}const index=Math.max(0,l-1);return {index,frame:frames[index]};}
const sourceToBoard=(x,y)=>({x:(x*.5-14)*PLAY_CAMERA.scale+PLAY_CAMERA.x,y:(y*.5+120)*PLAY_CAMERA.scale+PLAY_CAMERA.y});
const presets={
 'upper-left':{x:20,y:20,w:150,h:170},
 downstream:{x:12,y:208,w:240,h:228},
};
function validateCrop(crop){if(!crop||['x','y','w','h'].some(k=>!Number.isFinite(crop[k]))||crop.x<0||crop.y<0||crop.w<=0||crop.h<=0||crop.x+crop.w>396||crop.y+crop.h>436)throw Error('Crop must lie in actual396x436 board view');return crop;}
function lines(text,x,y,maxWidth,fontSize=21){ctx.font=`${fontSize}px sans-serif`;let line='',row=0;for(const c of text){if(ctx.measureText(line+c).width>maxWidth&&line){ctx.fillText(line,x,y+row*28);line=c;row++;}else line+=c;}if(line)ctx.fillText(line,x,y+row*28);}

window.s7Review={canvas,sourceToBoard,async load(data){
 if(boards.length||data.cases?.length!==2)throw Error('Exactly two cases required; reload for another pair');
 if(!data.selectionStatus||data.selectionStatus.length>50)throw Error('Explicit short comparison/adoption status required');
 input=data;const geometry=[];
 try{for(const c of data.cases){
  const host=document.createElement('div');host.className='source';host.innerHTML='<div id="canvas"></div>';document.querySelector('.sources').append(host);let model;
  const api=await mountBoard(host,{production:true,trialReplay:true,flowOptions:c.run.flowOptions,reviewHook:({model:m})=>model=m});
  boards.push({api,c,model,host});api.setSound(false);api.setView('board');const p=model.flow.physics,actualFixed={},fixedComparisons=[];
  same(p.pins,c.run.pins,'All101 exact renderer pins');
  for(const key of ['ballRadius','colliders','pockets','mechanisms','outlet','launchExit','launchSpeedOffset','gate','rightChucker','returnOutlet','separateLaunchPlane']){actualFixed[key]=p[key];fixedComparisons.push(sameGeometry(p[key],c.run.fixed[key],'Renderer fixed '+key));}
  same({ballRadius:p.ballRadius,displayBallScale:p.displayBallScale,displayBallDiameter:p.displayBallDiameter??null,textureExtent:28,spriteScaleDivisor:3,spriteBoundingDiameter:28*p.displayBallScale/3},c.run.display,'Default radius/display');
  geometry.push({id:c.run.config.id,power:c.run.conditions.power,pins:p.pins,actualFixed,fixedComparisons,actualDisplay:c.run.display,canvas:{width:api.canvas.width,height:api.canvas.height},camera:PLAY_CAMERA,upperPinBoardPoints:p.pins.filter(v=>v.id>=27&&v.id<=36).map(v=>({id:v.id,x:v.x*PLAY_CAMERA.scale+PLAY_CAMERA.x,y:v.y*PLAY_CAMERA.scale+PLAY_CAMERA.y}))});
 }}catch(error){this.dispose();throw error;}
 return geometry;
},paint(time,{view='whole',crop=null,ballIds=null,showRegions=false,showEvents=false}={}){
 if(!input||!Number.isFinite(time)||time<0||time>input.duration+1e-7)throw Error('Requested time outside actual record');
 if(!['whole','upper-left','downstream','custom'].includes(view))throw Error('Unknown view');
 crop=crop?validateCrop(crop):presets[view]??null;
 ctx.fillStyle='#071421';ctx.fillRect(0,0,1280,1080);ctx.fillStyle='#fff';ctx.font='bold 31px sans-serif';ctx.fillText('左上の狙い：発射強度だけの同時刻比較',28,44);
 ctx.font='21px sans-serif';ctx.fillText(`${crop?'同倍率の拡大':'同倍率の盤面全体'}／従来レール・口20・皿あり・元101本・球表示と物理は共通`,28,80);
 ctx.fillStyle='#bdd8e8';ctx.fillText(input.selectionStatus,28,111);const states=[];
 for(let i=0;i<boards.length;i++){
  const {api,c}=boards[i],s=sample(c.run,time),f=s.frame,x=24+i*632;api.applyTrialFrame(f);const snap=api.snapshot();
  same(snap.counts,f.counts,'Displayed counts');if(snap.spawned!==f.spawned||snap.inFlight!==f.balls.length)throw Error('Actual frame counters differ');
  ctx.fillStyle='#fff';lines(c.label,x,151,600,25);ctx.font='20px sans-serif';ctx.fillText(`強度${c.run.conditions.power.toFixed(2)}／実時刻${f.time.toFixed(3)}秒／開始${input.phase}秒`,x,187);
  const area=crop??{x:0,y:0,w:396,h:436},scale=Math.min(600/area.w,700/area.h),dw=area.w*scale,dh=area.h*scale,dx=x+(600-dw)/2,dy=212+(700-dh)/2;
  ctx.drawImage(api.canvas,area.x*api.canvas.width/396,area.y*api.canvas.height/436,area.w*api.canvas.width/396,area.h*api.canvas.height/436,dx,dy,dw,dh);
  const project=p=>({x:dx+(p.x-area.x)*scale,y:dy+(p.y-area.y)*scale});
  if(showRegions){ctx.save();ctx.beginPath();ctx.rect(dx,dy,dw,dh);ctx.clip();for(const r of input.regions??[]){const [l,t,rr,bb]=r.sourceBounds,a=project(sourceToBoard(l,t)),b=project(sourceToBoard(rr,bb));ctx.strokeStyle=r.id==='A'?'#ff8181':'#7ce0ac';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);ctx.fillStyle=ctx.strokeStyle;ctx.font='bold 18px sans-serif';ctx.fillText(r.id,a.x+3,a.y+18);}ctx.restore();}
  const tracked=ballIds?.[i]??null,ball=tracked===null?null:f.balls.find(b=>b.id===tracked),observation=tracked===null?null:c.run.s7Observation.rows.find(r=>r.ballId===tracked);
  if(showEvents&&observation){ctx.save();ctx.beginPath();ctx.rect(dx,dy,dw,dh);ctx.clip();for(const [key,symbol,color]of [['firstFreeApex','△','#91d4ff'],['firstPinContact','×','#ffe4a0'],['firstTurningPoint','◇','#ffffff']]){const ev=observation[key];if(ev&&ev.time<=f.time+1e-8){const p=project({x:ev.x*PLAY_CAMERA.scale+PLAY_CAMERA.x,y:ev.y*PLAY_CAMERA.scale+PLAY_CAMERA.y});ctx.font='bold 20px sans-serif';ctx.fillStyle=color;ctx.fillText(symbol,p.x-6,p.y+6);}}ctx.restore();ctx.fillStyle='#d2e5f3';ctx.font='17px sans-serif';ctx.fillText('△自由頂点 ×実初接触 ◇初反転：同球の過去記録位置',x,207);}
  if(ball){const p=project({x:ball.x*PLAY_CAMERA.scale+PLAY_CAMERA.x,y:ball.y*PLAY_CAMERA.scale+PLAY_CAMERA.y});ctx.save();ctx.beginPath();ctx.rect(dx,dy,dw,dh);ctx.clip();ctx.strokeStyle='#ffe9ac';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(5,ball.r*scale+3),0,Math.PI*2);ctx.stroke();ctx.restore();}
  ctx.fillStyle='#d2e5f3';ctx.font='21px sans-serif';ctx.fillText(`発射${f.spawned}／ヘソ${f.counts.start}／一般${f.counts.normal}`,x,953);ctx.fillText(`OUT${f.counts.out}／返却${f.counts.returned}／残球${f.inFlight}`,x,984);
  if(tracked!==null)ctx.fillText(`同ケース球ID${tracked}：${ball?'記録位置を表示':'この時刻の盤面内には存在しない'}`,x,1014);
  states.push({id:c.run.config.id,power:c.run.conditions.power,requestedTime:time,actualTime:f.time,index:s.index,counts:f.counts,spawned:f.spawned,inFlight:f.inFlight,view,crop,trackedBall:ball?{...ball}:null,trackedId:tracked,observation});
 }
 ctx.fillStyle='#b9cfde';ctx.font='18px sans-serif';ctx.fillText('保存した実座標・層・機構角を再生。補間/物理再計算なし。実寸mm未校正。採否と全結果は別途表示。',24,1055);
 return states;
},dispose(){for(const b of boards){b.api.dispose();b.host.remove();}boards=[];input=null;}};
