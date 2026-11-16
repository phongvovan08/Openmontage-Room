import React,{createContext,useContext,useMemo} from 'react';
import {useLoader} from '@react-three/fiber';
import {staticFile} from 'remotion';
import {CanvasTexture,DoubleSide,LinearFilter,PlaneGeometry,SRGBColorSpace,Texture,TextureLoader} from 'three';
import atlas from './atlas.json';
import {asset,P,XY,lerp,rootX,solve} from './theme';

type Name=keyof typeof atlas.parts;
type PartDef={x:number;y:number;width:number;height:number;jointA?:number[];jointB?:number[]};
const Maps=createContext<Partial<Record<Name,Texture>>>({});
export const AtlasProvider:React.FC<{children:React.ReactNode}>=({children})=>{
 const [source,faces]=useLoader(TextureLoader,[staticFile(`${asset}/nhan-vat-cac-bo-phan.png`),staticFile(`${asset}/bieu-cam-khuon-mat.png`)]);
 const maps=useMemo(()=>Object.fromEntries(Object.entries(atlas.parts).map(([name,box])=>{
  const isFace='source' in box,tw=isFace?atlas.faceWidth:atlas.width,th=isFace?atlas.faceHeight:atlas.height;
  const tex=(isFace?faces:source).clone();tex.colorSpace=SRGBColorSpace;tex.minFilter=LinearFilter;tex.magFilter=LinearFilter;
  tex.repeat.set(box.width/tw,box.height/th);tex.offset.set(box.x/tw,1-(box.y+box.height)/th);tex.needsUpdate=true;
  return [name,tex];
 })),[source,faces]);
 return <Maps.Provider value={maps}>{children}</Maps.Provider>;
};

export const PicturePart:React.FC<{name:Name;x:number;y:number;z?:number;height:number;pivot?:XY;angle?:number}>=({name,x,y,z=0,height,pivot=[.5,.5],angle=0})=>{
 const map=useContext(Maps)[name],box=atlas.parts[name];
 const width=height*box.width/box.height;
 const geometry=useMemo(()=>new PlaneGeometry(width,height).translate(width*(.5-pivot[0]),height*(pivot[1]-.5),0),[width,height,pivot[0],pivot[1]]);
 return <mesh position={[x,y,z]} rotation={[0,0,angle]} geometry={geometry}><meshBasicMaterial map={map} transparent alphaTest={.56} side={DoubleSide} toneMapped={false}/></mesh>;
};
const BonePart:React.FC<{name:Name;a:XY;b:XY;z:number}>=({name,a,b,z})=>{
 const def=atlas.parts[name] as PartDef,jA=def.jointA!,jB=def.jointB!;
 const rawDx=(jB[0]-jA[0])*def.width,rawDy=(jB[1]-jA[1])*def.height;
 const rawLength=Math.hypot(rawDx,rawDy),length=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const angle=Math.atan2(b[0]-a[0],-(b[1]-a[1]))-Math.atan2(rawDx,rawDy);
 return <PicturePart name={name} x={a[0]} y={a[1]} z={z} height={def.height*length/rawLength} pivot={[jA[0],jA[1]]} angle={angle}/>;
};

