// Explicit offline generator. No network, browser state, or runtime route.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {loadRound3Facts,createSwissRound4Session,ROUND3_SEED as UPDATE_SEED,ROUND3_ID as UPDATE_ID,ROUND3_FILES as UPDATE_FILES,round3ProbabilitySchema as updateProbabilitySchema,validateRound3Probability} from '../lib/live/updates/round3.ts';
import {stateSHA256} from '../lib/live/updates/adapter.ts';
import {loadRound2History} from '../lib/live/updates/round2.ts';
import {loadUpdateHistory} from '../lib/live/updates/probability.ts';
import {loadFrozenSystem,sha256,semanticSHA256} from '../lib/live/probability/model.ts';
import {validateProbabilityHistory} from '../lib/live/probability/archive.ts';
import {EVENTS,LIVE_ODDS} from '../lib/live/probability/config.ts';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo.ts';
import {tournamentStateHash,tournamentStateInput} from '../lib/sim/oddsMetadata.ts';
const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--candidate')throw Error('Usage: pnpm live:round3:generate --candidate <new-directory>');
const directory=resolve(args[1]);await mkdir(directory,{recursive:false});
const {model}=await loadFrozenSystem(),facts=await loadRound3Facts(),{update,factsSHA256}=facts;await validateProbabilityHistory();await loadUpdateHistory(model);await loadRound2History(model);
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
for(const file of UPDATE_FILES){const committed=execFileSync('git',['show',`${commit}:${file}`]);if(sha256(committed)!==sha256(await readFile(file)))throw Error('Commit the exact generator before formal calculation');}
const sourceFiles=await Promise.all(UPDATE_FILES.map(async file=>[file,sha256(await readFile(file))]));
const sourceSHA=semanticSHA256(sourceFiles),session=createSwissRound4Session(update,facts.previous,model),before=semanticSHA256(session);
console.log(`Starting ${UPDATE_ID}: 100000 requested, seed ${UPDATE_SEED}, facts ${factsSHA256}`);
try{
 const result=runMonteCarloFromState(session,100000,UPDATE_SEED);
 if(semanticSHA256(session)!==before)throw Error('MC mutated official starting input');
 const snapshot=updateProbabilitySchema.parse({schemaVersion:'live-probability-snapshot-v1.3',snapshotId:UPDATE_ID,label:'SWISS-R3-COMPLETE',asOf:update.asOf,revisionOf:null,conditioningDescription:'All verified Play-In and Swiss R1/R2/R3 outcomes plus official Swiss R4 draw observed before R4 starts. Frozen pre-event strength; no R4 results.',factsSnapshotId:update.snapshotId,factsInputSHA256:factsSHA256,knownDrawIds:['worlds-2026-swiss-r4-official-draw-v1'],stateLabel:update.stateLabel,
 rulesVersion:model.rulesVersion,stateVersion:model.stateVersion,strengthVersion:model.strengthVersion,modelVersion:model.modelVersion,probabilityModelVersion:model.modelVersion,ratingVersion:model.ratingVersion,ratingInputSHA256:model.ratingInputSHA256,frozenModelSHA256:semanticSHA256(model),rulesSHA256:model.rulesSHA256,engineSourceSHA256:model.engineSourceSHA256,strengthSourceSHA256:model.strengthSourceSHA256,rngVersion:model.rngVersion,samplingVersion:model.samplingVersion,eventDefinitionVersion:LIVE_ODDS.eventDefinitionVersion,
 simulationCount:result.iterations,requestedCount:result.metadata.requestedCount,completedCount:result.iterations,failedCount:result.metadata.failedCount,randomSeed:UPDATE_SEED,sessionSeed:session.randomSeed,tournamentStateHash:tournamentStateHash(session),simulationInputSHA256:sha256(tournamentStateInput(session)),conditionedStateSHA256:stateSHA256(session),countSHA256:semanticSHA256(result.counts),generatedAt:new Date().toISOString(),generatorVersion:'live-swiss-round3-conditional-v1.0',generatorCommit:commit,generatorSourceSHA256:sourceSHA,
 calculation:{method:'SHARED_ENGINE_RUN',calculatedAt:result.metadata.generatedAt,durationMs:result.metadata.durationMs,peakProcessRssBytes:process.resourceUsage().maxRSS*1024,sourceCacheSHA256:null},teams:model.teams.map(t=>({teamId:t.teamId,...Object.fromEntries(EVENTS.flatMap(e=>[[`${e}Count`,result.counts[e][t.teamId]],[`${e}Probability`,result.counts[e][t.teamId]/result.iterations]]))}))});
 validateRound3Probability(snapshot,facts,model,sourceSHA);
 const bytes=JSON.stringify(snapshot,null,2)+'\n';await writeFile(join(directory,'probability.json'),bytes,{flag:'wx'});
 const audit=JSON.stringify({schemaVersion:'live-round3-generator-source-v1.0',generatorCommit:commit,sourceFiles,generatorSourceSHA256:sourceSHA},null,2)+'\n';
 await writeFile(join(directory,'generation-source.json'),audit,{flag:'wx'});
 const index={schemaVersion:'live-swiss-round3-index-v1.0',baseHistorySHA256:sha256(await readFile('lib/live/updates/round2/index.json')),facts:{file:'facts.json',fileSHA256:facts.fileSHA256,factsSHA256},generationSourceSHA256:sha256(audit),snapshot:{snapshotId:snapshot.snapshotId,label:snapshot.label,asOf:snapshot.asOf,file:'probability.json',sha256:sha256(bytes),countSHA256:snapshot.countSHA256}};
 await writeFile(join(directory,'index.json'),JSON.stringify(index,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({completed:result.iterations,failed:0,durationMs:result.metadata.durationMs,peakRssBytes:snapshot.calculation.peakProcessRssBytes,countSHA256:snapshot.countSHA256,fileSHA256:sha256(bytes)}));
}catch(error){await writeFile(join(directory,'failure.json'),JSON.stringify({name:error.name,message:error.message,context:error.context??null},null,2)+'\n',{flag:'wx'});throw error;}
