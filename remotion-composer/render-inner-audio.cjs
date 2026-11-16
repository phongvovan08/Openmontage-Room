// Render the exact composition audio tracks without loading visual assets.
const fs=require('node:fs');
const path=require('node:path');
const {bundle}=require('@remotion/bundler');
const {openBrowser,selectComposition,renderMedia}=require('@remotion/renderer');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'Chu-De/Tam-Ly-Noi-Tam/episodes/01-mot-cau-noi-thoang-qua/render');
const props={...JSON.parse(fs.readFileSync(path.join(__dirname,'public/demo-props/inner-01-haitrieu.json'),'utf8')),beats:[],captions:[],chapters:[],fontRegular:'',fontSemibold:''};
(async()=>{
 const serveUrl=await bundle({entryPoint:path.join(__dirname,'src/index.tsx'),publicDir:path.join(__dirname,'public')});
 const browser=await openBrowser('chrome',{logLevel:'error'});
 try{
  const composition=await selectComposition({serveUrl,id:'InnerThoughtsEpisode',inputProps:props,puppeteerInstance:browser});
  let last=-1;
  const temp=path.join(out,'haitrieu-mix.rendering.aac');
  await renderMedia({serveUrl,composition,inputProps:props,puppeteerInstance:browser,codec:'aac',outputLocation:temp,audioBitrate:'192k',concurrency:1,logLevel:'error',overwrite:true,onProgress:p=>{const n=Math.floor(p.progress*10);if(n!==last){last=n;console.log(`Audio render: ${n*10}%`);}}});
  fs.renameSync(temp,path.join(out,'haitrieu-mix.aac'));
  console.log('Complete Remotion audio mix ready.');
 }finally{await browser.close({silent:true});fs.rmSync(serveUrl,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
