import {playerStatistics} from '../../../../lib/team-profile/statistics-server';
import {PlayerStatistics} from '../../../../components/team-profile/statistics';
import Link from 'next/link';
import {InfoDisclosure} from '../../../../components/ui/info-disclosure';
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
 const statistics=await playerStatistics(team.id,player.playerId,player.role);
 const fields=[{label:'真实姓名',field:player.realName},{label:'出生日期 / 年龄',field:player.birthDate},{label:'资料所载年龄',field:player.reportedAge},{label:'国籍',field:player.nationalities}];
 const sources=fields.filter(item=>item.field).map(item=>({label:item.label,source:item.field!.source}));
 return <main className={`shell ${styles.page} ${styles.playerPage}`}>
  <header className={styles.playerHeader}><Link className={styles.back} href={`/teams/${team.slug}`}><span aria-hidden="true">←</span> 返回 {team.shortName} 战队档案</Link>
   <div className="eyebrow">PLAYER PROFILE · WORLDS 2026</div><div className={styles.playerHero}><PositionIcon role={player.role} label={slot.role.label}/><h1>{player.playerId}</h1></div>
   <dl className={styles.playerFacts}>
    <div><dt>真实姓名</dt><dd>{player.realName?.value??'未核验'}</dd></div>
    <div><dt>国籍</dt><dd>{player.nationalities?player.nationalities.value.map(n=><span key={n.countryCode} className={styles.playerNationality}><span aria-hidden="true">{countryFlag(n.countryCode)}</span> {n.name}</span>):'未核验'}</dd></div>
    <div><dt>年龄</dt><dd>{age===null?'暂无可核验资料':<span title={player.birthDate?`出生日期：${player.birthDate.value}`:`官方资料所载年龄 · ${player.reportedAge!.source.checkedAt} 核对`}>{age} 岁<span className={styles.playerFactLabel}>{player.birthDate?`，出生日期：${player.birthDate.value}`:`，官方资料所载年龄，${player.reportedAge!.source.checkedAt} 核对`}</span></span>}</dd></div>
   </dl>
  </header>
  {player.notes?.map(note=><p className={styles.note} key={note}>{note}</p>)}
  <PlayerStatistics view={statistics}/>
  <section className={styles.section} aria-labelledby="champion-pool-title">
   <div className={styles.sectionHead}><div><div className="eyebrow">STAGE 3 CHAMPION POOL</div><h2 id="champion-pool-title">第三赛段英雄池</h2></div></div>
   <p className={styles.note}>{scope.label}</p>
   {pool.stats.length>0&&(pool.status==='VERIFIED'||pool.status==='PARTIAL')?<>
    {pool.status==='PARTIAL'&&<p className={styles.note}><strong>部分数据 · {pool.stats.reduce((n,stat)=>n+stat.gamesPlayed,0)} 场已核验</strong> · 仅按已收录比赛计算。</p>}
    <table className={styles.poolTable}><thead><tr><th scope="col">英雄</th><th scope="col">场次</th><th scope="col">胜率</th></tr></thead>
     <tbody>{sortedChampionStats(pool.stats).map(stat=><tr key={stat.championId}><td><span className={styles.championIdentity}><ChampionIcon championId={stat.championId} championName={stat.championName}/>{stat.championName}</span></td><td>{stat.gamesPlayed}</td><td>{championWinRate(stat)}</td></tr>)}</tbody>
    </table>
   </>:<div className={styles.empty}><strong>数据待核验</strong><p>{pool.reason}</p></div>}
   <InfoDisclosure label="统计范围与来源"><p>{scope.label} · {scope.includes.join(' + ')}。</p><p>快照核对：{pool.snapshotDate} · 本站读取已保存的英雄池快照，不自动同步比赛。</p>{pool.note&&<p>原来源备注：{pool.note}</p>}{pool.reason&&<p>{pool.reason}</p>}{(pool.sources??(pool.source?[pool.source]:[])).map(source=><p key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></p>)}<p>不计入：{scope.excludes.join('、')}。</p><a href={scope.source.url} target="_blank" rel="noopener noreferrer">官方赛段说明 ↗</a></InfoDisclosure>
  </section>
  <section className={styles.section}><InfoDisclosure label="选手资料来源">
   {sources.length?<ul className={styles.sourceList}>{sources.map(source=><li key={source.label}>{source.label}：<a href={source.source.url} target="_blank" rel="noopener noreferrer">{source.source.label} ↗</a> · {source.source.checkedAt}</li>)}</ul>:<p className={styles.note}>姓名、国籍和年龄尚无已核验资料。</p>}</InfoDisclosure>
  </section>
 </main>;
}
