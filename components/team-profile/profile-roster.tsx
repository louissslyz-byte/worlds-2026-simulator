import Link from 'next/link';
import {PositionIcon} from '../tournament/roster-strip';
import {profileRoster} from '../../lib/team-profile/data';
import styles from './profile.module.css';

export function ProfileRoster({teamId,teamSlug}:{teamId:string;teamSlug:string}){
 const roster=profileRoster(teamId);
 return <section className={styles.section} aria-labelledby="profile-roster-title">
  <div className={styles.sectionHead}><div><div className="eyebrow">ROSTER</div><h2 id="profile-roster-title">选手阵容</h2></div><span className="fine">点击选手查看档案</span></div>
  <div className={styles.roster}>{roster.slots.map(({role,player})=>player?
   <Link key={role.key} className={styles.playerSlot} href={`/teams/${teamSlug}/${player.slug}`} aria-label={`${player.playerId} · ${role.label} · 选手档案`}>
    <PositionIcon role={role.key} label={role.label}/><strong>{player.playerId}</strong><span aria-hidden="true">↗</span>
   </Link>:<div key={role.key} className={`${styles.playerSlot} ${styles.pending}`}><PositionIcon role={role.key} label={role.label}/><strong>首发待核验</strong></div>)}</div>
  <p className={styles.note}>{roster.note} {roster.source&&<a href={roster.source.url} target="_blank" rel="noopener noreferrer">{roster.source.kind==='OFFICIAL'?'官方阵容':'参考名单'} ↗</a>}</p>
 </section>;
}
