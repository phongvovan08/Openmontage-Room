import React from 'react';
import {H as C,Emotion,emotionAt,lerp,pop,shotAt} from './theme';

const P={ink:'#353040',purple:'#9B86C7',purpleShade:'#7764A1',sky:'#BBD3E6',light:'#F4E3B9',far:'#B5BDCC',city:'#9DAABD',bark:'#9E8471',leaf:'#99BE73',leafDark:'#71945C',walk:'#D4CCC0',road:'#737782',night:'#191C3A',nightMid:'#3C3D65',pink:'#E9A9BF',paper:'#F5F0D7'};

// A separate human design and rig for the story world, never the first film's art.
const Walker:React.FC<{t:number;x:number;y:number;s?:number;walk?:boolean;sit?:boolean;phone?:boolean;emotion?:Emotion;extra?:boolean}>=({t,x,y,s=1,walk=false,sit=false,phone=true,emotion='neutral',extra=false})=>{
 const phase=t*8,w=walk?Math.sin(phase):0,bob=walk?-Math.abs(Math.cos(phase))*2.8:Math.sin(t*1.8)*.45;
 const worry=emotion==='fear',smile=emotion==='smile',shirt=extra?'#6FAEA0':P.purple;
 return <g transform={`translate(${x} ${y}) scale(${s})`} stroke={P.ink} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
  <ellipse cy="3" rx="32" ry="5" fill={P.ink} opacity=".14" stroke="none"/>
  {[-1,1].map(side=>{const swing=walk?Math.sin(phase+(side===1?Math.PI:0))*17:0,up=walk?-Math.max(0,Math.cos(phase+(side===1?Math.PI:0)))*9:0;return <g key={side}><path d={sit?`M ${side*9} -79 L ${side*29} -59 L ${side*34} -7`:`M ${side*10} -79 L ${side*11-swing*.4} -40 L ${side*14+swing} ${up}`} fill="none" strokeWidth="3.2"/><path d={`M ${sit?side*34:side*14+swing} ${sit?-7:up} h ${side*9}`} strokeWidth="4"/></g>;})}
  <g transform={`translate(0 ${bob}) rotate(${worry?-4:walk?w*.6:0} 0 -143)`}>
   <path d={`M -18 -151 L -34 -125 L -34 ${smile?-161:-96-w*12}`} fill="none" strokeWidth="3.3"/>
   <path d="M -22 -151 Q -30 -117 -24 -90 Q -24 -76 0 -77 Q 25 -76 25 -91 Q 30 -124 22 -150 Z" fill={shirt}/>
   <path d="M -10 -147 V -108 Q -10 -102 4 -103" fill="none" stroke={P.purpleShade} strokeWidth="1.6"/><path d="M 12 -142 Q 26 -117 15 -83" stroke={P.purpleShade} strokeWidth="6" fill="none" opacity=".3"/>
   <path d="M 0 -173 V -151" strokeWidth="5"/>
   <g transform={`rotate(${worry?-7:0} 0 -207)`}>
    <circle cy="-207" r="38" fill={C.skin}/>
    <path d="M -38 -215 L -39 -237 L -23 -250 L -11 -246 L 6 -254 L 18 -243 L 35 -239 L 40 -218 L 11 -229 L -5 -224 L -19 -233 Z" fill={extra?'#324D5C':'#55463E'}/>
    <path d="M -24 -242 L -11 -238 L 5 -246 L 17 -238" stroke={C.white} strokeWidth="1" opacity=".15" fill="none"/>
    {[-1,1].map(side=><g key={side}>{emotion==='calm'||Math.sin(t*1.67)>.99?<path d={`M ${side*13-5} -207 q 5 5 10 0`} fill="none"/>:<ellipse cx={side*13+(phone?2:0)} cy="-208" rx="2.6" ry={worry?4:3.5} fill={P.ink} stroke="none"/>}{worry&&<path d={`M ${side*13-6} ${-220-side*2} l 12 ${side*4}`} fill="none" strokeWidth="1.6"/>}</g>)}
    <path d={worry?'M -7 -188 Q 0 -195 7 -188':smile?'M -9 -191 Q 0 -179 10 -191':'M -4 -190 q 5 4 11 -1'} fill="none" strokeWidth="1.7"/>
   </g>
   <path d={phone?'M 20 -149 L 39 -124 L 49 -161':`M 21 -148 L 35 -125 L 36 ${smile?-166:-96+w*12}`} fill="none" strokeWidth="3.3"/>
   {phone&&<g transform={`translate(51 -174) rotate(6)`}><rect x="-8" y="-19" width="18" height="35" rx="3" fill="#2D3343"/><rect x="-5" y="-14" width="12" height="23" fill="#B8D6DE" stroke="none"/><circle cx="1" cy="12" r="1" fill={C.white} stroke="none"/><path d="M -11 6 H -4" strokeWidth="2.5"/></g>}
   {!extra&&<path d="M -16 -148 L 20 -103" stroke={P.ink} strokeWidth="2"/>}
   {!extra&&<rect x="8" y="-111" width="20" height="26" rx="3" fill={P.purpleShade} strokeWidth="1.3"/>}
  </g>
 </g>;
};

