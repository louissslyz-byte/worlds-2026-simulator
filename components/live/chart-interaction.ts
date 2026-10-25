// Presentation geometry only: never changes snapshot values or the plotted scale.
export const preciseProbability=(probability:number)=>`${(probability*100).toFixed(3)}%`;
export type ChartHit={node:number;event:number;x:number;y:number};
// Stable tie break follows event order; keyboard targets expose every overlapping event.
export function nearestChartHit(points:ChartHit[],x:number,y:number,radius=14):ChartHit|null{
 let nearest:ChartHit|null=null,distance=radius*radius;
 for(const point of points){const d=(point.x-x)**2+(point.y-y)**2;if(d<=distance&&(!nearest||d<distance)){nearest=point;distance=d;}}
 return nearest;
}
export function tooltipPosition(x:number,y:number,width:number,height:number,viewportWidth:number,viewportHeight:number){
 const gap=16,pad=8;
 return {left:Math.max(pad,Math.min(x+gap+width>viewportWidth-pad?x-gap-width:x+gap,viewportWidth-width-pad)),top:Math.max(pad,Math.min(y+gap+height>viewportHeight-pad?y-gap-height:y+gap,viewportHeight-height-pad))};
}

// Semantic snapshot labels from the verified index, never guessed from display text or IDs.
export function timelineLabel(node:{kind?:string;label:string}){
 if(node.kind==='PRE-TOURNAMENT')return '赛前';
 if(node.kind==='POST-PLAY-IN')return '入围赛后';
 const round=/^SWISS-R([1-5])-COMPLETE$/.exec(node.kind??'');
 if(round)return `Swiss R${round[1]}`;
 const stages:Record<string,string>={'QUARTERFINALS-COMPLETE':'Quarterfinals','SEMIFINALS-COMPLETE':'Semifinals','FINAL-COMPLETE':'Final'};
 return stages[node.kind??'']??node.label;
}
export function chartGeometry(nodeCount:number){
 const width=Math.max(320,72+(nodeCount-1)*120);
 return {width,x:(i:number)=>44+i*(width-68)/Math.max(1,nodeCount-1)};
}
export function lastVisibleNode(nodeCount:number,eliminationNodeIndex:number|null){
 if(eliminationNodeIndex===null)return nodeCount-1;
 if(!Number.isInteger(eliminationNodeIndex)||eliminationNodeIndex<0||eliminationNodeIndex>=nodeCount)throw Error('Invalid official elimination node');
 return eliminationNodeIndex;
}
