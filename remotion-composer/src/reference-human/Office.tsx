import React,{useLayoutEffect,useMemo,useRef} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {BoxGeometry,CanvasTexture,DoubleSide,Group,Quaternion,SRGBColorSpace,Vector3} from 'three';
import {H as C,Emotion,emotionAt,lerp,pop,shotAt} from './theme';

const P={ink:'#262437',floor:'#2346CB',wall:'#88B793',wallDark:'#598F79',paper:'#F5F3D7',blue:'#70B7DB',orange:'#E59152',desk:'#C9AD88',metal:'#252D43',chair:'#6A6B7F',door:'#8CB9D1',yellow:'#FFCF55'};
type V=[number,number,number];
const cube=new BoxGeometry(1,1,1);
const Box:React.FC<{p:V;s:V;c:string;rotation?:V;outline?:boolean}>=({p,s,c,rotation,outline=true})=><group position={p} scale={s} rotation={rotation}>
 <mesh geometry={cube} castShadow receiveShadow><meshStandardMaterial color={c} roughness={.92}/></mesh>
 {outline&&<lineSegments><edgesGeometry args={[cube]}/><lineBasicMaterial color={P.ink}/></lineSegments>}
</group>;
const Rod:React.FC<{a:V;b:V;r?:number;c?:string}>=({a,b,r=.035,c=P.ink})=>{
 const va=new Vector3(...a),vb=new Vector3(...b),center=va.clone().add(vb).multiplyScalar(.5),length=va.distanceTo(vb);
 const q=useMemo(()=>new Quaternion().setFromUnitVectors(new Vector3(0,1,0),vb.clone().sub(va).normalize()),[...a,...b]);
 return <mesh position={center} quaternion={q} castShadow><cylinderGeometry args={[r,r,length,10]}/><meshBasicMaterial color={c}/></mesh>;
};

