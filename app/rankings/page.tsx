import Link from 'next/link';
import {teams} from '../../lib/sim/data';
import {SystemRatingProvider} from '../../lib/sim/ratings';
import {precomputedOdds,assertPrecomputedOddsCurrent} from '../../lib/sim/precomputed';
import {formatProbability} from '../../lib/sim/oddsConfig';
import {riotGprSnapshot} from '../../lib/sim/gprSnapshot';
import {TeamIdentity} from '../../components/tournament/team-identity';
import {ProbabilityBar} from '../../components/tournament/probability-bar';
import {DataStatus} from '../../components/tournament/data-status';

export default function Rankings(){
 assertPrecomputedOddsCurrent();
 const ratings=new SystemRatingProvider().getRatings();
 const list=[...teams].sort((a,b)=>ratings[b.id]-ratings[a.id]);
 return <main className="shell"><div className="page-head"><div><div className="eyebrow">WORLDS 2026 / 实力榜</div><h1>系统实力榜</h1><p>Riot GPR 是官方实力数据；模型评分和夺冠概率由本站计算。未确定队伍的席位使用回退评分。</p></div><Link className="button" href="/simulator/new">用系统模型开始 →</Link></div>
  <DataStatus/>
  <div className="panel rankings-desktop"><table className="data-table"><thead><tr><th>模型排名</th><th>队伍</th><th>赛区</th><th>种子</th><th>官方 GPR</th><th>模型评分</th><th>夺冠概率</th></tr></thead><tbody>{list.map((t,i)=>{const p=precomputedOdds.probabilities[t.id]??0;return <tr key={t.id}><td className="rank-num">{String(i+1).padStart(2,'0')}</td><td><Link className="rank-team-cell" href={`/teams/${t.slug}`}><TeamIdentity teamId={t.id} size={34} showName showRegion={false}/></Link></td><td><span className="region-badge">{t.region}</span></td><td>#{t.seed}{!t.confirmed&&<small> · 待定</small>}</td><td>{t.officialGprRank?<span className="gpr-score"><strong>#{t.officialGprRank}</strong><small>{t.officialGprScore} 分</small></span>:<span className="data-fallback">待定 · 回退</span>}</td><td className="accent"><b>{ratings[t.id].toFixed(1)}</b></td><td className="rank-prob-cell"><strong>{formatProbability(p)}</strong><ProbabilityBar a={p} label={`${t.shortName} 夺冠概率 ${formatProbability(p)}`}/></td></tr>})}</tbody></table></div>
  <div className="rankings-mobile">{list.map((t,i)=>{const p=precomputedOdds.probabilities[t.id]??0;return <Link className="mobile-ranking-row" href={`/teams/${t.slug}`} key={t.id}><span className="rank-num">{String(i+1).padStart(2,'0')}</span><TeamIdentity teamId={t.id} size={34} showName showRegion/><span className="mobile-ranking-metrics"><strong>{formatProbability(p)}</strong><small>{t.officialGprRank?`GPR #${t.officialGprRank} · ${t.officialGprScore}`:'GPR 待定 · 回退'}</small><ProbabilityBar a={p} label={`${t.shortName} 夺冠概率 ${formatProbability(p)}`}/></span></Link>})}</div>
  <p className="fine">官方 GPR 快照：<a href={riotGprSnapshot.sourceUrl} target="_blank" rel="noopener noreferrer">LoL Esports ↗</a>。GPR 分数不是夺冠概率。</p>
 </main>;
}
