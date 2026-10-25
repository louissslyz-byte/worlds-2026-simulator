// Read-only validation; never runs Monte Carlo or imports results from the network.
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {loadFrozenSystem,semanticSHA256,sha256} from '../lib/live/probability/model.ts';
import {validateProbabilityHistory} from '../lib/live/probability/archive.ts';
import {loadUpdateHistory} from '../lib/live/updates/probability.ts';
import {loadRound2Facts,loadRound2History,createSwissRound3Session,validateRound2Probability,ROUND2_FILES} from '../lib/live/updates/round2.ts';
import {stateSHA256} from '../lib/live/updates/adapter.ts';
const {model}=await loadFrozenSystem();await validateProbabilityHistory();await loadUpdateHistory(model);
const facts=await loadRound2Facts();
if(process.argv.includes('--facts-only'))console.log(JSON.stringify({status:'PASS',factsSHA256:facts.factsSHA256,stateSHA256:stateSHA256(createSwissRound3Session(facts.update,facts.prior,model)),records:facts.records}));
else if(process.argv[2]==='--candidate'&&process.argv.length===4){
 const dir=resolve(process.argv[3]),index=JSON.parse(await readFile(join(dir,'index.json'),'utf8'));
 const bytes=await readFile(join(dir,'probability.json')),auditBytes=await readFile(join(dir,'generation-source.json')),audit=JSON.parse(auditBytes.toString());
 const sourceSHA=semanticSHA256(ROUND2_FILES.map(file=>[file,sha256(execFileSync('git',['show',`${audit.generatorCommit}:${file}`]))]));
 if(index.schemaVersion!=='live-swiss-round2-index-v1.0'||index.baseHistorySHA256!==sha256(await readFile('lib/live/updates/snapshots/index.json'))||index.snapshot.sha256!==sha256(bytes)||index.generationSourceSHA256!==sha256(auditBytes)||index.facts.fileSHA256!==facts.fileSHA256||index.facts.factsSHA256!==facts.factsSHA256||audit.generatorSourceSHA256!==sourceSHA||semanticSHA256(audit.sourceFiles)!==sourceSHA)throw Error('Round2 candidate binding mismatch');
 const s=validateRound2Probability(JSON.parse(bytes.toString()),facts,model,sourceSHA);
 for(const key of ['snapshotId','label','asOf','countSHA256'])if(index.snapshot[key]!==s[key])throw Error('Round2 candidate index mismatch');
 console.log(JSON.stringify({status:'PASS',snapshotId:s.snapshotId,completed:s.completedCount,failed:s.failedCount,countSHA256:s.countSHA256,fileSHA256:sha256(bytes)}));
}else if(process.argv.length===2){const h=await loadRound2History(model);console.log(JSON.stringify({status:'PASS',snapshots:4,factsSHA256:h.factsSHA256,countSHA256:h.snapshot.countSHA256,completed:h.snapshot.completedCount,failed:h.snapshot.failedCount}));}
else throw Error('Usage: live:round2:validate [--facts-only | --candidate <directory>]');
