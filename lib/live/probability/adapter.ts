import {loadOfficialSnapshot} from '../load';
import {buildA2FactsInput,canonicalStringify} from '../input';
import {validateOfficialTournament} from '../validate';
import {createSession,makeMatch,applyResult} from '../../sim/engine';
import {assertMatchResult} from '../../sim/validation';
import type {SimulationSession} from '../../sim/types';
import type {FrozenSystem} from './model';
import {assertFrozenSystem,semanticSHA256} from './model';
import {LIVE_ODDS} from './config';
export type OfficialSnapshot=Awaited<ReturnType<typeof loadOfficialSnapshot>>;
export async function verifiedA1(){
 const official=await loadOfficialSnapshot(LIVE_ODDS.factsSnapshotId);
 if(official.inputSHA256!==LIVE_ODDS.factsInputSHA256||official.data.metadata.asOf!==LIVE_ODDS.post.asOf)throw Error('A1 facts do not match the approved A2 input');
 return official;
}
export function createPreTournamentSession(model:FrozenSystem){
 assertFrozenSystem(model);
 return createSession('SYSTEM_MODEL',model.ratings,undefined,LIVE_ODDS.pre.sessionSeed,undefined,'RANDOM');
}
const positions=[['UPPER_SEMIFINAL_1','p1a'],['UPPER_SEMIFINAL_2','p1b'],['UPPER_FINAL','p2u'],['LOWER_SEMIFINAL','p2l'],['LOWER_FINAL','p3'],['QUALIFICATION_FINAL','p4']] as const;
export function createPostPlayInSession(official:OfficialSnapshot,model:FrozenSystem):SimulationSession{
 assertFrozenSystem(model);
 const {data,state}=validateOfficialTournament(official.data),a2=buildA2FactsInput(data);
 if(a2.inputSHA256!==LIVE_ODDS.factsInputSHA256||official.inputSHA256!==a2.inputSHA256)throw Error('A1 fact hash mismatch');
 // Build from verified facts, not the caller's possibly mutated derived state.
 // No Play-In simulation, no random Swiss draw, no browser/user session access.
 let session=createSession('SYSTEM_MODEL',model.ratings,undefined,LIVE_ODDS.post.sessionSeed,undefined,'RANDOM');
 session.playInDrawMode='FIXED';session.scenarioMode=false;
 for(const [position,id] of positions){
  const fact=data.matches.playIn.find(m=>m.bracketPosition===position)!;
  session.tournamentState.matches.push(makeMatch(session,id,'PLAY_IN',fact.round,'官方入围赛',fact.teamA,fact.teamB,5));
  session=applyResult(session,id,fact.winnerId!,fact.scoreA!,fact.scoreB!,'OFFICIAL');
 }
 session.tournamentState={...session.tournamentState,stage:'SWISS',round:1,playInWinner:state.qualifiedToSwiss[0],swissRecords:structuredClone(state.swissRecords),swissQualified:[],swissEliminated:[],champion:null};
 // Canonical A1 order is stable and does NOT claim broadcast match order.
 for(const [i,fact] of a2.facts.swissRound1.entries())session.tournamentState.matches.push(makeMatch(session,`s1-${i+1}`,'SWISS',1,'官方瑞士轮首轮',fact.teamA,fact.teamB,1));
 assertPostPlayInSession(session,official,model);return session;
}
export function assertPostPlayInSession(session:SimulationSession,official:OfficialSnapshot,model:FrozenSystem){
 assertFrozenSystem(model);
 const validated=validateOfficialTournament(official.data),a2=buildA2FactsInput(official.data),state=session.tournamentState;
 if(a2.inputSHA256!==LIVE_ODDS.factsInputSHA256||official.inputSHA256!==a2.inputSHA256)throw Error('A1 facts changed');
 if(session.strengthSource!=='SYSTEM_MODEL'||session.tierListSnapshot||session.rulesVersion!==model.rulesVersion||session.tournamentStateVersion!==model.stateVersion||session.strengthVersion!==model.strengthVersion||session.systemModelVersion!==model.modelVersion||semanticSHA256(session.ratingSnapshot)!==semanticSHA256(model.ratings)||Object.keys(session.seedAssignments??{}).length)throw Error('Live Session model/identity mismatch');
 if(session.playInDrawMode!=='FIXED'||state.stage!=='SWISS'||state.round!==1||session.simulationStatus!=='ACTIVE'||state.champion||state.swissQualified.length||state.swissEliminated.length||state.playInWinner!==validated.state.qualifiedToSwiss[0]||canonicalStringify(state.swissRecords)!==canonicalStringify(validated.state.swissRecords)||state.matches.length!==14||new Set(state.matches.map(m=>m.id)).size!==14)throw Error('Invalid POST_PLAY_IN starting state');
 for(const [position,id] of positions){
  const m=state.matches.find(m=>m.id===id),fact=validated.data.matches.playIn.find(m=>m.bracketPosition===position)!;
  if(!m)throw Error('Missing completed Play-In match');assertMatchResult(m);
  if(m.stage!=='PLAY_IN'||m.round!==fact.round||m.format!==5||m.teamA!==fact.teamA||m.teamB!==fact.teamB||m.scoreA!==fact.scoreA||m.scoreB!==fact.scoreB||m.winner!==fact.winnerId||m.resultSource!=='OFFICIAL'||!m.locked)throw Error('Completed Play-In facts altered');
 }
 for(const [i,fact] of a2.facts.swissRound1.entries()){
  const m=state.matches.find(m=>m.id===`s1-${i+1}`);
  if(!m||m.stage!=='SWISS'||m.round!==1||m.teamA!==fact.teamA||m.teamB!==fact.teamB||m.format!==1||m.scoreA!==null||m.scoreB!==null||m.winner!==null||m.status!=='UNDECIDED'||m.resultSource!==null||m.locked)throw Error('Swiss first-round draw/results altered');
 }
}
export function assertConditioningPreserved(initial:SimulationSession,result:SimulationSession){
 for(const match of initial.tournamentState.matches){
  const end=result.tournamentState.matches.find(m=>m.id===match.id);
  if(!end||end.teamA!==match.teamA||end.teamB!==match.teamB||end.format!==match.format)throw Error('Known official pairing changed during simulation');
  if(match.status==='COMPLETE'&&(end.scoreA!==match.scoreA||end.scoreB!==match.scoreB||end.winner!==match.winner||end.resultSource!=='OFFICIAL'))throw Error('Known Play-In result changed during simulation');
 }
}
