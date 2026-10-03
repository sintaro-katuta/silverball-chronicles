using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
[InitializeOnLoad]
public static class NarrativeReview {
 const string Key="Yozora.NarrativeReview";
 static NarrativeReview(){EditorApplication.playModeStateChanged+=s=>{if(s==PlayModeStateChange.EnteredPlayMode&&SessionState.GetBool(Key,false)){SessionState.SetBool(Key,false);if(SessionState.GetBool("Yozora.NarrativeBonus",false)){SessionState.SetBool("Yozora.NarrativeBonus",false);new GameObject("Original bonus evidence").AddComponent<NarrativeBonusReviewProbe>();}else new GameObject("Original narrative evidence").AddComponent<NarrativeReviewProbe>();}};}
 public static void CaptureBonus(){EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");PresentationReview.ValidatePush();SessionState.SetBool("Yozora.NarrativeBonus",true);SessionState.SetBool(Key,true);EditorApplication.EnterPlaymode();}
 public static void Run(){var texture=(TextureImporter)AssetImporter.GetAtPath("Assets/Yozora/Resources/yozora-sword-poses.png");texture.alphaIsTransparency=true;texture.mipmapEnabled=false;texture.maxTextureSize=2048;texture.textureCompression=TextureImporterCompression.Uncompressed;texture.SaveAndReimport();EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");YozoraValidation.Run();BonusStoryValidation.Run();PresentationReview.ValidatePush();SessionState.SetBool(Key,true);EditorApplication.EnterPlaymode();}
}
