'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {createSession,advance,applyResult,clearResult,editPreviousRound,forkOfficialScenario,simulateEntireWorlds,simulateRemaining} from '../../lib/sim/engine';
import {runMonteCarloFromState} from '../../lib/sim/monteCarlo';
import type {SimulationSession,TournamentState} from '../../lib/sim/types';
import {TeamIdentity} from '../../components/tournament/team-identity';
import {TeamStatusBadge} from '../../components/tournament/status-badge';
import {RoundSection} from '../../components/tournament/round-section';
import {PlayInBracket} from '../../components/tournament/play-in-bracket';
import {KnockoutBracket} from '../../components/tournament/knockout-bracket';
import {ChampionCard} from '../../components/tournament/champion-card';
import {ProbabilityBar} from '../../components/tournament/probability-bar';
import {teams} from '../../lib/sim/data';

const stageNames={PLAY_IN:'入围赛',SWISS:'瑞士轮',KNOCKOUT:'淘汰赛',CHAMPION:'世界冠军'} as const;
const steps=[{id:'play-in',name:'入围赛'},{id:'swiss',name:'瑞士轮'},{id:'quarterfinals',name:'四分之一决赛'},{id:'semifinals',name:'半决赛'},{id:'final',name:'总决赛'},{id:'champion',name:'冠军'}];
function progressIndex(st:TournamentState){return st.stage==='PLAY_IN'?0:st.stage==='SWISS'?1:st.stage==='CHAMPION'?5:st.round+1}
function stageTitle(st:TournamentState){return st.stage==='CHAMPION'?'世界冠军已诞生':st.stage==='KNOCKOUT'?({1:'四分之一决赛',2:'半决赛',3:'总决赛'} as Record<number,string>)[st.round]:`${stageNames[st.stage]} · 第 ${st.round} 轮`}
function stageDescription(st:TournamentState){if(st.stage==='PLAY_IN')return '4 支队伍争夺 1 个瑞士轮席位';if(st.stage==='SWISS')return '16 支队伍 · 8 个淘汰赛席位';if(st.stage==='KNOCKOUT')return '单败淘汰 · Bo5 系列赛';return '本局模拟已完成'}

