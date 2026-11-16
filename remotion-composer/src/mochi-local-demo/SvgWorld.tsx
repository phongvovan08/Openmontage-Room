import React from 'react';
import {LOCAL_THEME as C, Action, tween, clamp} from './theme';

const activePhone=(a:Action)=>['phone','blanket','time','drain','balance'].includes(a);

/** Separate articulated SVG rig: eyes, hands, scarf, feet and sprout move independently. */
export const SvgMochi:React.FC<{action:Action;t:number;progress:number}>=({action,t,progress})=>{
  const tired=activePhone(action)||['city','work','tasks'].includes(action);
  const holding=activePhone(action)||action==='tea';
  const resting=action==='putdown'||action==='tea'||action==='bloom';
  const cycle=t%4.6;
  const blink=cycle>4.34?1-.94*Math.sin(Math.PI*(cycle-4.34)/.26):1;
  const lean=action==='drain'?tween(progress,[0,1],[0,10]):Math.sin(t*1.5)*1.5;
  const breath=Math.sin(t*2.1);
  const leafTilt=tired?35+Math.sin(t*1.8)*5:Math.sin(t*1.5)*7;
  const scaleY=action==='drain'?1-.07*progress:1+breath*.012;
  return <g transform={`translate(0 ${breath*3}) rotate(${lean})`}>
    <ellipse cx={3} cy={211} rx={158} ry={22} fill={C.ink} opacity={.2}/>
    <g transform={`rotate(${-Math.sin(t*2)*4} -73 178)`}><path d="M-115 153 Q-147 196 -105 205 Q-53 211 -43 174" fill={C.shadow} stroke={C.ink} strokeWidth={5}/></g>
    <g transform={`rotate(${Math.sin(t*2)*4} 75 178)`}><path d="M43 174 Q58 212 111 204 Q145 195 115 152" fill={C.milk} stroke={C.ink} strokeWidth={5}/></g>
    <g transform={`scale(${1-breath*.006} ${scaleY})`}>
      <path d="M-144 134 C-186 72 -168 -76 -96 -153 C-41 -215 45 -221 109 -149 C179 -70 193 85 143 143 C98 188 -99 191 -144 134Z" fill="url(#svg-body)" stroke={C.ink} strokeWidth={5.5}/>
      <path d="M-142 124 Q-151 30 -120 -36" fill="none" stroke={C.paper} strokeWidth={12} opacity={.45} strokeLinecap="round"/>
      <g transform={`rotate(${leafTilt} 0 -194)`}>
        <path d="M0 -192 Q7 -225 1 -252" fill="none" stroke={C.greenDark} strokeWidth={8} strokeLinecap="round"/>
        <path d="M1 -232 C-61 -294 -91 -249 -22 -230Z" fill={action==='drain'?C.honey:C.green} stroke={C.greenDark} strokeWidth={4}/>
        <path d="M3 -245 C49 -298 94 -271 42 -244Z" fill={action==='drain'?C.honey:C.green} stroke={C.greenDark} strokeWidth={4}/>
        <path d="M-48 -252 L-3 -231 M13 -247 L54 -268" stroke={C.greenDark} strokeWidth={2.3} fill="none"/>
      </g>
      {action==='bloom'&&<g transform={`translate(0 -264) scale(${tween(progress,[0,.48],[0,1])})`}>
        {[0,72,144,216,288].map(deg=><ellipse key={deg} cx={0} cy={-21} rx={13} ry={23} fill={C.yellow} transform={`rotate(${deg})`}/>)}
        <circle r={12} fill={C.paper}/>
      </g>}
      <ellipse cx={-83} cy={-17} rx={25} ry={12} fill={C.pink} opacity={.47}/><ellipse cx={83} cy={-17} rx={25} ry={12} fill={C.pink} opacity={.47}/>
      {resting?<g fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round"><path d="M-61 -53 Q-47 -38 -32 -53 M32 -53 Q47 -38 61 -53"/></g>:<g fill={C.ink}>
        <ellipse cx={-47} cy={-53} rx={9} ry={(tired?7:13)*blink}/><ellipse cx={47} cy={-53} rx={9} ry={(tired?7:13)*blink}/>
        {tired&&<path d="M-64 -61 H-30 M30 -61 H64" stroke={C.ink} strokeWidth={5} strokeLinecap="round"/>}
      </g>}
      <path d={tired?'M-12 3 Q0 -5 12 3':'M-15 -4 Q-7 10 0 1 Q7 10 15 -4'} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round"/>
      <path d="M-137 50 Q-8 95 139 50 L145 95 Q0 140 -143 96Z" fill={C.yellow} stroke={C.ink} strokeWidth={5}/>
      {Array.from({length:13},(_,i)=><path key={i} d={`M${-123+i*20} 73 l8 12 l8 -8`} fill="none" stroke={C.honey} strokeWidth={2.5}/>)}
      <g transform={`rotate(${Math.sin(t*1.7)*3} 74 85)`}><path d="M66 77 Q102 67 105 97 L117 196 Q103 213 74 198 L61 109Z" fill={C.yellow} stroke={C.ink} strokeWidth={4}/><path d="M78 98 l9 13 l9 -10 M81 128 l9 13 l9 -10 M85 159 l9 13 l9 -10 M89 188 l9 10" fill="none" stroke={C.honey} strokeWidth={2.5}/></g>
      {!holding&&<g stroke={C.ink} strokeWidth={5} fill={C.milk}>
        <path d="M-145 55 Q-203 100 -168 147 Q-150 159 -122 126" transform={`rotate(${Math.sin(t*1.7)*6} -144 65)`}/>
        <path d="M146 57 Q200 93 171 140 Q152 157 127 123" transform={`rotate(${-Math.sin(t*1.7)*6} 145 65)`}/>
      </g>}
      {activePhone(action)&&<g>
        <g transform={`translate(0 118) rotate(${-7+Math.sin(t)*2})`}>
          <rect x={-49} y={-42} width={98} height={154} rx={17} fill={C.ink} stroke={C.nightLight} strokeWidth={5}/>
          <rect x={-40} y={-30} width={80} height={127} rx={9} fill={C.blue}/>
          {[0,1,2].map(i=><rect key={i} x={-30} y={-18+((t*24+i*40)%111)} width={60} height={24} rx={5} fill={i%2?C.paper:C.nightLight} opacity={.5}/>)}
          <path d="M-12 -35 H12" stroke={C.muted} strokeWidth={3} strokeLinecap="round"/>
        </g>
        <path d="M-139 85 Q-95 98 -42 131 Q-21 149 -42 166 Q-90 154 -140 132" fill={C.milk} stroke={C.ink} strokeWidth={5}/>
        <path d="M138 84 Q99 94 43 134 Q24 151 44 168 Q92 158 142 131" fill={C.milk} stroke={C.ink} strokeWidth={5}/>
        <ellipse cx={28} cy={142-Math.max(0,Math.sin(t*3))*16} rx={12} ry={18} fill={C.milk} stroke={C.ink} strokeWidth={3}/>
      </g>}
      {action==='tea'&&<g>
        <rect x={-64} y={111} width={128} height={87} rx={18} fill={C.green} stroke={C.ink} strokeWidth={5}/><path d="M63 127 C116 116 115 183 65 179" fill="none" stroke={C.greenDark} strokeWidth={13}/>
        <path d={`M-24 ${97+breath*4} Q-43 67 -23 44 M12 ${92-breath*3} Q37 70 19 39`} stroke={C.paper} strokeWidth={5} fill="none" strokeLinecap="round" opacity={.65}/>
        <path d="M-140 85 Q-86 92 -58 143 Q-36 166 -65 173 Q-107 157 -139 131 M140 85 Q97 94 58 142 Q37 165 65 174 Q109 158 142 131" fill={C.milk} stroke={C.ink} strokeWidth={5}/>
      </g>}
    </g>
  </g>;
};

