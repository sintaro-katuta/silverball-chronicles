using UnityEngine;
namespace Yozora {
 // Consumes the existing round-gate angle without altering bonus/count/lottery rules.
 [DefaultExecutionOrder(100)]
 public sealed class RightMechanismDrive:MonoBehaviour {
  public Transform angleInput,slidingGate;public Vector3 closedPosition,travel;
  public void ApplyOpening(float opening){if(slidingGate)slidingGate.localPosition=closedPosition+travel*Mathf.Clamp01(opening);}
  public void ApplyPose(){if(angleInput)ApplyOpening(Mathf.DeltaAngle(0,angleInput.localEulerAngles.x)/78f);}
  void FixedUpdate(){ApplyPose();}
  void LateUpdate(){ApplyPose();}
 }
}
