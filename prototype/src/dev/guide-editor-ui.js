import './guide-editor-ui.css';
import {editorScopeLines,isRightEditorLine,isRightJoiningLine} from './guide-editor-scope.js';
import {RIGHT_UPPER_GUIDE_SOURCE} from '../pixi/source-right-upper-guide.js';
import {initialDocument,validateDocument,importDocument,exportDocument,createHistory,linePath,nearestInsertion,clone,roundPoint} from './guide-editor-model.js';
import {ROAD_SOURCE,LEFT_PINS_SOURCE,RIGHT_ROAD_SOURCE} from '../pixi/source-layout.js';
const el=id=>document.getElementById(id),svg=el('editor-canvas'),ns='http://www.w3.org/2000/svg';
const workspace=new URLSearchParams(location.search).get('workspace')??'main',storageKey=`silverball:guide-editor:v1:${workspace.slice(0,80)}`;
const baseline=initialDocument();let recovered=null,restoreError='';
try{const raw=localStorage.getItem(storageKey);if(raw)recovered=importDocument(JSON.parse(raw));}catch{restoreError='自動保存を読み込めませんでした。保存ファイルがあれば「読込」で戻せます。';}
let savedView=null;try{savedView=JSON.parse(localStorage.getItem(storageKey+':view'));}catch{}
let doc=clone(recovered??baseline),history=createHistory(doc),selected=doc.lines.find(l=>l.id===savedView?.selected)?.id??doc.lines[0]?.id??null,selectedPoint=null,tool='edit',spaceHeld=false,bareHeld=false,drag=null,drawStart=null,view=null,pointer=null,noticeTimer=null,lastSize=null,saveError=false,lastTap=null;
let editScope=savedView?.scope==='right'?'right':'all';
el('edit-scope').value=editScope;el('only-selected').checked=savedView?.onlySelected===true;el('keep-view').checked=savedView?.keepView!==false;
const scopeLines=()=>editorScopeLines(doc,editScope,selected);
let viewSaveTimer;function rememberView(){clearTimeout(viewSaveTimer);viewSaveTimer=setTimeout(()=>{try{localStorage.setItem(storageKey+':view',JSON.stringify({selected,view,scope:editScope,onlySelected:el('only-selected').checked,keepView:el('keep-view').checked}));}catch{}},150);}
const selectedLine=()=>doc.lines.find(l=>l.id===selected);
const make=(tag,attrs={})=>{const node=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))node.setAttribute(k,String(v));return node;};
function notify(text,error=false){el('notice').textContent=text;el('notice').className=`visible${error?' error':''}`;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el('notice').className='',error?7000:3300);}
function saveDraft(){try{localStorage.setItem(storageKey,JSON.stringify({format:'silverball-guide-layout',version:1,reference:{width:904,height:1280},lines:doc.lines}));el('save-state').textContent='このブラウザに自動保存済み';saveError=false;}catch{el('save-state').textContent='自動保存できません · ファイル保存を使ってください';if(!saveError)notify('自動保存できません。「作業を保存」でファイルを残してください。',true);saveError=true;}}
function commit(next,{full=true}={}){if(history.commit(next)){doc=clone(history.value);saveDraft();}refresh(full);}
function changeSelected(fn){const next=clone(doc),line=next.lines.find(l=>l.id===selected);if(!line)return;fn(line);commit(next);}
function setView(next){view=next;rememberView();svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);el('zoom-level').textContent=`${Math.round(svg.clientWidth/view.w*100)}%`;draw();}
function fitRect([x,y,w,h],pad=20){const aspect=Math.max(.2,svg.clientWidth/Math.max(1,svg.clientHeight)),width=Math.max(w+pad*2,(h+pad*2)*aspect);setView({x:x+w/2-width/2,y:y+h/2-width/aspect/2,w:width,h:width/aspect});}
function fitSelection(){const line=selectedLine();if(!line?.points.length){fitRect([65,240,760,710]);return;}const xs=line.points.map(p=>p[0]),ys=line.points.map(p=>p[1]);fitRect([Math.min(...xs),Math.min(...ys),Math.max(40,Math.max(...xs)-Math.min(...xs)),Math.max(40,Math.max(...ys)-Math.min(...ys))],25);}
function toWorld(event){const rect=svg.getBoundingClientRect();return [view.x+(event.clientX-rect.left)/rect.width*view.w,view.y+(event.clientY-rect.top)/rect.height*view.h];}
function zoom(factor,client=null){if(!view)return;const rect=svg.getBoundingClientRect(),u=client?(client[0]-rect.left)/rect.width:.5,v=client?(client[1]-rect.top)/rect.height:.5,w=Math.max(20,Math.min(2500,view.w/factor)),h=w*view.h/view.w;setView({x:view.x+view.w*u-w*u,y:view.y+view.h*v-h*v,w,h});}
function updateLoupe(p){pointer=p;el('cursor-position').textContent=`X ${p[0].toFixed(1)}　Y ${p[1].toFixed(1)}`;const inside=p[0]>=0&&p[0]<=904&&p[1]>=0&&p[1]<=1280;el('loupe').hidden=!inside||!el('show-loupe').checked;if(!el('loupe').hidden){el('loupe').querySelector('svg').setAttribute('viewBox',`${p[0]-12} ${p[1]-12} 24 24`);el('loupe-cross').setAttribute('d',`M${p[0]-4},${p[1]}h8 M${p[0]},${p[1]-4}v8`);el('loupe').querySelector('span').textContent=`元画像 ×${Math.round(el('loupe').clientWidth/24)}`;}}
function updateProps(){const line=selectedLine(),controls=el('line-name').closest('section').querySelectorAll('input,select,button');for(const c of controls)c.disabled=!line;
 if(line){el('line-name').value=line.name;el('line-mode').value=line.mode;el('line-kind').value=line.kind;el('closed-line').checked=line.closed;el('reviewed-line').checked=line.reviewed;}
 const point=line?.points[selectedPoint];el('point-controls').hidden=!point;if(point){el('point-x').value=point[0];el('point-y').value=point[1];}
}
function renderList(){const list=el('line-list');const scroll=list.scrollTop;list.replaceChildren();el('line-count').textContent=editScope==='right'?`${scopeLines().length} / 全${doc.lines.length}`:String(doc.lines.length);
 el('scope-hint').textContent=editScope==='right'?'右側の線をまとめて表示。赤が選択線、青が他の線、灰色は接続確認用です。':'線を選んで、丸い点をドラッグ。赤が選択線、青が周りの線です。';
 for(const line of scopeLines()){const row=document.createElement('div');row.className=`line-row${line.id===selected?' selected':''}`;const button=document.createElement('button');button.className='line-select';button.textContent=line.name||'名前のない線';button.setAttribute('aria-label',`線を選択：${line.name}`);button.setAttribute('aria-pressed',String(line.id===selected));button.onclick=()=>{finishDrawing();selected=line.id;selectedPoint=null;refresh();if(!el('keep-view').checked)fitSelection();};row.append(button);
  if(line.reviewed){const mark=document.createElement('span');mark.className='review-dot';mark.textContent='✓';mark.title='確認済み';row.append(mark);}
  const eye=document.createElement('button');eye.className='line-eye';eye.textContent=line.visible?'◉':'○';eye.setAttribute('aria-label',`${line.name}を${line.visible?'非表示':'表示'}`);eye.setAttribute('aria-pressed',String(line.visible));eye.onclick=()=>{const next=clone(doc);next.lines.find(l=>l.id===line.id).visible=!line.visible;commit(next);};row.append(eye);list.append(row);
 }list.scrollTop=scroll;
}
function draw(){if(!view)return;const scale=svg.clientWidth/view.w,show=el('show-lines').checked&&!bareHeld;
 for(const id of ['lines-layer','handles-layer','drawing-preview','context-layer'])el(id).replaceChildren();
 el('baseline-layer').style.display=el('show-baseline').checked&&!bareHeld?'':'none';el('pins-layer').style.display=el('show-pins').checked&&!bareHeld?'':'none';
 if(show&&editScope==='right'){
  const context=[...doc.lines.filter(isRightJoiningLine),{points:RIGHT_UPPER_GUIDE_SOURCE,closed:true,mode:'polyline'}];
  for(const line of context)el('context-layer').append(make('path',{d:linePath(line),class:'line-visible',stroke:'#697887','stroke-width':1,'stroke-dasharray':'3 3',opacity:.8}));
 }
 if(show)for(const line of scopeLines()){if(!line.visible||el('only-selected').checked&&line.id!==selected)continue;const active=line.id===selected;
  const group=make('g',{'data-line-id':line.id});group.append(make('path',{d:linePath(line),class:'line-hit','data-line-id':line.id}),make('path',{d:linePath(line),class:'line-visible',stroke:active?'#d73270':line.kind==='detail'?'#b07631':editScope==='right'?'#1677c8':'#5482a0','stroke-width':active?2.5:editScope==='right'?2:1,opacity:active?1:editScope==='right'?.95:.65}));el('lines-layer').append(group);
 }
 const current=selectedLine();if(show&&current?.visible&&(editScope!=='right'||isRightEditorLine(current)||current.points.length===0)){for(const[p,index]of current.points.map((p,i)=>[p,i])){el('handles-layer').append(make('circle',{cx:p[0],cy:p[1],r:9/scale,fill:'transparent','pointer-events':'all',class:'point-hit','data-point-index':index}),make('circle',{cx:p[0],cy:p[1],r:(selectedPoint===index?5.5:4)/scale,class:`handle${selectedPoint===index?' active':''}`,'pointer-events':'none'}));}
  if(tool==='draw'&&pointer&&current.points.length){const a=current.points.at(-1);el('drawing-preview').append(make('path',{d:`M${a}L${pointer}`,'stroke-dasharray':'4 4',stroke:'#d73270','stroke-width':1,'vector-effect':'non-scaling-stroke',fill:'none'}));}
 }
 el('empty-canvas-hint').hidden=!(tool==='draw'&&!current?.points.length);
 el('finish-line').hidden=tool!=='draw';svg.dataset.tool=spaceHeld?'pan':tool;
 el('operation-hint').textContent=tool==='insert'?'線の途中をクリックして点を追加 · 追加した点はドラッグで調整':tool==='draw'?'クリックで点を置く · Enterで終了 · Escで中止':tool==='pan'||spaceHeld?'ドラッグして画面を移動':'点をドラッグ · 点を増やすときは「点を追加」';
}
function refresh(full=true){rememberView();if(full){renderList();updateProps();}else{const p=selectedLine()?.points[selectedPoint];if(p){el('point-x').value=p[0];el('point-y').value=p[1];}}for(const b of document.querySelectorAll('[data-tool]'))b.setAttribute('aria-pressed',String(b.dataset.tool===tool));el('undo').disabled=!history.canUndo;el('redo').disabled=!history.canRedo;el('fit-selection').disabled=!selectedLine()?.points.length;draw();}
function finishDrawing(){if(tool!=='draw')return;tool='edit';drawStart=null;const line=selectedLine();if(line&&!line.points.length){const next=clone(doc);next.lines=next.lines.filter(l=>l.id!==line.id);selected=next.lines[0]?.id??null;selectedPoint=null;commit(next);}else refresh();}
function startNewLine(){finishDrawing();drawStart=clone(doc);const next=clone(doc),id=`user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;let n=1;while(next.lines.some(l=>l.name===`新しい線 ${n}`))n++;next.lines.push({id,sourceTemplateId:null,name:`新しい線 ${n}`,kind:'guide',mode:'polyline',closed:false,reviewed:false,visible:true,points:[]});selected=id;selectedPoint=null;tool='draw';commit(next);svg.focus({preventScroll:true});notify('画像を順にクリック。Enterで線を終えます。');}
function deletePoint(){const line=selectedLine();if(!line||selectedPoint===null||!line.points[selectedPoint])return;const index=selectedPoint;selectedPoint=null;changeSelected(l=>{l.points.splice(index,1);l.reviewed=false;});notify('点を削除しました。元に戻すで取り消せます。');}
function undoRedo(which){drag=null;drawStart=null;tool='edit';if(history[which]()){doc=clone(history.value);if(!selectedLine())selected=doc.lines[0]?.id??null;selectedPoint=null;saveDraft();refresh();}}
for(const line of baseline.lines)el('baseline-layer').append(make('path',{d:linePath(line),fill:'none',stroke:'#5682a0','stroke-width':1,'stroke-dasharray':'4 3','vector-effect':'non-scaling-stroke',opacity:.65}));
for(const[x,y]of[...ROAD_SOURCE,...LEFT_PINS_SOURCE,...RIGHT_ROAD_SOURCE])el('pins-layer').append(make('circle',{cx:x,cy:y,r:3,fill:'none',stroke:'#239267','stroke-width':1,'vector-effect':'non-scaling-stroke'}));
el('reference-image').addEventListener('error',()=>{el('image-error').hidden=false;});
function insertAt(event){const target=event.target.closest('[data-line-id]');if(target)selected=target.dataset.lineId;const line=selectedLine();if(!line)return false;const hit=nearestInsertion(line,toWorld(event));if(!hit||hit.distance>12*view.w/svg.clientWidth)return false;selectedPoint=hit.index;changeSelected(l=>{l.points.splice(hit.index,0,hit.point);l.reviewed=false;});notify('途中に点を追加しました。ドラッグして調整できます。');return true;}
svg.addEventListener('pointerdown',event=>{
 if(event.button!==0&&event.button!==1)return;svg.focus({preventScroll:true});const p=toWorld(event);updateLoupe(p);
 if(spaceHeld||tool==='pan'||event.button===1){event.preventDefault();drag={kind:'pan',x:event.clientX,y:event.clientY,view:{...view}};svg.setPointerCapture(event.pointerId);svg.classList.add('dragging');return;}
 if(tool==='draw'){event.preventDefault();if(p[0]<0||p[0]>904||p[1]<0||p[1]>1280)return;const line=selectedLine();if(!line)return;const q=roundPoint(p),last=line.points.at(-1);if(last&&Math.hypot(q[0]-last[0],q[1]-last[1])<.1)return;selectedPoint=line.points.length;changeSelected(l=>{l.points.push(q);l.reviewed=false;});return;}
 if(tool==='insert'){event.preventDefault();if(insertAt(event)){tool='edit';refresh();}return;}
 const handle=event.target.closest('[data-point-index]');if(handle){event.preventDefault();selectedPoint=Number(handle.dataset.pointIndex);drag={kind:'point',before:clone(doc)};svg.setPointerCapture(event.pointerId);refresh();return;}
 const now=Date.now(),double=event.detail>=2||lastTap&&now-lastTap.time<400&&Math.hypot(event.clientX-lastTap.x,event.clientY-lastTap.y)<8;lastTap={time:now,x:event.clientX,y:event.clientY};if(double&&insertAt(event)){lastTap=null;return;}
 const target=event.target.closest('[data-line-id]');if(target){const changed=selected!==target.dataset.lineId||selectedPoint!==null;selected=target.dataset.lineId;selectedPoint=null;if(changed)refresh();}else if(selectedPoint!==null){selectedPoint=null;refresh();}
});
svg.addEventListener('pointermove',event=>{const p=toWorld(event);updateLoupe(p);if(drag?.kind==='pan'){const rect=svg.getBoundingClientRect();setView({...drag.view,x:drag.view.x-(event.clientX-drag.x)/rect.width*drag.view.w,y:drag.view.y-(event.clientY-drag.y)/rect.height*drag.view.h});return;}if(drag?.kind==='point'){const line=selectedLine();if(line?.points[selectedPoint]){line.points[selectedPoint]=roundPoint(p);line.reviewed=false;refresh(false);}return;}if(tool==='draw')draw();});
function endDrag(event,cancel=false){if(!drag)return;const pending=drag;drag=null;svg.classList.remove('dragging');if(svg.hasPointerCapture(event.pointerId))svg.releasePointerCapture(event.pointerId);if(pending.kind==='point'){if(cancel){doc=pending.before;refresh();}else commit(doc);}}
svg.addEventListener('pointerup',event=>endDrag(event));svg.addEventListener('pointercancel',event=>endDrag(event,true));
svg.addEventListener('pointerleave',()=>{if(!drag){el('loupe').hidden=true;el('drawing-preview').replaceChildren();}});
svg.addEventListener('dblclick',event=>{event.preventDefault();if(tool==='draw')finishDrawing();});
svg.addEventListener('wheel',event=>{event.preventDefault();zoom(Math.exp(-Math.max(-150,Math.min(150,event.deltaY))*.004),[event.clientX,event.clientY]);},{passive:false});
for(const b of document.querySelectorAll('[data-tool]'))b.onclick=()=>{if(b.dataset.tool==='draw'){if(tool!=='draw')startNewLine();return;}finishDrawing();tool=b.dataset.tool;refresh();};
el('new-line').onclick=startNewLine;el('finish-line').onclick=finishDrawing;
el('undo').onclick=()=>undoRedo('undo');el('redo').onclick=()=>undoRedo('redo');el('zoom-in').onclick=()=>zoom(1.35);el('zoom-out').onclick=()=>zoom(1/1.35);el('fit-board').onclick=()=>fitRect([65,240,760,710]);el('fit-image').onclick=()=>fitRect([0,0,904,1280],10);el('fit-selection').onclick=fitSelection;
const regions={'right-all':[500,230,330,710],electric:[510,770,170,155],'left-top':[90,330,120,260],'left-bottom':[80,555,160,205],bottom:[170,700,510,165],'right-top':[675,240,150,425],'right-bottom':[525,600,290,340]};for(const b of document.querySelectorAll('[data-region]'))b.onclick=()=>fitRect(regions[b.dataset.region],12);
for(const id of['only-selected','show-lines','show-baseline','show-pins'])el(id).onchange=()=>{rememberView();draw();};el('keep-view').onchange=rememberView;el('show-loupe').onchange=()=>{if(pointer)updateLoupe(pointer);};
el('edit-scope').onchange=()=>{
 finishDrawing();editScope=el('edit-scope').value;el('only-selected').checked=false;
 if(editScope==='right'&&!isRightEditorLine(selectedLine()??{points:[]}))selected=scopeLines()[0]?.id??null;
 selectedPoint=null;refresh();rememberView();
};
el('line-name').onchange=()=>changeSelected(l=>{l.name=el('line-name').value.trim()||'名前のない線';});
for(const[id,key]of[['line-mode','mode'],['line-kind','kind']])el(id).onchange=()=>changeSelected(l=>{l[key]=el(id).value;l.reviewed=false;});
el('closed-line').onchange=()=>changeSelected(l=>{l.closed=el('closed-line').checked;l.reviewed=false;});el('reviewed-line').onchange=()=>changeSelected(l=>l.reviewed=el('reviewed-line').checked);
for(const id of['point-x','point-y'])el(id).onchange=()=>{const x=Number(el('point-x').value),y=Number(el('point-y').value);if(!Number.isFinite(x)||!Number.isFinite(y))return;changeSelected(l=>{if(l.points[selectedPoint])l.points[selectedPoint]=roundPoint([x,y]);l.reviewed=false;});};
el('delete-point').onclick=deletePoint;el('delete-line').onclick=()=>{if(!selectedLine())return;const next=clone(doc);next.lines=next.lines.filter(l=>l.id!==selected);selected=next.lines[0]?.id??null;selectedPoint=null;drawStart=null;tool='edit';commit(next);notify('線を削除しました。元に戻すで取り消せます。');};
el('reset-draft').onclick=()=>el('confirm-dialog').showModal();el('confirm-dialog').addEventListener('close',()=>{if(el('confirm-dialog').returnValue!=='ok')return;selected=baseline.lines[0]?.id??null;selectedPoint=null;tool='edit';drawStart=null;commit(clone(baseline));fitRect([65,240,760,710]);notify('最初の下書きへ戻しました。元に戻すで取り消せます。');});
el('export-file').onclick=()=>{try{const data=exportDocument(doc),stamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19),blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`guide-layout-${stamp}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);notify('作業ファイルを保存しました。続きは「読込」で開けます。');}catch(error){notify(error.message,true);}};
el('import-file').onchange=async event=>{const file=event.target.files?.[0];if(!file)return;try{if(file.size>2_000_000)throw Error('ファイルが大きすぎます。このツールで保存したJSONを選んでください。');const next=importDocument(JSON.parse(await file.text()));finishDrawing();selected=next.lines[0]?.id??null;selectedPoint=null;tool='edit';commit(next);fitRect([65,240,760,710]);notify('作業を読み込みました。元に戻すで取り消せます。');}catch(error){notify(error instanceof SyntaxError?'JSONを読み取れませんでした。保存した作業ファイルを選んでください。':error.message,true);}finally{event.target.value='';}};
window.addEventListener('keydown',event=>{const typing=event.target.closest('input,select,textarea,[contenteditable=true]');if(typing||el('confirm-dialog').open)return;const mod=event.metaKey||event.ctrlKey;
 if(mod&&event.key.toLowerCase()==='z'){event.preventDefault();undoRedo(event.shiftKey?'redo':'undo');return;}if(mod&&event.key.toLowerCase()==='y'){event.preventDefault();undoRedo('redo');return;}if(mod&&event.key.toLowerCase()==='s'){event.preventDefault();el('export-file').click();return;}
 if(event.code==='Space'){event.preventDefault();spaceHeld=true;draw();return;}if(event.key.toLowerCase()==='b'&&!mod){bareHeld=true;draw();return;}
 if(event.key==='Escape'){if(drag?.kind==='point'){doc=drag.before;drag=null;refresh();return;}if(tool==='draw'&&drawStart){const original=drawStart;drawStart=null;tool='edit';selected=original.lines[0]?.id??null;selectedPoint=null;commit(original);notify('新しい線の作成を中止しました。');}else{selectedPoint=null;finishDrawing();refresh();}return;}
 if(event.key==='Enter'&&tool==='draw'){event.preventDefault();finishDrawing();return;}if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();deletePoint();return;}
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)&&selectedPoint!==null){event.preventDefault();const amount=event.altKey?.1:event.shiftKey?10:1;changeSelected(l=>{const p=l.points[selectedPoint];if(!p)return;const dx=event.key==='ArrowLeft'?-amount:event.key==='ArrowRight'?amount:0,dy=event.key==='ArrowUp'?-amount:event.key==='ArrowDown'?amount:0;l.points[selectedPoint]=roundPoint([p[0]+dx,p[1]+dy]);l.reviewed=false;});return;}
 if(mod||event.altKey)return;if(event.key.toLowerCase()==='v'){finishDrawing();tool='edit';refresh();}if(event.key.toLowerCase()==='p')startNewLine();if(event.key.toLowerCase()==='h'){finishDrawing();tool='pan';refresh();}
});
window.addEventListener('keyup',event=>{if(event.code==='Space'){spaceHeld=false;draw();}if(event.key.toLowerCase()==='b'){bareHeld=false;draw();}});window.addEventListener('blur',()=>{spaceHeld=false;bareHeld=false;if(drag?.kind==='point'){commit(doc);}drag=null;svg.classList.remove('dragging');draw();});
new ResizeObserver(()=>{const width=svg.clientWidth,height=svg.clientHeight;if(!width||!height)return;if(!view){const old=savedView?.view;if(old&&[old.x,old.y,old.w,old.h].every(Number.isFinite)&&old.w>=20&&old.w<=2500&&old.h>0){const h=old.w*height/width;setView({...old,y:old.y+old.h/2-h/2,h});}else fitRect([65,240,760,710]);}else if(lastSize&&(width!==lastSize[0]||height!==lastSize[1])){const aspect=width/height,h=view.w/aspect;setView({...view,y:view.y+view.h/2-h/2,h});}lastSize=[width,height];}).observe(el('canvas-wrap'));
refresh();el('save-state').textContent=recovered?'前回の作業を復元しました':'変更はこのブラウザに自動保存';if(restoreError)notify(restoreError,true);
