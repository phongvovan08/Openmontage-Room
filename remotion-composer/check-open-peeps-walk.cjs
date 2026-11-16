const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const req=id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id);new Function('require','module','exports',js)(req,m,m.exports);cache.set(file,m.exports);return m.exports;}
const {walkState,isWalkShot,foot,knee,WALK_SCALE}=load(path.join(__dirname,'src/open-peeps/walk-motion.ts'));
const out=path.resolve(__dirname,'../Chu-De/Be-Mochi-Mam-Xanh/demo-open-peeps-2d-25d/kiem-tra');
const results={};
for(const mode of ['flat','depth']){
 const contacts=[];let previous=[null,null],maxPlantDrift=0,maxBoneError=0,minFootY=950,supportSamples=0;
 for(let n=0;n<40*240;n++){
  const t=n/240;
  if(!isWalkShot(t)){previous=[null,null];continue;}
  const s=walkState(t,mode),next=walkState(t+1/240,mode);
  for(const [i,offset] of [0,.5].entries()){
   const cycle=Math.floor(s.phase+offset);
   if(previous[i]!==null&&cycle>previous[i]&&s.weight>.5)contacts.push({time:Number(t.toFixed(4)),foot:i===0?'left':'right'});
   previous[i]=cycle;
   const f=foot(s.phase,offset,s.weight),fn=foot(next.phase,offset,next.weight);
   minFootY=Math.min(minFootY,f.point[1]);
   const bob=-7*(1-Math.cos(s.phase*Math.PI*4))*s.weight;
   const length=181+19*s.weight;
   const hip=[i===0?273:327,590+bob],k=knee(hip,f.point,length,length);
   maxBoneError=Math.max(maxBoneError,Math.abs(Math.hypot(k[0]-hip[0],k[1]-hip[1])-length),Math.abs(Math.hypot(k[0]-f.point[0],k[1]-f.point[1])-length));
   if(isWalkShot(t+1/240)&&f.plant&&fn.plant&&s.weight===1&&next.weight===1&&s.direction===next.direction){
    const x=s.x+s.direction*(f.point[0]-300)*WALK_SCALE,xn=next.x+next.direction*(fn.point[0]-300)*WALK_SCALE;
    maxPlantDrift=Math.max(maxPlantDrift,Math.abs(xn-x));supportSamples++;
   }
  }
 }
 results[mode]={contacts,maxPlantDriftPixelsPer240fpsSample:maxPlantDrift,maxBoneLengthError:maxBoneError,maxFootLiftPixels:(950-minFootY)*WALK_SCALE,supportSamples};
 if(maxPlantDrift>.01||maxBoneError>.02||(950-minFootY)*WALK_SCALE<40||contacts.length<12)throw Error('Walk check failed '+mode+' '+JSON.stringify(results[mode]));
}
fs.writeFileSync(path.join(out,'walk-motion-checks.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(results).map(([k,v])=>[k,{...v,contacts:v.contacts.length}]))));
