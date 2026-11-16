import React from 'react';
import {T as C,enter,lerp,moodAt,Mood,shotAt} from './theme';

// This world has its own silhouette, line treatment, palette and sets.
const colors={sky:'#D4D9F1',far:'#B1B6D4',mid:'#8B94BE',city:'#66779F',ground:'#C6D8B7',road:'#E7E1D5',trunk:'#6F708A',tree:'#86B39B',deep:'#242940',night:'#434A72',lamp:'#FFE4A0',rain:'#A7C4E0',paper:'#F6F4E9'};
const WorldMochi:React.FC<{t:number;x:number;y:number;s?:number;walking?:boolean;sitting?:boolean;phone?:boolean;mood?:Mood}>=({t,x,y,s=1,walking=false,sitting=false,phone=false,mood='calm'})=>{
 const p=t*8,w=walking?Math.sin(p):0,relax=mood==='happy',worry=mood==='worry';
 const bob=walking?-Math.abs(Math.cos(p))*5:Math.sin(t*2)*2;
 return <g transform={`translate(${x} ${y}) scale(${s})`} stroke={C.darkViolet} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
   <ellipse cx="3" cy="5" rx="89" ry="12" fill={colors.deep} stroke="none" opacity=".13"/>
   {[-1,1].map((side)=><g key={side}>
     <path d={sitting?`M ${side*37} -47 L ${side*64} -27 L ${side*66} 20`:`M ${side*37} -47 Q ${side*44+w*10} -23 ${side*35+w*27} ${-Math.max(0,side*w)*18}`} fill="none" strokeWidth="16"/>
     <path d={sitting?`M ${side*37} -47 L ${side*64} -27 L ${side*66} 20`:`M ${side*37} -47 Q ${side*44+w*10} -23 ${side*35+w*27} ${-Math.max(0,side*w)*18}`} fill="none" stroke={C.white} strokeWidth="9"/>
     <ellipse cx={sitting?side*71:side*35+w*27} cy={sitting?20:-Math.max(0,side*w)*18} rx="20" ry="9" fill={C.white}/>
   </g>)}
   <g transform={`translate(0 ${bob}) rotate(${worry?-5:w*2} 0 -130)`}>
     <path d={`M -78 -115 Q -124 -100 -107 ${relax?-160:-61-w*18}`} fill="none" strokeWidth="18"/><path d={`M -78 -115 Q -124 -100 -107 ${relax?-160:-61-w*18}`} fill="none" stroke={C.white} strokeWidth="11"/>
     <path d="M -97 -113 C -114 -199 -54 -245 0 -240 C 75 -248 111 -191 99 -109 Q 100 -37 0 -40 Q -100 -37 -97 -113" fill={C.white}/>
     <path d="M -77 -103 Q -24 -77 74 -103 L 77 -80 Q 0 -58 -79 -82 Z" fill={C.yellow}/><path d={`M -55 -81 L ${-65+w*4} -36 L -30 -46 L -32 -82`} fill={C.yellow}/>
     <ellipse cx="-53" cy="-149" rx="17" ry="8" fill={C.pink} opacity=".65" stroke="none"/><ellipse cx="51" cy="-149" rx="17" ry="8" fill={C.pink} opacity=".65" stroke="none"/>
     {[-1,1].map(side=><g key={side}>{mood==='breathe'||Math.sin(t*1.73)>.99?<path d={`M ${side*32-9} -172 q 9 8 18 0`} fill="none"/>:<ellipse cx={side*32+5} cy="-173" rx="5" ry="8" fill={C.darkViolet} stroke="none"/>}{worry&&<path d={`M ${side*33-12} ${-194-side*4} l 24 ${side*10}`} fill="none"/>}</g>)}
     <path d={worry?'M -9 -131 Q 2 -140 13 -131':relax?'M -13 -139 Q 0 -118 16 -139':'M -5 -135 q 8 7 16 -1'} fill="none" strokeWidth="3"/>
     <g transform={`translate(-8 -238) rotate(${worry?47:Math.sin(t*1.8)*7})`} stroke={C.leaf} strokeWidth="4">
       <path d="M 0 1 Q -6 -24 0 -52" fill="none"/><path d="M -1 -27 Q -49 -66 -47 -36 Q -33 -10 -1 -27" fill={C.green}/><path d="M 0 -38 Q 47 -74 46 -45 Q 29 -18 0 -38" fill={C.green}/>
       {relax&&<g transform="translate(0 -54)" stroke={C.wood} strokeWidth="1">{[0,60,120,180,240,300].map(a=><ellipse key={a} cy="-10" rx="7" ry="12" fill={C.yellow} transform={`rotate(${a+t*6})`}/>)}<circle r="6" fill={colors.paper}/></g>}
     </g>
     <path d={phone?'M 79 -113 Q 116 -71 91 -151':`M 80 -115 Q 124 -100 105 ${relax?-167:-59+w*18}`} strokeWidth="18" fill="none"/>
     <path d={phone?'M 79 -113 Q 116 -71 91 -151':`M 80 -115 Q 124 -100 105 ${relax?-167:-59+w*18}`} stroke={C.white} strokeWidth="11" fill="none"/>
     {phone&&<g transform={`translate(96 -171) rotate(${Math.sin(t*3)*3+7})`}><rect x="-18" y="-33" width="36" height="62" rx="6" fill={colors.deep}/><rect x="-12" y="-24" width="24" height="42" rx="2" fill={colors.sky} stroke="none"/><circle cx="0" cy="23" r="2" fill={C.white} stroke="none"/></g>}
   </g>
 </g>;
};