const Tree:React.FC<{x:number;y:number;s?:number;t:number;pink?:boolean;night?:boolean}>=({x,y,s=1,t,pink=false,night=false})=><g transform={`translate(${x} ${y}) scale(${s*1.55})`}>
 <path d="M -5 1 L -3 -259 L 5 -260 L 9 1" fill={P.bark} stroke={P.ink} strokeWidth=".8"/><path d="M 1 -205 L -25 -252 M 2 -226 L 27 -266" stroke={P.bark} strokeWidth="4"/>
 <g transform={`translate(0 -100) rotate(${Math.sin(t*.8+x)*1.1} 0 -150)`} stroke={night?'#34425A':pink?'#B789A4':P.leafDark} strokeWidth=".9">
  {[[-25,-186,31],[-48,-160,29],[-20,-145,38],[16,-160,40],[44,-185,30],[3,-207,34],[37,-143,28]].map(([cx,cy,r],i)=><circle key={i} cx={cx} cy={cy} r={r} fill={pink?`url(#s-petal)`:'url(#s-leaf)'} opacity={night?.65:1}/>)}
  <path d="M -41 -182 Q -55 -159 -36 -148 M -5 -221 Q 18 -237 29 -214" fill="none" stroke={C.white} opacity=".2" strokeWidth="3"/>
 </g>
</g>;

