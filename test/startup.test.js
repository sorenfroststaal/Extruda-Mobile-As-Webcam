import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/startup.js',import.meta.url),'utf8');
function setup({native=true,reduced=false,dark=false,fail=false}={}){
 const messages=[];const listeners={},timers=new Map();let plays=0,pauses=0;
 const video={addEventListener:(n,f)=>listeners[n]=f,play(){plays++;return fail?Promise.reject(Error('codec')):Promise.resolve()},pause(){pauses++},load(){},removeAttribute(n){delete this[n]}};
 const button={addEventListener:(n,f)=>listeners[n]=f};
 const overlay={style:{},hidden:true,querySelector:s=>s==='video'?video:button};
 const document={createElement:()=>({getContext:()=>({drawImage(){},getImageData:()=>({data:[37,44,44,255]})})}),documentElement:{dataset:{theme:dark?'dark':'light'}},getElementById:id=>id==='startup'?overlay:id==='approval'?{addEventListener:(n,f)=>listeners[n]=f}:null,addEventListener:(n,f)=>listeners[n]=f,removeEventListener:n=>delete listeners[n]};
 const window={chrome:native?{webview:{postMessage:m=>messages.push(m)}}:undefined,matchMedia:()=>({matches:reduced,addEventListener:(n,f)=>listeners.motion=f}),ExtrudaI18n:{t:()=> 'Skip'}};
 vm.runInNewContext(source,{document,window,setTimeout:(f,ms)=>{timers.set(ms,f);return ms},clearTimeout:id=>timers.delete(id)});
 return {overlay,video,button,listeners,timers,messages,get plays(){return plays},get pauses(){return pauses}};
}
test('startup is native only and respects reduced motion without loading media',()=>{
 for(const options of [{native:false},{reduced:true}]){const s=setup(options);assert.equal(s.overlay.hidden,true);assert.equal(s.plays,0);assert.equal(s.video.src,undefined)}
});
test('startup uses local theme master, stays muted and exits on completion',()=>{
 for(const dark of [true,false]){const s=setup({dark});assert.equal(s.video.src,`/brand/extruda-logo-${dark?'dark':'light'}-web.webm`);assert.equal(s.video.muted,true);assert.equal(s.overlay.hidden,false);s.listeners.ended();assert.equal(s.overlay.hidden,true);assert.equal(s.timers.size,0);assert.equal(s.pauses,1)}
});
test('startup cannot trap the app on codec failure, timeout, skip, approval or keyboard',async()=>{
 for(const action of [s=>s.listeners.error(),s=>s.timers.get(4500)(),s=>s.listeners.click(),s=>s.listeners.keydown({key:'Escape'}),s=>s.listeners.keydown({key:'Tab'}),s=>s.listeners.toggle({newState:'open'}),s=>s.listeners.motion({matches:true})]){const s=setup();action(s);assert.equal(s.overlay.hidden,true)}
 const failed=setup({fail:true});await Promise.resolve();assert.equal(failed.overlay.hidden,true);
});

test('startup plays approved native audio only while visible and matches decoded background',()=>{const s=setup();s.listeners.playing();assert.equal(s.messages[0],'startup-sound');assert.equal(s.overlay.style.backgroundColor,'rgb(37, 44, 44)');s.listeners.click();assert.equal(s.messages.at(-1),'startup-sound-stop');s.listeners.playing();assert.equal(s.messages.length,2)});
