import Image from 'next/image';
import {countryFlag} from '../../lib/team-profile/helpers';
// Local SVG avoids platform-dependent support for the TW flag emoji.
export function CountryFlag({code}:{code:string}){
 return <span aria-hidden="true">{code==='TW'?<Image src="/flags/tw.svg" alt="" width={24} height={18} unoptimized style={{display:'inline-block',verticalAlign:'middle'}}/>:countryFlag(code)}</span>;
}