const City:React.FC<{t:number;pan?:number;night?:boolean}>=({t,pan=0,night=false})=><g>
 <defs>
  <linearGradient id="s-sky" x2="0" y2="1"><stop stopColor={night?P.night:P.sky}/><stop offset=".75" stopColor={night?P.nightMid:'#E9E2CB'}/><stop offset="1" stopColor={night?'#B67B99':P.light}/></linearGradient>
  <linearGradient id="s-leaf" x1=".3" y1="0" x2=".7" y2="1"><stop stopColor="#B4D18E"/><stop offset="1" stopColor={P.leafDark}/></linearGradient>
  <radialGradient id="s-petal" cx=".3" cy=".3"><stop stopColor="#F4CCDC"/><stop offset="1" stopColor="#D98EB4"/></radialGradient>
  <linearGradient id="s-sidewalk" x2="0" y2="1"><stop stopColor="#E0D9CA"/><stop offset="1" stopColor="#AFA99F"/></linearGradient>
  <radialGradient id="s-glow"><stop stopColor={P.light} stopOpacity=".55"/><stop offset="1" stopColor={P.light} stopOpacity="0"/></radialGradient>
 </defs>
 <g transform="translate(0 90)"><rect x="-200" y="-200" width="1000" height="1400" fill="url(#s-sky)"/>
 {night?<><circle cx="377" cy="164" r="29" fill="#F1E8C9"/><circle cx="386" cy="156" r="26" fill={P.night}/>{Array.from({length:24},(_,i)=><circle key={i} cx={30+i*127%490} cy={38+i*71%260} r={.5+i%2*.4} fill={C.white} opacity=".45"/>)}</>:<><path d="M 51 142 Q 43 127 63 126 Q 68 106 84 122 Q 104 116 107 135 H 51 M 350 237 Q 344 224 357 221 Q 364 205 376 219 Q 389 210 399 224 Q 420 221 419 237 Z" fill={C.white} opacity=".65"/></>}
 <g transform={`translate(${-pan*.2} 0)`}>
  {Array.from({length:13},(_,i)=>{const height=110+i*43%170;return <g key={i}><path d={`M ${-110+i*66} 494 V ${494-height} h 50 V 494 Z`} fill={night?'#8584A0':P.far} opacity={night?.28:.42}/>{night&&[0,1,2,3].map(j=><path key={j} d={`M ${-101+i*66} ${504-height+j*27} h 7 m 14 0 h 7`} stroke={P.light} strokeWidth="6" opacity=".26"/>)}</g>;})}
 </g>
 <g transform={`translate(${-pan*.48} 0)`}>
  {Array.from({length:7},(_,i)=><g key={i} transform={`translate(${-80+i*144} ${367+i%3*26})`}>
   <rect width="120" height="176" fill={night?'#62668B':P.city} opacity={night?.45:.46}/><path d="M -3 0 H 124" stroke={night?'#9693B0':'#BAC4CE'} strokeWidth="4"/>
   {Array.from({length:12},(_,j)=><rect key={j} x={11+j%4*27} y={17+Math.floor(j/4)*43} width="12" height="23" rx="1" fill={night?P.light:'#DAE1DD'} opacity={night?.45:.48}/>)}
  </g>)}
 </g>
 <rect y="522" width="540" height="80" fill={night?'#514E66':'#A9BE8D'}/>
 <g transform={`translate(${-pan*.75} 0)`}>
  <path d="M -200 577 H 1000 M -200 555 H 1000" fill="none" stroke={night?'#232A38':'#5B6259'} strokeWidth="2"/>
  {Array.from({length:50},(_,i)=><path key={i} d={`M ${-180+i*24} 547 V 591`} stroke={night?'#232A38':'#5B6259'} strokeWidth="1.4"/>)}
  {[0,1,2,3,4].map(i=><Tree key={i} x={-80+i*210} y={590} s={1.0+(i%2)*.12} t={t} pink={night&&i===3} night={night}/>)}
 </g>
 <path d="M 0 593 H 540 V 664 H 0 Z" fill={night?'#454860':P.road}/><path d="M 0 625 H 540" stroke="#D9D5C7" strokeWidth="2" strokeDasharray="46 33"/>
 <rect y="664" width="540" height="296" fill="url(#s-sidewalk)"/>
 <path d="M 0 664 H 540 M 0 691 H 540 M 0 735 H 540 M 0 795 H 540 M 0 879 H 540 M 20 664 L -120 960 M 135 664 L 79 960 M 250 664 L 279 960 M 365 664 L 477 960 M 480 664 L 677 960" stroke="#8E9292" strokeWidth=".65" opacity=".6"/>
 <g transform={`translate(${-pan} 0)`}>
  <g transform="translate(431 426)" stroke={P.ink} strokeWidth="1.6"><path d="M -64 -81 H 64 V 241 H -64 Z" fill={night?'#47506D':'#A8C8D4'}/><rect x="-54" y="-67" width="108" height="300" fill={night?'#2C3550':'#446782'}/><path d="M -47 -63 L -16 -63 L -42 223 H -47 Z" fill={C.white} opacity=".12"/><path d="M -65 -85 L -74 -107 H 74 L 65 -85 Z" fill="#C5D9D9"/><text y="-91" textAnchor="middle" fontSize="12" fontWeight="700" fill="#345068" stroke="none">TRẠM XE</text><path d="M -74 244 H 75 L 84 255 H -83 Z" fill="#93A6B0"/></g>
  <g transform="translate(100 690)" stroke={P.ink} strokeWidth="1.8"><path d="M -67 -93 H 68 M -67 -69 H 68 M -67 -45 H 68" stroke={C.wood} strokeWidth="15"/><path d="M -79 -21 H 81" stroke={C.wood} strokeWidth="12"/><path d="M -57 -103 V 41 M 57 -103 V 41" strokeWidth="3"/></g>
  <g transform="translate(510 685)" stroke={P.ink} strokeWidth="1.3"><rect x="-11" y="-55" width="22" height="55" rx="2" fill="#AB5953"/><path d="M -15 -52 H 15 M -9 -57 H 9 M -9 -33 H 9" strokeWidth="4"/><path d="M -20 -30 H 20" strokeWidth="5"/></g>
 </g>
 {night&&<rect width="540" height="960" fill={P.night} opacity=".20"/>}
 {!night&&<circle cx="404" cy="245" r="390" fill="url(#s-glow)" opacity=".38"/>}</g>
