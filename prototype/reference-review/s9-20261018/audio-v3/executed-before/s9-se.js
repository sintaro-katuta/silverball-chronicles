import {buffer,tone,finish} from './s9-synth.js';
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
}).map(([k,v])=>[k,Object.freeze({...v,kind:'s9-synth',style:'s9-original-periodic'})])));
export function s9EffectDesign(name,variant=0){
 if(!S9_SE_CATALOG[name]||!Number.isInteger(variant)||variant<0||variant>3)throw new RangeError('Unknown S9 effect or variant');const s=S9_SE_CATALOG[name],v=[1,.994,1.006,.998][variant]*SYNTH_TUNING.effectPitch;const e=[];
 const add=(at,seconds,hz,endHz=hz,gain=.3,pan=0)=>e.push({at,seconds,hz:hz*v,endHz:endHz*v,gain,pan});
 if(name==='decisiveHit'){add(0,.14,980,294,.54);add(.012,.82,392,294,.56);add(.018,.58,246.94,220,.24);add(.14,1.05,587.33,587.33,.25,.16);}
 if(name==='heroHit'){add(0,.09,1174.66,440,.4);add(.025,.38,440,349.23,.33);add(.06,.43,261.63,261.63,.16,-.12);}
 if(name==='pushPress'){add(0,.065,784,392,.35);add(.03,.22,523.25,523.25,.24);}
 if(name==='pushPrompt'){add(0,.19,587.33,587.33,.32,-.1);add(.27,.40,739.99,739.99,.32,.1);add(.27,.4,466.16,466.16,.17);}
 if(name==='development'){add(0,.18,392,392,.24);add(.23,.22,523.25,523.25,.28);add(.52,.53,659.25,659.25,.32);add(.52,.53,392,392,.18);}
 if(name==='revival'){add(0,.24,220,440,.23);add(.26,.22,440,440,.28);add(.56,.25,587.33,587.33,.3);add(.85,.51,739.99,739.99,.33);add(.85,.51,466.16,466.16,.19);}
 if(name==='bonusStart'){for(const[a,d,h]of [[0,.16,523.25],[.24,.22,659.25],[.56,.3,587.33],[.98,.23,783.99],[1.32,1.1,739.99]]){add(a,d,h,h,.32);add(a,d,h*.62996,h*.62996,.23);}}
 if(name==='rushStart'){for(const[a,d,h]of [[0,.16,440],[.22,.21,587.33],[.5,.24,659.25],[.82,.47,880]]){add(a,d,h,h,.31);add(a,d,h*.66742,h*.66742,.18);}}
 if(name==='spin'){add(0,.07,329.63,392,.20,-.08);add(.08,.065,392,440,.18,.08);add(.16,.085,440,493.88,.15);}
 if(name==='stopLeft'){add(0,.11,659.25,523.25,.30,-.08);add(.01,.12,329.63,329.63,.12);}
 if(name==='stopRight'){add(0,.11,739.99,587.33,.30,.08);add(.01,.12,369.99,369.99,.12);}
 if(name==='stopCenter'){add(0,.13,587.33,440,.30);add(.008,.18,293.66,293.66,.15);}
 if(name==='admission'){add(0,.10,783.99,659.25,.27);add(.018,.105,523.25,523.25,.10);}
 const frequent=['spin','stopLeft','stopRight','stopCenter','admission'].includes(name);
 return {version:frequent?'s9-frequent-v2':'s9-effects-v1',name,variant,...s,events:e,...(frequent?{envelope:{attack:.003,release:.035,decay:2.3,bright:.28,echo:false},intent:'Short periodic synth; no result/odds/game-RNG input. Loop-free, no long echo.'}:{})};
}
export function synthesizeS9Se(name,variant=0,sampleRate=44100){const d=s9EffectDesign(name,variant),p=buffer(d.duration,sampleRate);if(d.envelope){for(const e of d.events)tone(p,{...e,...d.envelope,vibrato:0});finish(p,d.level,{echo:false});return p;}for(const e of d.events)tone(p,{...e,attack:['decisiveHit','heroHit','pushPress'].includes(name)?.0015:.004,release:Math.min(.14,e.seconds*.3),decay:name==='decisiveHit'?1:name==='heroHit'?2:.7,bright:.52,vibrato:0});finish(p,d.level);return p;}
