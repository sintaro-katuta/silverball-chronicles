using UnityEngine;
namespace Yozora {
 public enum PocketKind { Plus, Right, Attacker, Out, Distributor, Fair }
 public class PocketSensor:MonoBehaviour {
  public PocketKind kind; public YozoraMachine owner; public bool winningSlot;
  void OnTriggerEnter(Collider other){Receive(other);}
  void OnTriggerStay(Collider other){if(kind==PocketKind.Fair)Receive(other);}
  void Receive(Collider other){var ball=other.GetComponent<BallBody>();if(ball==null||ball.consumed||owner==null)return;if(kind==PocketKind.Fair){var guided=ball.GetComponent<FairGuidedBall>();if(guided==null||!guided.AtRotor)return;}owner.Receive(this,ball);}
 }
}
