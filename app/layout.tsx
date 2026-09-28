import type {Metadata} from 'next';
import Link from 'next/link';
import './globals.css';
export const metadata:Metadata={title:'Worlds 2026 模拟器',description:'非官方英雄联盟 2026 全球总决赛概率分析与赛事模拟',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body><header className="topbar"><div className="shell"><Link href="/" className="logo"><span className="logo-mark">W</span><span>WORLDS <span className="accent">2026</span><br/><small style={{fontSize:11,fontWeight:500,color:'#8e9cac'}}>赛事模拟实验室</small></span></Link><nav className="nav"><Link href="/" className="nav-key">首页</Link><Link href="/rankings">实力榜</Link><Link href="/simulator">模拟器</Link><Link href="/methodology">模型说明</Link><Link href="/simulator/new" className="button small secondary nav-key">创建模拟</Link></nav></div></header>{children}<footer className="footer"><div className="shell">非官方粉丝项目。示例队伍与评分并非 Riot 官方预测；赛事规则以官方最终公布为准。</div></footer></body></html>}
