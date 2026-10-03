using System;
namespace Yozora {
 public enum BonusStoryRoute { LastFloor, DecisionBlade, Drive, Ordinary }
 public readonly struct BonusStoryFrame {
  public readonly string SceneId;public readonly int Portrait,Step,Amount;public readonly bool Push,RevealDestination;public readonly float ShotTime;
  public BonusStoryFrame(string id,int portrait,int step,int amount,bool push,bool destination,float shotTime){SceneId=id;Portrait=portrait;Step=step;Amount=amount;Push=push;RevealDestination=destination;ShotTime=shotTime;}
 }
 public static class BonusStoryTimeline {
  // Representative timings over substitute art. R2 is edited, so these are not
  // measured machine durations. Rules owns the clock and final mode transition.
  public static BonusStoryRoute Route(PlayMode source,bool drive,string title)=>drive?BonusStoryRoute.Drive:title=="LAST FLOOR BONUS"?BonusStoryRoute.LastFloor:title=="決意の刃"?BonusStoryRoute.DecisionBlade:BonusStoryRoute.Ordinary;
  public static BonusStoryFrame Story(BonusStoryRoute route,float elapsed,float duration,int paid){
   float t=Math.Max(0,elapsed),part=Math.Max(.001f,duration/4);int step=Math.Min(3,(int)(t/part));float shot=t-step*part;
   if(route==BonusStoryRoute.LastFloor){string[] ids={"passage-approach","passage-light","passage-charge","passage-push"};bool push=t>=Math.Max(0,duration-3);return new BonusStoryFrame(push?"passage-push":step==3?"passage-prepush":ids[step],3,step,0,push,false,push?t-Math.Max(0,duration-3):shot);}
   if(route==BonusStoryRoute.DecisionBlade){bool push=t>=Math.Max(0,duration-3);return new BonusStoryFrame(push?"passage-push":"passage-charge",3,step,0,push,false,push?t-Math.Max(0,duration-3):shot);}
   if(route==BonusStoryRoute.Drive){int units=Math.Max(1,(int)Math.Ceiling(Math.Max(0,paid)/1500.0));int revealed=step==0?0:Math.Min(Math.Max(0,paid),Math.Max(1,(int)Math.Ceiling(units*step/3.0))*1500);int first=step;while(first>1&&Math.Min(Math.Max(0,paid),Math.Max(1,(int)Math.Ceiling(units*(first-1)/3.0))*1500)==revealed)first--;return new BonusStoryFrame(step==0?"drive-introduction":"drive-number-rise",0,step,revealed,false,false,t-first*part);}
   return new BonusStoryFrame("bonus-resolution",3,step,0,false,false,shot);
  }
  public static BonusStoryFrame Result(BonusStoryRoute route,float elapsed,int paid)=>new BonusStoryFrame(route==BonusStoryRoute.Drive?"drive-total":route==BonusStoryRoute.LastFloor?"last-floor-result":"decision-result",route==BonusStoryRoute.Drive?0:3,4,Math.Max(0,paid),false,true,Math.Max(0,elapsed));
  public static BonusStoryFrame Entrance(float elapsed,int paid)=>new BonusStoryFrame("bonus-mode-entrance",3,5,Math.Max(0,paid),false,true,Math.Max(0,elapsed));
 }
}
