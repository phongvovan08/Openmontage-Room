import {Mode,ease} from './theme';
export const WALK_SCALE=.65;
export const STRIDE=220;
export const DUTY=.62;
export const CYCLE_PIXELS=STRIDE/DUTY*WALK_SCALE;
export const isWalkShot=(t:number)=>t<5.7||(t>=10.4&&t<20)||t>=32.3;

function track(t:number,mode:Mode){
 const flat=mode==='flat';
 if(t<5.7){const start=flat?280:440,end=flat?670:1220;return {x:ease(t,.05,3.9,start,end),distance:ease(t,.05,3.9,0,end-start),direction:1};}
 if(t<20){
  const start=flat?300:1070,end=flat?690:1460;
  if(t<15.05)return {x:ease(t,10.45,14.55,start,end),distance:ease(t,10.45,14.55,0,end-start),direction:1};
  return {x:ease(t,15.25,19.65,end,start),distance:end-start+ease(t,15.25,19.65,0,end-start),direction:-1};
 }
 const start=flat?1180:1110,end=flat?1850:1960;
 return {x:ease(t,32.4,39.2,start,end),distance:ease(t,32.4,39.2,0,end-start),direction:1};
}
export function walkState(t:number,mode:Mode){
 const s=track(t,mode),before=track(Math.max(0,t-.005),mode),after=track(t+.005,mode);
 const speed=Math.abs(after.x-before.x)/.01;
 const w=Math.min(1,speed/75);
 return {...s,phase:s.distance/CYCLE_PIXELS,weight:w*w*(3-2*w),speed};
}
export type Point=[number,number];
export function knee(hip:Point,ankle:Point,l1=200,l2=200):Point{
 const dx=ankle[0]-hip[0],dy=ankle[1]-hip[1];
 const d=Math.min(l1+l2-.001,Math.max(.001,Math.hypot(dx,dy)));
 const a=Math.atan2(dy,dx)-Math.acos(Math.max(-1,Math.min(1,(d*d+l1*l1-l2*l2)/(2*d*l1))));
 return [hip[0]+Math.cos(a)*l1,hip[1]+Math.sin(a)*l1];
}
export function foot(phase:number,offset:number,weight:number):{point:Point;angle:number;plant:boolean}{
 const p=((phase+offset)%1+1)%1;
 let x,y,angle;
 if(p<DUTY){x=STRIDE/2-STRIDE*p/DUTY;y=950;angle=0;}
 else{const u=(p-DUTY)/(1-DUTY);const q=u*u*(3-2*u);x=-STRIDE/2+STRIDE*q;y=950-68*Math.sin(Math.PI*u);angle=-23*Math.sin(Math.PI*u);}
 const idleX=offset===0?-38:38;
 return {point:[300+idleX*(1-weight)+x*weight,950+(y-950)*weight],angle:angle*weight,plant:p<DUTY};
}
