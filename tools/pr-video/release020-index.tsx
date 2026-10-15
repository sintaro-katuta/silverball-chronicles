import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';

const ink='#edf5fc', muted='#b7ccdc';
function Card({ending=false,checkpointVerified=false}:{ending?:boolean;checkpointVerified?:boolean}) {
  const rows=ending?[
    ['本編に含む変更','S4の構図・共通配置の説明、検証工程の整理'],
    ['内部比較として保持','S5の出口・外枠、S6の先行釘候補。0.14固定と新3案は未採用'],
    ['CD再開の版照合',checkpointVerified?'PR版とマージ版を別々に照合。ローカル再開・混在拒否を確認':'補修の検証中。結果確定後に更新します'],
    ['残る確認','実障害からの復旧・ロールバック・人の耳による聴感は未検証'],
  ]:[
    ['S4｜見た目と説明','短いRUSH演出の余白、5台共通の釘配置説明、CI工程の見直し'],
    ['S5｜内部試射と構造','出口・レールの形と接触、外枠を修正。0.14固定は見送り'],
    ['S6｜釘3案の追加比較','新3案は不採用。先行候補は内部比較として保持、本編は維持'],
  ];
  return <AbsoluteFill style={{background:'#071522',color:ink,fontFamily:'"Hiragino Sans","Noto Sans JP",sans-serif',padding:'72px 92px'}}>
    <div style={{fontSize:28,color:muted,letterSpacing:2}}>SILVERBALL CHRONICLES · RELEASE 0.2.0</div>
    <h1 style={{fontSize:64,margin:'24px 0 28px'}}>{ending?'本編の変更・内部比較・残る確認':'S4–S6：変更と検証のまとめ'}</h1>
    <div style={{fontSize:29,color:muted,marginBottom:34}}>{ending?'候補の良い結果だけで採用を決めず、悪化と未検証も残します。':'本編の変更と、採用しなかった比較結果を分けて紹介します。'}</div>
    <div style={{display:'flex',flexDirection:'column',gap:18}}>{rows.map(([label,text])=><div key={label} style={{background:'#132c40',borderLeft:'5px solid #70c6cd',padding:'21px 26px',display:'grid',gridTemplateColumns:'360px 1fr',alignItems:'center',gap:20}}><strong style={{fontSize:32}}>{label}</strong><div style={{fontSize:32,lineHeight:1.5}}>{text}</div></div>)}</div>
    <div style={{position:'absolute',bottom:44,left:92,right:92,display:'flex',justifyContent:'space-between',fontSize:24,color:muted}}><span>追加カードは無音／既存の発話・比較映像を再利用</span><span>VOICEVOX:ずんだもん</span></div>
  </AbsoluteFill>
}
function S5Card(){return <AbsoluteFill style={{background:'#071522',color:ink,fontFamily:'"Hiragino Sans",sans-serif',padding:'140px 110px',justifyContent:'center'}}><div style={{fontSize:30,color:muted}}>RELEASE 0.2.0 · S5</div><h1 style={{fontSize:66,lineHeight:1.4}}>出口・接触・外枠の内部比較</h1><div style={{fontSize:42,lineHeight:1.8}}>元図の形と幅に合わせ、表示と接触を共有。<br/>本編の既定は維持し、0.14固定は見送りました。</div><div style={{fontSize:30,color:muted,marginTop:70}}>続く35秒は当時の比較記録です。<br/>旧編集ツールの参考95秒は、今回は含めていません。</div></AbsoluteFill>}
registerRoot(()=> <><Composition id="Release020Intro" component={Card} durationInFrames={240} fps={30} width={1920} height={1080}/><Composition id="Release020S5" component={S5Card} durationInFrames={240} fps={30} width={1920} height={1080}/><Composition id="Release020End" component={Card} defaultProps={{ending:true,checkpointVerified:true}} durationInFrames={360} fps={30} width={1920} height={1080}/></>);