function texture(draw:(c:CanvasRenderingContext2D)=>void,w=512,h=512){
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 draw(canvas.getContext('2d')!);const result=new CanvasTexture(canvas);result.colorSpace=SRGBColorSpace;return result;
}
function faceTexture(emotion:Emotion,boss:boolean,blink:boolean){return texture(c=>{
 c.lineJoin='round';c.lineCap='round';c.lineWidth=10;c.strokeStyle=P.ink;
 c.fillStyle='#F5EED7';c.beginPath();c.arc(256,267,193,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle=boss?'#787987':'#342D36';c.beginPath();c.moveTo(64,255);c.bezierCurveTo(40,122,119,75,197,76);c.bezierCurveTo(291,23,432,89,449,235);c.lineTo(445,262);c.bezierCurveTo(362,225,288,158,260,128);c.bezierCurveTo(201,218,133,232,64,255);c.fill();c.stroke();
 c.lineWidth=7;c.strokeStyle=boss?'#A7A7B5':'#5C4D59';c.beginPath();c.moveTo(85,190);c.bezierCurveTo(182,124,277,102,391,174);c.stroke();c.lineWidth=4;c.globalAlpha=.5;c.beginPath();c.moveTo(99,166);c.bezierCurveTo(199,99,283,97,373,148);c.stroke();c.globalAlpha=1;
 c.strokeStyle=P.ink;c.fillStyle=P.ink;c.lineWidth=8;
 for(const side of [-1,1]){
  const x=256+side*65;
  if(blink||emotion==='calm'||emotion==='smile'){
   c.beginPath();c.moveTo(x-26,278);c.quadraticCurveTo(x,emotion==='smile'?245:296,x+26,278);c.stroke();
  }else if(emotion==='fear'){
   c.fillStyle='#FFFEF0';c.beginPath();c.ellipse(x,280,24,31,0,0,Math.PI*2);c.fill();c.stroke();c.fillStyle=P.ink;c.beginPath();c.arc(x+5,283,10,0,Math.PI*2);c.fill();
  }else{c.beginPath();c.ellipse(x+5,280,11,16,0,0,Math.PI*2);c.fill();}
  c.beginPath();c.moveTo(x-29,emotion==='fear'?235-side*7:241);c.quadraticCurveTo(x,emotion==='fear'?224:232,x+29,emotion==='fear'?235+side*7:241);c.stroke();
 }
 c.lineWidth=7;c.beginPath();
 if(emotion==='fear'){c.moveTo(220,361);c.quadraticCurveTo(256,323,293,361);}
 else if(emotion==='smile'){c.moveTo(211,344);c.quadraticCurveTo(256,405,301,344);c.quadraticCurveTo(256,358,211,344);c.fillStyle='#FCFCF0';c.fill();}
 else if(emotion==='calm'){c.ellipse(256,354,14,6,0,0,Math.PI*2);}
 else{c.moveTo(223,350);c.quadraticCurveTo(257,364,291,344);}
 c.stroke();
 });}
function torsoTexture(boss:boolean){return texture(c=>{
 c.lineWidth=9;c.strokeStyle=P.ink;c.lineJoin='round';c.fillStyle=boss?'#303245':P.blue;
 c.beginPath();c.moveTo(73,28);c.quadraticCurveTo(45,104,54,311);c.quadraticCurveTo(127,349,202,311);c.quadraticCurveTo(213,103,182,28);c.closePath();c.fill();c.stroke();
 c.fillStyle=boss?'#212638':'#3F8BAD';c.beginPath();c.moveTo(177,44);c.quadraticCurveTo(193,189,172,317);c.lineTo(199,307);c.quadraticCurveTo(212,114,177,44);c.fill();
 c.fillStyle=P.paper;c.beginPath();c.moveTo(100,25);c.lineTo(127,61);c.lineTo(155,25);c.closePath();c.fill();c.stroke();
 if(boss){c.fillStyle='#B75A5B';c.beginPath();c.moveTo(127,60);c.lineTo(107,201);c.lineTo(129,227);c.lineTo(149,201);c.closePath();c.fill();c.stroke();}
 else{c.strokeStyle='#303447';c.lineWidth=6;c.beginPath();c.moveTo(101,35);c.lineTo(112,139);c.lineTo(148,139);c.lineTo(154,35);c.stroke();c.fillStyle=P.paper;c.strokeStyle=P.ink;c.lineWidth=3;c.fillRect(105,134,49,66);c.strokeRect(105,134,49,66);c.fillStyle='#4C7DAD';c.fillRect(114,145,32,18);c.fillStyle='#ADC3C7';c.fillRect(114,170,32,4);c.fillRect(118,179,24,4);}
 c.strokeStyle=P.ink;c.lineWidth=3;c.beginPath();c.moveTo(65,230);c.lineTo(101,230);c.moveTo(160,230);c.lineTo(192,230);c.stroke();
 },256,360);}

const Human:React.FC<{t:number;x:number;z:number;boss?:boolean;emotion?:Emotion;walk?:boolean;hold?:boolean}>=({t,x,z,boss=false,emotion='neutral',walk=false,hold=true})=>{
 const {camera}=useThree();const group=useRef<Group>(null);
 useLayoutEffect(()=>{if(group.current)group.current.rotation.y=Math.atan2(camera.position.x-x,camera.position.z-z);},[camera,t,x,z]);
 const maps=useMemo(()=>({torso:torsoTexture(boss),faces:Object.fromEntries((['neutral','fear','calm','smile'] as Emotion[]).flatMap(e=>[false,true].map(b=>[`${e}-${b}`,faceTexture(e,boss,b)])))}),[boss]);
 const phase=t*8.1,w=walk?Math.sin(phase):0,bob=walk?Math.abs(Math.cos(phase))*.027:Math.sin(t*1.7)*.006;
 const blink=Math.sin(t*1.51)>.994;
 const lift=lerp(t,1.4,2.2,0,1);
 const wrist:V=hold?[.66,1.30+.50*lift,.17]:[.65,emotion==='smile'?1.91:1.11,.06];
 return <group ref={group} position={[x,0,z]}>
  <mesh position={[0,.013,0]} rotation={[-Math.PI/2,0,0]} scale={[.46,.22,1]}><circleGeometry args={[1,32]}/><meshBasicMaterial color={P.ink} transparent opacity={.13}/></mesh>
  {[-1,1].map(side=>{const sw=w*side*.25,up=walk?Math.max(0,Math.cos(phase)*side)*.12:0;return <group key={side}>
   <Rod a={[side*.17,1.04,0]} b={[side*.18,.51,-sw*.23]} r={.029}/><Rod a={[side*.18,.51,-sw*.23]} b={[side*.2,.12+up,sw]} r={.029}/><Box p={[side*.2,.08+up,sw+.055]} s={[.16,.12,.27]} c={boss?'#332F3D':'#665142'}/>
  </group>;})}
  <group position={[0,bob,0]} rotation={[0,0,emotion==='fear'?.025:0]}>
   <Rod a={[0,1.89,.0]} b={[0,1.96,.0]} r={.031}/>
   <mesh position={[0,1.44,.015]} scale={[.79,1.13,1]}><planeGeometry args={[1,1]}/><meshBasicMaterial map={maps.torso} transparent side={DoubleSide} alphaTest={.05}/></mesh>
   <mesh position={[0,2.38,.023]} scale={[1.13,1.13,1]} rotation={[0,0,emotion==='fear'?.05:0]}><planeGeometry args={[1,1]}/><meshBasicMaterial map={maps.faces[`${emotion}-${blink}`]} transparent side={DoubleSide} alphaTest={.05}/></mesh>
   <Rod a={[-.18,1.78,0]} b={[-.53,1.41,w*.14]} r={.028}/><Rod a={[-.53,1.41,w*.14]} b={[-.58,emotion==='smile'?1.96:1.12,-w*.17]} r={.028}/>
   <Rod a={[.18,1.78,0]} b={[.57,1.41,.02]} r={.028}/><Rod a={[.57,1.41,.02]} b={wrist} r={.028}/>
   {hold&&<group position={[wrist[0],wrist[1]+.13,wrist[2]+.015]} rotation={[0,0,-.12]}><Box p={[0,0,0]} s={[.22,.37,.035]} c={P.ink}/><Box p={[0,0,.025]} s={[.17,.27,.008]} c={P.paper} outline={false}/><Box p={[0,.055,.034]} s={[.13,.055,.005]} c={P.blue} outline={false}/></group>}
  </group>
 </group>;
};

const Chair:React.FC<{x:number;z:number;rotation?:number}>=({x,z,rotation=0})=><group position={[x,0,z]} rotation={[0,rotation,0]}>
 <Box p={[0,.89,0]} s={[.97,.12,.94]} c={P.chair}/><Box p={[0,1.42,-.42]} s={[.97,1.04,.12]} c={P.chair}/><Rod a={[0,.12,0]} b={[0,.83,0]} r={.055}/>
 {[0,1,2,3,4].map(i=><Rod key={i} a={[0,.14,0]} b={[Math.cos(i*1.256)*.49,.12,Math.sin(i*1.256)*.49]} r={.025}/>)}
</group>;
const Desk:React.FC<{x:number;z:number;flip?:boolean}>=({x,z,flip=false})=><group position={[x,0,z]} rotation={[0,flip?Math.PI:0,0]}>
 <Box p={[0,1.39,0]} s={[2.70,.12,1.42]} c={P.desk}/><Box p={[-1.03,.70,0]} s={[.08,1.35,1.16]} c={P.metal}/><Box p={[1.03,.70,0]} s={[.08,1.35,1.16]} c={P.metal}/>
 <Box p={[0,1.74,-.58]} s={[2.83,.67,.08]} c="#8D9BAF"/>
 <Box p={[-.29,1.94,-.17]} s={[1.03,.66,.075]} c={P.ink}/><Box p={[-.29,1.94,-.119]} s={[.93,.56,.018]} c="#C4D5DA"/>
 <Box p={[-.29,1.57,-.17]} s={[.08,.2,.09]} c={P.ink}/><Box p={[-.29,1.47,-.17]} s={[.45,.027,.29]} c={P.ink}/><Box p={[-.29,1.48,.34]} s={[.89,.035,.26]} c="#DEDCD3"/>
 <Box p={[.82,1.46,.19]} s={[.35,.035,.4]} c={P.paper}/>
 <mesh position={[.88,1.62,-.31]} castShadow><cylinderGeometry args={[.11,.1,.32,16]}/><meshStandardMaterial color={P.paper}/></mesh>
 <Chair x={-.2} z={1.13}/>
</group>;

const Clock=()=>{
 const map=useMemo(()=>texture(c=>{
  c.fillStyle='#F0EADB';c.strokeStyle=P.ink;c.lineWidth=19;c.beginPath();c.arc(256,256,225,0,Math.PI*2);c.fill();c.stroke();
  c.lineWidth=4;c.font='42px Segoe UI';c.textAlign='center';c.textBaseline='middle';
  for(let i=1;i<=12;i++){const a=i*Math.PI/6;c.fillStyle=P.ink;c.fillText(String(i),256+Math.sin(a)*176,256-Math.cos(a)*176);}
  c.lineWidth=13;c.lineCap='round';c.beginPath();c.moveTo(256,110);c.lineTo(256,256);c.lineTo(330,307);c.stroke();
 }),[]);
 return <mesh position={[1.05,3.81,-6.60]}><planeGeometry args={[.85,.85]}/><meshBasicMaterial map={map} transparent/></mesh>;
};
const Room=()=> <>
 <Box p={[0,-.12,0]} s={[12,.24,16]} c={P.floor}/><Box p={[0,3,-6.9]} s={[12,6,.18]} c={P.wall}/><Box p={[-6,3,0]} s={[.18,6,14]} c="#E4E5D9"/>
 {Array.from({length:9},(_,i)=><Rod key={i} a={[-6,.006,-6.5+i*1.65]} b={[6,.006,-6.5+i*1.65]} r={.006} c="#1B3694"/>)}
 {Array.from({length:9},(_,i)=><Rod key={i} a={[-5.8+i*1.45,.006,-7]} b={[-5.8+i*1.45,.006,7]} r={.006} c="#1B3694"/>)}
 {Array.from({length:12},(_,i)=><group key={i}>
   <Rod a={[-6,i*.48+.2,-6.78]} b={[6,i*.48+.2,-6.78]} r={.009} c={P.wallDark}/>
   {Array.from({length:8},(_,j)=><Rod key={j} a={[-5.7+j*1.6+(i%2)*.8,i*.48+.2,-6.77]} b={[-5.7+j*1.6+(i%2)*.8,i*.48+.68,-6.77]} r={.008} c={P.wallDark}/>)}
 </group>)}
 <Box p={[4.7,2.0,-6.72]} s={[1.85,4,.12]} c={P.door}/><Box p={[4.7,2.7,-6.63]} s={[1.37,1.37,.06]} c="#E4ECE5"/><Box p={[5.28,1.60,-6.57]} s={[.28,.07,.06]} c={P.metal}/>
 <Clock/>
 {[-4.0,-1.3].map(x=><group key={x}><Box p={[x,3.5,-6.69]} s={[2.1,2.4,.08]} c={P.paper}/><Box p={[x,3.5,-6.63]} s={[1.91,2.2,.05]} c="#9FC4D3"/><Box p={[x,3.5,-6.58]} s={[.06,2.2,.03]} c={P.paper}/><Box p={[x,3.5,-6.58]} s={[1.91,.06,.03]} c={P.paper}/></group>)}
 <Box p={[-5.85,3.1,-1.4]} s={[.05,1.58,2.0]} c="#C49A60"/>
 {[0,1,2,3,4].map(i=><Box key={i} p={[-5.8,2.68+i%2*.64,-2.08+i*.34]} s={[.01,.39,.26]} c={i%2?P.paper:P.yellow} outline={false}/>)}
 <Box p={[5.25,1.45,-3.3]} s={[1.15,2.9,.55]} c={P.metal}/>
 {[0,1,2].map(i=><group key={i}><Box p={[5.25,.26+i*.86,-2.97]} s={[1.17,.065,.65]} c={P.metal}/>{Array.from({length:7},(_,j)=><Box key={j} p={[4.82+j*.14,.55+i*.86,-3.0]} s={[.105,.51,.35]} c={[P.orange,P.blue,P.paper,P.wall][j%4]}/>)}</group>)}
 <Desk x={-3.2} z={-3.8}/><Desk x={2.0} z={-3.8}/><Desk x={-3.4} z={1.0} flip/><Desk x={3.4} z={2.0} flip/>
 <Box p={[-.4,5.45,-2.5]} s={[9.8,.06,7.9]} c="#E6E8E1"/>
 {Array.from({length:6},(_,i)=><Rod key={i} a={[-5.2+i*1.9,5.40,-6.3]} b={[-5.2+i*1.9,5.40,1.4]} r={.013} c="#ABB1B5"/>)}
 {[0,1,2,3].map(i=><Rod key={i} a={[-5.2,5.40,-6.3+i*2]} b={[4.5,5.40,-6.3+i*2]} r={.013} c="#ABB1B5"/>)}
</>;

const Camera:React.FC<{t:number}>=({t})=>{
 const {camera}=useThree(),shot=shotAt(t);
 useLayoutEffect(()=>{
   let position:V=[4.1,3.1,8.8],target:V=[0,1.65,0];
   if(shot===0)position=[lerp(t,0,2.4,5.1,3.2),3.0,lerp(t,0,2.4,9.5,7.3)];
   if(shot===1||shot===7)position=[2.0,2.7,6.5];
   if(shot===2)position=[lerp(t,5.7,10.4,2.2,.9),2.8,lerp(t,5.7,10.4,6.8,5.9)];
   if(shot===3||shot===4)position=[Math.sin((t-10.4)*.16)*3.0,3.4,8.1];
   if(shot===5)position=[-2.7,2.7,6.1];
   if(shot===6)position=[2.5,2.7,5.9];
   if(shot===8)position=[lerp(t,32.3,37.4,-3.1,2.8),3.1,8.0];
   if(shot===9)position=[-2.5,2.8,6.0];
   camera.position.set(...position);camera.lookAt(...target);camera.updateProjectionMatrix();
 },[camera,t,shot]);return null;
};

const Scene:React.FC<{t:number}>=({t})=>{
 const shot=shotAt(t),emotion=emotionAt(t),worry=shot>=2&&shot<=4;
 return <>
  <color attach="background" args={['#B9C4CB']}/><ambientLight intensity={1.9}/><hemisphereLight args={['#FFFFFF','#6E79AD',1.2]}/>
  <directionalLight position={[-3,7,6]} intensity={2.0} color="#FFF5DC" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-.001}/>
  <spotLight position={[-2,4,-5]} angle={.75} penumbra={.38} intensity={worry?80:46} distance={18} color={P.yellow}/>
  <pointLight position={[4,2.7,4]} intensity={worry?28:16} distance={12} color="#3243FF"/>
  <Camera t={t}/><Room/>
  <Human t={t} x={shot===0?lerp(t,0,2.2,-1.2,0):0} z={0} walk={shot===0} hold={shot!==5&&shot!==9} emotion={emotion}/>
  <Human t={t+.4} x={shot===8?lerp(t,32.3,34.7,3.8,1.40):shot===9?1.45:-2.1} z={shot>=8?-.25:-1.0} boss emotion={shot>=8?'smile':'neutral'} hold={false}/>
 </>;
};

