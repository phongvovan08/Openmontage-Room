import React from 'react';
import {useVideoConfig} from 'remotion';
import {Actor,Scribble} from './Actor';
import {T,ease,enter,beatAt,beats} from './theme';
import {WalkingActor} from './WalkingActor';
import {isWalkShot} from './walk-motion';

const Plane:React.FC<{x?:number;y?:number;z?:number;width?:number;height?:number;rotate?:string;children:React.ReactNode;style?:React.CSSProperties}>=({x=0,y=0,z=0,width=1920,height=1080,rotate='',children,style})=><div style={{position:'absolute',left:x,top:y,width,height,transform:`translateZ(${z}px) ${rotate}`,transformStyle:'preserve-3d',...style}}>{children}</div>;
const Plant:React.FC<{t:number}>=({t})=><svg width="260" height="400" viewBox="0 0 260 400"><path d="M120 310Q150 190 102 60M125 290Q65 150 50 105M127 290Q180 190 214 130" fill="none" stroke={T.green} strokeWidth="6"/>{[[95,100,-35],[56,152,-58],[143,155,42],[181,210,64],[100,230,-55],[211,140,25]].map(([x,y,r],i)=><ellipse key={i} cx={x} cy={y} rx="25" ry="61" fill={i%2?T.green:T.night} transform={`rotate(${r+Math.sin(t*.7+i)*2} ${x} ${y})`}/>)}<path d="M73 299H184L163 397H95Z" fill={T.clay}/><path d="M73 299H184V315H73Z" fill={T.peach}/></svg>;
const Chat:React.FC<{t:number;at:number;children:React.ReactNode;warm?:boolean}>=({t,at,children,warm=false})=>{
 const {fps}=useVideoConfig(),p=enter(t,at,fps);
 return <div style={{width:550,boxSizing:'border-box',padding:'27px 32px',border:`1px solid ${T.cream}99`,background:warm?T.cream:T.blueLight,borderRadius:24,boxShadow:`0 18px 42px ${T.night}22`,color:T.ink,fontSize:32,lineHeight:1.45,opacity:p,transform:`translateY(${(1-p)*35}px) scale(${.94+.06*p})`}}>{children}</div>;
};
export const DepthStage:React.FC<{t:number}>=({t})=>{
 const {fps}=useVideoConfig(),b=beatAt(t),s=t-beats[b],settled=b>=5;
 const cameraYaw=ease(s,0,beats[b+1]-beats[b],b%2?-4:4,b%2?3:-3);
 const close=b===1||b===3;
 const cameraScale=close?1.07:b===2?1.03:b>=6?.95:1;
 const last=b>=6;
 const walking=isWalkShot(t);
 const nearExit=ease(t,beats[b+1]-.2,beats[b+1]);
 return <div style={{position:'absolute',inset:0,perspective:1900,background:`radial-gradient(ellipse at 35% 25%,${T.peach},${T.night})`,overflow:'hidden'}}>
  <div style={{position:'absolute',inset:0,transformStyle:'preserve-3d',transform:`scale(${cameraScale+ease(s,0,8,0,.025)}) rotateY(${cameraYaw}deg) rotateX(${Math.sin(t*.16)*.65}deg)`}}>
   <Plane z={-370} x={-300} y={-160} width={2520} height={1440} style={{background:`linear-gradient(115deg,${settled?T.peach:T.glass},${T.paper} 72%)`}}>
    <svg width="2520" height="1440"><path d="M0 1060H2520M1840 0V1060M0 65H1840" stroke={T.night} strokeWidth="3" opacity=".2" fill="none"/>{Array.from({length:13},(_,i)=><path key={i} d={`M${180+i*140} 0V1060`} stroke={T.cream} strokeWidth="1" opacity=".18"/>)}</svg>
   </Plane>
   <Plane x={100} y={135} z={-280} width={665} height={565} style={{border:`18px solid ${T.cream}`,boxShadow:`0 15px 0 ${T.night}18`,background:`linear-gradient(${settled?T.peach:T.night},${settled?T.gold:T.glass})`}}>
    <svg width="629" height="529"><circle cx={470-ease(t,0,40,0,40)} cy="118" r="58" fill={T.cream} opacity=".76"/>{Array.from({length:8},(_,i)=><g key={i}><rect x={i*95-15} y={290-i%3*45} width={80} height={250} fill={i%2?T.night:T.blue} opacity={.35+i%3*.1}/>{Array.from({length:4},(_,j)=><rect key={j} x={i*95+5} y={330-i%3*45+j*45} width="15" height="19" fill={T.gold} opacity=".5"/>)}</g>)}<path d="M315 0V529M0 266H629" stroke={T.cream} strokeWidth="12"/></svg>
   </Plane>
   <Plane x={1390} y={180} z={-220} width={350} height={360}>
    <svg width="350" height="360"><rect x="0" y="0" width="350" height="18" rx="5" fill={T.clay}/><rect x="0" y="160" width="350" height="18" rx="5" fill={T.clay}/>{[0,1,2,3,4].map(i=><g key={i} transform={`translate(${30+i*51},${i%2?42:30}) rotate(${i===4?12:0})`}><rect width="33" height="116" rx="3" fill={[T.blue,T.cream,T.clay,T.green,T.gold][i]}/><path d="M4 22H28" stroke={T.paper} strokeWidth="3"/></g>)}<rect x="58" y="204" width="165" height="105" fill={T.paper} stroke={T.clay} strokeWidth="10"/><path d="M80 289L123 245 154 269 195 225" stroke={T.green} strokeWidth="4" fill="none"/></svg>
   </Plane>
   <Plane x={-350} y={795} z={-200} width={2600} height={1000} rotate="rotateX(64deg)" style={{transformOrigin:'50% 0%',background:`repeating-linear-gradient(90deg,${T.floor},${T.floor} 139px,${T.clay}55 140px,${T.floor} 143px)`,borderTop:`5px solid ${T.clay}`}}><div/></Plane>
   {!walking&&<>
    <Plane x={925} y={410} z={-20} width={475} height={430} style={{background:T.blue,borderRadius:'85px 85px 30px 30px',boxShadow:`16px 15px 0 ${T.night}33`}}><div style={{position:'absolute',left:40,right:40,bottom:35,height:20,borderRadius:10,background:T.night,opacity:.3}}/></Plane>
    <Plane x={850} y={150} z={90} width={550} height={742} rotate={`rotateZ(${b===3?Math.sin(s)*.6:Math.sin(t*.7)*.25}deg)`}>
     <Actor mode="depth" t={t} style={{width:'100%',height:'100%'}}/>
     {(b===1||b===2)&&<Scribble x={370} y={75} size={100} t={t} color={T.clay}/>}
    </Plane>
    <Plane x={560} y={760} z={210} width={1060} height={170}>
     <div style={{position:'absolute',inset:'0 0 auto',height:28,borderRadius:8,background:T.floor,boxShadow:`0 12px 0 ${T.clay}`}}/>
     <div style={{position:'absolute',left:60,top:37,width:22,height:250,background:T.night,transform:'rotate(4deg)'}}/><div style={{position:'absolute',right:60,top:37,width:22,height:250,background:T.night,transform:'rotate(-4deg)'}}/>
     <div style={{position:'absolute',left:580,top:-132,width:175,height:125,border:`3px solid ${T.night}`,borderRadius:8,background:T.glass,transform:'skewY(-3deg)'}}><div style={{position:'absolute',left:72,top:45,width:24,height:24,border:`2px solid ${T.cream}`,borderRadius:'50%'}}/></div>
     <div style={{position:'absolute',left:565,top:-8,width:210,height:11,background:T.night,borderRadius:'2px 2px 10px 10px'}}/>
     <svg width="120" height="150" style={{position:'absolute',left:150,top:-140}}><path d="M24 54H78V123Q48 141 24 123Z" fill={T.cream}/><path d="M78 66C122 56 122 115 78 105" fill="none" stroke={T.cream} strokeWidth="10"/><path d={`M40 37Q${30+Math.sin(t)*7} 22 44 6M60 37Q${74+Math.cos(t)*7} 20 61 2`} fill="none" stroke={T.cream} strokeWidth="3" opacity=".6"/></svg>
    </Plane>
   </>}
   {walking&&<>
    <Plane x={1350} y={670} z={-140} width={500} height={280}>
     <div style={{position:'absolute',left:0,top:0,width:500,height:24,borderRadius:6,background:T.floor,boxShadow:`0 10px 0 ${T.clay}`}}/><div style={{position:'absolute',left:30,top:25,width:16,height:200,background:T.night}}/><div style={{position:'absolute',right:30,top:25,width:16,height:200,background:T.night}}/>
     <div style={{position:'absolute',left:120,top:-100,width:150,height:95,background:T.glass,border:`3px solid ${T.night}`,borderRadius:5}}/>
    </Plane>
    <Plane z={70}><WalkingActor mode="depth" t={t} floor={920}/></Plane>
   </>}
   <Plane x={70} y={650} z={390} width={260} height={400} rotate="rotateY(5deg)" style={{filter:'blur(.45px)'}}><Plant t={t}/></Plane>
   <Plane x={1710} y={-60} z={300} width={220} height={1080} style={{background:`repeating-linear-gradient(90deg,${T.paper}F0,${T.paper}F0 27px,${T.floor} 42px,${T.paper} 60px)`,boxShadow:`-15px 0 35px ${T.night}18`,transformOrigin:'100% 0'}}><div/></Plane>
   <Plane x={close?355:300} y={305} z={200} width={650} height={520}>
    {b===0&&<Chat t={t} at={2.35}><div style={{fontSize:19,color:T.blue,letterSpacing:3,marginBottom:10}}>14:32 · MỘT TIN NHẮN</div>Chiều gặp anh chút nhé.</Chat>}
    {b===1&&<>{['Mình sai ở đâu?','Sếp đang giận?','Mất việc thì sao?'].map((line,i)=>{const p=enter(t,5.95+i*1.38,fps);return <div key={line} style={{marginBottom:22,padding:'17px 27px',background:T.cream,borderRadius:13,width:440+i*35,color:T.ink,fontSize:31,boxShadow:`0 10px 22px ${T.night}1F`,opacity:p,transform:`translateX(${(1-p)*-70}px) rotate(${[-3,2,-1][i]}deg)`}}>{line}</div>;})}</>}
    {b===2&&<div style={{width:580,height:385,background:T.cream,border:`1px solid ${T.floor}`,borderRadius:9,padding:35,transform:`rotate(${-3+Math.sin(t*.35)}deg)`,boxShadow:`14px 20px 0 ${T.night}22`}}><div style={{fontSize:18,color:T.clay,letterSpacing:4,marginBottom:22}}>BỘ PHIM TRONG ĐẦU</div>{['Một câu trách móc.','Một cuộc gặp đáng sợ.','Một kết thúc tồi tệ.'].map((s,i)=><div key={s} style={{fontSize:32,marginBottom:22,opacity:enter(t,10.8+i*1.45,fps),color:T.ink}}><span style={{color:T.clay,marginRight:20}}>0{i+1}</span>{s}</div>)}<div style={{fontSize:23,color:T.muted,marginTop:24,opacity:enter(t,15.3,fps)}}>Chưa có điều nào thực sự xảy ra.</div></div>}
    {b===3&&<div style={{width:360,height:360,marginLeft:100,border:`2px solid ${T.cream}`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:T.ink,fontSize:34,background:`${T.cream}88`,transform:`scale(${1+.07*Math.sin(s*1.3)})`}}>Thở chậm lại.</div>}
    {b===4&&<><Chat t={t} at={23.5} warm>Dạ, em cần chuẩn bị<br/>gì không ạ?</Chat><div style={{color:T.ink,fontSize:22,marginTop:20,marginLeft:455,opacity:enter(t,25.5,fps)}}>Đã gửi ✓</div>{t>26&&<div style={{display:'flex',gap:12,padding:24}}>{[0,1,2].map(i=><div key={i} style={{background:T.cream,width:12,height:12,borderRadius:9,transform:`translateY(${Math.sin(t*4-i)*5}px)`}}/>)}</div>}</>}
    {b===5&&<Chat t={t} at={28.6} warm>Không có gì đâu,<br/>anh muốn khen bản thiết kế của em.</Chat>}
    {last&&<div style={{color:T.ink,marginTop:-30,width:585,padding:30,boxSizing:'border-box',borderRadius:8,background:`${T.cream}F5`,boxShadow:`10px 15px 0 ${T.night}18`}}><div style={{fontSize:18,letterSpacing:2,color:T.night,marginBottom:24}}>MỌI THỨ NHẸ HƠN KHI HỎI RÕ</div><div style={{fontSize:59,fontWeight:700,lineHeight:1.18}}>Đôi khi,<br/>chỉ cần một<br/><span style={{color:T.clay}}>câu hỏi.</span></div><div style={{marginTop:24,fontSize:26,lineHeight:1.5,opacity:enter(t,35,fps)}}>Đừng sống trước<br/>một chuyện chưa xảy ra.</div></div>}
   </Plane>
  </div>
  {!last&&<div style={{position:'absolute',top:119,left:125,fontSize:46,fontWeight:700,color:T.ink,letterSpacing:-1,transform:`translateY(${(1-enter(s,0,fps))*15}px)`,opacity:enter(s,0,fps)*(1-nearExit)}}>{['Một tin nhắn. Cả buổi lo.','Khi nỗi lo lên tiếng.','Tự viết tiếp câu chuyện.','Dừng lại một chút.','Hỏi rõ, thay vì đoán.','Thực tế thật nhẹ nhàng.'][b]}</div>}
 </div>;
};
