namespace Yozora {
 // Original continuous seal-break drama. Timings are authored, not source-video measurements.
 public static class ReferenceSequenceTimeline {
  public const float NormalDuration=40f,RushDuration=18f,NormalResult=36.5f,RushResult=15.5f;
  public static float Duration(PlayMode mode)=>mode==PlayMode.Normal?NormalDuration:RushDuration;
  public static float Result(PlayMode mode)=>mode==PlayMode.Normal?NormalResult:RushResult;
  public static float Start(bool rush)=>rush?2.5f:4.5f;
  public static float SymbolReveal(PlayMode mode)=>Result(mode)+1.1f;
  public static float StopTime(Ticket ticket,PlayMode mode,int column)=>ticket.reach?(column==1?Result(mode):1.6f+column*.2f):ticket.duration-.6f+column*.2f;
  public static bool IsPushWindow(Ticket ticket,PlayMode mode)=>ticket!=null&&ticket.reach&&(mode==PlayMode.Normal?ticket.elapsed>=27&&ticket.elapsed<31:ticket.elapsed>=11&&ticket.elapsed<13);
  public static float SwordAmount(Ticket ticket,PlayMode mode){if(ticket==null||!ticket.reach)return 0;bool rush=mode!=PlayMode.Normal;float t=ticket.elapsed;float start=rush?13.5f:32;return t<start||t>Result(mode)+.45f?0:UnityEngine.Mathf.SmoothStep(0,1,UnityEngine.Mathf.Clamp01((t-start)/.32f));}
  static readonly float[] NormalCuts={4.5f,7,10,10.55f,14,17,21,27,31,32,35.7f,36.5f};
  static readonly float[] RushCuts={2.5f,3.5f,4.5f,4.82f,6.5f,7.5f,9,11,13,13.5f,15,15.5f};
  static readonly string[] Names={"sealed-road","seal-challenge","first-strike","blade-repelled","visible-fracture","renewed-resolve","gathering-light","final-push","held-breath","final-strike","contact-hold","seal-outcome"};
  public static int DirectorCut(float t,bool rush){var starts=rush?RushCuts:NormalCuts;int result=-1;for(int i=0;i<starts.Length&&t>=starts[i];i++)result=i;return result;}
  public static int Phase(float t,bool rush)=>DirectorCut(t,rush);
  public static float CutStart(int cut,bool rush){var starts=rush?RushCuts:NormalCuts;return cut<0?0:starts[UnityEngine.Mathf.Min(cut,starts.Length-1)];}
  public static string CutId(float t,bool rush){int cut=DirectorCut(t,rush);return cut<0?(rush?"rush-symbols":"normal-symbols"):Names[cut];}
  public static string SceneId(float t,bool rush)=>CutId(t,rush);
  public static bool IsDecisionHold(float t,bool rush){int cut=DirectorCut(t,rush);return cut==8||cut==10;}
 }
}