const Tree:React.FC<{x:number;y:number;s?:number;wind:number}>=({x,y,s=1,wind})=><g transform={`translate(${x} ${y}) scale(${s})`}>
 <path d="M -11 0 L -9 -153 L 8 -153 L 16 0" fill={colors.trunk}/><g transform={`rotate(${wind} 0 -150)`}><ellipse cy="-214" rx="81" ry="123" fill={colors.tree}/><ellipse cx="-28" cy="-235" rx="51" ry="86" fill={C.white} opacity=".09"/><path d="M 0 -94 V -293 M 0 -155 L -43 -200 M 0 -207 L 39 -247" fill="none" stroke={colors.trunk} strokeWidth="4" opacity=".55"/></g>
</g>;

const City:React.FC<{t:number;pan?:number;night?:boolean;gold?:boolean}>=({t,pan=0,night=false,gold=false})=><g>
 <defs><linearGradient id="world-sky" x2="0" y2="1"><stop stopColor={night?colors.deep:colors.sky}/><stop offset="1" stopColor={night?colors.night:colors.paper}/></linearGradient><radialGradient id="world-sun"><stop stopColor={colors.lamp} stopOpacity=".65"/><stop offset="1" stopColor={colors.lamp} stopOpacity="0"/></radialGradient></defs>
 <rect width="1080" height="1920" fill="url(#world-sky)"/>
 <circle cx={820-pan*.1} cy="410" r="120" fill={night?colors.paper:colors.lamp} opacity=".7"/>
 <g transform={`translate(${-pan*.2} 0)`}>
   {Array.from({length:10},(_,i)=><path key={i} d={`M ${-100+i*176} 1070 V ${680+(i*41)%190} h 140 V 1070`} fill={colors.far} opacity={night?.19:.65}/>)}
 </g>
 <g transform={`translate(${-pan*.48} 0)`}>
   {Array.from({length:8},(_,i)=><g key={i} transform={`translate(${-160+i*260} ${770+(i*63)%130})`}>
     <rect width="210" height="430" rx="8" fill={night?colors.city:colors.mid}/><path d="M -9 10 H 219" stroke={colors.paper} opacity=".4" strokeWidth="8"/>
     {Array.from({length:12},(_,j)=><rect key={j} x={23+j%3*61} y={35+Math.floor(j/3)*84} width="35" height="51" rx="3" fill={night?colors.lamp:colors.paper} opacity={night?.45:.48}/>)}
   </g>)}
 </g>
 <path d="M 0 1160 Q 480 1050 1080 1170 V 1920 H 0" fill={night?colors.night:colors.ground}/>
 <path d="M 0 1320 Q 400 1230 1080 1340 V 1660 Q 500 1530 0 1660 Z" fill={night?colors.city:colors.road}/>
 <g transform={`translate(${-pan} 0)`}>
   <path d="M -200 1320 H 2100 M -200 1550 H 2100" stroke={colors.paper} opacity=".3" strokeWidth="4"/>
   {[0,1,2,3,4,5].map(i=><Tree key={i} x={-100+i*390} y={1245+(i%2)*10} s={.92+i%2*.12} wind={Math.sin(t*1.1+i)*2}/>)}
   <g transform="translate(900 900)" stroke={C.darkViolet} strokeWidth="5"><rect x="-100" y="-263" width="265" height="660" rx="9" fill={colors.paper}/><rect x="-73" y="-227" width="211" height="222" fill={colors.sky}/><path d="M 30 -227 V -5"/><rect x="-46" y="49" width="158" height="348" fill={colors.mid}/><circle cx="81" cy="239" r="8" fill={C.yellow}/><text x="32" y="25" textAnchor="middle" fontSize="28" fill={C.darkViolet} stroke="none" fontWeight="700">STUDIO</text></g>
 </g>
 {gold&&<circle cx="960" cy="530" r="850" fill="url(#world-sun)"/>}
 <g transform={`translate(${-pan*1.3} 0)`}><path d="M -70 1625 Q 120 1500 290 1590 Q 350 1540 430 1602 L 445 1920 H -70 Z" fill={night?colors.deep:colors.tree}/><Tree x={1220} y={1750} s={1.8} wind={Math.sin(t)*1.5}/></g>
