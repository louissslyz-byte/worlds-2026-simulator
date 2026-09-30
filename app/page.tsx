import Link from 'next/link';
import {teams} from '../lib/sim/data';
import {worldsSchedule,scheduleSource,updatedStartTimesSource} from '../lib/sim/schedule';
import {SystemRatingProvider} from '../lib/sim/ratings';
import {precomputedOdds,assertPrecomputedOddsCurrent} from '../lib/sim/precomputed';
import {formatProbability} from '../lib/sim/oddsConfig';
import {riotGprSnapshot} from '../lib/sim/gprSnapshot';
import {TeamIdentity} from '../components/tournament/team-identity';
import {ProbabilityBar} from '../components/tournament/probability-bar';
import {DataStatus} from '../components/tournament/data-status';

export default function Home(){
 assertPrecomputedOddsCurrent();
 const ratings=new SystemRatingProvider().getRatings();
 const top=[...teams].sort((a,b)=>ratings[b.id]-ratings[a.id]).slice(0,5);
 const leaders=[...teams].sort((a,b)=>(precomputedOdds.probabilities[b.id]??0)-(precomputedOdds.probabilities[a.id]??0)).slice(0,5);
 return <main className="shell home-page">
  <div className="page-head"><div><div className="eyebrow">WORLDS 2026 / 赛事模拟</div><h1>谁最可能赢得世界赛？</h1><p>官方 GPR 提供队伍实力输入；夺冠概率由本站模拟计算。</p></div></div>
  <div className="home-primary-grid">
   <section className="panel home-odds-panel"><div className="section-title"><div><div className="eyebrow">CHAMPIONSHIP PROBABILITY</div><h2>赛前夺冠概率</h2></div><span className="fine">{precomputedOdds.metadata.simulationCount.toLocaleString('en-US')} 次完整模拟</span></div>{leaders.map((t,i)=><Link href={`/teams/${t.slug}`} className="home-odds-row" key={t.id}><span className="rank-num">{String(i+1).padStart(2,'0')}</span><TeamIdentity teamId={t.id} size={38}/><ProbabilityBar a={precomputedOdds.probabilities[t.id]??0} label={`${t.shortName} 夺冠概率 ${formatProbability(precomputedOdds.probabilities[t.id]??0)}`}/><strong className="big-percent">{formatProbability(precomputedOdds.probabilities[t.id]??0)}</strong></Link>)}<p className="fine">概率是模拟结果，不是 Riot 官方预测。</p></section>
   <aside className="hero-card home-cta"><span className="pill blue">2026 · 你的赛程</span><h2>预测比赛，<br/><span className="accent">模拟冠军。</span></h2><p>手动选关键比分，其余比赛交给模拟器。</p><Link href="/simulator/new" className="button">开始模拟 →</Link><Link href="/methodology" className="home-text-link">模型如何计算？</Link></aside>
  </div>
  <DataStatus/>
  <div className="section-title"><h2>系统实力榜</h2><Link href="/rankings" className="fine home-text-link">查看全部队伍 →</Link></div><div className="panel home-ranking-list">{top.map((t,i)=><Link href={`/teams/${t.slug}`} className="leader" key={t.id}><span className="home-team-leader"><span className="rank-num">{String(i+1).padStart(2,'0')}</span><TeamIdentity teamId={t.id} size={32}/></span><span className="home-rank-metrics">{t.officialGprRank?<small>Riot GPR #{t.officialGprRank} · {t.officialGprScore} 分</small>:<small>GPR 待定 · 使用回退评分</small>}<strong>模型 {ratings[t.id].toFixed(1)}</strong></span></Link>)}</div>
  <div className="section-title"><h2>比赛日程</h2><span className="fine">北京时间 CST（UTC+8）</span></div><div className="grid grid-3"><div className="panel"><div className="schedule-card-date">{worldsSchedule['play-in'].date}</div><h3>入围赛</h3><p className="schedule-card-time">{worldsSchedule['play-in'].time}</p></div><div className="panel"><div className="schedule-card-date">{worldsSchedule.swiss.date}</div><h3>瑞士轮</h3><p className="schedule-card-time">{worldsSchedule.swiss.time}</p></div><div className="panel"><div className="schedule-card-date">11月4–15日</div><h3>淘汰赛</h3><div className="schedule-card-subdates">四分之一决赛 {worldsSchedule.quarterfinals.date} · {worldsSchedule.quarterfinals.time}<br/>半决赛 {worldsSchedule.semifinals.date} · {worldsSchedule.semifinals.time}<br/>决赛 {worldsSchedule.final.date} · {worldsSchedule.final.time}</div></div></div>
  <p className="fine home-source">GPR：<a href={riotGprSnapshot.sourceUrl} target="_blank" rel="noopener noreferrer">Riot 官方榜单 ↗</a> · 赛程：<a href={scheduleSource} target="_blank" rel="noopener noreferrer">赛段日期 ↗</a> / <a href={updatedStartTimesSource} target="_blank" rel="noopener noreferrer">开赛时间 ↗</a></p>
 </main>;
}
