import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {loadFrozenSystem,sha256,semanticSHA256} from '../lib/live/probability/model.ts';
import {loadDrawHistory} from '../lib/live/updates/knockout-draw.ts';
import {loadQuarterfinalFacts,createQuarterfinalSession,validateQuarterfinalSnapshot,assertQuarterfinalConditioning,QF_ID,QF_KIND,QF_LABEL,QF_SEED,QF_NEW_GPR_SEED} from '../lib/live/updates/quarterfinals.ts';
import {forecastSchema} from '../lib/live/knockout-forecast/load.ts';
import {stateSHA256} from '../lib/live/updates/adapter.ts';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo.ts';
import {EVENTS} from '../lib/live/probability/config.ts';

const output=process.argv[2];
if(!output)throw Error('Provide a new output directory');
await mkdir(output);
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const {model}=await loadFrozenSystem();
const draw=await loadDrawHistory(model);
const input=await loadQuarterfinalFacts(process.cwd(),draw);
const {facts,factsSHA256}=input;
const modernDir='lib/live/knockout-forecast';
const strengthBytes=await readFile(modernDir+'/strength.json');
const strength=JSON.parse(strengthBytes);
const index=await read(modernDir+'/index.json');
if(sha256(strengthBytes)!==index.strengthFileSHA256||semanticSHA256(strength)!==index.strengthSHA256)throw Error('Frozen knockout ratings mismatch');
const previousEntry=index.snapshots.find(e=>e.legacySnapshotId===draw.snapshot.snapshotId);
const previousBytes=await readFile(modernDir+'/'+previousEntry.file);
if(sha256(previousBytes)!==previousEntry.sha256)throw Error('Previous knockout forecast mismatch');
const previous=forecastSchema.parse(JSON.parse(previousBytes));
const generatorCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const generatorSourceSHA256=semanticSHA256(await Promise.all(
 ['scripts/generate-live-quarterfinals.mjs','lib/live/updates/quarterfinals.ts'].map(async path=>[path,sha256(await readFile(path))]),
));
const winners=facts.quarterfinals.map(m=>m.winner);
for(const modern of [false,true]){
 const session=createQuarterfinalSession(input,model,modern?strength:undefined);
 const seed=modern?QF_NEW_GPR_SEED:QF_SEED;
 const state=stateSHA256(session);
 const audit=runMonteCarloFromState(session,128,seed);
 for(const [id,count] of Object.entries(audit.counts.semifinal))if(count!==(winners.includes(id)?128:0))throw Error('Invalid semifinal conditioning');
 console.log('Running 100,000 paths with',modern?'October GPR':'preseason GPR');
 const result=runMonteCarloFromState(session,100000,seed);
 if(stateSHA256(session)!==state||result.iterations!==100000||result.metadata.failedCount)throw Error('Incomplete run or changed input');
 const teams=model.teams.map(({teamId})=>({teamId,...Object.fromEntries(EVENTS.flatMap(event=>[
  [event+'Count',result.counts[event][teamId]],[event+'Probability',result.counts[event][teamId]/100000],
 ]))}));
 assertQuarterfinalConditioning(teams,winners);
 const countSHA256=semanticSHA256(result.counts);
 const common={asOf:facts.asOf,factsInputSHA256:factsSHA256,countSHA256,teams,randomSeed:seed,
  generatedAt:result.metadata.generatedAt,generatorCommit,generatorSourceSHA256};
 if(modern){
  const snapshot=forecastSchema.parse({...previous,...common,snapshotId:'worlds-2026-knockout-new-gpr-quarterfinals-v1',
   kind:QF_KIND,label:QF_LABEL,legacySnapshotId:QF_ID,stateSHA256:state,durationMs:result.metadata.durationMs,
   peakRssBytes:process.resourceUsage().maxRSS*1024});
  const bytes=JSON.stringify(snapshot,null,2)+'\n';
  await writeFile(output+'/forecast.json',bytes,{flag:'wx'});
  await writeFile(output+'/forecast-entry.json',JSON.stringify({file:'quarterfinals.json',sha256:sha256(bytes),snapshotId:snapshot.snapshotId,legacySnapshotId:QF_ID},null,2)+'\n',{flag:'wx'});
 }else{
  const snapshot=validateQuarterfinalSnapshot({...draw.snapshot,...common,schemaVersion:'live-probability-snapshot-v1.7',
   snapshotId:QF_ID,label:QF_KIND,factsSnapshotId:facts.snapshotId,simulationInputSHA256:state,
   conditioningDescription:'Four official quarterfinal results locked. Semifinals fixed, remaining BO5 series simulated.',
   sessionSeed:session.randomSeed,tournamentStateHash:result.metadata.tournamentStateHash,generatorVersion:'live-quarterfinals-v1',
   calculation:{method:'SHARED_ENGINE_RUN',calculatedAt:result.metadata.generatedAt,durationMs:result.metadata.durationMs,
    peakProcessRssBytes:process.resourceUsage().maxRSS*1024,sourceCacheSHA256:null}},input,model);
  const bytes=JSON.stringify(snapshot,null,2)+'\n';
  await writeFile(output+'/probability.json',bytes,{flag:'wx'});
  await writeFile(output+'/index.json',JSON.stringify({sha256:sha256(bytes),factsSHA256,baseHistorySHA256:sha256(await readFile('lib/live/updates/knockout-draw/index.json'))},null,2)+'\n',{flag:'wx'});
 }
 console.log(JSON.stringify({completed:result.iterations,failed:result.metadata.failedCount,seed,durationMs:result.metadata.durationMs,countSHA256}));
}
