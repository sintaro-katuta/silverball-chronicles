using UnityEngine;
namespace Yozora {
 [RequireComponent(typeof(Rigidbody),typeof(SphereCollider))]
 public class BallBody : MonoBehaviour {
  public YozoraMachine owner;
  public bool consumed, distributed;
  float born;
  public int contacts;
  void OnEnable(){born=Time.time;}
  void OnCollisionEnter(Collision c){contacts++;if(owner)owner.Contact(c.relativeVelocity.magnitude);}
  void FixedUpdate(){if(!consumed&&(transform.position.y<.17f||Time.time-born>20f))Collect(false);}
  public void Collect(bool scored){if(consumed)return;consumed=true;if(owner)owner.RemoveBall(this,scored);Destroy(gameObject);}
 }
}
