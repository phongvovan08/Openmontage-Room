import React from 'react';
import {H as C,Emotion,emotionAt,lerp,pop,shotAt} from './theme';

// Original artwork for reference direction 1: inked human puppets and warm sets.
const P={wall:'#EBD8AB',tile:'#F0ECE0',tileLine:'#C6C7BC',floor:'#869AA6',cab:'#68A095',cabLight:'#8FBBA8',orange:'#E39340',shade:'#386F6E',screen:'#619CC6',darkWood:'#795139'};
type Act='walk'|'phone'|'think'|'sit'|'breathe'|'greet'|'point';
const Person:React.FC<{t:number;x:number;y:number;s?:number;act?:Act;emotion?:Emotion;boss?:boolean}>=({t,x,y,s=1,act='phone',emotion='neutral',boss=false})=>{
 const walk=act==='walk',sit=act==='sit',p=t*7.7,w=walk?Math.sin(p):0;
 const bob=walk?-Math.abs(Math.cos(p))*3:Math.sin(t*2)*.6;
 const think=act==='think',holding=act==='phone'||sit,smile=emotion==='smile',fear=emotion==='fear';
 const right=holding?{x:56,y:-150}:think?{x:30,y:-231}:act==='greet'?{x:62,y:-203}:act==='point'?{x:80,y:-163}:{x:45,y:-94+w*16};
 const left=think?{x:-45,y:-156}:act==='breathe'?{x:-9,y:-127}:{x:-46,y:-94-w*16};
 return <g transform={`translate(${x} ${y}) scale(${s})`} stroke={C.ink} strokeWidth="2.7" strokeLinejoin="round" strokeLinecap="round">
   <ellipse cy="4" rx="40" ry="5.5" fill={C.ink} opacity=".13" stroke="none"/>
   {[-1,1].map(side=>{const k=side===1?Math.PI:0,sw=walk?Math.sin(p+k)*19:0,up=walk?-Math.max(0,Math.cos(p+k))*10:0;return <g key={side}>
     <path d={sit?`M ${side*13} -83 L ${side*34} -52 L ${side*38} -4`:`M ${side*13} -83 L ${side*15-sw*.3} -43 L ${side*18+sw} ${up}`} fill="none" strokeWidth="4.1"/>
     <path d={`M ${sit?side*38:side*18+sw} ${sit?-4:up} l ${side*11} 0`} strokeWidth="5.1"/>
   </g>;})}
   <g transform={`translate(0 ${bob}) rotate(${fear?-3:walk?w*.7:0} 0 -136)`}>
     <path d={`M -22 -149 Q -44 -128 ${left.x} ${left.y}`} fill="none" strokeWidth="4"/>
     <path d="M -24 -150 Q -31 -113 -25 -91 Q -21 -76 0 -76 Q 22 -76 25 -91 Q 30 -122 23 -150 Z" fill={boss?C.dark:P.orange}/>
     <path d="M 12 -147 Q 28 -114 14 -80" fill="none" stroke={boss?C.blue:C.wood} strokeWidth="7" opacity=".25"/>
     <path d="M 0 -166 V -151" strokeWidth="7"/>
     <g transform={`rotate(${think?7:fear?-5:0} 0 -211)`}>
       <circle cy="-211" r="44" fill={C.skin}/>
       <path d="M -42 -219 Q -43 -259 -14 -261 Q 16 -275 43 -237 L 41 -219 Q 10 -228 -6 -246 Q -20 -227 -42 -219 Z" fill={boss?'#726C61':C.hair}/>
       <path d="M -34 -240 Q -12 -257 13 -252" fill="none" stroke={C.white} strokeWidth="2" opacity=".21"/>
       <path d="M -17 -242 Q 10 -254 30 -237" fill="none" stroke={C.white} strokeWidth="1.3" opacity=".13"/>
       <ellipse cx="-29" cy="-199" rx="8" ry="4" fill={C.red} stroke="none" opacity=".14"/><ellipse cx="29" cy="-199" rx="8" ry="4" fill={C.red} stroke="none" opacity=".14"/>
       {[-1,1].map(side=><g key={side}>
         {emotion==='calm'||Math.sin(t*1.31)>.993?<path d={`M ${side*15-6} -211 q 6 5 12 0`} fill="none" strokeWidth="2.2"/>:<ellipse cx={side*15+(holding?3:0)} cy="-212" rx={fear?3.4:2.6} ry={fear?5.1:3.5} fill={C.ink} stroke="none"/>}
         <path d={`M ${side*15-7} ${fear?-225-side*3:-224} l 14 ${fear?side*5:smile?side*-2:0}`} fill="none" strokeWidth="2.2"/>
       </g>)}
       <path d={fear?'M -8 -190 Q 0 -200 8 -190':smile?'M -11 -195 Q 0 -180 11 -195':emotion==='calm'?'M -4 -192 Q 0 -189 4 -192':'M -6 -193 Q 2 -190 10 -194'} fill={smile?C.white:'none'} strokeWidth="2"/>
     </g>
     {boss&&<><path d="M -9 -151 L 0 -141 L 9 -151" fill={C.white}/><path d="M 0 -141 L -5 -119 L 1 -109 L 6 -120 Z" fill={C.red} strokeWidth="1"/></>}
     <path d={`M 23 -148 Q 43 -119 ${right.x} ${right.y}`} fill="none" strokeWidth="4"/>
     <circle cx={left.x} cy={left.y} r="3.2" fill={C.ink}/><circle cx={right.x} cy={right.y} r="3.2" fill={C.ink}/>
     {holding&&<g transform={`translate(${right.x+1} ${right.y-13}) rotate(-12)`}><rect x="-8" y="-20" width="22" height="41" rx="4" fill={C.dark}/><rect x="-5" y="-14" width="16" height="27" rx="1" fill={C.blue} stroke="none"/><path d="M 2 17 h 3" stroke={C.white} strokeWidth="1.2"/><path d="M -10 7 l 8 2" strokeWidth="2.5"/></g>}
   </g>
 </g>;
};

