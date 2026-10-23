import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/audio.js',import.meta.url),'utf8');
function setup(getUserMedia=async()=>{throw Error('unexpected capture')},role='phone'){
 const elements=new Map(),listeners={},messages=[],tracks=[],posts=[],processors=[];let allowed=true,frame,clock=0,input=0.1;
 const element=id=>{if(!elements.has(id))elements.set(id,{hidden:false,value:-1,textContent:'',disabled:false,open:false,showModal(){this.open=true},close(){this.open=false},setAttribute(){},replaceChildren(){},append(){}});return elements.get(id);};
 const node=()=>({connect(){},disconnect(){},gain:{value:1},fftSize:512,getFloatTimeDomainData(data){data.fill(input)}});
 const window={addEventListener:(type,fn)=>listeners[type]=fn,chrome:{webview:{postMessage:text=>posts.push(text)}}};
 const sender={async replaceTrack(track){tracks.push(track);this.track=track}};
 const peer={getSenders:()=>[sender],getTransceivers:()=>[{sender,receiver:{track:{kind:'audio'}}}]};
 const context=vm.createContext({window,document:{getElementById:element,createElement:()=>element('option')},location:{origin:'https://app.extruda.local'},navigator:{mediaDevices:{getUserMedia}},cancelAnimationFrame(){frame=null},requestAnimationFrame:fn=>{frame=fn;return 1},performance:{now:()=>clock},
  AudioContext:class{constructor(){this.destination={};this.audioWorklet={addModule:async()=>{}};}createMediaStreamSource(){return node()}createAnalyser(){return node()}createGain(){return node()}async resume(){}async close(){}},AudioWorkletNode:class{constructor(){this.port={};processors.push(this)}connect(){}disconnect(){}},Float32Array,Uint8Array,DataView,Math,Number,Array,String,btoa,MediaStream:class{constructor(tracks){this.tracks=tracks;}}});
 vm.runInContext(source,context);
 window.ExtrudaAudio.session({role,peer,send:async data=>messages.push(data),approved:()=>allowed});
 const connect=value=>listeners['extruda-connection']({detail:{connected:value}});
 const click=()=>element('mic-toggle').onclick();
 return{api:window.ExtrudaAudio,window,element,messages,tracks,posts,processors,connect,click,setApproved:value=>allowed=value,tick(value){input=value;clock+=100;frame?.(clock)}};
}
const captured=()=>{let stopped=0;const track={kind:'audio',stop(){stopped++}};return{stream:{getAudioTracks:()=>[track],getTracks:()=>[track]},track,get stopped(){return stopped}}};
test('microphone defaults off, requires a connected approved phone and never opens for a PC request',async()=>{
 let calls=0;const s=setup(async()=>{calls++;return captured().stream});assert.equal(s.element('mic-status').textContent,'Mikrofon fra');
 await s.click();assert.equal(calls,0);s.connect(true);s.setApproved(false);await s.click();assert.equal(calls,0);
 s.setApproved(true);await s.api.control({type:'microphone-request',enabled:true});assert.equal(calls,0);assert.match(s.element('mic-status').textContent,/Pc’en beder/);
});
test('phone toggle sends audio without camera restart; off stops capture and detaches sender',async()=>{
 const c=captured();let constraints;const s=setup(async value=>{constraints=value;return c.stream});s.connect(true);await s.click();
 assert.equal(constraints.video,false);assert.equal(constraints.audio.echoCancellation,true);assert.equal(s.tracks[0],c.track);assert.equal(s.messages.at(-1).enabled,true);
 await s.click();assert.equal(c.stopped,1);assert.equal(s.tracks.at(-1),null);assert.equal(s.messages.at(-1).enabled,false);assert.equal(s.element('mic-level').value,0);
});
test('stop during permission prompt releases a late stream without sending audio',async()=>{
 let resolve;const c=captured();const s=setup(()=>new Promise(r=>resolve=r));s.connect(true);const enable=s.click();await s.api.stop();resolve(c.stream);await enable;
 assert.equal(c.stopped,1);assert.ok(!s.messages.some(m=>m.enabled===true));assert.ok(!s.tracks.includes(c.track));
});
test('remote off cancels a pending permission request and denial allows retry',async()=>{
 let resolve;const c=captured();const s=setup(()=>new Promise(r=>resolve=r));s.connect(true);const enable=s.click();await s.api.control({type:'microphone-request',enabled:false});resolve(c.stream);await enable;assert.equal(c.stopped,1);
 const denied=setup(async()=>{throw Object.assign(Error('denied'),{name:'NotAllowedError'})});denied.connect(true);await denied.click();assert.match(denied.element('mic-status').textContent,/Mikrofon blokeret/);assert.equal(denied.element('mic-toggle').disabled,false);
});
test('PC toggle requests consent and stops native audio immediately when muted',async()=>{
 const s=setup(undefined,'host');s.connect(true);await s.click();assert.equal(s.messages.at(-1).type,'microphone-request');assert.equal(s.messages.at(-1).enabled,true);
 await s.api.control({type:'microphone-state',enabled:true});await s.click();assert.equal(s.messages.at(-1).enabled,false);assert.ok(s.posts.includes('audio-stop'));assert.equal(s.element('mic-level').value,0);
});
test('worklet downmixes channels into bounded 20ms blocks without retaining sent data',()=>{
 const blocks=[];const context=vm.createContext({Float32Array,AudioWorkletProcessor:class{constructor(){this.port={postMessage:value=>blocks.push(value)}}},registerProcessor(name,Type){context.Type=Type}});
 vm.runInContext(readFileSync(new URL('../public/audio-worklet.js',import.meta.url),'utf8'),context);const processor=new context.Type();
 for(let i=0;i<15;i++)processor.process([[new Float32Array(128).fill(0.4),new Float32Array(128).fill(0.2)]]);
 assert.equal(blocks.length,2);assert.equal(blocks[0].length,960);assert.ok(Math.abs(blocks[0][959]-0.3)<0.00001);assert.notEqual(blocks[0].buffer,blocks[1].buffer);
});

