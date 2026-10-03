using UnityEngine;
namespace Yozora {
 /// <summary>Constrained translation inside the enclosed resin chute. The same visible ball reaches a moving pocket sensor.</summary>
 [RequireComponent(typeof(Rigidbody),typeof(BallBody))]
 public sealed class FairGuidedBall : MonoBehaviour {
  public const float TravelSpeed=.17f, RotorWaitLimit=3f;
  public static Vector3[] Route(Vector3 start,Vector3 entry)=>FairRouteGeometry.Route(start,entry);
  public bool AtRotor { get; private set; }
  Rigidbody body;Vector3[] path;float distance;int section;float dwell;
  public void Begin(Vector3 entry){
   body=GetComponent<Rigidbody>();body.linearVelocity=Vector3.zero;body.angularVelocity=Vector3.zero;body.isKinematic=true;
   // Dedicated guide collision layer prevents the board glass/OUT from consuming a ball in front of the board.
   gameObject.layer=11;
   distance=0;section=0;dwell=0;AtRotor=false;path=Route(body.position,entry);
  }
  void FixedUpdate(){
   if(path==null)return;
   if(AtRotor){dwell+=Time.fixedDeltaTime;if(dwell>RotorWaitLimit)GetComponent<BallBody>().Collect(false);return;}
   distance+=Time.fixedDeltaTime*TravelSpeed;
   float length=Vector3.Distance(path[section],path[section+1]);
   while(distance>=length){distance-=length;section++;if(section==path.Length-1){AtRotor=true;body.MovePosition(path[path.Length-1]);return;}length=Vector3.Distance(path[section],path[section+1]);}
   body.MovePosition(Vector3.Lerp(path[section],path[section+1],distance/Mathf.Max(.00001f,length)));
  }
 }
}
