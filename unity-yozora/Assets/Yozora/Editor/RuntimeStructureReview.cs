using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
[InitializeOnLoad]
public static class RuntimeStructureReview {
 const string Key="Yozora.StructureRuntimeReview";
 static RuntimeStructureReview(){EditorApplication.playModeStateChanged+=state=>{if(state==PlayModeStateChange.EnteredPlayMode&&SessionState.GetBool(Key,false)){SessionState.SetBool(Key,false);new GameObject("Structure runtime evidence probe").AddComponent<RuntimeStructureProbe>();}};}
 public static void Run(){EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");SessionState.SetBool(Key,true);EditorApplication.EnterPlaymode();}
}
