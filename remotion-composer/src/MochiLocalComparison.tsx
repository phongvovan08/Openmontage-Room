import React,{useEffect,useState} from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {MOCHI_EP01_FULL_WORDS} from './beMochiEp01FullData';
import {SvgWorld} from './mochi-local-demo/SvgWorld';
import {StoryWorld} from './mochi-local-demo/StoryWorld';
import {ASSET_ROOT,DEMO_SECONDS,LOCAL_THEME as C,SHOTS,tween} from './mochi-local-demo/theme';

type Style='svg'|'story';
const words=MOCHI_EP01_FULL_WORDS.filter(w=>w.end<=109.5);
const pages:typeof words[]=[];
let buffer:typeof words=[];
words.forEach((word,i)=>{
  buffer.push(word);
  if(word.pageBreakAfter||/[.!?;]$/.test(word.word)||buffer.length>=8||(words[i+1]&&words[i+1].start-word.end>.35)){
    pages.push(buffer);buffer=[];
  }
});
if(buffer.length)pages.push(buffer);

const Captions:React.FC<{style:Style}>=({style})=>{
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
  const page=pages.find((p,i)=>t>=p[0].start-.03&&t<Math.min(p[p.length-1].end+.25,pages[i+1]?.[0].start??Infinity));
  if(!page)return null;
  return <div style={{position:'absolute',bottom:40,left:140,right:140,display:'flex',justifyContent:'center'}}>
    <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',padding:'13px 27px',borderRadius:style==='svg'?18:3,
      background:style==='svg'?C.night:C.paper,border:`1px solid ${style==='svg'?C.nightLight:C.shadow}`,maxWidth:1480}}>
      {page.map((w,i)=>{const active=t>=w.start&&t<w.end;return <span key={i} style={{fontSize:32,fontWeight:700,lineHeight:1.4,
        color:active?(style==='svg'?C.yellow:C.greenDark):(style==='svg'?C.paper:C.brown),borderBottom:`3px solid ${active?C.yellow:'transparent'}`}}>{w.word}</span>;})}
    </div>
  </div>;
};

const Scene:React.FC<{index:number;style:Style}>=({index,style})=>{
  const frame=useCurrentFrame();const {fps}=useVideoConfig();const shot=SHOTS[index];
  const t=frame/fps;const length=(shot.to-shot.from)*fps;
  const enter=spring({frame,fps,config:C.spring});
  const exit=tween(frame,[length,length+.24*fps],[0,1]);
  const progress=tween(frame,[0,length],[0,1]);
  const textEnter=spring({frame:frame-.18*fps,fps,config:C.spring});
  return <AbsoluteFill style={{opacity:Math.min(1,enter)*(1-exit),transform:`translateX(${tween(enter,[0,1],[style==='svg'?45:90,0])-exit*38}px) scale(${tween(enter,[0,1],[1.015,1])})`}}>
    {style==='svg'?<SvgWorld action={shot.action} t={t} progress={progress}/>:<StoryWorld action={shot.action} t={t} progress={progress}/>}
    {style==='svg'?<div style={{position:'absolute',left:142,top:236,width:695,opacity:Math.min(1,textEnter),transform:`translateY(${tween(textEnter,[0,1],[24,0])}px)`}}>
      <div style={{fontSize:19,fontWeight:700,letterSpacing:3,color:C.green,marginBottom:31}}>{shot.note}</div>
      <div style={{fontSize:index===0?78:66,fontWeight:700,lineHeight:1.17,color:C.paper,letterSpacing:-1.6,whiteSpace:'pre-line'}}>{shot.title}</div>
      <div style={{marginTop:36,height:4,width:tween(progress,[0,.32],[0,124]),background:C.yellow}}/>
      <div style={{marginTop:29,fontSize:23,lineHeight:1.6,color:C.muted,maxWidth:535}}>{index===0?'Một đêm rất quen. Một cảm giác chưa biết gọi tên.':index===12?'Mầm xanh của bạn xứng đáng được nghỉ ngơi.':index===2||index===3?'Mỗi cảm xúc là một điểm dừng trong hành trình hiểu mình.':index>=10?'Không cần làm thật nhiều. Chỉ cần dịu dàng hơn một chút.':'Có lẽ bạn cũng từng thấy mình trong khoảnh khắc này.'}</div>
      {index===0&&<div style={{marginTop:48,fontSize:52,fontWeight:700,color:C.blue,fontVariantNumeric:'tabular-nums'}}>01:30<span style={{fontSize:18,letterSpacing:3,marginLeft:15}}>SÁNG</span></div>}
    </div>:<div style={{position:'absolute',left:166,top:197,maxWidth:index===0?550:580,opacity:Math.min(1,textEnter),transform:`translateY(${tween(textEnter,[0,1],[20,0])}px) rotate(-1.3deg)`}}>
      <div style={{background:C.paper,display:'inline-block',padding:'12px 20px 15px',borderBottom:`4px solid ${C.yellow}`,maxWidth:575}}>
        <div style={{fontSize:16,fontWeight:700,letterSpacing:2,color:C.honey,marginBottom:13}}>{shot.note}</div>
        <div style={{fontSize:39,lineHeight:1.23,fontWeight:700,color:C.brown,whiteSpace:'pre-line',fontStyle:'italic'}}>{shot.title}</div>
      </div>
    </div>}
    {style==='story'&&<div style={{position:'absolute',right:154,bottom:145,color:C.brown,fontSize:18,fontStyle:'italic',opacity:.7}}>Một đêm của Mochi · {String(index+1).padStart(2,'0')}</div>}
  </AbsoluteFill>;
};

