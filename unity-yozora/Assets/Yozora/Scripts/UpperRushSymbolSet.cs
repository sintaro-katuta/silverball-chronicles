using System;
using UnityEngine;
namespace Yozora {
 // Inspector-owned assets: unknown AWAKENING portraits are never silently mapped to the knight atlas.
 [Serializable] public sealed class UpperRushSymbolAsset {
  [Range(0,8)] public int digit;public Texture2D texture;public Rect uv=new Rect(0,0,1,1);
  [TextArea] public string evidence;
 }
 [Serializable] public sealed class UpperRushSymbolSet {
  public UpperRushSymbolAsset[] symbols=new UpperRushSymbolAsset[0];
  public bool TryGet(int digit,out Texture2D texture,out Rect uv){
   if(symbols!=null)foreach(var asset in symbols)if(asset!=null&&asset.digit==digit&&asset.texture){texture=asset.texture;uv=asset.uv;return true;}
   texture=null;uv=new Rect(0,0,1,1);return false;
  }
 }
}