export const SvgWorld:React.FC<{action:Action;t:number;progress:number}>=({action,t,progress})=>{
  const work=action==='work';
  const closing=['putdown','tea','bloom'].includes(action);
  const clock=action==='clock'||action==='feelings';
  const camera=tween(progress,[0,1],[1,1.035]);
  return <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
    <defs>
      <linearGradient id="svg-wall" x2="1" y2="1"><stop stopColor={C.night}/><stop offset="1" stopColor={closing?C.brown:C.nightLight}/></linearGradient>
      <linearGradient id="svg-body" x2=".8" y2="1"><stop stopColor={C.milk}/><stop offset="1" stopColor={C.shadow}/></linearGradient>
      <linearGradient id="svg-window" x2="0" y2="1"><stop stopColor={C.nightLight}/><stop offset="1" stopColor={C.night}/></linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#svg-wall)"/>
    <g transform={`translate(${960-960*camera} ${540-540*camera}) scale(${camera})`}>
      {[0,1,2,3,4,5,6,7,8,9].map(i=><path key={i} d={`M${i*230-100} 140 V870`} stroke={C.blue} opacity={.035} strokeWidth={3}/>)}
      <rect x={1080} y={128} width={600} height={480} rx={160} fill={C.night} stroke={C.blue} strokeWidth={8} opacity={.85}/>
      <rect x={1105} y={153} width={550} height={430} rx={139} fill="url(#svg-window)"/>
      <circle cx={1504} cy={249} r={45} fill={C.cream} opacity={.8}/><circle cx={1521} cy={236} r={41} fill={C.nightLight}/>
      {Array.from({length:12},(_,i)=><g key={i} opacity={.5}><rect x={1110+i*46} y={430-(i%4)*33} width={35} height={150+(i%4)*33} fill={C.ink}/><rect x={1120+i*46} y={447-(i%4)*33} width={6} height={11} fill={C.yellow}/></g>)}
      {Array.from({length:24},(_,i)=><path key={i} d={`M${1130+(i*61)%495} ${170+(i*43+t*90)%360} l-9 30`} stroke={C.blue} strokeWidth={2} opacity={.18}/>)}
      <path d="M1100 147 Q1040 380 1100 612 M1662 148 Q1723 380 1660 614" fill="none" stroke={C.nightLight} strokeWidth={50}/>
      <path d="M0 878 Q970 830 1920 879 V1080 H0Z" fill={C.night} opacity={.8}/>
      {[0,1,2,3].map(i=><path key={i} d={`M${i*550-400} 1080 L${600+i*350} 870`} stroke={C.blue} opacity={.06} strokeWidth={2}/>)}
      {!work&&<g>
        <path d="M806 765 Q1110 669 1645 738 L1718 850 Q1420 924 829 872Z" fill={C.nightLight} stroke={C.ink} strokeWidth={7}/>
        <path d="M821 817 Q1240 749 1695 802 L1715 876 Q1270 945 830 886Z" fill={C.blue} opacity={.18}/>
        {[0,1,2,3,4,5].map(i=><path key={i} d={`M${875+i*132} 773 q28 44 12 98`} stroke={C.blue} opacity={.14} strokeWidth={3}/>)}
      </g>}
      {closing&&<g><path d="M1607 651 H1807 L1825 675 H1593Z M1622 674 V906 M1791 674 V906" fill={C.honey} stroke={C.ink} strokeWidth={6}/><path d="M1703 650 V484" stroke={C.honey} strokeWidth={10}/><path d="M1639 485 L1666 383 H1745 L1776 485Z" fill={C.yellow}/><path d="M1640 486 L1500 807 H1900 L1776 486Z" fill={C.yellow} opacity={.06}/></g>}
      {work&&<g>{[0,1,2,3].map(i=><g key={i} transform={`translate(${870+i*200} ${720-tween(clamp((t-i*.5)/2),[0,1],[120,0])})`}>
        <rect width={178} height={65+i*23} rx={8} fill={i%2?C.muted:C.paper} stroke={C.ink} strokeWidth={4}/>{[0,1,2].map(j=><path key={j} d={`M18 ${18+j*14} H153`} stroke={C.ink} opacity={.15}/>)}</g>)}<rect x={800} y={839} width={994} height={28} rx={6} fill={C.honey}/></g>}
      <g transform={`translate(${clock?1140:1260} ${clock?638:work?608:604}) scale(${clock?1.05:1.26})`}><SvgMochi action={action} t={t} progress={progress}/></g>
      {action==='blanket'&&<path d="M930 820 Q952 537 1065 361 Q1218 235 1416 395 Q1514 513 1576 818 Q1405 891 930 820Z" fill={C.night} stroke={C.blue} strokeWidth={5} fillOpacity={.4} strokeOpacity={.15}/>}
      {clock&&<g transform="translate(1460 305) scale(.85)">
        <circle r={171} fill={C.night} stroke={C.yellow} strokeWidth={7}/>{Array.from({length:12},(_,i)=><path key={i} d="M0 -148 V-136" stroke={C.muted} strokeWidth={4} transform={`rotate(${i*30})`}/>)}
        <g transform={`rotate(${t*10})`}><path d="M0 18 V-103 M0 0 L67 41" fill="none" stroke={C.yellow} strokeWidth={7} strokeLinecap="round"/></g><circle r={9} fill={C.yellow}/>
        {Array.from({length:7},(_,i)=>{const a=i*Math.PI*2/7+t*.11;return <circle key={i} cx={Math.cos(a)*219} cy={Math.sin(a)*219} r={9+tween(clamp((t-i*.22)/.8),[0,1],[0,5])} fill={i===2?C.pink:C.green} opacity={tween(clamp((t-i*.22)/.8),[0,1],[0,1])}/>;})}
      </g>}
      {['time','balance','drain'].includes(action)&&<g transform={`translate(${1020+Math.sin(t)*9} 309) rotate(-8)`}><path d="M-170 -60 Q0 -86 174 -54 L169 59 Q0 91 -168 54Z" fill={C.paper} stroke={C.ink} strokeWidth={4}/><text textAnchor="middle" y={-4} fill={C.ink} fontSize={29} fontWeight={700}>{action==='time'?'“Chưa đến lượt mình…”':action==='drain'?'Ngày mai cần được nghỉ.':'Mình cũng cần nghỉ.'}</text><path d="M0 67 L36 103 L58 63" fill={C.paper}/></g>}
      {action==='tasks'&&[0,1,2,3].map(i=><g key={i} opacity={1-tween(clamp((t-i*.6)/3),[0,1],[0,.9])} transform={`translate(${910+i*220} ${310+(i%2)*105-Math.sin(t+i)*10}) rotate(${i*7-10})`}><rect width={190} height={95} rx={14} fill={C.cream}/><path d="M24 30 H160 M24 51 H124 M24 72 H140" stroke={C.ink} opacity={.3} strokeWidth={5}/></g>)}
      {action==='putdown'&&<g transform={`translate(${1544+tween(progress,[0,.4],[0,135])} ${817-tween(progress,[0,.4],[0,183])}) rotate(${tween(progress,[0,.45],[-12,0])})`}><rect width={95} height={17} rx={8} fill={C.ink} stroke={C.muted} strokeWidth={3}/></g>}
      <g transform={`translate(1820 937) rotate(${Math.sin(t*.9)*2})`}><path d="M-65 0 H65 L45 135 H-45Z" fill={C.honey}/><path d="M0 0 Q-60 -75 -20 -161 M0 0 Q80 -50 60 -142 M0 0 V-209" fill="none" stroke={C.greenDark} strokeWidth={9}/>{[-1,1].map(i=><g key={i} transform={`scale(${i} 1)`}><ellipse cx={43} cy={-127} rx={55} ry={20} fill={C.greenDark} transform="rotate(-40 43 -127)"/><ellipse cx={24} cy={-195} rx={43} ry={18} fill={C.green} transform="rotate(-33 24 -195)"/></g>)}</g>
    </g>
  </svg>;
};