export const MochiLocalFilm:React.FC<{style:Style}>=({style})=>{
  const frame=useCurrentFrame();const {fps}=useVideoConfig();
  const [fontHandle]=useState(()=>delayRender('Load local Vietnamese fonts'));
  useEffect(()=>{Promise.all([document.fonts.load('700 32px MochiLocal'),document.fonts.load('400 32px MochiLocal')]).then(()=>continueRender(fontHandle)).catch(()=>continueRender(fontHandle));},[fontHandle]);
  return <AbsoluteFill style={{fontFamily:C.font,background:style==='svg'?C.night:C.cream,overflow:'hidden'}}>
    <style>{`@font-face{font-family:MochiLocal;src:url('${staticFile(`${ASSET_ROOT}/regular.ttf`)}')}@font-face{font-family:MochiLocal;src:url('${staticFile(`${ASSET_ROOT}/bold.ttf`)}');font-weight:700}`}</style>
    {SHOTS.map((s,i)=><Sequence key={i} from={Math.round(s.from*fps)} durationInFrames={Math.round((s.to-s.from)*fps)+Math.round(.3*fps)}><Scene index={i} style={style}/></Sequence>)}
    <AbsoluteFill style={{pointerEvents:'none',background:style==='svg'?`linear-gradient(120deg,${C.night}18,transparent 58%,${C.yellow}06)`:`linear-gradient(115deg,${C.paper}09,transparent,${C.honey}08)`}}/>
    <AbsoluteFill style={{pointerEvents:'none',opacity:style==='svg'?.035:.095,backgroundImage:`url('${staticFile(`${ASSET_ROOT}/grain-${style}.png`)}')`,backgroundSize:'256px',mixBlendMode:style==='svg'?'screen':'multiply'}}/>
    <AbsoluteFill style={{pointerEvents:'none',background:style==='svg'?'radial-gradient(ellipse at 56% 45%,transparent 48%,rgba(3,8,16,.35))':'radial-gradient(ellipse at center,transparent 56%,rgba(84,65,38,.09))'}}/>
    <div style={{position:'absolute',left:style==='svg'?142:135,top:49,color:style==='svg'?C.muted:C.brown,fontSize:19,fontWeight:700,letterSpacing:3}}>BÉ MOCHI MẦM XANH</div>
    <div style={{position:'absolute',right:135,top:49,color:style==='svg'?C.muted:C.honey,fontSize:17,fontWeight:700,letterSpacing:1.8}}>{style==='svg'?'01 · HOẠT HÌNH SVG':'02 · TRUYỆN TRANH CHUYỂN ĐỘNG'}</div>
    <Captions style={style}/>
    <div style={{position:'absolute',bottom:0,left:0,height:3,width:`${100*frame/(DEMO_SECONDS*fps)}%`,background:C.green}}/>
    <Audio src={staticFile(`${ASSET_ROOT}/master.wav`)}/>
  </AbsoluteFill>;
};
export const MochiSvgLocalDemo=()=> <MochiLocalFilm style="svg"/>;
export const MochiStoryLocalDemo=()=> <MochiLocalFilm style="story"/>;
export const MochiLocalDemoRoot=()=> <>
  <Composition id="MochiSvgLocalDemo" component={MochiSvgLocalDemo} durationInFrames={DEMO_SECONDS*30} fps={30} width={1920} height={1080}/>
  <Composition id="MochiStoryLocalDemo" component={MochiStoryLocalDemo} durationInFrames={DEMO_SECONDS*30} fps={30} width={1920} height={1080}/>
</>;
