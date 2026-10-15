// Isolated unit-test shims only. Application imports and production builds never use this loader.
export async function resolve(specifier,context,nextResolve){
 if(specifier==='server-only')return {url:'data:text/javascript,export default {}',shortCircuit:true};
 if(specifier==='next/headers')return {url:'data:text/javascript,'+encodeURIComponent(`export async function headers(){process.env.P3B_HEADERS_READS=String(Number(process.env.P3B_HEADERS_READS||0)+1);return new Headers(JSON.parse(process.env.P3B_TEST_HEADERS||'{}'));}`),shortCircuit:true};
 return nextResolve(specifier,context);
}
