import Link from 'next/link';
import {teams} from '../../lib/sim/data';
import {precomputedOdds,assertPrecomputedOddsCurrent} from '../../lib/sim/precomputed';
import {formatProbability} from '../../lib/sim/oddsConfig';
import {riotGprSnapshot} from '../../lib/sim/gprSnapshot';
import {TeamIdentity} from '../../components/tournament/team-identity';
import {ProbabilityBar} from '../../components/tournament/probability-bar';
import {DataStatus} from '../../components/tournament/data-status';

export default function Rankings(){
 assertPrecomputedOddsCurrent();
 const list=[...teams].sort((a,b)=>(a.officialGprRank??999)-(b.officialGprRank??999));
 return <main className="shell"><div className="page-head"><div><div className="eyebrow">WORLDS 2026 / 实力榜</div><h1>Riot GPR 实力榜</h1><p>按 Riot GPR 排名排序，无 GPR 的队伍置后。晋级与夺冠概率由本站模拟计算。</p></div><Link className="button" href="/simulator/new">用系统模型开始 →</Link></div>
  <DataStatus/>
  <div className="panel rankings-desktop"><table className="data-table"><thead><tr><th>顺序</th><th>队伍</th><th>赛区</th><th>种子</th><th>官方 GPR</th><th>进入淘汰赛</th><th>夺冠概率</th></tr></thead><tbody>{list.map((t,i)=>{const p=precomputedOdds.probabilities[t.id]??0;return <tr key={t.id}><td className="rank-num">{String(i+1).padStart(2,'0')}</td><td><Link className="rank-team-cell" href={`/teams/${t.slug}`}><TeamIdentity teamId={t.id} size={34} showName showRegion={false}/></Link></td><td><span className="region-badge">{t.region}</span></td><td>{t.officialSeed?`#${t.officialSeed}`:'待定'}</td><td>{t.officialGprRank?<span className="gpr-score"><strong>#{t.officialGprRank}</strong><small>{t.officialGprScore} 分</small></span>:<span className="data-fallback">GPR 暂无 · 回退模型</span>}</td><td>{formatProbability(precomputedOdds.knockoutProbabilities[t.id]??0)}</td><td className="rank-prob-cell"><strong>{formatProbability(p)}</strong><ProbabilityBar a={p} label={`${t.shortName} 夺冠概率 ${formatProbability(p)}`}/></td></tr>})}</tbody></table></div>
  <div className="rankings-mobile">{list.map((t,i)=>{const p=precomputedOdds.probabilities[t.id]??0;return <Link className="mobile-ranking-row" href={`/teams/${t.slug}`} key={t.id}><span className="rank-num">{String(i+1).padStart(2,'0')}</span><TeamIdentity teamId={t.id} size={34} showName showRegion/><span className="mobile-ranking-metrics"><strong>{formatProbability(p)}</strong><small>{t.officialGprRank?`GPR #${t.officialGprRank} · ${t.officialGprScore}`:'GPR 暂无 · 回退'}</small><ProbabilityBar a={p} label={`${t.shortName} 夺冠概率 ${formatProbability(p)}`}/></span></Link>})}</div>
  <p className="fine">官方 GPR 快照：<a href={riotGprSnapshot.sourceUrl} target="_blank" rel="noopener noreferrer">LoL Esports ↗</a>。GPR 分数不是夺冠概率。</p>
 </main>;
}
