import {notFound} from 'next/navigation';
import Link from 'next/link';
import {teams} from '../../../lib/sim/data';
import {teamRosters,playerRoles} from '../../../lib/sim/rosters';
import {TeamLogo} from '../../../components/tournament/team-logo';
import {RegionBadge} from '../../../components/tournament/team-identity';
import {precomputedOdds} from '../../../lib/sim/precomputed';
import {formatProbability} from '../../../lib/sim/oddsConfig';
import {worlds2026} from '../../../lib/sim/worlds2026';

export default async function TeamPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const team=teams.find(t=>t.slug===slug);
 if(!team)notFound();
 const roster=teamRosters[team.id];
 return <main className="shell team-page">
  <div className="page-head"><div><div className="eyebrow">2026 全球总决赛 / 参赛队伍</div><div className="team-detail-title"><TeamLogo teamId={team.id} size={92}/><div><h1>{team.name}</h1><div className="team-subline"><strong>{team.id}</strong><RegionBadge region={team.region}/><span>{team.officialSeed?`#${team.officialSeed} 种子`:'种子待定'}</span></div></div></div><p>{team.confirmed?'参赛队伍与当前公开选手名单。':'该种子席位的最终队伍尚未确定，选手名单也暂无法对应。'}</p></div><Link href="/rankings" className="button secondary">返回实力榜</Link></div>
  <section className="roster-section" aria-labelledby="roster-title"><div className="section-title"><div><div className="eyebrow">TEAM ROSTER</div><h2 id="roster-title">选手名单</h2></div><span className="fine">{roster?'五名位置选手':'名单待核对'}</span></div>
   {roster?<><div className="roster-grid">{playerRoles.map((role,index)=><div className="roster-player" key={role.key}><span className="roster-role">{role.label}</span><strong>{roster.players[index]}</strong><small>{role.key}</small></div>)}</div><p className="roster-source">名单来源：<a href={roster.source} target="_blank" rel="noopener noreferrer">Liquipedia ↗</a> · 2026 年 9 月 29 日核对。</p></>:<div className="roster-pending"><strong>名单待定</strong><p>参赛身份已确认的队伍将在核对最新阵容后补充选手；尚未确认的席位继续保留待定。</p></div>}
  </section>
  <div className="team-metrics"><div><span className="metric-label">官方 Riot GPR</span><strong>{team.officialGprRank?`#${team.officialGprRank} · ${team.officialGprScore} 分`:'GPR 暂无 · 回退模型'}</strong></div><div><span className="metric-label">进入淘汰赛</span><strong>{formatProbability(precomputedOdds.knockoutProbabilities[team.id]??0)}</strong></div><div><span className="metric-label">进入半决赛</span><strong>{formatProbability(precomputedOdds.semifinalProbabilities[team.id]??0)}</strong></div><div><span className="metric-label">进入总决赛</span><strong>{formatProbability(precomputedOdds.finalProbabilities[team.id]??0)}</strong></div><div><span className="metric-label">夺冠概率</span><strong>{formatProbability(precomputedOdds.probabilities[team.id]??0)}</strong></div></div>
  <div className="team-profile-bottom"><p>模型：{worlds2026.modelVersion} · 概率来自 {precomputedOdds.metadata.simulationCount.toLocaleString('en-US')} 次赛前模拟。</p><Link href="/simulator/new" className="button">用这支队伍开始模拟</Link></div>
 </main>;
}
