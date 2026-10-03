using System;
using UnityEngine;
using UnityEditor;
using Yozora;

// Structural checks of the generated scene, not a calibration of a real machine's admission rate.
public static class CabinetPhysicsAudit {
 static void Check(bool condition,string message){if(!condition)throw new InvalidOperationException("Cabinet/FAIR audit: "+message);}
 [MenuItem("Yozora/Audit cabinet and FAIR structure")]
 public static void Run(){
  var machine=UnityEngine.Object.FindFirstObjectByType<YozoraMachine>();Check(machine!=null,"machine is required");
  var selector=UnityEngine.Object.FindFirstObjectByType<FairDistributor>();Check(selector!=null&&selector.owner==machine,"selector owner");
  var detection=selector.GetComponent<BoxCollider>();Check(detection!=null&&detection.isTrigger,"selector must be a trigger");
  var drive=UnityEngine.Object.FindFirstObjectByType<RotorDrive>();Check(drive!=null,"rotor drive");
  Check(Vector3.Dot(drive.localAxis.normalized,Vector3.up)>.999f,"horizontal Y-axis rotor");
  Check(drive.GetComponent<Rigidbody>().isKinematic,"rotor kinematic contact motion");
  var sensors=drive.GetComponentsInChildren<PocketSensor>();int fair=0,winning=0;float radius=0;
  foreach(var sensor in sensors){if(sensor.kind!=PocketKind.Fair)continue;fair++;if(sensor.winningSlot)winning++;Check(sensor.owner==machine,"pocket owner");Check(sensor.gameObject.layer==11,"dedicated guide layer");var sphere=sensor.GetComponent<SphereCollider>();Check(sphere!=null&&sphere.isTrigger,"moving pocket trigger");radius=sphere.radius;
   Vector3 p=drive.transform.InverseTransformPoint(sensor.transform.position);Check(Mathf.Abs(new Vector2(p.x,p.z).magnitude-.03f)<.0001f,"pocket radial position");}
  Check(fair==6&&winning==2,"six pockets, two designated winning pockets");
  float ballRadius=.0055f;Vector3 entry=drive.transform.InverseTransformPoint(selector.rotorEntry);
  float radialError=Mathf.Abs(new Vector2(entry.x,entry.z).magnitude-.03f),heightError=Mathf.Abs(entry.y-.005f);
  Check(Mathf.Sqrt(radialError*radialError+heightError*heightError)<radius+ballRadius,"guide endpoint must intersect the moving pocket orbit");
  Check(Mathf.Abs(drive.degreesPerSecond)>0&&60/Mathf.Abs(drive.degreesPerSecond)<FairGuidedBall.RotorWaitLimit,"timeout permits at least one pocket passage");
  var path=FairGuidedBall.Route(selector.transform.position,selector.rotorEntry);float travel=0;
  for(int i=1;i<path.Length;i++){float length=Vector3.Distance(path[i-1],path[i]);Check(!float.IsNaN(length)&&!float.IsInfinity(length)&&length>.00001f,"finite, nonzero guide segments");Check(path[i].y<=path[i-1].y,"descending guide route");travel+=length;}
  Check(travel/FairGuidedBall.TravelSpeed+FairGuidedBall.RotorWaitLimit<20,"guide lifecycle fits ball timeout");
  for(int i=0;i<32;i++)Check(Physics.GetIgnoreLayerCollision(11,i)==(i!=11),"guide layer isolation "+i);
  var shoulder=GameObject.Find("A Continuous case shoulder and upper reservoir");var opening=GameObject.Find("B Integrated rounded opening lip");
  foreach(var part in new[]{shoulder,opening}){Check(part!=null,"FAIR upper case part exists");var renderer=part.GetComponent<Renderer>();Check(renderer.bounds.max.z<-.095f,"FAIR case must remain in front of LCD display plane with clearance");Check(renderer.sortingOrder>2,"front resin must composite after the world-space LCD canvas");}
  var decorative=GameObject.Find("Reference cabinet · sculpted decorative assembly");Check(decorative!=null&&decorative.GetComponentsInChildren<Collider>().Length==0,"decorative cabinet has no gameplay colliders");
  foreach(var renderer in decorative.GetComponentsInChildren<MeshRenderer>()){var filter=renderer.GetComponent<MeshFilter>();Check(filter!=null&&filter.sharedMesh!=null&&filter.sharedMesh.vertexCount>0,"saved decorative mesh");}
  Debug.Log("YOZORA_CABINET_PHYSICS_STRUCTURE_PASSED: decorative isolation / six-pocket orbit / guide lifecycle; not real-machine calibration");
 }
}
