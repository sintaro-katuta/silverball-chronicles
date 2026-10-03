using System;
using System.Collections.Generic;
using UnityEngine;
using Yozora;
using PlayMode = Yozora.PlayMode;
public static class YozoraValidation {
 static void Check(bool result,string label){if(!result)throw new Exception("FAIL: "+label);Debug.Log("PASS: "+label);}
 static Func<double> Seq(params double[] values){var q=new Queue<double>(values);return ()=>q.Dequeue();}
 public static void Run(){
  Check(YozoraRules.DrawAward(PlayMode.Normal,Seq(.4999)).next==PlayMode.Normal,"50% boundary");
  Check(YozoraRules.DrawAward(PlayMode.Normal,Seq(.5)).next==PlayMode.SwordRush,"ST entry boundary");
  Check(YozoraRules.DrawAward(PlayMode.Normal,Seq(.985,0)).Payout==3000,"upper direct minimum payout");
  Check(YozoraRules.Drive(Seq(.995,.995,0))==11,"DRIVE repeat preserves tail");
  var r=new YozoraRules(711);r.SetDemo("bonus");for(int i=0;i<19;i++)r.CountBonus();Check(r.Payout==285&&r.Bonus!=null,"per-entry payout");r.CountBonus();Check(r.Payout==300&&r.Bonus==null&&r.IsBonusPresentationPending&&r.Remaining==0,"20 counts complete 2R and wait for presentation");r.CountBonus();Check(r.Payout==300,"no double pay after close");
  var q=new YozoraRules(811);for(int i=0;i<5;i++)q.Enter(false,false);Check(q.Holds.Count==4,"queue bound");q.Tick(ReferenceSequenceTimeline.NormalDuration+1);Check(q.Starts==1&&q.Bonus==null,"forced miss consumes one hold");
  var st=new YozoraRules(93);st.SetDemo("rush");for(int i=0;i<53;i++){st.Enter(true,false);st.Tick(ReferenceSequenceTimeline.RushDuration+1);}Check(st.Remaining==0&&st.Mode==PlayMode.Normal,"ST expiry exactly 53 misses");
  bool consistent=true;for(int seed=1;seed<=300;seed++){var normal=new YozoraRules(seed);normal.Enter(false,true);var ticket=normal.Holds.Peek();consistent&=ticket.digit>=1&&ticket.digit<=7&&(ticket.digit!=3||ticket.award.next!=PlayMode.Normal)&&(ticket.digit!=7||ticket.award.drive);}
  Check(consistent,"normal symbol 3 implies RUSH and 7 implies Epilogue, no ordinary 9");
  bool layout=true;for(int digit=1;digit<=6;digit++)layout&=!RushSymbolLayout.HasLine(RushSymbolLayout.Settled(digit,false))&&RushSymbolLayout.HasLine(RushSymbolLayout.Settled(digit,true));
  Check(layout,"all six RUSH win layouts show a line and misses show no false line");
  var timeline=new YozoraRules(312);timeline.SetDemo("miss");timeline.Tick(ReferenceSequenceTimeline.NormalResult);Check(timeline.Active!=null&&timeline.Starts==0,"result display does not complete the ticket early");timeline.Tick(ReferenceSequenceTimeline.NormalDuration-ReferenceSequenceTimeline.NormalResult);Check(timeline.Active==null&&timeline.Starts==1&&timeline.Bonus==null,"long normal miss returns without bonus");
  var winner=new YozoraRules(313);winner.SetDemo("win");winner.Tick(ReferenceSequenceTimeline.NormalDuration);Check(winner.Bonus!=null&&winner.Jackpots==1,"long win awards once after the presentation");
  BonusPresentationValidation.Run();
  YozoraLongRunValidation.Run();
  ReferenceSymbolValidation.Run();
  YozoraPhysicsAudit.ValidateDistributionPattern();
  Debug.Log("YOZORA_RULE_TESTS_PASSED 15 + FAIR validation");
 }
}
