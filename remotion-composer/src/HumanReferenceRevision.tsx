import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Composition,continueRender,delayRender,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import words from './mochi-three-styles/words.json';
import {H as C,HumanStyle} from './reference-human/theme';
import {HumanExplainer} from './reference-human/Explainer';
import {HumanOffice} from './reference-human/Office';
import {HumanStory} from './reference-human/Story';
const pages:typeof words[]=[];let line:typeof words=[];
words.forEach(w=>{line.push(w);if(w.pageBreakAfter||line.length>=5){pages.push(line);line=[];}});if(line.length)pages.push(line);
export const HumanReferenceRevision:React.FC<{style:HumanStyle}>=({style})=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=frame/fps;
 const [handle]=useState(()=>delayRender('Load Vietnamese captions')),[ready,setReady]=useState(false);
 useEffect(()=>{Promise.all([document.fonts.load('700 44px HumanReference'),document.fonts.load('400 30px HumanReference')]).then(()=>{setReady(true);continueRender(handle);});},[handle]);
 const page=pages.find((p,i)=>t>=p[0].start-.025&&t<Math.min(p[p.length-1].end+.16,pages[i+1]?.[0].start??Infinity));
 return <AbsoluteFill style={{background:C.dark,fontFamily:C.font,overflow:'hidden'}}>
  <style>{`@font-face{font-family:HumanReference;src:url('${staticFile('episodes/mochi-three-styles/regular.ttf')}')}@font-face{font-family:HumanReference;src:url('${staticFile('episodes/mochi-three-styles/bold.ttf')}');font-weight:700}`}</style>
  {ready&&(style==='explainer'?<HumanExplainer t={t} fps={fps}/>:style==='office'?<HumanOffice t={t} fps={fps}/>:<HumanStory t={t} fps={fps}/>)}
  <AbsoluteFill style={{background:style==='office'?'linear-gradient(115deg,#435AFF09,transparent 50%,#FFDA4D0B)':'linear-gradient(125deg,#FFD67508,transparent 50%,#46607906)',pointerEvents:'none'}}/>
  <AbsoluteFill style={{backgroundImage:`url('${staticFile(`episodes/mochi-three-styles/grain-${style==='explainer'?'flat':style==='office'?'office':'world'}.png`)}')`,opacity:style==='office'?.025:.055,mixBlendMode:'soft-light',pointerEvents:'none'}}/>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 45%,transparent 36%,#22203242)',pointerEvents:'none'}}/>
  {page&&<div style={{position:'absolute',left:75,right:75,top:1435,textAlign:'center',fontSize:45,lineHeight:1.35,fontWeight:700,WebkitTextStroke:'5px #24232A',paintOrder:'stroke fill',color:C.white,textShadow:'0 3px 4px #15152155'}}>{page.map((w,i)=><React.Fragment key={i}><span style={{color:t>=w.start&&t<w.end?C.yellow:C.white}}>{w.word}</span>{' '}</React.Fragment>)}</div>}
  <Audio src={staticFile('episodes/mochi-three-styles/master.wav')}/>
 </AbsoluteFill>;
};
export const HumanReferenceRoot=()=> <>
 <Composition id="HumanReferenceExplainer" component={HumanReferenceRevision} defaultProps={{style:'explainer' as HumanStyle}} durationInFrames={1200} fps={30} width={1080} height={1920}/>
 <Composition id="HumanReferenceOffice" component={HumanReferenceRevision} defaultProps={{style:'office' as HumanStyle}} durationInFrames={1200} fps={30} width={1080} height={1920}/>
 <Composition id="HumanReferenceStory" component={HumanReferenceRevision} defaultProps={{style:'story' as HumanStyle}} durationInFrames={1200} fps={30} width={1080} height={1920}/>
</>;
