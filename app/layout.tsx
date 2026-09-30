import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import './globals.css';

export const metadata:Metadata={title:'Worlds 2026 模拟器',description:'2026 英雄联盟全球总决赛赛程、战队实力与赛事模拟',icons:{icon:'/worlds-logo.svg'}};

export default function Layout({children}:{children:React.ReactNode}){
 return <html lang="zh-CN"><body>
  <header className="topbar"><div className="shell">
   <Link href="/" className="logo" aria-label="Worlds 2026 模拟器首页">
    <Image src="/worlds-logo.svg" alt="英雄联盟全球总决赛标志" width={36} height={37} className="worlds-mark" priority/>
    <span className="brand-copy"><strong>WORLDS <span className="accent">2026</span></strong><small>赛事模拟器</small></span>
   </Link>
   <nav className="nav" aria-label="主导航"><Link href="/" className="nav-key">首页</Link><Link href="/rankings">实力榜</Link><Link href="/simulator">模拟器</Link><Link href="/methodology">模型说明</Link><Link href="/simulator/new" className="button small secondary nav-key">创建模拟</Link></nav>
  </div></header>
  {children}
  <footer className="footer"><div className="shell">2026 全球总决赛模拟器 · 赛程时间以 LoL Esports 公布为准</div></footer>
 </body></html>;
}
