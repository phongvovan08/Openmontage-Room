import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Composition,continueRender,delayRender,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import words from './mochi-three-styles/words.json';
import {P,asset} from './paper-puppet/theme';
import {AtlasProvider} from './paper-puppet/Rig';
import {PaperStage} from './paper-puppet/Stage';
const pages:typeof words[]=[];let buffer:typeof words=[];
words.forEach(w=>{buffer.push(w);if(w.pageBreakAfter||buffer.length>=5){pages.push(buffer);buffer=[];}});if(buffer.length)pages.push(buffer);
export const PaperPuppetFilm=()=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=frame/fps;
 const [handle]=useState(()=>delayRender('Load local typography')),[ready,setReady]=useState(false);
 useEffect(()=>{Promise.all([document.fonts.load('700 45px PaperPuppet'),document.fonts.load('400 30px PaperPuppet')]).then(()=>{setReady(true);continueRender(handle);});},[handle]);
 const page=pages.find((p,i)=>t>=p[0].start-.025&&t<Math.min(p[p.length-1].end+.18,pages[i+1]?.[0].start??Infinity));
 return <AbsoluteFill style={{fontFamily:P.font,background:P.night,overflow:'hidden'}}>
  <style>{`@font-face{font-family:PaperPuppet;src:url('${staticFile(`${asset}/regular.ttf`)}')}@font-face{font-family:PaperPuppet;src:url('${staticFile(`${asset}/bold.ttf`)}');font-weight:700}`}</style>
  {ready&&<ThreeCanvas width={1080} height={1920} dpr={1} shadows camera={{fov:36,near:.08,far:70}} gl={{antialias:true,preserveDrawingBuffer:true}}><AtlasProvider><PaperStage t={t}/></AtlasProvider></ThreeCanvas>}
  <AbsoluteFill style={{pointerEvents:'none',background:'radial-gradient(ellipse at 50% 42%,transparent 45%,#12203230)'}}/>
  <AbsoluteFill style={{pointerEvents:'none',background:'linear-gradient(transparent 70%,#14202B36)'}}/>
  {page&&<div style={{position:'absolute',left:75,right:75,bottom:260,textAlign:'center',fontSize:45,lineHeight:1.38,fontWeight:700,color:P.white,WebkitTextStroke:'3px #29333D',paintOrder:'stroke fill',textShadow:'0 4px 10px #17253766'}}>{page.map((w,i)=><React.Fragment key={i}><span style={{color:t>=w.start&&t<w.end?P.yellow:P.white}}>{w.word}</span>{' '}</React.Fragment>)}</div>}
  <Audio src={staticFile(`${asset}/master.wav`)}/>
 </AbsoluteFill>;
};
export const PaperPuppetRoot=()=> <Composition id="OriginalPaperPuppet25D" component={PaperPuppetFilm} durationInFrames={1200} fps={30} width={1080} height={1920}/>;
