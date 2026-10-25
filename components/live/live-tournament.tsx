'use client';
import {InfoDisclosure} from '../ui/info-disclosure';
import {useEffect,useLayoutEffect,useRef,useState,type PointerEvent,type Dispatch,type SetStateAction} from 'react';
import {createPortal} from 'react-dom';
import {nearestChartHit,preciseProbability,tooltipPosition,timelineLabel,chartGeometry,lastVisibleNode} from './chart-interaction';
import Link from 'next/link';
import {TeamLogo} from '../tournament/team-logo';
import {curveEvents,curveLabels,regions,probabilityText,deltaText,visibleTeams,type LiveView} from '../../lib/live/view';
import styles from './live.module.css';
const beijing=(value:string)=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));
const positions:Record<string,string>={UPPER_SEMIFINAL_1:'胜者组首轮',UPPER_SEMIFINAL_2:'胜者组首轮',UPPER_FINAL:'胜者组决赛',LOWER_SEMIFINAL:'败者组首轮',LOWER_FINAL:'败者组决赛',QUALIFICATION_FINAL:'最终资格赛'};
function Team({id,data}:{id:string;data:LiveView}){const team=data.teams.find(t=>t.id===id)!;return <span className={styles.identity}><TeamLogo teamId={id} src={team.logo} size={30}/><strong>{team.shortName}</strong></span>;}
type TooltipData={key:string;label:string;event:typeof curveEvents[number];probability:number;eliminated:boolean;x:number;y:number;anchor?:SVGCircleElement};
function ProbabilityTooltip({data}:{data:TooltipData}){
 const ref=useRef<HTMLDivElement>(null);
 const [position,setPosition]=useState<{left:number;top:number}|null>(null);
 useLayoutEffect(()=>{const box=ref.current?.getBoundingClientRect();if(box)setPosition(tooltipPosition(data.x,data.y,box.width,box.height,window.innerWidth,window.innerHeight));},[data]);
 return createPortal(<div ref={ref} id="live-probability-tooltip" role="tooltip" className={styles.probabilityTooltip} style={{left:position?.left??0,top:position?.top??0,visibility:position?'visible':'hidden'}}><strong>{data.label}{data.eliminated?' · 已淘汰':''}</strong><div className={styles[data.event]}>{curveLabels[data.event]} · <b>{preciseProbability(data.probability)}</b></div></div>,document.body);
}
export function NodeProbabilityDetail({id,teamLabel,nodeLabel,values,onClose}:{id:string;teamLabel:string;nodeLabel:string;values:LiveView['teams'][number]['points'][number]['values'];onClose:()=>void}){
 return <div id={id} className={styles.pointDetail} role="region" aria-label={`${teamLabel} ${nodeLabel}概率详情`}><div className={styles.detailHeader}><strong>{nodeLabel}</strong><button onClick={onClose} aria-label="关闭数据点详情">×</button></div>{curveEvents.map(e=><div className={styles.detailRow} key={e}><span className={styles[e]}>{curveLabels[e]}</span><b>{preciseProbability(values[e].probability)}</b></div>)}</div>;
}
function ProbabilityCard({team,nodes,tooltip,onTooltip}:{team:LiveView['teams'][number];nodes:LiveView['nodes'];tooltip:TooltipData|null;onTooltip:Dispatch<SetStateAction<TooltipData|null>>}){
 const [selected,setSelected]=useState<number|null>(null);
 const pointTargets=useRef<(SVGCircleElement|null)[]>([]),trigger=useRef(0),suppressFocus=useRef(false);
 const detailId=`live-detail-${team.id}`;
 const closeDetail=()=>{onTooltip(null);setSelected(null);suppressFocus.current=true;pointTargets.current[trigger.current]?.focus();suppressFocus.current=false;};
 const toggleDetail=(i:number,e:number)=>{onTooltip(null);trigger.current=i*3+e;setSelected(current=>current===i?null:i);};
 const first=team.points[0],latest=team.points.at(-1)!;
 const sampledZero=(i:number,e:typeof curveEvents[number])=>team.points[i].values[e].count===0&&!(i>0&&team.status==='已淘汰');
 const {width:chartWidth,x}=chartGeometry(nodes.length);
 const lastNode=lastVisibleNode(nodes.length,team.eliminationNodeIndex);
 const visiblePoints=team.points.slice(0,lastNode+1);
 const y=(p:number)=>112-p*88;
 const showPoint=(i:number,e:number,clientX:number,clientY:number,anchor?:SVGCircleElement)=>onTooltip({key:`${team.id}-${i}-${e}`,label:nodes[i].label,eliminated:i===team.eliminationNodeIndex,event:curveEvents[e],probability:team.points[i].values[curveEvents[e]].probability,x:clientX,y:clientY,anchor});
 const hoverPoint=(event:PointerEvent<SVGSVGElement>)=>{
  if(event.pointerType==='touch')return;
  // Auto-scroll can emit a stationary pointer move; preserve the keyboard's active point.
  if(event.movementX===0&&event.movementY===0&&document.activeElement?.hasAttribute('data-point-event'))return;
  const matrix=event.currentTarget.getScreenCTM();if(!matrix)return;
  const points=nodes.slice(0,lastNode+1).flatMap((_,i)=>curveEvents.map((e,j)=>{const point=new DOMPoint(x(i),y(team.points[i].values[e].probability)).matrixTransform(matrix);return {node:i,event:j,x:point.x,y:point.y};}));
  const hit=nearestChartHit(points,event.clientX,event.clientY);
  if(hit)showPoint(hit.node,hit.event,event.clientX,event.clientY);else onTooltip(current=>current?.anchor?current:null);
 };
 return <article className={styles.probabilityCard} aria-labelledby={`team-${team.id}`} data-live-team={team.id} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();if(selected!==null)closeDetail();else onTooltip(null);}}}>
  <header className={styles.cardHeader}><TeamLogo teamId={team.id} src={team.logo} size={42}/><div><Link href={`/teams/${team.slug}`} id={`team-${team.id}`} className={styles.teamTitle}>{team.shortName}</Link><div className={styles.muted}>{team.region} · {team.name}</div></div><span className={team.status==='已淘汰'?styles.eliminated:styles.qualified}>{team.status}</span></header>
  <div className={styles.legend}>{curveEvents.map(e=><span key={e} className={styles[e]}><b aria-hidden="true">●</b> {curveLabels[e]}</span>)}</div>
  <div className={styles.chartViewport} tabIndex={nodes.length>2?0:undefined} role={nodes.length>2?"region":undefined} aria-label={nodes.length>2?`${team.shortName} 历史节点，可横向滚动`:undefined}><svg viewBox={`0 0 ${chartWidth} 144`} style={nodes.length>2?{minWidth:chartWidth}:undefined} className={styles.chart} role="group" aria-label={`${team.shortName} 概率变化，纵轴固定0至100%。折线仅连接历史快照。`} onPointerMove={hoverPoint} onPointerLeave={()=>onTooltip(current=>current?.anchor?current:null)} onPointerCancel={()=>onTooltip(null)}>
   {[0,0.5,1].map(p=><g key={p}><line x1="44" x2={chartWidth-24} y1={y(p)} y2={y(p)} className={styles.gridLine}/><text x="36" y={y(p)+4} textAnchor="end">{p*100}%</text></g>)}
   {team.eliminationNodeIndex!==null&&<g className={styles.eliminationMarker} pointerEvents="none" data-elimination-node={lastNode}><line x1={x(lastNode)} x2={x(lastNode)} y1="20" y2="117"/><text x={x(lastNode)} y="13" textAnchor="middle">已淘汰</text></g>}
   {curveEvents.map(e=><g key={e} className={styles[e]} data-curve={e}>
    <polyline points={visiblePoints.map((p,i)=>`${x(i)},${y(p.values[e].probability)}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="2"/>
    {visiblePoints.map((p,i)=><circle key={p.snapshotId} pointerEvents="none" cx={x(i)} cy={y(p.values[e].probability)} r="4" fill="currentColor"/>)}
   </g>)}
   {nodes.map((node,i)=><g key={node.id}><text x={x(i)} y="136" textAnchor={i===0?"start":i===nodes.length-1?"end":"middle"}>{timelineLabel(node)}</text>{i<=lastNode&&curveEvents.map((e,j)=><circle key={e} ref={target=>{pointTargets.current[i*3+j]=target;}} data-point-node={i} data-point-event={e} cx={x(i)} cy={y(team.points[i].values[e].probability)} r="10" fill="transparent" tabIndex={0} role="button" aria-label={`${team.shortName} ${node.label} ${curveLabels[e]} ${preciseProbability(team.points[i].values[e].probability)}${i===team.eliminationNodeIndex?' · 已淘汰':''}`} aria-expanded={selected===i} aria-controls={selected===i?detailId:undefined} aria-describedby={tooltip?.key===`${team.id}-${i}-${j}`?'live-probability-tooltip':undefined} onClick={()=>toggleDetail(i,j)} onFocus={event=>{if(suppressFocus.current)return;const rect=event.currentTarget.getBoundingClientRect();showPoint(i,j,rect.right,rect.top,event.currentTarget);}} onBlur={()=>onTooltip(current=>current?.key===`${team.id}-${i}-${j}`?null:current)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleDetail(i,j);}}} className={styles.pointTarget}/>)}</g>)}
  </svg></div>
  {selected!==null&&<NodeProbabilityDetail id={detailId} teamLabel={team.shortName} nodeLabel={nodes[selected].label} values={team.points[selected].values} onClose={closeDetail}/>}
  <div className={styles.comparison}><span>当前：{nodes.at(-1)!.label}</span><span>相对{nodes[0].label}变化（pp）</span></div><div className={styles.numbers}>{curveEvents.map(e=>{const a=first.values[e],b=latest.values[e],delta=(b.count-a.count)*100/latest.simulationCount;return <div key={e}><span className={styles[e]}>{curveLabels[e]}</span><strong title={sampledZero(team.points.length-1,e)?'100,000次样本未抽中，不代表理论上不可能':undefined}>{probabilityText(b.probability)}{sampledZero(team.points.length-1,e)?'*':''}</strong><small>{nodes[0].label} {probabilityText(a.probability)}</small><small title={`${delta.toFixed(3)} 个百分点`}>{deltaText(delta)}</small></div>;})}</div>
 </article>;
}
export function LiveTournament({data}:{data:LiveView}){
 const [stage,setStage]=useState('PLAY_IN'),[region,setRegion]=useState('ALL');
 const [tooltip,setTooltip]=useState<TooltipData|null>(null);
 useEffect(()=>{
  const clear=()=>setTooltip(null);
  const onScroll=()=>setTooltip(current=>{if(!current?.anchor?.isConnected)return null;const rect=current.anchor.getBoundingClientRect();return {...current,x:rect.right,y:rect.top};});
  window.addEventListener('scroll',onScroll,true);window.addEventListener('resize',clear);
  return()=>{window.removeEventListener('scroll',onScroll,true);window.removeEventListener('resize',clear);};
 },[]);
 const filtered=visibleTeams(data.teams,region);
 return <main className={`shell ${styles.page}`}>
  <header className={styles.hero}><div className="eyebrow">WORLDS 2026 · TOURNAMENT TRACKER</div><h1>LIVE TOURNAMENT</h1><p>真实赛程与赛果 / 晋级概率演变</p><div className={styles.snapshotLabel}>{data.phaseLabel}</div><p className={styles.muted}>冻结历史快照 · 数据截止 2026年{beijing(data.asOf)}（北京时间）<br/>人工维护 · 非实时更新。</p></header>
  <section className={styles.section} aria-labelledby="matches-title"><header className={styles.sectionHeader}><span>01 /</span><h2 id="matches-title">MATCHES & RESULTS</h2></header>
   <div className={styles.filters} role="group" aria-label="赛事阶段">{[['PLAY_IN','PLAY-IN'],['SWISS','SWISS'],['KNOCKOUT','KNOCKOUT']].map(([id,label])=><button key={id} aria-pressed={stage===id} onClick={()=>setStage(id)}>{label}</button>)}</div>
   {data.matches.some(m=>m.time)&&<p className={styles.muted}>比赛时间：北京时间 · 计划开赛</p>}
   {stage==='PLAY_IN'&&<p className={styles.progress}>{data.teams.filter(t=>t.playIn).map(t=><span key={t.id}><b>{t.shortName}</b> · {t.status}</span>)}</p>}
   {stage==='SWISS'&&<p className={styles.muted}>{data.swissLabel}<br/>赛段开幕：{beijing(data.stageStartsAt!)}（北京时间，非各场开赛时间）</p>}
   {stage==='KNOCKOUT'?<div className={styles.matchGrid}>{['四分之一决赛 / QUARTERFINALS','半决赛 / SEMIFINALS','总决赛 / FINAL'].map(label=><article className={styles.match} key={label}><div className="eyebrow">{label}</div><h3>TBD — TBD</h3><p className={styles.muted}>待确定晋级队伍与正式抽签 · 时间待定</p></article>)}</div>:<div className={styles.matchGrid}>{data.matches.filter(m=>m.stage===stage).map(m=><article className={styles.match} key={m.id} data-match={m.id}><div className={styles.matchMeta}><span>{positions[m.position]??`SWISS ROUND ${m.round}`} · BO{m.bestOf}</span><span>{m.status==='COMPLETED'?'✓ 已结束':'待开赛'}</span></div><div className={styles.matchTeams}><Team id={m.a} data={data}/><strong className={styles.score}>{m.scoreA===null?'VS':`${m.scoreA} — ${m.scoreB}`}</strong><Team id={m.b} data={data}/></div><div className={styles.muted}>{m.time?beijing(m.time):`时间待核实${m.stage==='PLAY_IN'?` · ${m.date}（赛事当地日期）`:''}`}</div>{m.winner&&<small className={styles.qualified}>{data.teams.find(t=>t.id===m.winner)!.shortName} 获胜</small>}</article>)}</div>}
   {stage==='SWISS'&&<p className={styles.pending}>{data.pendingLabel}</p>}
   <details className={styles.sources}><summary>ⓘ 官方来源与历史快照说明</summary><p>事实截止：{beijing(data.asOf)} 北京时间 · 来源核查：{beijing(data.checkedAt)} 北京时间。未知逐场时间保持未核实，未开始比赛没有正式比分。当前签表与赛果不会自动更新。</p>{data.sources.map(s=><a key={s.id} href={s.url} target="_blank" rel="noreferrer">{s.name} ↗</a>)}</details>
  </section>
  <section className={styles.section} aria-labelledby="probability-title"><header className={styles.sectionHeader}><span>02 /</span><h2 id="probability-title">PROBABILITY EVOLUTION</h2></header><InfoDisclosure label="关于概率"><p>固定赛前 Riot GPR / Rating · S16-R1 正式赛制 · 每节点 100,000 次 Monte Carlo。</p><p>入围赛后节点锁定真实入围赛结果及 Swiss 首轮抽签；首轮后节点另锁定真实首轮赛果及第二轮抽签；第二轮后节点另锁定真实第二轮赛果及第三轮抽签。概率变化不代表 Rating 变化。</p><p>小幅变化可能包含抽样误差；0%＊表示本批样本未抽中，不代表理论上不可能。折线仅连接已记录的历史快照，不代表每日连续观测；模型未声称经过历史校准。</p><Link href="/methodology">完整方法论 →</Link></InfoDisclosure>
   <div className={styles.filters} role="group" aria-label="按赛区筛选">{regions.map(r=><button key={r} onClick={()=>{setTooltip(null);setRegion(r);}} aria-pressed={region===r}>{r}</button>)}</div><p className={styles.muted} role="status">{filtered.length} 支队伍 · 按最新夺冠概率排序 · 变化单位：百分点（pp）</p>
   <div className={styles.probabilityGrid}>{filtered.map(team=><ProbabilityCard key={team.id} team={team} nodes={data.nodes} tooltip={tooltip} onTooltip={setTooltip}/>)}</div>
  </section>
  {tooltip&&<ProbabilityTooltip data={tooltip}/>}
 </main>;
}
