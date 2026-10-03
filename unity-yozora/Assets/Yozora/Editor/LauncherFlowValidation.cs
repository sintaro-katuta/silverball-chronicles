using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using UnityEngine;
using UnityEditor;
using Yozora;
using Object=UnityEngine.Object;
/// <summary>Launches the actual prefab from the actual muzzle. Every 1/120 s tick is saved.
/// EditMode does not run gameplay FixedUpdate: BallBody is removed, FAIR is a boundary,
/// the two gate poses are applied explicitly, and no award/lottery claim is made.</summary>
public static class LauncherFlowValidation {
 struct BodyState {public Rigidbody body;public Vector3 p,v,w;public Quaternion q;public bool k,sleep;}
 static readonly CultureInfo Inv=CultureInfo.InvariantCulture;
 [MenuItem("Yozora/Validate complete launcher routes")]
 public static void Run(){
  var machine=Object.FindFirstObjectByType<YozoraMachine>();
  if(!machine||!machine.ballPrefab||!machine.launchPoint)throw new Exception("LAUNCHER_FLOW: generated scene required");
  var gate=machine.GetComponent<RightMechanismDrive>();if(!gate||!gate.slidingGate)throw new Exception("LAUNCHER_FLOW: right gate required");
  var selector=Object.FindFirstObjectByType<FairDistributor>();var selectorCollider=selector?selector.GetComponent<Collider>():null;
  var sensors=machine.GetComponentsInChildren<PocketSensor>();var lcd=GameObject.Find("LCD physical surround");if(!lcd)throw new Exception("LAUNCHER_FLOW: LCD required");
  var lcdCollider=lcd.GetComponent<MeshCollider>();ValidateMesh(lcdCollider);
  var oldMode=Physics.simulationMode;var oldGravity=Physics.gravity;float oldContact=Physics.defaultContactOffset;bool oldSync=Physics.autoSyncTransforms;
  Vector3 gatePose=gate.slidingGate.localPosition;var snapshots=new List<BodyState>();var balls=new List<GameObject>();var failures=new List<string>();var summaries=new StringBuilder();int passed=0;
  string directory=Path.GetFullPath(Path.Combine(Application.dataPath,"../../prototype/reference-review/yozora/structure-review-2026-09-26/launcher-flow"));Directory.CreateDirectory(directory);
  try {
   foreach(var rb in Object.FindObjectsByType<Rigidbody>(FindObjectsSortMode.None)){snapshots.Add(new BodyState{body=rb,p=rb.position,q=rb.rotation,v=rb.linearVelocity,w=rb.angularVelocity,k=rb.isKinematic,sleep=rb.IsSleeping()});if(!rb.isKinematic)rb.isKinematic=true;}
   Physics.simulationMode=SimulationMode.Script;Physics.gravity=new Vector3(0,-9.81f,0);Physics.defaultContactOffset=.0004f;Physics.autoSyncTransforms=false;
   foreach(bool rightMode in new[]{false,true})foreach(bool open in new[]{false,true}){
    string name=(rightMode?"right":"normal")+"-"+(open?"open":"closed");float speed=rightMode?machine.rightSpeed:machine.normalSpeed;
    gate.ApplyOpening(open?1:0);
    var ball=Object.Instantiate(machine.ballPrefab,machine.launchPoint.position,Quaternion.identity);balls.Add(ball);ball.name="Full launcher probe "+name;
    var behavior=ball.GetComponent<BallBody>();if(behavior)Object.DestroyImmediate(behavior);ball.SetActive(true);
    var body=ball.GetComponent<Rigidbody>();var sphere=ball.GetComponent<SphereCollider>();float radius=sphere.radius*ball.transform.lossyScale.x;
    if(Mathf.Abs(radius-.0055f)>.00001f)throw new Exception("LAUNCHER_FLOW: actual prefab is not 11 mm");
    body.linearVelocity=new Vector3(0,speed,0);Physics.SyncTransforms();
    var csv=new StringBuilder("tick,time,x,y,z,vx,vy,vz,lcd_solid_depth,left_entry,right_entry,terminal\n");
    bool leftEntry=false,rightEntry=false;float maxY=body.position.y,maxLCD=0;float stationary=0;Vector3 previous=body.position;string terminal=null;int lastTick=0;
    WriteRow(csv,0,body,0,false,false,"");
    for(int tick=1;tick<=2400;tick++){
     Physics.Simulate(1f/120);lastTick=tick;var p=body.position;var v=body.linearVelocity;maxY=Mathf.Max(maxY,p.y);
     // Entry is after the barrel. A ball simply falling back down the launch tube does not pass.
     if(p.y>.62f&&p.y<.825f&&p.x>-.214f&&p.x<-.13f&&v.y<0)leftEntry=true;
     // Sample the entrance above the traced right guide rather than any eventual right-side x.
     if(p.y>.77f&&p.y<.94f&&p.x>.177f&&p.x<.240f&&v.y<0)rightEntry=true;
     float solid=SolidPenetration(lcd.transform.InverseTransformPoint(p),radius);maxLCD=Mathf.Max(maxLCD,solid);
     if(!Finite(p)||!Finite(v))terminal="FAIL_nonfinite";
     else if(Mathf.Abs(p.x)>.275f||p.z<-.085f||p.z>-.020f||p.y>1.09f)terminal="FAIL_cavity_escape";
     else if(solid>radius*.55f)terminal="FAIL_LCD_solid_penetration";
     else {
      if(!rightMode&&v.y<=0&&Touches(selectorCollider,p,radius))terminal="FAIR_selector_boundary";
      foreach(var sensor in sensors){if(terminal!=null)break;if(sensor.kind!=PocketKind.Plus&&sensor.kind!=PocketKind.Out&&sensor.kind!=PocketKind.Right&&sensor.kind!=PocketKind.Attacker)continue;if(Touches(sensor.GetComponent<Collider>(),p,radius))terminal=sensor.kind.ToString();}
      if(terminal==null&&p.y<.17f)terminal="FAIL_uncollected_lower_escape";
      if(v.sqrMagnitude<.000225f&&Vector3.Distance(previous,p)<.00015f)stationary+=1f/120;else stationary=0;
      if(terminal==null&&stationary>1.5f)terminal="FAIL_stationary_trap";
     }
     previous=p;WriteRow(csv,tick,body,solid,leftEntry,rightEntry,terminal??"");if(terminal!=null)break;
    }
    if(terminal==null)terminal="FAIL_20s_timeout";
    bool correct=rightMode?rightEntry&&(open?terminal=="Attacker":terminal=="Right"):leftEntry&&(terminal=="FAIR_selector_boundary"||terminal=="Plus"||terminal=="Out");
    string summary=$"LAUNCHER_FLOW {name} speed={speed:F2} pass={correct} terminal={terminal} leftEntry={leftEntry} rightEntry={rightEntry} time={lastTick/120f:F3}s maxY={maxY:F4} maxLCD={maxLCD:F6} final={body.position.ToString("F5")}";
    Debug.Log(summary);summaries.AppendLine(summary);File.WriteAllText(Path.Combine(directory,name+".csv"),csv.ToString());
    if(!correct){var nearby=new List<string>();foreach(var c in Physics.OverlapSphere(body.position,radius+.002f,~0,QueryTriggerInteraction.Ignore))if(c!=sphere)nearby.Add(c.transform.parent?c.transform.parent.name+"/"+c.name:c.name);var diagnostic="LAUNCHER_FLOW_CONTACTS "+name+": "+string.Join(" | ",nearby);Debug.Log(diagnostic);summaries.AppendLine(diagnostic);failures.Add(summary);}else passed++;
    Object.DestroyImmediate(ball);
   }
  } finally {
   foreach(var b in balls)if(b)Object.DestroyImmediate(b);gate.slidingGate.localPosition=gatePose;
   foreach(var s in snapshots)if(s.body){s.body.position=s.p;s.body.rotation=s.q;s.body.isKinematic=s.k;if(!s.k){s.body.linearVelocity=s.v;s.body.angularVelocity=s.w;if(s.sleep)s.body.Sleep();else s.body.WakeUp();}}
   Physics.gravity=oldGravity;Physics.defaultContactOffset=oldContact;Physics.autoSyncTransforms=oldSync;Physics.simulationMode=oldMode;Physics.SyncTransforms();File.WriteAllText(Path.Combine(directory,"summary.txt"),summaries.ToString()+"\nScope: full muzzle-to-terminal rigid-body flow at configured speeds; EditMode removes BallBody and does not execute FAIR guided FixedUpdate or gameplay awards.\n");
  }
  if(failures.Count>0)throw new Exception("LAUNCHER_FLOW_FAILED "+failures.Count+"/4. CSV: "+directory+"\n"+string.Join("\n",failures));
  Debug.Log("LAUNCHER_FLOW_PASSED "+passed+"/4: normal enters left field, right enters traced right route; closed RIGHT/open attacker. Every fixed tick saved to "+directory);
 }
 static void WriteRow(StringBuilder csv,int tick,Rigidbody body,float penetration,bool left,bool right,string terminal){var p=body.position;var v=body.linearVelocity;csv.Append(tick).Append(',').Append((tick/120f).ToString("F6",Inv));foreach(float f in new[]{p.x,p.y,p.z,v.x,v.y,v.z,penetration})csv.Append(',').Append(f.ToString("F7",Inv));csv.Append(',').Append(left?1:0).Append(',').Append(right?1:0).Append(',').Append(terminal).Append('\n');}
 static bool Touches(Collider c,Vector3 p,float radius)=>c&&c.enabled&&Vector3.Distance(c.ClosestPoint(p),p)<=radius;
 static bool Finite(Vector3 p)=>!float.IsNaN(p.x)&&!float.IsNaN(p.y)&&!float.IsNaN(p.z)&&!float.IsInfinity(p.x)&&!float.IsInfinity(p.y)&&!float.IsInfinity(p.z);
 static void ValidateMesh(MeshCollider collider){if(!collider||!collider.sharedMesh)throw new Exception("LAUNCHER_FLOW: missing LCD collision mesh");var outline=ReferenceShape.ScreenOutline;var v=collider.sharedMesh.vertices;if(v.Length!=outline.Length*2||Vector3.Distance(collider.transform.lossyScale,Vector3.one)>.00001f)throw new Exception("LAUNCHER_FLOW: LCD coordinate assumption mismatch");for(int i=0;i<outline.Length;i++)for(int j=0;j<2;j++)if(Vector3.Distance(v[i*2+j],new Vector3(outline[i].x*.315f,outline[i].y*.480f,j==0?-.022f:.022f))>.00001f)throw new Exception("LAUNCHER_FLOW: LCD visual/collider outline mismatch");if(SolidPenetration(new Vector3(-.163f,0,0),.0055f)>.00001f||SolidPenetration(new Vector3(-.159f,0,0),.0055f)<.0039f)throw new Exception("LAUNCHER_FLOW: signed-distance self-check");}
 static float SolidPenetration(Vector3 p,float radius){var outline=ReferenceShape.ScreenOutline;var q=new Vector2(p.x,p.y);bool inside=false;float distance=float.PositiveInfinity;for(int i=0,j=outline.Length-1;i<outline.Length;j=i++){var a=Vector2.Scale(outline[j],new Vector2(.315f,.480f));var b=Vector2.Scale(outline[i],new Vector2(.315f,.480f));if((a.y>q.y)!=(b.y>q.y)&&q.x<(b.x-a.x)*(q.y-a.y)/(b.y-a.y)+a.x)inside=!inside;var e=b-a;distance=Mathf.Min(distance,Vector2.Distance(q,a+Mathf.Clamp01(Vector2.Dot(q-a,e)/e.sqrMagnitude)*e));}float z=Mathf.Max(0,Mathf.Abs(p.z)-.022f);if(inside&&z==0)return radius+Mathf.Min(distance,.022f-Mathf.Abs(p.z));float xy=inside?0:distance;return Mathf.Max(0,radius-Mathf.Sqrt(xy*xy+z*z));}
}
