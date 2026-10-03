using System.Collections.Generic;
using UnityEngine;
using Yozora;
public static class CabinetStructureBuilder {
 public static void Build(Transform cabinet,YozoraMachine machine){
  var roots=new HashSet<Transform>();
  foreach(var t in cabinet.GetComponentsInChildren<Transform>(true))if(t.name=="Reference cabinet · sculpted decorative assembly"||t.name=="Blender embossed cabinet emblems"||t.name=="Generated cabinet illustration inlays"||t.name=="Reference hardware labels"||t.name=="Inset dark bezel"||t.name=="Field midnight"||t.name=="Playfield back"||t==machine.swordBlue||t==machine.swordGold)roots.Add(t);
  var renderers=new List<Renderer>();var canvases=new List<Canvas>();
  foreach(var r in cabinet.GetComponentsInChildren<Renderer>(true)){for(var t=r.transform;t!=null;t=t.parent)if(roots.Contains(t)){renderers.Add(r);break;}}
  foreach(var c in cabinet.GetComponentsInChildren<Canvas>(true)){for(var t=c.transform;t!=null;t=t.parent)if(roots.Contains(t)){canvases.Add(c);break;}}
  var view=machine.gameObject.AddComponent<CabinetStructureView>();view.decoration=renderers.ToArray();view.labels=canvases.ToArray();view.structureOnly=true;
 }
}
