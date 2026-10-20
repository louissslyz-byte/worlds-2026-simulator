import type {ReactNode} from 'react';
import styles from './info-disclosure.module.css';
/** Native inline disclosure: click/touch/keyboard, no hover-only or floating content. */
export function InfoDisclosure({label,children}:{label:string;children:ReactNode}){
 return <details className={styles.disclosure}><summary aria-label={label}><span aria-hidden="true">ⓘ</span> {label}</summary><div className={styles.content}>{children}</div></details>;
}
