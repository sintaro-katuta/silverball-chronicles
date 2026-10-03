using System;
using System.Collections.Generic;
using UnityEngine;
namespace Yozora {
 // Original synthesized sound design. No commentary, music or voice is lifted from the reference movie.
 public sealed class YozoraSoundscape:MonoBehaviour {
  const int Rate=24000;
  AudioSource mechanical,effects,music;
  readonly Dictionary<string,AudioClip> clips=new Dictionary<string,AudioClip>();
  readonly List<AudioClip> owned=new List<AudioClip>();
  bool enabledSound,fastPreview;float master=.65f,lastContact=-1,lastPushTime=float.NegativeInfinity;int contactVariant,lastRound=-1;string currentBed="normal-bed";float duckLevel=.14f;bool lastBonus;
  Ticket observedTicket;float observedElapsed;int emittedSlashes,lastAdditionalSlashFrame=-1;
  static readonly float[] NormalAdditionalSlashes={32.55f},RushAdditionalSlashes={13.82f};
  public int CueCount{get;private set;} public string LastCue{get;private set;}="";
  public float Volume=>master;public bool Enabled=>enabledSound;
  void Awake(){mechanical=Source("Mechanical audio",.35f);effects=Source("Presentation audio",.72f);music=Source("Atmosphere audio",.14f);music.loop=true;Prepare();SetEnabled(false);}
  AudioSource Source(string label,float level){var o=new GameObject(label);o.transform.SetParent(transform,false);var a=o.AddComponent<AudioSource>();a.playOnAwake=false;a.spatialBlend=0;a.volume=level;return a;}
  void Prepare(){
   foreach(string id in new[]{"launch","entry","spin","stop","anticipation","synthesis","slash","charge","push","result","win","miss","payout","round","unit","reveal","rush","drive","end","gate","heavy-impact","fracture","gather","swing","shatter","pin0","pin1","pin2"})clips[id]=Make(id);
   clips["normal-bed"]=Bed(0);clips["rush-bed"]=Bed(1);clips["upper-bed"]=Bed(2);clips["bonus-bed"]=Bed(3);music.clip=clips["normal-bed"];
  }
  public void SetEnabled(bool value){enabledSound=value;ApplyVolumes();if(value&&!fastPreview){if(!music.isPlaying)music.Play();}else{mechanical.Stop();effects.Stop();music.Stop();}}
  public void SetPreviewRate(float rate){fastPreview=rate!=1;if(fastPreview){mechanical.Stop();effects.Stop();music.Stop();}else if(enabledSound&&!music.isPlaying)music.Play();ApplyVolumes();}
  public void SetVolume(float value){master=Mathf.Clamp01(value);ApplyVolumes();}
  void ApplyVolumes(){if(!effects)return;mechanical.volume=enabledSound?.35f*master:0;effects.volume=enabledSound?.72f*master:0;music.volume=enabledSound?.14f*master:0;}
  public void ResetCues(){lastPushTime=float.NegativeInfinity;lastAdditionalSlashFrame=-1;observedTicket=null;observedElapsed=0;emittedSlashes=0;mechanical.Stop();effects.Stop();lastContact=-1;contactVariant=0;CueCount=0;LastCue="";lastRound=-1;lastBonus=false;currentBed="normal-bed";duckLevel=.14f;music.Stop();music.clip=clips["normal-bed"];if(enabledSound&&!fastPreview)music.Play();}
  public void PlayCue(string id){
   // Event aliases let timelines name the dramatic action instead of a particular synthesized instrument.
   if(id=="warning")id="anticipation";if(id=="impact")id="slash";if(id=="resolve")id="result";if(id=="bonus")id="win";
   // At right-reach 12s, replace the phase's generic anticipation with the actual attack accent.
   if(id=="anticipation"&&lastAdditionalSlashFrame==Time.frameCount)return;
   if(!clips.TryGetValue(id,out var clip))return;
   if(id=="push"){float now=Time.unscaledTime;if(now-lastPushTime<.15f)return;lastPushTime=now;}
   CueCount++;LastCue=id;
   if(!enabledSound||fastPreview||Time.timeScale==0)return;
   if(id=="launch"||id.StartsWith("pin"))mechanical.PlayOneShot(clip,id=="launch"?.30f:.28f);
   else effects.PlayOneShot(clip,id=="payout"?.20f:id=="entry"?.27f:id=="spin"?.18f:.72f);
  }
  public void Contact(float speed){if(speed<.18f||Time.time-lastContact<.035f)return;lastContact=Time.time;PlayCue("pin"+(contactVariant++%3));}
  public void Observe(YozoraRules rules){
   ObserveAdditionalSlashes(rules);
   bool bonus=rules.Bonus!=null;
   string nextBed=bonus||rules.IsBonusPresentationPending?"bonus-bed":rules.Mode==PlayMode.Normal?"normal-bed":rules.Mode==PlayMode.WarOfUnderworld?"upper-bed":"rush-bed";
   if(nextBed!=currentBed){currentBed=nextBed;music.Stop();music.clip=clips[nextBed];if(enabledSound&&!fastPreview)music.Play();}
   int round=bonus?rules.BonusCount/10:-1;if(round!=lastRound){if(bonus&&round>0)PlayCue(round%10==0?"unit":"round");lastRound=round;}
   if(bonus&&!lastBonus&&rules.Bonus.drive)PlayCue("drive");lastBonus=bonus;
   // Keep background below decision effects; source volume change is immediate and reversible on pause/reset.
   bool reach=rules.Active!=null&&rules.Active.reach;
   bool poised=reach&&ReferenceSequenceTimeline.IsDecisionHold(rules.Active.elapsed,rules.Mode!=PlayMode.Normal);
   bool pushWait=rules.IsBonusPresentationPending&&rules.BonusPresentation.PushAvailable;
   float desired=poised?.006f:pushWait?.022f:reach?.055f:bonus?.105f:rules.Mode==PlayMode.WarOfUnderworld?.17f:.14f;
   duckLevel=Mathf.MoveTowards(duckLevel,desired,Time.deltaTime*(desired<duckLevel?.8f:.25f));
   music.volume=enabledSound&&!fastPreview?master*duckLevel:0;
  }
  void ObserveAdditionalSlashes(YozoraRules rules){
   var ticket=rules.Active;
   if(ticket==null||!ticket.reach){observedTicket=null;observedElapsed=0;emittedSlashes=0;return;}
   if(ticket!=observedTicket){
    // Establish the first observed position; do not replay earlier sounds after a new ticket/seek.
    observedTicket=ticket;observedElapsed=ticket.elapsed;emittedSlashes=0;return;
   }
   if(Time.timeScale==0)return;
   float elapsed=ticket.elapsed;var points=rules.Mode==PlayMode.Normal?NormalAdditionalSlashes:RushAdditionalSlashes;
   for(int i=0;i<points.Length;i++){
    int bit=1<<i;
    if((emittedSlashes&bit)==0&&observedElapsed<points[i]&&elapsed>=points[i]){
     emittedSlashes|=bit;
     // Fast preview/OFF still consumes the crossing; returning to 1x never replays stale impacts.
     lastAdditionalSlashFrame=Time.frameCount;PlayCue("heavy-impact");
    }
   }
   observedElapsed=Mathf.Max(observedElapsed,elapsed);
  }
  public void GameEvent(string type,PlayMode mode){switch(type){case "entry":PlayCue("entry");break;case "payout":PlayCue("payout");break;case "bonus-paid":PlayCue("round");break;case "spin":PlayCue("spin");break;case "win":PlayCue("win");break;case "miss":PlayCue("stop");break;case "mode":PlayCue(mode==PlayMode.Normal?"end":"rush");break;case "end":PlayCue("end");break;}}
  AudioClip Make(string id){
   float seconds=id=="gate"?2.4f:id=="gather"?3f:id=="heavy-impact"?1.5f:id=="shatter"?2.2f:id=="fracture"?.9f:id=="swing"?.7f:id=="unit"?1.1f:id=="reveal"?1.25f:id=="round"?.5f:id=="win"?2.1f:id=="drive"?1.7f:id=="synthesis"?1.5f:id=="charge"?1.25f:id=="rush"?1.15f:id=="anticipation"?.9f:id=="miss"||id=="end"?.6f:id=="slash"?.48f:id=="result"?.65f:id=="push"?.42f:id=="entry"?.30f:id=="spin"?.40f:id=="payout"?.18f:id.StartsWith("pin")?.065f:.095f;
   int n=Mathf.CeilToInt(seconds*Rate);var data=new float[n*2];uint rng=19371;foreach(char c in id)rng=rng*33+c;double phase=0;float lowNoise=0;
   for(int i=0;i<n;i++){
    float t=i/(float)Rate,u=t/seconds;rng^=rng<<13;rng^=rng>>17;rng^=rng<<5;float noise=(rng/(float)uint.MaxValue)*2-1;lowNoise=Mathf.Lerp(lowNoise,noise,.10f);
    float value=0,env=1;
    if(id.StartsWith("pin")){float f=2400+(id[id.Length-1]-'0')*337;value=(S(f,t)+.45f*S(f*1.47f,t)+noise*.14f)*.32f;env=Mathf.Exp(-t*85);}
    else if(id=="launch"){value=(lowNoise*.8f+S(180,t)*.2f);env=Mathf.Exp(-t*70);}
    else if(id=="gate"||id=="heavy-impact"||id=="shatter"){
     // Low body + midrange metal attack + a decaying, inharmonic tail.
     float body=id=="gate"?48:62;phase+=(body+85*Mathf.Exp(-t*22))*2*Math.PI/Rate;
     value=(float)Math.Sin(phase)*.38f*Mathf.Exp(-t*3)+S(body*2.01f,t)*.19f*Mathf.Exp(-t*2.4f);
     value+=(S(311,t)+.5f*S(477,t)+.3f*S(823,t))*.12f*Mathf.Exp(-t*4);
     value+=noise*.32f*Mathf.Exp(-t*35)+lowNoise*.25f*Mathf.Exp(-t*5);
     if(id=="shatter")for(int j=0;j<5;j++){float v=t-j*.085f;if(v>=0)value+=S(1400+j*237,v)*.045f*Mathf.Exp(-v*6);}
     env=Mathf.Min(1,(seconds-t)/.1f);
    }else if(id=="fracture"){value=(S(1431,t)+.5f*S(2119,t))*Mathf.Exp(-t*10)*.2f+noise*.12f*Mathf.Exp(-t*40);env=1-u;}
    else if(id=="gather"){phase+=Mathf.Lerp(72,310,u*u)*2*Math.PI/Rate;value=((float)Math.Sin(phase)*.28f+S(146.8f,t)*.08f+lowNoise*.08f)*(.5f+.5f*u);env=Mathf.Sin(Mathf.PI*u)*Mathf.Min(1,t/.08f);}
    else if(id=="swing"){value=lowNoise*.6f+noise*.10f;env=Mathf.Sin(Mathf.PI*u)*(.25f+.75f*u);}
    else if(id=="slash"){phase+=Mathf.Lerp(1700,170,u)*2*Math.PI/Rate;value=noise*.20f+(float)Math.Sin(phase)*.30f+S(96,t)*.25f;env=Mathf.Pow(1-u,2)*Mathf.Min(1,t/.006f);}
    else if(id=="charge"||id=="anticipation"||id=="synthesis"){
     float f=id=="synthesis"?Mathf.Lerp(170,840,u):Mathf.Lerp(90,540,u*u);phase+=f*2*Math.PI/Rate;
     value=(float)Math.Sin(phase)*.22f+(float)Math.Sin(phase*1.5)*.10f+S(1900,t)*.06f*(.5f+.5f*S(12,t))+lowNoise*.12f;
     env=Mathf.Sin(Mathf.PI*u)*(.3f+u*.7f);
    }else if(id=="round"||id=="unit"||id=="reveal"){
     float f=id=="round"?659.25f:id=="unit"?392f:523.25f;
     // Short metallic admission phrase, low strike, then a separate resolving fifth.
     float onset=id=="round"?.08f:.15f;
     value=(S(f,t)+.26f*S(f*2.01f,t))*.18f*Mathf.Exp(-t*7);
     if(t>=onset){float v=t-onset;value+=(S(f*1.5f,v)+.24f*S(f*3,v))*.19f*Mathf.Exp(-v*5);}
     if(id!="round")value+=S(65.4f,t)*.18f*Mathf.Exp(-t*9)+noise*.14f*Mathf.Exp(-t*28);
     env=Mathf.Min(1,(seconds-t)/.07f);
    }else if(id=="win"||id=="drive"||id=="rush"){
     float[] notes={523.25f,659.25f,783.99f,1046.5f,1318.5f,1567.98f};float step=id=="rush"?.13f:.18f;
     for(int k=0;k<notes.Length;k++){float v=t-k*step;if(v>=0)value+=(S(notes[k],v)+.20f*S(notes[k]*2,v))*.14f*Mathf.Exp(-v*4);}
     value+=S(130.81f,t)*.12f*Mathf.Exp(-t*3);if(t<.12f)value+=noise*.17f*(1-t/.12f);env=Mathf.Min(1,(seconds-t)/.1f);
    }else if(id=="entry"||id=="payout"){float f=id=="entry"?1174.66f:1567.98f;value=(S(f,t)+.3f*S(f*2.01f,t))*.24f;env=Mathf.Exp(-t*16);}
    else if(id=="push"){float v=t<.2f?t:t-.2f;value=(S(587,v)+S(880,v)*.3f)*.30f;env=Mathf.Exp(-v*24);}
    else if(id=="miss"||id=="end"){phase+=Mathf.Lerp(440,180,u)*2*Math.PI/Rate;value=(float)Math.Sin(phase)*.15f;env=Mathf.Sin(Mathf.PI*u)*(1-u);}
    else if(id=="result"){value=(S(130,t)*.32f+S(1040,t)*.1f+noise*.12f);env=Mathf.Exp(-t*9);}
    else {value=(S(id=="stop"?420:740,t)*.18f+lowNoise*.12f);env=Mathf.Exp(-t*18);}
    float attack=Mathf.Min(1,t/.0025f),release=Mathf.Min(1,(seconds-t)/.006f);value=Mathf.Clamp(value*env*attack*release,-.85f,.85f);
    float pan=id=="slash"?Mathf.Lerp(-.45f,.45f,u):0;data[2*i]=value*(1-pan*.35f);data[2*i+1]=value*(1+pan*.35f);
   }
   return Clip(id,data);
  }
  AudioClip Bed(int mood){
   // Original four-bar instrumental beds. Finite envelopes make the 8s loop join quiet.
   const float seconds=8;var data=new float[(int)(Rate*seconds)*2];
   float[] chord=mood==0?new[]{130.81f,196f,261.63f,329.63f}:mood==1?new[]{146.83f,220f,293.66f,349.23f}:mood==2?new[]{164.81f,246.94f,329.63f,392f}:new[]{130.81f,196f,261.63f,311.13f};
   float[] melody={1,1.5f,2,1.5f,1.25f,1.5f,2.5f,2,1,1.5f,2,3,2.5f,2,1.5f,1.25f};uint noiseState=8173;
   for(int i=0;i<data.Length/2;i++){
    float t=i/(float)Rate,beat=t%.5f,step=t%.25f,edge=Mathf.Min(1,Mathf.Min(t/.025f,(seconds-t)/.025f));float v=0;
    for(int k=0;k<chord.Length;k++)v+=S(chord[k],t)*.025f*(.75f+.25f*S(.125f*(k+1),t));
    if(mood>0){
     int note=Mathf.FloorToInt(t/.5f)%16;float lead=chord[0]*melody[note]*2;
     v+=(S(lead,beat)+.15f*S(lead*2,beat))*.052f*Mathf.Exp(-beat*8)*Mathf.Min(1,beat/.012f);
     v+=S(chord[0]*.5f,beat)*Mathf.Exp(-beat*20)*.11f;
     noiseState^=noiseState<<13;noiseState^=noiseState>>17;noiseState^=noiseState<<5;float noise=noiseState/(float)uint.MaxValue*2-1;
     v+=noise*Mathf.Exp(-step*100)*(mood==2?.020f:.009f);
     if(mood==3)v+=S(1046.5f,beat)*.018f*Mathf.Exp(-beat*15);
    }
    data[i*2]=v*edge;data[i*2+1]=v*edge*.96f;
   }
   return Clip("original atmosphere "+mood,data);
  }
  static float S(float f,float t)=>(float)Math.Sin(f*t*2*Math.PI);
  AudioClip Clip(string label,float[] samples){var c=AudioClip.Create("Original · "+label,samples.Length/2,2,Rate,false);c.SetData(samples,0);owned.Add(c);return c;}
  void OnDestroy(){foreach(var clip in owned)if(clip)Destroy(clip);}
 }
}
