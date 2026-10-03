using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
[InitializeOnLoad]
public static class PresentationReview {
 const string Key="Yozora.PresentationReview";
 static PresentationReview(){EditorApplication.playModeStateChanged+=s=>{if(s==PlayModeStateChange.EnteredPlayMode&&SessionState.GetBool(Key,false)){SessionState.SetBool(Key,false);if(SessionState.GetBool("Yozora.TargetedPresentation",false)){SessionState.SetBool("Yozora.TargetedPresentation",false);if(SessionState.GetBool("Yozora.DecisionOnly",false)){SessionState.SetBool("Yozora.DecisionOnly",false);new GameObject("Decision evidence").AddComponent<DecisionReviewProbe>();}else new GameObject("Bonus presentation evidence").AddComponent<BonusPresentationReviewProbe>();}else new GameObject("Presentation evidence").AddComponent<PresentationReviewProbe>();}};}
 public static void Run(){YozoraBuilder.CreateScene();YozoraValidation.Run();CabinetPhysicsAudit.Run();SessionState.SetBool(Key,true);EditorApplication.EnterPlaymode();}
 public static void CaptureExisting(){EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");SessionState.SetBool(Key,true);EditorApplication.EnterPlaymode();}
 public static void CaptureBonus(){SessionState.SetBool("Yozora.TargetedPresentation",true);CaptureExisting();}
 public static void CaptureDecision(){SessionState.SetBool("Yozora.DecisionOnly",true);CaptureBonus();}
 public static void ValidatePush(){var go=new GameObject("Bonus PUSH validation");try{var m=go.AddComponent<Yozora.YozoraMachine>();m.Command("demo-bonus");for(int i=0;i<20;i++)m.Rules.CountBonus();var state=m.Rules.BonusPresentation;m.Rules.Tick(state.PhaseDuration-1);float time=state.TotalElapsed;int paid=m.Rules.Payout;m.Command("push");if(m.PushFeedback!=1||m.Rules.Payout!=paid||state.TotalElapsed!=time)throw new System.Exception("Bonus PUSH changed outcome or failed response");m.Command("reset");if(m.PushFeedback!=0)throw new System.Exception("Reset retained PUSH reaction");Debug.Log("BONUS_PUSH_PASS response / immutable outcome / reset");}finally{Object.DestroyImmediate(go);}}
 public static void BuildWeb(){ValidatePush();EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");YozoraBuilder.BuildExistingWeb();}
}