export const HumanOffice:React.FC<{t:number;fps:number}>=({t,fps})=>{
 const shot=shotAt(t),phoneShot=shot===1||shot===7;
 return <>
  <div style={{position:'absolute',inset:0,filter:phoneShot?'blur(7px)':undefined}}><ThreeCanvas width={1080} height={1920} dpr={1} shadows camera={{fov:36,near:.1,far:60}} gl={{antialias:true,preserveDrawingBuffer:true}}><Scene t={t}/></ThreeCanvas></div>
  {phoneShot&&<div style={{position:'absolute',left:260,top:390,width:560,height:990,borderRadius:48,padding:14,background:P.ink,boxShadow:'20px 28px 60px #17223C66',transform:`perspective(1600px) rotateY(${shot===1?13:-8}deg) rotateZ(-5deg) translateY(${(1-pop(t,shot===1?2.4:27.8,fps))*100}px)`}}>
   <div style={{position:'absolute',inset:14,borderRadius:37,background:'#ECEDDD',padding:'102px 31px 30px',overflow:'hidden'}}>
    <div style={{position:'absolute',width:126,height:19,top:15,left:196,borderRadius:12,background:P.ink}}/>
    <div style={{fontSize:34,fontWeight:700,color:P.ink,textAlign:'center',marginBottom:42}}>Anh quản lý</div>
    <div style={{fontSize:34,lineHeight:1.35,color:P.ink,background:P.paper,padding:'23px 25px',borderRadius:'22px 22px 22px 3px',border:'2px solid #B5BDB2'}}>Chiều gặp anh<br/>chút nhé.</div>
    {shot===7&&<><div style={{marginTop:27,marginLeft:47,fontSize:32,lineHeight:1.4,color:P.ink,background:'#AFCDB5',padding:'21px 24px',borderRadius:'22px 22px 3px 22px'}}>Dạ, em cần chuẩn bị<br/>gì không ạ?</div><div style={{marginTop:27,fontSize:32,lineHeight:1.4,color:P.ink,background:P.paper,padding:'24px',borderRadius:'22px 22px 22px 3px',opacity:Math.min(1,pop(t,28.1,fps))}}>Không có gì đâu.<br/>Anh muốn khen bản<br/>thiết kế của em.</div></>}
   </div>
  </div>}
  {shot===2&&['Làm sai rồi?','Sếp đang giận?','Mất việc sao?'].map((text,i)=>t>=5.7+i*1.6&&t<7.4+i*1.6&&<div key={i} style={{position:'absolute',left:i%2?540:100,top:430,fontSize:34,color:P.ink,background:'#FFFEED',border:'3px solid #292827',borderRadius:70,padding:'30px',opacity:Math.min(1,pop(t,5.7+i*1.6,fps)),transform:`translateY(${(1-pop(t,5.7+i*1.6,fps))*50}px)`}}>{text}</div>)}
  {(shot===3||shot===4)&&<div style={{position:'absolute',left:60,right:60,top:365,display:'flex',gap:15}}>{['SAI SÓT','BỊ MẮNG','MẤT VIỆC'].map((label,i)=><div key={label} style={{flex:1,border:'3px solid #242437',background:'#F3EBCFEF',padding:'24px 8px',borderRadius:9,textAlign:'center',color:P.ink,transform:`translateY(${Math.sin(t*1.5+i)*5}px)`}}><div style={{fontSize:68,lineHeight:1.3,color:'#B05F62'}}>?</div><div style={{fontSize:26,fontWeight:700}}>{label}</div></div>)}</div>}
  {shot===6&&<div style={{position:'absolute',left:105,right:105,top:380,color:P.ink,fontSize:42,lineHeight:1.4,background:'#FFFFE9EE',border:'3px solid #292827',borderRadius:20,padding:'28px 35px',opacity:Math.min(1,pop(t,23.3,fps)),transform:`translateY(${(1-pop(t,23.3,fps))*55}px)`}}>“Dạ, em cần chuẩn bị<br/>gì không ạ?”{t>25.4&&<div style={{textAlign:'right',fontSize:23,color:'#517767',marginTop:10}}>Đã gửi ✓</div>}</div>}
  {shot===9&&<div style={{position:'absolute',left:70,right:70,top:380,textAlign:'center',color:P.paper,fontSize:44,fontWeight:700,textShadow:'0 2px 2px #272438,2px 0 2px #272438,-2px 0 2px #272438'}}>Hỏi rõ điều chưa biết.</div>}
 </>;
};
