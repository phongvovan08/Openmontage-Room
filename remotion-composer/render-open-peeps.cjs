const fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderStill,renderMedia}=require('@remotion/renderer');
const root=path.resolve(__dirname,'..'),out=path.join(root,'Chu-De/Be-Mochi-Mam-Xanh/demo-open-peeps-2d-25d');
const work=path.join(root,'scratch/open-peeps'),pub=path.join(work,'public');
fs.mkdirSync(path.join(out,'kiem-tra'),{recursive:true});fs.mkdirSync(pub,{recursive:true});
fs.cpSync(path.join(__dirname,'public/episodes/open-peeps-demo'),path.join(pub,'episodes/open-peeps-demo'),{recursive:true});
const films=[{id:'OpenPeeps2D',key:'flat',file:'open-peeps-2d-v2-di-lai-40s.mp4'},{id:'OpenPeeps25D',key:'depth',file:'open-peeps-2_5d-v2-di-lai-40s.mp4'}];
const log=v=>console.log(JSON.stringify({time:new Date().toISOString(),...v}));
const only=process.argv.find(x=>x.startsWith('--only='))?.split('=')[1];
(async()=>{
 const serveUrl=await bundle({entryPoint:path.join(__dirname,'src/open-peeps-entry.tsx'),publicDir:pub,onProgress:()=>{}});
 const browser=await openBrowser('chrome',{logLevel:'error',chromiumOptions:{gl:'angle'}});
 try{
  for(const film of films.filter(f=>!only||f.key===only)){
   const composition=await selectComposition({serveUrl,id:film.id,puppeteerInstance:browser,logLevel:'error'});
   if(process.argv.includes('--stills')){
    for(const second of (process.argv.includes('--walk-stills')?[.8,1,1.2,1.4,3,11.1,11.3,11.5,15.6,33,35,37]:[3.5,8,15,21.5,25,30,35])){
     await renderStill({serveUrl,composition,puppeteerInstance:browser,frame:Math.round(second*30),output:path.join(out,'kiem-tra',`${film.key}-v2-${second}s.png`),imageFormat:'png',logLevel:'error'});
     log({event:'still',film:film.key,second});
    }
   }else{
    let last=0;log({event:'render-start',film:film.key});
    const silent=path.join(work,film.key+'-silent.mp4');
    await renderMedia({serveUrl,composition,puppeteerInstance:browser,outputLocation:silent,codec:'h264',crf:18,x264Preset:'fast',concurrency:3,muted:true,imageFormat:'jpeg',jpegQuality:95,logLevel:'error',overwrite:true,timeoutInMilliseconds:120000,ffmpegOverride:({args})=>[...args.slice(0,-1),'-threads','6',args[args.length-1]],onProgress:p=>{if(Date.now()-last>15000){last=Date.now();log({event:'progress',film:film.key,frames:p.renderedFrames,total:1200});}}});
    const mux=spawnSync('ffmpeg',['-v','error','-y','-i',silent,'-i',path.join(pub,'episodes/open-peeps-demo',film.key+'-walk.wav'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-t','40','-movflags','+faststart',path.join(out,film.file)],{encoding:'utf8',windowsHide:true});
    if(mux.status!==0)throw Error(mux.stderr);
    log({event:'film-complete',film:film.key});
   }
  }
 }finally{await browser.close({silent:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