export default function Simulator(){
 const [session,setSession]=useState<SimulationSession|null>(null);
 const [odds,setOdds]=useState<Record<string,number>|null>(null);
 const [sampleCount,setSampleCount]=useState(0);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem('worlds2026-session');if(!raw)return;const saved=JSON.parse(raw) as SimulationSession;const currentIds=teams.map(t=>t.id).sort().join('|');const savedIds=Object.keys(saved.ratingSnapshot??{}).sort().join('|');if(savedIds!==currentIds){localStorage.setItem('worlds2026-session-previous-roster',raw);localStorage.removeItem('worlds2026-session');queueMicrotask(()=>setError('参赛名单已更新，旧模拟已保存在此浏览器中。请创建新模拟以使用最新队伍。'));return}queueMicrotask(()=>setSession(saved))}catch{}},[]);
 const state=session?.tournamentState;
 const current=useMemo(()=>state?.matches.filter(m=>m.stage===state.stage&&m.round===state.round)??[],[state]);
 function update(fn:(s:SimulationSession)=>SimulationSession){if(!session)return;try{const next=fn(session);setSession(next);localStorage.setItem('worlds2026-session',JSON.stringify(next));setOdds(null);setError('')}catch(e){setError(e instanceof Error?e.message:'操作失败')}}
 function recalc(){if(!session)return;setBusy(true);setTimeout(()=>{try{const result=runMonteCarloFromState(session,500,session.randomSeed);setOdds(result.probabilities);setSampleCount(result.iterations);setError(result.iterations?'':'当前规则下无法完成抽签样本，请检查限制配置。')}catch(e){setError(e instanceof Error?e.message:'概率计算失败')}setBusy(false)},20)}
 function pick(id:string,winner:string,a:number,b:number){update(s=>applyResult(s,id,winner,a,b,'MANUAL'))}
 function clear(id:string){update(s=>clearResult(s,id))}
 function edit(id:string){if(!window.confirm('修改这场比赛将清除所有后续轮次和依赖赛程，确定继续吗？'))return;update(s=>editPreviousRound(s,id))}
 function fork(id:string){if(!session)return;if(!window.confirm('将创建独立假设场景，原官方结果会保存在浏览器中。继续吗？'))return;localStorage.setItem('worlds2026-official-baseline',JSON.stringify(session));update(s=>forkOfficialScenario(s,id))}
 function reset(){if(!session||!window.confirm('重置本局会清除当前赛果。确定重新开始吗？'))return;update(s=>createSession(s.strengthSource,s.ratingSnapshot,s.tierListSnapshot,s.randomSeed));window.scrollTo({top:0,behavior:'smooth'})}
 function simulateStage(){update(s=>{const start=s.tournamentState.stage;let next=s;let guard=0;while(next.tournamentState.stage===start&&guard++<6){next=advance(simulateRemaining(next))}return next})}
 if(!session||!state)return <main className="shell"><div className="page-head"><div><div className="eyebrow">SIMULATOR</div><h1>还没有模拟会话</h1><p>选择系统模型或建立自己的 Tier List，即可开始。</p></div><Link href="/simulator/new" className="button">创建模拟</Link></div>{error&&<p role="alert" className="notice">{error}</p>}</main>;
 const all=state.matches;const playIn=all.filter(m=>m.stage==='PLAY_IN');const knockout=all.filter(m=>m.stage==='KNOCKOUT');const completed=all.filter(m=>m.status==='COMPLETE').length;const progress=progressIndex(state);
 return <main className="shell simulator-page">
  <section className="simulator-status"><div><div className="eyebrow">WORLDS 2026 · SCENARIO {session.id.slice(0,8).toUpperCase()}</div><h1>{stageTitle(state)}</h1><p>{stageDescription(state)}</p></div><div className="simulator-model"><span>实力模型</span><strong>{session.strengthSource==='SYSTEM_MODEL'?`系统 ${session.systemModelVersion}`:'自定义 TIER LIST'}</strong><small>手动赛果与随机模拟可同时使用</small></div></section>
  <nav className="stage-navigation" aria-label="赛事阶段导航">{steps.map((step,i)=><a key={step.id} href={`#${step.id}`} className={i<progress?'is-complete':i===progress?'is-active':'is-future'} aria-current={i===progress?'step':undefined}><span className="stage-dot">{i<progress?'✓':i===progress?'●':'○'}</span><span>{step.name}</span></a>)}</nav>
  <div className="simulator-toolbar"><div className="simulation-facts"><span><b>{completed}</b> 场已决定</span><span>手动 <b>{all.filter(m=>m.resultSource==='MANUAL').length}</b></span><span>模拟 <b>{all.filter(m=>m.resultSource==='SIMULATION').length}</b></span></div><div className="action-row"><button className="button small ghost" onClick={recalc} disabled={busy}>{busy?'计算中…':'重算夺冠概率'}</button><button className="button small ghost" onClick={reset}>重置本局</button><Link href="/simulator/new" className="button small secondary">新建模拟</Link></div></div>
  {error&&<p role="alert" className="notice">{error}</p>}
  {state.stage!=='CHAMPION'&&<div className="current-actions"><div><strong>当前轮次</strong><span>{current.filter(m=>m.status==='UNDECIDED').length} 场待决定 · 手动选择优先</span></div><div className="action-row"><button className="button" onClick={()=>update(simulateRemaining)} disabled={!current.some(m=>m.status==='UNDECIDED')}>模拟本轮剩余比赛</button><button className="button secondary" onClick={()=>update(advance)} disabled={current.some(m=>m.status==='UNDECIDED')}>进入下一轮 →</button><button className="button ghost" onClick={simulateStage}>模拟整个阶段</button><button className="button ghost" onClick={()=>update(simulateEntireWorlds)}>模拟后续全部比赛</button></div></div>}
  <section className="tournament-stage" id="play-in"><div className="stage-section-heading"><span className="stage-number">01</span><div><div className="eyebrow">PLAY-IN</div><h2>入围赛</h2><p>胜者组与败者组逐轮推进，决出瑞士轮最后一个席位。</p></div></div><PlayInBracket matches={playIn} winner={state.playInWinner}/>{[1,2,3,4,5].filter(round=>round<=Math.max(4,...playIn.map(m=>m.round))).map(round=><RoundSection key={round} stage="PLAY_IN" round={round} matches={playIn.filter(m=>m.round===round)} current={state.stage==='PLAY_IN'&&state.round===round} onPick={pick} onClear={clear} onEdit={edit} onFork={fork}/>)}</section>
  <section className="tournament-stage" id="swiss"><div className="stage-section-heading"><span className="stage-number">02</span><div><div className="eyebrow">SWISS STAGE</div><h2>瑞士轮</h2><p>同战绩分组抽签，三胜晋级，三负淘汰。</p></div></div>{Object.keys(state.swissRecords).length>0&&<div className="swiss-standings"><div className="standings-head"><h3>战绩与晋级状态</h3><span>16 支队伍</span></div><div className="standings-grid">{Object.entries(state.swissRecords).sort((a,b)=>b[1].wins-a[1].wins||a[1].losses-b[1].losses).map(([id,r])=><div className="standing-row" key={id}><TeamIdentity teamId={id} size={30}/><strong className="standing-record">{r.wins}–{r.losses}</strong><TeamStatusBadge wins={r.wins} losses={r.losses}/></div>)}</div></div>}{[1,2,3,4,5].map(round=><RoundSection key={round} stage="SWISS" round={round} matches={all.filter(m=>m.stage==='SWISS'&&m.round===round)} current={state.stage==='SWISS'&&state.round===round} onPick={pick} onClear={clear} onEdit={edit} onFork={fork}/>)}</section>
  <section className="tournament-stage" id="quarterfinals"><div className="stage-section-heading"><span className="stage-number">03</span><div><div className="eyebrow">KNOCKOUT STAGE</div><h2>淘汰赛</h2><p>四分之一决赛 → 半决赛 → 总决赛。</p></div></div><KnockoutBracket matches={knockout} champion={state.champion}/>{[1,2,3].map(round=><RoundSection key={round} id={round===2?"semifinals":round===3?"final":undefined} stage="KNOCKOUT" round={round} matches={knockout.filter(m=>m.round===round)} current={state.stage==='KNOCKOUT'&&state.round===round} onPick={pick} onClear={clear} onEdit={edit} onFork={fork}/>)}</section>
  {odds&&<section className="odds-section"><div className="stage-section-heading"><span className="stage-number">%</span><div><div className="eyebrow">CONDITIONAL PROBABILITY</div><h2>当前夺冠概率</h2><p>保留已确定赛果 · {sampleCount} 次有效模拟</p></div></div><div className="odds-list">{Object.entries(odds).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([id,p])=><div className="odds-row" key={id}><TeamIdentity teamId={id} size={30}/><ProbabilityBar a={p}/><strong>{(p*100).toFixed(1)}%</strong></div>)}</div></section>}
  {state.champion?<ChampionCard state={state}/>:<div className="champion-placeholder" id="champion"><span className="champion-symbol">✦</span><span>世界冠军将在总决赛结束后揭晓</span></div>}
 </main>;
}
