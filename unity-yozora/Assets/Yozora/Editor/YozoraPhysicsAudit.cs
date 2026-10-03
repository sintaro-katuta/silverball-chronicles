using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using Yozora;
public static class YozoraPhysicsAudit {
 public static void ValidateDistributionPattern(){
  var root=new GameObject("FAIR isolated validation");
  try {
   var machine=root.AddComponent<YozoraMachine>();machine.ResetMachine();var selector=root.AddComponent<FairDistributor>();selector.owner=machine;
   for(int phase=0;phase<2;phase++){
    machine.ResetMachine();if(selector.SelectedCount!=0)throw new System.Exception("FAIR reset retains selection count");
    for(int i=1;i<=10;i++){
     var go=new GameObject("validation ball");go.transform.SetParent(root.transform);var ball=go.AddComponent<BallBody>();var rb=go.GetComponent<Rigidbody>();rb.linearVelocity=Vector3.down;
     bool chosen=selector.Admit(ball);if(chosen!=(i%5==0)||machine.DistributorCount!=i)throw new System.Exception("FAIR fifth-ball sequence differs");
     if(selector.Admit(ball)||machine.DistributorCount!=i)throw new System.Exception("FAIR counted repeat entry twice");
    }
    if(selector.SelectedCount!=2)throw new System.Exception("FAIR selected count differs");
   }
   var ascending=new GameObject("ascending validation ball");ascending.transform.SetParent(root.transform);var up=ascending.AddComponent<BallBody>();up.GetComponent<Rigidbody>().linearVelocity=Vector3.up;
   if(selector.Admit(up)||machine.DistributorCount!=10)throw new System.Exception("FAIR counts ascending balls");
   Debug.Log("YOZORA_FAIR_DISTRIBUTION_PASS: fifth-ball selection, duplicate rejection, reset, ascending rejection");
  } finally {Object.DestroyImmediate(root);}
 }
 public static void VerifyFairAssembly(){
  int selected=0;for(int i=1;i<=100;i++)if(FairDistributor.IsSelected(i))selected++;
  if(selected!=20||FairDistributor.IsSelected(0))throw new System.Exception("FAIR selector must pass each fifth downward arrival");
  var drive=Object.FindFirstObjectByType<RotorDrive>();if(drive==null||Vector3.Dot(drive.localAxis.normalized,Vector3.up)<.999f)throw new System.Exception("FAIR rotor must rotate around local Y");
  var pockets=drive.GetComponentsInChildren<PocketSensor>();int wins=0;foreach(var p in pockets){if(p.kind!=PocketKind.Fair||p.gameObject.layer!=11)throw new System.Exception("FAIR isolated pocket layer missing");if(p.winningSlot)wins++;}
  if(pockets.Length!=6||wins!=2)throw new System.Exception("FAIR rotor needs exactly six physical pockets, two winning");
  var selector=Object.FindFirstObjectByType<FairDistributor>();if(selector==null||selector.owner==null)throw new System.Exception("FAIR counter is not connected");
  Debug.Log("YOZORA_FAIR_ASSEMBLY_PASS: counted fifth arrival / horizontal Y rotor / six triggers / two wins. Runtime path not certified by this structural check.");
 }
 public static void Run(){
  EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");
  VerifyFairAssembly();
  var m=Object.FindFirstObjectByType<YozoraMachine>();Physics.gravity=new Vector3(0,-9.81f,0);Physics.defaultContactOffset=.0004f;
  var previous=Physics.simulationMode;Physics.simulationMode=SimulationMode.Script;
  foreach(float speed in new[]{3.6f,3.8f,5.5f,5.8f,6.0f,6.2f,6.5f,7.0f}){
   var g=Object.Instantiate(m.ballPrefab,m.launchPoint.position,Quaternion.identity);g.SetActive(true);var rb=g.GetComponent<Rigidbody>();rb.linearVelocity=new Vector3(0,speed,0);Physics.SyncTransforms();
   float maxY=0,maxX=-1,minX=1;int entered=0;string sample="";var hit=new System.Collections.Generic.HashSet<string>();int diagnostics=0;var sensors=Object.FindObjectsByType<PocketSensor>(FindObjectsSortMode.None);
   for(int i=0;i<960;i++){var velocity=rb.linearVelocity;if(speed==4.9f&&diagnostics<16&&velocity.magnitude>.3f&&Physics.SphereCast(rb.position,.0053f,velocity.normalized,out RaycastHit collision,velocity.magnitude/120+.001f,~(1<<8),QueryTriggerInteraction.Ignore)){Debug.Log($"CONTACT_PATH t={i/120f:F3} p={rb.position.ToString("F3")} v={velocity.ToString("F2")} collider={collision.collider.name}");diagnostics++;}Physics.Simulate(1f/120);var p=rb.position;maxY=Mathf.Max(maxY,p.y);maxX=Mathf.Max(maxX,p.x);minX=Mathf.Min(minX,p.x);if(p.y>.79f)entered++;foreach(var sensor in sensors){if(Vector3.Distance(sensor.GetComponent<Collider>().ClosestPoint(p),p)<.0055f)hit.Add(sensor.kind.ToString());}if(i%120==0)sample+=$" {i/120}:{p.x:F3},{p.y:F3},{p.z:F3}";}
   Debug.Log($"YOZORA_PHYSICS speed={speed} maxY={maxY:F3} maxX={maxX:F3} minX={minX:F3} upperFrames={entered} pockets={string.Join(",",hit)} samples:{sample}");Object.DestroyImmediate(g);
  }
  Physics.simulationMode=previous;Debug.Log("YOZORA_PHYSICS_AUDIT_FINISHED");
 }
}