</g>;

const Phone:React.FC<{t:number;fps:number;reply?:boolean}>=({t,fps,reply=false})=>{
 const e=pop(t,reply?27.8:2.4,fps);
 return <g transform={`translate(270 ${437+(1-e)*30}) rotate(${reply?5:-5}) scale(${.96+.04*e})`} stroke={P.ink} strokeWidth="2.4">
  <path d="M 116 49 Q 203 124 249 354 L 266 480 H 126 L 73 178" fill={C.skin}/><path d="M 124 222 L 219 171 L 278 409 H 155 Z" fill={P.purple}/>
  <rect x="-124" y="-219" width="248" height="442" rx="26" fill="#303347"/><rect x="-115" y="-208" width="230" height="419" rx="18" fill={P.paper} strokeWidth="1"/><path d="M -34 -196 H 34" stroke="#41475E" strokeWidth="4" strokeLinecap="round"/>
  <g fill={P.ink} stroke="none"><circle cy="-159" r="16" fill="#A9B6A7"/><text y="-154" textAnchor="middle" fill={C.white} fontSize="15" fontWeight="700">A</text><text textAnchor="middle" y="-123" fontSize="15" fontWeight="700">Anh quản lý</text>
   <rect x="-101" y="-105" width="188" height="70" rx="12" fill="#D8DDEE"/><text x="-91" y="-79" fontSize="15">Chiều gặp anh</text><text x="-91" y="-55" fontSize="15">chút nhé.</text>
   {reply&&<><rect x="-65" y="-13" width="166" height="73" rx="12" fill="#B6C7AC"/><text x="-54" y="13" fontSize="14">Dạ, em cần chuẩn bị</text><text x="-54" y="37" fontSize="14">gì không ạ?</text><g opacity={Math.min(1,pop(t,28.1,fps))}><rect x="-101" y="79" width="201" height="102" rx="12" fill="#D8DDEE"/><text x="-90" y="106" fontSize="14.5">Không có gì đâu.</text><text x="-90" y="131" fontSize="14.5">Anh muốn khen bản</text><text x="-90" y="155" fontSize="14.5">thiết kế của em.</text></g></>}
  </g><path d="M -27 199 H 27" strokeWidth="3"/><path d="M 132 109 Q 103 84 97 55 Q 93 38 105 40 L 143 77" fill={C.skin}/>
 </g>;
};

