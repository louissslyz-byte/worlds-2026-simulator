export const SIMULATION_COUNTS = {
 preview: 2_000,
 development: 5_000,
 conditional: 5_000,
 production: 100_000,
} as const;

/** Small percentages should not look like mathematical impossibilities. */
export function formatProbability(value:number):string {
 if(!Number.isFinite(value)||value<0)return '—';
 if(value<0.001)return '<0.1%';
 return `${(value*100).toFixed(1)}%`;
}
