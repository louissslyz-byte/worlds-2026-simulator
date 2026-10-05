import Link from 'next/link';
import {notFound} from 'next/navigation';
import {profileTeams,profileRoster,championPool,stage3Scopes} from '../../../../lib/team-profile/data';
import {countryFlag,playerAge,sortedChampionStats,championWinRate} from '../../../../lib/team-profile/helpers';
import {PositionIcon} from '../../../../components/tournament/roster-strip';
import {ChampionIcon} from '../../../../components/team-profile/champion-icon';
import styles from '../../../../components/team-profile/profile.module.css';
export const dynamic='force-dynamic';
export default async function PlayerProfile({params}:{params:Promise<{slug:string;player:string}>}){
 const {slug,player:playerParam}=await params;const team=profileTeams.find(t=>t.slug===slug);
 if(!team)notFound();
 const slot=profileRoster(team.id).slots.find(s=>s.player?.slug===playerParam);
 if(!slot?.player)notFound();
 const player=slot.player;const age=playerAge(player);const pool=championPool(player);const scope=stage3Scopes[team.region];
 const fields=[player.realName,player.birthDate,player.reportedAge,player.nationalities];
 const sources=Array.from(new Map(fields.filter(Boolean).map(field=>[field!.source.url,field!.source])).values());
 return <main className={`shell ${styles.page}`}>
  <header className={styles.hero}><Link className={styles.back} href={`/teams/${team.slug}`}>← {team.shortName} 战队档案</Link>
   <div className="eyebrow">PLAYER PROFILE · WORLDS 2026</div><div className={styles.playerHero}><PositionIcon role={player.role} label={slot.role.label}/><h1>{player.playerId}</h1></div>
   <div className={styles.meta}><Link href={`/teams/${team.slug}`}>{team.name}</Link><span>{slot.role.label}</span></div>
  </header>
  <dl className={styles.facts}>
   <div><dt>真实姓名 / REAL NAME</dt><dd>{player.realName?.value??<span className={styles.unavailable}>未核验</span>}</dd></div>
   <div><dt>国籍 / NATIONALITY</dt><dd>{player.nationalities?player.nationalities.value.map(n=><span key={n.countryCode} className={styles.nationality}><span aria-hidden="true">{countryFlag(n.countryCode)}</span> {n.name}</span>):<span className={styles.unavailable}>未核验</span>}</dd></div>
   <div><dt>年龄 / AGE</dt><dd>{age===null?<span className={styles.unavailable}>暂无可核验资料</span>:<>{age} 岁{player.birthDate?<p className={styles.note}>出生日期：{player.birthDate.value}</p>:<p className={styles.note}>官方资料所载年龄 · {player.reportedAge!.source.checkedAt} 核对</p>}</>}</dd></div>
   <div><dt>位置 / ROLE</dt><dd>{slot.role.label}</dd></div><div><dt>战队 / TEAM</dt><dd><Link href={`/teams/${team.slug}`}>{team.shortName}</Link></dd></div>
  </dl>
  {player.notes?.map(note=><p className={styles.note} key={note}>{note}</p>)}
  <section className={styles.section} aria-labelledby="champion-pool-title">
   <div className={styles.sectionHead}><div><div className="eyebrow">STAGE 3 CHAMPION POOL</div><h2 id="champion-pool-title">第三赛段英雄池</h2></div></div>
   <p className={styles.note}>{scope.label} · {scope.includes.join(' + ')}</p>
   {pool.status==='VERIFIED'&&pool.completeness==='COMPLETE'?<>
    <table className={styles.poolTable}><thead><tr><th scope="col">英雄</th><th scope="col">场次</th><th scope="col">胜率</th></tr></thead>
     <tbody>{sortedChampionStats(pool.stats).map(stat=><tr key={stat.championId}><td><span className={styles.championIdentity}><ChampionIcon championId={stat.championId} championName={stat.championName}/>{stat.championName}</span></td><td>{stat.gamesPlayed}</td><td>{championWinRate(stat)}</td></tr>)}</tbody>
    </table><p className={styles.note}>快照核对：{pool.snapshotDate} · {pool.note}</p>
    {(pool.sources??(pool.source?[pool.source]:[])).map(source=><p key={source.url} className={styles.note}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></p>)}
   </>:<div className={styles.empty}><strong>数据待核验</strong><p>{pool.reason}</p></div>}
   <details className={styles.note}><summary>统计范围与来源</summary><p>不计入：{scope.excludes.join('、')}。</p><a href={scope.source.url} target="_blank" rel="noopener noreferrer">官方赛段说明 ↗</a></details>
  </section>
  <section className={styles.section} aria-labelledby="player-source-title"><h2 id="player-source-title">资料来源</h2>
   {sources.length?<ul className={styles.sourceList}>{sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a> · {source.checkedAt}</li>)}</ul>:<p className={styles.note}>姓名、国籍和年龄尚无已核验资料。</p>}
  </section>
 </main>;
}
