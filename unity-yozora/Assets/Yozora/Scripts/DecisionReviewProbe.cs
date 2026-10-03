#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using Yozora;
public class DecisionReviewProbe:MonoBehaviour {
 YozoraMachine m;ReferencePresentation p;string output;List<string> log=new List<string>();int failures;RenderTexture rt;Texture2D tex;
 IEnumerator Start(){
  output=Path.GetFullPath(Path.Combine(Application.dataPath,"../../prototype/reference-review/yozora/presentation-review-2026-09-27/round4"));Directory.CreateDirectory(output);m=Object.FindFirstObjectByType<YozoraMachine>();p=m.GetComponent<ReferencePresentation>();rt=new RenderTexture(540,820,24);rt.Create();tex=new Texture2D(540,820,TextureFormat.RGB24,false);
  yield return null;m.Command("view:lcd");QualitySettings.vSyncCount=0;Application.targetFrameRate=-1;Time.captureDeltaTime=1f/15;Time.maximumDeltaTime=.1f;int frame=0;string last="";
  m.Command("demo-decision");if(m.AutoFire)m.Command("fire");Directory.CreateDirectory(Path.Combine(output,"decision-frames"));int decisionFrame=0;for(int i=0;i<100;i++){m.Rules.CountBonus();for(int j=0;j<3;j++){yield return null;Capture("decision-frames/"+(decisionFrame++).ToString("D5"));}if(i%25==0)Capture("decision-step-"+i);}int decisionGuard=0;while(m.Rules.IsBonusPresentationPending&&decisionGuard++<1200){yield return null;Capture("decision-frames/"+(decisionFrame++).ToString("D5"));}Check(m.Rules.BonusPaid==1500&&m.Rules.Mode==Yozora.PlayMode.SwordRush,"decision route counted 1500 and returned to RUSH");
  m.Command("reset");yield return null;Check(m.Rules.Active==null&&m.Rules.Payout==0&&p.SceneId=="normal-symbols","reset clears result and sequence overlays");Capture("reset");m.Command("view:front");yield return null;Capture("full-cabinet");
  File.WriteAllLines(Path.Combine(output,"runtime-results.txt"),log);Debug.Log("PRESENTATION_RUNTIME_"+(failures==0?"PASS":"FAIL"));EditorApplication.Exit(failures==0?0:1);
 }
 void Check(bool ok,string name){log.Add((ok?"PASS ":"FAIL ")+name);if(!ok)failures++;Debug.Log(log[log.Count-1]);}
 void Capture(string name){Canvas.ForceUpdateCanvases();var c=m.viewCamera;float aspect=c.aspect;c.aspect=540f/820;c.targetTexture=rt;c.Render();var old=RenderTexture.active;RenderTexture.active=rt;tex.ReadPixels(new Rect(0,0,540,820),0,0);tex.Apply();File.WriteAllBytes(Path.Combine(output,name+".png"),tex.EncodeToPNG());RenderTexture.active=old;c.targetTexture=null;c.aspect=aspect;}
}
#endif
