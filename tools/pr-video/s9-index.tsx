import React from 'react';
import {AbsoluteFill, Audio, Composition, Img, OffthreadVideo, Sequence, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import approved from '../../docs/agile/s9-video/script.json';
import data from './s9-data.json';

type Clip = {id:string; text:string; start_frame:number; duration_frames:number; audio_file:string};
type Timeline = {fps:number; total_duration_frames:number; clips:Clip[]};
type Sample = typeof data.samples[number];
type Block = {from:number; frames:number; clip?:Clip; index?:number; sample?:Sample};
type Props = {timeline:Timeline|null};
const FPS=30, bg='#071421', ink='#f5f7fa', dim='#bfd0df', gold='#eed099';
const titles=['場面ごとの音を、音付きで比較','背景パッドから、曲のある場面へ','戦闘・静けさ・決着を一つの時計で','八つの新SEと、維持する当たり音','BONUSとRUSHにも専用の曲','BGMとSEを別々に調整','確認できたことと、試遊で確かめること'];

// Manifest positions and durations are canonical. Insertions shift whole spoken
// blocks; no WAV is trimmed, stretched, re-ordered, or played over game audio.
export function s9Schedule(t:Timeline):Block[]{
  if(t.fps!==FPS || t.clips.length!==approved.lines.length) throw new Error('S9 timeline shape mismatch');
  let offset=0;
  const blocks:Block[]=[];
  t.clips.forEach((c,i)=>{
    const line=approved.lines[i];
    if(c.id!==line.id || c.text!==line.text || !Number.isInteger(c.start_frame) || !Number.isInteger(c.duration_frames) || c.duration_frames<1) throw new Error(`Approved narration mismatch: ${line.id}`);
    const end=t.clips[i+1]?.start_frame??t.total_duration_frames;
    if(end<c.start_frame+c.duration_frames) throw new Error('Narration overlaps or truncates WAV');
    blocks.push({from:c.start_frame+offset,frames:end-c.start_frame,clip:c,index:i});
    for(const sample of data.samples.filter(s=>s.afterParagraph===i+1)){
      blocks.push({from:end+offset,frames:sample.frames,sample});
      offset+=sample.frames;
    }
  });
  return blocks;
}

function Caption({c}:{c:Clip}){
  const f=useCurrentFrame();
  const words=c.text.match(/[^、。]+[、。]?/g)??[c.text];
  const chunks:string[]=[];let buffer='';
  for(const word of words){if(buffer&&buffer.length+word.length>36){chunks.push(buffer);buffer='';}buffer+=word;}
  if(buffer) chunks.push(buffer);
  let consumed=0, text=chunks[chunks.length-1];
  for(const part of chunks){consumed+=part.length;if(f<c.duration_frames*consumed/c.text.length){text=part;break;}}
  return <div style={{position:'absolute',left:52,right:52,bottom:54,minHeight:142,background:'#020a12',padding:'20px 32px',borderTop:'2px solid #627f94',fontSize:40,fontWeight:800,lineHeight:1.5,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>{text}</div>;
}
function Frame({title,children,compare=false,isSE=false}:{title:string;children:React.ReactNode;compare?:boolean;isSE?:boolean}){
  return <AbsoluteFill style={{background:bg,color:ink,fontFamily:'Hiragino Sans, Noto Sans JP, sans-serif',padding:'26px 48px'}}>
    <div style={{display:'flex',justifyContent:'space-between',fontSize:22,color:dim}}><span>月影機関　S9 音の制作・実録比較</span><span>{data.status}</span></div>
    <h1 style={{fontSize:46,lineHeight:1.3,margin:'16px 0 18px'}}>{title}</h1>
    {children}
    <div style={{position:'absolute',bottom:15,left:54,right:54,fontSize:21,color:dim,display:'flex',justifyContent:'space-between'}}><span>VOICEVOX:ずんだもん</span><span>{compare?(isSE?'比較枠：ナレーションなし／基準・候補音源を再生':'比較枠：ナレーションなし／録音された実音を再生'):'説明枠：ゲーム音消音／承認済み発話'}</span></div>
  </AbsoluteFill>;
}
function Rows({rows}:{rows:string[][]}){
  return <div style={{fontSize:31,lineHeight:1.55}}>{rows.map(([key,value],i)=><div key={key} style={{display:'grid',gridTemplateColumns:'245px 1fr',gap:24,padding:'22px 26px',background:i%2?'#112a3b':'#1a3547'}}><strong style={{color:gold}}>{key}</strong><span>{value}</span></div>)}</div>;
}
function Still({name}:{name:keyof typeof data.stills}){
  return <div style={{width:960,flexShrink:0}}><Img src={staticFile(data.stills[name])} style={{width:960,height:600,objectFit:'contain',background:'#020910'}}/><div style={{fontSize:21,color:dim,marginTop:10}}>実収録からの静止画／canvasのみ・ゲーム音消音</div></div>;
}
function Narration({c,index}:{c:Clip;index:number}){
  const name=index===2?'battle':index===4?'bonus':'normal';
  const rows=[
    [['BGM 4用途','通常・戦闘・BONUS・RUSH'],['SE 8用途','発展／PUSH表示・押下／斬撃／一撃／復活／BONUS開始／RUSH突入'],['今回の比較','同じ演出時計の前後を、音付きで順番に再生']],
    [['変更前','短い背景パッド＋既存効果音'],['変更後','旋律・和声・リズムを持つ曲'],['次の比較枠','通常の変更前→変更後を、各3秒・1倍で再生']],
    [['共通の時計','戦闘→PUSH→一撃前の静けさ→決着'],['先出しを防止','公開境界まで当落で音楽を分けない'],['次の比較枠','同じ表示時計の前後を、各6秒・1倍で再生']],
    [['新しい8用途','演出の役割に応じて音程・打点・余韻を設計'],['維持する音','採用済み win／rushWin のPCM'],['次の比較枠','一撃SEの基準→最新を、各3秒で試聴']],
    [['BONUS','報酬を感じる明るい曲'],['RUSH','速いテンポで継続感を作る曲'],['効果音の優先','大切なSEではBGMを下げる']],
    [['独立した音量','BGM と SE を別々に調整'],['停止と復帰','一時停止・画面離脱・復帰の位置と設定を確認'],['画面について','この映像はcanvas収録。操作DOMは収録していません']],
    [['確認済み','音源計測・配信/decode・ブラウザー再生'],['聴感の評価','好み・疲れにくさは人の試遊で確認'],['公開状況','ローカル検証。本番未公開／フィードバックを受けて仕上げる']]
  ];
  return <Frame title={titles[index]}><div style={{display:'flex',gap:32,alignItems:'flex-start'}}><Still name={name}/><div style={{width:820}}><Rows rows={rows[index]}/><p style={{fontSize:22,color:dim,lineHeight:1.6,margin:'18px 16px'}}>{data.captureNotice}</p></div></div><Caption c={c}/><Audio src={staticFile(`audio/${c.audio_file}`)}/></Frame>;
}
function SampleScene({sample}:{sample:Sample}){
  const isSE=sample.id.startsWith('se-');
  return <Frame title={sample.title} compare isSE={isSE}><div style={{display:'flex',gap:36}}><div style={{width:1250}}><OffthreadVideo src={staticFile(sample.file)} volume={1} playbackRate={1} style={{width:1250,height:760,objectFit:'contain',background:'#020910'}}/></div><div style={{width:520,paddingTop:35}}><div style={{fontSize:40,fontWeight:800,color:gold,lineHeight:1.5}}>{sample.detail}</div><p style={{fontSize:29,lineHeight:1.7}}>{sample.clockLabel}</p><p style={{fontSize:30,lineHeight:1.7}}>{isSE?'音源単体・波形図':'1倍・実録音'}<br/>片方ずつ再生<br/>ナレーションなし</p><p style={{fontSize:23,color:dim,lineHeight:1.6}}>{isSE?'本編の通し録音ではありません。原PCMの合成音＋波形図（FFmpeg）です。':data.captureNotice}<br/>{isSE?'最新候補は1.55秒＋無音1.45秒。基準音も3秒の比較枠です。':'短い抜粋は全演出の評価ではありません。'}</p></div></div></Frame>;
}
function Film({timeline}:Props){
  if(!timeline) throw new Error('Canonical timeline is required');
  return <AbsoluteFill>{s9Schedule(timeline).map((b,i)=><Sequence key={i} from={b.from} durationInFrames={b.frames}>{b.sample?<SampleScene sample={b.sample}/>:<Narration c={b.clip!} index={b.index!}/>}</Sequence>)}</AbsoluteFill>;
}
registerRoot(()=> <Composition id="S9Review" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={30} defaultProps={{timeline:null}} calculateMetadata={async()=>{
  const response=await fetch(staticFile('audio/timeline.json'));
  if(!response.ok) throw new Error('Canonical S9 audio/timeline.json not ready');
  const timeline:Timeline=await response.json();
  const blocks=s9Schedule(timeline);
  if(!data.mediaReady || data.samples.some(s=>s.clockLabel.includes('待ち'))) throw new Error('Sample clock/trim receipt must be confirmed before preview/render');
  return {durationInFrames:Math.max(...blocks.map(b=>b.from+b.frames)),props:{timeline}};
}}/>);
