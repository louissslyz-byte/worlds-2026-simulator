import {teams} from './data';
import {sessionTeams} from './seedAssignments';
import {swissPools} from './draws';
import {assertCurrentRulesSession} from './sessionCompatibility';
import type {SimulationSession,Match} from './types';

function check(condition:unknown,message:string):asserts condition {if(!condition)throw Error(message);}
export function assertMatchResult(m:Match):void {
  const need=(m.format+1)/2,a=m.scoreA,b=m.scoreB;
  check(m.teamA!==m.teamB&&[1,3,5].includes(m.format),'比赛队伍或BO无效');
  check(m.status==='COMPLETE'&&a!==null&&b!==null&&Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&Math.max(a,b)===need&&Math.min(a,b)<need&&m.winner===(a>b?m.teamA:m.teamB),'完场比分或胜者无效');
}
function sameSet(a:string[],b:string[]){return a.length===b.length&&new Set(a).size===a.length&&[...a].sort().join('|')===[...b].sort().join('|');}

/** Every complete sample is audited before contributing counts. */
export function assertCompletedTournament(s:SimulationSession):void {
  assertCurrentRulesSession(s);
  const st=s.tournamentState,list=sessionTeams(s),known=new Set(teams.map(t=>t.id));
  check(st.stage==='CHAMPION'&&s.simulationStatus==='COMPLETE'&&st.champion,'赛事未完整产生冠军');
  check(st.matches.length===46&&new Set(st.matches.map(m=>m.id)).size===46,'完整赛事应有46场且ID不重复');
  for(const m of st.matches){check(known.has(m.teamA)&&known.has(m.teamB),'比赛存在未知队伍');assertMatchResult(m);}
  const get=(id:string)=>{const m=st.matches.find(x=>x.id===id);check(m,`缺少比赛 ${id}`);return m;};
  const participants=(m:Match)=>[m.teamA,m.teamB];
  const loser=(m:Match)=>m.winner===m.teamA?m.teamB:m.teamA;
  const p1a=get('p1a'),p1b=get('p1b'),p2u=get('p2u'),p2l=get('p2l'),p3=get('p3'),p4=get('p4');
  check(sameSet([...participants(p1a),...participants(p1b)],list.filter(t=>t.playIn).map(t=>t.id)),'入围赛四队不完整');
  check(sameSet(participants(p2u),[p1a.winner!,p1b.winner!])&&sameSet(participants(p2l),[loser(p1a),loser(p1b)]),'入围赛第二轮路径错误');
  check(sameSet(participants(p3),[loser(p2u),p2l.winner!])&&sameSet(participants(p4),[p2u.winner!,p3.winner!]),'入围赛晋级路径错误');
  for(const [i,m]of [p1a,p1b,p2u,p2l,p3,p4].entries())check(m.stage==='PLAY_IN'&&m.round===[1,1,2,2,3,4][i]&&m.format===5,'入围赛赛制错误');
  check(st.playInWinner===p4.winner,'入围赛胜者不一致');
  const entrants=[...list.filter(t=>!t.playIn).map(t=>t.id),st.playInWinner!];
  check(sameSet(Object.keys(st.swissRecords),entrants),'瑞士轮应有16支正确参赛队');
  const records=Object.fromEntries(entrants.map(id=>[id,{wins:0,losses:0}]));
  const pools=swissPools(s),poolById=new Map(pools.flatMap((ids,i)=>ids.map(id=>[id,i] as const)));
  const region=new Map(list.map(t=>[t.id,t.region])),past=new Set<string>();
  for(let round=1;round<=5;round++){
    const matches=st.matches.filter(m=>m.stage==='SWISS'&&m.round===round);
    const active=entrants.filter(id=>records[id].wins<3&&records[id].losses<3);
    check(matches.length===[8,8,8,6,3][round-1]&&sameSet(matches.flatMap(participants),active),'瑞士轮轮次队伍/场次错误');
    for(const m of matches){
      const a=records[m.teamA],b=records[m.teamB],key=[m.teamA,m.teamB].sort().join('|');
      check(a.wins===b.wins&&a.losses===b.losses&&a.wins+a.losses===round-1,'瑞士轮必须同战绩配对');
      check(!past.has(key),'瑞士轮重复交手');past.add(key);
      check(m.format===(a.wins===2||a.losses===2?3:1),'瑞士轮BO错误');
      if(round===1)check((poolById.get(m.teamA)!+poolById.get(m.teamB)!)===3&&region.get(m.teamA)!==region.get(m.teamB),'瑞士轮首轮分档或地域限制错误');
    }
    for(const m of matches){records[m.winner!].wins++;records[loser(m)].losses++;}
  }
  const qualified=entrants.filter(id=>records[id].wins===3),eliminated=entrants.filter(id=>records[id].losses===3);
  check(sameSet(qualified,st.swissQualified)&&sameSet(eliminated,st.swissEliminated),'瑞士轮晋级/淘汰记录错误');
  check([0,1,2].every((n,i)=>qualified.filter(id=>records[id].losses===n).length===[2,3,3][i]),'瑞士轮必须产生2/3/3支晋级队');
  for(const id of entrants)check(records[id].wins===st.swissRecords[id].wins&&records[id].losses===st.swissRecords[id].losses,'Swiss战绩不一致');
  const qf=[1,2,3,4].map(i=>get(`k1-${i}`));
  check(sameSet(qf.flatMap(participants),qualified),'八强队伍不完整或重复');
  const zero=qualified.filter(id=>records[id].losses===0),halves:number[]=[];
  qf.forEach((m,i)=>{
    check(m.stage==='KNOCKOUT'&&m.round===1&&m.format===5,'八强BO/阶段错误');
    for(const id of participants(m))if(zero.includes(id)){
      const opponent=id===m.teamA?m.teamB:m.teamA;
      check(records[opponent].losses===2,'3–0必须对阵3–2');halves.push(Math.floor(i/2));
    }
  });
  check(halves.length===2&&halves[0]!==halves[1],'两支3–0必须分处不同半区');
  const sf=[get('k2-1'),get('k2-2')],final=get('k3-1');
  for(let i=0;i<2;i++)check(sf[i].stage==='KNOCKOUT'&&sf[i].round===2&&sf[i].format===5&&sameSet(participants(sf[i]),[qf[2*i].winner!,qf[2*i+1].winner!]),'半决赛路径错误');
  check(final.stage==='KNOCKOUT'&&final.round===3&&final.format===5&&sameSet(participants(final),sf.map(m=>m.winner!))&&st.champion===final.winner,'决赛/冠军路径错误');
}
export type EventCounts={swiss:Record<string,number>;knockout:Record<string,number>;semifinal:Record<string,number>;final:Record<string,number>;champion:Record<string,number>};
export function assertEventCounts(counts:EventCounts,n:number):void {
  check(Number.isInteger(n)&&n>0,'有效模拟次数无效');
  const events=['swiss','knockout','semifinal','final','champion'] as const;
  for(const [index,event]of events.entries()){
    const values=counts[event];check(sameSet(Object.keys(values),teams.map(t=>t.id)),'事件计数必须包含全部19队');
    check(Object.values(values).every(v=>Number.isInteger(v)&&v>=0&&v<=n),'事件计数无效');
    check(Object.values(values).reduce((a,b)=>a+b,0)===[16,8,4,2,1][index]*n,'阶段计数总和错误');
  }
  for(const team of teams)for(let i=1;i<events.length;i++)check(counts[events[i]][team.id]<=counts[events[i-1]][team.id],'晋级概率不满足事件嵌套');
}
