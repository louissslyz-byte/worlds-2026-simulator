import Link from 'next/link';
import {DataStatus} from '../../components/tournament/data-status';
import {riotGprSnapshot} from '../../lib/sim/gprSnapshot';
import {ratingConfig} from '../../lib/sim/ratingConfig';
import {worlds2026} from '../../lib/sim/worlds2026';
import {precomputedOdds} from '../../lib/sim/precomputed';
import {scheduleSource,updatedStartTimesSource,worldsSchedule} from '../../lib/sim/schedule';

const scheduleRows=[
 {name:'入围赛',slot:worldsSchedule['play-in']},
 {name:'瑞士轮',slot:worldsSchedule.swiss},
 {name:'四分之一决赛',slot:worldsSchedule.quarterfinals},
 {name:'半决赛',slot:worldsSchedule.semifinals},
 {name:'总决赛',slot:worldsSchedule.final},
];

export default function Methodology(){return <main className="shell methodology-page">
 <div className="page-head"><div><div className="eyebrow">DATA & METHODOLOGY</div><h1>数据与模型</h1><p>官方 GPR 提供队伍实力输入；比赛胜率和夺冠概率由本站计算。</p></div><Link href="/simulator/new" className="button">开始模拟</Link></div>
 <DataStatus/>
 <div className="grid grid-2 methodology-grid">
  <section className="panel"><h2>哪些数据来自官方？</h2><p>参赛队伍、赛区、赛段时间和 Riot Global Power Rankings（GPR）分数来自 LoL Esports。模型评分、单局与系列赛胜率、晋级和夺冠概率均由本站生成。</p><p className="fine">GPR 当前使用 <a href={riotGprSnapshot.sourceUrl} target="_blank" rel="noopener noreferrer">Riot 官方榜单 ↗</a> 的 {riotGprSnapshot.sourceUpdatedAt} 快照；网站不会在每次访问时请求 Riot。</p></section>
  <section className="panel"><h2>系统模型如何使用 GPR？</h2><p>GPR 综合队伍表现、近期成绩、对手强度和比赛内容。本站读取其<strong>分数</strong>作为实力输入，不把 GPR 名次当成胜率。</p><p>已有 GPR 的队伍使用官方分数；尚未对应具体队伍的种子席位沿用旧评分，并标为“回退”。模型版本：<strong>{worlds2026.modelVersion}</strong>。</p></section>
  <section className="panel"><h2>单局胜率</h2><p>先把 GPR 分数转换为本站评分，再用两队评分差计算胜率。转换系数可在配置中调整：</p><p className="method-formula">模型评分 = {ratingConfig.gpr.referenceRating} + (GPR 分数 − {ratingConfig.gpr.referenceScore}) × {ratingConfig.gpr.scoreScale}</p><p className="method-formula">P(A 胜) = 1 / (1 + 10<sup>(评分B − 评分A) / {ratingConfig.eloDivisor}</sup>)</p></section>
  <section className="panel"><h2>Bo1、Bo3、Bo5</h2><p>系列赛按单局胜率逐局模拟，再统计先赢到规定局数的一方。例如单局胜率为 60% 时，Bo3 胜率约 64.8%，Bo5 胜率约 68.3%。</p><p>页面比赛卡显示的是<strong>系列赛胜率</strong>。</p></section>
  <section className="panel"><h2>夺冠概率</h2><p>赛前榜单用同一套模型完整模拟世界赛 <strong>{precomputedOdds.metadata.simulationCount.toLocaleString('en-US')} 次</strong>。如果某队在其中 18,400 次夺冠，显示的概率就是 18.4%。</p><p>20% 的夺冠概率意味着：在当前模型假设下，约五条模拟赛程中有一条由该队夺冠，并非预测它一定会赢。</p></section>
  <section className="panel"><h2>你的选择如何生效？</h2><p>手动选定的比分会保留。更新概率时，模拟器把这些赛果视为已知，只模拟未决定的比赛。</p><p>自定义 Tier List 则完全使用你的排序：S ＞ A ＞ B ＞ C ＞ D，同一层内的顺序也会带来小幅评分差。自定义模式不会使用 GPR 计算比赛胜率。</p></section>
 </div>
 <section className="method-limits panel"><h2>模型能做什么、不能做什么</h2><p>概率会随队伍实力输入和已确定赛果变化，但无法及时捕捉版本适应、阵容或伤病变化、队内情况、特定 BP 对位、选手状态起伏与环境变化。即使进行 100,000 次模拟，低概率结果仍有抽样误差；概率不是确定性结论。</p></section>
 <section className="schedule-explainer"><div className="section-title"><div><div className="eyebrow">官方赛程</div><h2>2026 世界赛比赛时间</h2></div></div><p className="fine">以下均为北京时间 CST（UTC+8）。瑞士轮不同日期的开赛时间不同。</p><div className="schedule-list">{scheduleRows.map(({name,slot})=><div className="schedule-list-row" key={name}><strong>{name}</strong><span>{slot.date}</span><small>{slot.time}（{slot.zone}）</small></div>)}</div><p className="fine">来源：<a href={scheduleSource} target="_blank" rel="noopener noreferrer">赛段日期 ↗</a> · <a href={updatedStartTimesSource} target="_blank" rel="noopener noreferrer">开赛时间 ↗</a></p></section>
 </main>}
