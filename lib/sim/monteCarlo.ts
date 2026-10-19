import {teamSnapshotMetadata} from './teamSnapshot';
import {riotGprSnapshot} from './gprSnapshot';
import {teams} from './data';
import type {SimulationSession} from './types';
import {simulateEntireWorlds} from './engine';
import {SIMULATION_COUNTS} from './oddsConfig';
import {tournamentStateHash,strengthVersion} from './oddsMetadata';
import {worlds2026} from './worlds2026';
import {assertCurrentRulesSession} from './sessionCompatibility';
import {assertCompletedTournament,assertEventCounts,type EventCounts} from './validation';

export class SimulationFailure extends Error {
  constructor(readonly context:{sampleIndex:number;sampleSeed:number;completedCount:number;requestedCount:number;stage:string;round:number;rulesVersion:string},cause:unknown){
    const detail=(cause instanceof Error?cause.message:'未知模拟异常').replace(/(?:\/Users\/|\/private\/|[A-Z]:\\)\S+/g,'[路径已省略]').slice(0,200);
    super(`模拟失败：样本 ${context.sampleIndex+1}，seed=${context.sampleSeed}，${context.stage}/${context.round}，已完成 ${context.completedCount}/${context.requestedCount}。${detail}`);
    this.name='SimulationFailure';
  }
}
export function runMonteCarloFromState(session:SimulationSession,iterations:number=SIMULATION_COUNTS.preview,seed=12345){
  assertCurrentRulesSession(session);
  if(!Number.isSafeInteger(iterations)||iterations<1||!Number.isInteger(seed)||seed<0||seed>4294967295)throw Error('模拟次数或随机种子无效');
  for(const team of teams)if(!Number.isFinite(session.ratingSnapshot[team.id]))throw Error(`缺少有效实力输入：${team.id}`);
  const empty=()=>Object.fromEntries(teams.map(t=>[t.id,0]));
  const counts:EventCounts={swiss:empty(),knockout:empty(),semifinal:empty(),final:empty(),champion:empty()};
  const start=performance.now();
  for(let i=0;i<iterations;i++){
    const sampleSeed=(seed+i*7919)>>>0;
    try{
      const sample:SimulationSession=JSON.parse(JSON.stringify(session));sample.rngState=sampleSeed;
      const result=simulateEntireWorlds(sample);assertCompletedTournament(result);
      const state=result.tournamentState;
      for(const id of Object.keys(state.swissRecords))counts.swiss[id]++;
      for(const id of state.swissQualified)counts.knockout[id]++;
      for(const m of state.matches.filter(m=>m.stage==='KNOCKOUT'&&m.round>=2)){
        const target=m.round===2?counts.semifinal:counts.final;target[m.teamA]++;target[m.teamB]++;
      }
      counts.champion[state.champion!]++;
    }catch(error){throw new SimulationFailure({sampleIndex:i,sampleSeed,completedCount:i,requestedCount:iterations,stage:session.tournamentState.stage,round:session.tournamentState.round,rulesVersion:worlds2026.rulesVersion},error);}
  }
  assertEventCounts(counts,iterations);
  const probabilities=(values:Record<string,number>)=>Object.fromEntries(Object.entries(values).map(([id,n])=>[id,n/iterations]));
  return {
    probabilities:probabilities(counts.champion),swissProbabilities:probabilities(counts.swiss),knockoutProbabilities:probabilities(counts.knockout),semifinalProbabilities:probabilities(counts.semifinal),finalProbabilities:probabilities(counts.final),counts,iterations,
    metadata:{classification:'OFFICIAL_RULES_CORRECTED',teamSnapshotDate:teamSnapshotMetadata.snapshotUpdatedAt,gprSnapshotDate:riotGprSnapshot.sourceUpdatedAt,simulationCount:iterations,requestedCount:iterations,failedCount:0,generatedAt:new Date().toISOString(),modelVersion:session.systemModelVersion??worlds2026.modelVersion,probabilityModelVersion:session.systemModelVersion??'custom-tier-existing',strengthVersion:strengthVersion(session),rulesVersion:worlds2026.rulesVersion,tournamentStateVersion:worlds2026.tournamentStateVersion,rngVersion:worlds2026.rngVersion,samplingVersion:worlds2026.samplingVersion,randomSeed:seed,sessionSeed:session.randomSeed,durationMs:Math.round(performance.now()-start),tournamentStateHash:tournamentStateHash(session)},
  };
}
export const runMonteCarlo=runMonteCarloFromState;
