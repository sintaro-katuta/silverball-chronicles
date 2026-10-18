import React from 'react';
import {AbsoluteFill,Audio,Composition,Img,OffthreadVideo,Sequence,registerRoot,staticFile} from 'remotion';
import approved from '../../docs/agile/s9-video/script.json';
type Clip={id:string;text:string;start_frame:number;duration_frames:number;audio_file:string};
type Sample={id:string;file:string;frames:number;title:string;detail:string};
type Data={ready:boolean;timeline:{clips:Clip[];total_duration_frames:number};samples:Sample[];stills:Record<string,string>};
const bg='#071421',ink='#f5f7fa',dim='#bfd0df',gold='#eed099';
const selected=['s9-03','s9-04','s9-05','s9-06','s9-07'];
export function schedule(d:Data){
 const blocks:{from:number;frames:number;kind:string;clip?:Clip;sample?:Sample}[]=[];let from=0;
 const add=(kind:string,frames:number,extra={})=>{blocks.push({from,frames,kind,...extra});from+=frames;};
 add('intro',180);
 for(const id of ['intro-before','intro-after','normal-before','normal-after']){const s=d.samples.find(s=>s.id===id)!;add('sample',s.frames,{sample:s});}
 for(let i=0;i<selected.length;i++){
  const c=d.timeline.clips.find(c=>c.id===selected[i])!,a=approved.lines.find(l=>l.id===c.id);
  if(!a||c.text!==a.text)throw Error('Previously approved speech mismatch');
  const originalIndex=d.timeline.clips.indexOf(c),end=d.timeline.clips[originalIndex+1]?.start_frame??d.timeline.total_duration_frames;
  if(end<c.start_frame+c.duration_frames)throw Error('Approved speech truncation');
  add(c.id,end-c.start_frame,{clip:c});
  const ids=i===0?['battle-before','battle-after']:i===1?['se-before','se-after']:i===2?['bonus-before','bonus-after','rush-before','rush-after']:[];
  for(const id of ids){const s=d.samples.find(s=>s.id===id)!;add('sample',s.frames,{sample:s});}
 }
 return blocks;
}
function Frame({title,children,narration=false}:{title:string;children:React.ReactNode;narration?:boolean}){return <AbsoluteFill style={{background:bg,color:ink,fontFamily:'Hiragino Sans, Noto Sans JP, sans-serif',padding:'28px 48px'}}>
 <div style={{fontSize:23,color:dim}}>月影機関　S9 試遊フィードバックによる音の改修</div>
 <h1 style={{fontSize:46,lineHeight:1.3,margin:'18px 0 24px'}}>{title}</h1>{children}
 <div style={{position:'absolute',bottom:16,left:52,right:52,display:'flex',justifyContent:'space-between',fontSize:21,color:dim}}><span>VOICEVOX:ずんだもん</span><span>{narration?'説明中：ゲーム音消音／承認済み発話を原音で使用':'比較中：ナレーションなし／1倍・順番に再生'}</span></div>
 </AbsoluteFill>;}
