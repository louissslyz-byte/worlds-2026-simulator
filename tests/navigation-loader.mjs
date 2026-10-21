// Only the pathname hook is mocked; browser navigation is tested against real Next.
export async function resolve(specifier,context,nextResolve){
 if(specifier==='next/navigation')return {url:'data:text/javascript,'+encodeURIComponent(`export const usePathname=()=>process.env.UI_TEST_PATHNAME??'/';`),shortCircuit:true};
 return nextResolve(specifier,context);
}
