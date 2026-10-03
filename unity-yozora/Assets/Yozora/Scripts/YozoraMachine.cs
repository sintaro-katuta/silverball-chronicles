using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 public class YozoraMachine:MonoBehaviour {
  public GameObject ballPrefab;public Transform ballRoot,launchPoint,door,swordBlue,swordGold;public Rigidbody distributor;
  public Camera viewCamera;public Text topStats,status,modeLabel,headline,subtitle,payoutLabel,titleLabel;public Text[] reels;public Image[] holds;public RawImage keyArt;
  public Image flash;public Font font;public Material lampMaterial;public AudioSource audioSource;
  public float normalSpeed=3.6f,rightSpeed=5.5f;
  public YozoraSoundscape soundscape; public float PreviewRate {get;private set;}=1;
  public YozoraRules Rules {get;private set;}
  public float PushFeedback {get;private set;}
  public bool AutoFire {get;private set;} public bool Paused {get;private set;} public bool Demo {get;private set;}
  public int ContactCount,ScoredBalls,FairReceived,FairWon,DistributorCount;
  readonly List<BallBody> balls=new List<BallBody>();float fireClock,reportClock,impact,gateAngle,camOrbit;bool sound;string view="front";
  int roundsSeen; float roundGap; bool wasBonus;
  #if UNITY_WEBGL && !UNITY_EDITOR
  [DllImport("__Internal")]static extern void YozoraReport(string data);
  #endif
  void Awake(){Physics.gravity=new Vector3(0,-9.81f,0);Time.fixedDeltaTime=1f/120;Time.maximumDeltaTime=.1f;Application.targetFrameRate=60;soundscape=gameObject.AddComponent<YozoraSoundscape>();ResetMachine();}
  public void ResetMachine(){PushFeedback=0;PreviewRate=1;Time.timeScale=1;if(soundscape)soundscape.ResetCues();if(soundscape)soundscape.SetPreviewRate(1);Paused=false;AudioListener.pause=!sound;AutoFire=false;Demo=false;foreach(var b in balls)if(b)Destroy(b.gameObject);balls.Clear();Rules=new YozoraRules();Rules.Event+=OnGameEvent;ContactCount=ScoredBalls=FairReceived=FairWon=DistributorCount=0;fireClock=reportClock=impact=gateAngle=roundGap=0;roundsSeen=0;wasBonus=false;if(distributor){distributor.position=FairRouteGeometry.Selector;distributor.rotation=Quaternion.Euler(0,0,17);}if(door)door.localRotation=Quaternion.identity;Render();}
  public void Command(string command){
   if(command=="structure"){GetComponent<CabinetStructureView>()?.Toggle();}
   else if(command=="fire"){AutoFire=!AutoFire;}
   else if(command=="pause")SetPaused(!Paused);
   else if(command=="supply")Rules.Supply();
   else if(command=="reset")ResetMachine();
   else if(command=="sound"){sound=!sound;if(soundscape)soundscape.SetEnabled(sound);AudioListener.pause=!sound||Paused;}
   else if(command.StartsWith("volume:")){if(float.TryParse(command.Substring(7),System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out float volume)&&soundscape)soundscape.SetVolume(volume);}
   else if(command.StartsWith("preview-rate:")){if(Demo&&float.TryParse(command.Substring(13),out float rate)){PreviewRate=rate==4?4:rate==8?8:1;if(!Paused)Time.timeScale=PreviewRate;if(soundscape)soundscape.SetPreviewRate(PreviewRate);}}
   else if(command=="angle"){view=view=="front"?"angle":"front";}
   else if(command.StartsWith("view:")){var next=command.Substring(5);if(next=="front"||next=="angle"||next=="fair"||next=="right"||next=="controls"||next=="lcd")view=next;}
   else if(command=="push"){if(!Paused&&(ReferenceSequenceTimeline.IsPushWindow(Rules.Active,Rules.Mode)||BonusPushWindow())){PushFeedback=1;impact=.35f;if(soundscape)soundscape.PlayCue("push");}}
   else if(command.StartsWith("demo-")){ResetMachine();Demo=true;string demo=command.Substring(5);
    if(demo=="decision"||demo=="rush-reach"){Rules.SetDemo("rush");Rules.Enter(true,true);if(demo=="decision")Rules.Holds.Peek().award=new Award{rounds=10,next=PlayMode.SwordRush,title="決意の刃"};Rules.Tick(demo=="decision"?ReferenceSequenceTimeline.RushDuration:0);}
    else if(demo=="awakening"||demo=="upper-result"){Rules.SetDemo("wou");var pres=GetComponent<ReferencePresentation>();if(demo=="awakening")pres?.PreviewUpperStage("awakening");else {for(int i=0;i<70;i++){Rules.Enter(true,false);Rules.Tick(ReferenceSequenceTimeline.RushDuration+1);}pres?.PreviewUpperResult("result");}}
    else Rules.SetDemo(demo);AutoFire=Rules.Bonus!=null||Rules.Mode!=PlayMode.Normal;
   }
   Render();Report();
  }
  bool BonusPushWindow(){var state=Rules?.BonusPresentation;if(state==null||!state.IsActive||state.Phase!=BonusPresentationPhase.Story)return false;var award=state.CompletedAward;return BonusStoryTimeline.Story(BonusStoryTimeline.Route(state.SourceMode,award.drive,award.title),state.Elapsed,state.PhaseDuration,state.Paid).Push;}
  void SetPaused(bool value){Paused=value;Rules.SetPaused(value);Time.timeScale=value?0:Demo?PreviewRate:1;AudioListener.pause=value||!sound;}
  void OnApplicationFocus(bool focus){if(!focus)SetPaused(true);}
  void OnApplicationPause(bool value){if(value)SetPaused(true);}
  void OnDestroy(){Time.timeScale=1;AudioListener.pause=false;}
  void FixedUpdate(){
   if(Paused)return;
   if(Rules.Bonus==null){wasBonus=false;roundsSeen=0;roundGap=0;}else if(!wasBonus){wasBonus=true;roundsSeen=0;}
   int completed=Rules.BonusCount/10;if(Rules.Bonus!=null&&completed>roundsSeen){roundsSeen=completed;roundGap=.65f;}
   if(roundGap>0)roundGap-=Time.fixedDeltaTime;
   fireClock+=Time.fixedDeltaTime;
   if(AutoFire&&fireClock>=.6f&&balls.Count<64){fireClock-=.6f;Fire();}else if(!AutoFire)fireClock=0;
   Rules.Tick(Time.fixedDeltaTime);
   // This kinematic blade physically opens the route; no position/velocity correction on balls.
   if(distributor)distributor.MoveRotation(Quaternion.Euler(0,0,DistributorCount%5==4?-32:17));
   float target=Rules.Bonus!=null&&roundGap<=0?78:0;gateAngle=Mathf.MoveTowards(gateAngle,target,Time.fixedDeltaTime*240);door.localRotation=Quaternion.Euler(gateAngle,0,0);
  }
  void Fire(){
   Vector3 point=launchPoint.position;
   if(Physics.CheckSphere(point,.006f,1<<8,QueryTriggerInteraction.Ignore))return;
   if(!Rules.Shoot())return;
   if(soundscape)soundscape.PlayCue("launch");
   var go=Instantiate(ballPrefab,point,Quaternion.identity,ballRoot);go.SetActive(true);var b=go.GetComponent<BallBody>();b.owner=this;balls.Add(b);
   go.GetComponent<Rigidbody>().linearVelocity=new Vector3(0,Rules.Bonus!=null||Rules.IsBonusPresentationPending||Rules.Mode!=PlayMode.Normal?rightSpeed:normalSpeed,0);
  }
  public void Receive(PocketSensor sensor,BallBody ball){
   if(Paused)return;
   switch(sensor.kind){
    case PocketKind.Distributor:if(!ball.distributed){ball.distributed=true;DistributorCount++;}return;
    case PocketKind.Plus:Rules.ReceiveStart();ball.Collect(true);break;
    case PocketKind.Right:if(Rules.Mode!=PlayMode.Normal&&Rules.Bonus==null){Rules.ReceiveStart(true);ball.Collect(true);}break;
    case PocketKind.Attacker:if(Rules.Bonus!=null&&gateAngle>60&&roundGap<=0&&Rules.CountBonus())ball.Collect(true);break;
    case PocketKind.Fair:FairReceived++;if(sensor.winningSlot){FairWon++;Rules.ReceiveStart();}ball.Collect(sensor.winningSlot);break;
    case PocketKind.Out:ball.Collect(false);break;
   }
  }
  public void RemoveBall(BallBody ball,bool scored){balls.Remove(ball);if(scored)ScoredBalls++;}
  public void Contact(float speed){ContactCount++;if(soundscape)soundscape.Contact(speed);}
  void OnGameEvent(string type){if(type=="win")impact=1;if(soundscape)soundscape.GameEvent(type,Rules.Mode);}
  void Update(){
   if(!Paused){impact=Mathf.Max(0,impact-Time.deltaTime*1.3f);PushFeedback=Mathf.Max(0,PushFeedback-Time.deltaTime*2.5f);}
   camOrbit=Mathf.MoveTowards(camOrbit,view=="angle"?1:0,Time.unscaledDeltaTime*2);
   var target=new Vector3(0,.565f,0);var position=Vector3.Lerp(new Vector3(0,.6f,-1.68f),new Vector3(.58f,.72f,-1.60f),camOrbit);float fov=42;
   if(view=="fair"){target=FairRouteGeometry.RotorCenter+new Vector3(-.007f,.015f,0);position=target+new Vector3(.012f,.145f,-.44f);fov=45;}
   else if(view=="right"){target=new Vector3(.2f,.55f,-.052f);position=new Vector3(.2f,.6f,-.9f);fov=38;}
   else if(view=="lcd"){target=new Vector3(.012f,.597f,-.09f);position=new Vector3(.012f,.597f,-.85f);fov=39;}
   else if(view=="controls"){target=new Vector3(0,.175f,-.12f);position=new Vector3(.14f,.38f,-1.20f);fov=50;}
   viewCamera.fieldOfView=fov;viewCamera.transform.position=position;viewCamera.transform.LookAt(target);
   if(swordBlue){float t=Rules.Active!=null?ReferenceSequenceTimeline.SwordAmount(Rules.Active,Rules.Mode):Rules.Bonus!=null?.4f:0;swordBlue.localRotation=Quaternion.Euler(0,0,Mathf.Lerp(-88,-38,t));swordGold.localRotation=Quaternion.Euler(0,0,Mathf.Lerp(88,38,t));}
   if(soundscape)soundscape.Observe(Rules);
   Render();reportClock+=Time.unscaledDeltaTime;if(reportClock>.3f){reportClock=0;Report();}
  }
  void Render(){if(Rules==null||topStats==null)return;var r=Rules;var a=r.Active;var b=r.Bonus;
   topStats.text=$"大当り {r.Jackpots:00}       総スタート {r.Starts:0000}       ST {(b!=null||r.IsBonusPresentationPending||r.Mode==PlayMode.Normal?"—":r.Remaining.ToString("00"))}";
   status.text=Paused?"一時停止":$"{(r.IsBonusPresentationPending?"演出中":r.Mode==PlayMode.Normal&&b==null?"左打ち":"右打ち")}   持ち玉 {r.Stock:N0}   払出 {r.Payout:N0}";
   modeLabel.text=r.Mode==PlayMode.Normal?"ALICIZATION":r.Mode==PlayMode.SwordRush?"SWORD RUSH":"WAR OF UNDERWORLD";
   titleLabel.text=Demo?"試演モード":"UNITY / 制作中";
   for(int i=0;i<3;i++){
    int digit=r.Digits[i];if(a!=null){float stop=ReferenceSequenceTimeline.StopTime(a,r.Mode,i);digit=a.elapsed<stop?1+((int)(a.elapsed*13)+i*3)%6:(a.win||i!=1?a.digit:1+(a.digit+2)%6);}
    reels[i].text=digit.ToString();reels[i].gameObject.SetActive(b==null&&!r.IsBonusPresentationPending);reels[i].rectTransform.localScale=Vector3.one*(a!=null&&a.reach?.55f:1);
   }
   for(int i=0;i<4;i++)holds[i].color=i<r.Holds.Count?new Color(.6f,.88f,1):new Color(.13f,.18f,.29f);
   string text="",sub="";
   if(b!=null){text=b.title;sub=$"獲得 {r.BonusPaid:N0} 玉";payoutLabel.text=$"進行 {Mathf.Min(b.rounds,r.BonusCount/10+1)} R";}
   else if(r.IsBonusPresentationPending){text="";sub="";payoutLabel.text="";}
   else if(a!=null&&a.reach){text="";sub="";payoutLabel.text="";}
   else payoutLabel.text=r.Mode==PlayMode.Normal?"夜空":$"LAST {r.Remaining:00}";
   headline.text=text;subtitle.text=sub;headline.color=b!=null?new Color(1,.83f,.38f):Color.white;
   if(keyArt)keyArt.color=new Color(1,1,1,b!=null?.23f:a!=null&&a.reach?.5f:.8f);
   if(flash)flash.color=new Color(.7f,.87f,1,impact*.42f);
   if(lampMaterial)lampMaterial.SetColor("_EmissionColor",(b!=null?new Color(1,.52f,.08f):new Color(.38f,.08f,.85f))*(1+impact*3));
  }
  [Serializable] public class Telemetry{public int shots,balls,contacts,starts,holds,stock,payout,remaining,bonusCount,fairReceived,fairWon;public bool paused,autoFire,demo,bonus,bonusPresentationPending;public string bonusPresentationPhase;public float bonusPresentationElapsed;public string mode,view;public float activeTime,ballX,ballY,ballZ;public int distributorCount,audioCues,fairSelected;public float previewRate,volume;public string audioCue,scene;public bool soundEnabled;}
  public string Snapshot(){return JsonUtility.ToJson(new Telemetry{shots=Rules.Shots,balls=balls.Count,contacts=ContactCount,starts=Rules.Starts,holds=Rules.Holds.Count,stock=Rules.Stock,payout=Rules.Payout,remaining=Rules.Remaining,bonusCount=Rules.BonusCount,fairReceived=FairReceived,fairWon=FairWon,paused=Paused,autoFire=AutoFire,demo=Demo,bonus=Rules.Bonus!=null,bonusPresentationPending=Rules.IsBonusPresentationPending,bonusPresentationPhase=Rules.BonusPresentation?.Phase.ToString()??"",bonusPresentationElapsed=Rules.BonusPresentation?.Elapsed??0,mode=Rules.Mode.ToString(),view=view,activeTime=Rules.Active?.elapsed??0,audioCues=soundscape?soundscape.CueCount:0,audioCue=soundscape?soundscape.LastCue:"",volume=soundscape?soundscape.Volume:0,soundEnabled=sound,previewRate=PreviewRate,distributorCount=DistributorCount,fairSelected=DistributorCount/5,scene=GetComponent<ReferencePresentation>()?.SceneId??"",ballX=balls.Count>0&&balls[balls.Count-1]?balls[balls.Count-1].transform.position.x:0,ballY=balls.Count>0&&balls[balls.Count-1]?balls[balls.Count-1].transform.position.y:0,ballZ=balls.Count>0&&balls[balls.Count-1]?balls[balls.Count-1].transform.position.z:0});}
  void Report(){
   #if UNITY_WEBGL && !UNITY_EDITOR
   YozoraReport(Snapshot());
   #endif
  }
  #if UNITY_EDITOR || !UNITY_WEBGL
  void OnGUI(){
   GUI.skin.font=font;GUILayout.BeginArea(new Rect(12,Screen.height-106,Mathf.Min(Screen.width-24,880),100));
   GUILayout.BeginHorizontal();if(GUILayout.Button(AutoFire?"発射停止":"発射開始",GUILayout.Height(34)))Command("fire");if(GUILayout.Button(Paused?"再開":"一時停止",GUILayout.Height(34)))Command("pause");if(GUILayout.Button("250玉補給",GUILayout.Height(34)))Command("supply");if(GUILayout.Button("PUSH",GUILayout.Height(34)))Command("push");if(GUILayout.Button("視点",GUILayout.Height(34)))Command("angle");if(GUILayout.Button("音",GUILayout.Height(34)))Command("sound");GUILayout.EndHorizontal();
   GUILayout.BeginHorizontal();if(GUILayout.Button("当り試演"))Command("demo-win");if(GUILayout.Button("外れ試演"))Command("demo-miss");if(GUILayout.Button("300玉試演"))Command("demo-bonus");if(GUILayout.Button("DRIVE試演"))Command("demo-drive");if(GUILayout.Button("リセット"))Command("reset");GUILayout.EndHorizontal();GUILayout.EndArea();
  }
  #endif
 }
}
