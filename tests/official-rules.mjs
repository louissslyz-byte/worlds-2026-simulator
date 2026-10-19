import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createSession,simulateEntireWorlds,advance,simulateRemaining,applyResult,clearResult,editPreviousRound,drawSwiss} from '../lib/sim/engine.ts';
import {SystemRatingProvider,defaultTierList,generateRatingsFromTierList} from '../lib/sim/ratings.ts';
import {teams} from '../lib/sim/data.ts';
import {worlds2026} from '../lib/sim/worlds2026.ts';
import {drawSwissFirstRound,drawKnockoutPairs,legalPairings,samplePairing,swissPools} from '../lib/sim/draws.ts';
import {randomIndex} from '../lib/sim/random.ts';
import {runMonteCarloFromState,SimulationFailure} from '../lib/sim/monteCarlo.ts';
import {assertCompletedTournament,assertEventCounts} from '../lib/sim/validation.ts';
import {tournamentStateHash} from '../lib/sim/oddsMetadata.ts';
import {isCurrentRulesSession,persistNewSession} from '../lib/sim/sessionCompatibility.ts';
assert.throws(()=>randomIndex({rngState:1},0));assert.equal(randomIndex({rngState:1},1),0);
const ratings=new SystemRatingProvider().getRatings();
const make=(seed=2026)=>createSession('SYSTEM_MODEL',ratings,undefined,seed);
const key=pairs=>pairs.map(pair=>[...pair].sort().join(':')).sort().join('|');
const reports=[];
function frequencies(options,sample,n,name){const counts=Object.fromEntries(options.map(k=>[k,0]));for(let i=0;i<n;i++){const k=sample();assert.ok(k in counts,`${name}: illegal result ${k}`);counts[k]++;}const expected=n/options.length;const chiSquare=Object.values(counts).reduce((sum,v)=>sum+(v-expected)**2/expected,0);assert.ok(Object.values(counts).every(v=>v>0));assert.ok(chiSquare<options.length+8*Math.sqrt(2*options.length),`${name}: chiSquare=${chiSquare}`);reports.push({name,samples:n,legalOptions:options.length,chiSquare,min:Math.min(...Object.values(counts)),max:Math.max(...Object.values(counts))});}
const six=['A','B','C','D','E','F'];
assert.equal(legalPairings(six,()=>true).length,15);
assert.equal(new Set(legalPairings(six,()=>true).map(key)).size,15);
assert.throws(()=>legalPairings(['A','A'],()=>true));
assert.throws(()=>samplePairing(['A','B'],()=>false,make()),/不存在/);
const ordered=make(7),reversed=structuredClone(ordered);
assert.deepEqual(samplePairing(six,()=>true,ordered),samplePairing([...six].reverse(),()=>true,reversed));
const stream=make(7);frequencies(legalPairings(six,()=>true).map(key),()=>key(samplePairing(six,()=>true,stream)),30000,'6队全部15种合法配对');
const regions=Object.fromEntries(teams.map(t=>[t.id,t.region]));
const draws=make(1024);draws.tournamentState.playInWinner='KC';const pools=swissPools(draws);
for(const [a,b]of [[0,3],[1,2]]){
 const left=new Set(pools[a]);const allowed=(x,y)=>left.has(x)!==left.has(y)&&regions[x]!==regions[y];
 const options=legalPairings([...pools[a],...pools[b]],allowed).map(key);
 frequencies(options,()=>key(samplePairing([...pools[b],...pools[a]],allowed,draws)),20000,`Swiss池${a+1}对${b+1}`);
}
for(const winner of ['KC','C9','FUR','MVK']){
 const s=make(42);s.tournamentState.playInWinner=winner;
 assert.ok(swissPools(s)[3].includes(winner));
 for(let n=0;n<100;n++){
  const pairs=drawSwissFirstRound(s),byId=new Map(swissPools(s).flatMap((ids,i)=>ids.map(id=>[id,i])));
  assert.equal(pairs.length,8);assert.equal(new Set(pairs.flat()).size,16);
  for(const [a,b]of pairs){assert.equal(byId.get(a)+byId.get(b),3);assert.notEqual(regions[a],regions[b]);}
 }
}
const bracket=make(9);bracket.tournamentState.swissQualified=['GEN','HLE','AL','BLG','G2','T1','DK','TES'];
bracket.tournamentState.swissRecords=Object.fromEntries(bracket.tournamentState.swissQualified.map((id,i)=>[id,{wins:3,losses:i<2?0:i<5?1:2}]));
const opponentCounts={T1:0,DK:0,TES:0},positions=[0,0,0,0];let sameRegion=0;
for(let n=0;n<15000;n++){
 const pairs=drawKnockoutPairs(bracket);assert.equal(new Set(pairs.flat()).size,8);
 const indices=['GEN','HLE'].map(id=>pairs.findIndex(pair=>pair.includes(id)));
 assert.notEqual(Math.floor(indices[0]/2),Math.floor(indices[1]/2));positions[indices[0]]++;
 for(const id of ['GEN','HLE']){const pair=pairs.find(p=>p.includes(id));const other=pair.find(x=>x!==id);assert.ok(['T1','DK','TES'].includes(other));if(id==='GEN')opponentCounts[other]++;}
 sameRegion+=pairs.filter(([a,b])=>regions[a]===regions[b]).length;
 const rest=pairs.filter(p=>!p.includes('GEN')&&!p.includes('HLE')).map(p=>p.map(id=>bracket.tournamentState.swissRecords[id].losses).sort().join('-')).sort();assert.deepEqual(rest,['1-1','1-2']);
}
assert.ok(sameRegion>0);for(const count of Object.values(opponentCounts))assert.ok(Math.abs(count-5000)<400);for(const count of positions)assert.ok(Math.abs(count-3750)<350);
reports.push({name:'八强抽签',samples:15000,genOpponents:opponentCounts,genSlots:positions,sameRegionSeries:sameRegion});
const playInPairs=new Set(),winners=new Set();let laterSameRegion=0;
for(let seed=1;seed<=200;seed++){
 const start=make(seed);playInPairs.add(key(start.tournamentState.matches.map(m=>[m.teamA,m.teamB])));
 const full=simulateEntireWorlds(start);assertCompletedTournament(full);winners.add(full.tournamentState.playInWinner);
 laterSameRegion+=full.tournamentState.matches.filter(m=>m.stage==='SWISS'&&m.round>1&&regions[m.teamA]===regions[m.teamB]).length;
}
assert.equal(playInPairs.size,3);assert.equal(winners.size,4);assert.ok(laterSameRegion>0);
const manualBase=make(),first=manualBase.tournamentState.matches[0];
assert.throws(()=>applyResult(manualBase,first.id,first.teamA,3,-1,'MANUAL'));
assert.throws(()=>applyResult(manualBase,first.id,first.teamA,3,0.5,'MANUAL'));
const manual=applyResult(manualBase,first.id,first.teamA,3,1,'MANUAL');
const input=JSON.stringify(manual);const full=simulateEntireWorlds(manual);assert.equal(JSON.stringify(manual),input);assert.equal(full.tournamentState.matches.find(m=>m.id===first.id).scoreB,1);
assertCompletedTournament(full);
const legacy=structuredClone(full);delete legacy.rulesVersion;delete legacy.tournamentStateVersion;
const raw=JSON.stringify(legacy);assert.ok(!isCurrentRulesSession(legacy));
for(const action of [simulateRemaining,simulateEntireWorlds,advance,s=>applyResult(s,first.id,first.teamA,3,0,'MANUAL'),s=>clearResult(s,first.id),s=>editPreviousRound(s,first.id)])assert.throws(()=>action(legacy),/旧版赛事规则/);
assert.equal(JSON.stringify(legacy),raw);
const map=new Map([['worlds2026-session',raw]]),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
persistNewSession(storage,make(99));assert.ok([...map].some(([k,v])=>k.startsWith('worlds2026-session-archive:')&&v===raw));assert.ok(isCurrentRulesSession(JSON.parse(map.get('worlds2026-session'))));
assert.throws(()=>persistNewSession({getItem:k=>k==='worlds2026-session'?raw:null,setItem:()=>{throw Error('quota');}},make()),/quota/);
const bad=make();bad.tournamentState.matches[0].scoreA=3;bad.tournamentState.matches[0].scoreB=0;bad.tournamentState.matches[0].winner=bad.tournamentState.matches[0].teamA;bad.tournamentState.matches[0].status='COMPLETE';bad.tournamentState.matches[0].format=3;
assert.throws(()=>runMonteCarloFromState(bad,10,88),e=>e instanceof SimulationFailure&&e.context.sampleIndex===0&&e.context.sampleSeed===88&&e.context.completedCount===0);
const hash=tournamentStateHash(manualBase);assert.notEqual(hash,tournamentStateHash({...manualBase,rulesVersion:'legacy'}));assert.notEqual(hash,tournamentStateHash({...manualBase,playInDrawMode:'RANDOM'}));
const oldFlag=worlds2026.drawRestrictions.avoidSameRegionRound1Only;try{worlds2026.drawRestrictions.avoidSameRegionRound1Only=false;assert.notEqual(hash,tournamentStateHash(manualBase));}finally{worlds2026.drawRestrictions.avoidSameRegionRound1Only=oldFlag;}
const mc=runMonteCarloFromState(manual,100,2026),repeat=runMonteCarloFromState(manual,100,2026);assert.deepEqual(mc.counts,repeat.counts);assertEventCounts(mc.counts,100);
let mid=manual;while(mid.tournamentState.stage!=='SWISS'||mid.tournamentState.round<4)mid=advance(simulateRemaining(mid));
assert.throws(()=>drawSwiss(mid),/不能重复/);
const conditional=runMonteCarloFromState(mid,100,2026);for(const id of mid.tournamentState.swissEliminated){assert.equal(conditional.counts.champion[id],0);assert.equal(conditional.counts.swiss[id],100);}
const custom=createSession('CUSTOM_TIER_LIST',generateRatingsFromTierList(defaultTierList()),defaultTierList(),2026);assertCompletedTournament(simulateEntireWorlds(custom));assertEventCounts(runMonteCarloFromState(custom,50,42).counts,50);
const blank=createSession('SYSTEM_MODEL',ratings,undefined,2026,undefined,'RANDOM');assert.equal(blank.tournamentState.matches.length,0);
assert.equal(runMonteCarloFromState(blank,50,42).metadata.rulesVersion,worlds2026.rulesVersion);
const workerSource=await readFile(new URL('../app/simulator/odds-worker.ts',import.meta.url),'utf8');assert.ok(workerSource.includes("from '../../lib/sim/monteCarlo'"));
const workerGlobal={};globalThis.self=workerGlobal;await import('../app/simulator/odds-worker.ts');let workerResult;workerGlobal.postMessage=value=>{workerResult=value;};workerGlobal.onmessage({data:{session:manual,iterations:100,seed:2026}});assert.deepEqual(workerResult.result.counts,mc.counts);delete globalThis.self;
if(process.env.RULES_AUDIT_OUTPUT)await writeFile(process.env.RULES_AUDIT_OUTPUT,JSON.stringify({reports,completeSyntheticTournaments:200,playInPairings:playInPairs.size,playInWinners:winners.size,laterSameRegionSeries:laterSameRegion,rulesVersion:worlds2026.rulesVersion,ratingSHA256:createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(ratings).sort()))).digest('hex')},null,2)+'\n');
console.log('正式赛制专项通过：四档、动态席位、同战绩/无重赛、BO、八强半区、严格MC、Worker、旧存档保护。',reports);
