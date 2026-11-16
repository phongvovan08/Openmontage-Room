// Original production artwork. No third-party illustrations or application code.
const P={night:'#142A36',ink:'#20343E',cream:'#F5E8D7',amber:'#F5B65A',teal:'#5F8A85',clay:'#C5785F',skin:'#F0C9A9',wood:'#8C6250'};
const wrap=(w,h,body)=>({width:w,height:h,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`});
const line=(d,c=P.ink,w=3,opacity=1)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
function windows(x,y,w,h,seed){let s='';for(let row=0;row<Math.floor(h/31);row++)for(let col=0;col<Math.floor(w/27);col++){const on=(row*7+col*11+seed*13)%9<3;s+=`<rect x="${x+10+col*27}" y="${y+15+row*31}" width="9" height="14" rx="1" fill="${on?P.amber:'#A7C5C8'}" opacity="${on?.48:.065}"/>`;}return s;}

function office(){
 let city='';
 const buildings=[[116,461,100,250],[229,404,96,307],[340,326,128,385],[482,428,109,283],[605,375,146,336]];
 for(let i=0;i<buildings.length;i++){const [x,y,w,h]=buildings[i];city+=`<path d="M${x} 711V${y}h${w}v${h}Z" fill="${i%2?'#274752':'#34535C'}"/>${windows(x,y,w,h,i)}`;if(i===2)city+=line(`M${x+w/2} ${y}V${y-45}`,'#9AB4B4',2,.4);}
 let rain='';for(let i=0;i<72;i++){const x=110+(i*97)%665,y=170+(i*139)%532;rain+=line(`M${x} ${y}l-11 36`,i%3===0?'#D5E4DF':'#86A9AF',i%7===0?2:1,i%4===0?.35:.16);}
 let floor='';for(let i=0;i<13;i++){const x=-500+i*245;floor+=line(`M960 939L${x} 1080`,'#4F4D4A',2,.22);}for(const y of [970,1013,1063])floor+=line(`M0 ${y}H1920`,'#4F4D4A',2,.17);
 let books='';for(let i=0;i<9;i++){const x=1492+i*36,h=64+(i*17)%42;books+=`<g transform="rotate(${i===7?11:0} ${x+14} 427)"><rect x="${x}" y="${427-h}" width="${22+i%3*3}" height="${h}" rx="2" fill="${[P.teal,P.clay,P.cream,'#A68B68'][i%4]}"/><path d="M${x+4} ${440-h}h14M${x+4} ${414}h14" stroke="${P.cream}" stroke-width="2" opacity=".45"/></g>`;}
 return wrap(1920,1080,`
 <defs>
  <linearGradient id="wall" x2="1" y2=".4"><stop stop-color="#17333F"/><stop offset=".56" stop-color="#253E48"/><stop offset="1" stop-color="#4C514B"/></linearGradient>
  <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#112C3F"/><stop offset="1" stop-color="#456C75"/></linearGradient>
  <linearGradient id="floor" x2=".2" y2="1"><stop stop-color="#8F7D67"/><stop offset="1" stop-color="#544C46"/></linearGradient>
  <linearGradient id="glass" x2=".8" y2="1"><stop stop-color="#BFD9CE" stop-opacity=".14"/><stop offset=".5" stop-color="#BFD9CE" stop-opacity="0"/><stop offset="1" stop-color="#BFD9CE" stop-opacity=".13"/></linearGradient>
  <radialGradient id="lamp"><stop stop-color="${P.amber}" stop-opacity=".28"/><stop offset="1" stop-color="${P.amber}" stop-opacity="0"/></radialGradient>
  <linearGradient id="beam" x2=".5" y2="1"><stop stop-color="${P.amber}" stop-opacity=".13"/><stop offset="1" stop-color="${P.amber}" stop-opacity="0"/></linearGradient>
  <clipPath id="window"><rect x="106" y="161" width="679" height="554" rx="4"/></clipPath>
  <clipPath id="floorClip"><path d="M0 940H1920V1080H0Z"/></clipPath>
 </defs>
 <rect width="1920" height="1080" fill="url(#wall)"/>
 <ellipse cx="1615" cy="375" rx="610" ry="540" fill="url(#lamp)"/>
 <path d="M867 0V936M1411 0V936M0 106H1920" stroke="#9EA59B" stroke-width="2" opacity=".07"/>
 <path d="M0 934H1920V1080H0Z" fill="url(#floor)"/>${floor}
 <g clip-path="url(#floorClip)"><path d="M118 940L597 1080H1052L781 940Z" fill="#8BA8A2" opacity=".075"/><path d="M1539 940L1425 1080H1855L1759 940Z" fill="${P.amber}" opacity=".06"/></g>
 <path d="M0 928H1920V946H0Z" fill="#132B35"/><path d="M0 946H1920" stroke="#A88D6C" stroke-width="3" opacity=".35"/>
 <rect x="87" y="142" width="721" height="597" rx="8" fill="#0D242F"/>
 <g clip-path="url(#window)"><rect x="106" y="161" width="679" height="554" fill="url(#sky)"/>
  <circle cx="661" cy="253" r="40" fill="#E6E6C8" opacity=".58"/>
  <path d="M106 421Q266 389 403 424T785 397V717H106Z" fill="#173741" opacity=".57"/>
  ${city}${rain}<rect x="106" y="161" width="679" height="554" fill="url(#glass)"/>
  <path d="M116 161L361 715H426L186 161ZM577 161L785 623V715H756L513 161Z" fill="#D6E2D7" opacity=".045"/>
 </g>
 <path d="M106 161H785V715H106ZM445 161V715M106 445H785" fill="none" stroke="#688786" stroke-width="11"/>
 <path d="M113 168H437M453 168H777M113 454H437M453 454H777" stroke="#B4C4B2" stroke-width="2" opacity=".35"/>
 <path d="M77 731H821L809 749H89Z" fill="#78938C"/><path d="M90 750H808V761H90Z" fill="#122A35" opacity=".65"/>
 <g opacity=".35"><rect x="210" y="771" width="459" height="122" rx="6" fill="#183440" stroke="#5C7476" stroke-width="2"/>${Array.from({length:14},(_,i)=>line(`M${228+i*31} 785V880`,'#9BA89D',2,.28)).join('')}</g>
 <rect x="1470" y="428" width="367" height="16" rx="3" fill="#A77A5C"/><path d="M1487 444V464M1816 444V464" stroke="#0D2832" stroke-width="7"/>
 ${books}
 <rect x="1530" y="521" width="236" height="164" rx="4" fill="#9A785B" stroke="#182F38" stroke-width="3"/>
 <rect x="1542" y="533" width="212" height="140" fill="#D0C0A0"/>
 <path d="M1544 650L1600 591 1643 632 1693 569 1752 648V672H1544Z" fill="#5E8580"/>
 <path d="M1544 661L1596 630 1644 657 1687 611 1752 660V672H1544Z" fill="#8EA495"/><circle cx="1705" cy="562" r="13" fill="${P.amber}" opacity=".7"/>
 <path d="M1724 0V165" stroke="#142C36" stroke-width="5"/><path d="M1683 164Q1724 145 1765 164L1798 214H1650Z" fill="#C28A58" stroke="#233A40" stroke-width="3"/>
 <ellipse cx="1724" cy="214" rx="74" ry="8" fill="${P.amber}"/><path d="M1650 218L1425 903H1920L1798 218Z" fill="url(#beam)"/>
 <path d="M1456 831H1890V856H1456Z" fill="#AC8060"/><path d="M1456 831H1890V839H1456Z" fill="#CEAB83"/>
 <path d="M1485 856L1475 1008H1493L1515 856ZM1844 856L1853 1008H1871L1873 856Z" fill="#152D36"/>
 <path d="M1538 827H1736L1716 693H1557Z" fill="#142C36" stroke="#A1B2A7" stroke-width="2"/><path d="M1558 706H1716L1730 815H1542Z" fill="#49727A"/><path d="M1534 827H1741L1755 838H1519Z" fill="#53777A"/><circle cx="1639" cy="761" r="11" fill="none" stroke="#B8CAC1" stroke-width="2" opacity=".55"/>
 <path d="M1790 783H1831V819Q1810 834 1790 819Z" fill="${P.cream}"/><path d="M1831 790Q1865 781 1859 807Q1855 822 1831 814" fill="none" stroke="${P.cream}" stroke-width="7"/>
 <path d="M1803 775Q1793 758 1808 745M1819 774Q1831 758 1818 740" fill="none" stroke="#F5E8D7" stroke-width="2" opacity=".35"/>
 <path d="M1416 28H1420V916H1416Z" fill="#E0CAB0" opacity=".045"/>
 `);
}

function anxiety(){
 let paths='';for(let i=0;i<14;i++){const r=110+i*52;paths+=`<ellipse cx="1040" cy="530" rx="${r*1.5}" ry="${r}" transform="rotate(${-21+i*4} 1040 530)" fill="none" stroke="${i%3?P.teal:P.clay}" stroke-width="${i%3?2:5}" opacity="${.05+(i%4)*.018}"/>`;}
 let papers='';for(let i=0;i<13;i++){const x=45+(i*163)%1800,y=140+(i*137)%720,w=120+i%3*40;papers+=`<g transform="translate(${x} ${y}) rotate(${-28+(i*13)%56})"><path d="M0 0H${w}V${w*.63}H0Z" fill="${i%3===0?P.clay:'#6D807E'}" opacity="${i%4===0?.18:.075}"/>${line(`M18 19H${w-18}M18 32H${w-34}`,P.cream,2,.09)}</g>`;}
 return wrap(1920,1080,`<defs><radialGradient id="a"><stop stop-color="#294852"/><stop offset=".65" stop-color="#162B37"/><stop offset="1" stop-color="#0D1E29"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#a)"/>${paths}${papers}<path d="M0 951Q471 917 960 950T1920 951" stroke="${P.teal}" stroke-width="3" opacity=".15" fill="none"/>`);
}

function foreground(){
 return wrap(1920,1080,`<defs><linearGradient id="leaf" x2="1" y2="1"><stop stop-color="#183A3D"/><stop offset="1" stop-color="#0C202B"/></linearGradient><linearGradient id="pot" x2="1"><stop stop-color="#5B4F40"/><stop offset=".5" stop-color="#89715B"/><stop offset="1" stop-color="#504A3D"/></linearGradient></defs>
 <ellipse cx="117" cy="1056" rx="188" ry="28" fill="#091B25" opacity=".32"/>
 <path d="M108 1002Q129 790 70 576M111 989Q39 833 3 768M118 987Q191 801 238 717M118 975Q149 682 182 616" stroke="#143338" stroke-width="8" fill="none"/>
 <g fill="url(#leaf)"><path d="M80 689Q-24 687-49 572Q52 559 80 689Z"/><path d="M96 763Q192 716 180 614Q74 661 96 763Z"/><path d="M48 848Q-53 846-67 725Q40 739 48 848Z"/><path d="M122 880Q242 854 260 744Q146 742 122 880Z"/><path d="M139 770Q247 730 243 633Q135 678 139 770Z"/><path d="M70 612Q-12 537 22 446Q117 495 70 612Z"/></g>
 ${line('M73 680L-21 602M102 744L163 639M45 833L-43 750M134 865L231 769M148 748L227 660','#335653',2,.36)}
 <path d="M42 965H192L173 1080H65Z" fill="url(#pot)"/><path d="M39 954H196V979H39Z" fill="#93806B"/><path d="M64 980L80 1070M177 980L160 1070" stroke="#AD9477" stroke-width="3" opacity=".22"/>`);
}

function head(expression){
 const panic=expression==='panic',closed=expression==='eyesClosed',worried=expression==='worried';
 const eyes=closed?`${line('M113 165Q129 174 146 163',P.ink,5)}${line('M177 162Q189 170 203 160',P.ink,4)}`:
 panic?`<ellipse cx="131" cy="166" rx="17" ry="21" fill="#FFFBF1" stroke="${P.ink}" stroke-width="3"/><ellipse cx="191" cy="161" rx="14" ry="19" fill="#FFFBF1" stroke="${P.ink}" stroke-width="3"/><ellipse cx="136" cy="168" rx="6" ry="9" fill="${P.ink}"/><ellipse cx="195" cy="163" rx="5" ry="8" fill="${P.ink}"/>`:
 `<path d="M111 162Q126 ${worried?151:153} 147 161Q137 178 115 173Z" fill="#FFFBF1"/><path d="M175 157Q190 148 204 158Q198 174 179 169Z" fill="#FFFBF1"/><ellipse cx="${worried?131:137}" cy="165" rx="6" ry="9" fill="${P.ink}"/><ellipse cx="${worried?190:195}" cy="161" rx="5" ry="8" fill="${P.ink}"/>`;
 const brows=panic?`${line('M109 132Q126 113 149 124',P.ink,7)}${line('M174 121Q193 108 209 126',P.ink,6)}`:worried?`${line('M111 143Q128 123 149 133',P.ink,7)}${line('M175 131Q195 119 209 138',P.ink,6)}`:closed?`${line('M110 143Q127 137 148 141',P.ink,6)}${line('M174 136Q189 131 205 136',P.ink,5)}`:`${line('M110 141Q128 133 149 140',P.ink,7)}${line('M174 136Q192 129 206 137',P.ink,6)}`;
 const mouth=panic?`<path d="M157 224Q177 210 194 223L193 250Q177 265 161 250Z" fill="${P.ink}"/><path d="M164 248Q177 239 189 248L188 253Q176 260 165 253Z" fill="#D18F83"/>`:worried?line('M150 244Q176 229 199 240',P.ink,5):expression==='smile'?`${line('M148 229Q174 251 202 226',P.ink,5)}${line('M157 251Q176 260 190 248','#C78E73',2,.55)}`:closed?line('M154 237Q175 243 194 235',P.ink,4):line('M155 236Q176 240 195 231',P.ink,4);
 return wrap(280,320,`<defs><linearGradient id="skin" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#F7D8B7"/><stop offset="1" stop-color="#EABB99"/></linearGradient><linearGradient id="hair" x2="1" y2="1"><stop stop-color="#203946"/><stop offset="1" stop-color="#132833"/></linearGradient></defs>
 <path d="M120 245L115 304Q147 326 184 301L184 249Z" fill="#DFAC88" stroke="${P.ink}" stroke-width="4"/>
 <path d="M129 265Q152 288 183 267V298Q148 318 121 300Z" fill="#E9BC96"/>
 <path d="M99 96Q125 60 180 70Q225 74 234 119L232 173Q233 184 247 191Q255 204 235 211L231 238Q214 270 176 282Q137 281 106 256L81 211L82 143Z" fill="url(#skin)" stroke="${P.ink}" stroke-width="4" stroke-linejoin="round"/>
 <path d="M222 109Q235 135 228 173L242 195 230 203" fill="none" stroke="#D19B7D" stroke-width="3" opacity=".5"/>
 <path d="M89 153Q63 137 57 164Q55 194 78 211L95 207L102 180Z" fill="#F0C6A2" stroke="${P.ink}" stroke-width="4"/>
 ${line('M76 162Q62 163 73 183L84 187', '#C49175',3)}
 <path d="M82 167Q60 134 67 103Q63 89 74 73Q87 40 117 42Q134 13 163 35Q190 14 209 40Q239 42 242 65Q259 82 240 105L218 125Q212 107 210 99Q166 122 124 101L103 112 100 159 90 173Z" fill="url(#hair)" stroke="${P.ink}" stroke-width="4" stroke-linejoin="round"/>
 ${line('M88 88Q113 55 147 69Q180 83 216 60','#4A6267',5,.38)}
 ${line('M108 55Q131 44 150 53M163 48Q191 39 211 52','#759084',3,.18)}
 ${eyes}${brows}
 ${line('M188 177Q184 195 199 198L207 195', '#B77F66',3)}
 ${line('M207 195L216 195',P.ink,2,.6)}
 <ellipse cx="116" cy="215" rx="16" ry="9" fill="#D8947D" opacity="${panic?.38:.2}"/><ellipse cx="216" cy="207" rx="11" ry="7" fill="#D8947D" opacity=".19"/>
 ${mouth}
 ${panic?`<path d="M242 141Q259 164 247 169Q233 170 242 141Z" fill="#90B9BA" stroke="${P.ink}" stroke-width="2"/>`:''}
 `);
}

function torso(){
 return wrap(260,330,`<defs><linearGradient id="cloth" x2="1" y2=".5"><stop stop-color="#CF8C6D"/><stop offset=".6" stop-color="${P.clay}"/><stop offset="1" stop-color="#A65D4E"/></linearGradient></defs>
 <path d="M96 0H169L175 60 128 92 90 60Z" fill="#E8B792" stroke="${P.ink}" stroke-width="4"/>
 <path d="M96 28Q81 44 35 60Q23 78 27 112L43 326Q128 340 218 325L234 111Q238 76 225 61Q184 45 170 28L140 76Z" fill="url(#cloth)" stroke="${P.ink}" stroke-width="5" stroke-linejoin="round"/>
 <path d="M106 45L128 72 151 47 169 319Q136 328 106 320Z" fill="${P.cream}"/>
 <path d="M96 28L128 72 110 106 80 49ZM170 28L138 73 159 102 190 49Z" fill="#DE9D7C" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>
 ${line('M137 83L145 323',P.ink,3,.8)}
 ${[127,176,225,274].map(y=>`<circle cx="154" cy="${y}" r="4.3" fill="#E2B996" stroke="${P.ink}" stroke-width="1.6"/>`).join('')}
 <path d="M178 153L211 152 207 192Q191 204 177 192Z" fill="#B96853" stroke="${P.ink}" stroke-width="3"/>
 ${line('M178 160L210 159M52 298Q79 306 103 302M165 303Q187 307 212 300',P.ink,2,.55)}
 ${line('M33 104L48 123M230 105L215 124',P.ink,3,.8)}
 ${Array.from({length:9},(_,i)=>line(`M${54+i*5} 313l-1 9`,'#EDB38D',1.3,.45)).join('')}
 ${Array.from({length:8},(_,i)=>line(`M${172+i*5} 313v9`,'#EDB38D',1.3,.4)).join('')}`);
}

function phone(){return wrap(85,145,`<defs><linearGradient id="phoneEdge" x2="1"><stop stop-color="#1C2F38"/><stop offset=".5" stop-color="#45606A"/><stop offset="1" stop-color="#172B35"/></linearGradient><linearGradient id="screen" x2=".4" y2="1"><stop stop-color="#456D78"/><stop offset="1" stop-color="#1D404E"/></linearGradient></defs><rect x="3" y="2" width="79" height="140" rx="14" fill="url(#phoneEdge)" stroke="#0F2530" stroke-width="3"/><rect x="9" y="8" width="67" height="125" rx="9" fill="url(#screen)"/><path d="M27 10H57L54 17H30Z" fill="#102935"/><circle cx="61" cy="13" r="2" fill="#7998A0"/><rect x="17" y="44" width="51" height="37" rx="6" fill="${P.cream}" opacity=".94"/><rect x="24" y="53" width="34" height="3" rx="1.5" fill="${P.teal}" opacity=".65"/><rect x="24" y="61" width="28" height="3" rx="1.5" fill="${P.teal}" opacity=".4"/><circle cx="67" cy="40" r="8" fill="${P.amber}"/><path d="M32 126H53" stroke="#D7E1D9" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="M7 23V67M79 28V46" stroke="#68818A" stroke-width="2" stroke-linecap="round"/></svg>`.replace('</svg>',''));}

export function makeAssets(){return {
 office:office(),
 anxiety:anxiety(),
 foreground:foreground(),
 'head-neutral':head('neutral'),
 'head-worried':head('worried'),
 'head-panic':head('panic'),
 'head-eyesClosed':head('eyesClosed'),
 'head-smile':head('smile'),
 torso:torso(),
 phone:phone(),
};}
