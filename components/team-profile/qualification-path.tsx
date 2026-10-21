import {profileTeams,qualificationPath,regularSeasonRecord,regularSeasonSummary} from '../../lib/team-profile/data';
import {InfoDisclosure} from '../ui/info-disclosure';
import {TeamLogo} from '../tournament/team-logo';
import styles from './profile.module.css';

export function QualificationPath({team}:{team:typeof profileTeams[number]}){
 const path=qualificationPath(team.id);const regular=regularSeasonRecord(team.id);
 return <section className={styles.section} aria-labelledby="qualification-title">
  <div className={styles.sectionHead}><div><div className="eyebrow">ROAD TO WORLDS</div><h2 id="qualification-title">晋级之路</h2></div><span className="fine">真实赛果 · 北京时间</span></div>
  {regular?<div className={styles.note}><p>{regular.scope}：{regularSeasonSummary(regular)}</p>
   {regular.stageRecord&&<p>Rounds 3–4：{regular.stageRecord.wins} 胜 {regular.stageRecord.losses} 负。</p>}
   {regular.note&&<p>{regular.note==='含 Rounds 1–2 结转战绩；排名为传奇组最终排名。'?'含 R1–2 结转 · 传奇组最终排名':regular.note==='使用瑞士轮结束时的战绩与并列名次，不含后续种子决定赛。'?'瑞士轮战绩及并列排名 · 不含后续种子赛':regular.note}</p>}
</div>:<p className={styles.note}>以下展示已核验的瑞士轮、资格赛与季后赛；常规赛完整战绩暂未核验。</p>}
  <ol className={styles.path}>
   {path.map((step,i)=>{
    const opponent=profileTeams.find(t=>t.id===step.opponent);const won=step.score[0]>step.score[1];
    return <li key={`${step.date}-${step.opponent}-${i}`}><span className={styles.pathDot} aria-hidden="true"/>
     <div className={styles.pathTop}><strong>{step.stage}</strong><time dateTime={step.date}>{step.date}</time></div>
     <div className={styles.result}><span className={won?styles.won:styles.lost}>{won?'胜':'负'}</span><strong>{step.score[0]} — {step.score[1]}</strong>
      {opponent&&<TeamLogo teamId={opponent.id} size={28}/>}<span>vs {step.opponent}</span>
     </div>
    </li>;
   })}
   <li className={styles.qualified}><span className={styles.pathDot} aria-hidden="true"/><div className="eyebrow">WORLDS 2026</div><strong>已确认晋级</strong><span>{team.worldsSeed?`#${team.worldsSeed} 种子`:'种子待定'}</span></li>
  </ol>
  <InfoDisclosure label="晋级记录说明">{regular&&<><p>{regular.scope}。{regular.note}</p><p><a href={regular.source.url} target="_blank" rel="noopener noreferrer">常规赛积分榜 ↗</a>{regular.recordSource&&<> · <a href={regular.recordSource.url} target="_blank" rel="noopener noreferrer">累计战绩 ↗</a></>} · {regular.source.checkedAt} 核对。</p></>}<p><a href={path[0]?.source.url??team.sourceUrl} target="_blank" rel="noopener noreferrer">LoL Esports 官方赛程 ↗</a> · <a href={team.sourceUrl} target="_blank" rel="noopener noreferrer">参赛名单 ↗</a> · 2026-10-05 核对。</p></InfoDisclosure>
 </section>;
}
