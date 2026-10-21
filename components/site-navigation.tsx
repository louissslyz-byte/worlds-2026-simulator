'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useRef,useState} from 'react';
import liveNav from './live/navigation.module.css';
const links=[['/','首页'],['/rankings','实力榜'],['/simulator','模拟器'],['/teams','战队档案'],['/live','LIVE TOURNAMENT'],['/methodology','模型说明'],['/simulator/new','创建模拟']];
const primary=new Set(['/','/live','/simulator/new']);
export function SiteNavigation(){
 const pathname=usePathname();
 const [openPath,setOpenPath]=useState<string|null>(null);
 const more=useRef<HTMLButtonElement>(null);
 const expanded=openPath===pathname;
 const active=(href:string)=>href==='/teams'?pathname==='/teams'||pathname.startsWith('/teams/'):pathname===href;
 const currentSecondary=links.find(([href])=>!primary.has(href)&&active(href));
 const link=([href,label]:string[])=><Link key={href} href={href} data-nav-link aria-current={active(href)?'page':undefined} onClick={()=>setOpenPath(null)} className={`${active(href)?'active ':''}${href==='/simulator/new'?`button small nav-key ${liveNav.createLink}`:href==='/'?`nav-key ${liveNav.homeLink}`:href==='/live'?liveNav.liveLink:''}`}>{label}</Link>;
 return <nav className={`nav ${liveNav.navigation}`} aria-label="主导航" data-menu-open={expanded} onKeyDown={event=>{if(event.key==='Escape'&&expanded){event.preventDefault();setOpenPath(null);more.current?.focus();}}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpenPath(null);}}>
  <div className={liveNav.desktopLinks}>{links.map(link)}</div>
  <div className={liveNav.mobileLinks}>
   {links.filter(([href])=>href==='/'||href==='/live').map(link)}
   <button ref={more} type="button" className={liveNav.more} aria-expanded={expanded} aria-controls="site-more-navigation" aria-label={currentSecondary?`更多导航（当前：${currentSecondary[1]}）`:'更多导航'} data-current={Boolean(currentSecondary)} onClick={()=>setOpenPath(expanded?null:pathname)}>更多 <span aria-hidden="true">{expanded?'−':'+'}</span></button>
   {links.filter(([href])=>href==='/simulator/new').map(link)}
   <div className={liveNav.secondaryLinks} id="site-more-navigation" data-open={expanded}>{links.filter(([href])=>!primary.has(href)).map(link)}</div>
  </div>
 </nav>;
}
