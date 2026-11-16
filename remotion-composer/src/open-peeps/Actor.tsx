import React from 'react';
import art from './art.json';
import {T,Mode,beatAt,ease} from './theme';
import {movingBody} from './deform';

// The artwork is CC0 Open Peeps. Composition and animation below are original.
// Compound outlines deform continuously; head and expression are independent layers.
export const Actor:React.FC<{mode:Mode;t:number;full?:boolean;bodyOverride?:string;style?:React.CSSProperties}>=({mode,t,full=false,bodyOverride,style})=>{
 const b=beatAt(t),flat=mode==='flat';
 const data=art[mode] as Record<string,string>;
 const head=flat?'head/short-1':'head/wavy';
 const expressions=flat?['serious','concerned','concerned','eyes-closed','serious','smile','smile','smile']:['suspicious','fear','fear','calm','suspicious','cute','cute','cute'];
 const blink=(t+(.3*(flat?1:2)))%4.1>3.92;
 const face='face/'+(blink&&flat?'eyes-closed':expressions[b]);
 const body=bodyOverride??(full?('pose/standing/'+(flat?'shirt-1':'resting-2')):('body/'+(flat?'device':'coffee')));
 const headX=full?404:372,headY=180;
 const breathe=b===3?Math.sin((t-20)*Math.PI/2.4):Math.sin(t*1.9);
 const tilt=(b===1||b===2?5:b===3?-2:b>=5?-4:1)+Math.sin(t*1.15)*1.0;
 const hx=headX+230,hy=650;
 const lift=b===3?-breathe*8:Math.sin(t*1.7)*2;
 return <svg viewBox={full?'0 0 1179 3291':'0 0 1136 1533'} style={{overflow:'visible',...style,...{'--ink':T.ink,'--paper':T.cream,'--skin':flat?T.cream:'#F8E9D5','--cloth':flat?T.blueLight:T.peach,'--hair':flat?T.ink:T.night} as React.CSSProperties}}>
  <g transform={`translate(0 ${lift}) scale(1 ${1+(b===3?.009:.0025)*breathe})`}>
   <g transform={full?'translate(-121 634)':'translate(147 639)'} dangerouslySetInnerHTML={{__html:!full&&!bodyOverride?movingBody(mode,t):data[body]}}/>
   <g transform={`translate(${hx} ${hy}) rotate(${tilt}) translate(${-hx} ${-hy})`}>
    <g transform={`translate(${headX} ${headY})`} dangerouslySetInnerHTML={{__html:data[head]}}/>
    <g transform={`translate(${headX+159} ${headY+186}) ${!flat&&blink?'translate(0 120) scale(1 .12) translate(0 -120)':''}`} dangerouslySetInnerHTML={{__html:data[face]}}/>
   </g>
  </g>
 </svg>;
};

export const Scribble:React.FC<{x:number;y:number;t:number;color?:string;size?:number}>=({x,y,t,color=T.ink,size=100})=> <svg viewBox="0 0 100 80" style={{position:'absolute',left:x,top:y,width:size,height:size*.8,overflow:'visible',transform:`rotate(${Math.sin(t*3)*3}deg)`}}><path d="M8 49C8 8 87 5 84 42S9 68 18 31 95 23 72 58 5 53 35 23 97 48 48 66" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"/></svg>;
