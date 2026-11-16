import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Composition,continueRender,delayRender,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {FlatStage} from './open-peeps/FlatStage';
import {DepthStage} from './open-peeps/DepthStage';
import {T,Mode,ease} from './open-peeps/theme';
import words from './open-peeps/words.json';
import {StoryEffects} from './open-peeps/Effects';
const pages:typeof words[]=[];let page:typeof words=[];
for(const w of words){page.push(w);if(w.pageBreakAfter||page.length>=8){pages.push(page);page=[];}}if(page.length)pages.push(page);
const noise="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")";
export const OpenPeepsFilm:React.FC<{mode:Mode}>=({mode})=>{
 const f=useCurrentFrame(),{fps}=useVideoConfig(),t=f/fps;
 const [wait]=useState(()=>delayRender('Open Peeps local fonts'));
 useEffect(()=>{Promise.all([document.fonts.load('700 65px PeepFilm'),document.fonts.load('400 34px PeepFilm')]).then(()=>continueRender(wait));},[wait]);
 const active=pages.find((p,i)=>t>=p[0].start-.025&&t<Math.min(p[p.length-1].end+.15,pages[i+1]?.[0].start??Infinity));
 const fade=ease(t,39.5,40,1,0);
 return <AbsoluteFill style={{fontFamily:T.font,background:T.paper,overflow:'hidden',color:T.ink}}>
  <style>{`@font-face{font-family:PeepFilm;src:url('${staticFile('episodes/open-peeps-demo/regular.ttf')}')}@font-face{font-family:PeepFilm;src:url('${staticFile('episodes/open-peeps-demo/bold.ttf')}');font-weight:700}`}</style>
  <AbsoluteFill style={{opacity:fade}}>{mode==='flat'?<FlatStage t={t}/>:<DepthStage t={t}/>}</AbsoluteFill>
  <StoryEffects mode={mode} t={t}/>
  <AbsoluteFill style={{pointerEvents:'none',background:`linear-gradient(135deg,${T.peach}0C,transparent 65%,${T.night}0A)`}}/>
  <AbsoluteFill style={{pointerEvents:'none',backgroundImage:noise,backgroundPosition:`${f%160}px ${(f*3)%160}px`,opacity:.036,mixBlendMode:'multiply'}}/>
  <AbsoluteFill style={{pointerEvents:'none',background:`radial-gradient(ellipse at 50% 45%,transparent 55%,${T.night}12)`}}/>
  <div style={{position:'absolute',left:85,top:48,fontSize:19,letterSpacing:4,fontWeight:700,color:T.ink,opacity:.67}}>{mode==='flat'?'01 / TRUYỆN TRANH 2D':'02 / KHÔNG GIAN 2.5D'}</div>
  <div style={{position:'absolute',right:85,top:48,fontSize:18,letterSpacing:2,color:T.ink,opacity:.6}}>CHUYỆN CHƯA XẢY RA</div>
  {active&&<div style={{position:'absolute',bottom:55,left:140,right:140,textAlign:'center'}}><div style={{display:'inline-block',maxWidth:1540,padding:'13px 28px 17px',background:`${T.cream}F2`,borderRadius:15,boxShadow:`0 4px 15px ${T.night}10`,fontSize:34,lineHeight:1.35,fontWeight:700}}>{active.map((w,i)=><React.Fragment key={i}><span style={{color:t>=w.start&&t<w.end?(mode==='flat'?T.blue:T.clay):T.ink}}>{w.word}</span>{' '}</React.Fragment>)}</div></div>}
  <div style={{position:'absolute',left:85,bottom:18,fontSize:14,color:T.ink,opacity:.52}}>Nhân vật: Open Peeps · Pablo Stanley / CC0</div>
  <div style={{position:'absolute',bottom:0,left:0,width:`${t/40*100}%`,height:3,background:mode==='flat'?T.blue:T.clay}}/>
  <Audio src={staticFile(`episodes/open-peeps-demo/${mode}-walk.wav`)}/>
 </AbsoluteFill>;
};
export const OpenPeepsRoot=()=> <>
 <Composition id="OpenPeeps2D" component={OpenPeepsFilm} durationInFrames={1200} fps={30} width={1920} height={1080} defaultProps={{mode:'flat' as Mode}}/>
 <Composition id="OpenPeeps25D" component={OpenPeepsFilm} durationInFrames={1200} fps={30} width={1920} height={1080} defaultProps={{mode:'depth' as Mode}}/>
</>;
