import React from 'react';
import art from './art.json';
import {T,Mode,beatAt} from './theme';
import {WALK_SCALE,walkState,knee,foot,Point} from './walk-motion';

const line=(a:Point,b:Point,c:Point)=>`M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}`;
const Hand:React.FC<{at:Point;angle:number}>=({at,angle})=><g transform={`translate(${at[0]} ${at[1]}) rotate(${angle})`}><path d="M-12-16C-19-12-16 1-14 10L-10 29Q-7 36-3 29L-4 13 1 34Q6 39 8 31L6 12 12 28Q18 31 19 24L16 6 22 19Q28 21 26 12L18-9Q12-24-1-22Z" fill={T.cream} stroke={T.ink} strokeWidth="4" strokeLinejoin="round"/></g>;
const Leg:React.FC<{hip:Point;ankle:Point;angle:number;motion:number;back?:boolean;mode:Mode}>=({hip,ankle,angle,motion,back=false,mode})=>{
 const length=181+19*motion;
 const k=knee(hip,ankle,length,length),d=line(hip,k,ankle),color=mode==='flat'?(back?T.night:T.blue):(back?T.floor:T.paper);
 return <g><path d={d} fill="none" stroke={T.ink} strokeWidth="69" strokeLinecap="round" strokeLinejoin="round"/><path d={d} fill="none" stroke={color} strokeWidth="59" strokeLinecap="round" strokeLinejoin="round"/><path d={`M${k[0]-12} ${k[1]-10}l18 12`} stroke={T.ink} strokeWidth="3" opacity=".28" fill="none"/><g transform={`translate(${ankle[0]} ${ankle[1]}) rotate(${angle})`}><path d="M-29-14Q-6-21 18-6L43 6Q67 8 71 28Q40 37-33 29Z" fill={T.cream} stroke={T.ink} strokeWidth="5" strokeLinejoin="round"/><path d="M-30 20Q8 27 65 20M12 1L2 9M24 5L14 13" fill="none" stroke={T.ink} strokeWidth="3" strokeLinecap="round"/></g></g>;
};
const Arm:React.FC<{shoulder:Point;hand:Point;mode:Mode;back?:boolean;angle?:number}>=({shoulder,hand,mode,back=false,angle=0})=>{
 const k=knee(shoulder,hand,130,130),d=line(shoulder,k,hand);
 return <g><path d={d} fill="none" stroke={T.ink} strokeWidth="50" strokeLinecap="round" strokeLinejoin="round"/><path d={d} fill="none" stroke={mode==='flat'?T.blueLight:(back?T.clay:T.peach)} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/><path d={`M${hand[0]-18} ${hand[1]-7}l32 7`} stroke={T.ink} strokeWidth="3"/><Hand at={hand} angle={angle}/></g>;
};

/** Original articulated body, with the actual CC0 Open Peeps head/expressions.
 * Each foot has a stationary support phase, lifted recovery phase, two-bone IK,
 * knee bending and shoe roll. Phase is driven by travelled distance, not time.
 */