const Room:React.FC<{t:number;mode?:'home'|'office'}>=({t,mode='home'})=><g>
 <defs>
  <linearGradient id="e-wall" x2="0" y2="1"><stop stopColor={P.wall}/><stop offset="1" stopColor={C.cream}/></linearGradient>
  <linearGradient id="e-cab" x2="1" y2=".8"><stop stopColor={P.cabLight}/><stop offset="1" stopColor={P.cab}/></linearGradient>
  <linearGradient id="e-floor" x2="0" y2="1"><stop stopColor="#A9B8B8"/><stop offset="1" stopColor={P.floor}/></linearGradient>
  <linearGradient id="e-window" x2="0" y2="1"><stop stopColor="#91BFC8"/><stop offset="1" stopColor="#DFE5C5"/></linearGradient>
  <radialGradient id="e-sun"><stop stopColor={C.white} stopOpacity=".55"/><stop offset="1" stopColor={C.white} stopOpacity="0"/></radialGradient>
 </defs>
 <rect x="-200" y="-200" width="1000" height="1400" fill="url(#e-wall)"/>
 <path d="M 0 581 H 540 V 960 H 0 Z" fill="url(#e-floor)"/>
 <path d="M 0 581 H 540 M 0 653 H 540 M 0 754 H 540 M 0 904 H 540 M 91 581 L -180 960 M 221 581 L 171 960 M 349 581 L 511 960 M 478 581 L 840 960" fill="none" stroke="#506D7E" strokeWidth=".8" opacity=".46"/>
 <rect x="273" y="140" width="235" height="276" rx="2" fill={C.wood} stroke={C.ink} strokeWidth="2"/>
 <rect x="281" y="148" width="219" height="260" fill="url(#e-window)"/>
 <path d="M 294 153 L 352 153 L 284 407 H 281 V 197 Z" fill={C.white} opacity=".18"/>
 <path d="M 390 149 V 407 M 282 281 H 500" stroke={C.wood} strokeWidth="4"/>
 <path d="M 282 406 Q 324 355 368 393 Q 410 358 500 389 V 408 Z" fill="#83B98F" opacity=".9"/>
 <path d="M 513 139 V 418" stroke={C.ink} strokeWidth="2"/>
 <path d="M 486 140 Q 458 270 486 414 H 533 V 140 Z" fill={P.cab} stroke={C.ink} strokeWidth="1.4"/>
 <path d="M 502 146 Q 483 270 502 407 M 517 147 Q 504 272 518 407" fill="none" stroke={P.shade} opacity=".55" strokeWidth="2"/>
 {mode==='home'?<>
  {[0,1,2].map(i=><g key={i} transform={`translate(${i*85-15} 120)`}><rect width="80" height="200" rx="4" fill="url(#e-cab)" stroke={C.ink} strokeWidth="2.1"/><rect x="8" y="9" width="64" height="181" rx="4" fill="none" stroke={P.shade} strokeWidth="1"/><circle cx="64" cy="167" r="3.5" fill={C.yellow} stroke={C.ink} strokeWidth="1"/></g>)}
  <rect x="0" y="376" width="265" height="105" fill={P.tile}/>
  {Array.from({length:7},(_,i)=><path key={i} d={`M ${i*42} 376 V 480 M 0 ${376+i*21} H 265`} fill="none" stroke={P.tileLine} strokeWidth=".8"/>)}
  <path d="M 0 476 H 270 L 283 493 H 0 Z" fill={P.darkWood} stroke={C.ink} strokeWidth="2"/>
  {[0,1,2].map(i=><g key={i}><rect x={i*89-3} y="494" width="84" height="135" fill="url(#e-cab)" stroke={C.ink} strokeWidth="2"/><path d={`M ${i*89+24} 511 h 27`} stroke={C.yellow} strokeWidth="3"/></g>)}
  <path d="M 32 476 V 445 Q 33 430 47 430 Q 59 430 59 441" fill="none" stroke={C.ink} strokeWidth="4"/><ellipse cx="66" cy="477" rx="51" ry="7" fill={P.shade}/>
  <rect x="178" y="444" width="29" height="31" rx="3" fill={C.red} stroke={C.ink} strokeWidth="1.7"/><rect x="183" y="435" width="19" height="9" fill={C.dark} stroke={C.ink}/>
  <path d="M 217 476 L 211 452 H 250 L 243 476 Z" fill={C.wood} stroke={C.ink} strokeWidth="1.4"/><path d="M 230 452 V 423 M 230 442 Q 205 435 210 421 Q 229 422 230 442 M 230 435 Q 255 413 255 428 Q 247 442 230 435" fill={P.cab} stroke={P.shade} strokeWidth="1.4"/>
 </>:<>
  <rect x="12" y="193" width="213" height="172" rx="2" fill={C.wood} stroke={C.ink} strokeWidth="2"/><rect x="22" y="203" width="193" height="152" fill="#C69D6E"/>
  {[0,1,2,3,4].map(i=><g key={i} transform={`translate(${40+i%3*57} ${226+Math.floor(i/3)*65}) rotate(${i%2?6:-5})`}><rect width="39" height="47" fill={i%2?C.white:'#D1E4CF'}/><path d="M 6 12 H 30 M 6 20 H 27 M 6 28 H 20" stroke={P.shade} strokeWidth="1"/><circle cx="20" cy="4" r="2" fill={C.red}/></g>)}
  <g transform="translate(94 453)"><rect x="-29" y="-43" width="58" height="43" fill={C.blue} stroke={C.ink} strokeWidth="2"/><path d="M 0 0 V 23 M -20 23 H 20" stroke={C.ink} strokeWidth="4"/></g>
 </>}
 <g transform="translate(399 600)" stroke={C.ink} strokeWidth="2"><path d="M -38 3 L -26 -110 H 24 L 35 3" fill={P.shade}/><path d="M -49 -19 H 47 V -7 H -49 Z" fill={P.cab}/><path d="M -35 -7 L -44 80 M 35 -7 L 44 80" fill="none" strokeWidth="3"/></g>
 <g transform="translate(399 520)" stroke={C.ink} strokeWidth="2"><path d="M -77 -3 H 102 L 136 25 H -57 Z" fill="#CFAD7B"/><path d="M -57 25 H 136 V 36 H -57 Z" fill={C.wood}/><path d="M -44 36 L -44 147 M 116 36 L 117 147" strokeWidth="5"/><path d="M -12 -3 L -20 -70 H 58 L 69 -3 Z" fill={C.dark}/><path d="M -13 -60 H 52 L 60 -13 H -7 Z" fill={P.screen} strokeWidth="1"/><path d="M -5 -51 H 43 M -2 -42 H 29 M 0 -33 H 48" stroke={C.white} strokeWidth="2" opacity=".65"/><path d="M -20 0 H 77 L 89 7 H -16 Z" fill="#9DABB2"/><rect x="91" y="-25" width="22" height="25" rx="2" fill={C.white}/><path d="M 113 -22 q 17 0 10 13 l -10 1" fill="none"/></g>
 <ellipse cx="438" cy="288" rx="211" ry="410" fill="url(#e-sun)" opacity=".44"/>
 <path d="M 231 -2 V 84" stroke={C.ink} strokeWidth="3"/><path d="M 203 109 Q 205 67 231 67 Q 257 67 260 109 Z" fill="#D4C9A8" stroke={C.ink} strokeWidth="2"/><ellipse cx="231" cy="109" rx="28" ry="6" fill={C.white} stroke={C.ink} strokeWidth="1.5"/>
