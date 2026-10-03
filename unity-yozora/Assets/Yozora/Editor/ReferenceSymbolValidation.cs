using System;
using UnityEngine;
using Yozora;
using PlayMode=Yozora.PlayMode;
public static class ReferenceSymbolValidation {
 public static void Run(){
  for(int digit=0;digit<=8;digit++)for(int line=0;line<5;line++)foreach(bool win in new[]{false,true})foreach(bool amayori in new[]{false,true}){
   var grid=RushSymbolLayout.Settled(digit,win,amayori,line);int expected=win?1<<line:0;
   if(RushSymbolLayout.WinningLineMask(grid)!=expected)throw new Exception("Five-line display differs from fixed ticket outcome: "+digit+" / "+line);
   var selected=RushSymbolLayout.Lines[line];if(grid[selected[0]]!=digit||grid[selected[2]]!=digit||(win&&grid[selected[1]]!=digit))throw new Exception("Selected result line changed");
   if(amayori&&digit!=0){int zeroCount=0;foreach(int v in grid)if(v==0)zeroCount++;if(zeroCount!=1)throw new Exception("Exactly one non-result Amayori must remain");}
  }
  foreach(int oldDigit in new[]{0,8,3}){
   var state=new RushSymbolState();var oldRules=new YozoraRules(141);oldRules.SetDemo("win");oldRules.Holds.Peek().digit=oldDigit;oldRules.Tick(.01f);state.Observe(oldRules,true);
   var fresh=new YozoraRules(142);fresh.SetDemo("wou");var idle=state.Observe(fresh,true);
   if(RushSymbolLayout.HasLine(idle))throw new Exception("Previous demo win leaked into new RUSH standby");
   int zeros=0;foreach(int value in idle)if(value==0)zeros++;
   if(zeros!=1||idle[7]!=0)throw new Exception("New RUSH standby must have exactly one bottom-center Amayori");
   fresh.Enter(true,false);fresh.Tick(.01f);state.Observe(fresh,true);fresh.Tick(ReferenceSequenceTimeline.RushDuration+1);if(RushSymbolLayout.HasLine(state.Observe(fresh,true)))throw new Exception("RUSH miss return displayed a false winning line");
  }
  RunUpperRush();
  Debug.Log("PASS: zero/eight/ordinary demo switches reset symbol history; RUSH idle and miss return have no false line");
  Debug.Log("PASS: all five lines, nine digits, both outcomes and Amayori toggle preserve exact winning-line masks");
 }
 static void RunUpperRush(){
   var upper=new UpperRushPresentationState();var normal=new YozoraRules(190);upper.Observe(normal,0);
   if(upper.PreviewStage(UpperRushStage.Awakening)||upper.PreviewResult(UpperRushResultStyle.Result))throw new Exception("Unknown stage/result preview accepted without actual session");
   var rules=new YozoraRules(191);rules.SetDemo("wou");upper.Observe(rules,0);
   if(upper.Stage!=UpperRushStage.Invading||upper.IsStagePreview)throw new Exception("New upper session must enter INVADING without inferred awakening");
   var symbols=new RushSymbolState();symbols.Observe(rules,true,upper.SymbolSetRevision);
   if(!upper.PreviewStage(UpperRushStage.Awakening))throw new Exception("Explicit AWAKENING preview rejected");
   var awakening=symbols.Observe(rules,false,upper.SymbolSetRevision);foreach(int value in awakening)if(value==0)throw new Exception("INVADING Amayori leaked into unknown AWAKENING set");
   if(RushSymbolLayout.HasLine(awakening))throw new Exception("Changing stage created an idle winning line");
   rules.Enter(true,true);rules.Holds.Peek().award=new Award{rounds=10,next=PlayMode.WarOfUnderworld,title="SWORD DRIVE",drive=true};rules.Tick(200);
   if(upper.PreviewStage(UpperRushStage.Invading))throw new Exception("Stage preview interrupted an active bonus");
   for(int i=0;i<100;i++)rules.CountBonus();
   if(!rules.IsBonusPresentationPending||upper.PreviewStage(UpperRushStage.Invading))throw new Exception("Stage preview interrupted pending bonus story");
   upper.Observe(rules,0);if(upper.HasResult)throw new Exception("Completed DRIVE must not fabricate a session ending");
   rules.Tick(rules.BonusPresentation.Duration+1);upper.Observe(rules,0);
   for(int i=0;i<70;i++){if(!rules.Enter(true,false))throw new Exception("Upper result fixture entry rejected");rules.Tick(200);}
   upper.Observe(rules,0);
   if(!upper.HasResult||upper.ResultCompletedDrives!=1||upper.ResultJackpots!=1||upper.ResultPayout!=1500)throw new Exception("Result differs from actual completed session");
   rules.SetPaused(true);upper.Observe(rules,25);if(!upper.HasResult)throw new Exception("Paused result advanced");rules.SetPaused(false);
   upper.DismissResult();upper.Observe(rules,0);if(upper.HasResult)throw new Exception("Dismissed snapshot reappeared");
   if(!upper.PreviewResult(UpperRushResultStyle.Result)||upper.ResultPayout!=1500)throw new Exception("Alternate RESULT must use same real snapshot");
   rules.Enter(false,false);rules.Tick(.01f);upper.Observe(rules,0);if(upper.HasResult)throw new Exception("Result covered next normal spin");
   upper.Observe(new YozoraRules(192),0);if(upper.HasResult||upper.ResultId!=0||upper.Stage!=UpperRushStage.None)throw new Exception("Upper state leaked across reset");
   Debug.Log("PASS: INVADING/AWAKENING isolation, bonus priority, actual final counters, result dismissal and reset");
  }
}
