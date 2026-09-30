import type {TournamentState,StrengthSource} from '../../lib/sim/types';
import {teamById} from '../../lib/sim/data';
import {teamRosters} from '../../lib/sim/rosters';
import {precomputedOdds} from '../../lib/sim/precomputed';
import {formatProbability} from '../../lib/sim/oddsConfig';
import {TeamLogo} from './team-logo';
import {RosterStrip} from './roster-strip';
const labels:Record<number,string>={1:'四分之一决赛',2:'半决赛',3:'总决赛'};
const english:Record<number,string>={1:'QUARTERFINAL',2:'SEMIFINAL',3:'FINAL'};
export function ChampionCard({state,strengthSource}:{state:TournamentState;strengthSource:StrengthSource}){
 const id=state.champion;if(!id)return null;
 const team=teamById(id);const swiss=state.swissRecords[id];
 const knockout=state.matches.filter(m=>m.stage==='KNOCKOUT'&&(m.teamA===id||m.teamB===id)).sort((a,b)=>a.round-b.round);
 const final=knockout.find(m=>m.round===3);
 const opponent=final?(final.teamA===id?final.teamB:final.teamA):null;
 const score=final?(final.teamA===id?[final.scoreA,final.scoreB]:[final.scoreB,final.scoreA]):null;
 return <section className="champion-section" id="champion" aria-labelledby="champion-title">
  <div className="champion-kicker">WORLD CHAMPION</div><div className="champion-edition">WORLDS 2026 · 模拟结果</div>
  <div className="champion-logo"><TeamLogo teamId={id} size={156}/></div>
  <h2 id="champion-title">{team?.shortName??id}</h2><p className="champion-full-name">{team?.name??id}</p><p className="champion-code">2026 世界冠军</p>
  {teamRosters[id]&&<section className="champion-roster" aria-label="冠军阵容"><div className="champion-subtitle"><span>CHAMPION ROSTER</span><h3>冠军阵容</h3></div><RosterStrip teamId={id}/></section>}
  {final&&score&&<div className="champion-final"><span className="technical-label">FINAL · 总决赛</span><div className="champion-final-score"><span className="final-winner"><TeamLogo teamId={id} size={32}/>{team?.shortName??id}</span><strong>{score[0]}<span>—</span>{score[1]}</strong><span className="final-loser"><TeamLogo teamId={opponent} size={32}/>{teamById(opponent!)?.shortName??opponent}</span></div></div>}
  <section className="champion-path"><div className="champion-subtitle"><span>ROAD TO THE TITLE</span><h3>夺冠之路</h3></div><ol>
   {swiss&&<li><span className="path-label"><small>SWISS</small>瑞士轮</span><strong>{swiss.wins}–{swiss.losses}</strong><span className="path-detail">胜负战绩</span></li>}
   {knockout.map(m=>{const other=m.teamA===id?m.teamB:m.teamA;const a=m.teamA===id?m.scoreA:m.scoreB;const b=m.teamA===id?m.scoreB:m.scoreA;return <li key={m.id}><span className="path-label"><small>{english[m.round]}</small>{labels[m.round]}</span><strong>{a}–{b}</strong><span className="path-detail"><TeamLogo teamId={other} size={24}/>{teamById(other)?.shortName??other}</span></li>})}
  </ol></section>
  <div className="champion-metadata">{strengthSource==='SYSTEM_MODEL'&&<div><span>赛前夺冠概率 · 系统参考</span><strong>{formatProbability(precomputedOdds.probabilities[id]??0)}</strong></div>}<div><span>实力来源</span><strong>{strengthSource==='SYSTEM_MODEL'?'RIOT GPR':'CUSTOM TIER LIST'}</strong></div>{strengthSource==='SYSTEM_MODEL'&&<div><span>赛前概率模拟次数</span><strong>{precomputedOdds.metadata.simulationCount.toLocaleString('en-US')}</strong></div>}</div>
  <p className="champion-disclaimer">此结果来自当前假设赛程，不代表正式赛事结果。</p>
 </section>;
}
