using UnityEngine;
namespace Yozora {
 [RequireComponent(typeof(Rigidbody))]
 public class RotorDrive:MonoBehaviour {
  public float degreesPerSecond=32;
  public Vector3 localAxis=Vector3.up;
  float angle;Rigidbody body;Quaternion initial;
  void Awake(){body=GetComponent<Rigidbody>();initial=body.rotation;}
  void FixedUpdate(){angle=Mathf.Repeat(angle+degreesPerSecond*Time.fixedDeltaTime,360);body.MoveRotation(initial*Quaternion.AngleAxis(angle,localAxis));}
 }
}
