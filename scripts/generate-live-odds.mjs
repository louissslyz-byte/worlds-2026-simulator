import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {generateLiveCandidate} from '../lib/live/probability/generate.ts';
import {writeCandidate,saveCandidate,validateProbabilityHistory} from '../lib/live/probability/archive.ts';
import {SimulationFailure} from '../lib/sim/monteCarlo.ts';
import {semanticSHA256,sha256} from '../lib/live/probability/model.ts';
import {GENERATOR_FILES} from '../lib/live/probability/config.ts';
import {readFile} from 'node:fs/promises';
import {countsFromSnapshot} from '../lib/live/probability/snapshot.ts';
const args=process.argv.slice(2);
async function committedGenerator(commit){
 for(const file of GENERATOR_FILES){
  const saved=execFileSync('git',['show',`${commit}:${file}`],{stdio:['ignore','pipe','pipe']});
  if(sha256(saved)!==sha256(await readFile(file)))throw Error('Generator code must match its recorded local commit before formal computation');
 }
}
try{
 if(process.versions.node.split('.')[0]!=='22'||process.env.CI||process.env.VERCEL)throw Error('Run Live odds only on the local Node 22 workstation');
 if(args.length===2&&args[0]==='--save'){
  await saveCandidate(args[1]);console.log('Validated probability history saved locally. No push/deployment.');
 }else if(args.length===2&&args[0]==='--out'){
  const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  await committedGenerator(commit);
  const candidate=await generateLiveCandidate(commit,console.log);await writeCandidate(args[1],candidate);console.log('Validated candidate written; archive unchanged. Review before --save.');
 }else if(args.length===1&&args[0]==='--verify-existing'){
  const existing=await validateProbabilityHistory();await committedGenerator(existing.post.generatorCommit);const candidate=await generateLiveCandidate(existing.post.generatorCommit,console.log);
  for(const event of ['pre','post'])if(semanticSHA256(countsFromSnapshot(candidate[event]))!==semanticSHA256(countsFromSnapshot(existing[event])))throw Error('Reproduction integer counts differ; existing archive untouched');
  console.log('Exact reproduction PASS: all five events and all 19 teams; no files overwritten.');
 }else throw Error('Usage: pnpm live:odds:generate --out <new-directory> | --save <candidate> | --verify-existing');
}catch(error){
 const context=error instanceof SimulationFailure?error.context:null;
 const debug={status:'FAILED',errorType:error instanceof Error?error.name:'UnknownError',context,message:error instanceof Error?error.message.replace(/(?:\/Users\/|\/private\/|[A-Z]:\\)\S+/g,'[local path]').slice(0,500):'Unknown failure'};
 // Failure diagnostics are NOT a formal Snapshot or partial-success history.
 if(context)await writeFile(`live-odds-failure-${Date.now()}.log`,JSON.stringify(debug,null,2),{flag:'wx'});
 console.error(JSON.stringify(debug));process.exitCode=1;
}
