import React from 'react';
import {useVideoConfig} from 'remotion';
import {Actor,Scribble} from './Actor';
import {T,enter,ease,beatAt,beats} from './theme';
import {FlatWalkScene} from './WalkScenes';
import {isWalkShot} from './walk-motion';

const InkLine:React.FC<{d:string;width?:number;color?:string}>=({d,width=3,color=T.ink})=><path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"/>;
const Bubble:React.FC<{t:number;at:number;x:number;y:number;children:React.ReactNode;width?:number;blue?:boolean}>=({t,at,x,y,children,width=580,blue=false})=>{
 const {fps}=useVideoConfig(),p=enter(t,at,fps);
 return <div style={{position:'absolute',left:x,top:y,width,padding:'28px 36px',border:`2px solid ${blue?T.blue:T.ink}`,borderRadius:'24px 24px 24px 4px',background:blue?T.blueLight:T.cream,boxShadow:`8px 9px 0 ${T.line}66`,opacity:p,transform:`translateY(${24*(1-p)}px) scale(${.94+.06*p}) rotate(${(1-p)*-3}deg)`,fontSize:36,lineHeight:1.4}}>{children}</div>;
};
const Header:React.FC<{small:string;title:React.ReactNode}>=({small,title})=><div style={{position:'absolute',left:124,top:135,maxWidth:1400}}><div style={{fontSize:21,letterSpacing:5,color:T.muted,marginBottom:16}}>{small}</div><div style={{fontSize:65,lineHeight:1.13,fontWeight:700,letterSpacing:-2}}>{title}</div></div>;

