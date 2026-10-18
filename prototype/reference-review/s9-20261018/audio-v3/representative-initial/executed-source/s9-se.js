import {buffer,vividTone,finish} from './s9-synth.js';
import {SYNTH_TUNING} from './synth-wave.js';
// Each role has its own gesture. No win/rushWin recognition motif is reused.
export const S9_SE_CATALOG=Object.freeze(Object.fromEntries(Object.entries({
 development:{duration:1.2,level:.26,priority:2,duckFor:.22,role:'発展へ移る短い上昇と保持'},
 pushPrompt:{duration:.82,level:.24,priority:2,duckFor:.13,role:'押せることを知らせる二拍'},
 pushPress:{duration:.32,level:.27,priority:2,duckFor:.13,role:'押した瞬間の短い応答'},
 heroHit:{duration:.74,level:.32,priority:2,duckFor:.16,role:'途中の攻撃の一打'},
 decisiveHit:{duration:1.55,level:.56,priority:3,duckFor:.28,role:'pressure最終一撃・当落非確定'},
 revival:{duration:1.5,level:.33,priority:3,duckFor:.3,role:'復活開始後の再点火'},
 bonusStart:{duration:2.6,level:.35,priority:3,duckFor:.35,role:'確定後のBONUS開始'},
 rushStart:{duration:1.45,level:.35,priority:3,duckFor:.3,role:'RUSH突入の加速する短い返し'},
 spin:{duration:.28,level:.13,priority:1,duckFor:0,role:'図柄回転開始の小さな連続感'},
 stopLeft:{duration:.18,level:.18,priority:1,duckFor:0,role:'左図柄停止の短い打点'},
 stopRight:{duration:.18,level:.18,priority:1,duckFor:0,role:'右図柄停止の短い打点'},
 stopCenter:{duration:.24,level:.20,priority:2,duckFor:0,role:'中図柄停止の少し重い短い打点・当落非依存'},
 admission:{duration:.16,level:.12,priority:1,duckFor:0,role:'ヘソ入賞の小さな明るい応答・当落非依存'}
}).map(([k,v])=>[k,Object.freeze({...v,kind:'s9-synth',style:'s9-v3-bright-additive'})])));
export function s9EffectDesign(name,variant=0){
 if(!S9_SE_CATALOG[name]||!Number.isInteger(variant)||variant<0||variant>3)throw new RangeError('Unknown S9 effect or variant');
 const spec=S9_SE_CATALOG[name],v=[1,.994,1.006,.998][variant]*SYNTH_TUNING.effectPitch,events=[];
 const add=(at,seconds,hz,endHz=hz,gain=.3,pan=0)=>events.push({at,seconds,hz:hz*v,endHz:endHz*v,gain,pan});
 if(name==='spin'){for(const[a,h]of [[0,523.25],[.075,783.99],[.15,1046.5]])add(a,.075,h,h*1.05946,.24);}
 if(name==='stopLeft'){add(0,.08,1174.66,783.99,.35,-.06);add(.016,.11,587.33,587.33,.17);}
 if(name==='stopRight'){add(0,.08,1318.51,880,.35,.06);add(.016,.11,659.25,659.25,.17);}
 if(name==='stopCenter'){add(0,.075,1046.5,659.25,.38);add(.012,.15,523.25,523.25,.22);add(.07,.10,1046.5,1046.5,.10);}
 if(name==='admission'){add(0,.065,1174.66,1046.5,.30);add(.055,.07,1567.98,1567.98,.12);}
 if(name==='pushPress'){add(0,.05,1567.98,783.99,.40);add(.018,.18,783.99,783.99,.22);add(.08,.12,1174.66,1174.66,.12);}
 if(name==='pushPrompt'){add(0,.14,1046.5,1046.5,.30,-.08);add(.18,.14,1318.51,1318.51,.32,.08);add(.36,.26,1567.98,1567.98,.29);add(.36,.26,1046.5,1046.5,.12);}
 if(name==='heroHit'){add(0,.065,1760,587.33,.44);add(.012,.26,587.33,440,.32);add(.12,.31,1174.66,1174.66,.15,.08);}
 if(name==='decisiveHit'){add(0,.085,2093,523.25,.52);add(.008,.45,523.25,392,.42);add(.04,.40,783.99,783.99,.25);add(.12,.70,1174.66,1174.66,.22,.12);add(.18,.50,1567.98,1567.98,.10,-.12);}
 if(name==='development'){for(const[a,h]of [[0,523.25],[.16,659.25],[.32,783.99],[.48,1046.5]])add(a,a===.48?.50:.12,h,h,.30);add(.48,.50,659.25,659.25,.13);}
 if(name==='revival'){for(const[a,h]of [[0,440],[.16,659.25],[.32,880],[.48,1174.66],[.7,1567.98]])add(a,a===.7?.55:.13,h,h,.30);add(.7,.55,1046.5,1046.5,.15);}
 if(name==='bonusStart'){for(const[a,h,d]of [[0,783.99,.15],[.2,1046.5,.15],[.4,1318.51,.23],[.75,1174.66,.18],[1.0,1567.98,.28],[1.4,1760,.8]]){add(a,d,h,h,.3);add(a,d,h*.66742,h*.66742,.15);}}
 if(name==='rushStart'){for(const[a,h]of [[0,587.33],[.15,783.99],[.3,1046.5],[.45,1318.51],[.62,1567.98],[.84,2093]])add(a,a===.84?.40:.12,h,h,.29);add(.84,.4,1046.5,1046.5,.14);}
 const frequent=['spin','stopLeft','stopRight','stopCenter','admission'].includes(name);
 return {version:'s9-effects-v3',name,variant,...spec,events,envelope:{attack:.0012,release:frequent?.016:.035,decay:frequent?1.5:1.0,voice:'lead',echo:false},intent:'Bright finite-additive synth, articulated rises and decisive attack; no drums/bass in SE, no outcome or game RNG input.'};
}
export function synthesizeS9Se(name,variant=0,sampleRate=44100){
 const d=s9EffectDesign(name,variant),p=buffer(d.duration,sampleRate);
 for(const e of d.events)vividTone(p,{...e,...d.envelope});
 finish(p,d.level,{echo:false});return p;
}
