using System.IO;
using UnityEngine;
using UnityEditor;
using Yozora;
public static class StructureReview {
 static string Output=>Path.GetFullPath(Path.Combine(Application.dataPath,"../../prototype/reference-review/yozora/structure-review-2026-09-26"));
 public static void BuildAndCapture(){YozoraBuilder.CreateScene();YozoraValidation.Run();CabinetPhysicsAudit.Run();Capture();}
 public static void BuildVerifiedWeb(){UnityEditor.SceneManagement.EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");CabinetPhysicsAudit.Run();YozoraBuilder.BuildExistingWeb();}
 public static void ValidateLauncher(){UnityEditor.SceneManagement.EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");LauncherFlowValidation.Run();}
 public static void ValidateFlows(){UnityEditor.SceneManagement.EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");LeftFlowValidation.Run();RightFlowValidation.Run();LauncherFlowValidation.Run();}
 public static void Capture(){
  Directory.CreateDirectory(Output);var m=Object.FindFirstObjectByType<YozoraMachine>();var view=m.GetComponent<CabinetStructureView>();view.SetStructureOnly(true);
  var go=new GameObject("Structure review camera");var c=go.AddComponent<Camera>();c.nearClipPlane=.008f;c.farClipPlane=8;c.fieldOfView=38;c.backgroundColor=new Color(.015f,.02f,.03f);c.clearFlags=CameraClearFlags.SolidColor;c.allowMSAA=true;
  Shot(c,"structure-front",new Vector3(0,.59f,-1.72f),new Vector3(0,.565f,0),1100,1500);
  Shot(c,"structure-left",new Vector3(-.145f,.57f,-1.0f),new Vector3(-.145f,.55f,-.05f),800,1400);
  Shot(c,"structure-right-closed",new Vector3(.18f,.57f,-1.0f),new Vector3(.18f,.54f,-.05f),800,1400);
  var q=m.door.localRotation;m.door.localRotation=Quaternion.Euler(80,0,0);m.GetComponentInChildren<RightMechanismDrive>()?.ApplyOpening(1);Physics.SyncTransforms();Shot(c,"structure-right-open",new Vector3(.18f,.57f,-1.0f),new Vector3(.18f,.54f,-.05f),800,1400);m.door.localRotation=q;m.GetComponentInChildren<RightMechanismDrive>()?.ApplyOpening(0);
  view.SetStructureOnly(false);Shot(c,"assembled-front",new Vector3(0,.59f,-1.72f),new Vector3(0,.565f,0),1100,1500);view.SetStructureOnly(true);Object.DestroyImmediate(go);
  Debug.Log("STRUCTURE_REVIEW_CAPTURED "+Output);
 }
 static void Shot(Camera c,string name,Vector3 pos,Vector3 target,int w,int h){c.transform.position=pos;c.transform.LookAt(target);c.aspect=w/(float)h;var rt=new RenderTexture(w,h,24){antiAliasing=4};rt.Create();c.targetTexture=rt;c.Render();var old=RenderTexture.active;RenderTexture.active=rt;var tex=new Texture2D(w,h,TextureFormat.RGB24,false);tex.ReadPixels(new Rect(0,0,w,h),0,0);tex.Apply();File.WriteAllBytes(Path.Combine(Output,name+".png"),tex.EncodeToPNG());RenderTexture.active=old;c.targetTexture=null;rt.Release();Object.DestroyImmediate(rt);Object.DestroyImmediate(tex);}
}
