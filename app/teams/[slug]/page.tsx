import {notFound} from 'next/navigation';
import Link from 'next/link';
import {teams} from '../../../lib/sim/data';
import {TeamLogo} from '../../../components/tournament/team-logo';
import {RegionBadge} from '../../../components/tournament/team-identity';

export default async function TeamPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const team=teams.find(t=>t.slug===slug);if(!team)notFound();
 return <main className="shell"><div className="page-head"><div><div className="eyebrow">TEAM PROFILE / 参赛席位</div><div className="team-detail-title"><TeamLogo teamId={team.id} size={92}/><div><h1>{team.name} <span className="accent">{team.id}</span></h1><RegionBadge region={team.region}/></div></div><p>{team.confirmed?'LoL Esports 已列出这支参赛队伍。':'这一种子席位的最终队伍尚未确定，暂以赛区和种子号表示。'}</p></div></div><div className="grid grid-3"><div className="panel"><div className="metric-label">赛区</div><div className="stat">{team.region}</div></div><div className="panel"><div className="metric-label">模拟席位</div><div className="stat">#{team.seed}</div></div><div className="panel"><div className="metric-label">本站 Model Rating</div><div className="stat">{team.rating}</div></div></div><p className="note">当前评分为演示数据，既非 Riot 官方评分，也未使用正式 2026 历史赛事数据训练。</p><div className="action-row"><Link href="/rankings" className="button secondary">返回实力榜</Link><Link href="/simulator/new" className="button">创建模拟</Link></div></main>;
}
