using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;
using Yozora;
public static class RightFlowValidation {
 [Serializable] class Trace {public string state;public float startX;public bool attacker,right,escaped,stuck;public List<Vector3> points=new List<Vector3>();}
 [Serializable] class Report {public List<Trace> traces=new List<Trace>();}
 static bool Finite(Vector3 p)=>!float.IsNaN(p.x)&&!float.IsNaN(p.y)&&!float.IsNaN(p.z)&&!float.IsInfinity(p.x)&&!float.IsInfinity(p.y)&&!float.IsInfinity(p.z);
 public static void Run(){
  UnityEditor.SceneManagement.EditorSceneManager.OpenScene("Assets/Yozora/Scenes/Yozora.unity");
  var m=UnityEngine.Object.FindFirstObjectByType<YozoraMachine>();var drive=m.GetComponent<RightMechanismDrive>();var sensors=m.GetComponentsInChildren<PocketSensor>();var previous=Physics.simulationMode;var previousGravity=Physics.gravity;var previousGate=drive.slidingGate.localPosition;var report=new Report();int openHits=0,closedLeaks=0,stalls=0,invalid=0;Physics.simulationMode=SimulationMode.Script;Physics.gravity=new Vector3(0,-9.81f,0);
  try{foreach(bool open in new[]{false,true})foreach(float x in new[]{.190f,.205f,.220f,.225f}){
   drive.ApplyOpening(open?1:0);var g=UnityEngine.Object.Instantiate(m.ballPrefab,new Vector3(x,.819f,-.052f),Quaternion.identity);g.SetActive(true);UnityEngine.Object.DestroyImmediate(g.GetComponent<BallBody>());var rb=g.GetComponent<Rigidbody>();rb.linearVelocity=new Vector3(0,-.2f,0);var trace=new Trace{state=open?"open":"closed",startX=x};Physics.SyncTransforms();
   for(int i=0;i<2400;i++){Physics.Simulate(1f/120);var p=rb.position;if(i%12==0)trace.points.Add(p);foreach(var s in sensors){if(s.kind!=PocketKind.Attacker&&s.kind!=PocketKind.Right)continue;var c=s.GetComponent<Collider>();if(c&&c.enabled&&c.gameObject.activeInHierarchy&&Vector3.Distance(c.ClosestPoint(p),p)<.0054f){if(s.kind==PocketKind.Attacker)trace.attacker=true;else trace.right=true;}}
    if(trace.attacker||trace.right||p.y<.17f||Mathf.Abs(p.x)>.27f||Mathf.Abs(p.z+.052f)>.012f||!Finite(p)){trace.escaped=p.y<.17f||Mathf.Abs(p.x)>.27f||Mathf.Abs(p.z+.052f)>.012f||!Finite(p);break;}
    if(i==2399){trace.stuck=true;stalls++;}
   }
   if(trace.escaped||(!trace.attacker&&!trace.right))invalid++;if(open&&trace.attacker)openHits++;if(!open&&trace.attacker)closedLeaks++;report.traces.Add(trace);Debug.Log($"RIGHT_FLOW {trace.state} x={x:F3} attacker={trace.attacker} right={trace.right} escaped={trace.escaped} stuck={trace.stuck} last={rb.position}");UnityEngine.Object.DestroyImmediate(g);
  }}finally{drive.slidingGate.localPosition=previousGate;Physics.gravity=previousGravity;Physics.simulationMode=previous;Physics.SyncTransforms();}
  var path=Path.GetFullPath(Path.Combine(Application.dataPath,"../../prototype/reference-review/yozora/structure-review-2026-09-26/right-flow.json"));File.WriteAllText(path,JsonUtility.ToJson(report,true));
  if(openHits==0||closedLeaks!=0||stalls!=0||invalid!=0)throw new Exception($"RIGHT_FLOW_FAIL openHits={openHits} closedLeaks={closedLeaks} stalls={stalls} invalid={invalid}");Debug.Log("RIGHT_FLOW_PASS: right-lane injection, closed blocks and open accepts; does not certify real-machine port identity or admission rate");
 }
}
