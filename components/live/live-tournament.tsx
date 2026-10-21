'use client';
import {InfoDisclosure} from '../ui/info-disclosure';
import {useState} from 'react';
import Link from 'next/link';
import {TeamLogo} from '../tournament/team-logo';
import {curveEvents,curveLabels,regions,probabilityText,deltaText,visibleTeams,type LiveView} from '../../lib/live/view';
import styles from './live.module.css';
const beijing=(value:string)=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));
const positions:Record<string,string>={UPPER_SEMIFINAL_1:'胜者组首轮',UPPER_SEMIFINAL_2:'胜者组首轮',UPPER_FINAL:'胜者组决赛',LOWER_SEMIFINAL:'败者组首轮',LOWER_FINAL:'败者组决赛',QUALIFICATION_FINAL:'最终资格赛'};
function Team({id,data}:{id:string;data:LiveView}){const team=data.teams.find(t=>t.id===id)!;return <span className={styles.identity}><TeamLogo teamId={id} src={team.logo} size={30}/><strong>{team.shortName}</strong></span>;}
function ProbabilityCard({team,nodes}:{team:LiveView['teams'][number];nodes:LiveView['nodes']}){
 const [selected,setSelected]=useState<number|null>(null);
 const first=team.points[0],latest=team.points.at(-1)!;
 const x=(i:number)=>48+i*280/Math.max(1,nodes.length-1),y=(p:number)=>142-p*112;
 return <article className={styles.probabilityCard} aria-labelledby={`team-${team.id}`} data-live-team={team.id}>
  <header className={styles.cardHeader}><TeamLogo teamId={team.id} src={team.logo} size={42}/><div><Link href={`/teams/${team.slug}`} id={`team-${team.id}`} className={styles.teamTitle}>{team.shortName}</Link><div className={styles.muted}>{team.region} · {team.name}</div></div><span className={team.status==='已淘汰'?styles.eliminated:styles.qualified}>{team.status}</span></header>
  <div className={styles.legend}>{curveEvents.map(e=><span key={e} className={styles[e]}><b aria-hidden="true">{e==='swiss'?'●':e==='knockout'?'■':'◆'}</b> {curveLabels[e]}</span>)}</div>
  <svg viewBox="0 0 368 184" className={styles.chart} role="group" aria-label={`${team.shortName} 概率变化，纵轴固定0至100%。折线仅连接历史快照。`}>
   {[0,0.5,1].map(p=><g key={p}><line x1="48" x2="328" y1={y(p)} y2={y(p)} className={styles.gridLine}/><text x="38" y={y(p)+4} textAnchor="end">{p*100}%</text></g>)}
   {curveEvents.map((e,k)=><g key={e} className={styles[e]} data-curve={e}>
    <polyline points={team.points.map((p,i)=>`${x(i)},${y(p.values[e].probability)}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={k===1?'6 3':k===2?'2 3':undefined}/>
    {team.points.map((p,i)=><g key={p.snapshotId} pointerEvents="none">{k===0?<circle cx={x(i)} cy={y(p.values[e].probability)} r="4" fill="currentColor"/>:k===1?<rect x={x(i)-4} y={y(p.values[e].probability)-4} width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2"/>:<path d={`M ${x(i)} ${y(p.values[e].probability)-5} l 5 5 -5 5 -5 -5 Z`} fill="none" stroke="currentColor" strokeWidth="2"/>}</g>)}
   </g>)}
   {nodes.map((node,i)=><g key={node.id}><text x={x(i)} y="174" textAnchor="middle">{node.label}</text><rect x={x(i)-19} y="15" width="38" height="139" fill="transparent" tabIndex={0} role="button" aria-label={`${team.shortName} ${node.label}：${curveEvents.map(e=>`${curveLabels[e]} ${(team.points[i].values[e].probability*100).toFixed(3)}%`).join('；')}`} aria-expanded={selected===i} onMouseEnter={()=>setSelected(i)} onClick={()=>setSelected(i)} onFocus={()=>setSelected(i)} onKeyDown={event=>{if(event.key==='Escape')setSelected(null);if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelected(i);}}} className={styles.pointTarget}/></g>)}
  </svg>
  {selected!==null&&<div className={styles.pointDetail} role="status"><strong>{nodes[selected].label}</strong> · {beijing(nodes[selected].asOf)} 北京时间{curveEvents.map(e=><div key={e}>{curveLabels[e]}：{(team.points[selected].values[e].probability*100).toFixed(3)}% <span>({team.points[selected].values[e].count.toLocaleString('en-US')} / {team.points[selected].simulationCount.toLocaleString('en-US')})</span></div>)}<button onClick={()=>setSelected(null)} aria-label="关闭数据点详情">收起 ×</button></div>}
  <div className={styles.muted}>相对{nodes[0].label}变化（pp）</div><div className={styles.numbers}>{curveEvents.map(e=>{const a=first.values[e],b=latest.values[e],delta=(b.count-a.count)*100/latest.simulationCount;return <div key={e}><span className={styles[e]}>{curveLabels[e]}</span><strong>{probabilityText(b.probability)}</strong><small>{nodes[0].label} {probabilityText(a.probability)}</small><small title={`${delta.toFixed(3)} 个百分点`}>{deltaText(delta)}</small></div>;})}</div>
 </article>;
}
export function LiveTournament({data}:{data:LiveView}){
 const [stage,setStage]=useState('PLAY_IN'),[region,setRegion]=useState('ALL');
 const filtered=visibleTeams(data.teams,region);
 return <main className={`shell ${styles.page}`}>
  <header className={styles.hero}><div className="eyebrow">WORLDS 2026 · TOURNAMENT TRACKER</div><h1>LIVE TOURNAMENT</h1><p>真实赛程与赛果 / 晋级概率演变</p><div className={styles.snapshotLabel}>入围赛结束 · 瑞士轮尚未开始</div><p className={styles.muted}>冻结历史快照 · 数据截止 2026年{beijing(data.asOf)}（北京时间）<br/>人工维护 · 非实时更新。</p></header>
  <section className={styles.section} aria-labelledby="matches-title"><header className={styles.sectionHeader}><span>01 /</span><h2 id="matches-title">MATCHES & RESULTS</h2></header>
   <div className={styles.filters} role="group" aria-label="赛事阶段">{[['PLAY_IN','PLAY-IN'],['SWISS','SWISS'],['KNOCKOUT','KNOCKOUT']].map(([id,label])=><button key={id} aria-pressed={stage===id} onClick={()=>setStage(id)}>{label}</button>)}</div>
   {data.matches.some(m=>m.time)&&<p className={styles.muted}>比赛时间：北京时间 · 计划开赛</p>}
   {stage==='PLAY_IN'&&<p className={styles.progress}>{data.teams.filter(t=>t.playIn).map(t=><span key={t.id}><b>{t.shortName}</b> · {t.status}</span>)}</p>}
   {stage==='SWISS'&&<p className={styles.muted}>ROUND 1 · 官方抽签对阵（非赛程顺序）<br/>赛段开幕：{beijing(data.stageStartsAt!)}（北京时间，非各场开赛时间）</p>}
   {stage==='KNOCKOUT'?<div className={styles.matchGrid}>{['四分之一决赛 / QUARTERFINALS','半决赛 / SEMIFINALS','总决赛 / FINAL'].map(label=><article className={styles.match} key={label}><div className="eyebrow">{label}</div><h3>TBD — TBD</h3><p className={styles.muted}>待确定晋级队伍与正式抽签 · 时间待定</p></article>)}</div>:<div className={styles.matchGrid}>{data.matches.filter(m=>m.stage===stage).map(m=><article className={styles.match} key={m.id} data-match={m.id}><div className={styles.matchMeta}><span>{positions[m.position]??`SWISS ROUND ${m.round}`} · BO{m.bestOf}</span><span>{m.status==='COMPLETED'?'✓ 已结束':'待开赛'}</span></div><div className={styles.matchTeams}><Team id={m.a} data={data}/><strong className={styles.score}>{m.scoreA===null?'VS':`${m.scoreA} — ${m.scoreB}`}</strong><Team id={m.b} data={data}/></div><div className={styles.muted}>{m.time?beijing(m.time):`时间待核实${m.stage==='PLAY_IN'?` · ${m.date}（赛事当地日期）`:''}`}</div>{m.winner&&<small className={styles.qualified}>{data.teams.find(t=>t.id===m.winner)!.shortName} 获胜</small>}</article>)}</div>}
   {stage==='SWISS'&&<p className={styles.pending}>ROUND 2–5 · 待抽签</p>}
   <details className={styles.sources}><summary>ⓘ 官方来源与历史快照说明</summary><p>事实截止：{beijing(data.asOf)} 北京时间 · 来源核查：{beijing(data.checkedAt)} 北京时间。未知逐场时间保持未核实，未开始比赛没有正式比分。当前签表与赛果不会自动更新。</p>{data.sources.map(s=><a key={s.id} href={s.url} target="_blank" rel="noreferrer">{s.name} ↗</a>)}</details>
  </section>
  <section className={styles.section} aria-labelledby="probability-title"><header className={styles.sectionHeader}><span>02 /</span><h2 id="probability-title">PROBABILITY EVOLUTION</h2></header><InfoDisclosure label="关于概率"><p>固定赛前 Riot GPR / Rating · S16-R1 正式赛制 · 每节点 100,000 次 Monte Carlo。</p><p>入围赛后节点锁定真实入围赛结果及 Swiss 首轮抽签；概率变化不代表 Rating 变化。</p><p>小幅变化可能包含抽样误差。折线仅连接已记录的历史快照，不代表每日连续观测；模型未声称经过历史校准。</p><Link href="/methodology">完整方法论 →</Link></InfoDisclosure>
   <div className={styles.filters} role="group" aria-label="按赛区筛选">{regions.map(r=><button key={r} onClick={()=>setRegion(r)} aria-pressed={region===r}>{r}</button>)}</div><p className={styles.muted} role="status">{filtered.length} 支队伍 · 按最新夺冠概率排序 · 变化单位：百分点（pp）</p>
   <div className={styles.probabilityGrid}>{filtered.map(team=><ProbabilityCard key={team.id} team={team} nodes={data.nodes}/>)}</div>
  </section>
 </main>;
}
