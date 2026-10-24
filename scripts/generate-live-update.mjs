// Explicit offline generator. No network, browser state, or runtime route.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {loadSwissUpdate} from '../lib/live/updates/facts.ts';
import {createSwissRound2Session,stateSHA256} from '../lib/live/updates/adapter.ts';
import {UPDATE_SEED,UPDATE_ID,UPDATE_FILES,updateGeneratorSHA256,updateProbabilitySchema,validateUpdateProbability} from '../lib/live/updates/probability.ts';
import {loadFrozenSystem,sha256,semanticSHA256} from '../lib/live/probability/model.ts';
import {validateProbabilityHistory} from '../lib/live/probability/archive.ts';
import {EVENTS,LIVE_ODDS} from '../lib/live/probability/config.ts';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo.ts';
import {tournamentStateHash,tournamentStateInput} from '../lib/sim/oddsMetadata.ts';
const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--candidate')throw Error('Usage: pnpm live:update:generate --candidate <new-directory>');
const directory=resolve(args[1]);await mkdir(directory,{recursive:false});
const {model}=await loadFrozenSystem(),{update,official,factsSHA256}=await loadSwissUpdate();await validateProbabilityHistory();
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
for(const file of UPDATE_FILES){const committed=execFileSync('git',['show',`${commit}:${file}`]);if(sha256(committed)!==sha256(await readFile(file)))throw Error('Commit the exact generator before formal calculation');}
const sourceSHA=await updateGeneratorSHA256(),session=createSwissRound2Session(update,official,model),before=semanticSHA256(session);
console.log(`Starting ${UPDATE_ID}: 100000 requested, seed ${UPDATE_SEED}, facts ${factsSHA256}`);
try{
 const result=runMonteCarloFromState(session,100000,UPDATE_SEED);
 if(semanticSHA256(session)!==before)throw Error('MC mutated official starting input');
 const snapshot=updateProbabilitySchema.parse({schemaVersion:'live-probability-snapshot-v1.1',snapshotId:UPDATE_ID,label:'SWISS-R1-COMPLETE',asOf:update.asOf,revisionOf:null,conditioningDescription:'All verified Play-In and Swiss R1 outcomes plus official Swiss R2 draw observed before R2 starts. Frozen pre-event strength; no R2 results.',factsSnapshotId:update.snapshotId,factsInputSHA256:factsSHA256,knownDrawIds:['worlds-2026-swiss-r2-official-draw-v1'],stateLabel:update.stateLabel,
 rulesVersion:model.rulesVersion,stateVersion:model.stateVersion,strengthVersion:model.strengthVersion,modelVersion:model.modelVersion,probabilityModelVersion:model.modelVersion,ratingVersion:model.ratingVersion,ratingInputSHA256:model.ratingInputSHA256,frozenModelSHA256:semanticSHA256(model),rulesSHA256:model.rulesSHA256,engineSourceSHA256:model.engineSourceSHA256,strengthSourceSHA256:model.strengthSourceSHA256,rngVersion:model.rngVersion,samplingVersion:model.samplingVersion,eventDefinitionVersion:LIVE_ODDS.eventDefinitionVersion,
 simulationCount:result.iterations,requestedCount:result.metadata.requestedCount,completedCount:result.iterations,failedCount:result.metadata.failedCount,randomSeed:UPDATE_SEED,sessionSeed:session.randomSeed,tournamentStateHash:tournamentStateHash(session),simulationInputSHA256:sha256(tournamentStateInput(session)),conditionedStateSHA256:stateSHA256(session),countSHA256:semanticSHA256(result.counts),generatedAt:new Date().toISOString(),generatorVersion:'live-swiss-conditional-v1.0',generatorCommit:commit,generatorSourceSHA256:sourceSHA,
 calculation:{method:'SHARED_ENGINE_RUN',calculatedAt:result.metadata.generatedAt,durationMs:result.metadata.durationMs,peakProcessRssBytes:process.resourceUsage().maxRSS*1024,sourceCacheSHA256:null},teams:model.teams.map(t=>({teamId:t.teamId,...Object.fromEntries(EVENTS.flatMap(e=>[[`${e}Count`,result.counts[e][t.teamId]],[`${e}Probability`,result.counts[e][t.teamId]/result.iterations]]))}))});
 validateUpdateProbability(snapshot,update,official,model,sourceSHA);
 const bytes=JSON.stringify(snapshot,null,2)+'\n';await writeFile(join(directory,'swiss-r1-v1.json'),bytes,{flag:'wx'});
 const index={schemaVersion:'live-probability-extension-v1.0',baseHistorySHA256:sha256(await readFile('lib/live/probability/snapshots/index.json')),snapshots:[{snapshotId:snapshot.snapshotId,label:snapshot.label,asOf:snapshot.asOf,file:'swiss-r1-v1.json',sha256:sha256(bytes),countSHA256:snapshot.countSHA256}]};await writeFile(join(directory,'index.json'),JSON.stringify(index,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({completed:result.iterations,failed:0,durationMs:result.metadata.durationMs,peakRssBytes:snapshot.calculation.peakProcessRssBytes,countSHA256:snapshot.countSHA256,fileSHA256:sha256(bytes)}));
}catch(error){await writeFile(join(directory,'failure.json'),JSON.stringify({name:error.name,message:error.message,context:error.context??null},null,2)+'\n',{flag:'wx'});throw error;}
