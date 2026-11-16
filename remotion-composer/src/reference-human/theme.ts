import {Easing,interpolate,spring} from 'remotion';
export const H={
 ink:'#292827',skin:'#F3EFD9',white:'#FFFFF3',orange:'#DA8B3D',hair:'#493629',
 blue:'#76AFCE',green:'#79AB95',mint:'#BDD5C1',cream:'#EAD8AF',wood:'#AC7751',
 dark:'#132335',yellow:'#F4D365',red:'#CA6D63',purple:'#9280BC',
 font:'HumanReference',ease:Easing.bezier(.32,0,.2,1),spring:{damping:20,stiffness:140,mass:.7},
} as const;
export const lerp=(t:number,a:number,b:number,x:number,y:number)=>interpolate(t,[a,b],[x,y],{easing:H.ease,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const pop=(t:number,start:number,fps:number)=>spring({frame:Math.max(0,(t-start)*fps),fps,config:H.spring});
export const beats=[0,2.4,5.7,10.4,15,20,23.3,27.8,32.3,37.4,40];
export const shotAt=(t:number)=>Math.max(0,beats.findIndex((b,i)=>t>=b&&t<beats[i+1]));
export type Emotion='neutral'|'fear'|'calm'|'smile';
export const emotionAt=(t:number):Emotion=>t<5.7?'neutral':t<20?'fear':t<23.3?'calm':t<32.3?'neutral':'smile';
export type HumanStyle='explainer'|'office'|'story';
