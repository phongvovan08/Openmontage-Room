import React,{useLayoutEffect,useMemo} from 'react';
import {useLoader,useThree} from '@react-three/fiber';
import {staticFile} from 'remotion';
import {BufferGeometry,CanvasTexture,DoubleSide,Float32BufferAttribute,SRGBColorSpace,TextureLoader} from 'three';
import {P,asset,lerp,rootX,shotAt} from './theme';
import {PicturePart,Puppet} from './Rig';

function paperTexture(){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d')!;
 c.fillStyle=P.paper;c.fillRect(0,0,256,256);
 for(let i=0;i<1800;i++){const x=(i*71)%256,y=(i*113)%256;c.fillStyle=i%2?'#B49A6A12':'#FFFDF118';c.fillRect(x,y,1+(i%3),1);}
 const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;return map;
}
const Solid:React.FC<{p:[number,number,number];s:[number,number,number];color:string}>=({p,s,color})=><mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={color} roughness={.95}/></mesh>;
const Room:React.FC<{t:number}>=({t})=>{
 const wall=useLoader(TextureLoader,staticFile(`${asset}/nen-tuong-phong.png`));
 wall.colorSpace=SRGBColorSpace;
 const paper=useMemo(paperTexture,[]);
 return <>
  <mesh position={[0,3.0,-3.8]}><planeGeometry args={[11.0,6.2]}/><meshBasicMaterial map={wall} toneMapped={false}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.008,0]} receiveShadow><planeGeometry args={[15,14]}/><meshStandardMaterial color="#D6C19A" map={paper} roughness={1}/></mesh>
  <Solid p={[1.85,1.225,.30]} s={[2.3,.085,1.40]} color="#BC9461"/>
  {[-1,1].map(s=><React.Fragment key={s}><Solid p={[1.85+s*.92,.60,-.20]} s={[.075,1.20,.075]} color={P.teal}/><Solid p={[1.85+s*.92,.60,.82]} s={[.075,1.20,.075]} color={P.teal}/></React.Fragment>)}
  <Solid p={[1.85,.30,.30]} s={[1.9,.045,.08]} color={P.teal}/>
  <mesh position={[1.72,1.277,.40]} rotation={[-Math.PI/2,0,.1]}><planeGeometry args={[.62,.49]}/><meshStandardMaterial map={paper} roughness={1}/></mesh>
  <PicturePart name="mug" x={2.50} y={1.275} z={.50} height={.33} pivot={[.5,1]}/>
  <PicturePart name="plant" x={-1.55} y={0} z={1.95} height={1.38} pivot={[.5,1]}/>
  <PicturePart name="plant" x={3.18} y={1.27} z={-.25} height={.66} pivot={[.5,1]}/>
  <Solid p={[1.8,.10,-1.1]} s={[1.1,.05,.7]} color={P.teal}/>
 </>;
};

const Ribbon:React.FC<{index:number;t:number}>=({index,t})=>{
 const map=useMemo(paperTexture,[]);
 const geometry=useMemo(()=>{
  const points:number[]=[],uvs:number[]=[],indices:number[]=[];
  const count=90;
  for(let i=0;i<=count;i++){
   const u=i/count,phase=u*Math.PI*2.3+index*2.0;
   const x=(u-.5)*6.6, z=-1.9+Math.sin(phase)*.65+index*.48;
   const y=.10+index*.22+Math.sin(u*Math.PI)*.2;
   const height=1.25+index*.50+Math.sin(phase)*.18;
   points.push(x,y,z,x,y+height,z);uvs.push(u*3,0,u*3,1);
   if(i<count){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(points,3));g.setAttribute('uv',new Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
 },[index]);
 return <mesh geometry={geometry} position={[0,Math.sin(t*.5+index)*.025,0]} rotation={[0,index*.07,0]} castShadow receiveShadow><meshStandardMaterial map={map} color={index%2?'#E4D6B5':P.paper} side={DoubleSide} roughness={1}/></mesh>;
};

const Camera:React.FC<{t:number}>=({t})=>{
 const {camera}=useThree(),shot=shotAt(t),x=rootX(t);
 useLayoutEffect(()=>{
  let position:[number,number,number]=[3.0,2.35,7.6],target:[number,number,number]=[x+.30,1.46,0];
  if(shot===0)position=[lerp(t,0,2.4,3.6,2.9),2.50,lerp(t,0,2.4,8.6,7.5)];
  if(shot===1||shot===6){position=[1.03,2.20,1.13];target=[.66,2.04,.13];}
  if(shot===2){position=[lerp(t,5.7,10.4,1.8,1.0),2.35,6.1];target=[0,1.72,0];}
  if(shot===3){position=[Math.sin((t-10.4)*.2)*3.6,3.15,8.1];target=[0,1.3,-.30];}
  if(shot===4){position=[-2.3,2.35,6.5];target=[.25,1.5,0];}
  if(shot===5){position=[1.7,2.50,5.35];target=[.2,1.65,0];}
  if(shot===7){position=[lerp(t,32.3,37.4,2.5,-2.2),2.4,7.3];target=[x+.35,1.42,0];}
  if(shot===8){position=[-2.2,2.60,8.4];target=[-.10,1.42,0];}
  camera.position.set(...position);camera.lookAt(...target);camera.updateProjectionMatrix();
 },[camera,t,x,shot]);return null;
};

export const PaperStage:React.FC<{t:number}>=({t})=>{
 const mind=t>=10.4&&t<20;
 return <>
  <color attach="background" args={[mind?P.night:'#E2D0AD']}/>
  <ambientLight intensity={mind?.9:1.8} color={mind?'#B9C8DB':P.white}/><hemisphereLight args={['#FFEDCE','#7B8B83',1.3]}/>
  <directionalLight position={[4.5,7.5,4.0]} intensity={mind?1.6:2.4} color="#FFF0D3" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-.001}/>
  <Camera t={t}/><Room t={t}/>
  {mind&&[0,1,2].map(i=><Ribbon key={i} index={i} t={t}/>)}
  <Puppet t={t}/>
 </>;
};
