import {Easing,interpolate,spring} from 'remotion';
export const T={paper:'#F5F0E5',ink:'#263635',muted:'#7D8982',line:'#D7DBD0',blue:'#467E87',blueLight:'#DDE9E8',cream:'#FFFDF5',clay:'#BA7558',peach:'#EAC9AD',green:'#667A62',night:'#344E57',glass:'#AFC7C8',floor:'#D7C3A8',gold:'#D8B57D',font:'PeepFilm',ease:Easing.bezier(.33,0,.2,1)} as const;
export const ease=(t:number,a:number,b:number,x=0,y=1)=>interpolate(t,[a,b],[x,y],{easing:T.ease,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const enter=(t:number,start:number,fps:number)=>spring({frame:(t-start)*fps,fps,config:{damping:22,stiffness:130,mass:.8}});
export const beats=[0,5.7,10.4,20,23.3,28.5,32.3,37.4,40];
export const beatAt=(t:number)=>Math.max(0,beats.findIndex((b,i)=>t>=b&&t<beats[i+1]));
export type Mode='flat'|'depth';