</g>;

const RainCloud:React.FC<{t:number;fade?:number}>=({t,fade=1})=><g opacity={fade}>
 <g transform={`translate(${540+Math.sin(t)*10} 575)`} fill={colors.night}><ellipse cy="12" rx="161" ry="55"/><circle cx="-89" cy="-10" r="62"/><circle cx="-5" cy="-48" r="80"/><circle cx="84" cy="-15" r="66"/></g>
 {Array.from({length:21},(_,i)=>{const y=650+((t*250+i*71)%600);return <path key={i} d={`M ${370+(i*71)%360} ${y} l -9 27`} stroke={colors.rain} strokeWidth="4" opacity={.3+(i%3)*.14}/>;})}
</g>;

const WorldMessage:React.FC<{t:number;reply?:boolean;fps:number}>=({t,reply=false,fps})=>{
 const e=enter(t,reply?27.8:2.4,fps);
 return <g transform={`translate(540 ${890+(1-e)*140}) rotate(${reply?2:-4}) scale(${.9+.1*e})`}>
   <ellipse cy="570" rx="310" ry="28" fill={colors.deep} opacity=".14"/>
   <path d="M 248 149 Q 392 54 540 264 V 940 H 277 L 135 486" fill={C.white} stroke={C.darkViolet} strokeWidth="7"/>
   <rect x="-285" y="-470" width="570" height="1010" rx="62" fill={colors.deep}/><rect x="-268" y="-450" width="536" height="970" rx="47" fill={colors.paper}/>
   <path d="M -70 -426 H 70" stroke={colors.city} strokeWidth="10" strokeLinecap="round"/>
   <circle cy="-338" r="40" fill={colors.tree}/><text textAnchor="middle" y="-325" fontSize="39" fontWeight="700" fill={colors.paper}>A</text><text textAnchor="middle" y="-254" fill={C.darkViolet} fontSize="34" fontWeight="700">Anh quản lý</text>
   <path d="M -225 -190 H 183 Q 225 -190 225 -152 V -77 Q 225 -40 184 -40 H -185 L -229 -17 L -218 -53 Q -245 -64 -245 -92 V -152 Q -245 -190 -225 -190" fill={colors.sky}/>
   <text x="-215" y="-135" fontSize="33" fill={C.darkViolet}>Chiều gặp anh chút nhé.</text>
   {reply&&<>
     <rect x="-158" y="3" width="401" height="169" rx="26" fill={colors.tree}/><text x="-128" y="60" fill={colors.paper} fontSize="31">Dạ, em cần chuẩn bị</text><text x="-128" y="107" fill={colors.paper} fontSize="31">gì không ạ?</text>
     <g opacity={Math.min(1,enter(t,28.1,fps))} transform={`translate(0 ${(1-enter(t,28.1,fps))*45})`}><rect x="-245" y="214" width="485" height="213" rx="26" fill={colors.sky}/><text x="-215" y="269" fontSize="32" fill={C.darkViolet}>Không có gì đâu.</text><text x="-215" y="318" fontSize="32" fill={C.darkViolet}>Anh muốn khen bản</text><text x="-215" y="367" fontSize="32" fill={C.darkViolet}>thiết kế của em.</text></g>
   </>}
   {!reply&&<g fill={colors.mid} opacity=".4">{[0,1,2].map(i=><circle key={i} cx={-21+i*21} cy="60" r="6"/>)}</g>}
   <path d="M -68 495 H 68" stroke={colors.deep} strokeWidth="6" strokeLinecap="round"/>
   <path d="M 289 171 Q 191 139 196 79 Q 206 33 244 73 L 300 120" fill={C.white} stroke={C.darkViolet} strokeWidth="7"/>
 </g>;
};

