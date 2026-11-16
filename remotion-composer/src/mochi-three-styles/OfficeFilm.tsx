import React,{useLayoutEffect,useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Quaternion,Vector3} from 'three';
import {T as C,enter,lerp,moodAt,Mood,shotAt} from './theme';

const P={wall:'#D7DDCE',wood:'#B67C53',edge:'#664B41',floor:'#ADC0C0',metal:'#3D4E61',glass:'#83B5D5',screen:'#284D72',seat:'#647E81',coral:'#CC7A6C',light:'#FFE8B4',shadow:'#3C5678'};
type V=[number,number,number];
const Box:React.FC<{p:V;s:V;c:string;rotation?:V}>=({p,s,c,rotation})=><mesh position={p} rotation={rotation} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.78}/></mesh>;
const Ball:React.FC<{p:V;s?:V;c:string}>=({p,s=[1,1,1],c})=><mesh position={p} scale={s} castShadow><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color={c} roughness={.7}/></mesh>;
const Rod:React.FC<{a:V;b:V;r?:number;c?:string}>=({a,b,r=.06,c=C.ink})=>{
 const from=new Vector3(...a),to=new Vector3(...b),mid=from.clone().add(to).multiplyScalar(.5),length=from.distanceTo(to);
 const rotation=new Vector3(0,1,0);const quaternion=useMemo(()=>new Quaternion().setFromUnitVectors(rotation,to.clone().sub(from).normalize()),[...a,...b]);
 return <mesh position={mid} quaternion={quaternion} castShadow><cylinderGeometry args={[r,r,length,10]}/><meshStandardMaterial color={c} roughness={.8}/></mesh>;
};

const Plant:React.FC<{x:number;z:number;s?:number}>=({x,z,s=1})=><group position={[x,0,z]} scale={s}>
 <mesh position={[0,.35,0]} castShadow><cylinderGeometry args={[.41,.28,.7,20]}/><meshStandardMaterial color={P.coral}/></mesh>
 <Rod a={[0,.65,0]} b={[0,2.2,0]} r={.045} c={C.leaf}/>
 {[0,1,2,3,4].map(i=><group key={i} position={[0,1+i*.22,0]} rotation={[.3,i*2.4,.6]}><Ball p={[.3,.17,0]} s={[.48,.19,.15]} c={C.green}/></group>)}
</group>;

const Chair:React.FC<{x:number;z:number;rot?:number}>=({x,z,rot=0})=><group position={[x,0,z]} rotation={[0,rot,0]}>
 <Box p={[0,.88,0]} s={[1.15,.18,1.1]} c={P.seat}/><Box p={[0,1.43,-.48]} s={[1.15,1.1,.17]} c={P.seat}/>
 <Rod a={[0,.12,0]} b={[0,.82,0]} r={.095} c={P.metal}/>
 {[0,1,2,3,4].map(i=><Rod key={i} a={[0,.15,0]} b={[Math.cos(i*Math.PI*.4)*.58,.13,Math.sin(i*Math.PI*.4)*.58]} r={.045} c={P.metal}/>)}
</group>;

const Desk:React.FC<{x:number;z:number;rotate?:number}>=({x,z,rotate=0})=><group position={[x,0,z]} rotation={[0,rotate,0]}>
 <Box p={[0,1.6,0]} s={[3.25,.15,1.65]} c={P.wood}/>
 {[-1,1].map(side=><group key={side}><Box p={[side*1.36,.78,0]} s={[.11,1.55,1.35]} c={P.metal}/></group>)}
 <Box p={[-.3,2.13,-.37]} s={[1.34,.85,.1]} c={C.ink}/><Box p={[-.3,2.13,-.306]} s={[1.22,.71,.028]} c={P.screen}/>
 <Box p={[-.3,1.79,-.37]} s={[.09,.3,.1]} c={C.ink}/><Box p={[-.3,1.69,-.37]} s={[.58,.035,.35]} c={C.ink}/>
 <Box p={[-.3,1.7,.36]} s={[1.05,.045,.37]} c={P.wall}/><Box p={[1.12,1.705,.12]} s={[.39,.05,.49]} c={C.cream}/><Box p={[1.12,1.745,.12]} s={[.32,.035,.43]} c={C.white}/>
 <mesh position={[.75,1.85,-.49]} castShadow><cylinderGeometry args={[.13,.11,.35,16]}/><meshStandardMaterial color={P.coral}/></mesh>
 <Chair x={-.2} z={1.4}/>
</group>;

