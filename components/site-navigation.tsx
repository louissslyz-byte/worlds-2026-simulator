'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import styles from './team-profile/profile.module.css';
const links=[['/','首页'],['/rankings','实力榜'],['/simulator','模拟器'],['/teams','战队档案'],['/methodology','模型说明'],['/simulator/new','创建模拟']];
export function SiteNavigation(){const pathname=usePathname();return <nav className="nav" aria-label="主导航">{links.map(([href,label])=>{const active=href==='/teams'?pathname==='/teams'||pathname.startsWith('/teams/'):href==='/simulator'?pathname==='/simulator':pathname===href;return <Link key={href} href={href} aria-current={active?'page':undefined} className={`${active?'active ':''}${href==='/simulator/new'?'button small nav-key':href==='/'?'nav-key':href==='/teams'?styles.navigationLink:''}`}>{label}</Link>})}</nav>}
