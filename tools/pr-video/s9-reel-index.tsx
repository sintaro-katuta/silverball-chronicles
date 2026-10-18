import React from 'react';
import {AbsoluteFill, Composition, OffthreadVideo, Sequence, registerRoot, staticFile} from 'remotion';

const bg='#071421', ink='#f5f7fa', dim='#bfd0df', gold='#eed099';
function Frame({title,children}:{title:string;children:React.ReactNode}){
  return <AbsoluteFill style={{background:bg,color:ink,fontFamily:'Hiragino Sans, Noto Sans JP, sans-serif',padding:'32px 52px'}}>
    <div style={{fontSize:24,color:dim}}>月影機関　S9 追加の音付き比較</div>
    <h1 style={{fontSize:50,margin:'20px 0 26px'}}>{title}</h1>{children}
    <div style={{position:'absolute',bottom:18,left:52,fontSize:22,color:dim}}>後半のナレーション：VOICEVOX:ずんだもん</div>
  </AbsoluteFill>;
}
function Compare({side}:{side:'before'|'after'}){
  return <Frame title={side==='before'?'変更前：既存のリール音／ヘソ専用音なし':'変更後：リール4音を更新／ヘソ入賞音を追加'}>
    <div style={{display:'flex',gap:38,alignItems:'center'}}>
      <OffthreadVideo src={staticFile(`reel-${side}.mp4`)} volume={1} playbackRate={1} style={{width:1190,height:760,objectFit:'contain',background:'#020910'}}/>
      <div style={{width:530,fontSize:31,lineHeight:1.7}}>
        <strong style={{color:gold,fontSize:37}}>ヘソの実通過から<br/>リール回転・停止へ</strong>
        <p>実プレイ録画・1倍<br/>BGMのみ消音／SEは有効<br/>ナレーションなし</p>
        <p style={{fontSize:24,color:dim}}>同じ台・発射設定。外れを指定した比較用の遊技です。入賞は通常発射と物理計算による通過です。</p>
        <p style={{fontSize:24,color:dim}}>最初の入賞付近から各12秒。軌道の完全一致や入賞率の比較を示す映像ではありません。</p>
      </div>
    </div>
  </Frame>;
}
function Film(){return <AbsoluteFill>
  <Sequence durationInFrames={90}><Frame title="リール音と、ヘソに入った音も追加しました"><div style={{fontSize:51,lineHeight:1.7,margin:'100px 60px',color:gold}}>回転・左停止・右停止・中停止 ＋ ヘソ入賞<br/><span style={{fontSize:38,color:ink}}>演出SEは合計13用途／BGMは4曲</span><p style={{fontSize:30,color:dim}}>まず追加分の変更前→変更後を、音付きで比較します。</p></div></Frame></Sequence>
  <Sequence from={90} durationInFrames={360}><Compare side="before"/></Sequence>
  <Sequence from={450} durationInFrames={360}><Compare side="after"/></Sequence>
  <Sequence from={810} durationInFrames={150}><Frame title="今回の追加で確認したこと"><div style={{fontSize:40,lineHeight:1.8,margin:'45px 60px'}}>実際のヘソ入賞1回につき1音。保留が満杯でも発音。<br/>ミュート解除後の追い鳴りなし／右の始動口は対象外。<br/>既存のBGM4曲・演出SE8用途・当たり音の波形は維持。<p style={{color:gold,fontSize:35}}>ここから先は、先行実装したBGM4曲・SE8用途の説明です。</p><p style={{fontSize:27,color:dim}}>音源計測・ブラウザ再生・本編接続を確認。聴感の好みは試遊で確認します。</p></div></Frame></Sequence>
  <Sequence from={960} durationInFrames={3181}>
    <OffthreadVideo src={staticFile('s9-review-original.mp4')} volume={1} playbackRate={1} style={{width:1920,height:1080}}/>
    <div style={{position:'absolute',top:0,right:0,padding:'7px 22px',fontFamily:'Hiragino Sans, sans-serif',fontSize:24,fontWeight:700,color:ink,background:'#071421'}}>先行実装分：BGM4曲・演出SE8用途</div>
  </Sequence>
</AbsoluteFill>;}
registerRoot(()=> <Composition id="S9ReelReview" component={Film} width={1920} height={1080} fps={30} durationInFrames={4141}/>);