const Room:React.FC<{t:number}>=({t})=><group>
 <Box p={[0,-.12,0]} s={[14,.22,18]} c={P.floor}/>
 {Array.from({length:10},(_,i)=><Box key={`floor-${i}`} p={[0,.003,-8+i*1.8]} s={[14,.008,.015]} c={P.seat}/>)}
 {Array.from({length:8},(_,i)=><Box key={`strip-${i}`} p={[-7+i*2,.005,0]} s={[.012,.008,18]} c={P.seat}/>)}
 <Box p={[0,3,-7]} s={[14,6,.18]} c={P.wall}/><Box p={[-7,3,0]} s={[.18,6,14]} c={P.wall}/>
 <Box p={[0,.13,-6.86]} s={[14,.24,.06]} c={C.white}/>
 {[-4.3,-1.45,1.4].map((x,i)=><group key={x}>
   <Box p={[x,3.6,-6.85]} s={[2.55,3.1,.08]} c={C.white}/><Box p={[x,3.6,-6.79]} s={[2.29,2.85,.06]} c={P.glass}/>
   <Box p={[x,3.6,-6.7]} s={[.07,2.95,.1]} c={C.white}/><Box p={[x,3.5,-6.7]} s={[2.4,.07,.1]} c={C.white}/>
   {[0,1,2].map(j=><Box key={j} p={[x-.7+j*.64,2.5,-6.73]} s={[.4,.4+j*.34,.02]} c={C.blue}/>)}
 </group>)}
 <Box p={[4.8,2,-6.83]} s={[2.3,4,.15]} c={P.wood}/><Box p={[4.8,2.8,-6.71]} s={[1.7,1.73,.08]} c={P.glass}/><Ball p={[5.6,1.8,-6.58]} s={[.08,.08,.08]} c={C.yellow}/>
 <Box p={[-6.85,2.75,-.8]} s={[.06,1.7,2.5]} c={C.white}/><Box p={[-6.8,2.75,-.8]} s={[.045,1.45,2.24]} c={C.cream}/>
 <Desk x={-3.7} z={-3.7}/><Desk x={2.4} z={-3.7}/><Desk x={-4.0} z={2.3} rotate={.07}/><Desk x={3.7} z={3.0} rotate={-.1}/>
 <Plant x={-5.9} z={-5.8} s={1.25}/><Plant x={6.2} z={-5.7}/><Plant x={-6.1} z={4.6} s={1.1}/>
 <Box p={[5.8,.9,1.2]} s={[1.4,1.8,.9]} c={C.white}/>
 {[0,1,2].map(i=><><Box key={`shelf-${i}`} p={[5.8,.3+i*.56,1.71]} s={[1.1,.025,.03]} c={P.floor}/><Box key={`handle-${i}`} p={[5.8,.52+i*.5,1.73]} s={[.42,.035,.035]} c={P.metal}/></>)}
 {[0,1].map(i=><group key={i}><Rod a={[-2+i*6,5.7,-2]} b={[-2+i*6,4.75,-2]} r={.025} c={P.metal}/><mesh position={[-2+i*6,4.65,-2]}><cylinderGeometry args={[.3,.65,.37,24]}/><meshStandardMaterial color={P.metal}/></mesh><pointLight position={[-2+i*6,4.38,-2]} intensity={18} distance={8} color={P.light}/></group>)}
</group>;

