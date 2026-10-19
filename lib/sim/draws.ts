import {sessionTeams} from './seedAssignments';
import {randomIndex,shuffle} from './random';
import {worlds2026} from './worlds2026';
import type {SimulationSession} from './types';

export type Pair=[string,string];
type Allowed=(a:string,b:string)=>boolean;

// Canonical enumeration: each unordered perfect matching appears exactly once.
// Swiss record pools have at most eight teams, so exhaustive enumeration is small.
export function legalPairings(ids:readonly string[],allowed:Allowed):Pair[][] {
  if(ids.length%2||new Set(ids).size!==ids.length||ids.length>8)throw Error('抽签组规模或队伍无效');
  const search=(remaining:string[]):Pair[][]=>{
    if(!remaining.length)return [[]];
    const [a,...rest]=remaining,options:Pair[][]=[];
    for(const b of rest)if(allowed(a,b)){
      for(const tail of search(rest.filter(id=>id!==b)))options.push([[a,b],...tail]);
    }
    return options;
  };
  return search([...ids].sort());
}
export function samplePairing(ids:readonly string[],allowed:Allowed,s:SimulationSession):Pair[] {
  const options=legalPairings(ids,allowed);
  if(!options.length)throw Error('当前战绩组不存在满足禁止重赛规则的合法抽签');
  return shuffle(options[randomIndex(s,options.length)],s).map(([a,b])=>randomIndex(s,2)?[a,b]:[b,a]);
}
export function swissPools(s:SimulationSession):string[][] {
  const list=sessionTeams(s),winner=s.tournamentState.playInWinner;
  if(!winner||!list.some(t=>t.id===winner&&t.playIn))throw Error('入围赛胜者无效');
  const lookup=(region:string,seed:number)=>{
    const team=list.find(t=>t.region===region&&t.seed===seed&&!t.playIn);
    if(!team)throw Error(`缺少 ${region} #${seed} 瑞士轮席位`);
    return team.id;
  };
  const pools=worlds2026.swissDrawPools.map(pool=>pool.map(([region,seed])=>region==='PLAY_IN_WINNER'?winner:lookup(region,seed)));
  if(new Set(pools.flat()).size!==16)throw Error('瑞士轮四档队伍不完整或重复');
  return pools;
}
export function drawSwissFirstRound(s:SimulationSession):Pair[] {
  const pools=swissPools(s),regions=new Map(sessionTeams(s).map(t=>[t.id,t.region]));
  return shuffle([[0,3],[1,2]].flatMap(([a,b])=>{
    const left=new Set(pools[a]);
    return samplePairing([...pools[a],...pools[b]],(x,y)=>left.has(x)!==left.has(y)&&regions.get(x)!==regions.get(y),s);
  }),s);
}
export function drawKnockoutPairs(s:SimulationSession):Pair[] {
  const st=s.tournamentState;
  const byLoss=(n:number)=>st.swissQualified.filter(id=>st.swissRecords[id]?.wins===3&&st.swissRecords[id].losses===n).sort();
  const zero=shuffle(byLoss(0),s),one=byLoss(1),two=shuffle(byLoss(2),s);
  if(st.swissQualified.length!==8||new Set(st.swissQualified).size!==8||zero.length!==2||one.length!==3||two.length!==3)throw Error('瑞士轮晋级结构必须为 2支3–0、3支3–1、3支3–2');
  const bracket:Array<Pair|null>=[null,null,null,null];
  bracket[randomIndex(s,2)]=[zero[0],two[0]];
  bracket[2+randomIndex(s,2)]=[zero[1],two[1]];
  const remaining=samplePairing([...one,two[2]],()=>true,s);
  const slots=bracket.flatMap((pair,i)=>pair?[]:[i]);
  slots.forEach((slot,i)=>{bracket[slot]=remaining[i];});
  return bracket.map(pair=>{if(!pair)throw Error('八强签表不完整');return randomIndex(s,2)?pair:[pair[1],pair[0]];});
}
