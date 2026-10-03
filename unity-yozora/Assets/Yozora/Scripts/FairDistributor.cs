using UnityEngine;
namespace Yozora {
 /// <summary>Counts physical downward arrivals. Narrow enclosed transfer is a constrained guide, not free-body physics.</summary>
 public sealed class FairDistributor : MonoBehaviour {
  public YozoraMachine owner;
  public Transform blade;
  public Vector3 rotorEntry = new Vector3(-.018f,.298f,-.112f);
  public int SelectedCount => owner == null ? 0 : owner.DistributorCount / 5;
  int lastCount;
  void Awake(){for(int i=0;i<32;i++)Physics.IgnoreLayerCollision(11,i,i!=11);}
  public static bool IsSelected(int arrivalNumber) => arrivalNumber > 0 && arrivalNumber % 5 == 0;
  void FixedUpdate(){
   if(owner == null)return;
   
   lastCount=owner.DistributorCount;
   if(blade)blade.localRotation=Quaternion.Euler(0,0,owner.DistributorCount%5==0?-28:25);
  }
  void OnTriggerEnter(Collider other){Admit(other.GetComponent<BallBody>());}
  public bool Admit(BallBody ball){
   if(owner==null||owner.Paused||ball==null||ball.consumed||ball.distributed)return false;
   var body=ball.GetComponent<Rigidbody>();
   // Ascending launcher balls and right play never enter the left selector.
   if(body.linearVelocity.y>=0||owner.Rules==null||owner.Rules.Mode!=PlayMode.Normal||owner.Rules.Bonus!=null)return false;
   ball.distributed=true;owner.DistributorCount++;lastCount=owner.DistributorCount;
   if(!IsSelected(lastCount))return false;
   var travel=ball.gameObject.AddComponent<FairGuidedBall>();travel.Begin(rotorEntry);
   return true;
  }
 }
}