</g>;

const Chat:React.FC<{t:number;phase:'first'|'ask'|'reply';fps:number}>=({t,phase,fps})=>{
 const e=pop(t,phase==='first'?2.4:phase==='ask'?23.3:27.8,fps);
 return <g transform={`translate(270 ${442+(1-e)*45}) rotate(-7) scale(${.94+.06*e})`} stroke={C.ink} strokeWidth="2.7" strokeLinejoin="round">
  <path d="M 124 90 L 221 171 L 306 407 H 144 L 68 192" fill={C.skin}/><path d="M 152 227 L 270 167 L 337 384 H 183 Z" fill={P.orange}/>
  <rect x="-129" y="-231" width="258" height="454" rx="28" fill={C.dark}/><rect x="-119" y="-218" width="238" height="430" rx="22" fill="#E1E6DE" strokeWidth="1"/>
  <rect x="-35" y="-211" width="70" height="13" rx="6" fill={C.dark} stroke="none"/>
  <circle cy="-167" r="16" fill={P.cab} stroke="none"/><text y="-161" textAnchor="middle" fontSize="17" fill={C.white} stroke="none" fontWeight="700">A</text><text y="-131" textAnchor="middle" fontSize="15" fontWeight="700" fill={C.ink} stroke="none">Anh quản lý</text>
  <g stroke="none" fontSize="15" fill={C.ink}><rect x="-103" y="-109" width="192" height="69" rx="11" fill={C.white}/><text x="-91" y="-84">Chiều gặp anh</text><text x="-91" y="-61">chút nhé.</text>
   {phase!=='first'&&<><rect x="-67" y="-19" width="173" height="80" rx="11" fill="#9BCCAF"/><text x="-55" y="7">Dạ, em cần chuẩn bị</text><text x="-55" y="31">gì không ạ?</text><text x="89" y="51" textAnchor="end" fontSize="9">Đã gửi</text></>}
   {phase==='reply'&&<g opacity={Math.min(1,pop(t,28.0,fps))}><rect x="-103" y="78" width="203" height="100" rx="11" fill={C.white}/><text x="-91" y="105">Không có gì đâu.</text><text x="-91" y="129">Anh muốn khen bản</text><text x="-91" y="153">thiết kế của em.</text></g>}
  </g><path d="M -21 200 H 21" strokeWidth="3"/>
  <path d="M 137 120 Q 111 91 103 58 Q 103 35 116 44 L 150 82" fill={C.skin}/>
 </g>;
};

