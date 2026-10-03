using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
public static class CabinetMaximumReview {
 static string Output=>Path.GetFullPath(Path.Combine(Application.dataPath,"../../prototype/reference-review/yozora/maximum-model-2026-09-26"));
 public static void CaptureBefore(){EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");Capture("before");}
 public static void BuildAndCapture(){YozoraBuilder.CreateScene();YozoraValidation.Run();BonusStoryValidation.Run();CabinetPhysicsAudit.Run();Capture("after");}
 public static void BuildWeb(){BuildAndCapture();YozoraBuilder.BuildExistingWeb();}
 static void Capture(string label){
  Directory.CreateDirectory(Output);if(SystemInfo.graphicsDeviceType==UnityEngine.Rendering.GraphicsDeviceType.Null)throw new System.Exception("Need graphics for model review");
  var go=new GameObject("Temporary full model review camera");var camera=go.AddComponent<Camera>();camera.nearClipPlane=.008f;camera.farClipPlane=8;camera.fieldOfView=38;camera.backgroundColor=new Color(.009f,.012f,.018f);camera.clearFlags=CameraClearFlags.SolidColor;camera.allowHDR=true;camera.allowMSAA=true;
  camera.transform.position=new Vector3(0,.59f,-1.72f);camera.transform.LookAt(new Vector3(0,.565f,0));Render(camera,label+"-front",1100,1500);
  camera.transform.position=new Vector3(.8f,.82f,-1.7f);camera.transform.LookAt(new Vector3(0,.57f,0));Render(camera,label+"-oblique",1100,1500);
  camera.fieldOfView=32;camera.transform.position=new Vector3(.017f,.424f,-.367f);camera.transform.LookAt(new Vector3(.005f,.299f,-.112f));Render(camera,label+"-fair",1600,1000);
  camera.transform.position=new Vector3(.21f,.42f,-.82f);camera.transform.LookAt(new Vector3(0,.17f,-.12f));Render(camera,label+"-controls",1600,1000);
  Object.DestroyImmediate(go);Debug.Log("CABINET_MAXIMUM_CAPTURE_"+label.ToUpper());
 }
 static void Render(Camera camera,string name,int width,int height){var rt=new RenderTexture(width,height,24,RenderTextureFormat.ARGB32){antiAliasing=4};rt.Create();camera.targetTexture=rt;camera.aspect=width/(float)height;camera.Render();var previous=RenderTexture.active;RenderTexture.active=rt;var tex=new Texture2D(width,height,TextureFormat.RGB24,false);tex.ReadPixels(new Rect(0,0,width,height),0,0);tex.Apply();File.WriteAllBytes(Path.Combine(Output,name+".png"),tex.EncodeToPNG());RenderTexture.active=previous;camera.targetTexture=null;rt.Release();Object.DestroyImmediate(rt);Object.DestroyImmediate(tex);}
}