export function arms(t:number,hipY=1.26){
 const raise=lerp(t,2.25,3.15,0,1),put=lerp(t,20,20.75,0,1),pick=lerp(t,23.3,24.15,0,1),end=lerp(t,32.3,33.25,0,1);
 const walking=t<2.4||t>34.4&&t<37.4;
 let right:XY=[lerp(raise,0,1,.55,.64),lerp(raise,0,1,1.23,1.96)];
 if(t>=20&&t<20.8)right=[lerp(put,0,1,.64,.76),lerp(put,0,1,1.96,1.27)];
 if(t>=20.8&&t<23.3)right=[lerp(t,20.8,21.3,.76,.48),lerp(t,20.8,21.3,1.27,1.18)];
 if(t>=23.3&&t<23.75)right=[lerp(t,23.3,23.75,.48,.76),lerp(t,23.3,23.75,1.18,1.27)];
 if(t>=23.75&&t<32.3)right=[lerp(t,23.75,24.45,.76,.64),lerp(t,23.75,24.45,1.27,1.96)];
 if(t>=32.3)right=[lerp(end,0,1,.64,.76),lerp(end,0,1,1.96,1.27)];
 if(t>=33.25&&t<34.4)right=[lerp(t,33.25,33.8,.76,.48),lerp(t,33.25,33.8,1.27,1.18)];
 if(t>=34.4)right=[.55+Math.sin((t-34.4)*8)*.05,1.23];
 let left:XY=[-.55,1.23];
 if(t>=5.7&&t<20){const p=lerp(t,5.7,6.5,0,1);left=[lerp(p,0,1,-.55,-.17),lerp(p,0,1,1.23,2.52)];}
 if(t>=20&&t<23.3){const p=lerp(t,20,20.8,0,1);left=[lerp(p,0,1,-.17,-.30),lerp(p,0,1,2.52,1.52)];}
 if(t>=23.3&&t<27.8){const p=lerp(t,23.7,24.6,0,1);left=[lerp(p,0,1,-.30,.49)+Math.sin(t*11)*.013*p,lerp(p,0,1,1.52,1.91)];}
 if(t>=32.3&&t<34.4){const p=lerp(t,32.3,33,0,1);left=[lerp(p,0,1,-.55,-.65),lerp(p,0,1,1.23,2.10)];}
 if(walking)left=[-.55-Math.sin(t*8)*.05,1.23];
 const shoulderLift=t>=5.7&&t<20?lerp(t,5.7,6.4,0,.055):0;
 const l:XY=[-.255,hipY+.75+shoulderLift],r:XY=[.255,hipY+.75+shoulderLift];
 return {left,right,l,r};
}

function messageTexture(phase:number){
 const c=document.createElement('canvas');c.width=320;c.height=600;const x=c.getContext('2d')!;
 x.fillStyle='#ECE8D8';x.fillRect(0,0,320,600);x.fillStyle=P.ink;x.font='700 21px Segoe UI';x.textAlign='center';x.fillText('Anh quản lý',160,53);
 x.font='18px Segoe UI';x.textAlign='left';
 function bubble(px:number,py:number,w:number,h:number,color:string,lines:string[]){x.fillStyle=color;x.beginPath();x.roundRect(px,py,w,h,15);x.fill();x.fillStyle=P.ink;lines.forEach((s,i)=>x.fillText(s,px+15,py+29+i*26));}
 bubble(14,84,262,89,'#FFFCED',['Chiều gặp anh','chút nhé.']);
 if(phase>=1)bubble(58,203,248,92,'#B9CCB7',['Dạ, em cần chuẩn bị','gì không ạ?']);
 if(phase>=2)bubble(14,326,287,117,'#FFFCED',['Không có gì đâu.','Anh muốn khen bản','thiết kế của em.']);
 x.strokeStyle='#5D6A66';x.lineWidth=3;x.beginPath();x.moveTo(126,582);x.lineTo(194,582);x.stroke();
 const map=new CanvasTexture(c);map.colorSpace=SRGBColorSpace;return map;
}
export const Phone:React.FC<{t:number;x:number;y:number;z:number;flat?:number}>=({t,x,y,z,flat=0})=>{
 const maps=useMemo(()=>[0,1,2].map(messageTexture),[]);const phase=t>=27.8?2:t>=24.4?1:0;
 return <group position={[x,y,z]} rotation={[-Math.PI/2*flat,0,-.08*(1-flat)]}>
  <mesh castShadow><boxGeometry args={[.285,.535,.035]}/><meshStandardMaterial color={P.ink} roughness={.6}/></mesh>
  <mesh position={[0,0,.019]}><planeGeometry args={[.258,.485]}/><meshBasicMaterial map={maps[phase]} toneMapped={false}/></mesh>
 </group>;
};

