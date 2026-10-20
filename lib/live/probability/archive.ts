import {readFile,mkdir,writeFile,rename,rm,cp,access,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {historySchema,generationAuditSchema} from './schema';
import {loadFrozenSystem,generatorSourceSHA256,sha256,semanticSHA256} from './model';
import {validateProbabilitySnapshot,compareSnapshots,countsFromSnapshot} from './snapshot';
import {verifiedA1} from './adapter';
import {validateR1Baseline,type generateLiveCandidate} from './generate';
import {EVENTS,LIVE_ODDS} from './config';
export const archiveDirectory=new URL('./snapshots/',import.meta.url);
const archiveFiles=['pre-tournament-v1.json','post-play-in-v1.json','comparison-v1.json','comparison-v1.csv','generation-v1.json','frozen-system-v1.json','index.json'];
const json=(value:unknown)=>JSON.stringify(value,null,2)+'\n';
const safeFile=(name:string)=>{if(!/^[-a-z0-9]+\.(?:json|csv)$/.test(name))throw Error('Invalid probability artifact filename');return name;};
function comparisonCsv(comparison:ReturnType<typeof compareSnapshots>){
 const header=['teamId',...EVENTS.flatMap(event=>[`${event}_pre_probability`,`${event}_post_probability`,`${event}_delta_pp`])];
 return [header.join(','),...comparison.teams.map(t=>[t.teamId,...EVENTS.flatMap(event=>{const e=t.events[event];return [e.preProbability,e.postProbability,e.deltaPercentagePoints.toFixed(3)];})].join(','))].join('\n')+'\n';
}
export async function writeCandidate(directory:string,candidate:Awaited<ReturnType<typeof generateLiveCandidate>>){
 // A new directory only. Never reuse/overwrite an existing candidate or history.
 await mkdir(directory,{recursive:false});
 const {model,modelSHA256}=await loadFrozenSystem();
 const files:Record<string,string>={'pre-tournament-v1.json':json(candidate.pre),'post-play-in-v1.json':json(candidate.post),'comparison-v1.json':json(candidate.comparison),'generation-v1.json':json(candidate.audit),'frozen-system-v1.json':json(model)};
 files['comparison-v1.csv']=comparisonCsv(candidate.comparison);
 const snapshots=[['pre-tournament-v1.json',candidate.pre],['post-play-in-v1.json',candidate.post]] as const;
 const index=historySchema.parse({schemaVersion:'live-probability-history-v1.0',historyId:LIVE_ODDS.historyId,frozenModel:{file:'frozen-system-v1.json',sha256:sha256(files['frozen-system-v1.json']),modelSHA256},snapshots:snapshots.map(([file,s])=>({snapshotId:s.snapshotId,label:s.label,asOf:s.asOf,file,sha256:sha256(files[file]),countSHA256:s.countSHA256})),comparison:{file:'comparison-v1.json',sha256:sha256(files['comparison-v1.json'])},comparisonCsv:{file:'comparison-v1.csv',sha256:sha256(files['comparison-v1.csv'])},generationAudit:{file:'generation-v1.json',sha256:sha256(files['generation-v1.json'])}});
 for(const [file,bytes] of Object.entries({...files,'index.json':json(index)}))await writeFile(join(directory,file),bytes,{flag:'wx'});
 await validateProbabilityHistory(directory);
}
export async function validateProbabilityHistory(directory:URL|string=archiveDirectory){
 const inventory=await readdir(directory,{withFileTypes:true});
 if(inventory.length!==archiveFiles.length||inventory.some(item=>!item.isFile()||!archiveFiles.includes(item.name)))throw Error('Probability archive must contain only the seven approved regular files; no symlinks/research extras');
 const file=(name:string)=>directory instanceof URL?new URL(safeFile(name),directory):join(directory,safeFile(name));
 const index=historySchema.parse(JSON.parse(await readFile(file('index.json'),'utf8')));
 if(index.historyId!==LIVE_ODDS.historyId)throw Error('Unknown probability history version');
 const {model,modelSHA256}=await loadFrozenSystem(),official=await verifiedA1(),generatorSHA=await generatorSourceSHA256();
 async function verifiedFile(entry:{file:string;sha256:string}){const bytes=await readFile(file(entry.file));if(sha256(bytes)!==entry.sha256)throw Error('Archived probability file checksum mismatch');return JSON.parse(bytes.toString('utf8'));}
 const archivedModel=await verifiedFile(index.frozenModel);
 if(semanticSHA256(archivedModel)!==modelSHA256||index.frozenModel.modelSHA256!==modelSHA256)throw Error('History frozen model mismatch');
 const snapshots=[];
 for(const entry of index.snapshots){
  const snapshot=validateProbabilitySnapshot(await verifiedFile(entry),model,official,generatorSHA);
  if(entry.snapshotId!==snapshot.snapshotId||entry.label!==snapshot.label||entry.asOf!==snapshot.asOf||entry.countSHA256!==snapshot.countSHA256)throw Error('Probability index entry mismatch');
  snapshots.push(snapshot);
 }
 const [pre,post]=snapshots,comparison=compareSnapshots(pre,post);
 const csv=await readFile(file(index.comparisonCsv.file),'utf8');if(sha256(csv)!==index.comparisonCsv.sha256||csv!==comparisonCsv(comparison))throw Error('Comparison CSV mismatch');
 if(semanticSHA256(await verifiedFile(index.comparison))!==semanticSHA256(comparison))throw Error('Comparison does not match archived counts');
 const baseline=await validateR1Baseline();
 if(semanticSHA256(countsFromSnapshot(pre))!==semanticSHA256(baseline.odds.counts))throw Error('Live PRE differs from production R1 baseline');
 const audit=generationAuditSchema.parse(await verifiedFile(index.generationAudit));
 if(audit.preCountSHA256!==pre.countSHA256||audit.postCountSHA256!==post.countSHA256||audit.factsInputSHA256!==official.inputSHA256||audit.ratingInputSHA256!==model.ratingInputSHA256||audit.generatorSourceSHA256!==generatorSHA||audit.generatorCommit!==post.generatorCommit||audit.post.simulationCount!==LIVE_ODDS.simulationCount||audit.post.failedCount!==0||audit.pre.sourceCacheSHA256!==baseline.sha256||audit.pre.sourceCalculatedAt!==pre.calculation.calculatedAt||audit.post.durationMs!==post.calculation.durationMs||audit.post.peakProcessRssBytes!==post.calculation.peakProcessRssBytes||pre.generatorCommit!==post.generatorCommit)throw Error('Generation audit mismatch');
 return {index,model,pre,post,comparison,audit};
}
export async function saveCandidate(directory:string){
 await validateProbabilityHistory(directory);
 const lock=new URL('./.archive-save.lock/',import.meta.url),stage=new URL('./.archive-staging/',import.meta.url);
 await mkdir(lock);
 try{
  try{await access(archiveDirectory);throw Error('Historical probability archive already exists; never overwrite it');}catch(error){if(!(error instanceof Error&&'code' in error&&error.code==='ENOENT'))throw error;}
  await cp(directory,stage,{recursive:true,force:false,errorOnExist:true});await validateProbabilityHistory(stage);
  await rename(stage,archiveDirectory);
 }finally{await rm(stage,{recursive:true,force:true});await rm(lock,{recursive:true,force:true});}
}
