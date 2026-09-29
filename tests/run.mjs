import assert from 'node:assert/strict';
import {createSession,applyResult,simulateRemaining,advance,simulateEntireWorlds,editPreviousRound,forkOfficialScenario} from '../lib/sim/engine.ts';
import {SystemRatingProvider,defaultTierList,generateRatingsFromTierList,gameProbability,validateTierList} from '../lib/sim/ratings.ts';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo.ts';
import {teams} from '../lib/sim/data.ts';
try{
 assert.equal(teams.length,19);assert.equal(new Set(teams.map(t=>t.id)).size,19);
 assert.deepEqual(teams.filter(t=>t.region==='LPL').sort((a,b)=>a.seed-b.seed).map(t=>t.id),['AL','BLG','TES','IG']);
 assert.deepEqual(teams.filter(t=>t.region==='LCK').sort((a,b)=>a.seed-b.seed).map(t=>t.id),['GEN','HLE','T1','DK']);
 assert.deepEqual(teams.filter(t=>t.region==='LEC').sort((a,b)=>a.seed-b.seed).map(t=>t.id),['G2','MKOI','KC']);
 assert.deepEqual(teams.filter(t=>t.playIn).map(t=>t.id),['KC','MVK','LCS#3','CBLOL#2']);
 assert.ok(!teams.some(t=>t.id==='JDG'));
 const ratings=new SystemRatingProvider().getRatings();
 const base=createSession('SYSTEM_MODEL',ratings,undefined,42);
 const full=simulateEntireWorlds(base);assert.ok(full.tournamentState.champion);assert.equal(full.simulationStatus,'COMPLETE');
 const first=base.tournamentState.matches[0];const manual=applyResult(base,first.id,first.teamA,3,1,'MANUAL');const mixed=simulateRemaining(manual);assert.equal(mixed.tournamentState.matches[0].resultSource,'MANUAL');assert.equal(mixed.tournamentState.matches[0].scoreB,1);assert.equal(mixed.tournamentState.matches[1].resultSource,'SIMULATION');
 const official=applyResult(base,first.id,first.teamA,3,0,'OFFICIAL');assert.throws(()=>applyResult(official,first.id,first.teamB,0,3,'MANUAL'));const scenario=forkOfficialScenario(official,first.id);assert.equal(official.tournamentState.matches[0].resultSource,'OFFICIAL');assert.equal(scenario.tournamentState.matches[0].locked,false);assert.equal(applyResult(scenario,first.id,first.teamB,0,3,'MANUAL').tournamentState.matches[0].winner,first.teamB);
 const played=simulateEntireWorlds(manual);assert.equal(played.tournamentState.matches[0].resultSource,'MANUAL');assert.equal(played.tournamentState.matches[0].scoreB,1);
 const swissStart=(()=>{let s=createSession('SYSTEM_MODEL',ratings,undefined,42);while(s.tournamentState.stage==='PLAY_IN')s=advance(simulateRemaining(s));return s})();
 const swissMatches=swissStart.tournamentState.matches.filter(m=>m.stage==='SWISS');let swiss=swissStart;for(let i=0;i<swissMatches.length/2;i++){const m=swissMatches[i];swiss=applyResult(swiss,m.id,m.teamA,1,0,'MANUAL')}swiss=simulateRemaining(swiss);swiss=advance(swiss);assert.equal(swiss.tournamentState.stage,'SWISS');assert.equal(swiss.tournamentState.round,2);assert.equal(Object.values(swiss.tournamentState.swissRecords).reduce((a,r)=>a+r.wins,0),8);
 const edited=editPreviousRound(swiss,swissMatches[0].id);assert.equal(edited.tournamentState.round,1);assert.equal(edited.tournamentState.matches.some(m=>m.stage==='SWISS'&&m.round===2),false);assert.equal(edited.tournamentState.matches.find(m=>m.id===swissMatches[0].id).locked,false);
 const again=simulateEntireWorlds(base);assert.equal(again.tournamentState.champion,full.tournamentState.champion);assert.deepEqual(again.tournamentState.matches.map(m=>[m.winner,m.scoreA,m.scoreB]),full.tournamentState.matches.map(m=>[m.winner,m.scoreA,m.scoreB]));
 const tier=defaultTierList();assert.equal(validateTierList(tier),null);const custom=generateRatingsFromTierList(tier);const moved={...tier,S:[...tier.S].reverse()};const altered=generateRatingsFromTierList(moved);assert.notEqual(gameProbability(custom[tier.S[0]],custom[tier.S[1]]),gameProbability(altered[tier.S[0]],altered[tier.S[1]]));const mc=runMonteCarloFromState(manual,50,42);assert.ok(mc.iterations>0);const mcOther=runMonteCarloFromState(createSession('CUSTOM_TIER_LIST',altered,moved,42),50,42);assert.ok(mcOther.iterations>0);assert.notDeepEqual(mc.probabilities,mcOther.probabilities);
 console.log('11 个关键场景通过：完整赛事、混合结果、官方锁定、独立假设场景、手动优先、瑞士轮、回退、固定种子、自定义评分、条件概率、不同 Tier 分布。');
}catch(e){console.error(e);process.exitCode=1}
