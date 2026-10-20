import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {SystemRatingProvider} from '../../sim/ratings';
import {ratingConfig,MODEL_VERSION} from '../../sim/ratingConfig';
import {riotGprSnapshot} from '../../sim/gprSnapshot';
import {worlds2026} from '../../sim/worlds2026';
import {teams} from '../../sim/data';
import {canonicalStringify} from '../input';
import {LIVE_ODDS,ENGINE_FILES,STRENGTH_FILES,GENERATOR_FILES} from './config';
export const sha256=(bytes:string|Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
export const semanticSHA256=(value:unknown)=>sha256(canonicalStringify(value));
const hash=z.string().regex(/^[a-f0-9]{64}$/);
export const frozenSystemSchema=z.object({
 schemaVersion:z.literal('live-frozen-system-v1.0'),ratingVersion:z.string(),modelVersion:z.literal('gpr-prob-v1.1'),strengthVersion:z.literal('riot-gpr-2026-09-29-v2'),
 rulesVersion:z.literal('worlds-2026-official-draw-v2'),stateVersion:z.literal('worlds-state-v2'),rngVersion:z.string(),samplingVersion:z.string(),
 gprSnapshotDate:z.literal('2026-09-29'),parameters:z.object({eloDivisor:z.literal(400),gprScale:z.literal(0.85),referenceScore:z.number(),referenceRating:z.number()}).strict(),
 ratings:z.record(z.number().finite()),teams:z.array(z.object({teamId:z.string(),region:z.string(),gprRank:z.number().nullable(),gprScore:z.number().nullable(),rating:z.number()}).strict()).length(19),
 ratingInputSHA256:hash,rulesSHA256:hash,engineSourceSHA256:hash,strengthSourceSHA256:hash,sourceFiles:z.record(hash),
}).strict();
export type FrozenSystem=z.infer<typeof frozenSystemSchema>;
export async function currentFrozenSystem():Promise<FrozenSystem>{
 const ratings=new SystemRatingProvider().getRatings(),sourceFiles:Record<string,string>={},engine:Array<[string,string]>=[];
 for(const file of [...ENGINE_FILES,...STRENGTH_FILES]){
  const text=await readFile(new URL(`../../sim/${file}`,import.meta.url),'utf8');sourceFiles[file]=sha256(text);
  if((ENGINE_FILES as readonly string[]).includes(file))engine.push([file,text]);
 }
 const strength=Object.fromEntries(STRENGTH_FILES.map(file=>[file,sourceFiles[file]]));
 return frozenSystemSchema.parse({schemaVersion:'live-frozen-system-v1.0',ratingVersion:`system-${MODEL_VERSION}@${riotGprSnapshot.strengthVersion}`,modelVersion:MODEL_VERSION,strengthVersion:riotGprSnapshot.strengthVersion,
  rulesVersion:worlds2026.rulesVersion,stateVersion:worlds2026.tournamentStateVersion,rngVersion:worlds2026.rngVersion,samplingVersion:worlds2026.samplingVersion,gprSnapshotDate:riotGprSnapshot.sourceUpdatedAt,
  parameters:{eloDivisor:ratingConfig.eloDivisor,gprScale:ratingConfig.gpr.scoreScale,referenceScore:ratingConfig.gpr.referenceScore,referenceRating:ratingConfig.gpr.referenceRating},ratings,
  teams:teams.map(t=>({teamId:t.id,region:t.region,gprRank:t.officialGprRank??null,gprScore:t.officialGprScore??null,rating:ratings[t.id]})),
  ratingInputSHA256:sha256(JSON.stringify(Object.fromEntries(Object.entries(ratings).sort()))),rulesSHA256:sha256(JSON.stringify(worlds2026)),engineSourceSHA256:sha256(JSON.stringify(engine)),strengthSourceSHA256:semanticSHA256(strength),sourceFiles,
 });
}
export async function loadFrozenSystem(){
 const bytes=await readFile(new URL('./frozen-system-v1.json',import.meta.url)),model=frozenSystemSchema.parse(JSON.parse(bytes.toString('utf8'))),current=await currentFrozenSystem();
 if(semanticSHA256(model)!==semanticSHA256(current)||model.ratingInputSHA256!==LIVE_ODDS.ratingInputSHA256)throw Error('Frozen System strength/rules/source mismatch');
 return {model,modelSHA256:semanticSHA256(model),fileSHA256:sha256(bytes)};
}
export function assertFrozenSystem(model:FrozenSystem){
 frozenSystemSchema.parse(model);
 if(model.ratingInputSHA256!==LIVE_ODDS.ratingInputSHA256||sha256(JSON.stringify(Object.fromEntries(Object.entries(model.ratings).sort())))!==model.ratingInputSHA256)throw Error('Frozen rating input changed');
 if(new Set(model.teams.map(t=>t.teamId)).size!==19||Object.keys(model.ratings).length!==19||model.teams.some(t=>model.ratings[t.teamId]!==t.rating))throw Error('Frozen team identity/rating mismatch');
}
export async function generatorSourceSHA256(){
 const entries=[];for(const file of GENERATOR_FILES)entries.push([file,sha256(await readFile(new URL(`../../../${file}`,import.meta.url)))]);
 return semanticSHA256(entries);
}
