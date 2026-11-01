// Offline only. Reuses shared engine and official condition adapters; no new odds algorithm.
import {readFile,writeFile,mkdir}from'node:fs/promises';
import {execFileSync}from'node:child_process';
import {loadFrozenSystem,sha256,semanticSHA256}from'../lib/live/probability/model.ts';
import {loadRound5Facts,createBeforeDrawSession,loadRound5History}from'../lib/live/updates/round5.ts';
import {loadDrawFacts,createAfterDrawSession,loadDrawHistory}from'../lib/live/updates/knockout-draw.ts';
import {currentOfficialGpr}from'../lib/rankings/gpr-comparison.ts';
import {GprProbabilityModel}from'../lib/sim/gprProbability.ts';
import {makeMatch}from'../lib/sim/engine.ts';
import {runMonteCarloFromState}from'../lib/sim/monteCarlo.ts';
import {assertEventCounts}from'../lib/sim/validation.ts';
import {EVENTS}from'../lib/live/probability/config.ts';
import {stateSHA256}from'../lib/live/updates/adapter.ts';
const dir=process.argv[2];if(!dir)throw Error('Provide NEW candidate directory');await mkdir(dir,{recursive:false});
const{model}=await loadFrozenSystem(),pre=await loadRound5Facts(),post=await loadDrawFacts(),oldPre=await loadRound5History(model),oldPost=await loadDrawHistory(model);
const ratings=Object.fromEntries(model.teams.map(t=>{const gpr=currentOfficialGpr.entries[t.teamId];if(!gpr)throw Error('Missing current official GPR');return[t.teamId,new GprProbabilityModel().toInternalStrength(gpr.score)];}));
const frozen={schemaVersion:'knockout-strength-v1',gpr:currentOfficialGpr,ratings,ratingInputSHA256:sha256(JSON.stringify(Object.fromEntries(Object.entries(ratings).sort()))),parameters:model.parameters,modelVersion:model.modelVersion,strengthVersion:'riot-gpr-2026-10-31-knockout-v1',rulesVersion:model.rulesVersion,engineSourceSHA256:model.engineSourceSHA256};
const frozenSHA=semanticSHA256(frozen),qualified=Object.keys(pre.records).filter(id=>pre.records[id].wins===3).sort();
await writeFile(dir+'/strength.json',JSON.stringify(frozen,null,2)+'\n',{flag:'wx'});
const entries=[];
for(const [kind,base,legacy,facts,seed]of[['BEFORE-DRAW',createBeforeDrawSession(pre,model),oldPre.snapshot,pre,20261111],['AFTER-DRAW',createAfterDrawSession(post,model),oldPost.snapshot,post,20261112]]){
 const session=structuredClone(base);session.ratingSnapshot={...ratings};session.strengthVersion=frozen.strengthVersion;
 // Rebuild only undecided matches' precomputed win probabilities with the identical existing model.
 session.tournamentState.matches=session.tournamentState.matches.map(m=>m.status==='UNDECIDED'?makeMatch(session,m.id,m.stage,m.round,m.label,m.teamA,m.teamB,m.format):m);
 const before=stateSHA256(session),small=runMonteCarloFromState(session,128,seed);assertEventCounts(small.counts,128);if(stateSHA256(session)!==before)throw Error('Input mutated');
 console.log('Starting',kind,'100000 paths');const r=runMonteCarloFromState(session,100000,seed);assertEventCounts(r.counts,100000);if(stateSHA256(session)!==before)throw Error('Input mutated');
 const snapshot={schemaVersion:'knockout-forecast-snapshot-v1',snapshotId:`worlds-2026-knockout-new-gpr-${kind.toLowerCase()}-v1`,kind,label:kind==='BEFORE-DRAW'?'瑞士轮结束后 · 八强抽签前':'八强抽签后',asOf:legacy.asOf,legacySnapshotId:legacy.snapshotId,factsInputSHA256:facts.factsSHA256,strengthSHA256:frozenSHA,ratingInputSHA256:frozen.ratingInputSHA256,rulesVersion:model.rulesVersion,modelVersion:model.modelVersion,strengthVersion:frozen.strengthVersion,simulationCount:r.iterations,requestedCount:r.metadata.requestedCount,failedCount:r.metadata.failedCount,randomSeed:seed,rngVersion:model.rngVersion,samplingVersion:model.samplingVersion,stateSHA256:before,countSHA256:semanticSHA256(r.counts),generatedAt:r.metadata.generatedAt,durationMs:r.metadata.durationMs,peakRssBytes:process.resourceUsage().maxRSS*1024,generatorCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),generatorSourceSHA256:sha256(await readFile('scripts/generate-knockout-forecast.mjs')),qualifiedTeams:qualified,teams:model.teams.map(t=>({teamId:t.teamId,...Object.fromEntries(EVENTS.flatMap(e=>[[e+'Count',r.counts[e][t.teamId]],[e+'Probability',r.counts[e][t.teamId]/100000]]))}))};
 const file=kind.toLowerCase()+'.json',bytes=JSON.stringify(snapshot,null,2)+'\n';await writeFile(dir+'/'+file,bytes,{flag:'wx'});entries.push({file,sha256:sha256(bytes),snapshotId:snapshot.snapshotId,legacySnapshotId:snapshot.legacySnapshotId});console.log(kind,r.iterations,r.metadata.failedCount,r.metadata.durationMs,snapshot.countSHA256);
}
await writeFile(dir+'/index.json',JSON.stringify({schemaVersion:'knockout-forecast-history-v1',strengthSHA256:frozenSHA,strengthFileSHA256:sha256(await readFile(dir+'/strength.json')),qualifiedTeams:qualified,snapshots:entries},null,2)+'\n',{flag:'wx'});