const Blueprint:React.FC<{t:number;fps:number}>=({t,fps})=> <g>
 <defs><radialGradient id="s-blueprint"><stop stopColor="#244B73"/><stop offset="1" stopColor="#15334E"/></radialGradient></defs><rect width="540" height="960" fill="url(#s-blueprint)"/>
 {Array.from({length:32},(_,i)=><path key={i} d={`M ${i*20} 0 V 960 M 0 ${i*32} H 540`} stroke="#5484A1" strokeWidth=".35" opacity=".26"/>)}
 <g transform="translate(270 270)" fill="none" stroke="#9BCBDA" strokeWidth="1.2"><path d="M -178 -48 H 178 V 45 H -126 L -165 79 V 45 H -178 Z"/><path d="M -152 -20 H 109 M -152 2 H 52"/><text y="-82" textAnchor="middle" fontSize="17" fontWeight="700" stroke="none" fill="#CBE5EA">THÔNG TIN NHẬN ĐƯỢC</text></g>
 <path d="M 270 359 V 424" stroke="#9BCBDA" strokeWidth="1.3" strokeDasharray="4 7" strokeDashoffset={-t*12}/>
 <g transform="translate(270 484)" fill="none" stroke="#9BCBDA" strokeWidth="1.5"><path d="M -61 -7 Q -71 -53 -35 -60 Q -12 -84 12 -61 Q 61 -68 65 -25 Q 83 15 43 43 Q 19 67 -6 49 Q -59 61 -61 16 Q -83 7 -61 -7 Z"/><path d="M -17 -63 Q 2 -32 -15 -15 Q -47 -15 -34 19 Q -9 26 -9 51 M 11 -61 Q -1 -30 24 -23 Q 58 -31 48 0 Q 19 7 25 41"/><text y="16" textAnchor="middle" fill={P.light} stroke="none" fontSize="45">?</text></g>
 {[0,1,2].map(i=><g key={i} opacity={Math.min(1,pop(t,15.7+i*.23,fps))}><path d={`M 270 556 Q ${95+i*175} 585 ${95+i*175} 640`} fill="none" stroke="#9BCBDA" strokeWidth="1.2"/><rect x={59+i*175} y="641" width="72" height="111" fill="none" stroke="#9BCBDA" strokeWidth="1"/><Walker t={t} x={95+i*175} y={734} s={.30} emotion="fear"/><path d={`M ${74+i*175} 661 l 42 43 m 0 -43 l -42 43`} stroke="#D98D99" strokeWidth="2.7"/></g>)}
 <path d="M 32 799 H 508 V 844 H 32 Z M 32 821 H 508 M 332 799 V 844" fill="none" stroke="#9BCBDA" strokeWidth=".6"/><text x="43" y="814" fontSize="9" fill="#9BCBDA">THOUGHT MAP / 01</text><text x="43" y="837" fontSize="10" fill="#CBE5EA">CHƯA BIẾT ≠ ĐIỀU XẤU SẼ ĐẾN</text>
</g>;

