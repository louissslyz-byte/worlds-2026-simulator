import {advance,applyResult,makeMatch} from '../../sim/engine';
import type {SimulationSession} from '../../sim/types';
import {tournamentStateInput} from '../../sim/oddsMetadata';
import {createPostPlayInSession,type OfficialSnapshot} from '../probability/adapter';
import type {FrozenSystem} from '../probability/model';
import {semanticSHA256} from '../probability/model';
import {validateSwissUpdate,type SwissUpdate} from './facts';
/** Advance the original engine across completed R1, then install the verified known R2 draw.
 * The discarded random draw contains no simulated results. MC resets RNG per path.
 * No engine rules, probability functions or user session are altered. */
export function createSwissRound2Session(update:SwissUpdate,official:OfficialSnapshot,model:FrozenSystem){
 const {records}=validateSwissUpdate(update,official);
 let session=createPostPlayInSession(official,model);
 for(const fact of update.matches.filter(m=>m.round===1)){
  const m=session.tournamentState.matches.find(m=>m.stage==='SWISS'&&[m.teamA,m.teamB].sort().join('|')===[fact.teamA,fact.teamB].sort().join('|'))!;
  session=applyResult(session,m.id,fact.winnerId!,m.teamA===fact.teamA?fact.scoreA!:fact.scoreB!,m.teamA===fact.teamA?fact.scoreB!:fact.scoreA!,'OFFICIAL');
 }
 session=advance(session);
 session.tournamentState.matches=session.tournamentState.matches.filter(m=>m.stage!=='SWISS'||m.round!==2);
 for(const [i,m] of update.matches.filter(m=>m.round===2).entries())session.tournamentState.matches.push(makeMatch(session,`s2-${i+1}`,'SWISS',2,'官方瑞士轮第二轮',m.teamA,m.teamB,1));
 session.rngState=session.randomSeed;
 if(session.tournamentState.stage!=='SWISS'||session.tournamentState.round!==2||session.tournamentState.matches.length!==22||session.tournamentState.swissQualified.length||session.tournamentState.swissEliminated.length||semanticSHA256(session.tournamentState.swissRecords)!==semanticSHA256(records))throw Error('Invalid conditioned R2 state');
 return session;
}
export const stateSHA256=(session:SimulationSession)=>semanticSHA256(JSON.parse(tournamentStateInput(session)));
