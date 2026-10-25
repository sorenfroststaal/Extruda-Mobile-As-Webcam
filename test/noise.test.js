import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/noise.js',import.meta.url),'utf8');
function setup(){
 let now=0,timerId=0;const timers=new Map(),elements=new Map(),posts=[],delivered=[],players=[],listeners={};
 const element=id=>{if(!elements.has(id))elements.set(id,{value:55,disabled:false,checked:false,textContent:'',dataset:{},events:{},setAttribute(){},addEventListener(t,f){this.events[t]=f},showModal(){this.open=true},close(){this.open=false;this.events.close?.()}});return elements.get(id);};
 const track={stop(){this.stopped=true}};
 const context={state:'running',createMediaStreamDestination:()=>({stream:{getTracks:()=>[track],getAudioTracks:()=>[track]}})};
 const window={chrome:{webview:{postMessage:m=>posts.push(m)}},addEventListener:(t,f)=>listeners[t]=f};
 vm.runInNewContext(source,{window,document:{getElementById:element},location:{origin:'https://app.extruda.local'},performance:{now:()=>now},Float32Array,Uint8Array,DataView,Map,Math,Number,Object,String,btoa,atob,
  setTimeout:(fn,delay)=>{const id=++timerId;timers.set(id,{fn,time:now+delay});return id},clearTimeout:id=>timers.delete(id),
  AudioWorkletNode:class{constructor(){this.port={postMessage:p=>delivered.push(p)};players.push(this)}connect(){}disconnect(){}},
  AudioContext:class{constructor(){this.destination={}}createBuffer(c,n){return{getChannelData:()=>new Float32Array(n)}}createBufferSource(){return{connect(){},disconnect(){},start(){},stop(){}}}createGain(){return{gain:{},connect(){},disconnect(){}}}async resume(){}async close(){}}
 });
 const api=window.ExtrudaNoise,advance=ms=>{const end=now+ms;for(let i=0;i<10000;i++){const next=[...timers].filter(([,v])=>v.time<=end).sort((a,b)=>a[1].time-b[1].time)[0];if(!next)break;now=next[1].time;timers.delete(next[0]);next[1].fn();}now=end;};
 const epoch=()=>Number(posts.filter(p=>p.startsWith('filter-start:')).at(-1).split(':')[1]);
 const enable=()=>{api.bind(context,()=>{});element('audio-denoise').checked=true;element('audio-denoise').onchange();api.ready(epoch());};
 const packet=()=>{api.accept(new Float32Array(960).fill(0.2));const [,e,seq,db,data]=posts.at(-1).split(':');return{e:Number(e),seq:Number(seq),db:Number(db),data};};
 return{api,element,posts,delivered,context,advance,epoch,enable,packet,window};
}
test('real filter attenuation changes live, output meters and recording track remain available',()=>{
 const s=setup();s.enable();const first=s.packet();assert.equal(first.db,36);assert.ok(s.api.track());
 s.api.result(first.e,first.seq,first.data);assert.equal(s.api.snapshot().phase,'active');assert.ok(s.element('noise-output-level').value>0);
 s.element('noise-strength').value=0;s.element('noise-strength').oninput();assert.equal(s.packet().db,6);
 s.element('noise-strength').value=100;s.element('noise-strength').oninput();assert.equal(s.packet().db,60);
});
test('idle input is not a failure, only an unanswered submitted block triggers one retry',()=>{
 const s=setup();s.enable();s.advance(60000);assert.equal(s.api.snapshot().retries,0);
 const old=s.packet();s.advance(2501);assert.equal(s.api.snapshot().phase,'retrying');assert.equal(s.api.snapshot().retries,1);
 s.api.accept(new Float32Array(960).fill(0.1));assert.equal(s.delivered.at(-1)[0],Math.fround(0.1));
 s.advance(500);const current=s.epoch();assert.notEqual(current,old.e);
 s.api.failure(old.e,'pipe');assert.equal(s.api.snapshot().phase,'starting');
 s.api.ready(current);const next=s.packet();s.api.failure(next.e,'pipe');assert.equal(s.api.snapshot().phase,'failed');assert.equal(s.api.snapshot().requested,false);
 const attempts=s.posts.filter(p=>p.startsWith('filter-start:')).length;s.advance(60000);assert.equal(s.posts.filter(p=>p.startsWith('filter-start:')).length,attempts);
});
test('stale and duplicate blocks cannot play sound or revive disabled filtering',()=>{
 const s=setup();s.enable();const p=s.packet();s.api.result(p.e-1,p.seq,p.data);assert.equal(s.delivered.length,0);
 s.api.result(p.e,p.seq,p.data);s.api.result(p.e,p.seq,p.data);assert.equal(s.delivered.length,1);
 s.api.detach();s.api.result(p.e,p.seq,p.data);assert.equal(s.api.track(),null);assert.equal(s.delivered.length,1);
});
test('preview only collects after explicit start, bounds memory and clears on close or failure',()=>{
 const s=setup();s.enable();let p=s.packet();s.api.result(p.e,p.seq,p.data);assert.equal(s.api.snapshot().previewSamples,0);
 s.element('noise-listen').onclick();s.element('noise-preview-start').onclick();
 for(let i=0;i<550;i++){p=s.packet();s.api.result(p.e,p.seq,p.data);}
 assert.equal(s.api.snapshot().previewSamples,480000);s.advance(10000);assert.equal(s.element('noise-play-raw').disabled,false);
 s.element('noise-play-raw').onclick();s.element('noise-play-clean').onclick();s.element('noise-preview-close').onclick();assert.equal(s.api.snapshot().previewSamples,0);
 s.element('noise-listen').onclick();s.element('noise-preview-start').onclick();p=s.packet();s.api.result(p.e,p.seq,p.data);s.api.failure(p.e,'queue');assert.equal(s.api.snapshot().previewSamples,0);assert.equal(s.element('noise-play-clean').disabled,true);
});
test('bounded pending queue and suspended graph do not cause runaway restarts',()=>{
 const s=setup();s.enable();for(let i=0;i<20;i++)s.api.accept(new Float32Array(960));assert.equal(s.api.snapshot().pending,4);assert.equal(s.api.snapshot().skipped,16);
 s.context.state='suspended';s.advance(2501);assert.equal(s.api.snapshot().phase,'waiting');assert.equal(s.api.snapshot().retries,0);
 s.context.state='running';s.api.accept(new Float32Array(960));assert.equal(s.api.snapshot().phase,'starting');
});
