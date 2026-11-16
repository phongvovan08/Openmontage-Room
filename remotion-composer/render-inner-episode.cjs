/* Disk-bounded Remotion export. Each chunk is rendered by Remotion, including all
 * graphics/captions. Remotion renders the complete audio mix separately; FFmpeg
 * only joins the encoded chunks and muxes that mix, without composing scenes. */
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {bundle} = require('@remotion/bundler');
const {selectComposition, renderMedia, openBrowser} = require('@remotion/renderer');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'Chu-De/Tam-Ly-Noi-Tam/episodes/01-mot-cau-noi-thoang-qua/render');
const propsPath = path.join(__dirname, 'public/demo-props/inner-01-haitrieu.json');
const props = JSON.parse(fs.readFileSync(propsPath, 'utf8'));
const chunks = path.join(output, 'chunks');
fs.mkdirSync(chunks, {recursive: true});
const limit = process.argv.includes('--test') ? 3 : Infinity;
const run = (args) => {
  const r = spawnSync('ffmpeg', args, {encoding: 'utf8', windowsHide: true});
  if (r.status !== 0) throw new Error(r.stderr);
};
(async () => {
  const started = Date.now();
  const serveUrl = await bundle({entryPoint: path.join(__dirname,'src/index.tsx'), publicDir:path.join(__dirname,'public'), onProgress:()=>{}});
  // The freshly generated bundle's public assets are exact copies of ours.
  // Hardlink only those known copies so the render does not consume another 145MB.
  const stagedPublic=path.join(serveUrl,'public');
  const deduplicate=(dir)=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const dest=path.join(dir,e.name);
    if(e.isDirectory()){deduplicate(dest);continue;}
    const src=path.join(__dirname,'public',path.relative(stagedPublic,dest));
    if(fs.existsSync(src) && fs.statSync(src).size===fs.statSync(dest).size){
      if(fs.readFileSync(src).equals(fs.readFileSync(dest))){fs.unlinkSync(dest);fs.linkSync(src,dest);}
    }
  }};
  deduplicate(stagedPublic);
  const browser = await openBrowser('chrome', {logLevel:'error',chromiumOptions:{gl:'vulkan'}});
  let browserClosed = false;
  try {
    const composition = await selectComposition({serveUrl, id:'InnerThoughtsEpisode', inputProps:props, puppeteerInstance:browser, logLevel:'error'});
    const perChunk = 300;
    const count = Math.ceil(composition.durationInFrames/perChunk);
    const common = {composition, serveUrl, inputProps:props, puppeteerInstance:browser,
      concurrency:4, logLevel:'error', offthreadVideoCacheSizeInBytes:256*1024*1024, offthreadVideoThreads:2,
      ffmpegOverride:({args})=>[...args.slice(0,-1),'-threads','2',args[args.length-1]],
      imageFormat:'jpeg', jpegQuality:85, overwrite:true, timeoutInMilliseconds:120000};
    console.log(JSON.stringify({durationInFrames:composition.durationInFrames,count,mode:'disk-bounded Remotion',started:new Date().toISOString()}));
    for(let i=0;i<Math.min(count,limit);i++) {
      const target=path.join(chunks,`chunk-${String(i).padStart(3,'0')}.mp4`);
      if(fs.existsSync(target) && fs.existsSync(target+'.done')) {console.log(`Resume: ${i+1}/${count}`);continue;}
      const from=i*perChunk,to=Math.min(composition.durationInFrames-1,(i+1)*perChunk-1);
      try {
        await renderMedia({...common,outputLocation:target,codec:'h264',crf:21,x264Preset:'fast',muted:true,frameRange:[from,to]});
      } catch(error) {
        if(!String(error).includes('No frame found at position'))throw error;
        console.log(`Retry chunk ${i+1} with one worker and a larger frame cache`);
        await renderMedia({...common,concurrency:1,offthreadVideoCacheSizeInBytes:512*1024*1024,outputLocation:target,codec:'h264',crf:21,x264Preset:'fast',muted:true,frameRange:[from,to]});
      }
      fs.writeFileSync(target+'.done',JSON.stringify({from,to,propsMtime:fs.statSync(propsPath).mtimeMs}));
      console.log(JSON.stringify({chunk:i+1,count,frames:[from,to],size:fs.statSync(target).size,elapsed:Math.round((Date.now()-started)/1000)}));
    }
    if(limit!==Infinity) return;
    const audio=path.join(output,'haitrieu-mix.aac');
    if(!fs.existsSync(audio)) {
      await renderMedia({...common,codec:'aac',outputLocation:audio,audioBitrate:'192k'});
      console.log('Complete Remotion audio mix rendered');
    }
    const list=path.join(chunks,'concat.txt');
    fs.writeFileSync(list,Array.from({length:count},(_,i)=>`file 'chunk-${String(i).padStart(3,'0')}.mp4'`).join('\n')+'\n');
    const target=path.join(output,'01-mot-cau-noi-thoang-qua-haitrieu-1080p.mp4');
    // Release the bundle/public staging space before making the final joined file.
    await browser.close({silent:true}); browserClosed=true;
    fs.rmSync(serveUrl,{recursive:true,force:true});
    run(['-y','-v','error','-f','concat','-safe','0','-i',list,'-i',audio,'-map','0:v:0','-map','1:a:0','-c','copy','-t',String(props.durationSeconds),'-movflags','+faststart',target]);
    fs.writeFileSync(path.join(output,'render-execution.json'),JSON.stringify({runtime:'remotion',composition:composition.id,method:'Remotion frame-range rendering + Remotion audio mix; FFmpeg lossless concat/mux only',fps:composition.fps,frames:composition.durationInFrames,chunks:count,render_seconds:(Date.now()-started)/1000,output:target},null,2));
    console.log('EXPORTED '+target);
  } finally {if(!browserClosed) await browser.close({silent:true}); fs.rmSync(serveUrl,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
