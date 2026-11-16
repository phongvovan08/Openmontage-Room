import {Easing,interpolate} from 'remotion';
export const P={ink:'#29333D',paper:'#F2E7CD',white:'#FFF8E9',sage:'#809B7B',wood:'#B48450',teal:'#43696A',night:'#273B52',yellow:'#E6C779',font:'PaperPuppet',ease:Easing.bezier(.33,0,.2,1)} as const;
export const asset='episodes/original-paper-story';
export const lerp=(t:number,a:number,b:number,x:number,y:number)=>interpolate(t,[a,b],[x,y],{easing:P.ease,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const beats=[0,2.4,5.7,10.4,20,23.3,27.8,32.3,37.4,40];
export const shotAt=(t:number)=>Math.max(0,beats.findIndex((v,i)=>t>=v&&t<beats[i+1]));
export const rootX=(t:number)=>t<2.4?lerp(t,0,2.4,-1.5,0):t>34.4?lerp(t,34.4,37.4,0,-1.3):0;
export type XY=[number,number];
export function solve(a:XY,b:XY,l1:number,l2:number,bend:number){
 const dx=b[0]-a[0],dy=b[1]-a[1],distance=Math.max(.025,Math.min(l1+l2-.0001,Math.hypot(dx,dy)));
 const angle=Math.atan2(dx,-dy)+bend*Math.acos(Math.max(-1,Math.min(1,(distance*distance+l1*l1-l2*l2)/(2*distance*l1))));
 return [a[0]+Math.sin(angle)*l1,a[1]-Math.cos(angle)*l1] as XY;
}
