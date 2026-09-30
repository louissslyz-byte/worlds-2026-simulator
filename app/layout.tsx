import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import './globals.css';
import './worlds-design.css';
import {SiteNavigation} from '../components/site-navigation';

export const metadata:Metadata={title:'Worlds 2026 模拟器',description:'2026 英雄联盟全球总决赛赛程、战队实力与赛事模拟',icons:{icon:'/worlds-logo.svg'}};

export default function Layout({children}:{children:React.ReactNode}){
 return <html lang="zh-CN"><body>
  <header className="topbar"><div className="shell">
   <Link href="/" className="logo" aria-label="Worlds 2026 模拟器首页">
    <Image src="/worlds-logo.svg" alt="英雄联盟全球总决赛标志" width={36} height={37} className="worlds-mark" priority/>
    <span className="brand-copy"><strong>WORLDS <span className="accent">2026</span></strong><small>赛事模拟器</small></span>
   </Link>
   <SiteNavigation/>
  </div></header>
  {children}
  <footer className="footer"><div className="shell">2026 全球总决赛模拟器 · 赛程时间以 LoL Esports 公布为准</div></footer>
 </body></html>;
}
