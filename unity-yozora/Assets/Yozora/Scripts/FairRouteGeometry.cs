using UnityEngine;
namespace Yozora {
 /// <summary>Shared reconstruction anchors: LCD top .837, bottom .357; R3 01:30
 /// yellow vertical receiver at about 60%, lower sideways outlet at about 75%.
 /// Estimated from video, not factory measurements. Two stages are physical locations,
 /// not a claim that the five-arrival count is represented by five visible lights.</summary>
 public static class FairRouteGeometry {
  public static readonly Vector3 Selector=new Vector3(-.190f,.549f,-.052f);
  public const float AdmissionWidth=.023f, InletHalfWidth=.018f;
  public const float RotorForward=-.040f, RotorLift=.070f, PlusLift=.070f, LowerWideNailLift=.045f;
  public static readonly Vector3 RotorCenter=new Vector3(.012f,.358f,-.152f);
  public static readonly Vector3 RotorEntry=new Vector3(-.018f,.368f,-.152f);
  public static readonly Vector3 LowerBranch=new Vector3(-.180f,.477f,-.093f);
  public static Vector3[] Route(Vector3 start,Vector3 entry)=>new[]{start,
   new Vector3(-.190f,Mathf.Min(start.y-.010f,.537f),-.067f),
   new Vector3(-.190f,.519f,-.088f),new Vector3(-.190f,.493f,-.091f),LowerBranch,
   new Vector3(-.168f,.461f,-.103f),new Vector3(-.144f,.432f,-.120f),
   new Vector3(-.102f,.407f,-.139f),new Vector3(-.055f,.389f,-.150f),entry};
 }
}