const Mochi3D:React.FC<{t:number;x:number;z:number;mood:Mood;walk?:boolean;phone?:boolean}>=({t,x,z,mood,walk=false,phone=true})=>{
 const p=t*8.5,step=walk?Math.sin(p):0,worry=mood==='worry',happy=mood==='happy';
 const bob=walk?Math.abs(Math.cos(p))*.045:Math.sin(t*2)*.017;
 const lift=lerp(t,1.3,2.1,0,1);
 const shoulderR:V=[.65,1.4,.08],elbowR:V=[.99,1.02,.17],wristR:V=phone?[.86,1.02+.62*lift,.17+.53*lift]:[1.03,happy?1.88:1.0,.13];
 return <group position={[x,0,z]} rotation={[0,walk?.36:lerp(t,2,2.4,.36,0),0]}>
   {[-1,1].map(side=>{const sx=side*.33,sz=step*side*.25,up=walk?Math.max(0,side*Math.cos(p))*.16:0;return <group key={side}>
     <Rod a={[sx,.57,.02]} b={[sx,.27,sz*.5]} r={.1} c={C.white}/><Rod a={[sx,.27,sz*.5]} b={[sx,.11+up,sz]} r={.09} c={C.white}/><Ball p={[sx,.12+up,sz+.07]} s={[.21,.12,.3]} c={C.white}/>
   </group>;})}
   <group position={[0,bob+(worry?-.06:0),0]} rotation={[0,0,worry?.045:0]}>
     <Ball p={[0,1.4,0]} s={[.78,1.0,.59]} c={C.white}/>
     <Ball p={[0,.83,.02]} s={[.83,.45,.61]} c={C.white}/>
     <mesh position={[0,1.23,0]} rotation={[Math.PI/2,0,0]} scale={[1,.82,1]} castShadow><torusGeometry args={[.72,.115,10,32]}/><meshStandardMaterial color={C.yellow}/></mesh>
     <Box p={[.39,.94,.55]} s={[.27,.51,.11]} c={C.yellow} rotation={[0,0,-.15+Math.sin(t*2)*.04]}/>
     {[-1,1].map(side=><group key={side}>
       <Ball p={[side*.27,1.78,.546]} s={[.047,mood==='breathe'||Math.sin(t*1.31)>.992?.019:.074,.027]} c={C.ink}/>
       <Ball p={[side*.46,1.58,.49]} s={[.12,.055,.025]} c={C.pink}/>
       {worry&&<Rod a={[side*.27-.1,2.0+side*.03,.51]} b={[side*.27+.1,2.0-side*.03,.51]} r={.018} c={C.ink}/>}
     </group>)}
     {happy?<><Rod a={[-.1,1.46,.591]} b={[0,1.40,.609]} r={.017}/><Rod a={[0,1.40,.609]} b={[.1,1.46,.591]} r={.017}/></>:worry?<><Rod a={[-.075,1.43,.596]} b={[0,1.47,.606]} r={.017}/><Rod a={[0,1.47,.606]} b={[.075,1.43,.596]} r={.017}/></>:<Rod a={[-.065,1.46,.601]} b={[.065,1.46,.601]} r={.017}/>}
     <group position={[0,2.34,0]} rotation={[0,0,worry?-.6:Math.sin(t*2)*.08]}>
       <Rod a={[0,0,0]} b={[0,.49,0]} r={.032} c={C.leaf}/>
       <group rotation={[0,.2,.6]}><Ball p={[-.22,.25,0]} s={[.26,.12,.11]} c={C.green}/></group><group rotation={[0,-.2,-.6]}><Ball p={[.22,.25,0]} s={[.26,.12,.11]} c={C.green}/></group>
       {happy&&<group position={[0,.53,0]}>{[0,1,2,3,4].map(i=><Ball key={i} p={[Math.sin(i*Math.PI*.4)*.13,Math.cos(i*Math.PI*.4)*.13,0]} s={[.105,.105,.055]} c={C.yellow}/>)}<Ball p={[0,0,.05]} s={[.07,.07,.05]} c={C.cream}/></group>}
     </group>
     <Rod a={[-.65,1.43,0]} b={[-.95,1.08,step*.2]} r={.095} c={C.white}/><Rod a={[-.95,1.08,step*.2]} b={[-1.01,happy?1.77:.83,step*.3+.16]} r={.09} c={C.white}/>
     <Rod a={shoulderR} b={elbowR} r={.095} c={C.white}/><Rod a={elbowR} b={wristR} r={.09} c={C.white}/><Ball p={wristR} s={[.12,.13,.12]} c={C.white}/>
     {phone&&<group position={[wristR[0],wristR[1]+.21,wristR[2]+.03]} rotation={[0,-.2,-.16]}><Box p={[0,0,0]} s={[.36,.61,.065]} c={C.ink}/><Box p={[0,0,.041]} s={[.3,.48,.013]} c={C.sky}/><Box p={[0,.11,.05]} s={[.24,.09,.01]} c={C.white}/><Box p={[.02,-.03,.05]} s={[.2,.09,.01]} c={C.green}/></group>}
   </group>
 </group>;
};

const Camera:React.FC<{t:number;shot:number;x:number}>=({t,shot,x})=>{
 const {camera}=useThree();
 useLayoutEffect(()=>{
   let pos:V=[5.8,4.5,10.7],target:V=[x,1.25,.0];
   if(shot===0)pos=[lerp(t,0,2.4,6.2,4.5),lerp(t,0,2.4,4.0,3.2),lerp(t,0,2.4,8.4,6.6)];
   if(shot===1||shot===7)pos=[2.8,2.8,5.4];
   if(shot===2)pos=[lerp(t,5.7,10.4,2.9,1.5),2.6,lerp(t,5.7,10.4,5.7,4.8)];
   if(shot===3||shot===4){pos=[Math.sin((t-10.4)*.22)*4.4,3.5,6.4];target=[x,1.8,0];}
   if(shot===5){pos=[-2.1,2.35,4.7];target=[x,1.58,0];}
   if(shot===6){pos=[2.7,2.7,4.5];target=[x,1.50,.1];}
   if(shot===8){pos=[lerp(t,32.3,37.4,-3.5,1.7),3.1,lerp(t,32.3,37.4,5.4,8.8)];target=[x,1.4,0];}
   if(shot===9){pos=[-2.1,2.4,5.3];target=[0,1.1,0];}
   camera.position.set(...pos);camera.lookAt(...target);camera.updateProjectionMatrix();
 },[camera,t,shot,x]);
 return null;
};

