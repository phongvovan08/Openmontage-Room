import React from 'react';
import {Action, LOCAL_THEME as C, tween, clamp} from './theme';

const INK={stroke:C.brown,strokeWidth:4,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};

/** Original paper-cut character; no shared character artwork with the SVG film. */
const PaperMochi:React.FC<{action:Action;t:number;p:number}>=({action,t,p})=>{
  const phone=['phone','blanket','time','drain','balance'].includes(action);
  const calm=['putdown','tea','bloom'].includes(action);
  const stressed=phone||['work','tasks','city'].includes(action);
  const squash=action==='drain'?1-.13*p:1+Math.sin(t*1.8)*.009;
  const look=Math.sin(t*.65)*3;
  const blink=(t%5.1)>4.9;
  const leaf=phone?29+Math.sin(t*1.5)*6:Math.sin(t*1.2)*6;
  return <g transform={`translate(0 ${Math.sin(t*1.8)*3}) rotate(${Math.sin(t*.8)*1.2})`}>
    <ellipse cx={5} cy={216} rx={164} ry={20} fill={C.brown} opacity={.14}/>
    <g transform={`scale(1 ${squash})`}>
      <path d="M-125 153 C-209 62 -165 -118 -80 -173 C-28 -210 64 -188 116 -129 C182 -51 189 92 124 156 Q112 206 65 191 Q-10 212 -65 189 Q-119 208 -125 153Z" fill={C.brown} opacity={.15} transform="translate(9 12)"/>
      <path d="M-125 153 C-209 62 -165 -118 -80 -173 C-28 -210 64 -188 116 -129 C182 -51 189 92 124 156 Q112 206 65 191 Q-10 212 -65 189 Q-119 208 -125 153Z" fill={C.milk} {...INK} strokeWidth={5}/>
      <path d="M-116 152 C-182 70 -152 -93 -80 -154 M88 -144 Q171 -69 154 64" fill="none" stroke={C.shadow} strokeWidth={3}/>
      {[0,1,2,3,4].map(i=><path key={i} d={`M${-127+i*8} ${101+i*8} l9 -17`} stroke={C.honey} opacity={.18} strokeWidth={2}/>)}
      <g transform={`rotate(${leaf} -4 -184)`}>
        <path d="M-3 -185 Q9 -214 1 -245" fill="none" stroke={C.greenDark} strokeWidth={7}/>
        <path d="M2 -219 Q-76 -274 -81 -239 Q-69 -202 2 -219 M2 -231 Q66 -296 85 -260 Q83 -229 2 -231" fill={action==='drain'?C.honey:C.green} {...INK} strokeWidth={3}/>
        <path d="M-68 -241 L-9 -220 M12 -236 L72 -263" fill="none" stroke={C.greenDark} strokeWidth={2}/>
      </g>
      {action==='bloom'&&<g transform={`translate(1 -258) scale(${tween(p,[0,.6],[0,1])})`}>
        {[0,72,144,216,288].map(a=><path key={a} d="M0 0 C-33 -10 -25 -49 -5 -38 Q15 -35 0 0" fill={C.yellow} stroke={C.honey} strokeWidth={2} transform={`rotate(${a})`}/>)}<circle r={10} fill={C.paper} stroke={C.honey} strokeWidth={2}/>
      </g>}
      <g transform={`translate(${look} 0)`}>
        {phone||calm||blink?<g fill="none" {...INK}><path d={phone?'M-64 -48 Q-49 -39 -34 -48 M33 -48 Q48 -39 63 -48':'M-64 -44 Q-49 -31 -34 -44 M33 -44 Q48 -31 63 -44'}/></g>:<g fill={C.brown}><ellipse cx={-49} cy={-42} rx={8} ry={11}/><ellipse cx={48} cy={-42} rx={8} ry={11}/></g>}
        <path d={stressed?'M-10 -1 Q1 -7 12 0':'M-12 -5 Q-3 6 2 -1 Q8 6 15 -4'} fill="none" {...INK} strokeWidth={3}/>
        <ellipse cx={-84} cy={-13} rx={25} ry={14} fill={C.pink} opacity={.36}/><ellipse cx={85} cy={-13} rx={25} ry={14} fill={C.pink} opacity={.36}/>
        {[-1,1].map(side=><g key={side} transform={`scale(${side} 1)`}>{[0,1,2].map(i=><path key={i} d={`M${70+i*9} -18 l-3 9`} stroke={C.pink} strokeWidth={2}/>)}</g>)}
      </g>
      <path d="M-151 52 Q-8 97 144 51 L151 91 Q0 145 -153 95Z" fill={C.yellow} {...INK}/>
      {Array.from({length:15},(_,i)=><path key={i} d={`M${-142+i*20} 72 q10 21 18 6`} fill="none" stroke={C.honey} strokeWidth={2}/>) }
      <g transform={`rotate(${Math.sin(t*1.4)*4} 84 87)`}>
        <path d="M78 82 L112 81 L135 202 Q115 220 88 204Z" fill={C.yellow} {...INK}/>
        {[0,1,2,3,4].map(i=><path key={i} d={`M${90+i*3} ${102+i*21} l11 10 l12 -9`} fill="none" stroke={C.honey} strokeWidth={2}/>) }
      </g>
      {!phone&&action!=='tea'&&<g fill={C.milk} {...INK}>
        <path d="M-144 69 Q-199 97 -170 144 Q-148 159 -126 126" transform={`rotate(${Math.sin(t*1.7)*5} -144 70)`}/>
        <path d="M148 70 Q194 100 166 143 Q145 151 127 122" transform={`rotate(${-Math.sin(t*1.7)*5} 148 70)`}/>
      </g>}
      {phone&&<g transform={`translate(0 ${Math.sin(t*2.2)*2})`}>
        <path d="M-55 98 L41 88 L58 212 L-39 222Z" fill={C.nightLight} {...INK}/><path d="M-44 111 L31 102 L43 198 L-30 207Z" fill={C.blue}/>
        {[0,1,2].map(i=><path key={i} d={`M-25 ${126+(i*29+t*14)%67} l45 -5`} stroke={C.paper} strokeWidth={12} opacity={.5}/>) }
        <path d="M-144 80 Q-97 95 -48 136 Q-22 150 -42 173 Q-100 162 -146 127 M143 80 Q98 97 43 132 Q20 153 44 173 Q100 155 146 126" fill={C.milk} {...INK}/>
        <path d={`M38 ${143-Math.max(0,Math.sin(t*3))*12} q-15 -8 -15 9`} fill={C.milk} {...INK} strokeWidth={3}/>
      </g>}
      {action==='tea'&&<g>
        <path d="M-67 114 Q-4 103 64 115 L53 190 Q-2 212 -57 187Z" fill={C.paper} {...INK}/><path d="M66 125 C110 113 112 179 57 177" fill="none" stroke={C.honey} strokeWidth={9}/>
        <path d={`M-32 ${95+Math.sin(t*2)*4} q-15 -23 3 -43 M0 ${91-Math.sin(t*2)*4} q20 -27 4 -47 M28 96 q16 -23 1 -39`} fill="none" stroke={C.honey} opacity={.5} strokeWidth={3}/>
        <path d="M-145 80 Q-104 94 -60 144 Q-34 157 -55 181 Q-109 161 -145 128 M145 80 Q97 95 59 144 Q33 160 56 182 Q112 161 145 128" fill={C.milk} {...INK}/>
        <path d="M-40 139 q41 -11 78 2" fill="none" stroke={C.green} strokeWidth={5}/>
      </g>}
    </g>
  </g>;
};

