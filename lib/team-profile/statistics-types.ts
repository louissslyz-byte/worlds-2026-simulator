export type Coverage='COMPLETE'|'PARTIAL'|'UNAVAILABLE';
export type Metric={value:number|null;validGames:number;eligibleGames:number;excludedGames:number;missingGames:number;coverageStatus:Coverage;source:string[];definitionVersion:string};
export type Definition={id:string;chineseName:string;englishName:string;unit:string;formula:string;explanationZh:string;validSampleRule:string;direction:string};
export type Distribution={value:number;teamId:string;playerId:string|null;displayName?:string;validGames:number;sampleGames:number;lowSample:boolean};
export type Baseline={metric:string;role:string|null;value:number|null;coverageStatus:Coverage;regionalAverage:number|null;regionalPositionalAverage:number|null;distribution:Distribution[];distributionSummary:{min:number|null;max:number|null;p25:number|null;p75:number|null}};
export type Entity={teamId:string;playerId?:string;role?:string;displayName?:string;sampleGames:number;lowSample?:boolean;metrics:Record<string,Metric>};
export type DraftStat={championId:string;games:number;count:number;useRatePct:number};
export type PairStat={championIds:string[];championNames:string[];games:number;wins:number;winRate:number};
export type DraftSection={stats:DraftStat[];validGames:number;missingGames:number;coverageStatus:Coverage};
export type PairSection={roles:string[];stats:PairStat[];validGames:number;missingGames:number;coverageStatus:Coverage};
export type Draft={mostPicked:DraftSection;mostBanned:DraftSection;mostBannedAgainst:DraftSection;combinations:Record<string,PairSection>};
export type StatisticsView={region:string;entity:Entity;baselines:Baseline[];definitions:Definition[];snapshotDate:string;scopeNote:string;draft?:Draft;champions:Record<string,{id:string;name:string}>};

export const scopeNotes:Record<string,string>={LCK:'常规赛存在比赛记录缺口；按已收录比赛计算。',LPL:'常规赛与区域资格赛存在缺场，部分指标字段缺失。',LEC:'常规赛官方逐系列赛清单尚未完整对账。',LCS:'常规赛官方逐系列赛清单尚未完整对账；一局禁用记录不完整。',CBLOL:'常规赛官方逐系列赛清单尚未完整对账。',LCP:'完整赛段离线验收通过。'};
export function localStatisticsEnabled(env:Record<string,string|undefined>,host:string,forwarded:boolean){
 return env.NODE_ENV==='development'&&env.TEAM_STATS_LOCAL==='1'&&!env.VERCEL&&!env.CI&&!forwarded&&/^(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/.test(host);
}
export function formatMetric(metric:string,value:number|null){
 if(value===null||!Number.isFinite(value))return '暂无有效数据';
 if(metric==='durationSeconds'){const n=Math.round(value);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
 if(metric.endsWith('Pct'))return `${value.toFixed(1)}%`;
 if(metric==='damageConversion')return `${value.toFixed(2)}×`;
 if(metric==='vspm'||metric==='deathsPerGame')return value.toFixed(2);
 if(metric==='csd15')return `${value>0?'+':''}${value.toFixed(1)}`;
 return `${metric==='gd15'&&value>0?'+':''}${Math.round(value).toLocaleString('en-US')}`;
}
