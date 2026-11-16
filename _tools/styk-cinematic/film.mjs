const C={ink:0x20343e,navy:0x142a36,cream:0xf5e8d7,gold:0xf5b65a,teal:0x5f8a85,clay:0xc5785f,skin:0xf0c9a9,pants:0x34525e};
const rgb=n=>[n>>16&255,n>>8&255,n&255];
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const E=(t,a,b,x=0,y=1)=>x+(y-x)*smooth((t-a)/(b-a));
const spring=(t,a)=>{const v=Math.max(0,t-a);return t<a?0:1-Math.exp(-v*8)*Math.cos(v*11);};
const BEATS=[0,2.4,5.7,10.4,20,23.3,28.5,32.3,40];
const S=.85,DUTY=.62,STRIDE=180,CYCLE=STRIDE/DUTY*S;
function travel(t){
 if(t<5.7){const d=E(t,2.4,5.15,0,700);return {x:500+d,dist:d,dir:1};}
 if(t>=10.4&&t<20){if(t<14.9){const d=E(t,10.45,14.15,0,350);return {x:1200-d,dist:d,dir:-1};}const d=E(t,15.05,19.7,0,350);return {x:850+d,dist:350+d,dir:1};}
 if(t>=32.3){const d=E(t,32.35,39.1,0,790);return {x:1170+d,dist:d,dir:1};}
 return {x:1200,dist:0,dir:1};
}
function motion(t){const a=travel(t),lo=travel(t-.001),hi=travel(t+.001);const moving=(t>=2.4&&t<5.7)||(t>=10.4&&t<20)||t>=32.3;const speed=moving?Math.abs(hi.x-lo.x)/.002:0;return {...a,phase:a.dist/CYCLE,w:smooth(speed/60)};}
function foot(phase,offset,w){const p=((phase+offset)%1+1)%1;let x,y,roll;if(p<DUTY){x=90-180*p/DUTY;y=330;roll=0;}else{const u=(p-DUTY)/(1-DUTY);x=E(u,0,1,-90,90);y=330-58*Math.sin(Math.PI*u);roll=-.3*Math.sin(Math.PI*u);}return {x:(offset?36:-36)*(1-w)+x*w,y:330+(y-330)*w,roll:roll*w,plant:p<DUTY,p};}
function joint(a,b,l1,l2,bend=-1){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.max(.001,Math.min(l1+l2-.001,Math.hypot(dx,dy)));const q=Math.atan2(dy,dx)+bend*Math.acos(Math.max(-1,Math.min(1,(d*d+l1*l1-l2*l2)/(2*d*l1))));return [a[0]+Math.cos(q)*l1,a[1]+Math.sin(q)*l1];}
function camera(t,b){
 if(b===0)return {x:0,y:0,scale:E(t,0,2.4,1,.96),angle_rad:0,is_default:false};
 if(b===1)return {x:E(t,2.4,5.7,0,80),y:40,scale:E(t,2.4,5.7,1,.92),angle_rad:0,is_default:false};
 if(b===2)return {x:245,y:-120,scale:E(t,5.7,10.4,.75,.70),angle_rad:Math.sin(t*.6)*.007,is_default:false};
 if(b===3)return {x:E(t,10.4,20,40,-10),y:35,scale:.98,angle_rad:Math.sin(t*.8)*.012,is_default:false};
 if(b===4)return {x:225,y:-110,scale:E(t,20,23.3,.77,.73),angle_rad:0,is_default:false};
 if(b===5)return {x:0,y:0,scale:1,angle_rad:0,is_default:false};
 if(b===6)return {x:140,y:-60,scale:E(t,28.5,32.3,.86,.80),angle_rad:0,is_default:false};
 return {x:0,y:20,scale:E(t,32.3,40,.96,1),angle_rad:0,is_default:false};
}