export const HumanStory:React.FC<{t:number;fps:number}>=({t,fps})=>{
 const shot=shotAt(t),emotion=emotionAt(t),night=shot>=2&&shot<=6;
 const pan=shot===0?lerp(t,0,2.4,0,55):shot===8?lerp(t,34,37.4,35,95):35;
 if(shot===4)return <svg width="1080" height="1920" viewBox="0 0 540 960"><Blueprint t={t} fps={fps}/></svg>;
 return <svg width="1080" height="1920" viewBox="0 0 540 960">
  <g style={shot===1||shot===7?{filter:'blur(4px)'}:undefined}><City t={t} pan={pan} night={night}/></g>
  {shot===0&&<><Walker t={t} x={lerp(t,0,2.35,215,292)} y={813} s={1.27} walk phone={t>1.65}/><Walker t={t+.4} x={lerp(t,0,2.4,515,400)} y={700} s={.60} walk phone={false} extra/></>}
  {(shot===1||shot===7)&&<Phone t={t} fps={fps} reply={shot===7}/>}
  {shot===2&&<>
   <Walker t={t} x={285} y={813} s={1.32} emotion="fear"/>
   <g fill="#555A78" opacity=".85" transform={`translate(${286+Math.sin(t)*3} 310)`}><ellipse cy="16" rx="90" ry="26"/><circle cx="-44" r="29"/><circle cy="-16" r="43"/><circle cx="48" cy="1" r="31"/></g>
   {Array.from({length:16},(_,i)=>{const y=345+(t*131+i*47)%286;return <path key={i} d={`M ${210+i*37%150} ${y} l -4 13`} stroke="#B4C6DD" strokeWidth="1.1" opacity=".5"/>;})}
   {['Làm sai?','Sếp giận?','Mất việc?'].map((x,i)=>t>=5.7+i*1.6&&<g key={i} transform={`translate(${i===1?424:123} ${[383,440,520][i]}) scale(${pop(t,5.7+i*1.6,fps)})`}><path d="M -76 -28 Q -89 -44 -65 -52 Q -47 -71 -26 -56 Q 0 -77 20 -57 Q 53 -71 63 -49 Q 92 -44 78 -24 Q 93 -3 62 7 Q 20 29 3 9 Q -40 33 -60 9 Q -91 10 -76 -28" fill={P.paper} stroke={P.ink} strokeWidth="1.2"/><text textAnchor="middle" y="-20" fontSize="16" fill={P.ink}>{x}</text></g>)}
  </>}
  {shot===3&&<>
   <rect width="540" height="960" fill={P.night} opacity=".65"/>
   {[0,1,2].map(i=><g key={i} transform={`translate(${95+i*175} ${406+(1-pop(t,10.4+i*.2,fps))*30})`} opacity={Math.min(1,pop(t,10.4+i*.2,fps))}>
    <path d="M -74 -151 H 74 V 203 H -74 Z" fill={['#C9D5D4','#9B9EBB','#686F90'][i]} stroke={P.paper} strokeWidth="1.4"/><path d="M -74 139 H 74" stroke={P.paper} opacity=".4"/>
    <Walker t={t+i} x={0} y={143} s={.91} emotion="fear"/><text y="-108" textAnchor="middle" fill={i===0?P.ink:P.paper} fontSize="16">{['Tự trách','Sợ bị mắng','Sợ bị bỏ lại'][i]}</text><text textAnchor="middle" y="182" fontSize="23" fill={i===0?P.ink:P.paper}>?</text>
   </g>)}
  </>}
  {(shot===5||shot===6)&&<>
   <g transform="translate(270 740)" stroke={P.ink} strokeWidth="1.8"><path d="M -91 -101 H 92 M -91 -78 H 92 M -91 -55 H 92" stroke={C.wood} strokeWidth="15"/><path d="M -104 -25 H 104" stroke={C.wood} strokeWidth="13"/><path d="M -78 -114 V 42 M 78 -114 V 42" strokeWidth="3"/></g>
   <Walker t={t} x={270} y={808} s={1.18} sit phone={shot===6} emotion={emotion}/>
   {shot===5&&<circle cx="288" cy="514" r={62+Math.sin((t-20)*1.1)*12} fill="none" stroke={P.paper} strokeWidth="1" opacity=".17"/>}
   {shot===6&&<g transform={`translate(270 ${294+(1-pop(t,23.3,fps))*25})`} opacity={Math.min(1,pop(t,23.3,fps))}><path d="M -186 -44 H 186 V 45 H 33 L 7 78 V 45 H -186 Z" fill={P.paper} stroke={P.ink} strokeWidth="1.4"/><text textAnchor="middle" y="-6" fontSize="20" fill={P.ink}>Dạ, em cần chuẩn bị</text><text textAnchor="middle" y="24" fontSize="20" fill={P.ink}>gì không ạ?</text>{t>25.4&&<text textAnchor="middle" y="113" fill={P.paper} fontSize="12">Đã gửi ✓</text>}</g>}
  </>}
  {shot===8&&<><Walker t={t} x={lerp(t,34.1,37.4,254,340)} y={813} s={1.28} walk={t>34.1} emotion="smile" phone={false}/><Walker t={t+.6} x={lerp(t,32.3,37.4,75,145)} y={700} s={.60} walk phone={false} extra/></>}
  {shot===9&&<>
   <circle cx="400" cy="397" r="220" fill="url(#s-glow)"/>
   <path d="M 431 818 V 330 Q 431 302 398 302" fill="none" stroke={P.ink} strokeWidth="5"/><path d="M 370 321 Q 373 295 398 295 Q 421 295 424 321 Z" fill={P.light} stroke={P.ink} strokeWidth="1.3"/>
   <Walker t={t} x={247} y={813} s={1.28} emotion="smile" phone={false}/>
   <text textAnchor="middle" x="270" y="231" fontSize="23" fill={P.ink}>Một câu hỏi nhỏ.</text><text textAnchor="middle" x="270" y="267" fontSize="21" fill={P.ink}>Một khoảng trời nhẹ hơn.</text>
  </>}
 </svg>;
};
