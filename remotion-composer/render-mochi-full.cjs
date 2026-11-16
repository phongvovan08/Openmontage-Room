/* Resume-safe export for the existing Mochi full episode. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {bundle} = require('@remotion/bundler');
const {openBrowser, selectComposition, renderMedia} = require('@remotion/renderer');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'Chu-De/Be-Mochi-Mam-Xanh/tap-01-full-7-cam-xuc-ky-la');
const work = path.join(root, 'scratch/mochi-full-export');
const assets = path.join(work, 'public');
const chunks = path.join(work, 'chunks');
const target = path.join(output, 'be_mochi_tap01_full_7_cam_xuc_16x9.mp4');
for (const dir of [output, work, assets, chunks]) fs.mkdirSync(dir, {recursive:true});
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const log = (value) => {
  const line = JSON.stringify({time:new Date().toISOString(), ...value});
  fs.appendFileSync(path.join(work, 'render.log'), line+'\n');
  console.log(line);
};
const run = (args) => {
  const result = spawnSync('ffmpeg', args, {encoding:'utf8', windowsHide:true});
  if (result.status !== 0) throw new Error(result.stderr || `ffmpeg exit ${result.status}`);
};
const probe = (file) => {
  const r = spawnSync('ffprobe', ['-v','error','-show_entries','format=duration:stream=codec_type,width,height,r_frame_rate,nb_frames','-of','json',file], {encoding:'utf8',windowsHide:true});
  if (r.status !== 0) throw new Error(`Invalid media ${file}: ${r.stderr}`);
  return JSON.parse(r.stdout);
};
const stage = (source, relative) => {
  const dest = path.join(assets,relative);
  fs.mkdirSync(path.dirname(dest), {recursive:true});
  if (fs.existsSync(dest)) {
    if (hash(dest) === hash(source)) return;
    fs.copyFileSync(source,dest);
  } else {
    fs.copyFileSync(source,dest);
  }
};

(async () => {
  const started = Date.now();
  const sourceFolder = path.join(__dirname,'public/episodes/mochi-ep01-full');
  const omniFolder = path.join(process.env.USERPROFILE,'Downloads/mochi-ep01-omni-v8');
  const manifest = [];
  for (let n=1;n<=30;n++) {
    const name = `${String(n).padStart(3,'0')}.mp4`;
    const file = path.join(n<=18 ? omniFolder : sourceFolder,name);
    const meta = probe(file);
    if (Number(meta.format.duration)<7.5) throw new Error(`Clip too short: ${file}`);
    if (n<=18 && hash(file)!==hash(path.join(sourceFolder,name))) fs.copyFileSync(file,path.join(sourceFolder,name));
    stage(file,`episodes/mochi-ep01-full/${name}`);
    manifest.push({shot:n,model:n<=18?'Omni Flash':'Veo 3.1 Fast (existing)',source:file,sha256:hash(file),...meta});
  }
  for (const relative of ['episodes/mochi-ep01-full/narration.mp3','episodes/mochi-ep01/audio/building_20.wav']) stage(path.join(__dirname,'public',relative),relative);
  fs.writeFileSync(path.join(output,'source-manifest.json'),JSON.stringify({date:'2026-11-06',omniShots:18,fastShots:12,flowBlocker:'Out of Credits shown by TurboFlow',clips:manifest},null,2));
  const sourceFiles=['src/BeMochiEp01Full16x9.tsx','src/BeMochiEp01Suite.tsx','src/beMochiEp01FullData.ts','src/components/MochiEp01ScienceViz.tsx','src/Root.tsx'];
  const fingerprint=crypto.createHash('sha256').update(JSON.stringify({sources:sourceFiles.map(f=>[f,hash(path.join(__dirname,f))]),clips:manifest.map(m=>m.sha256),audio:['episodes/mochi-ep01-full/narration.mp3','episodes/mochi-ep01/audio/building_20.wav'].map(f=>hash(path.join(assets,f)))})).digest('hex');
  log({event:'start',fingerprint,omni:18,fast:12});
  const serveUrl=await bundle({entryPoint:path.join(__dirname,'src/index.tsx'),publicDir:assets,onProgress:()=>{}});
  const browser=await openBrowser('chrome',{logLevel:'error'});
  try {
    const composition=await selectComposition({serveUrl,id:'BeMochiEp01Full16x9',puppeteerInstance:browser,logLevel:'error'});
    const common={composition,serveUrl,puppeteerInstance:browser,concurrency:4,logLevel:'error',
      offthreadVideoThreads:1,offthreadVideoCacheSizeInBytes:512*1024*1024,
      imageFormat:'jpeg',jpegQuality:95,overwrite:true,timeoutInMilliseconds:120000,
      ffmpegOverride:({args})=>[...args.slice(0,-1),'-threads','6',args[args.length-1]]};
    const perChunk=900;
    const count=Math.ceil(composition.durationInFrames/perChunk);
    for(let i=0;i<count;i++) {
      const file=path.join(chunks,`chunk-${String(i).padStart(3,'0')}.mp4`);
      const marker=file+'.done.json';
      const from=i*perChunk,to=Math.min(composition.durationInFrames-1,(i+1)*perChunk-1);
      if(fs.existsSync(marker)&&fs.existsSync(file)&&JSON.parse(fs.readFileSync(marker,'utf8')).fingerprint===fingerprint) {
        const video=probe(file).streams.find(s=>s.codec_type==='video');
        if(Number(video.nb_frames)===to-from+1) {log({event:'resumed',chunk:i+1,count});continue;}
      }
      let last=0;
      const options={...common,codec:'h264',crf:18,x264Preset:'fast',muted:true,frameRange:[from,to],outputLocation:file,
        onProgress:p=>{if(Date.now()-last>20000){last=Date.now();log({event:'progress',chunk:i+1,count,frame:from+p.renderedFrames,encoded:p.encodedFrames,total:composition.durationInFrames});}}};
      try { await renderMedia(options); }
      catch(error) {
        log({event:'retry',chunk:i+1,error:String(error).slice(0,1500)});
        await renderMedia({...options,concurrency:1,offthreadVideoThreads:1});
      }
      const video=probe(file).streams.find(s=>s.codec_type==='video');
      if(Number(video.nb_frames)!==to-from+1) throw new Error(`Incomplete chunk ${i}`);
      fs.writeFileSync(marker,JSON.stringify({fingerprint,from,to}));
      log({event:'chunk-complete',chunk:i+1,count,elapsedSeconds:Math.round((Date.now()-started)/1000)});
    }
    const audio=path.join(work,'master-mix.aac');
    log({event:'audio-start'});
    await renderMedia({...common,codec:'aac',audioBitrate:'192k',outputLocation:audio});
    const list=path.join(chunks,'concat.txt');
    fs.writeFileSync(list,Array.from({length:count},(_,i)=>`file 'chunk-${String(i).padStart(3,'0')}.mp4'`).join('\n')+'\n');
    run(['-y','-v','error','-f','concat','-safe','0','-i',list,'-i',audio,'-map','0:v:0','-map','1:a:0','-c','copy','-t',String(composition.durationInFrames/composition.fps),'-movflags','+faststart',target]);
    const metadata=probe(target);
    fs.writeFileSync(path.join(output,'render-execution.json'),JSON.stringify({exportedAt:new Date().toISOString(),composition:composition.id,fingerprint,method:'Remotion video chunks and full Remotion audio mix; FFmpeg stream-copy concat and mux',metadata,omniShots:18,fastShots:12,audioMix:{narration:1,building20:0.05,veo:0.05},elapsedSeconds:Math.round((Date.now()-started)/1000)},null,2));
    log({event:'complete',target,metadata});
  } finally { await browser.close({silent:true}); }
})().catch(error=>{log({event:'failed',error:error.stack||String(error)});process.exitCode=1;});
