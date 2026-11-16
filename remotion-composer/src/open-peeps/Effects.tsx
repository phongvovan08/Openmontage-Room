import React from 'react';
import {T,Mode,ease,enter,beats} from './theme';
import {walkState,isWalkShot} from './walk-motion';
import {useVideoConfig} from 'remotion';

export const StoryEffects:React.FC<{mode:Mode;t:number}>=({mode,t})=>{
 const {fps}=useVideoConfig(),flat=mode==='flat',accent=flat?T.blue:T.clay;
 const hit=2.35,ring=ease(t,hit,hit+.55),burst=Math.max(0,1-ease(t,hit+.22,hit+.9));
 const anxious=t>=5.7&&t<20,calm=ease(t,20,22.5),happy=t>=28.5;
 const cut=beats.slice(1,-1).find(at=>t>=at&&t<at+.23);
 const gait=isWalkShot(t)?walkState(t,mode):null;
 return <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
  {!flat&&<><div style={{position:'absolute',left:170,top:40,width:800,height:940,background:`linear-gradient(120deg,${T.cream}00,${T.cream}22,${T.cream}00)`,clipPath:'polygon(0 0,20% 0,100% 100%,56% 100%)',transform:`translateX(${Math.sin(t*.22)*45}px)`}}/>{Array.from({length:25},(_,i)=><div key={i} style={{position:'absolute',left:170+(i*127)%1450+Math.sin(t*.35+i)*24,top:130+(i*83+t*(8+i%4))%750,width:2+i%3,height:2+i%3,borderRadius:'50%',background:T.cream,opacity:.2+.2*Math.sin(t+i)**2}}/>)}</>}
  {t>=hit&&t<hit+1.1&&<svg width="1920" height="1080" style={{position:'absolute',opacity:burst}}>{[0,1,2].map(i=><circle key={i} cx={flat?1195:600} cy={flat?430:360} r={60+ring*(220+i*80)} stroke={accent} strokeWidth={4-i} fill="none" opacity={.6-i*.15}/>)}{Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <path key={i} d={`M${(flat?1195:600)+Math.cos(a)*(90+ring*120)} ${(flat?430:360)+Math.sin(a)*(90+ring*120)}l${Math.cos(a)*35} ${Math.sin(a)*35}`} stroke={accent} strokeWidth="4" strokeLinecap="round"/>;})}</svg>}
  {anxious&&<svg width="1920" height="1080" style={{position:'absolute',opacity:Math.min(.5,enter(t,5.7,fps)*.5)*(1-calm)}}>{Array.from({length:9},(_,i)=>{const x=flat?820+i*100:160+i*75,y=(flat?298:235)+Math.sin(t*1.5+i)*12;return <path key={i} d={`M${x} ${y}l12-18 12 33 13-24 14 14`} stroke={accent} strokeWidth="3" fill="none" strokeDasharray="70" strokeDashoffset={Math.sin(t*2+i)*20}/>;})}</svg>}
  {gait&&gait.weight>.2&&<svg width="1920" height="1080" style={{position:'absolute',opacity:.25*gait.weight}}>{[0,1,2].map(i=><path key={i} d={`M${gait.x-gait.direction*(130+i*8)} ${600+i*30}h${-gait.direction*(40+i*14)}`} stroke={accent} strokeWidth="3" strokeLinecap="round"/>)}</svg>}
  {happy&&Array.from({length:9},(_,i)=>{const q=ease(t,28.5+i*.04,29.8+i*.04),fade=1-ease(t,29.1+i*.04,30.8+i*.04);return <svg key={i} width="25" height="25" viewBox="0 0 25 25" style={{position:'absolute',left:(flat?470:1170)+Math.cos(i*2.4)*(90+130*q),top:360-Math.sin(i*.8)*(30+170*q),opacity:fade,transform:`scale(${q}) rotate(${q*90+i*20}deg)`}}><path d="M12 1L15 9 24 12 15 15 12 24 9 15 1 12 9 9Z" fill={accent}/></svg>;})}
  {cut!==undefined&&<div style={{position:'absolute',inset:0,background:flat?T.paper:T.cream,transform:`translateX(${ease(t,cut,cut+.23,110,-110)}%) skewX(-16deg)`,opacity:.94}}/>}
 </div>;
};
