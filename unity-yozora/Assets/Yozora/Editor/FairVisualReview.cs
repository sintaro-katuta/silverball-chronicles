using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

// Offline review renders. Never changes the saved gameplay camera or lighting.
public static class FairVisualReview {
 static string Output => Path.GetFullPath(Path.Combine(Application.dataPath,"../../prototype/reference-review/yozora/user-video-r3-2026-09-26"));
 public static void CaptureBeforeAndAfter(){
  Directory.CreateDirectory(Output);
  EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");
  Capture("before");
  YozoraBuilder.CreateScene();
  YozoraValidation.Run();
  BonusStoryValidation.Run();
  YozoraPhysicsAudit.Run();
  CabinetPhysicsAudit.Run();
  Capture("after");
  Debug.Log("FAIR_REVIEW_CAPTURE_SUCCESS "+Output);
 }
 public static void BuildRouletteWeb(){
  CaptureRoulette();
  YozoraValidation.Run();
  BonusStoryValidation.Run();
  YozoraBuilder.BuildExistingWeb();
 }
 public static void CaptureRoulette(){
  YozoraBuilder.CreateScene();
  CabinetPhysicsAudit.Run();
  Capture("roulette");
  Debug.Log("FAIR_ROULETTE_CAPTURE_SUCCESS");
 }
 public static void CaptureCurrent(){
  EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");
  Capture("after");
 }
 static void Capture(string label){
  if(SystemInfo.graphicsDeviceType==UnityEngine.Rendering.GraphicsDeviceType.Null)throw new System.Exception("Review requires a graphics device; do not use -nographics.");
  var go=new GameObject("Temporary FAIR review camera");var camera=go.AddComponent<Camera>();
  camera.nearClipPlane=.002f;camera.farClipPlane=4;camera.clearFlags=CameraClearFlags.SolidColor;
  camera.backgroundColor=new Color(.018f,.023f,.035f);camera.allowHDR=true;camera.allowMSAA=true;
  // Fixed, reproducible estimated reference angle, not a calibrated real camera pose.
  var target=new Vector3(.005f,.299f,-.112f);
  camera.fieldOfView=32;camera.transform.position=target+new Vector3(.012f,.125f,-.255f);camera.transform.LookAt(target);
  Render(camera,Path.Combine(Output,"fair-"+label+"-oblique.png"));
  camera.transform.position=target+new Vector3(0,.065f,-.30f);camera.transform.LookAt(target);
  Render(camera,Path.Combine(Output,"fair-"+label+"-front.png"));
  Object.DestroyImmediate(go);
 }
 static void Render(Camera camera,string path){
  var rt=new RenderTexture(1600,1000,24,RenderTextureFormat.ARGB32){antiAliasing=4};rt.Create();
  var old=RenderTexture.active;camera.targetTexture=rt;camera.Render();RenderTexture.active=rt;
  var image=new Texture2D(rt.width,rt.height,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,rt.width,rt.height),0,0);image.Apply();File.WriteAllBytes(path,image.EncodeToPNG());
  camera.targetTexture=null;RenderTexture.active=old;rt.Release();Object.DestroyImmediate(rt);Object.DestroyImmediate(image);
 }
}
