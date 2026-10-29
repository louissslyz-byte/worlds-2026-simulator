'use client';
import {useEffect,useRef,useState} from 'react';
import type {Baseline} from '../../lib/team-profile/statistics-types';
import {formatMetric} from '../../lib/team-profile/statistics-types';
import {baselineDifference} from './statistics-presentation';
import styles from './statistics.module.css';
export function DistributionChart({baseline,metric,value,ownLabel,validGames,ownIdentity,showDifference=false}:{baseline:Baseline;metric:string;value:number|null;ownLabel:string;validGames:number;ownIdentity?:{teamId:string;playerId:string};showDifference?:boolean}){
 const [selected,setSelected]=useState<number|'own'|null>(null);
 const svg=useRef<SVGSVGElement>(null);const [width,setWidth]=useState(320);
 useEffect(()=>{const node=svg.current;if(!node)return;const observer=new ResizeObserver(entries=>{const actual=entries[0]?.contentRect.width;if(actual>0)setWidth(actual);});observer.observe(node);return ()=>observer.disconnect();},[]);
 const values=baseline.distribution.map(p=>p.value);
 // Only remove the current player's duplicate marker; keep the full distribution for all statistics.
 const otherPoints=baseline.distribution.map((p,i)=>({p,i})).filter(({p})=>!ownIdentity||p.teamId!==ownIdentity.teamId||![p.playerId,p.displayName].some(name=>name?.toLocaleLowerCase()===ownIdentity.playerId.toLocaleLowerCase()));
 if(value===null)return null;
 if(!values.length)return <p className={styles.note}>暂无有效对比数据</p>;
 const mean=baseline.value;const min=Math.min(...values,...(mean===null?[]:[mean]),value);const max=Math.max(...values,...(mean===null?[]:[mean]),value);
 const pos=(n:number)=>max===min?width/2:12+(n-min)/(max-min)*(width-24);
 const meanLabel=baseline.coverageStatus==='COMPLETE'?'赛区平均':'已收录样本均值';
 const difference=showDifference?baselineDifference(metric,value,mean,baseline.coverageStatus):null;
 const point=typeof selected==='number'?baseline.distribution[selected]:null;
 const pointText=point?`${point.teamId} ${point.displayName??point.playerId??''} · ${formatMetric(metric,point.value)} · ${point.validGames} 局有效${point.lowSample?' · 小样本':''}`:selected==='own'?`${ownLabel} · ${formatMetric(metric,value)} · ${validGames} 局有效${validGames<10?' · 小样本':''}`:null;
 return <><svg ref={svg} className={styles.chart} viewBox={`0 0 ${width} 60`} onClick={event=>{const rect=event.currentTarget.getBoundingClientRect();const x=(event.clientX-rect.left)*width/rect.width;const y=(event.clientY-rect.top)*60/rect.height;const candidates=[{key:'own' as const,x:pos(value),y:29},...otherPoints.map(({p,i})=>({key:i,x:pos(p.value),y:29+(i%3-1)*7}))];const nearest=candidates.reduce((a,b)=>(a.x-x)**2+(a.y-y)**2<=(b.x-x)**2+(b.y-y)**2?a:b);setSelected(current=>current===nearest.key?null:nearest.key);}} role="group" aria-label={`${ownLabel} ${formatMetric(metric,value)}，${meanLabel} ${formatMetric(metric,mean)}。点击或键盘选择真实观察点。`}>
 <desc>点位纵向错开以减少重叠，横轴数值比例不变。聚焦后用Enter或空格查看样本，用Escape清除。</desc><line x1="12" y1="29" x2={width-12} y2="29"/>{baseline.distributionSummary.p25!==null&&baseline.distributionSummary.p75!==null&&<line className={styles.quartile} x1={pos(baseline.distributionSummary.p25)} y1="29" x2={pos(baseline.distributionSummary.p75)} y2="29"/>}
 {otherPoints.map(({p,i})=>{const y=29+(i%3-1)*7;const text=`${p.teamId} ${p.displayName??p.playerId??''}：${formatMetric(metric,p.value)}，${p.validGames} 局有效${p.lowSample?'，小样本':''}`;return <g key={`${p.teamId}-${p.playerId}-${i}`} role="button" tabIndex={0} aria-label={text} aria-pressed={selected===i} className={styles.point} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(i);}if(e.key==='Escape')setSelected(null);}}><title>{text}</title><rect x={pos(p.value)-11} y={y-11} width="22" height="22" fill="transparent"/><circle cx={pos(p.value)} cy={y} r={selected===i?5:3.5}/></g>;})}
 {mean!==null&&<line className={styles.mean} x1={pos(mean)} y1="7" x2={pos(mean)} y2="51"/>}<g role="button" tabIndex={0} aria-label={`${ownLabel}：${formatMetric(metric,value)}，${validGames} 局有效`} aria-pressed={selected==='own'} className={styles.point} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected('own');}if(e.key==='Escape')setSelected(null);}}><rect x={pos(value)-12} y="17" width="24" height="24" fill="transparent"/><circle className={styles.own} cx={pos(value)} cy="29" r="7"/></g></svg>
 <div className={styles.axis}><span>{formatMetric(metric,min)}</span><span>{formatMetric(metric,max)}</span></div><p className={styles.reference} data-reference-kind={difference?'difference':'mean'}>{difference??<>{meanLabel}：<strong>{formatMetric(metric,mean)}</strong></>}</p>{pointText&&<output className={styles.pointOutput} aria-live="polite">{pointText}</output>}</>;
}
export function DistributionLegend({player=false}:{player?:boolean}){return <div className={styles.legend}><span><i className={styles.legendOwn}/>当前{player?'选手':'战队'}</span><span><i className={styles.legendOther}/>其他{player?'选手':'战队'}</span><span><i className={styles.legendMean}/>样本均值</span><span><i className={styles.legendRange}/>25–75% 分位范围</span></div>;}
