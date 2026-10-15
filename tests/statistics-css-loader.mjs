// Only for the local, static component acceptance fixture.
export async function load(url,context,nextLoad){
 if(url.endsWith('.css'))return {format:'module',shortCircuit:true,source:'export default new Proxy({}, {get: (_, key) => key});'};
 return nextLoad(url,context);
}
