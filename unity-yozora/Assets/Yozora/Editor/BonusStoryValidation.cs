using System;
using UnityEngine;
using Yozora;
using PlayMode=Yozora.PlayMode;
public static class BonusStoryValidation {
 static void Check(bool ok,string name){if(!ok)throw new Exception("BONUS STORY: "+name);}
 public static void Run(){
  Check(BonusStoryTimeline.Route(PlayMode.SwordRush,false,"BONUS")==BonusStoryRoute.Ordinary,"ordinary SWORD RUSH payout must not impersonate Decision Blade");
  Check(BonusStoryTimeline.Route(PlayMode.Normal,false,"LAST FLOOR BONUS")==BonusStoryRoute.LastFloor,"LAST FLOOR route");
  Check(BonusStoryTimeline.Route(PlayMode.SwordRush,false,"決意の刃")==BonusStoryRoute.DecisionBlade,"Decision Blade route");
  Check(BonusStoryTimeline.Route(PlayMode.WarOfUnderworld,true,"SWORD DRIVE")==BonusStoryRoute.Drive,"DRIVE route");
  int[] portraits={3,3,3,3};for(int cut=0;cut<4;cut++){var frame=BonusStoryTimeline.Story(BonusStoryRoute.DecisionBlade,cut*3+.01f,12,1500);Check(frame.Portrait==portraits[cut],"same protagonist throughout the passage");Check(!frame.RevealDestination,"story phase cannot disclose destination");Check(frame.Push==(cut==3),"Decision PUSH only final three seconds");}
  Check(!BonusStoryTimeline.Story(BonusStoryRoute.LastFloor,16.99f,20,300).Push&&BonusStoryTimeline.Story(BonusStoryRoute.LastFloor,17,20,300).Push,"LAST FLOOR push follows rules availability");
  foreach(int paid in new[]{0,300,1500,3000,4500,9000,16500}){int last=0;for(int step=0;step<=600;step++){var f=BonusStoryTimeline.Story(BonusStoryRoute.Drive,step/100f,6,paid);Check(f.Amount>=last&&f.Amount<=paid,"drive displayed actual payout monotonically, never future/fictional pt");Check(!f.RevealDestination,"drive story cannot disclose destination");last=f.Amount;}Check(last==paid,"drive reveal reaches actual payout");Check(BonusStoryTimeline.Result(BonusStoryRoute.Drive,0,paid).Amount==paid,"Total equals actual payout");}
  Debug.Log("PASS: BONUS story route, character order, PUSH bounds, no early destination and bounded actual-payout number reveals");
 }
}