const Bench=()=> <g transform="translate(540 1340)" stroke={colors.trunk} strokeWidth="9"><path d="M -251 -178 H 251 M -251 -134 H 251 M -251 -90 H 251" stroke={colors.trunk} strokeWidth="30"/><path d="M -269 -41 H 269" stroke={colors.trunk} strokeWidth="26"/><path d="M -216 -205 V 62 M 216 -205 V 62"/></g>;

const Blueprint:React.FC<{t:number;fps:number}>=({t,fps})=> <g>
 <rect width="1080" height="1920" fill={colors.deep}/>
 {Array.from({length:24},(_,i)=><path key={i} d={`M ${i*54} 0 V 1920 M 0 ${i*84} H 1080`} stroke={colors.mid} strokeWidth="1" opacity=".17"/>)}
 <g transform={`translate(540 485) scale(${enter(t,15,fps)})`} fill="none" stroke={colors.rain} strokeWidth="4"><path d="M -295 -85 H 295 V 85 H -220 L -295 135 Z"/><path d="M -240 -25 H 185 M -240 24 H 60"/><text y="-136" textAnchor="middle" fill={colors.paper} stroke="none" fontSize="36" fontWeight="700">VÀI CHỮ TRÊN MÀN HÌNH</text></g>
 <path d="M 540 620 V 784" stroke={colors.rain} strokeWidth="5" strokeDasharray="8 14" strokeDashoffset={-t*20}/>
 <g transform={`translate(540 915) rotate(${Math.sin(t*.8)*3})`}><ellipse rx="245" ry="145" fill="none" stroke={colors.rain} strokeWidth="5"/><path d="M -153 0 Q -83 -143 0 -25 Q 90 -141 154 0 Q 88 119 0 24 Q -90 130 -153 0" fill="none" stroke={colors.rain} strokeWidth="4"/><text textAnchor="middle" y="17" fill={C.yellow} fontSize="81" fontWeight="700">?</text></g>
 {[0,1,2].map(i=><g key={i} opacity={Math.min(1,enter(t,15.7+i*.35,fps))}><path d={`M 540 1070 Q ${220+i*320} 1120 ${210+i*330} 1195`} fill="none" stroke={colors.rain} strokeWidth="4"/><circle cx={210+i*330} cy="1275" r="74" fill={colors.night} stroke={colors.rain} strokeWidth="3"/><path d={`M ${185+i*330} 1250 l 50 50 m 0 -50 l -50 50`} stroke={C.pink} strokeWidth="7"/></g>)}
 <text x="540" y="1430" textAnchor="middle" fill={colors.paper} fontSize="38">Chưa biết ≠ điều xấu sẽ đến</text>
</g>;

