import {RegionMark} from '../../components/tournament/region-mark';
import {compareGpr,currentOfficialGpr,signedGprChange} from '../../lib/rankings/gpr-comparison';
import styles from './rankings.module.css';
import {InfoDisclosure} from '../../components/ui/info-disclosure';
import Link from 'next/link';
import {teams} from '../../lib/sim/data';
import {precomputedOdds,assertPrecomputedOddsCurrent} from '../../lib/sim/precomputed';
import {formatProbability} from '../../lib/sim/oddsConfig';
import {riotGprSnapshot} from '../../lib/sim/gprSnapshot';
import {TeamIdentity} from '../../components/tournament/team-identity';
import {ProbabilityBar} from '../../components/tournament/probability-bar';
import {DataDetails} from '../../components/tournament/data-status';

export default function Rankings(){
 assertPrecomputedOddsCurrent();
 const list=[...teams].sort((a,b)=>(compareGpr(a.id).current?.rank??999)-(compareGpr(b.id).current?.rank??999));
 return <main className={`shell rankings-page ${styles.page}`}><div className="page-head"><div><div className="eyebrow">WORLDS 2026 / 实力榜</div><h1>Riot GPR 实力榜</h1><InfoDisclosure label="数据与计算方法"><DataDetails/><p>按最新官方全球名次排序，保留并列名次。分数变化为最新减赛前，名次变化按全球排名计算。最新榜单仅用于对照展示；本站预测仍使用冻结赛前GPR，不会随此榜单更新。下方概率为赛前模拟，Live走势使用独立历史快照。FUR赛前无官方GPR，不用回退Rating冒充官方分数。官网时间标注为10/31/26, 5:00 AM，时区未确认，未换算为北京时间；本版仍包含R5之前的战绩。</p><p><a href={riotGprSnapshot.sourceUrl} target="_blank" rel="noopener noreferrer">Riot 官方 GPR ↗</a> · <Link href="/methodology">完整方法论 →</Link></p></InfoDisclosure></div><Link className="button" href="/simulator/new">用系统模型开始 →</Link></div>
  <p className={styles.readingKey}>赛前 {riotGprSnapshot.sourceUpdatedAt} → 最新 {currentOfficialGpr.updatedDate}<span> · 按最新官方全球名次排序</span></p><p className="ranking-scroll-hint">横向滚动查看完整榜单 →</p><div className="panel rankings-desktop" role="region" aria-label="完整实力榜，可横向滚动" tabIndex={0}><table className="data-table"><thead><tr><th>最新名次</th><th>队伍</th><th>赛区</th><th>种子</th><th>赛前 GPR</th><th>最新 GPR</th><th>分数变化</th><th>进入淘汰赛<small>本站赛前模拟</small></th><th>夺冠概率<small>本站赛前模拟</small></th></tr></thead><tbody>{list.map(t=>{const p=precomputedOdds.probabilities[t.id]??0,c=compareGpr(t.id);return <tr key={t.id}><td className="rank-num">{`#${compareGpr(t.id).current?.rank??'—'}`}</td><td><Link className="rank-team-cell" href={`/teams/${t.slug}`}><TeamIdentity teamId={t.id} size={34} showName showRegion={false}/></Link></td><td><RegionMark region={t.region}/></td><td>{t.officialSeed?`#${t.officialSeed}`:'待定'}</td><td>{c.previous?<span className="gpr-score"><strong>{c.previous.score}</strong><small>全球 #{c.previous.rank}</small></span>:'—'}</td><td><span className="gpr-score"><strong>{c.current?.score??'—'}</strong><small>{c.rankChange===null?'赛前暂无官方分数':c.rankChange===0?'名次持平':`${c.rankChange>0?'↑':'↓'} ${Math.abs(c.rankChange)} 名`}</small></span></td><td className={c.scoreChange!==null&&c.scoreChange>0?styles.rise:c.scoreChange!==null&&c.scoreChange<0?styles.fall:styles.unchanged}>{signedGprChange(c.scoreChange)}</td><td>{formatProbability(precomputedOdds.knockoutProbabilities[t.id]??0)}</td><td className="rank-prob-cell"><strong>{formatProbability(p)}</strong><ProbabilityBar a={p} label={`${t.shortName} 夺冠概率 ${formatProbability(p)}`}/></td></tr>})}</tbody></table></div>
  <div className="rankings-mobile">{list.map(t=>{const p=precomputedOdds.probabilities[t.id],ko=precomputedOdds.knockoutProbabilities[t.id],c=compareGpr(t.id);return <article className={`mobile-ranking-row ${styles.mobileRow}`} key={t.id} data-ranking-team={t.id}>
   <Link className={styles.teamLink} href={`/teams/${t.slug}`}><span className="rank-num">{`#${compareGpr(t.id).current?.rank??'—'}`}</span><div className={styles.identity}><TeamIdentity teamId={t.id} size={34} showName showRegion={false}/><RegionMark region={t.region}/></div></Link>
   <div className={`mobile-ranking-metrics ${styles.metrics}`}><span className={styles.probabilityLabel}>赛前夺冠概率</span><strong>{p===undefined?'暂无数据':formatProbability(p)}</strong>{p!==undefined&&<ProbabilityBar a={p} label={`${t.shortName} 夺冠概率 ${formatProbability(p)}`}/>}</div>
   <div className={styles.comparison}><div><span>赛前 GPR</span><strong>{c.previous?.score??'—'}</strong><small>{c.previous?`全球 #${c.previous.rank}`:'暂无官方分数'}</small></div><div><span>最新 GPR</span><strong>{c.current?.score??'—'}</strong><small>{c.rankChange===null?'—':c.rankChange===0?'名次持平':`${c.rankChange>0?'↑':'↓'} ${Math.abs(c.rankChange)} 名`}</small></div><div className={c.scoreChange!==null&&c.scoreChange>0?styles.rise:c.scoreChange!==null&&c.scoreChange<0?styles.fall:styles.unchanged}><span>分数变化</span><strong>{signedGprChange(c.scoreChange)}</strong></div></div><div className={styles.secondary}><span>Worlds 种子 <b>{t.officialSeed?`#${t.officialSeed}`:'待定'}</b></span><span>进入淘汰赛 <b>{ko===undefined?'暂无数据':formatProbability(ko)}</b></span></div>
  </article>})}</div>

 </main>;
}
