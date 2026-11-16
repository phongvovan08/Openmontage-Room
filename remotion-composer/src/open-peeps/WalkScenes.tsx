import React from 'react';
import {useVideoConfig} from 'remotion';
import {WalkingActor} from './WalkingActor';
import {T,enter,beatAt,ease} from './theme';

export const FlatWalkScene:React.FC<{t:number}>=({t})=>{
 const b=beatAt(t),{fps}=useVideoConfig();
 return <div style={{position:'absolute',inset:0,color:T.ink}}>
  <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
   <path d="M83 927Q900 919 1838 927M147 925V333Q195 320 248 333V925" fill="none" stroke={T.ink} strokeWidth="3"/>
   <path d="M1440 340h310v340h-310zM1595 340v340M1440 510h310" fill={T.blueLight} stroke={T.ink} strokeWidth="3"/>
   <path d="M1452 681h292" stroke={T.ink} strokeWidth="7"/><circle cx="223" cy="626" r="6" fill={T.ink}/>
   <path d="M70 938Q550 946 900 939M1550 948H1840" fill="none" stroke={T.line} strokeWidth="3"/>
  </svg>
  <div style={{position:'absolute',left:124,top:135}}><div style={{fontSize:21,letterSpacing:5,color:T.muted,marginBottom:14}}>{b===0?'BẠN ĐÃ TỪNG NGHĨ NHIỀU NHƯ VẬY?':b===2?'ĐI QUA ĐI LẠI, NGHĨ MÃI KHÔNG RA':'MỘT CHUYỆN CHƯA TỪNG XẢY RA'}</div><div style={{fontSize:64,fontWeight:700,lineHeight:1.15}}>{b===0?'Một tin nhắn. Cả buổi lo.':b===2?'Trong đầu đã thành một bộ phim.':'Đừng để nỗi lo viết tiếp tin nhắn.'}</div></div>
  <WalkingActor mode="flat" t={t}/>
  {b===0&&<div style={{position:'absolute',left:890,top:355,width:640,padding:'30px 35px',background:T.cream,border:`3px solid ${T.blue}`,borderRadius:24,boxShadow:`12px 14px 0 ${T.line}88`,opacity:enter(t,2.35,fps),transform:`translateY(${(1-enter(t,2.35,fps))*30}px) scale(${.9+.1*enter(t,2.35,fps)})`}}><div style={{fontSize:21,color:T.blue,letterSpacing:3,marginBottom:15}}>TIN NHẮN TỪ SẾP</div><div style={{fontSize:40}}>Chiều gặp anh chút nhé.</div><div style={{fontSize:23,marginTop:20,color:T.muted}}>Một câu rất bình thường…</div></div>}
  {b===2&&<div style={{position:'absolute',left:930,top:350,width:770,height:410,background:T.cream,border:`3px solid ${T.ink}`,borderRadius:8,boxShadow:`16px 18px 0 ${T.line}`}}><div style={{height:40,background:T.ink,display:'flex',alignItems:'center',justifyContent:'space-around'}}>{Array.from({length:13},(_,i)=><div key={i} style={{width:23,height:16,borderRadius:2,background:T.paper}}/>)}</div><div style={{padding:32,fontSize:21,letterSpacing:3,color:T.muted}}>TRÍ TƯỞNG TƯỢNG ĐANG PHÁT</div>{['Mình sai?','Sếp giận?','Mất việc?'].map((s,i)=>{const p=enter(t,10.7+i*.75,fps);return <div key={i} style={{position:'absolute',left:34+i*240,top:140+(i%2)*25,width:212,height:130,padding:22,fontSize:28,fontWeight:700,background:i===1?T.blueLight:T.paper,border:`2px solid ${T.ink}`,transform:`rotate(${[-5,4,-2][i]}deg) translateY(${(1-p)*35}px)`,opacity:p}}><div style={{fontSize:37}}>?</div>{s}</div>;})}<div style={{position:'absolute',bottom:28,left:34,fontSize:26,color:T.blue,opacity:enter(t,15.3,fps)}}>Thiếu thông tin → tự điền bằng nỗi lo.</div></div>}
  {b>=6&&<div style={{position:'absolute',left:145,top:355,width:880,padding:'35px 40px',background:`${T.cream}F2`,borderLeft:`6px solid ${T.blue}`,fontSize:60,fontWeight:700,lineHeight:1.22}}>Chưa biết thì hỏi.<br/><span style={{color:T.blue}}>Chưa xảy ra,<br/>đừng tự kết luận.</span><div style={{fontSize:27,fontWeight:400,color:T.muted,marginTop:30,opacity:enter(t,35.1,fps)}}>Hỏi rõ một câu. Nhẹ đi cả buổi chiều.</div></div>}
 </div>;
};