const Cloud:React.FC<{t:number;fps:number;kind:number}>=({t,fps,kind})=>{
 const start=[5.7,7.4,8.9][kind],e=pop(t,start,fps);if(t<start||t>start+1.7)return null;
 return <g transform={`translate(${kind===1?398:159} ${273+(1-e)*25}) scale(${.8+.2*e})`} opacity={Math.min(1,e)}>
  <path d="M -92 -28 Q -118 -62 -79 -75 Q -71 -110 -39 -91 Q -7 -126 18 -96 Q 60 -112 68 -79 Q 112 -80 106 -44 Q 129 -12 92 2 Q 57 29 29 8 Q -10 34 -35 10 Q -86 31 -90 1 Q -116 -8 -92 -28" fill={C.white} stroke={C.ink} strokeWidth="1.9"/>
  <circle cx={kind===1?-52:52} cy="40" r="10" fill={C.white} stroke={C.ink} strokeWidth="1.6"/><circle cx={kind===1?-69:68} cy="64" r="5" fill={C.white} stroke={C.ink} strokeWidth="1.3"/>
  <text textAnchor="middle" y="-38" fontSize="20" fontWeight="700" fill={C.ink}>{['Mình làm sai?','Sếp đang giận?','Mất việc sao?'][kind]}</text><path d="M -16 -11 l 32 27 m 0 -27 l -32 27" stroke={C.red} strokeWidth="5"/>
 </g>;
};

