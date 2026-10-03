using System;
using UnityEngine;
using Yozora;
using PlayMode=Yozora.PlayMode;
public static class BonusPresentationValidation {
 static void Require(bool condition,string message){if(!condition)throw new Exception("BONUS PRESENTATION: "+message);}
 public static void Run(){
  foreach(PlayMode source in Enum.GetValues(typeof(PlayMode)))foreach(PlayMode destination in Enum.GetValues(typeof(PlayMode)))VerifyRoute(source,destination);
  VerifyMachineReset();VerifyClockRate();VerifyUpperResult();
  Debug.Log("YOZORA_BONUS_PRESENTATION_PASS: all destinations / pay once / frozen ST and holds / single release / pause and reset / clock rate / upper session result");
 }
 static YozoraRules Create(PlayMode source,PlayMode destination){
  var r=new YozoraRules(191);if(source!=PlayMode.Normal)r.SetDemo(source==PlayMode.SwordRush?"rush":"wou");r.Enter(source!=PlayMode.Normal,true);
  r.Holds.Peek().award=new Award{rounds=2,next=destination,title="LAST FLOOR BONUS"};r.Enter(source!=PlayMode.Normal,false);r.Tick(10000);return r;
 }
 static void VerifyRoute(PlayMode source,PlayMode destination){
  var r=Create(source,destination);int released=0,modes=0,paid=0;r.Event+=e=>{if(e=="bonus-presentation-complete")released++;if(e=="mode")modes++;if(e=="bonus-paid")paid++;};
  int remaining=r.Remaining,holds=r.Holds.Count,starts=r.Starts;
  for(int i=0;i<19;i++)Require(r.CountBonus(),"early payout count");Require(r.Bonus!=null&&!r.IsBonusPresentationPending,"wait started before final count");
  Require(r.CountBonus()&&r.Bonus==null&&r.IsBonusPresentationPending&&paid==1,"final count creates exactly one wait");
  int payout=r.Payout;Require(!r.CountBonus()&&r.Payout==payout,"double payout after last ball");
  var state=r.BonusPresentation;Require(state.Paid==300&&state.CompletedAward.next==destination&&state.SourceMode==source,"completed immutable snapshot values");
  r.Tick(1);Require(r.Mode==source&&r.Remaining==remaining&&r.Starts==starts&&r.Holds.Count==holds,"waiting consumes ST or holds");
  Require(!r.Enter(source!=PlayMode.Normal)&&!r.Enter(source==PlayMode.Normal),"waiting accepts new lottery");
  float elapsed=state.TotalElapsed;r.SetPaused(true);r.Tick(10000);Require(state.TotalElapsed==elapsed&&!r.Shoot()&&!r.CountBonus(),"pause advanced or paid");r.SetPaused(false);
  r.Tick(state.Duration);Require(!r.IsBonusPresentationPending&&released==1&&modes==1&&r.Mode==destination,"release does not commit once");
  Require(r.Remaining==(destination==PlayMode.Normal?0:destination==PlayMode.SwordRush?53:70)&&r.Starts==starts&&r.Active==null,"commit tick also consumes a spin");
  r.Tick(0);Require(released==1&&modes==1&&r.Payout==payout,"repeat release or payment");
 }
 static void VerifyMachineReset(){
  var go=new GameObject("Bonus presentation reset test");try{
   var m=go.AddComponent<YozoraMachine>();m.Command("demo-bonus");for(int i=0;i<20;i++)m.Rules.CountBonus();Require(m.Rules.IsBonusPresentationPending,"demo cannot enter wait");
   var old=m.Rules;m.Command("pause");old.Tick(10000);Require(m.Paused&&old.IsPaused&&old.BonusPresentation.TotalElapsed==0,"machine pause does not reach rules");
   m.Command("reset");Require(!ReferenceEquals(old,m.Rules)&&!m.Paused&&!m.Rules.IsPaused&&!m.Rules.IsBonusPresentationPending&&m.Rules.BonusPresentation==null,"reset leaks old presentation");
   m.Command("demo-drive");Require(m.Rules.Bonus!=null&&!m.Rules.IsBonusPresentationPending,"demo inherits prior completed state");
  }finally{UnityEngine.Object.DestroyImmediate(go);}
 }
 static void VerifyClockRate(){
  var a=Create(PlayMode.Normal,PlayMode.SwordRush);var b=Create(PlayMode.Normal,PlayMode.SwordRush);for(int i=0;i<20;i++){a.CountBonus();b.CountBonus();}
  while(a.IsBonusPresentationPending)a.Tick(.125f);while(b.IsBonusPresentationPending)b.Tick(1f);
  Require(a.Mode==b.Mode&&a.Remaining==b.Remaining&&a.Payout==b.Payout&&a.BonusPresentation.TotalElapsed==b.BonusPresentation.TotalElapsed,"preview time scale changes state");
 }
 static void VerifyUpperResult(){
  var r=new YozoraRules(17);r.SetDemo("wou");r.Enter(true,true);r.Holds.Peek().award=new Award{rounds=10,next=PlayMode.WarOfUnderworld,title="SWORD DRIVE",drive=true};r.Tick(10000);
  for(int i=0;i<100;i++)r.CountBonus();Require(r.SessionJackpots==1&&r.CompletedDriveCount==1&&r.SessionPayout==1500,"upper session counts predicted payout");r.Tick(10000);
  for(int i=0;i<70;i++){r.Enter(true,false);r.Tick(10000);}
  Require(r.Mode==PlayMode.Normal&&r.LastUpperRushResult!=null&&r.LastUpperRushResult.Jackpots==1&&r.LastUpperRushResult.CompletedDrives==1&&r.LastUpperRushResult.Payout==1500,"upper FINAL is not actual session result");
 }
}
