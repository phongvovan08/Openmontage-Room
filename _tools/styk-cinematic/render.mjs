import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {makeAssets} from './assets.mjs';
import {makeProps} from './props.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const appRoot=path.join(root,'scratch/stykanimate-review'),out=path.join(root,'Chu-De/Be-Mochi-Mam-Xanh/demo-stykanimate-cau-chuyen');
const {chromium}=await import(pathToFileURL(path.join(appRoot,'tests/support/playwright.mjs')));
const {default:backend}=await import(pathToFileURL(path.join(appRoot,'desktop/backend.cjs')));
await fs.mkdir(path.join(out,'assets'),{recursive:true});await fs.mkdir(path.join(out,'qa'),{recursive:true});
const server=await backend.startBackend({appRoot});let browser;
const log=(event,extra={})=>console.log(JSON.stringify({time:new Date().toISOString(),event,...extra}));
try{
 browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1600,height:1000},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);log('pageerror',{message:e.message});});
 await page.addInitScript(()=>{delete window.showSaveFilePicker;});
 await page.goto(server.origin);await page.waitForFunction(()=>window.styk?.ready,{timeout:60000});log('ready');
 const vector={...makeAssets(),...makeProps()};
 const images=await page.evaluate(async assets=>{
  const result={};
  for(const [key,a] of Object.entries(assets)){
   const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(a.svg);await im.decode();
   const canvas=document.createElement('canvas');canvas.width=a.width;canvas.height=a.height;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0,a.width,a.height);
   result[key]={width:a.width,height:a.height,dataUrl:canvas.toDataURL('image/png')};
   if(key.startsWith('head-')||['torso','phone','shoe','hand','grip'].includes(key)){
    ctx.clearRect(0,0,a.width,a.height);ctx.save();ctx.translate(a.width,0);ctx.scale(-1,1);ctx.drawImage(im,0,0,a.width,a.height);ctx.restore();
    result[key+'-left']={width:a.width,height:a.height,dataUrl:canvas.toDataURL('image/png')};
   }
  }return result;
 },vector);
 for(const [key,a] of Object.entries(images))await fs.writeFile(path.join(out,'assets',key+'.png'),Buffer.from(a.dataUrl.split(',')[1],'base64'));
 for(const [key,a] of Object.entries(vector))await fs.writeFile(path.join(out,'assets',key+'.svg'),a.svg);
 log('assets',{count:Object.keys(images).length});
 if(process.argv.includes('--assets'))process.exitCode=0;
 else{
  const copy=path.join(appRoot,'artifacts/cinematic');await fs.mkdir(copy,{recursive:true});await fs.copyFile(path.join(here,'film.mjs'),path.join(copy,'film.mjs'));
  const words=JSON.parse(await fs.readFile(path.join(root,'remotion-composer/src/mochi-three-styles/words.json'),'utf8'));
  const result=await page.evaluate(async({images,words})=>{const {buildFilm}=await import('/artifacts/cinematic/film.mjs?v='+Date.now());return await buildFilm(images,words);},{images,words});
  await fs.writeFile(path.join(out,'motion-events.json'),JSON.stringify(result.events,null,2));log('authored',result.summary);
  await page.waitForTimeout(1000);
  for(const sec of [1.5,3.5,7.8,12.5,17,21.5,25,30,35]){
   await page.evaluate(t=>styk.editor.seek(Math.round(t*30)),sec);
   const pending=page.waitForEvent('download',{timeout:90000});await page.evaluate(()=>styk.actions['export-png']());
   await(await pending).saveAs(path.join(out,'qa',`native-${sec}s.png`));log('still',{sec});
  }
  await page.screenshot({path:path.join(out,'qa/app-project.png')});
  if(!process.argv.includes('--stills')){
   let pending=page.waitForEvent('download',{timeout:120000});await page.locator('[data-action="save"]').first().click();await(await pending).saveAs(path.join(out,'cau-chuyen-40s.styk'));log('project-saved');
   pending=page.waitForEvent('download',{timeout:900000});const timer=setInterval(()=>log('rendering'),25000);
   try{await page.evaluate(()=>styk.actions['export-mp4']());const download=await pending;const failure=await download.failure();if(failure)throw Error(failure);await download.saveAs(path.join(out,'stykanimate-hinh-40s.mp4'));}finally{clearInterval(timer);}
   log('native-mp4-complete');
   const audio=spawnSync('python',[path.join(here,'build_audio.py')],{encoding:'utf8',windowsHide:true});if(audio.status!==0)throw Error(audio.stderr);log('audio',{output:audio.stdout.trim()});
   const mux=spawnSync('ffmpeg',['-v','error','-y','-i',path.join(out,'stykanimate-hinh-40s.mp4'),'-i',path.join(out,'audio/master.wav'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-t','40','-movflags','+faststart',path.join(out,'stykanimate-cau-chuyen-40s.mp4')],{encoding:'utf8',windowsHide:true});if(mux.status!==0)throw Error(mux.stderr);
   log('master-complete');
  }
  await fs.writeFile(path.join(out,'production-report.json'),JSON.stringify({app:'StykAnimate 1.2.5',renderer:await page.evaluate(()=>styk.state.renderer.stats.backend),errors,...result.summary},null,2));
 }
}finally{await browser?.close();await server.stop();}
