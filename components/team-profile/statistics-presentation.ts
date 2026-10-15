import type {Coverage,Draft} from '../../lib/team-profile/statistics-types';

// Presentation only: subtract the existing baseline; never derive a new baseline.
export function baselineDifference(metric:string,value:number|null,mean:number|null,status:Coverage):string|null{
 if(value===null||mean===null||!Number.isFinite(value)||!Number.isFinite(mean))return null;
 const reference=status==='COMPLETE'?'赛区均值':'已收录样本均值';
 const difference=value-mean;
 if(difference===0)return `与${reference}相同`;
 const places=metric.endsWith('Pct')||metric==='csd15'?1:metric==='vspm'||metric==='deathsPerGame'||metric==='damageConversion'?2:0;
 const magnitude=Number(Math.abs(difference).toFixed(places));
 const unit=metric.endsWith('Pct')?'个百分点':metric==='durationSeconds'?'秒':metric==='gpm'?'金币/分钟':metric==='gd15'?'金币':metric==='csd15'?'补刀':metric==='dpm'?'伤害/分钟':metric==='deathsPerGame'?'次/局':metric==='vspm'?'视野分/分钟':'倍';
 if(magnitude===0)return `与${reference}接近（差异不足 ${10**-places} ${unit}）`;
 const amount=metric==='durationSeconds'&&magnitude>=60?`${Math.floor(magnitude/60)} 分${magnitude%60?` ${magnitude%60} 秒`:''}`:`${magnitude.toLocaleString('en-US',{maximumFractionDigits:places})} ${unit}`;
 return `${difference>0?'高于':'低于'}${reference} ${amount}`;
}

export function draftSampleRows(draft:Draft){
 return [
  {key:'mostPicked',label:'Pick统计',...draft.mostPicked},
  {key:'mostBanned',label:'本队Ban统计',...draft.mostBanned},
  {key:'mostBannedAgainst',label:'对手Ban统计',...draft.mostBannedAgainst},
  ...Object.entries(draft.combinations).map(([key,section])=>({key,label:section.roles.map(role=>({MID:'中路',JUNGLE:'打野',BOT:'下路',SUPPORT:'辅助',TOP:'上路'}[role]??role)).join('＋')+'组合',...section})),
 ];
}

export function draftCoverageStatus(draft:Draft):Coverage{
 const rows=draftSampleRows(draft);
 return rows.every(row=>row.coverageStatus==='COMPLETE')?'COMPLETE':rows.every(row=>row.coverageStatus==='UNAVAILABLE')?'UNAVAILABLE':'PARTIAL';
}
