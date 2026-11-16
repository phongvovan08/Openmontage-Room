import {Easing,interpolate,spring} from 'remotion';
export const T={
  ink:'#25324B',white:'#FFFEF5',milk:'#F8F5E9',yellow:'#FDE047',green:'#4ADE80',
  leaf:'#239B68',pink:'#F4A7A3',red:'#EB7581',blue:'#608DC9',navy:'#172B4F',
  sky:'#DAEDF6',cream:'#FFF2D9',wood:'#C88C60',wall:'#E4E9DA',muted:'#8FA1B3',
  violet:'#8674BD',darkViolet:'#3D365F',teal:'#669D9D',floor:'#B4C0B5',
  font:'MochiThree',ease:Easing.bezier(.33,.0,.2,1),
  spring:{damping:19,stiffness:115,mass:.8},
} as const;
export const ROOT='episodes/mochi-three-styles';
export const lerp=(t:number,a:number,b:number,x:number,y:number)=>interpolate(t,[a,b],[x,y],{easing:T.ease,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const enter=(t:number,at:number,fps:number)=>spring({frame:Math.max(0,(t-at)*fps),fps,config:T.spring});
export const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const beats=[0,2.4,5.7,10.4,15,20,23.3,27.8,32.3,37.4,40];
export const shotAt=(t:number)=>Math.max(0,beats.findIndex((s,i)=>t>=s&&t<beats[i+1]));
export type Style='flat'|'office'|'world';
export type Mood='calm'|'worry'|'breathe'|'happy';
export const moodAt=(t:number):Mood=>t<5.7?'calm':t<20?'worry':t<23.3?'breathe':t<32.3?'calm':'happy';
export const titles=['HOẠT HÌNH 2D GIẢI THÍCH','NHÂN VẬT & VĂN PHÒNG 3D','THẾ GIỚI 2D NHIỀU LỚP'];
