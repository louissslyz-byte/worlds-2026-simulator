// Converts reviewed public GOL snapshots; never changes simulation inputs.
import fs from 'node:fs';
import {profileTeams,profileRoster,stage3Scopes} from '../lib/team-profile/data.ts';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const segments=read('lib/team-profile/gol-segments.json').segments;
const matchData=read('lib/team-profile/gol-match-rows.json').players;
const ids=read('lib/team-profile/gol-player-mapping.json');
const officialMatches=read('lib/team-profile/qualification-results.json').matches;
const champions=read(process.argv[2]??'lib/team-profile/champion-catalog.json').data;
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const championMap=new Map(Object.values(champions).flatMap(c=>[[norm(c.name),c],[norm(c.id),c]]));
championMap.set('wukong',champions.MonkeyKing);
const expected={LCK:['LCK 2026 Rounds 3-4','LCK 2026 Season Playoffs'],LPL:['LPL 2026 Split 3','LPL 2026 Grand Finals'],LEC:['LEC 2026 Summer Season','LEC 2026 Summer Playoffs'],LCP:['LCP 2026 Split 3'],LCS:['LCS 2026 Summer','LCS 2026 Summer Playoffs'],CBLOL:['CBLOL 2026 Split 2','CBLOL 2026 Split 2 Playoffs']};
const pools={};const unavailable=[];
for(const team of profileTeams)for(const {player} of profileRoster(team.id).slots){
 if(!player)continue;
 const sourceRows=matchData[player.playerId];
 const rows=[...new Map((sourceRows?.rows??[]).map(r=>[r.line,r])).values()];
 const covered=rows.some(r=>r.date<'2026-07-01');
const chunks=[];
 const required=[...expected[team.region]];
 if(team.region==='LPL'&&officialMatches.some(m=>m.stage==='区域资格赛'&&(m.teamA===team.id||m.teamB===team.id)))required.push('LPL 2026 Regional Finals');
 for(const tournament of required){
  const candidates=segments.filter(s=>s.sourceUrl.match(/\/player-(?:stats|matchlist)\/(\d+)\//)?.[1]===String(ids[player.playerId])&&(s.tournament??decodeURIComponent(s.sourceUrl.split('tournament-')[1]?.split('/')[0]??''))===tournament);
  const segment=candidates.sort((a,b)=>b.totalGames-a.totalGames)[0];
  if(segment&&norm(segment.player)!==norm(player.playerId))throw Error(`Player identity mismatch: ${player.playerId}/${segment.player}`);
  const games=rows.filter(r=>r.tournament===tournament);
  if(segment&&(!covered||segment.totalGames>=games.length)){chunks.push({...segment,tournament});continue;}
  if(covered){
   const stats=new Map();
   for(const row of games){const key=norm(row.championName);const stat=stats.get(key)??{championName:row.championName,gamesPlayed:0,wins:0};stat.gamesPlayed++;stat.wins+=Number(row.won);stats.set(key,stat);}
   if(games.length)chunks.push({tournament,sourceUrl:sourceRows.url,totalGames:games.length,totalWins:games.filter(r=>r.won).length,stats:[...stats.values()]});
  }
 }
 if(chunks.length!==required.length){unavailable.push(player.playerId);continue;}
 // Older cached player pages can omit recent series. If a complete player
 // participation record cannot be reconciled with the official match snapshot,
 // keep it unpublished; don't assume either missing games or substitutions.
 const officialGames=officialMatches.filter(m=>m.teamA===team.id||m.teamB===team.id).reduce((n,m)=>n+m.scoreA+m.scoreB,0);
 const postseasonGames=team.region==='LCP'?chunks[0].totalGames:chunks.slice(1).reduce((n,s)=>n+s.totalGames,0);
 if(postseasonGames<officialGames){unavailable.push(player.playerId);continue;}
 const combined=new Map();
 for(const chunk of chunks)for(const stat of chunk.stats){
  const champion=championMap.get(norm(stat.championName));if(!champion)throw Error(`Unknown champion: ${stat.championName}`);
  const existing=combined.get(champion.id)??{championId:champion.id,championName:champion.name,gamesPlayed:0,wins:0};
  existing.gamesPlayed+=stat.gamesPlayed;existing.wins+=stat.wins;combined.set(champion.id,existing);
 }
 const sources=[...new Set(chunks.map(s=>s.sourceUrl))].map(url=>({label:'Games of Legends · 第三赛段统计',url,checkedAt:'2026-10-05',kind:'SECONDARY'}));
 pools[player.id]={status:'VERIFIED',scopeId:stage3Scopes[team.region].id,source:sources[0],sources,completeness:'COMPLETE',stats:[...combined.values()],segments:chunks.map(c=>({tournament:c.tournament,sourceUrl:c.sourceUrl,totalGames:c.totalGames,totalWins:c.totalWins})),snapshotDate:'2026-10-05',note:'按来源当前记录汇总；仍在进行的联赛将随后续比赛更新。'};
}
fs.writeFileSync('lib/team-profile/champion-pools.json',JSON.stringify({checkedAt:'2026-10-05',pools,availability:{status:'UNAVAILABLE',reason:'该选手的完整第三赛段数据尚未核验。',attemptedSources:['https://gol.gg/','https://liquipedia.net/leagueoflegends/'],notes:'统计来源为第三方 GOL，不属于 Riot 官方统计。无法取得完整覆盖时不发布部分英雄池。'}},null,2)+'\n');
console.log(JSON.stringify({verified:Object.keys(pools).length,unavailable}));
