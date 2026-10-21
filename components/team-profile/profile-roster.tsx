import Link from 'next/link';
import {InfoDisclosure} from '../ui/info-disclosure';
import {PositionIcon} from '../tournament/roster-strip';
import {profileRoster} from '../../lib/team-profile/data';
import styles from './profile.module.css';

export function ProfileRoster({teamId,teamSlug}:{teamId:string;teamSlug:string}){
 const roster=profileRoster(teamId);
 return <section className={styles.section} aria-labelledby="profile-roster-title">
  <div className={styles.sectionHead}><div><div className="eyebrow">ROSTER</div><h2 id="profile-roster-title">选手阵容</h2></div></div>
  <div className={styles.roster}>{roster.slots.map(({role,player})=>player?
   <Link key={role.key} className={styles.playerSlot} href={`/teams/${teamSlug}/${player.slug}`} aria-label={`${player.playerId} · ${role.label} · 选手档案`}>
    <PositionIcon role={role.key} label={role.label}/><strong>{player.playerId}</strong><span aria-hidden="true">↗</span>
   </Link>:<div key={role.key} className={`${styles.playerSlot} ${styles.pending}`}><PositionIcon role={role.key} label={role.label}/><strong>首发待核验</strong></div>)}</div>
  <p className={styles.note}>{roster.note==='当前公开阵容；Worlds 正式登记名单与首发仍待核验。'?'Worlds 登记名单与首发待核验。':teamId==='LYON'?'Worlds 登记名单待核验。':roster.note}</p>
  <InfoDisclosure label="阵容来源"><p>{roster.note}</p>{roster.source&&<p><a href={roster.source.url} target="_blank" rel="noopener noreferrer">{roster.source.kind==='OFFICIAL'?'官方阵容':'参考名单'} ↗</a> · {roster.source.checkedAt}</p>}</InfoDisclosure>
 </section>;
}
