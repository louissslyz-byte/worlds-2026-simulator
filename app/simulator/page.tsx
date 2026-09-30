'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
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
import {worldsSchedule,updatedStartTimesSource,type ScheduledStage} from '../../lib/sim/schedule';

const stageNames={PLAY_IN:'入围赛',SWISS:'瑞士轮',KNOCKOUT:'淘汰赛',CHAMPION:'世界冠军'} as const;
const steps=[{id:'play-in',name:'入围赛'},{id:'swiss',name:'瑞士轮'},{id:'quarterfinals',name:'四分之一决赛'},{id:'semifinals',name:'半决赛'},{id:'final',name:'总决赛'},{id:'champion',name:'冠军'}];
function progressIndex(st:TournamentState){return st.stage==='PLAY_IN'?0:st.stage==='SWISS'?1:st.stage==='CHAMPION'?5:st.round+1}
function stageTitle(st:TournamentState){return st.stage==='CHAMPION'?'世界冠军已诞生':st.stage==='KNOCKOUT'?({1:'四分之一决赛',2:'半决赛',3:'总决赛'} as Record<number,string>)[st.round]:`${stageNames[st.stage]} · 第 ${st.round} 轮`}
function StageTime({stage}:{stage:ScheduledStage}){const slot=worldsSchedule[stage];return <p className="stage-schedule"><strong>{slot.date}</strong><span> · {slot.time}（{slot.zone}）</span></p>}
function stageDescription(st:TournamentState){if(st.stage==='PLAY_IN')return '4 支队伍争夺 1 个瑞士轮席位';if(st.stage==='SWISS')return '16 支队伍 · 8 个淘汰赛席位';if(st.stage==='KNOCKOUT')return '单败淘汰 · BO5 系列赛';return '本局模拟已完成'}

