import {directionLine} from './battle-direction.js';
import {SCENES} from './reach-scenes.js';
export const BEATS=[
{id:'warning',from:0,to:2.1,title:'月蝕警報',line:'未確認反応、接近。',heat:.25},
{id:'enemy',from:2.1,to:4.6,title:'',line:'この場所は、渡さない。',heat:.4},
{id:'clash',from:4.6,to:8.2,title:'交戦',line:'月影機、迎撃開始。',heat:.6},
{id:'crisis',from:8.2,to:10.3,title:'',line:'まだ……終わらせない。',heat:.72},
{id:'awakening',from:10.3,to:12.8,title:'月光覚醒',line:'この光は、誰にも奪わせない。',heat:.9},
{id:'strike',from:12.8,to:15.3,title:'月断一閃',line:'すべての想いを、この一撃に。',heat:1},
{id:'judgment',from:15.3,to:16.1,title:'',line:'',heat:1},
{id:'resolve',from:16.1,to:18.5,title:'',line:'',heat:.8}];
export const REACH_DURATION=2;
export const DURATION=18.5+REACH_DURATION;
// Conditional presentation weights; these never change the selected draw result.
export const RED_RATE={win:.7,loss:.1};
export const reachColor=(win,rng)=>rng()<RED_RATE[win?'win':'loss']?'red':'normal';
export const durationFor=pattern=>pattern==='revival'?26+REACH_DURATION:DURATION;
export function beatsFor(pattern='awakening'){
 const beats=BEATS.map(b=>({...b}));
 if(pattern==='victory'){beats[3].line='道が、見えた。';beats[4].title='月光収束';beats[4].line='この一撃で、決める。';}
 if(pattern==='defeat'){beats[4].title='';beats[4].line='届いて……！';beats[4].heat=.3;beats[5].title='';beats[5].line='';beats[5].heat=.3;}
 if(pattern==='feint'){beats[3].title='好機';beats[3].line='今なら、届く！';beats[4].title='月光収束';beats[4].line='この光で、突破する！';}
 if(pattern==='revival'){beats[4].title='';beats[4].line='力が……';beats[4].heat=.2;beats[5].title='';beats[5].line='';beats[5].heat=.1;beats.splice(6,2,
 {id:'silence',from:15.3,to:17.8,title:'',line:'',heat:0},
 {id:'revival',from:17.8,to:20.3,title:'再起',line:'まだ、あなたは独りじゃない。',heat:1},
 {id:'strike',from:20.3,to:22.8,title:'月断一閃',line:'もう一度、この手で。',heat:1},
 {id:'judgment',from:22.8,to:23.6,title:'',line:'',heat:1},
 {id:'resolve',from:23.6,to:26,title:'',line:'',heat:.8});}
 return beats;
}
export function beatAt(t,pattern='awakening'){if(t<0)return {id:'reach',from:-REACH_DURATION,to:0,title:'リーチ',line:'',heat:.4};const beats=beatsFor(pattern);return beats.find(b=>t>=b.from&&t<b.to)||beats.at(-1);}
export function timeline(game){if(!game.presentation)return null;const p=game.presentation;return {...p,t:p.time/p.rate-REACH_DURATION,scene:SCENES.find(s=>s.id===p.sceneId)||SCENES[0]};}
export function reachBeat(p){const b={...beatAt(p.t,p.pattern)};if(b.id==='enemy')b.title=`VS ${p.scene.enemy}`;if(b.id==='resolve'&&p.win){b.title='大当り';b.line='アタッカー開放へ';}b.line=directionLine(p,b);return b;}
