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
