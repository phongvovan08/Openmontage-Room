import deformation from './deform.json';
import {Mode,ease} from './theme';
type Segment={cmd:string;v:number[]};
// Continuous weighted vector deformation keeps the compound ink and paper
// outlines together, avoiding cutout seams in the hand-held prop movement.
export function movingBody(mode:Mode,t:number){
 const data=deformation[mode] as {template:string;paths:Segment[][]};
 const check=ease(t,0,2.6)-ease(t,3.7,5.5)+ease(t,23.3,24.8)-ease(t,26,28.4);
 const dx=(mode==='flat'?18:-15)*Math.sin(t*.85)+check*12;
 const dy=-check*30+Math.sin(t*1.7)*5;
 const cx=mode==='flat'?590:410,cy=mode==='flat'?330:410;
 return data.template.replace(/__d(\d+)__/g,(_,id)=>data.paths[Number(id)].map(seg=>{
  const a=[...seg.v];
  for(let i=seg.cmd==='A'?5:0;i<a.length;i+=2){
   const x=a[i],y=a[i+1],weight=Math.exp(-((x-cx)**2+(y-cy)**2)/(2*160**2));
   a[i]=x+dx*weight;a[i+1]=y+dy*weight;
  }
  return seg.cmd+a.map(v=>Number(v.toFixed(2))).join(' ');
 }).join(' '));
}