export const WalkingActor:React.FC<{mode:Mode;t:number;floor?:number;scale?:number}>=({mode,t,floor=925,scale=WALK_SCALE})=>{
 const s=walkState(t,mode),p=s.phase*Math.PI*2,b=beatAt(t),flat=mode==='flat';
 const bob=-7*(1-Math.cos(p*2))*s.weight;
 const left=foot(s.phase,0,s.weight),right=foot(s.phase,.5,s.weight);
 const hips:Point[]=[[273,590+bob],[327,590+bob]];
 const shoulderL:Point=[243,290+bob],shoulderR:Point=[367,290+bob];
 const lhand:Point=[212+Math.sin(p)*80*s.weight,515+bob-28*Math.abs(Math.sin(p))*s.weight];
 const rhand:Point=flat?[393+8*Math.sin(p)*s.weight,425+bob]:[393-Math.sin(p)*75*s.weight,520+bob-25*Math.abs(Math.sin(p))*s.weight];
 const data=art[mode] as Record<string,string>;
 const face=flat?(b>=5?'smile':b===2?'concerned':'serious'):(b>=5?'cute':b===2?'fear':'suspicious');
 const blink=(t+.3)%3.7>3.55;
 return <div style={{position:'absolute',left:s.x-300*scale,top:floor-980*scale,width:600*scale,height:1040*scale,transform:`scaleX(${s.direction})`,transformOrigin:'50% 50%'}}>
  <svg viewBox="0 0 600 1040" style={{width:'100%',height:'100%',overflow:'visible',...{'--ink':T.ink,'--paper':T.cream,'--skin':T.cream,'--hair':flat?T.ink:T.night} as React.CSSProperties}}>
   <ellipse cx="305" cy="985" rx={125-8*Math.cos(p*2)*s.weight} ry="14" fill={T.night} opacity=".15"/>
   <Leg mode={mode} hip={hips[0]} ankle={left.point} angle={left.angle} motion={s.weight} back/>
   <Arm mode={mode} shoulder={shoulderL} hand={lhand} back angle={-Math.sin(p)*12*s.weight}/>
   <Leg mode={mode} hip={hips[1]} ankle={right.point} angle={right.angle} motion={s.weight}/>
   <g transform={`translate(0 ${bob}) rotate(${Math.sin(p)*1.1*s.weight} 300 560)`}>
    <path d="M280 190L278 258Q300 285 328 256L326 191Z" fill={T.cream} stroke={T.ink} strokeWidth="5"/>
    <path d="M276 250Q241 251 215 278Q201 331 218 414L231 578Q297 600 375 576L391 399Q408 322 385 278Q358 252 331 250Q307 275 276 250Z" fill={flat?T.blueLight:T.peach} stroke={T.ink} strokeWidth="5" strokeLinejoin="round"/>
    {flat?<g fill={T.ink}>{[[250,320],[322,299],[358,352],[281,378],[244,424],[337,438],[292,490],[356,531],[256,548]].map(([x,y],i)=><path key={i} d={`M${x} ${y}q-8-12 3-18q12 7-3 18`} transform={`rotate(${i*38} ${x} ${y})`}/>)}</g>:<><path d="M303 270Q315 390 309 578M279 255L299 287 320 266M332 254L326 285" fill="none" stroke={T.ink} strokeWidth="4"/>{[328,392,460,529].map(y=><circle key={y} cx="318" cy={y} r="3" fill={T.ink}/>)}</>}
    <path d="M234 570Q304 590 371 569" fill="none" stroke={T.ink} strokeWidth="4"/>
    <g transform={`translate(210 10) rotate(${(b===2?4:0)+Math.sin(p)*1.3*s.weight} 95 204) scale(.4)`}>
     <g dangerouslySetInnerHTML={{__html:data[flat?'head/short-1':'head/wavy']}}/>
     <g transform={`translate(159 186) ${blink?'translate(0 110) scale(1 .12) translate(0 -110)':''}`} dangerouslySetInnerHTML={{__html:data['face/'+face]}}/>
    </g>
   </g>
   <Arm mode={mode} shoulder={shoulderR} hand={rhand} angle={flat?-10:Math.sin(p)*12*s.weight}/>
   {flat&&<g transform={`translate(${rhand[0]-4} ${rhand[1]-96}) rotate(12)`}><rect width="55" height="101" rx="9" fill={T.ink}/><rect x="5" y="7" width="45" height="82" rx="4" fill={T.glass}/><path d="M18 5H37" stroke={T.cream} strokeWidth="2"/><path d="M-6 76L17 64Q24 63 25 69L7 81" fill={T.cream} stroke={T.ink} strokeWidth="4"/></g>}
   {s.weight>.1&&[0,.5].map((offset,i)=>{const q=((s.phase+offset)%1+1)%1;const fade=Math.max(0,1-q/.19)*s.weight;return <g key={i} opacity={fade*.5} fill="none" stroke={flat?T.blue:T.clay} strokeWidth="3"><ellipse cx={foot(s.phase,offset,s.weight).point[0]} cy="980" rx={25+q*160} ry={6+q*30}/><path d={`M${300-55-i*55} 950l-18-13m-12 20l-20-5`}/></g>;})}
  </svg>
 </div>;
};