export async function buildFilm(images,words){
 const [{emptyDocument,createObject,createFrame},{createImageFigure},{placedSpriteFigure},{compileTextFigure,loadTextFont}]=await Promise.all([import('/src/demo.mjs'),import('/src/media-authoring.mjs'),import('/src/sprite-placement-dialog.mjs'),import('/src/text-authoring.mjs')]);
 const report=emptyDocument();report.canvas_width=1920;report.canvas_height=1080;report.fps=30;report.figure_types=[];report.keyframes=[];report._styk.name='Mot tin nhan - ca con bao';
 const font=await loadTextFont({bold:true}),regular=await loadTextFont({bold:false});
 let id=1;const figs={},texts=new Map();
 const define=(name,f)=>{f.figure_type_id=id++;f.name=name;report.figure_types.push(f);figs[name]=f;return f;};
 for(const [key,a] of Object.entries(images)){
  let anchor={x:Math.floor(a.width/2),y:Math.floor(a.height/2)};
  if(key.startsWith('head-'))anchor={x:key.endsWith('-left')?130:150,y:300};
  if(key.startsWith('torso'))anchor={x:130,y:310};
  if(key.startsWith('shoe'))anchor={x:key.endsWith('-left')?102:28,y:15};
  if(key.startsWith('hand')||key.startsWith('grip'))anchor={x:key.endsWith('-left')?a.width-25:25,y:15};
  if(key==='phone'||key==='phone-left')anchor={x:key.endsWith('-left')?65:20,y:110};
  const f=createImageFigure({...a,name:key,figureTypeId:id});
  define(key,placedSpriteFigure(f,{start:anchor,end:{x:anchor.x+100,y:anchor.y}}));
 }
 function lineFigure(name,width,color){return define(name,{segments:[{segment_id:1,parent_id:0,length:100,angle_rad:0,thickness:width,bend_rad:0,primitive_code:0,aux_code:0,flags:0,segment_type:'line',segment_kind:'line',color_rgb:rgb(color),transparency:0,visible:true,z_order:1}],segment_count:1,polyfills:[],image_assets:[],text_assets:[]});}
 lineFigure('outlineLeg',56,C.ink);lineFigure('pantsFront',47,C.pants);lineFigure('pantsBack',47,0x253f4c);
 lineFigure('outlineArm',53,C.ink);lineFigure('sleeve',44,C.clay);lineFigure('sleeveBack',44,0xa86350);lineFigure('neck',43,C.skin);
 lineFigure('rain',1,0x9abfc4);lineFigure('streak',2,0xf5b65a);
 function textFigure(text,size=40,color=C.cream,bold=true){const key=[text,size,color,bold].join('|');if(!texts.has(key))texts.set(key,define('Text '+texts.size,compileTextFigure({text,fontSize:size,bold,color:rgb(color),alignment:'left',lineHeight:1.22,name:'Narrative text',figureTypeId:id},bold?font:regular)));return texts.get(key);}
 const pages=[];let pg=[];for(const w of words){pg.push(w);if(w.pageBreakAfter||pg.length>=7){pages.push(pg);pg=[];}}if(pg.length)pages.push(pg);
 for(const page of pages)textFigure(page.map(w=>w.word).join(' '),39,C.cream,true);
 const title1=textFigure('Chỉ một tin nhắn.',79,C.cream),title2=textFigure('Cả buổi chiều lo.',79,C.gold);
 const titles=['MỘT CÂU CHƯA RÕ.','CÓ PHẢI MÌNH LÀM SAI?','CƠN BÃO TRONG ĐẦU','DỪNG LẠI MỘT NHỊP','HỎI RÕ, THAY VÌ ĐOÁN','THỰC TẾ NHẸ NHÀNG HƠN'];
 titles.forEach(s=>textFigure(s,26,C.gold));
 ['TIN NHẮN TỪ SẾP','CHIỀU NAY · 14:32','Đã gửi','SẾP ĐANG TRẢ LỜI…'].forEach(s=>textFigure(s,23,C.teal));
 textFigure('Chiều gặp anh chút nhé.',43,C.ink);textFigure('Dạ, em cần chuẩn bị\ngì không ạ?',38,C.ink);
 textFigure('Không có gì đâu, anh muốn khen\nbản thiết kế của em.',36,C.ink);
 ['MÌNH LÀM SAI?','SẾP ĐANG GIẬN?','SẮP MẤT VIỆC?'].forEach(s=>textFigure(s,38,C.cream));
 textFigure('Chưa biết thì hỏi.',66,C.cream);textFigure('Chưa xảy ra,\nđừng tự kết luận.',66,C.gold);textFigure('Một câu hỏi. Nhẹ cả buổi chiều.',30,C.cream,false);
 for(let i=1;i<=8;i++){const a='Dạ, em cần chuẩn bị gì không ạ?'.split(' ');textFigure(a.slice(0,i).join(' '),29,C.ink,false);}
 textFigure('Hít vào.',40,C.cream);textFigure('Thở ra.',40,C.cream);

 let list=[],cam,uid;
 const add=(name,n,x,y,scale=1,angle=0,alpha=1,extra={})=>{if(alpha<=.001||!figs[name])return;list.push(createObject(figs[name],n,x,y,{scale,angles:[angle],field28:Math.round(255*(1-clamp(alpha))),...extra}));};
 const screen=(x,y)=>{const a=cam.angle_rad||0,dx=(x-960)*cam.scale,dy=(y-540)*cam.scale;return [960+cam.x+dx*Math.cos(a)-dy*Math.sin(a),540+cam.y+dx*Math.sin(a)+dy*Math.cos(a)];};
 function screenImage(name,n,x,y,scale=1,alpha=1,angle=0){const a=screen(x,y);add(name,n,a[0],a[1],scale*cam.scale,angle+(cam.angle_rad||0),alpha);}
 function putText(text,n,x,y,size=40,color=C.cream,bold=true,alpha=1,center=false){const f=textFigure(text,size,color,bold);if(alpha<=.001)return;let xx=x;if(center)xx-=f.segments[0].length/2;const a=screen(xx,y);list.push(createObject(f,n,a[0],a[1],{scale:cam.scale,angles:[cam.angle_rad||0],field28:Math.round(255*(1-clamp(alpha)))}));}
 function worldText(text,n,x,y,size=40,color=C.cream,alpha=1,scale=1){const f=textFigure(text,size,color);list.push(createObject(f,n,x-f.segments[0].length*scale/2,y,{scale,field28:Math.round(255*(1-clamp(alpha)))}));}
 function worldLine(name,n,a,b,scale=1,alpha=1){const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);add(name,n,a[0],a[1],scale,Math.atan2(dy,dx),alpha,{len_flag:1,lengths:[len/scale]});}
 function human(t,b){
  const m=motion(t),hero=b===5?650:m.x,s=S,breathe=b===4?Math.sin((t-20)*Math.PI/2.7):0;
  const hipY=624-(m.w*8*(1-Math.cos(m.phase*Math.PI*4)))-breathe*5,dir=m.dir;
  const xy=p=>[hero+p[0]*s*dir,hipY+p[1]*s];
  const suffix=dir<0?'-left':'';
  const a=foot(m.phase,0,m.w),z=foot(m.phase,.5,m.w),hips=[[-30,0],[30,0]];
  const segLen=166+19*m.w;
  const leftK=joint(hips[0],[a.x,a.y],segLen,segLen),rightK=joint(hips[1],[z.x,z.y],segLen,segLen);
  const phase=m.phase*Math.PI*2;
  const ls=[-65,-170],rs=[65,-170];
  let lh=[-110+Math.sin(phase)*62*m.w,30-Math.abs(Math.sin(phase))*18*m.w],rh=[123,-85];
  if(b===2||b===3){lh=[-100+Math.sin(t*2.2)*7,-300];rh=[120,-112+Math.sin(t*2)*7];}
  if(b===4){lh=[-5,-140+breathe*8];rh=[125,-5];}
  if(b===5){lh=[90,-100];rh=[133,-125+Math.sin(t*14)*2];}
  if(b===6){lh=[-110,-20];rh=[130,-100];}
  if(b===7){lh=[-110+Math.sin(phase)*70*m.w,0];rh=[95-Math.sin(phase)*70*m.w,0];}
  const lk=joint(ls,lh,120,120,b===2||b===3?-1:1),rk=joint(rs,rh,120,120,-1);
  add('shadow',400,hero+8,940,.68,0,.8);
  const limb=(name,n,p,q)=>worldLine(name,n,xy(p),xy(q),s);
  for(const [n,h,k,f,back] of [[410,hips[0],leftK,[a.x,a.y],true],[420,hips[1],rightK,[z.x,z.y],false]]){
   limb('outlineLeg',n,h,k);limb('outlineLeg',n+1,k,f);limb(back?'pantsBack':'pantsFront',n+2,h,k);limb(back?'pantsBack':'pantsFront',n+3,k,f);
   const pos=xy(f);add('shoe'+suffix,n+4,pos[0],pos[1],s,dir*(back?a.roll:z.roll));
  }
  limb('outlineArm',440,ls,lk);limb('outlineArm',441,lk,lh);limb('sleeveBack',442,ls,lk);limb('sleeveBack',443,lk,lh);
  const lhp=xy(lh);add('hand'+suffix,444,lhp[0],lhp[1],s*.75,dir*.1);
  worldLine('neck',450,xy([0,-230]),xy([0,-280]),s);
  const bodyPos=xy([0,3]);add('torso'+suffix,500,bodyPos[0],bodyPos[1],s*.75,Math.sin(phase)*.018*m.w);
  let emotion=b===2?'worried':b===3?'panic':b===4?'eyesClosed':b>=6?'smile':'neutral';
  if((t+.3)%4.1>3.96&&b!==2&&b!==3)emotion='eyesClosed';
  const headPos=xy([0,-232]);add('head-'+emotion+suffix,501,headPos[0],headPos[1],s*.70,dir*((b===2?.06:b===4?.045:b>=6?-.04:0)+Math.sin(t*1.1)*.012));
  limb('outlineArm',460,rs,rk);limb('outlineArm',461,rk,rh);limb('sleeve',462,rs,rk);limb('sleeve',463,rk,rh);
  const rhp=xy(rh);
  if(b!==7)add('phone'+suffix,465,rhp[0]+s*dir*4,rhp[1]-s*12,s*.74,dir*.08);
  add('grip'+suffix,466,rhp[0],rhp[1],s*.65,dir*.1);
  return {x:hero,head:headPos,m};
 }

 for(let frame=0;frame<1200;frame++){
  const t=frame/30,b=Math.max(0,BEATS.findIndex((x,i)=>t>=x&&t<BEATS[i+1]));cam=camera(t,b);list=[];uid=1;
  add('office',1,960,540,1);
  const mind=b===3?E(t,10.4,11.2)*E(t,19.5,20,1,0):0;
  if(mind)add('anxiety',2,960+Math.sin(t*.4)*12,540,1.02,Math.sin(t*.3)*.009,mind*.92);
  // Actual small moving rain strokes, rather than a motionless backdrop.
  for(let i=0;i<22;i++){const x=140+(i*137)%620,y=190+(i*83+t*(42+i%3*15))%470;worldLine('rain',100+i,[x,y],[x-9,y+29],1,.15);}
  if(b===0){
   const p=spring(t,.05),phoneY=565+(1-p)*180;
   add('shadow',20,1350,920,.9,0,.5);
   screenImage('bigphone',21,1370,phoneY,.88,clamp(p),-.055+Math.sin(t*.7)*.007);
   putText('Chỉ một tin nhắn.',22,130,365,79,C.cream,true,clamp(spring(t,.2)));
   putText('Cả buổi chiều lo.',23,130,475,79,C.gold,true,clamp(spring(t,.44)));
   putText('MỘT CÂU CHƯA RÕ.',24,135,240,26,C.gold,true,E(t,.6,1.1));
   if(t>1.5){const a=E(t,1.5,2.1);screenImage('message',700,1335,480,.63,a);putText('CHIỀU NAY · 14:32',701,1140,443,23,C.teal,true,a);putText('Chiều gặp anh chút nhé.',702,1110,506,30,C.ink,true,a);}
  }else{
   const person=human(t,b);
   if(b===1){const p=clamp(spring(t,2.43));add('message',700,520,680,.74,0,p);worldText('TIN NHẮN TỪ SẾP',701,500,640,23,C.teal,p);worldText('Chiều gặp anh chút nhé.',702,520,710,43,C.ink,p,.83);putText('MỘT CÂU CHƯA RÕ.',703,110,125,26,C.gold,true,E(t,2.4,3));}
   if(b===2){
    putText('CÓ PHẢI MÌNH LÀM SAI?',800,105,118,26,C.gold);
    ['MÌNH LÀM SAI?','SẾP ĐANG GIẬN?','SẮP MẤT VIỆC?'].forEach((txt,i)=>{const p=clamp(spring(t,5.95+i*1.43));const sx=200+i*25,sy=310+i*170;screenImage('fear',810+i*2,sx+250,sy,.8,p,[-.045,.035,-.025][i]);putText(txt,811+i*2,sx+100,sy+8,32,C.cream,true,p);});
   }
   if(b===3){
    putText('CƠN BÃO TRONG ĐẦU',800,115,118,26,C.gold);
    const positions=[[430+Math.sin(t*.65)*65,340],[1490+Math.sin(t*.7)*45,400],[480+Math.sin(t*.8)*80,720]];
    ['MÌNH LÀM SAI?','SẾP ĐANG GIẬN?','SẮP MẤT VIỆC?'].forEach((txt,i)=>{const p=clamp(spring(t,10.5+i*.22));const [x,y]=positions[i];add('fear',810+i*2,x,y,.88,Math.sin(t*.7+i)*.045,p);worldText(txt,811+i*2,x,y+8,38,C.cream,p,.88);});
   }
   if(b===4){
    putText('DỪNG LẠI MỘT NHỊP',800,115,120,26,C.gold);
    const breath=1+.10*Math.sin((t-20)*Math.PI/2.7);screenImage('ring',820,470,520,breath,.7);putText(t<21.65?'Hít vào.':'Thở ra.',821,470,535,40,C.cream,true,1,true);
   }
   if(b===5){
    putText('HỎI RÕ, THAY VÌ ĐOÁN',800,110,150,26,C.gold);
    screenImage('bigphone',900,1370,565,.90,1,.025);
    const p=clamp(spring(t,23.5));screenImage('message',901,1360,475,.49,p);
    const count=Math.min(8,Math.floor(E(t,23.5,25.6,1,9))),a='Dạ, em cần chuẩn bị gì không ạ?'.split(' ').slice(0,count);
    const txt=a.slice(0,4).join(' ')+(count>4?'\n'+a.slice(4).join(' '):'');
    putText(txt,902,1203,count>4?515:480,29,C.ink,false,p);
    if(t>25.6)putText('Đã gửi',903,1500,598,23,C.teal,false,E(t,25.6,25.9));
    if(t>26.2){for(let i=0;i<3;i++)screenImage('glint',910+i,1295+i*35,650-Math.sin(t*5-i)*5,.045,.55);}
   }
   if(b===6){
    const p=clamp(spring(t,28.6));screenImage('praise',700,500,420,.88,p);putText('TIN NHẮN TỪ SẾP',701,270,355,21,C.teal,true,p);putText('Không có gì đâu, anh muốn khen\nbản thiết kế của em.',702,210,465,34,C.ink,true,p);
    putText('THỰC TẾ NHẸ NHÀNG HƠN',800,110,130,26,C.gold,true,E(t,28.5,29));
    for(let i=0;i<6;i++){const q=E(t,28.6+i*.06,29.6+i*.06);const a=1-E(t,29.3,31.2);add('glint',850+i,person.head[0]+Math.cos(i*1.2)*(80+70*q),person.head[1]-60-Math.sin(i*.8)*100*q,.13+q*.07,i*.5+q,a);}
   }
   if(b===7){
    putText('Chưa biết thì hỏi.',800,150,360,66,C.cream,true,E(t,32.3,32.8));
    putText('Chưa xảy ra,\nđừng tự kết luận.',801,150,555,66,C.gold,true,E(t,32.7,33.3));
    putText('Một câu hỏi. Nhẹ cả buổi chiều.',802,155,660,30,C.cream,false,E(t,35.2,36));
   }
  }
  if(t>28.5)add('warm',1200,960,540,1,0,E(t,28.5,31));
  add('foreground',1201,960+Math.sin(t*.21)*8,540,1.01,0,b===0?.4:.7);
  const active=pages.find((p,i)=>t>=p[0].start-.025&&t<Math.min(p[p.length-1].end+.15,pages[i+1]?.[0].start??Infinity));
  if(active){const txt=active.map(w=>w.word).join(' ');screenImage('caption',2000,960,994,.87,1);putText(txt,2001,960,1008,39,C.cream,true,1,true);}
  screenImage('bars',3000,960,540,1,1);
  const f=createFrame(list,1);f.camera=cam;f._stykBackgroundColor=0xff142a36;f._styk={easing:{interpolation:'hold'}};report.keyframes.push(f);
 }
 const editor=styk.editor;editor.load(report,'Một tin nhắn, cả cơn bão');
 function effect(target,type,start,duration,params){const id=editor.addVfxClip(target,type,{start:Math.round(start*30),duration:Math.round(duration*30)});const fx=editor.getVfxClips().find(c=>c.id===id).effects[0];editor.setVfxClipParameters(id,fx.id,params);return {id,fx};}
 effect({kind:'figure',uid:700},'glow',2.4,3.3,{radius:12,intensity:.24,color:C.gold});
 for(const uid of [810,812,814])effect({kind:'figure',uid},'turbulence',10.4,9.6,{amount:3,size:110,evolution:8,detail:2,seed:uid});
 effect({kind:'scene'},'particles',28.5,3.5,{emission:1,count:28,life:65,look:16,color:C.gold,size:8,speed:3.5,direction:-85,spread:125,gravity:.015,x:.58,y:.39,seed:21,glow:.15});
 effect({kind:'scene'},'vignette',0,40,{amount:.15,softness:.8});
 const events=[];let last=[null,null];
 for(let i=0;i<40*120;i++){const t=i/120,m=motion(t);if(m.w<.45){last=[null,null];continue;}for(let k=0;k<2;k++){const q=Math.floor(m.phase+k*.5);if(last[k]!==null&&q>last[k])events.push({time:Number(t.toFixed(4)),kind:'footstep',foot:k?'right':'left',x:m.x});last[k]=q;}}
 editor.seek(90);editor.markSaved();
 return {summary:{duration:40,width:1920,height:1080,fps:30,frames:editor.totalTicks,shots:8,figures:report.figure_types.length,effects:editor.getVfxClips().length,footsteps:events.length},events};
}