const OfficeScene:React.FC<{t:number}>=({t})=>{
 const shot=shotAt(t),x=shot===0?lerp(t,0,2.1,-1.6,0):shot===8?lerp(t,34.3,37.4,0,.8):0;
 const anxious=shot>=2&&shot<=4;
 return <>
   <color attach="background" args={[P.shadow]}/><fog attach="fog" args={[P.shadow,14,36]}/>
   <ambientLight intensity={anxious?.65:1.3} color={anxious?C.blue:C.white}/><hemisphereLight args={[C.sky,P.wood,1.2]}/>
   <directionalLight position={[-3,7,6]} intensity={anxious?2.1:3.3} color={anxious?C.blue:P.light} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-.001}/>
   <pointLight position={[4,3,0]} intensity={anxious?13:6} distance={12} color={anxious?C.violet:C.green}/>
   <Camera t={t} shot={shot} x={x}/><Room t={t}/>
   <Mochi3D t={t} x={x} z={0} mood={moodAt(t)} walk={shot===0||shot===8&&t>34.3} phone={shot!==9}/>
   {anxious&&<group position={[x,3.36,0]}>
     <Ball p={[0,0,0]} s={[.72,.28,.3]} c={P.shadow}/><Ball p={[-.4,.08,0]} s={[.35,.25,.26]} c={P.shadow}/><Ball p={[.24,.15,0]} s={[.4,.31,.3]} c={P.shadow}/>
     {[0,1,2,3,4,5].map(i=><Rod key={i} a={[-.6+i*.23,-.37-((t*.7+i*.17)% .6),.1]} b={[-.62+i*.23,-.5-((t*.7+i*.17)%.6),.1]} r={.012} c={C.sky}/>)}
   </group>}
   {shot>=8&&Array.from({length:18},(_,i)=><Ball key={i} p={[-2+(i*1.39)%4,1.0+(i*.73)%3+Math.sin(t+i)*.05,-1+(i*.93)%3]} s={[.018,.018,.018]} c={C.yellow}/>)}
 </>;
};

const GlassPhone:React.FC<{t:number;reply?:boolean;fps:number}>=({t,reply=false,fps})=>{
 const e=enter(t,reply?27.8:2.4,fps);
 return <div style={{position:'absolute',left:240,top:395,width:600,height:1040,transform:`translateY(${(1-e)*150}px) perspective(1800px) rotateY(${reply?-9:10}deg) rotateZ(${reply?2:-4}deg) scale(${.92+.08*e})`,borderRadius:75,background:C.ink,padding:17,boxShadow:'20px 30px 75px #09162D99'}}>
   <div style={{position:'absolute',inset:17,borderRadius:59,background:`linear-gradient(150deg,${C.sky},${C.white})`,overflow:'hidden',padding:'88px 34px 24px'}}>
     <div style={{position:'absolute',top:13,left:207,width:152,height:30,borderRadius:20,background:C.ink}}/>
     <div style={{display:'flex',alignItems:'center',gap:19,marginBottom:45}}><div style={{width:66,height:66,borderRadius:40,background:P.seat,color:C.white,fontSize:40,textAlign:'center',lineHeight:'66px'}}>A</div><div style={{fontSize:35,fontWeight:700,color:C.ink}}>Anh quản lý<div style={{fontSize:22,fontWeight:400,color:P.seat,marginTop:4}}>Đang hoạt động</div></div></div>
     <div style={{fontSize:35,lineHeight:1.4,color:C.ink,background:C.white,padding:'24px 29px',borderRadius:'30px 30px 30px 6px',boxShadow:'0 8px 25px #33425713'}}>Chiều gặp anh<br/>chút nhé.</div>
     {reply&&<><div style={{fontSize:33,lineHeight:1.4,color:C.ink,background:C.green,padding:'24px',borderRadius:'30px 30px 6px 30px',marginTop:24,marginLeft:50}}>Dạ, em cần chuẩn bị<br/>gì không ạ?</div><div style={{opacity:Math.min(1,enter(t,28.1,fps)),transform:`translateY(${(1-enter(t,28.1,fps))*40}px)`,fontSize:34,lineHeight:1.4,color:C.ink,background:C.white,padding:'25px',borderRadius:'30px 30px 30px 6px',marginTop:28}}>Không có gì đâu.<br/>Anh muốn khen bản<br/>thiết kế của em.</div></>}
     <div style={{position:'absolute',bottom:28,left:50,right:50,height:60,border:`2px solid ${C.muted}`,borderRadius:35,fontSize:24,color:P.seat,padding:'12px 23px'}}>Nhắn tin…<span style={{float:'right'}}>＋</span></div>
   </div>
   <div style={{position:'absolute',inset:17,borderRadius:59,background:'linear-gradient(125deg,transparent 45%,#FFFFFF22 46%,transparent 72%)',pointerEvents:'none'}}/>
 </div>;
};