const Mind:React.FC<{t:number;fps:number}>=({t,fps})=><g>
 <defs><radialGradient id="e-mind"><stop stopColor="#243F64"/><stop offset="1" stopColor="#101B2D"/></radialGradient></defs><rect width="540" height="960" fill="url(#e-mind)"/>
 {Array.from({length:24},(_,i)=>{const x=35+i*193%470,y=80+i*173%780;return <g key={i} opacity=".17"><path d={`M ${x} ${y} l ${i%2?65:-46} 62 l 30 38 M ${x} ${y} l 37 -75`} fill="none" stroke={C.blue} strokeWidth=".8"/><circle cx={x} cy={y} r="3" fill={C.blue}/></g>;})}
 <g transform={`translate(270 317) scale(${pop(t,15,fps)})`}><path d="M -166 -60 H 166 V 36 H -113 L -153 73 L -145 36 H -166 Z" fill="#18354A" stroke={C.blue} strokeWidth="1.5"/><text y="-21" textAnchor="middle" fontSize="13" fill={C.blue}>ĐIỀU THẬT SỰ ĐƯỢC NÓI</text><text y="11" textAnchor="middle" fontSize="22" fontWeight="700" fill={C.white}>“Chiều gặp anh nhé.”</text></g>
 <path d="M 270 405 V 468" stroke={C.blue} strokeWidth="1.8" strokeDasharray="4 7" strokeDashoffset={-t*9}/>
 <circle cx="270" cy="518" r="47" fill="#203A55" stroke={C.blue}/><text x="270" y="535" textAnchor="middle" fontSize="54" fill={C.yellow}>?</text>
 {[0,1,2].map(i=><g key={i} opacity={Math.min(1,pop(t,15.7+i*.2,fps))}><path d={`M 270 564 Q ${110+i*160} 596 ${110+i*160} 628`} fill="none" stroke={C.blue} strokeWidth="1.5"/><circle cx={110+i*160} cy="665" r="34" fill="#27435B" stroke={C.blue}/><text x={110+i*160} y="672" textAnchor="middle" fontSize="13" fill={C.white}>{['Làm sai','Bị mắng','Mất việc'][i]}</text></g>)}
 <text x="270" y="754" textAnchor="middle" fill={C.yellow} fontSize="19">Khoảng trống → suy diễn</text>
</g>;