export const WorldFilm:React.FC<{t:number;fps:number}>=({t,fps})=>{
 const shot=shotAt(t),mood=moodAt(t),night=shot>=2&&shot<=6;
 const pan=shot===0?lerp(t,0,2.4,0,180):shot===8?lerp(t,32.3,37.4,100,450):180;
 if(shot===4)return <svg width="1080" height="1920"><Blueprint t={t} fps={fps}/></svg>;
 return <svg width="1080" height="1920" viewBox="0 0 1080 1920">
   <City t={t} pan={pan} night={night} gold={shot>=8}/>
   {shot===0&&<WorldMochi t={t} x={lerp(t,0,2.4,310,590)} y={1380} s={1.5} walking phone={t>1.7}/>}
   {(shot===1||shot===7)&&<><rect width="1080" height="1920" fill={colors.deep} opacity=".25"/><WorldMessage t={t} reply={shot===7} fps={fps}/></>}
   {shot===2&&<>
     <WorldMochi t={t} x={540} y={1390} s={1.9} phone mood={mood}/><RainCloud t={t}/>
     {['Sai rồi?','Sếp giận?','Mất việc?'].map((label,i)=>t>=5.7+i*1.6&&<g key={i} transform={`translate(${[260,810,270][i]} ${[785,870,1060][i]}) scale(${enter(t,5.7+i*1.6,fps)})`}><ellipse rx="163" ry="70" fill={colors.paper}/><circle cx={i===1?-112:115} cy="71" r="17" fill={colors.paper}/><text y="12" textAnchor="middle" fill={C.darkViolet} fontSize="34" fontWeight="700">{label}</text></g>)}
   </>}
   {shot===3&&<>
     <rect width="1080" height="1920" fill={colors.deep} opacity=".75"/>
     {[0,1,2].map(i=>{const e=enter(t,10.4+i*.2,fps);return <g key={i} transform={`translate(${55+i*330} ${650+(1-e)*140})`} opacity={Math.min(1,e)}>
       <rect width="310" height="600" rx="155" fill={[colors.sky,colors.mid,colors.night][i]} stroke={colors.paper} strokeWidth="5"/>
       <path d="M 30 455 H 280" stroke={colors.deep} strokeWidth="4" opacity=".3"/>
       <WorldMochi t={t+i} x={155} y={460} s={.92} mood="worry"/>
       <text x="155" y="144" textAnchor="middle" fill={i===0?colors.deep:colors.paper} fontSize="31" fontWeight="700">{['Tự trách','Sợ bị mắng','Sợ bị bỏ lại'][i]}</text>
       <text x="155" y="540" textAnchor="middle" fill={i===0?colors.deep:colors.paper} fontSize="50">?</text>
     </g>;})}
     <text x="540" y="478" fill={colors.paper} textAnchor="middle" fontSize="40" fontWeight="700">Ba cảnh chưa từng xảy ra</text>
   </>}
   {(shot===5||shot===6)&&<>
     <Bench/><WorldMochi t={t} x={540} y={1310} s={1.65} sitting phone={shot===6} mood={mood}/>
     <RainCloud t={t} fade={lerp(t,20,22.5,.8,0)}/>
     {shot===5&&[0,1,2].map(i=><circle key={i} cx="540" cy="1030" r={160+((t-20)*55+i*70)%250} stroke={colors.rain} strokeWidth="3" fill="none" opacity={.3-i*.07}/>)}
     {shot===6&&<g transform={`translate(540 ${650+(1-enter(t,23.3,fps))*65})`} opacity={Math.min(1,enter(t,23.3,fps))}>
       <path d="M -385 -116 H 385 V 80 H 78 L 13 145 L 10 80 H -385 Z" fill={colors.paper} stroke={colors.tree} strokeWidth="5"/>
       <text textAnchor="middle" y="-40" fontSize="39" fill={C.darkViolet}>Dạ, em cần chuẩn bị</text><text textAnchor="middle" y="19" fontSize="39" fill={C.darkViolet}>gì không ạ?</text>
       {t>25.4&&<text y="228" textAnchor="middle" fontSize="26" fill={colors.paper}>Đã gửi · Đang chờ trả lời{'.'.repeat(1+Math.floor(t*2)%3)}</text>}
     </g>}
   </>}
   {shot===8&&<><WorldMochi t={t} x={lerp(t,34.1,37.4,440,680)} y={1370} s={1.6} walking={t>34.1} mood="happy"/>{Array.from({length:15},(_,i)=><circle key={i} cx={120+(i*177)%880} cy={530+(i*137)%720+Math.sin(t+i)*14} r={3+i%4} fill={colors.lamp} opacity=".8"/>)}</>}
   {shot===9&&<>
     <rect width="1080" height="1920" fill={colors.night} opacity=".45"/>
     <circle cx="750" cy="700" r="470" fill="url(#world-sun)"/>
     <path d="M 824 1390 V 609 Q 824 539 744 539" fill="none" stroke={colors.deep} strokeWidth="18"/><path d="M 686 569 Q 744 499 802 569 Z" fill={colors.lamp}/>
     <WorldMochi t={t} x={480} y={1340} s={1.6} mood="happy"/>
     <text x="540" y="755" textAnchor="middle" fontSize="47" fontWeight="700" fill={colors.paper}>Một câu hỏi nhỏ.</text><text x="540" y="822" textAnchor="middle" fontSize="43" fill={colors.lamp}>Một khoảng trời nhẹ hơn.</text>
   </>}
 </svg>;
};