export const OfficeFilm:React.FC<{t:number;fps:number}>=({t,fps})=>{
 const shot=shotAt(t),phone=shot===1||shot===7;
 return <>
   <div style={{position:'absolute',inset:0,filter:phone?'blur(8px)':undefined}}>
     <ThreeCanvas width={1080} height={1920} dpr={1} shadows camera={{fov:45,near:.1,far:70}} gl={{antialias:true,preserveDrawingBuffer:true}}><OfficeScene t={t}/></ThreeCanvas>
   </div>
   {phone&&<><div style={{position:'absolute',inset:0,background:'#14243F42'}}/><GlassPhone t={t} reply={shot===7} fps={fps}/></>}
   {shot===2&&['Mình làm sai?','Sếp đang giận?','Mất việc sao?'].map((text,i)=>t>=5.7+i*1.6&&<div key={i} style={{position:'absolute',top:[340,475,610][i],left:[90,570,90][i],fontSize:36,fontWeight:700,background:'#F8FAF4ED',color:C.ink,padding:'22px 29px',borderRadius:30,boxShadow:'0 15px 40px #101A3533',opacity:Math.min(1,enter(t,5.7+i*1.6,fps)),transform:`translateY(${(1-enter(t,5.7+i*1.6,fps))*55}px) rotate(${i%2?4:-4}deg)`}}>{text}</div>)}
   {(shot===3||shot===4)&&<div style={{position:'absolute',top:380,left:55,right:55}}>
     <div style={{textAlign:'center',fontSize:37,fontWeight:700,color:C.white,marginBottom:32,textShadow:'0 3px 12px #152140'}}>{shot===3?'Trong đầu: ba kịch bản xấu':'Một tin nhắn • nhiều suy diễn'}</div>
     <div style={{display:'flex',gap:18}}>{['SAI SÓT','BỊ MẮNG','MẤT VIỆC'].map((x,i)=><div key={x} style={{flex:1,padding:'28px 10px',background:'#152541D9',border:`2px solid ${i===1?C.yellow:C.muted}`,borderRadius:24,transform:`translateY(${Math.sin(t*1.8+i)*9}px)`,color:C.white,textAlign:'center',fontSize:27,fontWeight:700}}><div style={{fontSize:67,color:i===1?C.yellow:C.pink,lineHeight:1.4}}>?</div>{x}</div>)}</div>
     {shot===4&&<div style={{textAlign:'center',fontSize:33,color:C.yellow,marginTop:36}}>Điều chưa biết được lấp bằng nỗi lo</div>}
   </div>}
   {shot===5&&<div style={{position:'absolute',top:500,left:0,right:0,textAlign:'center',color:C.white,fontSize:42,fontWeight:700,textShadow:'0 4px 18px #152541'}}>{t<21.7?'Hít vào…':'Thở ra…'}</div>}
   {shot===6&&<div style={{position:'absolute',top:420,left:100,right:100,background:'#F9FFF1F5',borderRadius:32,padding:'28px 35px',fontSize:42,lineHeight:1.4,color:C.ink,transform:`translateY(${(1-enter(t,23.3,fps))*65}px)`,opacity:Math.min(1,enter(t,23.3,fps)),boxShadow:'0 16px 40px #101A3544'}}>“Dạ, em cần chuẩn bị<br/>gì không ạ?”{t>25.4&&<div style={{fontSize:24,color:P.seat,marginTop:14,textAlign:'right'}}>Đã gửi ✓</div>}</div>}
   {shot===9&&<div style={{position:'absolute',top:465,left:80,right:80,textAlign:'center',fontSize:45,lineHeight:1.45,color:C.white,fontWeight:700,textShadow:'0 4px 20px #152541'}}>Hỏi rõ điều chưa biết.<br/><span style={{color:C.yellow}}>Cho mình một khoảng thở.</span></div>}
 </>;
};