test('missing driver opens setup; camera-only hides audio and informs phone; setup restores it',async()=>{
 const s=setup(undefined,'host');s.window.extrudaAudioDevices([]);s.connect(true);
 assert.equal(s.element('audio-setup').open,true);
 await s.element('audio-camera-only').onclick();
 assert.equal(s.element('audio-setup').open,false);assert.equal(s.element('mic-panel').hidden,true);
 assert.equal(s.messages.at(-1).type,'microphone-mode');assert.equal(s.messages.at(-1).enabled,false);
 await s.element('audio-enable').onclick();assert.equal(s.element('mic-panel').hidden,false);assert.equal(s.element('audio-setup').open,true);
 s.window.extrudaAudioDevices([{index:0,name:'CABLE Input (VB-Audio Virtual Cable)'}]);assert.equal(s.element('audio-setup').open,false);
});

test('camera-only message stops an active phone microphone and blocks restart until enabled',async()=>{
 const c=captured();let calls=0;const s=setup(async()=>{calls++;return c.stream});s.connect(true);await s.click();
 await s.api.control({type:'microphone-mode',enabled:false});assert.equal(c.stopped,1);assert.equal(s.element('mic-panel').hidden,true);
 await s.click();assert.equal(calls,1);await s.api.control({type:'microphone-mode',enabled:true});assert.equal(s.element('mic-panel').hidden,false);
});

test('status distinguishes permission, silence, received audio and native acknowledgement',async()=>{
 const phone=setup(async()=>captured().stream);phone.connect(true);await phone.click();
 assert.equal(phone.element('mic-status').textContent,'Afventer mikrofonsignal');
 phone.tick(0);assert.match(phone.element('mic-status').textContent,/Intet mikrofonsignal/);
 phone.tick(0.1);assert.match(phone.element('mic-status').textContent,/registreres på telefonen/);
 const host=setup(undefined,'host');host.window.extrudaAudioDevices([{index:0,name:'CABLE Input (VB-Audio)'}]);host.connect(true);
 host.api.track({kind:'audio'});await host.api.control({type:'microphone-state',enabled:true});host.window.extrudaAudioStarted();
 host.tick(0.1);assert.match(host.element('mic-status').textContent,/endnu ikke sendt/);
 host.processors.at(-1).port.onmessage({data:new Float32Array(960).fill(0.1)});host.window.extrudaAudioAck(false);
 host.tick(0.1);assert.match(host.element('mic-status').textContent,/endnu ikke sendt/);
 host.processors.at(-1).port.onmessage({data:new Float32Array(960).fill(0.1)});host.window.extrudaAudioAck(true);
 host.tick(0.1);assert.match(host.element('mic-status').textContent,/Lyd sendes til Windows/);
 host.tick(0);assert.match(host.element('mic-status').textContent,/Intet mikrofonsignal/);
});
