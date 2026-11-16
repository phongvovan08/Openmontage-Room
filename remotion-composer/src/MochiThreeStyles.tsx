import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Composition,continueRender,delayRender,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import words from './mochi-three-styles/words.json';
import {FlatFilm} from './mochi-three-styles/FlatFilm';
import {WorldFilm} from './mochi-three-styles/WorldFilm';
import {OfficeFilm} from './mochi-three-styles/OfficeFilm';
import {T as C,ROOT,Style,titles,beats,lerp} from './mochi-three-styles/theme';

const pages:typeof words[]=[];let page:typeof words=[];
words.forEach(w=>{page.push(w);if(w.pageBreakAfter||page.length>=5){pages.push(page);page=[];}});if(page.length)pages.push(page);
const Captions:React.FC<{t:number;style:Style}>=({t,style})=>{
 const p=pages.find((p,i)=>t>=p[0].start-.025&&t<Math.min(p[p.length-1].end+.19,pages[i+1]?.[0].start??Infinity));
 if(!p)return null;
 return <div style={{position:'absolute',left:80,right:80,bottom:343,display:'flex',justifyContent:'center',pointerEvents:'none'}}>
   <div style={{padding:'10px 15px',maxWidth:910,textAlign:'center',fontSize:49,lineHeight:1.4,fontWeight:700,color:C.white,WebkitTextStroke:'5px #172035',paintOrder:'stroke fill',textShadow:'0 4px 12px #0A132866',borderRadius:15,background:style==='office'?'#17254166':undefined}}>
     {p.map((w,i)=><React.Fragment key={i}><span style={{color:t>=w.start&&t<w.end?C.yellow:C.white}}>{w.word}</span>{' '}</React.Fragment>)}
   </div>
 </div>;
};
export const MochiThreeFilm:React.FC<{style:Style}>=({style})=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=frame/fps;
 const [handle]=useState(()=>delayRender('Load local Vietnamese typefaces'));
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{Promise.all([document.fonts.load('700 49px MochiThree'),document.fonts.load('400 30px MochiThree')]).then(()=>{setLoaded(true);continueRender(handle);}).catch(error=>{throw error;});},[handle]);
 const index=style==='flat'?0:style==='office'?1:2;
 const darkType=style==='flat'&&!(t>=15&&t<20);
 const nextBeat=beats.find(b=>t>=b&&t<b+.18&&b>0&&b<37);
 const wipe=nextBeat===undefined?0:lerp(t,nextBeat,nextBeat+.18,.12,0);
 return <AbsoluteFill style={{background:C.navy,fontFamily:C.font,overflow:'hidden'}}>
   <style>{`@font-face{font-family:MochiThree;src:url('${staticFile(`${ROOT}/regular.ttf`)}')}@font-face{font-family:MochiThree;src:url('${staticFile(`${ROOT}/bold.ttf`)}');font-weight:700}`}</style>
   {loaded&&(style==='flat'?<FlatFilm t={t} fps={fps}/>:style==='office'?<OfficeFilm t={t} fps={fps}/>:<WorldFilm t={t} fps={fps}/>)}
   <AbsoluteFill style={{pointerEvents:'none',background:`linear-gradient(140deg,${C.yellow}06,transparent 45%,${C.blue}0B)`}}/>
   <AbsoluteFill style={{opacity:style==='world'?.045:.023,backgroundImage:`url('${staticFile(`${ROOT}/grain-${style}.png`)}')`,mixBlendMode:'soft-light',pointerEvents:'none'}}/>
   <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 46%,transparent 40%,#101D383D)',pointerEvents:'none'}}/>
   <AbsoluteFill style={{background:C.white,opacity:wipe,pointerEvents:'none'}}/>
   <div style={{position:'absolute',left:58,right:58,top:108,display:'flex',alignItems:'center',justifyContent:'space-between',gap:20,color:darkType?C.ink:C.white,fontSize:21,fontWeight:700,letterSpacing:1.5,textShadow:darkType?undefined:'0 2px 12px #152541'}}>
     <span style={{borderBottom:`3px solid ${C.green}`,paddingBottom:8}}>BÉ MOCHI MẦM XANH</span><span style={{fontSize:19}}>{String(index+1).padStart(2,'0')} / 03</span>
   </div>
   <div style={{position:'absolute',top:172,left:58,fontSize:20,letterSpacing:1.5,color:darkType?C.ink:C.white,opacity:.8,textShadow:darkType?undefined:'0 2px 12px #152541'}}>{titles[index]}</div>
   <Captions t={t} style={style}/>
   <div style={{position:'absolute',left:0,bottom:0,height:4,width:`${frame/1200*100}%`,background:C.green}}/>
   <Audio src={staticFile(`${ROOT}/master.wav`)}/>
 </AbsoluteFill>;
};
export const MochiThreeStylesRoot=()=> <>
 <Composition id="MochiReferenceFlat" component={MochiThreeFilm} defaultProps={{style:'flat' as Style}} durationInFrames={1200} fps={30} width={1080} height={1920}/>
 <Composition id="MochiReferenceOffice" component={MochiThreeFilm} defaultProps={{style:'office' as Style}} durationInFrames={1200} fps={30} width={1080} height={1920}/>
 <Composition id="MochiReferenceWorld" component={MochiThreeFilm} defaultProps={{style:'world' as Style}} durationInFrames={1200} fps={30} width={1080} height={1920}/>
</>;
