using System;
namespace Yozora {
 public static class RushSymbolLayout {
  public static readonly int[][] Lines={new[]{0,1,2},new[]{3,4,5},new[]{6,7,8},new[]{0,4,8},new[]{6,4,2}};
  // Line selection is a deterministic presentation cycle, never a new lottery.
  public static int SelectLine(int completedStarts)=>Math.Abs(completedStarts%5);
  public static int[] Settled(int digit,bool win,bool includeAmayori=false,int selectedLine=1){
   selectedLine=Math.Abs(selectedLine%5);var grid=new int[9];for(int i=0;i<9;i++)grid[i]=-1;
   var line=Lines[selectedLine];grid[line[0]]=grid[line[2]]=digit;grid[line[1]]=win?digit:1+Math.Abs(digit)%6;
   if(includeAmayori&&digit!=0){foreach(int slot in new[]{7,6,8,0,2,1,3,5,4})if(grid[slot]<0){grid[slot]=0;break;}}
   if(!Fill(grid,0,digit,win,selectedLine))throw new InvalidOperationException("No valid symbol presentation");
   return grid;
  }
  static bool Fill(int[] grid,int cursor,int digit,bool win,int selected){
   if(cursor==9)return WinningLineMask(grid)==(win?1<<selected:0);
   if(grid[cursor]>=0)return Fill(grid,cursor+1,digit,win,selected);
   for(int offset=0;offset<6;offset++){
    grid[cursor]=1+(cursor+digit+offset+6)%6;
    int mask=WinningLineMask(grid);if((mask&~(win?1<<selected:0))==0&&Fill(grid,cursor+1,digit,win,selected))return true;
   }
   grid[cursor]=-1;return false;
  }
  public static int WinningLineMask(int[] grid){int mask=0;for(int i=0;i<Lines.Length;i++){var l=Lines[i];if(grid[l[0]]>=0&&grid[l[0]]==grid[l[1]]&&grid[l[1]]==grid[l[2]])mask|=1<<i;}return mask;}
  public static bool HasLine(int[] grid)=>WinningLineMask(grid)!=0;
 }
 public sealed class RushSymbolState {
  YozoraRules owner;PlayMode mode;Ticket previous;int previousLine=1,setRevision=int.MinValue;
  int[] stopped=RushSymbolLayout.Settled(1,false);int[] activeGrid;
  public int SelectedLine {get;private set;}=1;
  public int[] Observe(YozoraRules rules,bool includeAmayori,int symbolSetRevision=0){
   if(!object.ReferenceEquals(owner,rules)||mode!=rules.Mode||setRevision!=symbolSetRevision){owner=rules;mode=rules.Mode;setRevision=symbolSetRevision;previous=null;activeGrid=null;SelectedLine=1;stopped=RushSymbolLayout.Settled(1,false,includeAmayori);}
   var active=rules.Active;
   if(previous!=null&&!object.ReferenceEquals(active,previous)){stopped=RushSymbolLayout.Settled(previous.digit,previous.win,includeAmayori,previousLine);SelectedLine=previousLine;}
   if(active!=null&&!object.ReferenceEquals(active,previous)){previousLine=RushSymbolLayout.SelectLine(rules.Starts);SelectedLine=previousLine;activeGrid=RushSymbolLayout.Settled(active.digit,active.win,includeAmayori,previousLine);}
   previous=active;return active!=null?activeGrid:stopped;
  }
 }
}
