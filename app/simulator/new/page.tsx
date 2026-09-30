'use client';
import {useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {teams,teamById} from '../../../lib/sim/data';
import {createSession} from '../../../lib/sim/engine';
import {defaultTierList,generateRatingsFromTierList,seriesProbability,gameProbability,SystemRatingProvider,validateTierList} from '../../../lib/sim/ratings';
import {runMonteCarloFromState} from '../../../lib/sim/monteCarlo';
import {worlds2026} from '../../../lib/sim/worlds2026';
import {riotGprSnapshot} from '../../../lib/sim/gprSnapshot';
import {SIMULATION_COUNTS,formatProbability} from '../../../lib/sim/oddsConfig';
import type {StrengthSource,Tier,TierList} from '../../../lib/sim/types';
import {TeamIdentity,RegionBadge} from '../../../components/tournament/team-identity';
import {ProbabilityBar} from '../../../components/tournament/probability-bar';

const tiers:Tier[]=['S','A','B','C','D'];
export default function NewSimulation(){
 const router=useRouter();
 const [source,setSource]=useState<StrengthSource>('SYSTEM_MODEL');
 const [tierList,setTierList]=useState<TierList>(defaultTierList);
 const [error,setError]=useState('');
 const [dragged,setDragged]=useState<string|null>(null);
 const [preview,setPreview]=useState<Record<string,number>|null>(null);
 const ratings=useMemo(()=>source==='SYSTEM_MODEL'?new SystemRatingProvider().getRatings():generateRatingsFromTierList(tierList),[source,tierList]);
 const sorted=useMemo(()=>[...teams].sort((a,b)=>ratings[b.id]-ratings[a.id]),[ratings]);
 function move(id:string,tier:Tier,index?:number){setTierList(prev=>{const next:TierList={S:[...prev.S],A:[...prev.A],B:[...prev.B],C:[...prev.C],D:[...prev.D]};for(const k of tiers)next[k]=next[k].filter(x=>x!==id);next[tier].splice(index??next[tier].length,0,id);return next});setPreview(null)}
 function start(){const err=validateTierList(tierList);if(source==='CUSTOM_TIER_LIST'&&err){setError(err);return}const session=createSession(source,ratings,source==='CUSTOM_TIER_LIST'?tierList:undefined);localStorage.setItem('worlds2026-session',JSON.stringify(session));router.push('/simulator')}
 function odds(){setError('');try{const session=createSession(source,ratings,source==='CUSTOM_TIER_LIST'?tierList:undefined,12345);setPreview(runMonteCarloFromState(session,SIMULATION_COUNTS.preview,27182).probabilities)}catch(e){setError(e instanceof Error?e.message:'无法计算概率')}}
 return <main className="shell"><div className="page-head"><div><div className="eyebrow">开始模拟</div><h1>创建你的世界赛</h1><p>系统模型使用 Riot GPR；也可以自己调整队伍实力。开始后，本局会沿用你的选择。</p></div></div><div className="tabs"><button className={`tab ${source==='SYSTEM_MODEL'?'active':''}`} onClick={()=>{setSource('SYSTEM_MODEL');setPreview(null)}}>系统模型</button><button className={`tab ${source==='CUSTOM_TIER_LIST'?'active':''}`} onClick={()=>{setSource('CUSTOM_TIER_LIST');setPreview(null)}}>自己调整实力</button></div><div style={{height:18}}/>
 {source==='SYSTEM_MODEL'?<div className="grid grid-2"><section className="panel"><div className="eyebrow">SYSTEM MODEL · RIOT GPR</div><h2>系统模型</h2><p className="muted">Riot GPR 提供已确认队伍的实力分数；比赛和夺冠概率由本站模型计算。未确定队伍的席位使用回退评分。</p><p className="fine">GPR 快照：{riotGprSnapshot.sourceUpdatedAt} · 模型：{worlds2026.modelVersion}</p></section><section className="panel"><h2>评分预览</h2>{sorted.slice(0,5).map((t,i)=><div className="leader" key={t.id}><span className="home-team-leader"><span className="rank-num">{i+1}</span><TeamIdentity teamId={t.id} size={32}/></span><b className="accent">{ratings[t.id].toFixed(1)}</b></div>)}</section></div>:<><div className="section-title"><h2>调整 19 支队伍的实力</h2><div className="action-row"><button className="button small ghost" onClick={()=>{setTierList(defaultTierList());setPreview(null)}}>恢复默认排序</button></div></div><p className="fine">拖动队伍调整等级和顺序，或用右侧菜单移动。排得越靠前，评分越高。</p><div className="tier-grid">{tiers.map(tier=><div className="tier-col" key={tier} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();if(dragged)move(dragged,tier);setDragged(null)}}><h3>{tier} 级</h3>{tierList[tier].map((id,index)=><div key={id} draggable onDragStart={()=>setDragged(id)} onDragEnd={()=>setDragged(null)} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.stopPropagation();event.preventDefault();if(dragged)move(dragged,tier,index);setDragged(null)}} className="team-chip"><span className="tier-chip-details"><TeamIdentity teamId={id} size={30} showName showRegion={false}/></span><span className="tier-chip-meta"><RegionBadge region={teamById(id)?.region}/><span className="tier-chip-rating">{ratings[id]}</span></span><select aria-label={`移动 ${id} 到等级`} value={tier} onChange={event=>move(id,event.target.value as Tier)}>{tiers.map(t=><option key={t} value={t}>{t}</option>)}</select></div>)}</div>)}</div><div className="section-title"><h2>实力预览</h2><button className="button small secondary" onClick={odds}>计算夺冠概率</button></div><div className="panel" style={{overflowX:'auto'}}><table className="data-table"><thead><tr><th>队伍</th><th>等级</th><th>你的评分</th><th>对榜首胜率（1/3/5局）</th><th>夺冠概率</th></tr></thead><tbody>{sorted.map(team=>{const probability=gameProbability(ratings[team.id],ratings[sorted[0].id]);return <tr key={team.id}><td><TeamIdentity teamId={team.id} size={30} showRegion={false}/></td><td>{tiers.find(tier=>tierList[tier].includes(team.id))}</td><td className="accent">{ratings[team.id]}</td><td>{[1,3,5].map(format=>Math.round(seriesProbability(probability,format as 1|3|5)*100)+'%').join(' / ')}</td><td className="rank-prob-cell"><strong>{preview?formatProbability(preview[team.id]??0):'—'}</strong>{preview&&<ProbabilityBar a={preview[team.id]??0}/>}</td></tr>})}</tbody></table></div><p className="fine">预览会按你的排序模拟 {SIMULATION_COUNTS.preview.toLocaleString('en-US')} 次；正式比赛胜率完全使用自定义评分。</p></>}
 {error&&<p role="alert" className="notice">{error}</p>}<div className="action-row" style={{marginTop:25}}><button className="button" onClick={start}>开始模拟 →</button><span className="fine">你可以手动选比分，也可以模拟剩余比赛。</span></div></main>;
}
