'use client';
import {createContext,useContext,useId,useState,type ReactNode} from 'react';
import type {Definition,Metric} from '../../lib/team-profile/statistics-types';
import styles from './statistics.module.css';

const InsightContext=createContext<{active:string|null;toggle:(id:string)=>void;close:()=>void}|null>(null);
export function InsightsGroup({children}:{children:ReactNode}){
 const [active,setActive]=useState<string|null>(null);
 return <InsightContext.Provider value={{active,toggle:id=>setActive(current=>current===id?null:id),close:()=>setActive(null)}}>{children}</InsightContext.Provider>;
}
const units:Record<string,string>={gold:'金币',percent:'百分比',seconds:'秒（显示为分:秒）','gold/min':'金币/分钟',cs:'补刀','damage/min':'伤害/分钟','deaths/game':'次/局','vision-score/min':'视野分/分钟',ratio:'倍'};
export function MetricInsights({label,definition,metric,sampleGames,region,scopeNote,snapshotDate,comparisonCount}:{label:string;definition:Definition;metric:Metric;sampleGames:number;region:string;scopeNote:string;snapshotDate:string;comparisonCount?:number}){
 const id=useId();const context=useContext(InsightContext)!;
 const mode=context.active===id+'-definition'?'definition':context.active===id+'-sample'?'sample':null;
 return <><div className={styles.label}><strong>{label}</strong><div className={styles.insightActions}>{(['definition','sample'] as const).map(kind=><button key={kind} type="button" aria-label={`${label}：${kind==='definition'?'定义':'样本量'}`} aria-expanded={mode===kind} aria-controls={id+'-panel'} onClick={()=>context.toggle(id+'-'+kind)} onKeyDown={e=>{if(e.key==='Escape')context.close();}}>ⓘ {kind==='definition'?'定义':'样本量'}</button>)}</div></div>
 {mode&&<div id={id+'-panel'} className={styles.insightPanel} role="region" aria-label={`${label}${mode==='definition'?'定义':'样本量'}`} onKeyDown={e=>{if(e.key==='Escape')context.close();}}>
 {mode==='definition'?<><p><strong>{definition.chineseName}</strong> · {definition.englishName}</p><p>{definition.explanationZh}</p><p className={styles.formula}>计算：{definition.formula}</p><p>单位：{units[definition.unit]??definition.unit}</p><p>方向：{definition.direction==='LOWER_BETTER'?'数值越低越好':definition.direction==='HIGHER_BETTER'?'数值越高，该项表现越突出；不等于综合实力更强':'描述风格差异，不代表综合实力排名'}</p><p>有效规则：{definition.validSampleRule}</p></>:<><dl className={styles.sampleFacts}><div><dt>实际出场</dt><dd>{sampleGames} 局{sampleGames<10?' · 小样本':''}</dd></div><div><dt>本项有效</dt><dd>{metric.validGames} 局</dd></div><div><dt>缺少字段</dt><dd>{metric.missingGames} 局</dd></div><div><dt>条件排除</dt><dd>{metric.excludedGames} 局</dd></div><div><dt>数据状态</dt><dd>{metric.coverageStatus}</dd></div>{comparisonCount!==undefined&&<div><dt>对比分布</dt><dd>{comparisonCount} 个真实观察点</dd></div>}<div><dt>统计范围</dt><dd>{region} 最后国内赛段</dd></div><div><dt>数据快照</dt><dd>{snapshotDate}</dd></div></dl><p>{scopeNote}</p>{metric.excludedGames>0&&<p>排除局未满足有效样本规则：{definition.validSampleRule}</p>}{metric.missingGames>0&&<p>缺少必要字段的比赛未参与本项计算，不以 0 补值。</p>}<p>来源：{metric.source.map((url,i)=><span key={url}>{i?' · ':''}<a href={url} target="_blank" rel="noopener noreferrer">{url.includes('oracleselixir')?"Oracle’s Elixir":'Games of Legends'}</a></span>)}</p></>}
 </div>}</>;
}
