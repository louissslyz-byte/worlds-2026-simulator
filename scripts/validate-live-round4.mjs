import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {loadFrozenSystem,sha256,semanticSHA256} from '../lib/live/probability/model.ts';
import {loadRound3History} from '../lib/live/updates/round3.ts';
import {loadRound4Facts,validateRound4Probability,loadRound4History,ROUND4_FILES} from '../lib/live/updates/round4.ts';
const {model}=await loadFrozenSystem();await loadRound3History(model);
if(process.argv[2]==='--candidate'){
 const root=resolve(process.argv[3]??''),f=await loadRound4Facts(),index=JSON.parse(await readFile(join(root,'index.json'),'utf8')),auditBytes=await readFile(join(root,'generation-source.json')),audit=JSON.parse(auditBytes),bytes=await readFile(join(root,'probability.json'));
 if(index.schemaVersion!=='live-swiss-round4-index-v1.0'||index.baseHistorySHA256!==sha256(await readFile('lib/live/updates/round3/index.json'))||index.facts.fileSHA256!==f.fileSHA256||index.facts.factsSHA256!==f.factsSHA256||sha256(auditBytes)!==index.generationSourceSHA256||sha256(bytes)!==index.snapshot.sha256)throw Error('Candidate integrity mismatch');
 if(audit.sourceFiles.length!==ROUND4_FILES.length)throw Error('Generator source list invalid');for(const [path,hash]of audit.sourceFiles){if(!ROUND4_FILES.includes(path)||sha256(execFileSync('git',['show',`${audit.generatorCommit}:${path}`]))!==hash||sha256(await readFile(path))!==hash)throw Error('Generator source mismatch');}
 const sourceSHA=semanticSHA256(audit.sourceFiles);if(sourceSHA!==audit.generatorSourceSHA256)throw Error('Generator hash mismatch');const s=validateRound4Probability(JSON.parse(bytes),f,model,sourceSHA);
 if(s.generatorCommit!==audit.generatorCommit||['snapshotId','label','asOf','countSHA256'].some(k=>index.snapshot[k]!==s[k]))throw Error('Snapshot index mismatch');console.log('R4 candidate PASS:',s.completedCount,s.failedCount,s.countSHA256);
}else if(process.argv.length===2){const h=await loadRound4History(model);console.log('R4 archive PASS:',h.snapshot.completedCount,h.snapshot.failedCount,h.snapshot.countSHA256);}else throw Error('Usage: node --import tsx scripts/validate-live-round4.mjs [--candidate directory]');
