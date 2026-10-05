// Original, offline Web Audio effects. No music loop or external sound assets.
export const CUES=['kyuin','shot','pocket','start','payout','stop','reach','red','warning','enemy','clash','crisis','chance','charge','awakening','strike','revival','win','loss','open','roundReveal','rushChallenge','breakthrough','rushStart','rushReset','clear','select'];
export class SoundEffects {
 constructor(context=null){this.context=context;this.enabled=true;this.volume=.65;this.impactLevel=1;this.grade=4;this.confirmBuffers=new Map();this.voices=new Set();this.last=new Map();this.duckUntil=0;this.quiet=false;this.history=[];if(context)this.setup();}
 setup(){const c=this.context;this.master=c.createGain();this.master.gain.value=this.volume;const compressor=c.createDynamicsCompressor();compressor.threshold.value=-16;compressor.knee.value=12;compressor.ratio.value=8;compressor.attack.value=.003;compressor.release.value=.16;this.master.connect(compressor);compressor.connect(c.destination);this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=this.noise.getChannelData(0);let seed=47;for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=seed/1073741824-1;}}
 unlock(){if(!this.enabled)return;try{if(!this.context){this.context=new(window.AudioContext||window.webkitAudioContext)();this.setup();}if(this.context.state==='suspended')this.context.resume().catch(()=>{});}catch{}}
 setEnabled(value){this.enabled=value;if(!value)this.stop();else this.unlock();}
 stop(){for(const v of this.voices){try{v.stop();}catch{}}this.voices.clear();this.duckUntil=0;this.quiet=false;}
 tone(freq,end,duration,volume,type='sine',delay=0,noise=false){const c=this.context,at=c.currentTime+delay,source=noise?c.createBufferSource():c.createOscillator(),gain=c.createGain();if(noise){source.buffer=this.noise;}else{source.type=type;source.frequency.setValueAtTime(freq,at);source.frequency.exponentialRampToValueAtTime(Math.max(20,end),at+duration);}
 const filter=c.createBiquadFilter();filter.type=noise?'bandpass':'lowpass';filter.frequency.setValueAtTime(noise?freq:6000,at);if(noise)filter.frequency.exponentialRampToValueAtTime(Math.max(60,end),at+duration);filter.Q.value=noise?.7:.4;
 gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),at+.004);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);source.connect(filter);filter.connect(gain);gain.connect(this.master);this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start(at);source.stop(at+duration+.015);}
 // Two pitch envelopes: a fast launch plus a slower overshoot/settle.
 // Original synthesis informed by the supplied Massive tutorial, not sampled audio.
 kyuin(){const c=this.context,at=c.currentTime,duration=1.45;
 const mix=c.createGain(),filter=c.createBiquadFilter(),drive=c.createWaveShaper(),amp=c.createGain();
 filter.type='lowpass';filter.Q.value=2.1;filter.frequency.setValueAtTime(900,at);filter.frequency.exponentialRampToValueAtTime(7400,at+.16);filter.frequency.exponentialRampToValueAtTime(2400,at+duration);
 const curve=new Float32Array(1024);for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=Math.tanh(x*2.4)/Math.tanh(2.4);}drive.curve=curve;drive.oversample='2x';
 amp.gain.setValueAtTime(.0001,at);amp.gain.exponentialRampToValueAtTime(.2,at+.018);amp.gain.setValueAtTime(.17,at+.18);amp.gain.exponentialRampToValueAtTime(.065,at+.65);amp.gain.exponentialRampToValueAtTime(.0001,at+duration);
 mix.gain.value=.23;mix.connect(filter);filter.connect(drive);drive.connect(amp);amp.connect(this.master);
 const delay=c.createDelay(.2),wet=c.createGain();delay.delayTime.value=.075;wet.gain.value=.16;amp.connect(delay);delay.connect(wet);wet.connect(this.master);
 let remaining=3;for(const [type,cents] of [['sawtooth',-5],['sawtooth',5],['sine',0]]){const osc=c.createOscillator();osc.type=type;osc.detune.value=cents;
 const points=96,values=new Float32Array(points);for(let i=0;i<points;i++){const t=i/(points-1)*duration;const fast=49*(1-Math.exp(-t/.028))*Math.exp(-t/1.8),slow=23*(1-Math.exp(-t/.13))*Math.exp(-t/.62);values[i]=110*2**((fast+slow)/12);}
 osc.frequency.setValueCurveAtTime(values,at,duration);osc.connect(mix);this.voices.add(osc);osc.onended=()=>{this.voices.delete(osc);osc.disconnect();if(--remaining===0){mix.disconnect();filter.disconnect();drive.disconnect();amp.disconnect();delay.disconnect();wet.disconnect();}};osc.start(at);osc.stop(at+duration+.1);}
 }
 // Layered confirmation: stuttering mechanical attack, metallic FM, pitch sweep,
 // sub impact and a sustained harmonic tail. Generated locally, never sampled.
 confirmation(){const c=this.context,grade=this.grade||4,key=grade+':'+this.impactLevel;let buffer=this.confirmBuffers.get(key);
 if(!buffer){const length=grade===10?2.8:grade===6?2.35:1.9,sr=c.sampleRate;buffer=c.createBuffer(2,Math.ceil(sr*length),sr);let phase=0,seed=53;const left=buffer.getChannelData(0),right=buffer.getChannelData(1);let peak=0;
 for(let i=0;i<left.length;i++){const t=i/sr;seed=seed*16807%2147483647;const noise=seed/1073741824-1;const pitch=240+1950*(1-Math.exp(-t/ .065))*Math.exp(-t/.95);phase+=2*Math.PI*pitch/sr;
 let hit=0;for(const at of [0,.095,.21,.36]){const u=t-at;if(u>=0)hit+=(Math.sin(2*Math.PI*(100*u+12*(1-Math.exp(-u*20))))*.6+noise*.3)*Math.exp(-u*35);}
 const gate=t<.4?(.2+.8*Math.max(0,Math.sin(t*2*Math.PI*24))):1;
 const metal=Math.sin(phase+2.8*Math.sin(phase*2.013))*.23*gate*Math.exp(-t/ .62);
 const siren=(Math.sin(phase)+.25*Math.sin(phase*2))*.22*Math.min(1,t/.025)*Math.exp(-t/ .9);
 const bass=Math.sin(2*Math.PI*(48*t+3*(1-Math.exp(-t*15))))*.32*Math.exp(-t*7)*this.impactLevel;
 let tailL=0,tailR=0;for(const [n,f] of [784,988,1175,1568,1976].entries()){const u=t-.45-n*.045;if(u<0)continue;const env=(1-Math.exp(-u*100))*Math.exp(-u/(grade===10?.95:.55));tailL+=Math.sin(2*Math.PI*f*u)*env*.035;tailR+=Math.sin(2*Math.PI*(f*1.003)*u)*env*.035;}
 const fade=Math.min(1,(length-t)/.12);left[i]=Math.tanh((hit*.55+metal+siren+bass+tailL)*1.8)*fade;right[i]=Math.tanh((hit*.55+metal+siren+bass+tailR)*1.8)*fade;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}
 for(let i=0;i<left.length;i++){left[i]*=.78/peak;right[i]*=.78/peak;}this.confirmBuffers.set(key,buffer);if(this.confirmBuffers.size>12)this.confirmBuffers.delete(this.confirmBuffers.keys().next().value);}
 const source=c.createBufferSource();source.buffer=buffer;source.connect(this.master);this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();};source.start();}
 play(name){if(!this.enabled||!this.context||(this.context.state==='suspended'&&!this.context.startRendering))return;const now=this.context.currentTime,small=['shot','pocket','start','payout','stop'].includes(name);if(small&&this.quiet)return;if(now-(this.last.get(name)??-99)<(small?.065:.12))return;this.last.set(name,now);this.history.push(name);if(this.history.length>100)this.history.shift();const scale=small&&now<this.duckUntil?.22:1;
 const tone=(f,e,d,v,type='sine',delay=0)=>this.tone(f,e,d,v*scale,type,delay);
 const noise=(f,e,d,v,delay=0)=>this.tone(f,e,d,v*scale,'sine',delay,true);
 const impact=(power=1,delay=0)=>{tone(150,42,.43,.24*power,'sine',delay);noise(1900,170,.24,.12*power,delay);};
 const sparkle=(base=880,count=8,delay=0)=>{for(let i=0;i<count;i++){const f=base*[1,1.25,1.5,2][i%4]*2**Math.floor(i/4);tone(f,f*.995,.27,.052,'sine',delay+i*.055);tone(f*2.01,f*2,.1,.017,'sine',delay+i*.055);}};
 if(!small)this.duckUntil=now+(name==='win'?2.3:1);
 switch(name){
 case 'kyuin':this.kyuin();break;
 case 'shot':noise(2400,700,.035,.032);tone(360,180,.045,.025);break;
 case 'pocket':tone(1500,1100,.09,.048,'sine');tone(2370,2300,.07,.017);break;
 case 'start':tone(740,740,.16,.07);tone(1110,1110,.2,.055,'sine',.065);break;
 case 'payout':sparkle(1100,3);break;
 case 'stop':noise(850,300,.055,.025);break;
 case 'reach':impact(.5);tone(390,1300,.4,.1,'triangle');sparkle(880,5,.12);break;
 case 'red':impact(.9);for(let i=0;i<3;i++){tone(660,1320,.14,.1,'sawtooth',i*.16);tone(990,1980,.14,.05,'triangle',i*.16);}sparkle(1320,8,.42);break;
 case 'warning':for(let i=0;i<2;i++)tone(330,480,.17,.055,'square',i*.25);break;
 case 'enemy':impact(.8);tone(95,60,.65,.1,'sawtooth');break;
 case 'clash':for(let i=0;i<3;i++){noise(800,4200,.16,.1,i*.22);impact(.65,i*.22+.09);}break;
 case 'crisis':tone(90,48,.55,.15);noise(400,110,.6,.08);break;
 case 'chance':impact(.48);for(let i=0;i<4;i++){tone(523*2**(i/5),1046*2**(i/5),.16,.072,'triangle',i*.12);tone(1568*2**(i/5),1568*2**(i/5),.23,.036,'sine',i*.12);}break;
 case 'charge':noise(500,2900,.62,.075);for(let i=0;i<5;i++)tone(330*2**(i/6),880*2**(i/6),.32,.057,'sawtooth',i*.11);sparkle(1046,4,.47);break;
 case 'awakening':case 'revival':impact(.75);noise(300,6500,.75,.12);for(let i=0;i<6;i++)tone(220*2**(i/3),1500*2**(i/6),.4,.055,'sawtooth',i*.08);sparkle(name==='revival'?1320:880,12,.45);break;
 case 'strike':noise(450,6000,.18,.2);impact(1,.18);tone(1400,200,.38,.1,'triangle',.18);break;
 case 'win':this.confirmation();break;
 case 'loss':tone(210,85,.35,.045,'triangle');break;
 case 'open':impact(.4);sparkle(660,4);break;
 case 'roundReveal':impact(.65);for(let i=0;i<3;i++)tone(660*2**(i/4),1320*2**(i/4),.22,.073,'triangle',i*.12);sparkle(1046,8,.28);break;
 case 'rushChallenge':impact(.55);tone(110,75,.72,.11);for(let i=0;i<3;i++)tone(440*2**(i/6),660*2**(i/6),.2,.05,'triangle',i*.22);break;
 case 'breakthrough':impact(.85);noise(700,3900,.42,.09);sparkle(1175,10,.08);break;
 case 'rushStart':for(let i=0;i<4;i++){tone(523*2**(i/3),523*2**(i/3),.32,.078,'triangle',i*.11);tone(1046*2**(i/3),1046*2**(i/3),.23,.027,'sine',i*.11);}sparkle(1320,6,.38);break;
 case 'rushReset':impact(.55);sparkle(1046,7,.1);break;
 case 'clear':sparkle(880,10);tone(523,1046,.25,.075,'triangle');break;
 case 'select':sparkle(880,3);break;
 }
 }
 cinematic(beat,p){if(['silence','judgment'].includes(beat.id)){this.stop();this.quiet=true;return;}this.quiet=true;if(beat.id==='reach')this.play(p.reachColor==='red'?'red':'reach');else if(beat.id==='resolve'){this.grade=p.grade||4;this.play(p.win?'win':'loss');}else if(beat.id==='crisis'&&p.pattern==='feint')this.play('chance');else if(beat.id==='awakening'&&['feint','victory'].includes(p.pattern))this.play('charge');else if(['awakening','strike'].includes(beat.id)&&['defeat','revival'].includes(p.pattern)&&p.t<17.8)this.play('crisis');else this.play(beat.id);}
}