function Caption({c}:{c:Clip}){return <div style={{position:'absolute',bottom:56,left:52,right:52,padding:'20px 30px',background:'#020a12',borderTop:'2px solid #627f94',fontSize:35,lineHeight:1.6,fontWeight:800,textAlign:'center',textWrap:'balance'}}>{c.text}</div>;}
function Rows({rows}:{rows:string[][]}){return <div style={{fontSize:30,lineHeight:1.6}}>{rows.map(([a,b],i)=><div key={a} style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:20,padding:'18px 24px',background:i%2?'#112a3b':'#1a3547'}}><strong style={{color:gold}}>{a}</strong><span>{b}</span></div>)}</div>;}
function Intro(){return <Frame title="ゆったりした曲調から、速く硬い打点へ"><div style={{padding:'65px 60px',fontSize:43,lineHeight:1.8}}><strong style={{fontSize:51,color:gold}}>BGM4曲・新SE13用途を改修</strong><p>通常80→160BPM<br/>短いベース・裏拍／入賞と停止の硬い打点</p><p style={{fontSize:29,color:dim}}>改修前 → 今回の候補を音付きで比較します。<br/>迫力・好みは、この試遊で確認します。</p></div></Frame>;}
function SampleView({s}:{s:Sample}){return <Frame title={s.title}><div style={{display:'flex',gap:36,alignItems:'center'}}><OffthreadVideo src={staticFile(s.file)} volume={1} playbackRate={1} style={{width:1240,height:760,objectFit:'contain',background:'#020910'}}/><div style={{width:510,fontSize:32,lineHeight:1.65}}><strong style={{color:gold,fontSize:36}}>{s.detail}</strong><p>{s.id.startsWith('se-')?'単体SEと波形図':'canvas＋本編の実音'}</p><p style={{fontSize:25,color:dim}}>{s.id.startsWith('se-')?'大きい側だけを減衰し、音量を揃えています。':s.id.startsWith('intro-')?'スキップせず各7.5秒の実録音。曲調と導入の再生制御を変更しています。':'同じ音量設定。演出・当落を指定した収録です。自然抽選率や全軌道の一致を示す比較ではありません。'}</p></div></div></Frame>;}
function Narration({c,d}:{c:Clip;d:Data}){
 const index=selected.indexOf(c.id),titles=['戦闘と一撃も、速く硬い打点へ','演出8用途と、リール4・ヘソ1','4場面のリズムと勢いを分ける','個別音量・消音・停止と復帰','数値・再生・人の試聴を分ける'];
 const rows=[
  [['戦闘の曲','120→160BPM。裏拍と短い音で駆動'],['攻撃の音','硬い入り・短い応答・張りのある音色'],['同期','既存のPUSH・無音・結果の時計を維持']],
  [['演出8用途','発展／PUSH表示・押下／斬撃／一撃／復活／BONUS開始／RUSH突入'],['追加5用途','リール回転・左/右/中停止／ヘソ入賞'],['採用済み','当たり音の波形は保持']],
  [['通常／戦闘','160BPM／160BPM。リズムと展開で役割を分ける'],['BONUS','180BPM。明るい短いフレーズ'],['RUSH','192BPM。速い応答と16分の動き']],
  [['導入','全体→盤面→液晶から通常へBGMをつなぐ'],['時計','導入中は音だけ進め、玉・抽選は止める'],['操作','BGMとSEを個別調整／停止・復帰の重複を防ぐ']],
  [['技術確認','音源計測・配信・decode・本編接続'],['今回の比較','前後の実録音と、単体SEを別枠で比較'],['人の試聴','迫力・聞き取り・好み・疲れにくさを確認']]
 ];
 const still=d.stills[index===0?'battle':index===2?'rush':index===3?'settings':'normal'];
 return <Frame title={titles[index]} narration><div style={{display:'flex',gap:30}}><Img src={staticFile(still)} style={{width:960,height:590,objectFit:'contain',background:'#020910'}}/><div style={{width:830}}><Rows rows={rows[index]}/><p style={{color:dim,fontSize:22,lineHeight:1.6}}>説明用静止画。操作UIの写る場面以外はcanvas収録です。<br/>「八つの用途」の発話は演出SEの範囲を指します。</p></div></div><Caption c={c}/><Audio src={staticFile('audio/'+c.audio_file)}/></Frame>;
}
function Film({data}:{data:Data|null}){if(!data)throw Error('Media data required');return <AbsoluteFill>{schedule(data).map((b,i)=><Sequence key={i} from={b.from} durationInFrames={b.frames}>{b.kind==='intro'?<Intro/>:b.sample?<SampleView s={b.sample}/>:<Narration c={b.clip!} d={data}/>}</Sequence>)}</AbsoluteFill>;}
registerRoot(()=> <Composition id="S9EnergyReview" component={Film} width={1920} height={1080} fps={30} durationInFrames={30} defaultProps={{data:null}} calculateMetadata={async()=>{const response=await fetch(staticFile('media.json'));const data:Data=await response.json();if(!data.ready)throw Error('Current media not ready');const b=schedule(data);return{durationInFrames:b.at(-1)!.from+b.at(-1)!.frames,props:{data}};}}/>);