export default function Simulator(){
 const [session,setSession]=useState<SimulationSession|null>(null);
 const [odds,setOdds]=useState<Record<string,number>|null>(null);
 const [sampleCount,setSampleCount]=useState(0);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [viewStage,setViewStage]=useState<string|null>(null);
 const stageNavRef=useRef<HTMLElement>(null);
 useEffect(()=>{try{const raw=localStorage.getItem('worlds2026-session');if(!raw)return;const saved=JSON.parse(raw) as SimulationSession;const currentIds=teams.map(t=>t.id).sort().join('|');const savedIds=Object.keys(saved.ratingSnapshot??{}).sort().join('|');if(savedIds!==currentIds){localStorage.setItem('worlds2026-session-previous-roster',raw);localStorage.removeItem('worlds2026-session');queueMicrotask(()=>setError('参赛名单已更新，旧模拟已保存在此浏览器中。请创建新模拟以使用最新队伍。'));return}queueMicrotask(()=>setSession(saved))}catch{}},[]);
 const state=session?.tournamentState;
 const current=useMemo(()=>state?.matches.filter(m=>m.stage===state.stage&&m.round===state.round)??[],[state]);
 function update(fn:(s:SimulationSession)=>SimulationSession){if(!session)return;try{const next=fn(session);setSession(next);setViewStage(null);localStorage.setItem('worlds2026-session',JSON.stringify(next));setOdds(null);setError('')}catch(e){setError(e instanceof Error?e.message:'操作失败')}}
 function recalc(){if(!session)return;setBusy(true);setTimeout(()=>{try{const result=runMonteCarloFromState(session,500,session.randomSeed);setOdds(result.probabilities);setSampleCount(result.iterations);setError(result.iterations?'':'当前规则下无法完成抽签样本，请检查限制配置。')}catch(e){setError(e instanceof Error?e.message:'概率计算失败')}setBusy(false)},20)}
 function pick(id:string,winner:string,a:number,b:number){update(s=>applyResult(s,id,winner,a,b,'MANUAL'))}
 function clear(id:string){update(s=>clearResult(s,id))}
 function edit(id:string){if(!window.confirm('修改这场比赛将清除所有后续轮次和依赖赛程，确定继续吗？'))return;update(s=>editPreviousRound(s,id))}
 function fork(id:string){if(!session)return;if(!window.confirm('将创建独立假设场景，原官方结果会保存在浏览器中。继续吗？'))return;localStorage.setItem('worlds2026-official-baseline',JSON.stringify(session));update(s=>forkOfficialScenario(s,id))}
 function reset(){if(!session||!window.confirm('重置本局会清除当前赛果。确定重新开始吗？'))return;update(s=>createSession(s.strengthSource,s.ratingSnapshot,s.tierListSnapshot,s.randomSeed));window.scrollTo({top:0,behavior:'smooth'})}
 function simulateStage(){update(s=>{const start=s.tournamentState.stage;let next=s;let guard=0;while(next.tournamentState.stage===start&&guard++<6){next=advance(simulateRemaining(next))}return next})}
 const progress=state?progressIndex(state):0;
 const activeView=viewStage??steps[progress].id;
 // Keep the selected stage visible in the horizontal mobile navigation.
 // This runs after each stage change and does not affect tournament state.
 useEffect(()=>{const nav=stageNavRef.current;const selected=nav?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');if(!nav||!selected)return;nav.scrollTo({left:selected.offsetLeft-(nav.clientWidth-selected.clientWidth)/2,behavior:'smooth'})},[activeView]);
 if(!session||!state)return <main className="shell"><div className="page-head"><div><div className="eyebrow">赛事模拟</div><h1>还没有开始模拟</h1><p>选择系统模型，或自己调整队伍实力，即可开始。</p></div><Link href="/simulator/new" className="button">开始模拟</Link></div>{error&&<p role="alert" className="notice">{error}</p>}</main>;
 const all=state.matches;const playIn=all.filter(m=>m.stage==='PLAY_IN');const knockout=all.filter(m=>m.stage==='KNOCKOUT');const completed=all.filter(m=>m.status==='COMPLETE').length;
 return <main className="shell simulator-page">
  <section className="simulator-status"><div><div className="eyebrow">WORLDS 2026 · 本次模拟</div><h1>{stageTitle(state)}</h1><p>{stageDescription(state)}</p></div><div className="simulator-model"><span>实力模型</span><strong>{session.strengthSource==='SYSTEM_MODEL'?'系统模型':'自定义实力'}</strong><small>你选的赛果会保留</small></div></section>
  <nav ref={stageNavRef} className="stage-navigation" aria-label="赛事阶段导航">{steps.map((step,i)=><button type="button" key={step.id} onClick={()=>{setViewStage(step.id);window.scrollTo({top:0,behavior:'smooth'})}} className={`${i<progress?'is-complete':i===progress?'is-current':'is-future'} ${activeView===step.id?'is-active':''}`} aria-pressed={activeView===step.id}><span className="stage-dot">{i<progress?'✓':i===progress?'●':'○'}</span><span className="stage-nav-copy"><strong>{step.name}</strong><small>{step.id==='champion'?'11月15日赛后':worldsSchedule[step.id as ScheduledStage].navDate}</small></span></button>)}</nav><p className="schedule-note">比赛日期与开赛时间已换算为北京时间 CST（UTC+8）。<a href={updatedStartTimesSource} target="_blank" rel="noopener noreferrer">LoL Esports 官方时间表 ↗</a></p>
  {activeView!==steps[progress].id&&<div className="stage-return"><span>正在查看：{steps.find(step=>step.id===activeView)?.name}</span><button type="button" onClick={()=>setViewStage(null)}>返回当前阶段 →</button></div>}
  <div className="simulator-toolbar"><div className="simulation-facts"><span><b>{completed}</b> 场已决定</span><span>手动 <b>{all.filter(m=>m.resultSource==='MANUAL').length}</b></span><span>模拟 <b>{all.filter(m=>m.resultSource==='SIMULATION').length}</b></span></div><div className="action-row"><button className="button small ghost" onClick={recalc} disabled={busy}>{busy?'计算中…':'更新夺冠概率'}</button><button className="button small ghost" onClick={reset}>重置本局</button><Link href="/simulator/new" className="button small secondary">新建模拟</Link></div></div>
  {error&&<p role="alert" className="notice">{error}</p>}
  {state.stage!=='CHAMPION'&&<div className="current-actions"><div><strong>当前轮次</strong><span>{current.filter(m=>m.status==='UNDECIDED').length} 场待决定 · 手动选择优先</span></div><div className="action-row"><button className="button" onClick={()=>update(simulateRemaining)} disabled={!current.some(m=>m.status==='UNDECIDED')}>模拟本轮剩余比赛</button><button className="button secondary" onClick={()=>update(advance)} disabled={current.some(m=>m.status==='UNDECIDED')}>进入下一轮 →</button><button className="button ghost" onClick={simulateStage}>模拟本赛段</button><button className="button ghost" onClick={()=>update(simulateEntireWorlds)}>模拟到冠军</button></div></div>}
  {activeView==='play-in'&&<section className="tournament-stage" id="play-in"><div className="stage-section-heading"><span className="stage-number">01</span><div><div className="eyebrow">PLAY-IN</div><h2>入围赛</h2><p>四支队伍争夺最后一个瑞士轮席位。</p><StageTime stage="play-in"/></div></div><details className="bracket-disclosure" open={state.stage==='PLAY_IN'}><summary>入围赛对阵路径 <span>查看胜者组与败者组 →</span></summary><PlayInBracket matches={playIn} winner={state.playInWinner}/></details>{[1,2,3,4,5].filter(round=>round<=Math.max(4,...playIn.map(m=>m.round))).map(round=><RoundSection key={round} stage="PLAY_IN" round={round} matches={playIn.filter(m=>m.round===round)} current={state.stage==='PLAY_IN'&&state.round===round} onPick={pick} onClear={clear} onEdit={edit} onFork={fork}/>)}</section>}
  {activeView==='swiss'&&<section className="tournament-stage" id="swiss"><div className="stage-section-heading"><span className="stage-number">02</span><div><div className="eyebrow">SWISS STAGE</div><h2>瑞士轮</h2><p>同战绩队伍交手；赢三场晋级，输三场出局。</p><StageTime stage="swiss"/></div></div>{Object.keys(state.swissRecords).length>0&&<details className="swiss-standings" open={state.stage==='SWISS'}><summary>战绩与晋级状态 <span>16 支队伍 · 点击展开</span></summary><div className="swiss-standings-inner"><div className="standings-head"><h3>战绩与晋级状态</h3><span>16 支队伍</span></div><div className="standings-grid">{Object.entries(state.swissRecords).sort((a,b)=>b[1].wins-a[1].wins||a[1].losses-b[1].losses).map(([id,r])=><div className="standing-row" key={id}><TeamIdentity teamId={id} size={30}/><strong className="standing-record">{r.wins}–{r.losses}</strong><TeamStatusBadge wins={r.wins} losses={r.losses}/></div>)}</div></div></details>}{[1,2,3,4,5].map(round=><RoundSection key={round} stage="SWISS" round={round} matches={all.filter(m=>m.stage==='SWISS'&&m.round===round)} current={state.stage==='SWISS'&&state.round===round} onPick={pick} onClear={clear} onEdit={edit} onFork={fork}/>)}</section>}
  {['quarterfinals','semifinals','final'].includes(activeView)&&<section className="tournament-stage" id="quarterfinals"><div className="stage-section-heading"><span className="stage-number">03</span><div><div className="eyebrow">KNOCKOUT STAGE</div><h2>淘汰赛</h2><p>八支队伍逐轮淘汰，决出冠军。</p><StageTime stage={activeView as ScheduledStage}/></div></div><details className="bracket-disclosure" open={state.stage==='KNOCKOUT'}><summary>完整淘汰赛对阵图 <span>四分之一决赛至冠军 →</span></summary><KnockoutBracket matches={knockout} champion={state.champion}/></details>{[1,2,3].filter(round=>round===(['quarterfinals','semifinals','final'].indexOf(activeView)+1)).map(round=><RoundSection key={round} id={round===2?"semifinals":round===3?"final":undefined} stage="KNOCKOUT" round={round} matches={knockout.filter(m=>m.round===round)} current={state.stage==='KNOCKOUT'&&state.round===round} onPick={pick} onClear={clear} onEdit={edit} onFork={fork}/>)}</section>}
  {odds&&<section className="odds-section"><div className="stage-section-heading"><span className="stage-number">%</span><div><div className="eyebrow">当前赛果</div><h2>现在的夺冠概率</h2><p>已选赛果保持不变 · 基于 {sampleCount} 次模拟</p></div></div><div className="odds-list">{Object.entries(odds).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([id,p])=><div className="odds-row" key={id}><TeamIdentity teamId={id} size={30}/><ProbabilityBar a={p}/><strong>{(p*100).toFixed(1)}%</strong></div>)}</div></section>}
  {activeView==='champion'&&(state.champion?<ChampionCard state={state}/>:<div className="champion-placeholder" id="champion"><span className="champion-symbol">✦</span><span>世界冠军将在总决赛结束后揭晓</span></div>)}
 </main>;
}
