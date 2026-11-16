const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderMedia,renderStill}=require('@remotion/renderer');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'Chu-De/Be-Mochi-Mam-Xanh/so-sanh-svg-va-truyen-tranh');
const work=path.join(root,'scratch/mochi-local-comparison');
const publicDir=path.join(work,'public');
const qa=path.join(out,'kiem-tra');
for(const p of [out,work,publicDir,qa])fs.mkdirSync(p,{recursive:true});
fs.cpSync(path.join(__dirname,'public/episodes/mochi-local-comparison'),path.join(publicDir,'episodes/mochi-local-comparison'),{recursive:true});
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sourceFiles=['src/MochiLocalComparison.tsx','src/mochi-local-demo/theme.ts','src/mochi-local-demo/SvgWorld.tsx','src/mochi-local-demo/StoryWorld.tsx'];
const fingerprint=hash(path.join(__dirname,sourceFiles[0]))+sourceFiles.slice(1).map(f=>hash(path.join(__dirname,f))).join('');
const log=o=>{const s=JSON.stringify({at:new Date().toISOString(),...o});console.log(s);fs.appendFileSync(path.join(work,'render.log'),s+'\n');};
const ffmpeg=args=>{const p=spawnSync('ffmpeg',args,{encoding:'utf8',windowsHide:true});if(p.status!==0)throw Error(p.stderr);};
const probe=file=>{const p=spawnSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file],{encoding:'utf8',windowsHide:true});if(p.status!==0)throw Error(p.stderr);return JSON.parse(p.stdout);};
const films=[{id:'MochiSvgLocalDemo',key:'svg',file:'01_mochi_hoat_hinh_svg_114s.mp4'},{id:'MochiStoryLocalDemo',key:'story',file:'02_mochi_truyen_tranh_chuyen_dong_114s.mp4'}];

(async()=>{
 const started=Date.now();log({event:'bundle'});
 const serveUrl=await bundle({entryPoint:path.join(__dirname,'src/mochi-local-demo-entry.tsx'),publicDir,onProgress:()=>{}});
 const browser=await openBrowser('chrome',{logLevel:'error'});
 try{
  const compositions={};
  for(const film of films){
   const composition=await selectComposition({serveUrl,id:film.id,puppeteerInstance:browser,logLevel:'error'});
   compositions[film.key]=composition;
   if(process.argv.includes('--stills')){
    for(const sec of [3,13,20,36,60,98,106,112]){
     await renderStill({serveUrl,composition,puppeteerInstance:browser,frame:sec*30,output:path.join(qa,`${film.key}-${sec}s.png`),imageFormat:'png',logLevel:'error'});
     log({event:'still',film:film.key,second:sec});
    }
   }
  }
  if(process.argv.includes('--stills'))return;
  for(const film of films){
   const chunks=path.join(work,film.key);fs.mkdirSync(chunks,{recursive:true});
   const composition=compositions[film.key];
   const common={composition,serveUrl,puppeteerInstance:browser,concurrency:4,muted:true,logLevel:'error',imageFormat:'jpeg',jpegQuality:95,offthreadVideoThreads:1,overwrite:true,timeoutInMilliseconds:90000,codec:'h264',crf:18,x264Preset:'fast',ffmpegOverride:({args})=>[...args.slice(0,-1),'-threads','6',args[args.length-1]]};
   const chunkSize=900,count=Math.ceil(composition.durationInFrames/chunkSize);
   for(let i=0;i<count;i++){
    const target=path.join(chunks,`part-${i}.mp4`),marker=target+'.done';
    const from=i*chunkSize,to=Math.min(composition.durationInFrames-1,(i+1)*chunkSize-1);
    if(fs.existsSync(marker)&&fs.existsSync(target)&&fs.readFileSync(marker,'utf8')===fingerprint&&Number(probe(target).streams.find(s=>s.codec_type==='video').nb_frames)===to-from+1){log({event:'resume',film:film.key,chunk:i+1});continue;}
    let last=0;const settings={...common,frameRange:[from,to],outputLocation:target,onProgress:p=>{if(Date.now()-last>20000){last=Date.now();log({event:'progress',film:film.key,frame:from+p.renderedFrames,total:composition.durationInFrames});}}};
    try{await renderMedia(settings);}catch(error){log({event:'retry',film:film.key,chunk:i+1,error:String(error)});await renderMedia({...settings,concurrency:1});}
    const n=Number(probe(target).streams.find(s=>s.codec_type==='video').nb_frames);if(n!==to-from+1)throw Error('Wrong chunk frame count');
    fs.writeFileSync(marker,fingerprint);log({event:'chunk',film:film.key,chunk:i+1,count});
   }
   const list=path.join(chunks,'concat.txt');fs.writeFileSync(list,Array.from({length:count},(_,i)=>`file 'part-${i}.mp4'`).join('\n'));
   const output=path.join(out,film.file);
   ffmpeg(['-y','-v','error','-f','concat','-safe','0','-i',list,'-i',path.join(publicDir,'episodes/mochi-local-comparison/master.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t','114','-movflags','+faststart',output]);
   log({event:'film-complete',film:film.key,file:output});
  }
  const result={createdAt:new Date().toISOString(),durationSeconds:114,fps:30,width:1920,height:1080,fingerprint,elapsedSeconds:Math.round((Date.now()-started)/1000),films:films.map(f=>({style:f.key,file:f.file,sha256:hash(path.join(out,f.file)),metadata:probe(path.join(out,f.file))}))};
  fs.writeFileSync(path.join(out,'render-report.json'),JSON.stringify(result,null,2));log({event:'complete',elapsedSeconds:result.elapsedSeconds});
 }finally{await browser.close({silent:true});}
})().catch(error=>{log({event:'error',error:error.stack||String(error)});process.exitCode=1;});
