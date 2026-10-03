using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using Yozora;
using Object=UnityEngine.Object;
/// <summary>Free-physics structural probes. No BallBody is attached, so admission cannot
/// mutate game state. The FAIR selector is an explicit endpoint: guided FixedUpdate is not
/// executed by EditMode Physics.Simulate. This test does NOT certify FAIR animation or odds.</summary>
public static class LeftFlowValidation {
 struct Trial {public string name;public Vector3 p,v;public Trial(string n,float x,float y,float vx=0,float vy=0){name=n;p=new Vector3(x,y,-.052f);v=new Vector3(vx,vy,0);}}
 struct BodyState {public Rigidbody b;public Vector3 p,v,w;public Quaternion q;public bool k,sleep;}
 [MenuItem("Yozora/Validate left free-physics flow")]
 public static void Run(){
  var m=Object.FindFirstObjectByType<YozoraMachine>();if(!m||!m.ballPrefab)throw new Exception("LEFT_FLOW: generated machine and ball prefab required");
  var selector=Object.FindFirstObjectByType<FairDistributor>();if(!selector)throw new Exception("LEFT_FLOW: FAIR selector required");
  var selectorCollider=selector.GetComponent<Collider>();
  var terminals=new List<PocketSensor>();foreach(var s in Object.FindObjectsByType<PocketSensor>(FindObjectsSortMode.None))if(s.kind==PocketKind.Plus||s.kind==PocketKind.Out)terminals.Add(s);
  var screen=GameObject.Find("LCD physical surround");if(!screen)throw new Exception("LEFT_FLOW: LCD physical surround required");var screenCollider=screen.GetComponent<Collider>();ValidateLCDMesh(screen.GetComponent<MeshCollider>());
  var source=m.ballPrefab.GetComponent<Rigidbody>();var sourceSphere=m.ballPrefab.GetComponent<SphereCollider>();float radius=sourceSphere.radius*m.ballPrefab.transform.localScale.x;
  if(Mathf.Abs(radius-.0055f)>.00001f)throw new Exception("LEFT_FLOW: expected current 11 mm ball");
  if(LCDSolidPenetration(new Vector3(-.163f,0,0),radius)>.00001f||LCDSolidPenetration(new Vector3(-.159f,0,0),radius)<.0039f||LCDSolidPenetration(Vector3.zero,radius)<radius)throw new Exception("LEFT_FLOW: signed-distance self-check failed");
  var mode=Physics.simulationMode;var gravity=Physics.gravity;bool autoSync=Physics.autoSyncTransforms;float contactOffset=Physics.defaultContactOffset;
  var bodyStates=new List<BodyState>();var probes=new List<GameObject>();var failures=new List<string>();int reached=0;
  try {
   foreach(var b in Object.FindObjectsByType<Rigidbody>(FindObjectsSortMode.None)){bodyStates.Add(new BodyState{b=b,p=b.position,q=b.rotation,v=b.linearVelocity,w=b.angularVelocity,k=b.isKinematic,sleep=b.IsSleeping()});if(!b.isKinematic)b.isKinematic=true;}
   Physics.simulationMode=SimulationMode.Script;Physics.gravity=new Vector3(0,-9.81f,0);Physics.defaultContactOffset=.0004f;Physics.autoSyncTransforms=false;
   // Upper seeds lie inside the ellipse x²/.24²+(y-.567)²/.364² < 1,
   // with at least a ball radius from its inner face. Outside-rail drops are not valid flow probes.
   var trials=new[]{new Trial("upper left falling",-.128f,.845f),new Trial("upper outer falling",-.179f,.785f),new Trial("upper bank inward",-.166f,.805f,.16f,-.10f),new Trial("left vertical upper",-.192f,.610f),new Trial("left vertical lower",-.186f,.480f),new Trial("after selector normal spill",-.190f,FairRouteGeometry.Selector.y-.022f),new Trial("lower nail bank",-.150f,.341f+FairRouteGeometry.LowerWideNailLift),new Trial("PLUS approach",-.064f,.283f+FairRouteGeometry.PlusLift)};
   foreach(var trial in trials){
    var go=new GameObject("Left flow probe "+trial.name);probes.Add(go);go.layer=m.ballPrefab.layer;go.transform.position=trial.p;
    var sphere=go.AddComponent<SphereCollider>();sphere.radius=radius;sphere.sharedMaterial=sourceSphere.sharedMaterial;
    var rb=go.AddComponent<Rigidbody>();rb.mass=source.mass;rb.linearDamping=source.linearDamping;rb.angularDamping=source.angularDamping;rb.collisionDetectionMode=source.collisionDetectionMode;rb.solverIterations=source.solverIterations;rb.solverVelocityIterations=source.solverVelocityIterations;rb.maxAngularVelocity=source.maxAngularVelocity;rb.linearVelocity=trial.v;
    Physics.SyncTransforms();string terminal=null;Vector3 last=rb.position;float stationary=0;float elapsed=0;float maxPenetration=0;float maxMeshApiDepth=0;
    for(int frame=0;frame<1440;frame++){
     Physics.Simulate(1f/120);elapsed=(frame+1)/120f;var p=rb.position;
     if(!Finite(p)||!Finite(rb.linearVelocity)){terminal="FAIL nonfinite pose";break;}
     if(Mathf.Abs(p.x)>.27f||p.z<-.087f||p.z>-.015f){terminal="FAIL escaped glass cavity "+p.ToString("F4");break;}
     // Mesh.ComputePenetration reports the complete radius for some grazing contacts
     // against this closed nonconvex extrusion. Use the shared outline's signed distance
     // to establish actual solid intrusion; preserve the API return as diagnostic evidence.
     if(Physics.ComputePenetration(sphere,p,rb.rotation,screenCollider,screenCollider.transform.position,screenCollider.transform.rotation,out Vector3 direction,out float apiDepth))maxMeshApiDepth=Mathf.Max(maxMeshApiDepth,apiDepth);
     float depth=LCDSolidPenetration(screen.transform.InverseTransformPoint(p),radius);
     maxPenetration=Mathf.Max(maxPenetration,depth);if(depth>radius*.55f){terminal="FAIL LCD solid penetration "+depth.ToString("F5");break;}
     if(rb.linearVelocity.y<=0&&Touches(selectorCollider,p,radius)){terminal="FAIR selector boundary";break;}
     foreach(var t in terminals)if(Touches(t.GetComponent<Collider>(),p,radius)){terminal=t.kind.ToString();break;}
     if(terminal!=null)break;
     if(p.y<.205f){terminal="lower drain boundary";break;}
     if(rb.linearVelocity.sqrMagnitude<.000225f&&Vector3.Distance(last,p)<.00015f)stationary+=1f/120;else stationary=0;last=p;
     if(stationary>1.5f){terminal="FAIL stationary trap "+p.ToString("F4");break;}
    }
    if(terminal==null)terminal="FAIL 12 s timeout "+rb.position.ToString("F4");
    Debug.Log($"LEFT_FLOW_SAMPLE name={trial.name} terminal={terminal} time={elapsed:F3}s final={rb.position.ToString("F4")} LCDsolidMax={maxPenetration:F5} MeshAPImax={maxMeshApiDepth:F5}");
    if(terminal.StartsWith("FAIL")){
     failures.Add(trial.name+": "+terminal);var nearby=new List<string>();
     foreach(var hit in Physics.OverlapSphere(rb.position,radius+.0015f,~0,QueryTriggerInteraction.Ignore))if(hit!=sphere)nearby.Add(hit.transform.parent?hit.transform.parent.name+"/"+hit.name:hit.name);
     Debug.Log("LEFT_FLOW_TRAP_CONTACTS "+trial.name+": "+string.Join(" | ",nearby));
    }else reached++;
    Object.DestroyImmediate(go);
   }
  } finally {
   foreach(var g in probes)if(g)Object.DestroyImmediate(g);
   foreach(var s in bodyStates)if(s.b){s.b.position=s.p;s.b.rotation=s.q;s.b.isKinematic=s.k;if(!s.k){s.b.linearVelocity=s.v;s.b.angularVelocity=s.w;if(s.sleep)s.b.Sleep();else s.b.WakeUp();}}
   Physics.gravity=gravity;Physics.defaultContactOffset=contactOffset;Physics.autoSyncTransforms=autoSync;Physics.simulationMode=mode;Physics.SyncTransforms();
  }
  if(failures.Count>0)throw new Exception("LEFT_FLOW_FAILED "+failures.Count+"/8\n"+string.Join("\n",failures));
  Debug.Log("LEFT_FLOW_PASSED: "+reached+"/8 free-physics probes reached selector/PLUS/OUT/drain; no > half-radius LCD penetration or 12s trap. FAIR guided FixedUpdate and gameplay probabilities excluded.");
 }
 static void ValidateLCDMesh(MeshCollider collider){
  if(!collider||!collider.sharedMesh)throw new Exception("LEFT_FLOW: LCD mesh collider missing");
  var outline=ReferenceShape.ScreenOutline;var v=collider.sharedMesh.vertices;
  if(v.Length!=outline.Length*2)throw new Exception("LEFT_FLOW: LCD collision outline vertex count mismatch");
  if(Vector3.Distance(collider.transform.lossyScale,Vector3.one)>.00001f)throw new Exception("LEFT_FLOW: LCD signed-distance audit expects metre scale");
  for(int i=0;i<outline.Length;i++)for(int side=0;side<2;side++){
   var expected=new Vector3(outline[i].x*.315f,outline[i].y*.480f,side==0?-.022f:.022f);
   if(Vector3.Distance(v[i*2+side],expected)>.00001f)throw new Exception("LEFT_FLOW: visible/physical LCD outline mismatch at "+i);
  }
 }
 static float LCDSolidPenetration(Vector3 p,float radius){
  var outline=ReferenceShape.ScreenOutline;var q=new Vector2(p.x,p.y);bool inside=false;float distance=float.PositiveInfinity;
  for(int i=0,j=outline.Length-1;i<outline.Length;j=i++){
   var a=Vector2.Scale(outline[j],new Vector2(.315f,.480f));var b=Vector2.Scale(outline[i],new Vector2(.315f,.480f));
   if((a.y>q.y)!=(b.y>q.y)&&q.x<(b.x-a.x)*(q.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
   var edge=b-a;float t=Mathf.Clamp01(Vector2.Dot(q-a,edge)/edge.sqrMagnitude);distance=Mathf.Min(distance,Vector2.Distance(q,a+t*edge));
  }
  float zOutside=Mathf.Max(0,Mathf.Abs(p.z)-.022f);
  if(inside&&zOutside==0)return radius+Mathf.Min(distance,.022f-Mathf.Abs(p.z));
  float xyOutside=inside?0:distance;return Mathf.Max(0,radius-Mathf.Sqrt(xyOutside*xyOutside+zOutside*zOutside));
 }
 static bool Touches(Collider c,Vector3 p,float radius)=>c&&c.enabled&&Vector3.Distance(c.ClosestPoint(p),p)<=radius;
 static bool Finite(Vector3 p)=>!float.IsNaN(p.x)&&!float.IsNaN(p.y)&&!float.IsNaN(p.z)&&!float.IsInfinity(p.x)&&!float.IsInfinity(p.y)&&!float.IsInfinity(p.z);
}
