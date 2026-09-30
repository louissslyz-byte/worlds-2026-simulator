'use client';
import {useState} from 'react';
import {TeamIdentity} from './team-identity';
import {StatusBadge} from './status-badge';
import {ProbabilityBar} from './probability-bar';
import {teamById} from '../../lib/sim/data';
import type {Match,StrengthSource} from '../../lib/sim/types';
import {worlds2026} from '../../lib/sim/worlds2026';

type Props={match:Match|null;label?:string;interactive?:boolean;onPick?:(winner:string,a:number,b:number)=>void;onClear?:()=>void;animationIndex?:number;compact?:boolean;strengthSource?:StrengthSource;systemModelVersion?:string;ratings?:Record<string,number>};
function scoreOptions(m:Match){const need=(m.format+1)/2;const values:{winner:string;a:number;b:number;label:string}[]=[];for(let loser=0;loser<need;loser++)values.push({winner:m.teamA,a:need,b:loser,label:`${m.teamA} ${need}-${loser}`});for(let loser=need-1;loser>=0;loser--)values.push({winner:m.teamB,a:loser,b:need,label:`${m.teamB} ${need}-${loser}`});return values}
export function MatchCard({match:m,label,interactive=false,onPick,onClear,animationIndex=0,compact=false,strengthSource,systemModelVersion,ratings}:Props){
 const [picksOpen,setPicksOpen]=useState(false);
 const decided=m?.status==='COMPLETE';
 const winner=m?.winner;
 const canEdit=Boolean(interactive&&m&&!m.locked&&m.resultSource!=='OFFICIAL');
 const isGprModel=strengthSource==='SYSTEM_MODEL'&&systemModelVersion===worlds2026.modelVersion;
 const strength=(id:string|undefined)=>{if(!id||!ratings)return null;const team=teamById(id);return isGprModel&&team?.officialGprScore?`GPR #${team.officialGprRank} · ${team.officialGprScore}`:strengthSource==='CUSTOM_TIER_LIST'?'自定义实力':'GPR 暂无 · 回退模型'};
 return <article className={`tournament-match ${compact?'compact':''} ${decided?'is-decided result-reveal':''}`} style={{animationDelay:`${animationIndex*45}ms`}}>
  <div className="match-topline"><span>{label??m?.label??'对阵待定'} {m&&<span className="match-format">BO{m.format}</span>}</span><span className="match-badges">{strengthSource&&!compact&&<span className="model-source-badge">{strengthSource==='SYSTEM_MODEL'?(isGprModel?'系统 GPR':'旧版模型'):'自定义'}</span>}<StatusBadge match={m}/></span></div>
  <div className="match-teams"><div className={`match-team-row ${decided&&winner===m?.teamA?'is-winner':''} ${decided&&winner!==m?.teamA?'is-loser':''}`}><span className="match-identity-wrap"><TeamIdentity teamId={m?.teamA} size={compact?30:38} showRegion={!compact}/>{!compact&&<small className="match-strength">{strength(m?.teamA)}</small>}</span><div className="match-team-outcome">{m&&<small>{Math.round(m.modelProbabilityA*100)}%</small>}<b>{decided?m?.scoreA:'—'}</b></div></div><div className="match-divider"/><div className={`match-team-row ${decided&&winner===m?.teamB?'is-winner':''} ${decided&&winner!==m?.teamB?'is-loser':''}`}><span className="match-identity-wrap"><TeamIdentity teamId={m?.teamB} size={compact?30:38} showRegion={!compact}/>{!compact&&<small className="match-strength">{strength(m?.teamB)}</small>}</span><div className="match-team-outcome">{m&&<small>{Math.round(m.modelProbabilityB*100)}%</small>}<b>{decided?m?.scoreB:'—'}</b></div></div></div>
  {m&&!compact&&<ProbabilityBar a={m.modelProbabilityA} b={m.modelProbabilityB}/>}
  {canEdit&&!compact&&<div className="match-controls"><button type="button" className="pick-toggle" onClick={()=>setPicksOpen(o=>!o)} aria-expanded={picksOpen}>{picksOpen?'收起比分选择':m?.resultSource==='MANUAL'?'修改手动比分':'手动选择比分'} <span aria-hidden="true">{picksOpen?'−':'+'}</span></button>{m?.resultSource&&<button type="button" className="clear-pick" onClick={onClear}>清除结果</button>}{picksOpen&&<div className="score-options">{scoreOptions(m!).map(o=><button key={o.label} type="button" className={m?.resultSource==='MANUAL'&&m.scoreA===o.a&&m.scoreB===o.b?'selected':''} onClick={()=>{onPick?.(o.winner,o.a,o.b);setPicksOpen(false)}}>{o.label}</button>)}</div>}</div>}
 </article>;
}
