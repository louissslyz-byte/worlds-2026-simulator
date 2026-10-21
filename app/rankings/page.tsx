import styles from './rankings.module.css';
import {InfoDisclosure} from '../../components/ui/info-disclosure';
import Link from 'next/link';
import {teams} from '../../lib/sim/data';
import {precomputedOdds,assertPrecomputedOddsCurrent} from '../../lib/sim/precomputed';
import {formatProbability} from '../../lib/sim/oddsConfig';
import {riotGprSnapshot} from '../../lib/sim/gprSnapshot';
import {TeamIdentity} from '../../components/tournament/team-identity';
import {ProbabilityBar} from '../../components/tournament/probability-bar';
import {DataStatus,DataDetails} from '../../components/tournament/data-status';

export default function Rankings(){
 assertPrecomputedOddsCurrent();
 const list=[...teams].sort((a,b)=>(a.officialGprRank??999)-(b.officialGprRank??999));
 return <main className={`shell rankings-page ${styles.page}`}><div className="page-head"><div><div className="eyebrow">WORLDS 2026 / 实力榜</div><h1>Riot GPR 实力榜</h1><InfoDisclosure label="数据与计算方法"><DataDetails/><p>按 Riot GPR 排名排序，无 GPR 的队伍置后。官方 GPR 分数用于实力模型；晋级八强与夺冠概率由本站进行 Monte Carlo 模拟计算，不是 Riot 官方夺冠预测。</p><p><a href={riotGprSnapshot.sourceUrl} target="_blank" rel="noopener noreferrer">Riot 官方 GPR ↗</a> · <Link href="/methodology">完整方法论 →</Link></p></InfoDisclosure></div><Link className="button" href="/simulator/new">用系统模型开始 →</Link></div>
  <p className={styles.readingKey}>按 Riot 官方 GPR 名次排序 · 概率为本站赛前模拟</p>
  <DataStatus compact/>
  <p className="ranking-scroll-hint">横向滚动查看完整概率 →</p><div className="panel rankings-desktop" role="region" aria-label="完整实力榜，可横向滚动" tabIndex={0}><table className="data-table"><thead><tr><th>顺序</th><th>队伍</th><th>赛区</th><th>种子</th><th>官方 GPR</th><th>进入淘汰赛<small>本站模拟</small></th><th>夺冠概率<small>本站模拟</small></th></tr></thead><tbody>{list.map((t,i)=>{const p=precomputedOdds.probabilities[t.id]??0;return <tr key={t.id}><td className="rank-num">{String(i+1).padStart(2,'0')}</td><td><Link className="rank-team-cell" href={`/teams/${t.slug}`}><TeamIdentity teamId={t.id} size={34} showName showRegion={false}/></Link></td><td><span className="region-badge">{t.region}</span></td><td>{t.officialSeed?`#${t.officialSeed}`:'待定'}</td><td>{t.officialGprRank?<span className="gpr-score"><strong>#{t.officialGprRank}</strong><small>{t.officialGprScore} 分</small></span>:<span className="data-fallback">GPR 暂无 · 回退模型</span>}</td><td>{formatProbability(precomputedOdds.knockoutProbabilities[t.id]??0)}</td><td className="rank-prob-cell"><strong>{formatProbability(p)}</strong><ProbabilityBar a={p} label={`${t.shortName} 夺冠概率 ${formatProbability(p)}`}/></td></tr>})}</tbody></table></div>
  <div className="rankings-mobile">{list.map((t,i)=>{const p=precomputedOdds.probabilities[t.id],ko=precomputedOdds.knockoutProbabilities[t.id];return <article className={`mobile-ranking-row ${styles.mobileRow}`} key={t.id} data-ranking-team={t.id}>
   <Link className={styles.teamLink} href={`/teams/${t.slug}`}><span className="rank-num">{String(i+1).padStart(2,'0')}</span><div className={styles.identity}><TeamIdentity teamId={t.id} size={34} showName showRegion/><span className={styles.mobileGpr}>{t.officialGprRank?`GPR #${t.officialGprRank} · ${t.officialGprScore} 分`:'GPR 暂无 · 回退模型'}</span></div></Link>
   <div className={`mobile-ranking-metrics ${styles.metrics}`}><span className={styles.probabilityLabel}>本站夺冠概率</span><strong>{p===undefined?'暂无数据':formatProbability(p)}</strong>{p!==undefined&&<ProbabilityBar a={p} label={`${t.shortName} 夺冠概率 ${formatProbability(p)}`}/>}</div>
   <div className={styles.secondary}><span>Worlds 种子 <b>{t.officialSeed?`#${t.officialSeed}`:'待定'}</b></span><span>进入淘汰赛 <b>{ko===undefined?'暂无数据':formatProbability(ko)}</b></span></div>
  </article>})}</div>

 </main>;
}
