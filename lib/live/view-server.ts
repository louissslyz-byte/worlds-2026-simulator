// Server-only filesystem adapter. Uses explicit project-relative resources so Next traces
// immutable archives and source fingerprints without evaluating an offline generator.
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {cache} from 'react';
import {validateOfficialTournament} from './validate';
import {buildA2FactsInput} from './input';
import {historySchema} from './probability/schema';
import {frozenSystemSchema,sha256,semanticSHA256} from './probability/model';
import {ENGINE_FILES,STRENGTH_FILES,GENERATOR_FILES,LIVE_ODDS} from './probability/config';
import {validateProbabilitySnapshot,countsFromSnapshot} from './probability/snapshot';
import {projectUpdatedLiveView} from './view';
import {loadUpdateHistory} from './updates/probability';
export async function readLiveView(projectRoot=process.cwd()){
 if(typeof window!=='undefined')throw Error('Live archives are server-only');
 const read=(path:string)=>readFile(join(projectRoot,path),'utf8');
 const root='lib/live/probability/snapshots/';
 const index=historySchema.parse(JSON.parse(await read(root+'index.json')));
 async function checked(entry:{file:string;sha256:string}){
  if(!/^[-a-z0-9]+\.json$/.test(entry.file))throw Error('Unsafe Live archive filename');
  const bytes=await read(root+entry.file);if(sha256(bytes)!==entry.sha256)throw Error('Live archive checksum mismatch');return JSON.parse(bytes);
 }
 const factsIndex=JSON.parse(await read('lib/live/snapshots/index.json'));
 const entry=factsIndex[LIVE_ODDS.factsSnapshotId];
 if(!entry||!/^[-a-z0-9]+\.json$/.test(entry.file))throw Error('Missing official snapshot');
 const factsBytes=await read('lib/live/snapshots/'+entry.file);
 if(sha256(factsBytes)!==entry.fileSHA256)throw Error('Official file checksum mismatch');
 const input=JSON.parse(factsBytes),official={...validateOfficialTournament(input),...buildA2FactsInput(input)};
 if(official.inputSHA256!==entry.inputSHA256||official.inputSHA256!==LIVE_ODDS.factsInputSHA256)throw Error('Official fact binding changed');
 const model=frozenSystemSchema.parse(await checked(index.frozenModel));
 if(semanticSHA256(model)!==index.frozenModel.modelSHA256)throw Error('Frozen model checksum mismatch');
 for(const file of [...ENGINE_FILES,...STRENGTH_FILES])if(sha256(await read('lib/sim/'+file))!==model.sourceFiles[file])throw Error('Frozen engine/strength fingerprint changed');
 const generatorSHA=semanticSHA256(await Promise.all(GENERATOR_FILES.map(async file=>[file,sha256(await read(file))])));
 if(sha256(await read('lib/sim/precomputedOdds.json'))!==LIVE_ODDS.sourceCacheSHA256)throw Error('R1 baseline changed');
 if(index.snapshots.map(s=>s.label).join('|')!=='PRE-TOURNAMENT|POST-PLAY-IN')throw Error('Live history must be chronological');
 const snapshots=[];
 for(const e of index.snapshots){const s=validateProbabilitySnapshot(await checked(e),model,official,generatorSHA);if(s.snapshotId!==e.snapshotId||s.countSHA256!==e.countSHA256||s.asOf!==e.asOf||s.label!==e.label)throw Error('Live index mismatch');snapshots.push(s);}
 const baseline=JSON.parse(await read('lib/sim/precomputedOdds.json'));
 if(semanticSHA256(countsFromSnapshot(snapshots[0]))!==semanticSHA256(baseline.counts))throw Error('Live PRE differs from R1 counts');
 const extension=await loadUpdateHistory(model,projectRoot);
 return projectUpdatedLiveView(official,{snapshots:[...index.snapshots,...extension.index.snapshots]},[...snapshots,...extension.snapshots],extension.update,extension.records);
}
export const loadLiveView=cache(()=>readLiveView());
