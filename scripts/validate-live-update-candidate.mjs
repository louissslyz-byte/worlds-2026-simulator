// Offline candidate audit. Does not simulate, archive, fetch, or overwrite anything.
import {readFile,lstat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {loadSwissUpdate} from '../lib/live/updates/facts.ts';
import {loadFrozenSystem,sha256,semanticSHA256} from '../lib/live/probability/model.ts';
import {UPDATE_FILES,updateProbabilitySchema,validateUpdateProbability} from '../lib/live/updates/probability.ts';
import {validateProbabilityHistory} from '../lib/live/probability/archive.ts';
if(process.argv.length!==3)throw Error('Usage: node --import tsx scripts/validate-live-update-candidate.mjs <candidate-directory>');
const dir=resolve(process.argv[2]);const index=JSON.parse(await readFile(join(dir,'index.json'),'utf8'));
await validateProbabilityHistory();const {model}=await loadFrozenSystem(),{update,official}=await loadSwissUpdate();
if(index.schemaVersion!=='live-probability-extension-v1.0'||index.baseHistorySHA256!==sha256(await readFile('lib/live/probability/snapshots/index.json'))||index.snapshots.length!==1)throw Error('Invalid candidate history base');
const entry=index.snapshots[0];if(!/^[-a-z0-9]+\.json$/.test(entry.file)||!(await lstat(join(dir,entry.file))).isFile())throw Error('Unsafe candidate file');
const bytes=await readFile(join(dir,entry.file));if(sha256(bytes)!==entry.sha256)throw Error('Candidate file checksum mismatch');
const s=updateProbabilitySchema.parse(JSON.parse(bytes.toString()));
// A historical run remains auditable after loader-only fixes. Never claim it ran new code.
const executedSourceSHA=semanticSHA256(UPDATE_FILES.map(file=>[file,sha256(execFileSync('git',['show',`${s.generatorCommit}:${file}`]))]));
validateUpdateProbability(s,update,official,model,executedSourceSHA);
for(const key of ['snapshotId','label','asOf','countSHA256'])if(s[key]!==entry[key])throw Error('Candidate index mismatch');
console.log(JSON.stringify({status:'PASS',snapshotId:s.snapshotId,generatorCommit:s.generatorCommit,countSHA256:s.countSHA256,fileSHA256:sha256(bytes),completed:s.completedCount,failed:s.failedCount}));
