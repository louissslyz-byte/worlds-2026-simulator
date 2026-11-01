// R5 complete, explicitly excluding the subsequent official knockout draw.
import {readFile} from 'node:fs/promises';
import {z} from 'zod';
import {loadRound4Facts,loadRound4History,createSwissRound5Session} from './round4';
import {applyResult} from '../../sim/engine';
import {assertEventCounts,type EventCounts} from '../../sim/validation';
import {probabilitySnapshotSchema} from '../probability/schema';
import {EVENTS} from '../probability/config';
import {sha256,semanticSHA256,type FrozenSystem} from '../probability/model';
import {stateSHA256} from './adapter';
export const ROUND5_SEED=20261101;
export const ROUND5_ID='worlds-2026-swiss-r5-before-knockout-draw-probability-v1';
export const round5Schema=probabilitySnapshotSchema.extend({schemaVersion:z.literal('live-probability-snapshot-v1.5'),label:z.literal('SWISS-R5-COMPLETE')});
const factSchema=z.object({snapshotId:z.literal('worlds-2026-swiss-r5-complete-before-draw-v1'),baseFactsSHA256:z.string().length(64),asOf:z.string().datetime(),checkedAt:z.string().datetime(),sourceUrl:z.literal('https://lolesports.com/en-SG/tournament/115660540725177488/stage/115660540725570706'),evidenceSHA256:z.string().length(64),conditioning:z.literal('All Swiss results through R5; excludes official knockout draw. As-of is evidence observation, not a claimed draw publication time.'),results:z.array(z.object({officialMatchId:z.string(),teamA:z.string(),teamB:z.string(),scoreA:z.number().int().min(0).max(2),scoreB:z.number().int().min(0).max(2)}).strict()).length(3)}).strict();
export async function loadRound5Facts(root=process.cwd(),official?:import('../probability/adapter').OfficialSnapshot){
 const previous=await loadRound4Facts(root,official),f=factSchema.parse(JSON.parse(await readFile(`${root}/lib/live/updates/round5/facts.json`,'utf8')));
 if(f.baseFactsSHA256!==previous.factsSHA256||Date.parse(f.asOf)<=Date.parse(previous.update.asOf)||Date.parse(f.checkedAt)<Date.parse(f.asOf))throw Error('R5 base/time mismatch');
 const matches=structuredClone(previous.update.matches),records=structuredClone(previous.records),seen=new Set<string>();
 for(const r of f.results){const m=matches.find(m=>m.officialMatchId===r.officialMatchId&&m.round===5);if(!m||seen.has(m.matchId)||m.teamA!==r.teamA||m.teamB!==r.teamB||Math.max(r.scoreA,r.scoreB)!==2||Math.min(r.scoreA,r.scoreB)>=2)throw Error('R5 identity/draw/score invalid');seen.add(m.matchId);m.status='COMPLETED';m.scoreA=r.scoreA;m.scoreB=r.scoreB;m.winnerId=r.scoreA>r.scoreB?r.teamA:r.teamB;records[m.winnerId].wins++;records[m.winnerId===m.teamA?m.teamB:m.teamA].losses++;}
 if(Object.values(records).filter(r=>r.wins===3).length!==8||Object.values(records).filter(r=>r.losses===3).length!==8||[0,1,2].map(l=>Object.values(records).filter(r=>r.wins===3&&r.losses===l).length).join()!=='2,3,3')throw Error('R5 standings invalid');
 return {facts:f,previous,matches,records,factsSHA256:semanticSHA256(f)};
}
export function createBeforeDrawSession(f:Awaited<ReturnType<typeof loadRound5Facts>>,model:FrozenSystem){let s=createSwissRound5Session(f.previous.update,f.previous.previous,model);for(const fact of f.matches.filter(m=>m.round===5)){const m=s.tournamentState.matches.find(m=>m.stage==='SWISS'&&m.round===5&&m.teamA===fact.teamA&&m.teamB===fact.teamB);if(!m)throw Error('Missing fixed R5');s=applyResult(s,m.id,fact.winnerId!,fact.scoreA!,fact.scoreB!,'OFFICIAL');}if(s.tournamentState.stage!=='SWISS'||s.tournamentState.matches.some(m=>m.stage==='KNOCKOUT'))throw Error('Draw already fixed');return s;}
export function validateRound5Snapshot(input:unknown,f:Awaited<ReturnType<typeof loadRound5Facts>>,model:FrozenSystem){const s=round5Schema.parse(input);for(const k of ['ratingInputSHA256','rulesVersion','stateVersion','strengthVersion','ratingVersion','rulesSHA256','engineSourceSHA256','strengthSourceSHA256','rngVersion','samplingVersion'] as const)if(s[k]!==model[k])throw Error('R5 model mismatch '+k);
 if(s.modelVersion!==model.modelVersion||s.probabilityModelVersion!==model.modelVersion||s.frozenModelSHA256!==semanticSHA256(model)||s.factsInputSHA256!==f.factsSHA256||s.factsSnapshotId!==f.facts.snapshotId||s.snapshotId!==ROUND5_ID||s.asOf!==f.facts.asOf||s.knownDrawIds.length||s.randomSeed!==ROUND5_SEED||s.simulationInputSHA256!==stateSHA256(createBeforeDrawSession(f,model)))throw Error('R5 conditioning mismatch');
 if(new Set(s.teams.map(t=>t.teamId)).size!==19||s.teams.map(t=>t.teamId).sort().join()!==model.teams.map(t=>t.teamId).sort().join())throw Error('R5 team identities invalid');
 const counts=Object.fromEntries(EVENTS.map(e=>[e,Object.fromEntries(s.teams.map(t=>[t.teamId,t[`${e}Count`]]))])) as EventCounts;assertEventCounts(counts,100000);if(semanticSHA256(counts)!==s.countSHA256)throw Error('R5 count SHA mismatch');
 for(const t of s.teams){for(const e of EVENTS)if(t[`${e}Probability`]!==t[`${e}Count`]/100000)throw Error('R5 probability mismatch');const r=f.records[t.teamId];if(t.swissCount!==(r?100000:0)||t.knockoutCount!==(r?.wins===3?100000:0)||r?.wins!==3&&EVENTS.slice(1).some(e=>t[`${e}Count`]!==0))throw Error('R5 qualification invalid');}return s;
}
export async function loadRound5History(model:FrozenSystem,root=process.cwd(),official?:import('../probability/adapter').OfficialSnapshot){
 await loadRound4History(model,root,official);const f=await loadRound5Facts(root,official),dir=`${root}/lib/live/updates/round5`,index=JSON.parse(await readFile(`${dir}/index.json`,'utf8')),bytes=await readFile(`${dir}/probability.json`);
 if(index.baseHistorySHA256!==sha256(await readFile(`${root}/lib/live/updates/round4/index.json`))||index.sha256!==sha256(bytes)||index.factsSHA256!==f.factsSHA256)throw Error('R5 archive lock mismatch');return {...f,snapshot:validateRound5Snapshot(JSON.parse(bytes.toString()),f,model)};
}
