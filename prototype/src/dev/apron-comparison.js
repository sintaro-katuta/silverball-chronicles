import {APRON_DROP_POINTS,apronClearance,APRON_SEGMENT} from './apron-comparison-model.js';
import {createFrameRouteTrial} from './frame-route-trial-model.js';
import review from './frame-route-results.json';
import {createBoardTrim} from '../pixi/board-trim.js';
import {createCabinetForeground} from '../pixi/cabinet-foreground.js';
const $=s=>document.querySelector(s),source=p=>[p.x*2+28,(p.y-120)*2],points=ps=>ps.map(p=>source(p).join(',')).join(' ');
const views={road:[155,685,380,235],return:[125,590,125,175],lower:[90,580,720,365],all:[60,140,780,820]};
const captions={calibrated:['小径玉・元の初速','釘位置と絵は同じ。玉の直径は現在の60%、発射初速は元の校正値。外形線は装飾とする比較案です。'],'lcd-only':['枠の接触だけ見直す','玉径と発射は現在のまま。外形線を装飾とし、液晶の実開口に接触を設けます。通過は未達です。'],'diagonal-only':['斜線1区間だけ外す','玉径・釘・発射は現在のまま。橙の斜め1区間だけ接触なし。部分試験でも詰まりが残りました。']};
let models,balls=[],trails=[new Map(),new Map()],running=false,paused=false,time=0,last=0,art,mode='drop',stopped=[null,null];
const defs=id=>`<defs><radialGradient id="silver-${id}" cx="30%" cy="25%"><stop stop-color="#fff"/><stop offset=".38" stop-color="#e1edf3"/><stop offset=".75" stop-color="#96a9bb"/><stop offset="1" stop-color="#4d6174"/></radialGradient></defs>`;
function reset(){models=[createFrameRouteTrial(),createFrameRouteTrial($('#trial-kind').value)];balls=[];trails=[new Map(),new Map()];time=0;running=false;paused=false;stopped=[null,null];mode='drop';$('#pause').disabled=true;$('#pause').textContent='一時停止';const[title,description]=captions[$('#trial-kind').value];$('#trial-title').textContent=title;$('#trial-description').textContent=description;renderStatic();update();$('#status').textContent='「自然発射で30玉比較」で、発射口から下へ抜けるまで確認できます。';}
function guideLines(p,{reach=false,original=false}={}){
 return p.colliders.filter(c=>c.sourceGuideId||c.trialLcdEdge).map(c=>{
  const target=c.sourceGuideId===APRON_SEGMENT.id&&c.sourceGuideSegment===APRON_SEGMENT.segment,ps=points([c.a,c.b]);
  if(reach)return c.active===false?'':`<polyline points="${ps}" fill="none" stroke="#e74f68" stroke-opacity=".18" stroke-width="${4*(c.r+p.ballRadius)}" stroke-linecap="round"/>`;
  const color=c.active===false?'#e9bb76':c.trialLcdEdge?'#85d8d2':target?original?'#b33e48':'#ff8391':original?'#407596':'#91b0c5';
  return `<polyline points="${ps}" fill="none" stroke="${color}" opacity="${c.active===false?.7:.85}" stroke-width="${target?Math.max(1.5,c.r*4):Math.max(.6,c.r*4)}" stroke-linecap="round"${c.active===false?' stroke-dasharray="4 3"':''}/>`;
 }).join('');
}
function pins(p,{reach=false,original=false}={}){return p.pins.map(q=>{const[x,y]=source(q);return reach?`<circle cx="${x}" cy="${y}" r="${(q.r+p.ballRadius)*2}" fill="#e74f68" opacity=".17"/>`:`<circle cx="${x}" cy="${y}" r="1.55" fill="${original?'#b3924c':'#d2b56e'}" stroke="${original?'#645331':'#ffdc8c'}" stroke-width=".45"/>`;}).join('');}
function renderStatic(){
 if(!models)return;const view=views[$('#region').value].join(' '),contact=$('#contacts').checked,reach=$('#reach').checked;
 $('#original').setAttribute('viewBox',view);$('#original').innerHTML=`<image href="/reference-review/pixi-source-layout/reference.jpg" width="904" height="1280"/>${$('#original-overlay').checked?`${reach?guideLines(models[0].physics,{reach:true})+pins(models[0].physics,{reach:true}):''}${contact?guideLines(models[0].physics,{original:true}):''}${pins(models[0].physics,{original:true})}`:''}`;
 for(const[id,i]of[['current',0],['decorative',1]]){const p=models[i].physics,node=$('#'+id);node.setAttribute('viewBox',view);node.innerHTML=`${defs(id)}<rect width="904" height="1280" fill="#142638"/><g class="rear-moving"></g><image href="${art}" x="28" y="20" width="840" height="1120"/>${reach?guideLines(p,{reach:true})+pins(p,{reach:true}):''}${contact?guideLines(p):''}${pins(p)}<g class="drop-marker"></g><g class="moving"></g>`;}
 update();
}
const settled=i=>Object.values(models[i].flow.counts).reduce((a,b)=>a+b,0);
function update(){
 if(!models)return;const point=APRON_DROP_POINTS[Number($('#drop-position').value)];
 for(const[id,i]of[['current',0],['decorative',1]]){
  const svg=$('#'+id),p=models[i].physics,active=mode==='natural'?p.balls:balls[i]&&!balls[i].dead?[balls[i]]:[],b=balls[i];if(!svg.querySelector('.moving'))continue;
  svg.querySelector('.drop-marker').innerHTML=balls.length||running||time>0||mode==='natural'?'':`<circle class="sample-point" cx="${point[0]}" cy="${point[1]}" r="${p.ballRadius*2}"/>`;
  const renderBall=q=>{const pos=source(q),ps=(trails[i].get(q.id)??[]).map(p=>p.join(',')).join(' ');return`<polyline class="motion-path" points="${ps}"/><circle class="ball" cx="${pos[0]}" cy="${pos[1]}" r="${q.r*2}" style="fill:url(#silver-${id})"/>`;};
  svg.querySelector('.rear-moving').innerHTML=active.filter(q=>!q.leftLaunchPlane).map(renderBall).join('');svg.querySelector('.moving').innerHTML=active.filter(q=>q.leftLaunchPlane).map(renderBall).join('');
  const c=models[i].flow.counts;let desc='玉を落とす前';
  if(mode==='natural')desc=`${time.toFixed(1)}秒 · 発射${p.metrics.spawned}/30 · 入賞${settled(i)-c.out-c.returned} · 排出${c.out} · 返却${c.returned} · 残球${p.balls.length}`;
  else if(b&&!running&&time===0)desc='玉の大きさを静止して確認中';
  else if(b)desc=`${time.toFixed(1)}秒 · ${b.dead?'排出・入賞済み':Math.hypot(b.vx,b.vy)<1&&time>1?'ほぼ停止':'移動中'} · 最後の接触：${b.lastContact==='lcd-boundary-20'?'枠の縁':b.lastContact==='michi'?'道釘':b.lastContact==='prize'?'釘':b.lastContact?'ほかの部品':'なし'}`;
  $('#'+id+'-result').textContent=desc;
 }
}
function start(natural){reset();mode=natural?'natural':'drop';if(natural){for(const m of models)m.flow.start();$('#region').value='all';renderStatic();}else balls=models.map(m=>m.drop(APRON_DROP_POINTS[Number($('#drop-position').value)]));running=true;last=performance.now();$('#pause').disabled=false;$('#status').textContent=natural?'同じ0.6秒間隔で30玉を自然発射します。発射後25秒まで残球を観察します。':'同じ位置から1玉落下。両方とも現在の玉径です。';update();}
function frame(now){
 if(running&&!paused){const dt=Math.min(.05,(now-last)/1000)*Number($('#speed').value);time+=dt;
  for(let i=0;i<models.length;i++){
   const m=models[i],p=m.physics;m.step(dt);
   if(mode==='natural'&&p.metrics.spawned>=30&&stopped[i]===null){m.flow.stop();stopped[i]=p.time;}
   const active=mode==='natural'?p.balls:balls[i]&&!balls[i].dead?[balls[i]]:[];
   for(const b of active){const ps=trails[i].get(b.id)??[],point=source(b),prev=ps.at(-1);if(!prev||Math.hypot(prev[0]-point[0],prev[1]-point[1])>1){ps.push(point);if(ps.length>160)ps.shift();}trails[i].set(b.id,ps);}
  }
  const done=mode==='natural'?stopped.every((t,i)=>t!==null&&models[i].physics.time-t>=25):time>=12||balls.every(b=>b.dead);
  if(done){running=false;$('#pause').disabled=true;$('#status').textContent=mode==='natural'?'観察終了。発射数だけでなく、入賞・排出・返却・残球を比較してください。':'部分試験終了。自然発射の結果とは区別してください。';}update();
 }
 last=now;requestAnimationFrame(frame);
}
try{
 const reference=new Image();reference.src='/reference-review/pixi-source-layout/reference.jpg';await reference.decode();
 const p=createFrameRouteTrial().physics,canvas=createBoardTrim(p),c=canvas.getContext('2d');c.drawImage(createCabinetForeground(p),0,0);art=canvas.toDataURL('image/png');
 const g=apronClearance(p);$('#dimensions').textContent=`現在の釘と斜線の隙間：約${(g.min*2).toFixed(1)}〜${(g.max*2).toFixed(1)} ／ 現在の玉直径：12、比較案も12（元画像px換算。実寸ではありません）`;
 const total=review.calibrated.reduce((a,r)=>a+r.spawned,0);$('#verification').textContent='玉径を維持して検証中';$('#verified-details').textContent='小径案の採用依頼は撤回しました。現在の玉径での通過条件は未達です。';
 $('#evidence-rows').innerHTML=[...review.baselines,...review.calibrated].map(r=>`<tr><td>${r.config.label}${r.kind==='calibrated'?`（開始差${r.phase}秒）`:''}</td><td>${r.spawned}玉</td><td>${r.remaining.length}玉</td><td>${r.remaining.length===0?'通過確認':'未達'}</td></tr>`).join('');
 $('#region').onchange=renderStatic;for(const id of['contacts','reach','original-overlay'])$('#'+id).onchange=renderStatic;
 $('#drop-position').onchange=reset;$('#trial-kind').onchange=reset;$('#drop').onclick=()=>start(false);$('#natural').onclick=()=>start(true);$('#reset').onclick=reset;
 $('#size-check').onclick=()=>{reset();$('#region').value='road';balls=models.map(m=>m.drop(APRON_DROP_POINTS[Number($('#drop-position').value)]));renderStatic();$('#status').textContent='同じ倍率・同じ位置で玉を静止しています。両方とも現在の玉径を維持しています。';};
 $('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'再開':'一時停止';$('#status').textContent=paused?'両方を一時停止しています。':'比較を再開しました。';};
 reset();requestAnimationFrame(frame);
}catch(error){$('#error').hidden=false;$('#error').textContent=`比較画面を読み込めませんでした：${error.message}`;$('#drop').disabled=true;$('#natural').disabled=true;}
