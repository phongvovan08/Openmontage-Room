const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderMedia,renderStill}=require('@remotion/renderer');
const root=path.resolve(__dirname,'..'),out=path.join(root,'Chu-De/Be-Mochi-Mam-Xanh/demo-3-phong-cach-tham-khao');
const work=path.join(root,'scratch/mochi-three-styles'),publicDir=path.join(work,'public'),qa=path.join(out,'kiem-tra');
for(const p of [out,work,publicDir,qa])fs.mkdirSync(p,{recursive:true});
fs.cpSync(path.join(__dirname,'public/episodes/mochi-three-styles'),path.join(publicDir,'episodes/mochi-three-styles'),{recursive:true});
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const files=['src/MochiThreeStyles.tsx',...fs.readdirSync(path.join(__dirname,'src/mochi-three-styles')).map(f=>'src/mochi-three-styles/'+f)];
const fingerprint=crypto.createHash('sha256').update(files.map(f=>hash(path.join(__dirname,f))).join('')).digest('hex');
const log=o=>{const s=JSON.stringify({at:new Date().toISOString(),...o});console.log(s);fs.appendFileSync(path.join(work,'render.log'),s+'\n');};
const run=(cmd,args)=>{const p=spawnSync(cmd,args,{encoding:'utf8',windowsHide:true});if(p.status!==0)throw Error(p.stderr);return p.stdout;};
const probe=f=>JSON.parse(run('ffprobe',['-v','error','-show_format','-show_streams','-of','json',f]));
const allFilms=[{id:'MochiReferenceFlat',key:'flat',file:'01_mochi_2d_giai_thich_40s.mp4'},{id:'MochiReferenceOffice',key:'office',file:'02_mochi_van_phong_3d_40s.mp4'},{id:'MochiReferenceWorld',key:'world',file:'03_mochi_the_gioi_2d_40s.mp4'}];
const only=process.argv.find(a=>a.startsWith('--only='))?.split('=')[1];
const films=only?allFilms.filter(f=>f.key===only):allFilms;
(async()=>{
 const started=Date.now();log({event:'bundle'});
 const serveUrl=await bundle({entryPoint:path.join(__dirname,'src/mochi-three-styles-entry.tsx'),publicDir,onProgress:()=>{}});
 const browser=await openBrowser('chrome',{logLevel:'error',chromiumOptions:{gl:'angle'}});
 try{
  for(const film of films){
   const composition=await selectComposition({serveUrl,id:film.id,puppeteerInstance:browser,logLevel:'error'});
   if(process.argv.includes('--stills')){
    const seconds=process.argv.includes('--quick')?[1,8,25]:[1,3.5,8,12,17,21.5,25,30,34.5,38.5];
    for(const sec of seconds){await renderStill({serveUrl,composition,puppeteerInstance:browser,frame:Math.round(sec*30),output:path.join(qa,`${film.key}-${sec}s.png`),imageFormat:'png',logLevel:'error',timeoutInMilliseconds:120000});log({event:'still',film:film.key,second:sec});}
    continue;
   }
   const chunks=path.join(work,film.key);fs.mkdirSync(chunks,{recursive:true});
   const bench=process.argv.includes('--bench'),count=bench?1:2,size=bench?60:600;
   const common={composition,serveUrl,puppeteerInstance:browser,concurrency:film.key==='office'?2:4,muted:true,logLevel:'error',imageFormat:'jpeg',jpegQuality:95,overwrite:true,timeoutInMilliseconds:120000,codec:'h264',crf:18,x264Preset:'fast',ffmpegOverride:({args})=>[...args.slice(0,-1),'-threads','6',args[args.length-1]]};
   for(let i=0;i<count;i++){
    const target=path.join(chunks,bench?'benchmark.mp4':`part-${i}.mp4`),marker=target+'.done';
    const from=i*size,to=(i+1)*size-1;
    if(!bench&&fs.existsSync(marker)&&fs.existsSync(target)&&fs.readFileSync(marker,'utf8')===fingerprint&&Number(probe(target).streams.find(s=>s.codec_type==='video').nb_frames)===size){log({event:'resume',film:film.key,chunk:i+1});continue;}
    let last=0;const settings={...common,frameRange:[from,to],outputLocation:target,onProgress:p=>{if(Date.now()-last>20000){last=Date.now();log({event:'progress',film:film.key,frame:from+p.renderedFrames,total:bench?60:1200});}}};
    try{await renderMedia(settings);}catch(error){log({event:'retry',film:film.key,error:String(error)});await renderMedia({...settings,concurrency:1});}
    if(Number(probe(target).streams.find(s=>s.codec_type==='video').nb_frames)!==size)throw Error('Wrong frame count');
    fs.writeFileSync(marker,fingerprint);log({event:'chunk',film:film.key,chunk:i+1,count});
   }
   if(bench)continue;
   const list=path.join(chunks,'concat.txt');fs.writeFileSync(list,"file 'part-0.mp4'\nfile 'part-1.mp4'\n");
   run('ffmpeg',['-y','-v','error','-f','concat','-safe','0','-i',list,'-i',path.join(publicDir,'episodes/mochi-three-styles/master.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t','40','-movflags','+faststart',path.join(out,film.file)]);
   log({event:'film-complete',film:film.key});
  }
  if(!process.argv.includes('--stills')&&!process.argv.includes('--bench')){
   const result={createdAt:new Date().toISOString(),durationSeconds:40,fps:30,width:1080,height:1920,fingerprint,elapsedSeconds:Math.round((Date.now()-started)/1000),films:allFilms.filter(f=>fs.existsSync(path.join(out,f.file))).map(f=>({style:f.key,file:f.file,sha256:hash(path.join(out,f.file)),metadata:probe(path.join(out,f.file))}))};
   fs.writeFileSync(path.join(out,'render-report.json'),JSON.stringify(result,null,2));
  }
  log({event:'complete',elapsedSeconds:Math.round((Date.now()-started)/1000)});
 }finally{await browser.close({silent:true});}
})().catch(e=>{log({event:'error',error:e.stack||String(e)});process.exitCode=1;});