const PaperWindow:React.FC<{t:number;warm:boolean}>=({t,warm})=><g>
  <path d="M1110 179 Q1305 127 1538 183 L1525 617 L1099 631Z" fill={C.brown} opacity={.15} transform="translate(12 15)"/>
  <path d="M1110 179 Q1305 127 1538 183 L1525 617 L1099 631Z" fill={warm?C.nightLight:C.night} {...INK} strokeWidth={7}/>
  <path d="M1132 198 Q1314 154 1514 202 L1506 592 L1124 610Z" fill={C.nightLight}/>
  <circle cx={1430} cy={264} r={38} fill={C.cream}/><circle cx={1443} cy={254} r={34} fill={C.nightLight}/>
  {Array.from({length:8},(_,i)=><g key={i}><path d={`M${1133+i*47} 589 v${-85-(i%3)*37} h35 v${85+(i%3)*37}`} fill={C.night}/><path d={`M${1143+i*47} ${522-(i%3)*37} v13`} stroke={C.yellow} strokeWidth={5} opacity={.65}/></g>)}
  {Array.from({length:23},(_,i)=><path key={i} d={`M${1138+i*67%360} ${204+(i*47+t*75)%330} l-10 33`} fill="none" stroke={C.blue} opacity={.35} strokeWidth={2}/>)}
  <path d="M1307 174 L1301 618 M1108 407 L1532 394" stroke={C.cream} strokeWidth={12}/>
  <path d="M1108 407 L1532 394 M1307 174 L1301 618" stroke={C.brown} strokeWidth={2}/>
  <path d={`M1080 171 Q${1030+Math.sin(t)*5} 377 1082 650 L1002 657 L1014 156Z M1555 170 Q${1610+Math.sin(t)*5} 387 1555 644 L1642 652 L1635 161Z`} fill={C.pink} opacity={.55} stroke={C.brown} strokeWidth={3}/>