export const HumanExplainer:React.FC<{t:number;fps:number}>=({t,fps})=>{
 const shot=shotAt(t),emotion=emotionAt(t);
 if(shot===4)return <svg width="1080" height="1920" viewBox="0 0 540 960"><Mind t={t} fps={fps}/></svg>;
 const close=shot===0?1.3:shot===2?1.35:shot===5?1.32:shot===8?1.08:1;
 return <svg width="1080" height="1920" viewBox="0 0 540 960">
  <g style={shot===1||shot===7?{filter:'blur(5px)'}:undefined} transform={`translate(270 500) scale(${close}) translate(-270 -500)`}>
   <Room t={t} mode={shot>=6?'office':'home'}/>
   {shot===0?<Person t={t} x={lerp(t,0,2.3,190,262)} y={706} s={1.38} act={t<1.55?'walk':'phone'}/>:<Person t={t} x={shot===8?lerp(t,35,37.4,250,324):255} y={706} s={1.38} act={shot===2?'think':shot===5?'breathe':shot===8&&t>35?'walk':shot===9?'greet':'phone'} emotion={emotion}/>}
  </g>
  {(shot===1||shot===7)&&<Chat t={t} phase={shot===1?'first':'reply'} fps={fps}/>}
  {shot===2&&[0,1,2].map(i=><Cloud key={i} t={t} fps={fps} kind={i}/>)}
  {shot===3&&<>
   <rect width="540" height="960" fill={C.dark} opacity=".78"/>
   {[0,1,2].map(i=>{const e=pop(t,10.4+i*.22,fps);return <g key={i} transform={`translate(${92+i*180} ${403+(1-e)*35}) scale(${.9+.1*e})`} opacity={Math.min(1,e)}>
    <rect x="-81" y="-146" width="162" height="329" rx="9" fill={i===0?'#D9DFD3':i===1?'#E6C4A6':'#B8C7C9'} stroke={C.ink} strokeWidth="2"/>
    <path d="M -81 90 H 81" stroke={C.ink} opacity=".3"/>
    <Person t={t+i} x={0} y={132} s={.83} act={i===1?'think':'phone'} emotion="fear"/>
    <text y="-108" textAnchor="middle" fill={C.ink} fontSize="14" fontWeight="700">{['LÀM SAI','BỊ TRÁCH','BỊ CHO NGHỈ'][i]}</text>
   </g>;})}
   <text x="270" y="653" textAnchor="middle" fill={C.white} fontSize="21">Cả một bộ phim chưa xảy ra</text>
  </>}
  {shot===5&&<>
   {[0,1,2].map(i=><path key={i} d={`M ${362+i*12} ${415+i*12} q 39 -12 53 4`} fill="none" stroke={C.white} strokeWidth="2.2" opacity={lerp(t,20,22.3,.65,0)}/>)}
  </>}
  {shot===6&&<g transform={`translate(265 ${242+(1-pop(t,23.3,fps))*35})`} opacity={Math.min(1,pop(t,23.3,fps))}>
   <path d="M -195 -47 H 195 Q 208 -47 208 -32 V 39 Q 208 52 192 52 H 37 L 9 84 V 52 H -195 Q -208 52 -208 38 V -32 Q -208 -47 -195 -47" fill={C.white} stroke={C.ink} strokeWidth="1.8"/>
   <text y="-8" textAnchor="middle" fontSize="21" fill={C.ink}>Dạ, em cần chuẩn bị</text><text y="23" textAnchor="middle" fontSize="21" fill={C.ink}>gì không ạ?</text>
   {t>25.5&&<text y="118" textAnchor="middle" fontSize="13" fill={P.shade}>Đã gửi ✓</text>}
  </g>}
  {shot===8&&<g transform={`translate(${lerp(t,32.3,34.3,595,435)} 706)`}>
    <Person t={t} x={0} y={0} s={1.15} act="point" emotion="smile" boss/>
    <g transform="translate(-67 -184) rotate(-8)"><rect x="-36" y="-33" width="70" height="87" fill={C.white} stroke={C.ink} strokeWidth="1.4"/><path d="M -27 -20 H 23 M -27 -10 H 16" stroke={C.blue} strokeWidth="2"/><path d="M -17 16 l 10 11 l 25 -28" fill="none" stroke={P.cab} strokeWidth="4"/></g>
  </g>}
  {shot===9&&<>
   <rect width="540" height="960" fill="#FFEDD0" opacity=".38"/>
   <text x="270" y="239" textAnchor="middle" fontSize="24" fontWeight="700" fill={C.ink}>Hỏi lại một câu.</text><text x="270" y="275" textAnchor="middle" fontSize="22" fill={P.shade}>Nhẹ đi cả bộ phim.</text>
  </>}
 </svg>;
};
