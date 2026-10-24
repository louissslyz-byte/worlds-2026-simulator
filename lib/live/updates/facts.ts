import {z} from 'zod';
import {readFile} from 'node:fs/promises';
import {liveTeams} from '../identity';
import {semanticSHA256,sha256} from '../probability/model';
import {verifiedA1,type OfficialSnapshot} from '../probability/adapter';
const instant=z.string().datetime({offset:true}),hash=z.string().regex(/^[a-f0-9]{64}$/);
const match=z.object({matchId:z.string(),officialMatchId:z.string().regex(/^\d+$/),stage:z.literal('SWISS'),round:z.number().int().min(1).max(5),bracketPosition:z.string(),teamA:z.string(),teamB:z.string(),bestOf:z.union([z.literal(1),z.literal(3)]),scheduledAt:instant.nullable(),competitionTimeZone:z.literal('America/Chicago'),status:z.enum(['COMPLETED','SCHEDULED']),scoreA:z.number().int().nullable(),scoreB:z.number().int().nullable(),winnerId:z.string().nullable(),sourceIds:z.array(z.string()).min(1)}).strict();
export const updateSchema=z.object({schemaVersion:z.literal('live-swiss-update-v1.0'),snapshotId:z.string(),baseSnapshotId:z.string(),baseInputSHA256:hash,stateLabel:z.literal('SWISS_R1_COMPLETE_R2_DRAW_CONFIRMED'),completedRound:z.literal(1),asOf:instant,sourceCheckedAt:instant,drawPublishedAt:instant.nullable(),drawKnownBy:instant,nextRoundStartsAt:instant,temporalEvidence:z.string().min(1),sources:z.array(z.object({sourceId:z.string(),url:z.string().url(),checkedAt:instant,sha256:hash,bytes:z.number().int().positive(),verificationStatus:z.literal('OFFICIAL_VERIFIED')}).strict()).min(1),matches:z.array(match).length(16)}).strict();
export type SwissUpdate=z.infer<typeof updateSchema>;
export function factsInput(update:SwissUpdate){
 return {schemaVersion:update.schemaVersion,snapshotId:update.snapshotId,baseInputSHA256:update.baseInputSHA256,stateLabel:update.stateLabel,asOf:update.asOf,drawKnownBy:update.drawKnownBy,drawPublishedAt:update.drawPublishedAt,matches:[...update.matches].sort((a,b)=>a.matchId.localeCompare(b.matchId))};
}
export function validateSwissUpdate(input:unknown,official:OfficialSnapshot){
 const update=updateSchema.parse(input),known=new Map(liveTeams.map(t=>[t.id,t])),r1=update.matches.filter(m=>m.round===1),r2=update.matches.filter(m=>m.round===2),ids=official.state.swissParticipants.slice().sort().join('|');
 if(update.baseSnapshotId!==official.data.metadata.snapshotId||update.baseInputSHA256!==official.inputSHA256)throw Error('Wrong A1 base');
 if(Date.parse(update.asOf)<=Date.parse(official.data.metadata.asOf)||Date.parse(update.asOf)>=Date.parse(update.nextRoundStartsAt)||Date.parse(update.drawKnownBy)>Date.parse(update.asOf)||Date.parse(update.sourceCheckedAt)<Date.parse(update.asOf)||update.drawPublishedAt&&Date.parse(update.drawPublishedAt)>Date.parse(update.drawKnownBy))throw Error('Invalid historical boundary');
 const sources=new Map(update.sources.map(s=>[s.sourceId,s]));
 if(sources.size!==update.sources.length||update.sources.some(s=>new URL(s.url).hostname!=='lolesports.com'||Date.parse(s.checkedAt)>Date.parse(update.sourceCheckedAt)))throw Error('Invalid official evidence');
 if(!update.sources.some(s=>Date.parse(s.checkedAt)<=Date.parse(update.drawKnownBy)))throw Error('Draw known-by lacks observed evidence');
 if(new Set(update.matches.map(m=>m.matchId)).size!==16||new Set(update.matches.map(m=>m.officialMatchId)).size!==16)throw Error('Duplicate official match');
 const records:Record<string,{wins:number;losses:number}>=Object.fromEntries(official.state.swissParticipants.map(id=>[id,{wins:0,losses:0}]));
 for(const round of [r1,r2])if(round.length!==8||round.flatMap(m=>[m.teamA,m.teamB]).sort().join('|')!==ids)throw Error('Each round needs all 16 unique participants');
 for(const m of update.matches){
  if(!known.has(m.teamA)||!known.has(m.teamB)||m.teamA===m.teamB||m.bestOf!==1||m.sourceIds.some(id=>!sources.has(id)))throw Error('Invalid identity/BO/source');
  if(m.scheduledAt&&(m.round===1?Date.parse(m.scheduledAt)>Date.parse(update.asOf):Date.parse(m.scheduledAt)<Date.parse(update.nextRoundStartsAt)))throw Error('Schedule crosses cutoff');
  if(m.round===1){
   const old=official.data.matches.swiss.find(x=>[x.teamA,x.teamB].sort().join('|')===[m.teamA,m.teamB].sort().join('|'));
   if(!old||m.status!=='COMPLETED'||m.scoreA===null||m.scoreB===null||![0,1].includes(m.scoreA)||m.scoreA+m.scoreB!==1||m.winnerId!==(m.scoreA?m.teamA:m.teamB))throw Error('Invalid R1 result/draw');
   records[m.winnerId].wins++;records[m.winnerId===m.teamA?m.teamB:m.teamA].losses++;
  }else if(m.status!=='SCHEDULED'||m.scoreA!==null||m.scoreB!==null||m.winnerId!==null)throw Error('R2 must contain no real outcome');
 }
 if(Object.values(records).filter(r=>r.wins===1&&r.losses===0).length!==8||Object.values(records).filter(r=>r.wins===0&&r.losses===1).length!==8)throw Error('Invalid R1 standings');
 for(const m of r2)if(records[m.teamA].wins!==records[m.teamB].wins||r1.some(p=>[p.teamA,p.teamB].sort().join('|')===[m.teamA,m.teamB].sort().join('|')))throw Error('Illegal R2 record pool/rematch');
 if(Math.min(...r2.filter(m=>m.scheduledAt).map(m=>Date.parse(m.scheduledAt!)))!==Date.parse(update.nextRoundStartsAt))throw Error('Wrong earliest R2 start');
 return {update,records,factsSHA256:semanticSHA256(factsInput(update))};
}
export async function loadSwissUpdate(root=new URL('file://'+process.cwd()+'/lib/live/updates/')){
 const official=await verifiedA1(),index=JSON.parse(await readFile(new URL('facts/index.json',root),'utf8'));
 if(index.schemaVersion!=='live-swiss-update-index-v1.0'||index.entries.length!==1)throw Error('Unknown update index');
 const e=index.entries[0];if(!/^[-a-z0-9]+\.json$/.test(e.file))throw Error('Unsafe facts path');
 const bytes=await readFile(new URL('facts/'+e.file,root));if(sha256(bytes)!==e.fileSHA256)throw Error('Update file checksum mismatch');
 const checked=validateSwissUpdate(JSON.parse(bytes.toString()),official);
 if(e.snapshotId!==checked.update.snapshotId||e.factsSHA256!==checked.factsSHA256)throw Error('Update fact checksum mismatch');
 return {...checked,official};
}