</g>;

export const StoryWorld:React.FC<{action:Action;t:number;progress:number}>=({action,t,progress})=>{
  const work=action==='work';
  const warm=['putdown','tea','bloom'].includes(action);
  const drift=tween(progress,[0,1],[-12,12]);
  const zoom=tween(progress,[0,1],[1,action==='blanket'?1.065:1.045]);
  return <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
    <defs>
      <clipPath id="story-panel"><path d="M114 157 L1778 145 L1800 873 L122 886Z"/></clipPath>
      <pattern id="story-wallpaper" width="47" height="63" patternUnits="userSpaceOnUse"><path d="M22 10 l6 12 l-6 12 l-6 -12Z" stroke={C.honey} opacity={.13} fill="none" strokeWidth={1.5}/></pattern>
      <linearGradient id="story-wall" x2="1" y2="1"><stop stopColor={warm?C.cream:C.shadow}/><stop offset="1" stopColor={warm?C.yellow:C.nightLight}/></linearGradient>
    </defs>
    <rect width={1920} height={1080} fill={C.cream}/>
    {[0,1,2,3].map(i=><path key={i} d={`M${90+i*6} ${142-i*5} L${1798+i*5} ${131-i*4} L${1824+i*4} ${897+i*5} L${96-i*4} ${913+i*5}Z`} fill={C.paper} stroke={C.honey} strokeWidth={1} opacity={.35}/>) }
    <path d="M114 157 L1778 145 L1800 873 L122 886Z" fill={C.paper} stroke={C.brown} strokeWidth={3}/>
    <g clipPath="url(#story-panel)">
      <g transform={`translate(${960-960*zoom+drift*.25} ${520-520*zoom}) scale(${zoom})`}>
        <rect x={80} y={132} width={1760} height={770} fill="url(#story-wall)"/>
        <rect x={80} y={132} width={1760} height={770} fill="url(#story-wallpaper)"/>
        <path d="M100 692 Q872 654 1820 686 V932 H100Z" fill={C.brown} opacity={.32}/>
        {[0,1,2,3,4,5].map(i=><path key={i} d={`M${i*390-500} 940 L${400+i*270} 690`} stroke={C.brown} opacity={.2} strokeWidth={3}/>) }
        <g transform={`translate(${drift*.3} 0)`}><PaperWindow t={t} warm={warm}/></g>
        <g transform={`translate(${-drift*.45} 0)`}>
          <path d="M282 587 Q443 536 628 576 L614 744 L279 763Z" fill={C.paper} {...INK}/>
          <path d="M300 615 L600 600 M296 659 L599 641 M293 702 L596 681" stroke={C.honey} strokeWidth={3}/>
          {[0,1,2].map(i=><circle key={i} cx={452} cy={618+i*42} r={5} fill={C.honey}/>)}
          <path d="M452 566 V383 M379 388 L405 294 L506 290 L534 382Z" fill={C.yellow} {...INK}/>
          <path d="M380 389 L240 754 L693 755 L533 383Z" fill={C.yellow} opacity={warm?.19:.08}/>
        </g>
        {!work&&<g transform={`translate(${-drift*.65} 0)`}>
          <path d="M577 767 L593 664 Q952 608 1247 674 L1273 797 Q936 851 577 767Z" fill={C.paper} {...INK}/>
          <path d="M585 739 Q952 656 1267 741 L1283 839 Q911 900 570 819Z" fill={C.nightLight} {...INK}/>
          {Array.from({length:9},(_,i)=><path key={i} d={`M${605+i*75} 725 q-30 65 4 130`} fill="none" stroke={C.blue} opacity={.28} strokeWidth={2}/>) }
          <path d="M577 771 Q948 825 1274 775 M577 809 Q952 858 1280 817" stroke={C.blue} opacity={.25} strokeWidth={3} fill="none"/>
          <path d="M570 816 V904 M1279 835 V919" stroke={C.brown} strokeWidth={20}/>
        </g>}
        {work&&<g transform={`translate(${-drift*.65} 0)`}>
          <path d="M554 746 L1328 723 L1387 777 L528 799Z" fill={C.honey} {...INK}/><path d="M565 787 V926 M1339 776 V922" stroke={C.brown} strokeWidth={20}/>
          {[0,1,2,3].map(i=><g key={i} transform={`translate(${594+i*190} ${706-tween(clamp((t-i*.4)/1.5),[0,1],[0,25+i*13])}) rotate(${i%2?3:-4})`}><path d="M0 0 L170 -6 L164 45 L-4 51Z" fill={C.paper} {...INK}/><path d="M11 10 L154 5 M9 25 L151 20 M6 39 L151 33" stroke={C.shadow} strokeWidth={3}/></g>)}
        </g>}
        <g transform={`translate(${action==='clock'||action==='feelings'?760:934} ${work?547:548}) scale(${action==='clock'||action==='feelings'?1.08:1.23})`}><PaperMochi action={action} t={t} p={progress}/></g>
        {action==='blanket'&&<path d="M542 805 Q599 340 888 249 Q1172 255 1300 804 L1241 814 Q1126 387 894 356 Q669 388 608 824Z" fill={C.nightLight} fillOpacity={.69} {...INK}/>} 
        {['clock','feelings'].includes(action)&&<g transform={`translate(1226 401) rotate(${Math.sin(t*.6)*2})`}>
          <path d="M-180 -191 Q-1 -225 178 -188 L190 176 Q0 211 -189 177Z" fill={C.paper} {...INK} strokeWidth={6}/>
          <circle r={143} fill={C.cream} {...INK}/>{Array.from({length:12},(_,i)=><path key={i} d="M0 -126 V-114" transform={`rotate(${i*30})`} stroke={C.honey} strokeWidth={4}/>)}
          <g transform={`rotate(${t*12})`}><path d="M0 15 V-96 M0 0 L62 24" fill="none" stroke={C.brown} strokeWidth={6} strokeLinecap="round"/></g><circle r={7} fill={C.honey}/>
          {Array.from({length:7},(_,i)=>{const a=i*Math.PI*2/7-.6;const pop=tween(clamp((t-i*.22)/.5),[0,1],[0,1]);return <g key={i} transform={`translate(${Math.cos(a)*193} ${Math.sin(a)*193}) scale(${pop})`}><circle r={17} fill={C.green} stroke={C.paper} strokeWidth={5}/></g>;})}
        </g>}
        {['time','balance','drain'].includes(action)&&<g transform={`translate(1365 ${366+Math.sin(t*1.4)*6}) rotate(3)`}>
          <path d="M-136 -67 Q-20 -100 116 -64 Q155 -17 115 49 Q28 77 -95 44 L-147 87 L-118 33 Q-162 -3 -136 -67Z" fill={C.paper} {...INK}/>
          <text textAnchor="middle" y={-16} fill={C.brown} fontSize={27} fontWeight={700}>{action==='time'?'Còn mình thì sao?':'Nghỉ một chút nhé.'}</text><path d="M-57 8 Q0 18 62 5" fill="none" stroke={C.honey} strokeWidth={3}/>
        </g>}
        {action==='tasks'&&[0,1,2].map(i=><g key={i} opacity={1-tween(clamp((t-i*.7)/3),[0,1],[0,.9])} transform={`translate(${650+i*280} ${274+(i%2)*110-t*5}) rotate(${i*11-10})`}><path d="M0 0 L207 9 L194 104 L-8 96Z" fill={C.paper} {...INK}/><path d="M20 25 L178 34 M16 48 L152 56 M15 71 L165 78" stroke={C.honey} strokeWidth={3}/></g>)}
        {action==='putdown'&&<g transform={`translate(${976-tween(progress,[0,.5],[0,484])} ${725-tween(progress,[0,.5],[0,170])}) rotate(${tween(progress,[0,.5],[-7,0])})`}><path d="M-48 -8 L54 -11 L58 4 L-51 11Z" fill={C.nightLight} {...INK}/></g>}
        <g transform={`translate(${1658-drift*1.3} 853) rotate(${Math.sin(t*.8)*2})`}>
          <path d="M-81 0 H65 L45 142 L-54 146Z" fill={C.pink} {...INK}/><path d="M-15 1 Q-97 -130 -63 -251 M-15 1 Q95 -109 68 -211 M-15 1 L8 -308" fill="none" stroke={C.greenDark} strokeWidth={9}/>
          {[[-60,-218,-45],[65,-181,45],[6,-289,-15],[-39,-133,-55],[29,-100,40]].map(([x,y,r],i)=><g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><path d="M0 10 C-86 -8 -61 -54 0 -21 C59 -66 87 -25 0 10Z" fill={i%2?C.green:C.greenDark} {...INK} strokeWidth={2}/><path d="M0 7 V-29" stroke={C.cream} opacity={.4} strokeWidth={2}/></g>)}
        </g>
        {action==='city'&&<g>
          <rect x={80} y={130} width={1760} height={780} fill={C.nightLight}/>
          <circle cx={1465} cy={272} r={64} fill={C.cream}/><circle cx={1487} cy={253} r={61} fill={C.nightLight}/>
          {Array.from({length:14},(_,i)=><g key={i} transform={`translate(${120+i*126-drift*.6} ${390-(i%4)*43})`}>
            <path d={`M0 500 V0 L104 -7 V500Z`} fill={i%2?C.night:C.ink} stroke={C.brown} strokeWidth={3}/>
            {Array.from({length:6},(_,j)=><g key={j}><rect x={18} y={25+j*54} width={21} height={28} fill={C.yellow} opacity={.2+((i+j)%3)*.2}/><rect x={65} y={25+j*54} width={21} height={28} fill={C.yellow} opacity={.15+((i+j+1)%3)*.2}/></g>)}
          </g>)}
          <path d="M92 850 Q790 694 1815 826 V921 H92Z" fill={C.night} stroke={C.brown} strokeWidth={4}/>
          <g transform="translate(1130 390)"><path d="M0 0 L363 -9 L370 357 L-7 368Z" fill={C.yellow} stroke={C.brown} strokeWidth={8}/><path d="M19 15 L346 10 L350 340 L11 348Z" fill={C.cream}/><g transform="translate(178 219) scale(.53)"><PaperMochi action="phone" t={t} p={progress}/></g><path d="M-13 366 L375 352 L384 378 L-16 394Z" fill={C.honey} stroke={C.brown} strokeWidth={4}/></g>
          {Array.from({length:28},(_,i)=><path key={i} d={`M${166+i*61} ${187+(i*53+t*70)%570} l-14 37`} stroke={C.blue} opacity={.14} strokeWidth={2}/>)}
        </g>}
      </g>
    </g>
    <path d="M114 157 L1778 145 L1800 873 L122 886Z" fill="none" stroke={C.brown} strokeWidth={3}/>
    <path d="M96 144 L131 137 L147 196 L111 206Z M1739 121 L1778 126 L1770 191 L1729 182Z" fill={C.yellow} opacity={.5}/>
  </svg>;
};
