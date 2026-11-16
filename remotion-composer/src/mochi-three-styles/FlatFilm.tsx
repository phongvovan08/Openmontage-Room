import React from 'react';
import {T as C,enter,lerp,Mood,moodAt,shotAt} from './theme';

export const FlatMochi:React.FC<{t:number;x?:number;y?:number;s?:number;walk?:boolean;phone?:boolean;mood?:Mood;turn?:number}>=({t,x=0,y=0,s=1,walk=false,phone=false,mood='calm',turn=0})=>{
  const phase=t*8.5,step=walk?Math.sin(phase):0,breath=Math.sin(t*2)*2;
  const worry=mood==='worry',happy=mood==='happy',close=mood==='breathe'||Math.sin(t*1.31)> .992;
  const lift=worry?8:0, head=worry?8*Math.sin(t*2):0;
  const hand={x:phone?112:114+(walk?-step*16:Math.sin(t*1.9)*5),y:phone?-174:happy?-198:-102};
  const swing=walk?step*32:0;
  return <g transform={`translate(${x} ${y}) scale(${s})`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="0" cy="7" rx="103" ry="14" fill={C.ink} stroke="none" opacity=".12"/>
    {[-1,1].map(side=>{const phaseSide=phase+(side===1?Math.PI:0);const fx=side*37+(walk?Math.sin(phaseSide)*30:0);const fy=walk?-Math.max(0,Math.cos(phaseSide))*19:0;return <g key={side}>
      <path d={`M ${side*40} -63 Q ${side*48+swing*side*.25} -30 ${fx} ${fy-7}`} stroke={C.ink} strokeWidth="19" fill="none"/>
      <path d={`M ${side*40} -63 Q ${side*48+swing*side*.25} -30 ${fx} ${fy-7}`} stroke={C.white} strokeWidth="11" fill="none"/>
      <ellipse cx={fx+side*5} cy={fy-4} rx="23" ry="12" fill={C.white}/>
    </g>;})}
    <g transform={`translate(0 ${-Math.abs(step)*5+breath-lift}) rotate(${worry?-4:0} 0 -130)`}>
      <path d={`M -80 -166 Q -126 -145 -119 ${happy?-190:-101+step*17}`} fill="none" strokeWidth="23"/>
      <path d={`M -80 -166 Q -126 -145 -119 ${happy?-190:-101+step*17}`} fill="none" stroke={C.white} strokeWidth="14"/>
      <path d="M -95 -180 C -103 -278 76 -286 96 -181 C 119 -122 115 -65 65 -52 Q 0 -35 -65 -52 C -116 -65 -119 -122 -95 -180" fill={C.white}/>
      <path d="M 79 -212 Q 104 -138 82 -83 Q 35 -57 -30 -64" fill="none" stroke={C.muted} opacity=".17" strokeWidth="13"/>
      <g transform={`translate(${head*.4+turn*12} ${head*.25})`}>
        <ellipse cx="-52" cy="-185" rx="18" ry="9" fill={C.pink} opacity=".7" stroke="none"/><ellipse cx="53" cy="-185" rx="18" ry="9" fill={C.pink} opacity=".7" stroke="none"/>
        {[-1,1].map(side=><g key={side}>
          {close?<path d={`M ${side*32-9} -207 q 9 9 18 0`} fill="none"/>:<ellipse cx={side*32} cy={-208+(worry?3:0)} rx="6" ry={happy?6:9} fill={C.ink} stroke="none"/>}
          {worry&&<path d={`M ${side*32-10} ${-231-side*4} l 20 ${side*9}`} fill="none" strokeWidth="4"/>}
        </g>)}
        <path d={worry?'M -10 -168 Q 0 -179 10 -168':happy?'M -14 -173 Q 0 -151 14 -173':mood==='breathe'?'M -6 -170 Q 0 -164 6 -170':'M -8 -174 Q 0 -166 8 -174'} fill="none" strokeWidth="4"/>
      </g>
      <path d="M -87 -141 Q 0 -120 89 -141 L 89 -116 Q 0 -95 -87 -118 Z" fill={C.yellow}/>
      <path d={`M 48 -116 L ${65+Math.sin(t*3)*6} -63 L 96 -76 L 75 -122`} fill={C.yellow}/>
      {[-60,-36,-12,12,36,60].map(i=><path key={i} d={`M ${i} -133 l 2 16`} stroke={C.wood} opacity=".35" strokeWidth="2"/>)}
      <g transform={`translate(0 -267) rotate(${worry?36:Math.sin(t*2)*5})`}>
        <path d="M 0 0 Q 9 -31 0 -56" fill="none" stroke={C.leaf} strokeWidth="7"/>
        <path d="M 1 -30 Q -46 -72 -52 -40 Q -44 -16 1 -30" fill={C.green} stroke={C.leaf} strokeWidth="3"/>
        <path d="M 5 -36 Q 49 -77 53 -52 Q 49 -27 5 -36" fill={C.green} stroke={C.leaf} strokeWidth="3"/>
        {happy&&<g transform={`translate(2 -58) rotate(${t*13})`} stroke={C.wood} strokeWidth="2">
          {[0,72,144,216,288].map(a=><ellipse key={a} cx="0" cy="-12" rx="9" ry="16" transform={`rotate(${a})`} fill={C.yellow}/>)}<circle r="8" fill={C.cream}/>
        </g>}
      </g>
      <path d={`M 84 -158 Q ${phone?130:124} -132 ${hand.x} ${hand.y}`} strokeWidth="23" fill="none"/>
      <path d={`M 84 -158 Q ${phone?130:124} -132 ${hand.x} ${hand.y}`} stroke={C.white} strokeWidth="14" fill="none"/>
      {phone&&<g transform={`translate(${hand.x-8} ${hand.y-36}) rotate(-10)`}>
        <rect x="-13" y="-27" width="42" height="71" rx="8" fill={C.navy} strokeWidth="4"/>
        <rect x="-7" y="-18" width="30" height="48" rx="3" fill={C.sky} stroke="none"/>
        <circle cx="8" cy="36" r="2" fill={C.white} stroke="none"/>
        <path d="M -19 27 Q -3 14 5 27" strokeWidth="12" stroke={C.white}/>
      </g>}
    </g>
  </g>;
};

const FlatRoom:React.FC<{t:number;warm?:boolean}>=({t,warm=false})=><g>
  <defs><linearGradient id="flat-wall" x2="0" y2="1"><stop stopColor={C.cream}/><stop offset="1" stopColor={C.wall}/></linearGradient><linearGradient id="flat-floor" x2="0" y2="1"><stop stopColor={C.floor}/><stop offset="1" stopColor={C.teal}/></linearGradient></defs>
  <rect x="-500" width="2080" height="2300" fill="url(#flat-wall)"/>
  <rect x="80" y="340" width="420" height="500" rx="8" fill={C.wood} stroke={C.ink} strokeWidth="7"/>
  <rect x="94" y="354" width="392" height="471" fill={C.sky}/>
  <clipPath id="flat-window"><rect x="94" y="354" width="392" height="471"/></clipPath>
  <g clipPath="url(#flat-window)">{[0,1,2,3,4].map(i=><g key={i} transform={`translate(${94+i*100-20+Math.sin(t*.15)*9} ${440+i%2*80})`}><rect width="85" height="400" fill={i%2?C.blue:C.teal} opacity=".24"/>{[0,1,2,3].map(j=><path key={j} d={`M 12 ${j*55+16} h 18 m 16 0 h 18`} stroke={C.white} strokeWidth="13" opacity=".6"/>)}</g>)}</g>
  <path d="M 290 352 V 827 M 92 587 H 487" stroke={C.white} strokeWidth="14"/>
  <path d="M 1080 240 L 450 1100 H 960 L 1080 690" fill={warm?C.yellow:C.white} opacity=".13"/>
  <rect x="-500" y="1120" width="2080" height="1180" fill="url(#flat-floor)"/>
  <path d="M 0 1120 H 1080 M 0 1390 H 1080 M 0 1760 H 1080 M 540 1120 L 0 1920 M 790 1120 L 1080 1920" stroke={C.ink} strokeWidth="4" opacity=".13"/>
  <g stroke={C.ink} strokeWidth="6" strokeLinejoin="round">
    <rect x="760" y="590" width="270" height="530" rx="12" fill={C.teal}/><rect x="794" y="624" width="200" height="296" fill={C.sky}/><circle cx="972" cy="951" r="9" fill={C.yellow}/>
    <rect x="556" y="489" width="145" height="183" rx="10" fill={C.white}/><circle cx="628" cy="576" r="48" fill={C.cream}/><path d="M 628 541 V 576 L 650 589" fill="none"/>
    <path d="M 25 991 H 428 L 482 1080 H 6 Z" fill={C.wood}/><path d="M 52 1081 V 1270 M 420 1081 V 1270" strokeWidth="19"/>
    <path d="M 130 930 H 316 L 330 1010 H 142 Z" fill={C.navy}/><path d="M 151 945 H 298 L 309 995 H 162 Z" fill={C.blue}/><path d="M 127 1016 H 350" stroke={C.white} strokeWidth="12"/>
    <path d="M 926 1040 L 945 1119 H 1009 L 1026 1040 Z" fill={C.pink}/><path d="M 974 1040 V 920 M 974 993 Q 910 935 934 924 Q 976 943 974 993 M 974 973 Q 1045 917 1027 901 Q 982 919 974 973" fill={C.green} stroke={C.leaf} strokeWidth="5"/>
  </g>
</g>;

export const FlatPhone:React.FC<{t:number;phase:'first'|'ask'|'reply';fps:number}>=({t,phase,fps})=>{
 const start=phase==='first'?2.4:phase==='ask'?23.3:27.8;
 const e=enter(t,start,fps),first=phase==='first';
 return <g transform={`translate(540 ${935+(1-e)*140}) rotate(${lerp(e,0,1,-12,-3)}) scale(${.88+.12*e})`} opacity={Math.min(1,e)}>
   <path d="M 245 177 Q 418 101 545 350 V 985 H 270 L 120 501 Z" fill={C.white} stroke={C.ink} strokeWidth="9"/>
   <rect x="-277" y="-473" width="554" height="948" rx="71" fill={C.ink}/><rect x="-258" y="-452" width="516" height="906" rx="56" fill={C.sky}/>
   <rect x="-78" y="-441" width="156" height="32" rx="16" fill={C.ink}/>
   <text x="-211" y="-368" fontSize="22" fill={C.ink}>14:02</text><path d="M 162 -385 h 55 v 21 h -55 z" fill="none" stroke={C.ink} strokeWidth="3"/>
   <circle cy="-287" r="39" fill={C.teal}/><text y="-273" textAnchor="middle" fill={C.white} fontSize="39" fontWeight="700">A</text>
   <text y="-211" textAnchor="middle" fill={C.ink} fontSize="32" fontWeight="700">Anh quản lý</text>
   <g fontSize="31" fill={C.ink}>
     <rect x="-220" y="-160" width="407" height="141" rx="26" fill={C.white}/><text x="-194" y="-109">Chiều gặp anh</text><text x="-194" y="-65">chút nhé.</text>
     {!first&&<g opacity={Math.min(1,enter(t,23.7,fps))}><rect x="-164" y="20" width="387" height="166" rx="26" fill={C.green}/><text x="-139" y="69">Dạ, em cần chuẩn bị</text><text x="-139" y="113">gì không ạ?</text><text x="184" y="160" fontSize="19" textAnchor="end">Đã gửi</text></g>}
     {phase==='reply'&&<g transform={`translate(0 ${(1-enter(t,28,fps))*40})`} opacity={Math.min(1,enter(t,28,fps))}><rect x="-220" y="207" width="425" height="192" rx="27" fill={C.white}/><text x="-195" y="252">Không có gì đâu.</text><text x="-195" y="295">Anh muốn khen bản</text><text x="-195" y="338">thiết kế của em.</text><path d="M 158 360 l 10 11 l 21 -27" fill="none" stroke={C.leaf} strokeWidth="6"/></g>}
   </g>
   <path d="M -51 432 H 51" stroke={C.ink} strokeWidth="8" strokeLinecap="round"/>
   <path d="M 291 189 Q 180 120 199 58 Q 219 31 257 88 L 303 135" fill={C.white} stroke={C.ink} strokeWidth="8"/>
 </g>;
};

const Thought:React.FC<{t:number;at:number;x:number;y:number;kind:number;fps:number}>=({t,at,x,y,kind,fps})=>{
 const e=enter(t,at,fps);if(t<at||t>at+1.65)return null;
 const labels=['Làm sai rồi?','Sếp đang giận?','Mất việc sao?'];
 return <g transform={`translate(${x} ${y+(1-e)*60+Math.sin(t*2+kind)*7}) scale(${.75+.25*e})`} opacity={Math.min(1,e)}>
   <path d="M -188 -110 H 188 Q 217 -110 217 -80 V 96 Q 217 125 185 125 H 42 L 5 166 L 9 125 H -188 Q -217 125 -217 95 V -80 Q -217 -110 -188 -110" fill={C.white} stroke={C.ink} strokeWidth="6"/>
   <g transform="translate(0 -9)" stroke={C.ink} strokeWidth="6" fill="none">
     {kind===0?<><rect x="-60" y="-68" width="120" height="116" rx="9" fill={C.cream}/><path d="M -30 -35 H 26 M -30 -10 H 15"/><path d="M -20 9 L 24 47 M 24 9 L -20 47" stroke={C.red} strokeWidth="10"/></>:kind===1?<><circle cy="-18" r="60" fill={C.blue}/><path d="M -36 -43 L -8 -30 M 36 -43 L 8 -30 M -25 24 Q 0 -5 25 24"/><circle cx="-22" cy="-16" r="4"/><circle cx="22" cy="-16" r="4"/></>:<><path d="M -73 -40 H 73 V 51 H -73 Z" fill={C.wood}/><path d="M -26 -40 V -60 H 26 V -40 M -73 -4 H 73"/><path d="M -23 -22 L 23 24 M 23 -22 L -23 24" stroke={C.red} strokeWidth="10"/></>}
   </g>
   <text y="101" textAnchor="middle" fill={C.ink} fontSize="29" fontWeight="700">{labels[kind]}</text>
 </g>;
};

const FlatDiagram:React.FC<{t:number;fps:number}>=({t,fps})=><g>
  <rect width="1080" height="1920" fill={C.navy}/>
  {Array.from({length:15},(_,i)=><path key={i} d={`M ${i*90} 0 V 1920 M 0 ${i*140} H 1080`} stroke={C.blue} strokeWidth="2" opacity=".11"/>)}
  <g transform={`translate(540 560) scale(${enter(t,15,fps)})`}>
    <rect x="-293" y="-115" width="586" height="230" rx="34" fill={C.white}/>
    <text textAnchor="middle" y="-34" fontSize="27" fill={C.teal}>THÔNG TIN THẬT</text><text textAnchor="middle" y="26" fontSize="44" fill={C.ink} fontWeight="700">“Chiều gặp anh nhé.”</text>
  </g>
  {[0,1,2].map((i)=><g key={i} opacity={Math.min(1,enter(t,15.5+i*.17,fps))}>
    <path d={`M 540 700 Q ${i===0?160:i===1?540:920} 830 ${i===0?180:i===1?540:900} 920`} fill="none" stroke={C.yellow} strokeWidth="6" strokeDasharray="12 12" strokeDashoffset={-t*25}/>
    <circle cx={180+i*360} cy="971" r="64" fill={C.red}/><text x={180+i*360} y="989" textAnchor="middle" fontSize="58" fill={C.white} fontWeight="700">?</text>
  </g>)}
  <text x="540" y="1154" textAnchor="middle" fontSize="43" fontWeight="700" fill={C.white}>Chỗ chưa biết</text>
  <text x="540" y="1220" textAnchor="middle" fontSize="38" fill={C.yellow}>→ nỗi lo tự lấp vào</text>
  <FlatMochi t={t} x={540} y={1490} s={.66} mood="worry" phone/>
</g>;

export const FlatFilm:React.FC<{t:number;fps:number}>=({t,fps})=>{
 const shot=shotAt(t),mood=moodAt(t),phoneShot=shot===1||shot===6||shot===7;
 const x=shot===0?lerp(t,0,2.1,180,545):shot===8?lerp(t,35,37.4,545,760):545;
 const zoom=shot===2?1.45:shot===3?1.12:shot===5?1.55:shot===8?1.18:1;
 return <svg width="1080" height="1920" viewBox="0 0 1080 1920">
   {shot===4?<FlatDiagram t={t} fps={fps}/>:<>
     <g style={phoneShot?{filter:'blur(9px)'}:undefined}>
       <g transform={`translate(540 1140) scale(${zoom}) translate(-545 -1240)`}>
         <FlatRoom t={t} warm={shot>=8}/>
         <FlatMochi t={t} x={x} y={1330} s={1.6} walk={shot===0||shot===8&&t>35} phone={shot!==9} mood={mood} turn={shot===0?.7:0}/>
       </g>
     </g>
     {phoneShot&&<><rect width="1080" height="1920" fill={C.navy} opacity=".18"/><FlatPhone t={t} phase={shot===1?'first':shot===6?'ask':'reply'} fps={fps}/></>}
     {shot===2&&<>
   <Thought t={t} at={5.7} x={310} y={450} kind={0} fps={fps}/><Thought t={t} at={7.5} x={780} y={450} kind={1} fps={fps}/><Thought t={t} at={9} x={310} y={450} kind={2} fps={fps}/>
     </>}
     {shot===3&&<>
       <g transform={`translate(540 580) scale(${enter(t,10.4,fps)})`}>
         <rect x="-464" y="-236" width="928" height="488" rx="25" fill={C.ink}/>
         {Array.from({length:11},(_,i)=><g key={i}><rect x={-441+i*83} y="-220" width="43" height="24" rx="4" fill={C.cream}/><rect x={-441+i*83} y="213" width="43" height="24" rx="4" fill={C.cream}/></g>)}
         <g transform={`translate(${Math.sin(t*.8)*14} 0)`}>
           {[0,1,2].map(i=><g key={i} transform={`translate(${-302+i*302} 0)`}><rect x="-141" y="-177" width="282" height="367" fill={i===0?C.sky:i===1?C.pink:C.wood}/><FlatMochi t={t+i} x={0} y={120} s={.74} mood="worry"/><text textAnchor="middle" y="-120" fill={C.ink} fontSize="30" fontWeight="700">{['SAI RỒI','BỊ MẮNG','MẤT VIỆC'][i]}</text></g>)}
         </g>
       </g>
       <text x="540" y="950" textAnchor="middle" fill={C.ink} fontWeight="700" fontSize="37">Bộ phim trong đầu</text>
     </>}
     {shot===5&&<g opacity={lerp(t,20,20.5,0,1)}>
       {[0,1,2].map(i=><circle key={i} cx="540" cy="918" r={205+((t-20)*65+i*70)%240} fill="none" stroke={C.leaf} strokeWidth="4" opacity={.3-i*.07}/>)}
       <text x="540" y="535" textAnchor="middle" fontSize="40" fontWeight="700" fill={C.leaf}>{t<21.7?'Hít vào…':'Thở ra…'}</text>
     </g>}
     {shot===8&&<g opacity={lerp(t,32.3,33,0,1)}>{Array.from({length:15},(_,i)=><circle key={i} cx={100+(i*193)%890} cy={350+(i*171)%910-Math.sin(t+i)*18} r={4+i%3*3} fill={i%2?C.yellow:C.green} opacity=".6"/>)}</g>}
     {shot===9&&<g>
       <rect width="1080" height="1920" fill={C.cream} opacity=".95"/>
       <FlatMochi t={t} x={540} y={1120} s={1.6} mood="happy"/>
       <text x="540" y="1245" fontSize="48" textAnchor="middle" fontWeight="700" fill={C.ink}>Hỏi lại một câu.</text><text x="540" y="1310" fontSize="44" textAnchor="middle" fill={C.leaf}>Nhẹ đi cả bộ phim.</text>
     </g>}
   </>}
 </svg>;
};