export const FlatStage:React.FC<{t:number}>=({t})=>{
 const {fps}=useVideoConfig(),b=beatAt(t),local=t-beats[b];
 const p=enter(local,0,fps),exit=ease(t,beats[b+1]-.22,beats[b+1],0,1);
 const zoom=1+ease(local,0,beats[b+1]-beats[b],0,.018);
 const charStyle:React.CSSProperties={position:'absolute',width:555,height:750,left:b===0?170:b===4?205:120,top:250};
 return <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse at 72% 35%,${T.cream},${T.paper} 72%)`,color:T.ink}}>
  <svg width="1920" height="1080" style={{position:'absolute',opacity:.32}}><defs><pattern id="flat-grid" width="44" height="44" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill={T.muted}/></pattern></defs><rect width="1920" height="1080" fill="url(#flat-grid)"/><InkLine d="M88 94H1832M88 94V970" width={1} color={T.line}/></svg>
  {isWalkShot(t)?<FlatWalkScene t={t}/>:<div style={{position:'absolute',inset:0,opacity:1-exit,transform:`translateX(${exit*-35}px) translateY(${(1-p)*18}px) scale(${zoom})`,transformOrigin:'50% 50%'}}>
   {b===0&&<>
    <Header small="MỘT CHUYỆN RẤT NHỎ" title={<>Chỉ một tin nhắn.</>}/>
    <Actor mode="flat" t={t} style={charStyle}/>
    <svg style={{position:'absolute',left:96,top:775,width:700,height:175}} viewBox="0 0 700 175"><InkLine d="M0 4H150M580 5H700M50 7L38 170M620 5L635 170"/></svg>
    <Bubble t={t} at={2.35} x={870} y={360} blue><div style={{fontSize:21,color:T.blue,marginBottom:12,letterSpacing:2}}>TIN NHẮN TỪ SẾP</div>Chiều gặp anh chút nhé.</Bubble>
    <div style={{position:'absolute',left:980,top:580,fontSize:24,color:T.muted,opacity:enter(t,3.3,fps)}}>Đã nhận · 14:32</div>
   </>}
   {b===1&&<>
    <Header small="VÀ RỒI, TRONG ĐẦU…" title={<>Một câu. Ba nỗi lo.</>}/>
    <Actor mode="flat" t={t} style={{...charStyle,left:190,top:275}}/>
    <Scribble x={603} y={310} t={t} size={105}/>
    {['Mình làm sai gì rồi?','Hay sếp đang giận?','Mình sắp mất việc?'].map((line,i)=><Bubble key={line} t={t} at={5.95+i*1.38} x={890+i*65} y={320+i*168} width={580-i*15}>{line}</Bubble>)}
    <svg style={{position:'absolute',left:650,top:510,width:240,height:110}}><InkLine d="M0 85Q110 85 205 15M190 14L210 10 204 32" color={T.blue}/></svg>
   </>}
   {b===2&&<>
    <Header small="ĐIỀU TA BIẾT / ĐIỀU TA TƯỞNG" title={<>Vài chữ… thành cả bộ phim.</>}/>
    <Actor mode="flat" t={t} style={{...charStyle,left:115,top:300,width:490,height:660}}/>
    <div style={{position:'absolute',left:780,top:335,width:930,height:470,border:`3px solid ${T.ink}`,borderRadius:12,background:T.cream,transform:`rotate(${Math.sin(t*.4)*.7}deg)`,boxShadow:`14px 15px 0 ${T.line}`}}>
     <div style={{height:44,borderBottom:`2px solid ${T.ink}`,background:T.ink,display:'flex',justifyContent:'space-around',alignItems:'center'}}>{Array.from({length:15},(_,i)=><div key={i} style={{width:24,height:17,background:T.paper,borderRadius:2}}/>)}</div>
     <div style={{padding:'28px 40px',fontSize:25,color:T.muted}}>TRÍ TƯỞNG TƯỢNG ĐANG PHÁT</div>
     {['Bị trách?','Bị ghét?','Bị cho nghỉ?'].map((s,i)=>{const a=enter(t,11.3+i*1.45,fps);return <div key={s} style={{position:'absolute',left:55+i*265,top:155+i%2*30,width:230,height:160,border:`2px solid ${T.ink}`,borderRadius:4,background:i===1?T.blueLight:T.paper,transform:`translateY(${(1-a)*35}px) rotate(${[-5,3,-2][i]}deg)`,opacity:a,padding:22,fontSize:29,fontWeight:700}}><div style={{fontSize:45,marginBottom:14}}>?</div>{s}</div>;})}
     <div style={{position:'absolute',bottom:30,left:45,fontSize:29,color:T.blue,opacity:enter(t,15.3,fps)}}>Thiếu thông tin → tự điền bằng nỗi lo.</div>
    </div>
    {t>17&&<Scribble x={563} y={450} size={135} t={t}/>}
   </>}
   {b===3&&<>
    <Header small="TẠM DỪNG BỘ PHIM" title={<>Thở chậm một nhịp.</>}/>
    <div style={{position:'absolute',left:700,top:360,width:330,height:330,border:`2px solid ${T.blue}`,borderRadius:'50%',transform:`scale(${1+.12*Math.sin((t-20)*1.15)})`,opacity:.28}}/>
    <Actor mode="flat" t={t} style={{position:'absolute',left:600,top:200,width:640,height:864}}/>
    <div style={{position:'absolute',left:1380,top:490,fontSize:30,lineHeight:1.7,color:T.blue}}>Hít vào.<br/>Thở ra.</div>
   </>}
   {b===4&&<>
    <Header small="THAY VÌ ĐOÁN" title={<>Mình có thể hỏi rõ.</>}/>
    <Actor mode="flat" t={t} style={charStyle}/>
    <Bubble t={t} at={23.5} x={880} y={350} width={660} blue>Dạ, em cần chuẩn bị<br/>gì không ạ?</Bubble>
    <div style={{position:'absolute',left:1360,top:575,color:T.blue,fontSize:24,opacity:enter(t,25.4,fps)}}>Đã gửi ✓</div>
    <div style={{position:'absolute',left:920,top:650,display:'flex',gap:12,opacity:enter(t,26.4,fps)}}>{[0,1,2].map(i=><div key={i} style={{width:13,height:13,borderRadius:'50%',background:T.muted,transform:`translateY(${-5*Math.sin(t*5-i)}px)`}}/>)}</div>
   </>}
   {b===5&&<>
    <Header small="THỰC TẾ ĐƠN GIẢN HƠN" title={<>À. Chỉ là một lời khen.</>}/>
    <Actor mode="flat" t={t} style={{...charStyle,top:280}}/>
    <Bubble t={t} at={28.6} x={850} y={355} width={720} blue>Không có gì đâu,<br/>anh muốn khen bản thiết kế của em.</Bubble>
    <svg width="210" height="160" style={{position:'absolute',left:570,top:300,transform:`scale(${enter(t,29,fps)})`}}><InkLine d="M30 90L5 70M64 45L57 12M101 49L121 23" color={T.blue} width={5}/></svg>
   </>}
   {b>=6&&<>
    <div style={{position:'absolute',left:130,top:270,width:1000}}><div style={{fontSize:22,color:T.muted,letterSpacing:4,marginBottom:28}}>MỆT VÌ MỘT CHUYỆN CHƯA XẢY RA</div><div style={{fontSize:76,fontWeight:700,lineHeight:1.18,letterSpacing:-2}}>Đừng để nỗi lo<br/><span style={{color:T.blue}}>viết tiếp tin nhắn.</span></div><div style={{fontSize:31,marginTop:40,lineHeight:1.6,color:T.muted,opacity:enter(t,35.1,fps)}}>Chưa biết thì hỏi.<br/>Chưa xảy ra thì đừng tự kết luận.</div><svg width="820" height="38"><InkLine d="M0 26Q320 8 785 22" color={T.blue} width={5}/></svg></div>
    <Actor mode="flat" t={t} style={{position:'absolute',left:1190,top:220,width:555,height:750}}/>
    <svg width="520" height="70" style={{position:'absolute',left:1150,top:870}}><InkLine d="M8 12Q230 1 505 15" color={T.muted}/></svg>
   </>}
  </div>}
 </div>;
};