export const Puppet:React.FC<{t:number}>=({t})=>{
 const x=rootX(t),walk=t<2.4||t>34.4&&t<37.4;
 const distance=t<2.4?x+1.5:Math.abs(x),phase=distance/.64*Math.PI*2;
 const hipY=(walk?1.28:1.31)+(walk?Math.sin(phase*2)*.013:Math.sin(t*2)*.003);
 const arm=arms(t,hipY),lean=t<5.7?0:t<20?lerp(t,5.7,6.6,0,-.10):lerp(t,20,21,-.10,0);
 const leftElbow=solve(arm.l,arm.left,.48,.46,t>=23.3&&t<27.8?-1:1);
 const phoneOnDesk=t>=20.8&&t<23.75||t>=33.25;
 const phoneFlat=t>=20&&t<20.8?lerp(t,20,20.8,0,1):t>=23.75&&t<24.45?lerp(t,23.75,24.45,1,0):t>=32.3?lerp(t,32.3,33.25,0,1):0;
 return <>
  <group position={[x,0,0]}>
   <mesh position={[0,.008,0]} rotation={[-Math.PI/2,0,0]} scale={[.43,.21,1]}><circleGeometry args={[1,40]}/><meshBasicMaterial color={P.ink} transparent opacity={.13}/></mesh>
   {[-1,1].map(side=>{
    const cp=((phase+(side===1?Math.PI:0))%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
    const swing=cp>=Math.PI;const q=(cp-Math.PI)/Math.PI;
    const shift=walk?(swing?-.16+.32*(.5-.5*Math.cos(q*Math.PI)):.16-cp*.32/Math.PI):0;
    const fy=.14+(walk&&swing?Math.sin(q*Math.PI)*.10:0);
    const hip:XY=[side*.145,hipY],foot:XY=[side*.145+shift,fy],knee=solve(hip,foot,.60,.58,1);
    return <React.Fragment key={side}><BonePart name={side<0?'thighL':'thighR'} a={hip} b={knee} z={side<0?-.008:.014}/><BonePart name={side<0?'shinL':'shinR'} a={knee} b={foot} z={side<0?-.007:.015}/><PicturePart name={side<0?'shoeL':'shoeR'} x={foot[0]} y={fy} z={side<0?.015:.035} height={.176} pivot={[side<0?.76:.24,.23]}/></React.Fragment>;
   })}
   <BonePart name="upperArmL" a={arm.l} b={leftElbow} z={-.035}/>
   <BonePart name="forearmL" a={leftElbow} b={arm.left} z={t>=23.3&&t<27.8?.115:t>=5.7&&t<20?.105:-.025}/>
   <PicturePart name="torso" x={0} y={hipY-.055} z={.025} height={.96} pivot={[.5,1]} angle={lean*.18}/>
   <PicturePart name={walk?'headQuarter':t>=5.7&&t<20?'headFear':t>=32.3?'headHappy':'head'} x={0} y={hipY+.79} z={.045} height={.74} pivot={[.50,.97]} angle={lean+Math.sin(t*1.6)*.014}/>
   <BonePart name="upperArmR" a={arm.r} b={solve(arm.r,arm.right,.48,.46,-1)} z={.035}/>
   <BonePart name="forearmR" a={solve(arm.r,arm.right,.48,.46,-1)} b={arm.right} z={.075}/>
   {!phoneOnDesk&&<Phone t={t} x={arm.right[0]+.018} y={arm.right[1]+lerp(phoneFlat,0,1,.11,.015)} z={.14} flat={phoneFlat}/>}
  </group>
  {phoneOnDesk&&<Phone t={t} x={.78} y={1.285} z={.15} flat={1}/>}
 </>;
};
