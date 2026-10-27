import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8').split("if (fragment.has('room')) {")[0];
function setup(getUserMedia,timers={setTimeout,clearTimeout}) {
  const elements=new Map();
  const element=id=>{if(!elements.has(id))elements.set(id,{hidden:false,disabled:false,value:'environment',textContent:'',addEventListener(){},getContext(){return{clearRect(){}}},close(){this.open=false}});return elements.get(id)};
  const context=vm.createContext({console:{...console,error(){}},CustomEvent,TextEncoder,TextDecoder,Uint8Array,URLSearchParams,URL,atob,btoa,setTimeout:timers.setTimeout,clearTimeout:timers.clearTimeout,
    crypto:{getRandomValues:a=>a,subtle:{decrypt:async(_a,_b,data)=>data,encrypt:async()=>new Uint8Array(),digest:(...args)=>webcrypto.subtle.digest(...args)}},
    location:{hash:'',pathname:'/',origin:'https://example.test',protocol:'https:'},history:{replaceState(){}},
    document:{getElementById:element,addEventListener(){},body:{classList:{remove(){}}}},window:{addEventListener(){},dispatchEvent(){}},
    navigator:{mediaDevices:{getUserMedia}},WebSocket:{OPEN:1}});
  vm.runInContext(source+`;role='phone';phoneNonce='test-nonce';stopped=false;pc={addTrack(){},async setLocalDescription(){},async createOffer(){return{}},localDescription:{toJSON(){return{}}},close(){}};socket={readyState:1,send(){},close(){}};`,context);
  const approve=()=>vm.runInContext(`receive({iv:'',data:btoa(JSON.stringify({type:'approved',sender:'host',nonce:'test-nonce'}))})`,context);
  return{context,element,approve};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('PC approval starts camera automatically and duplicate approval does not reopen it',async()=>{
 let calls=0;const track={getSettings:()=>({width:1280,height:720}),stop(){}};
 const s=setup(async()=>{calls++;return{getVideoTracks:()=>[track],getTracks:()=>[track]}});
 assert.equal(calls,0);await s.approve();await settle();await s.approve();await settle();
 assert.equal(calls,1);assert.equal(s.element('phone-info').textContent,'Kamera startet');assert.equal(s.element('start').hidden,true);
});
test('permission denial leaves an enabled manual fallback',async()=>{
 const s=setup(async()=>{throw Object.assign(new Error('Denied'),{name:'NotAllowedError'})});await s.approve();await settle();
 assert.equal(s.element('start').hidden,false);assert.equal(s.element('start').disabled,false);assert.match(s.element('status').textContent,/Tillad kameraadgang/);
});
test('cancelling while permission is pending stops the returned camera track',async()=>{
 let release,stops=0;const s=setup(()=>new Promise(resolve=>release=resolve));await s.approve();
 await vm.runInContext('stop(false)',s.context);
 release({getTracks:()=>[{stop(){stops++}}]});await settle();assert.equal(stops,1);assert.equal(s.element('start').disabled,true);
});

test('live resolution changes use existing capture track and direct control channel',async()=>{
 let constraints,requests=0;const track={applyConstraints:async c=>{constraints=c},getSettings:()=>({width:1920,height:1080}),stop(){}};
 const s=setup(async()=>{requests++;return{getVideoTracks:()=>[track],getTracks:()=>[track]}});await s.approve();await settle();
 vm.runInContext("pc.connectionState='connected'; controlChannel={readyState:'open',send(){}};socket=null;",s.context);
 await vm.runInContext("receiveControl({type:'capture-size',size:{width:3840,height:2160}})",s.context);
 assert.equal(constraints.width.ideal,3840);assert.equal(constraints.height.ideal,2160);assert.equal(requests,1);
});

test('phone refuses acceptance for a different phone nonce',async()=>{
 let requests=0;const s=setup(async()=>{requests++;throw Error('unexpected camera access')});
 await vm.runInContext("receive({iv:'',data:btoa(JSON.stringify({type:'approved',sender:'host',nonce:'wrong-phone'}))})",s.context);
 assert.equal(requests,0);
});

test('comparison code is deterministic and binds the phone nonce',async()=>{
 const s=setup(async()=>{});vm.runInContext("pairSecret='example-secret'",s.context);
 const a=await vm.runInContext("verificationCode('first-phone')",s.context);
 const b=await vm.runInContext("verificationCode('first-phone')",s.context);
 const c=await vm.runInContext("verificationCode('second-phone')",s.context);
 assert.match(a,/^[0-9]{6}$/);assert.equal(a,b);assert.notEqual(a,c);
});
test('oversized direct control message stops the session',async()=>{
 const s=setup(async()=>{});
 vm.runInContext("approved=true;bindControl({readyState:'open',send(){},close(){}});controlChannel.onmessage({data:'x'.repeat(1025)})",s.context);
 await settle();assert.equal(vm.runInContext('stopped',s.context),true);
});

test('phone switches camera with replaceTrack, keeps microphone and pairing, and reports new capture size',async()=>{
 let requests=0,oldStops=0,audioStops=0,replaced;
 const old={kind:'video',stop(){oldStops++},getSettings:()=>({width:1920,height:1080,facingMode:'environment'})};
 const fresh={kind:'video',stop(){},getSettings:()=>({width:1920,height:1080,facingMode:'user'})};
 const s=setup(async constraints=>{requests++;if(requests===2){assert.equal(constraints.audio,false);assert.equal(constraints.video.facingMode.exact,'user');assert.equal(oldStops,1)}const track=requests===1?old:fresh;return{getTracks:()=>[track],getVideoTracks:()=>[track]}});
 await s.approve();await settle();const peer=vm.runInContext('pc',s.context);
 peer.getSenders=()=>[{track:old,replaceTrack:async track=>{replaced=track}},{track:{kind:'audio',stop(){audioStops++}},replaceTrack(){throw Error('audio sender touched')}}];
 s.element('camera').value='user';await vm.runInContext('switchCamera()',s.context);
 assert.equal(replaced,fresh);assert.equal(audioStops,0);assert.equal(vm.runInContext('pc',s.context),peer);
 assert.equal(s.element('camera').disabled,false);assert.equal(s.element('status').textContent,'Kamera skiftet');assert.equal(requests,2);
});

test('failed camera change restores the previous camera without closing the peer',async()=>{
 let requests=0,replaced;const track=facing=>({kind:'video',stop(){},getSettings:()=>({width:1280,height:720,facingMode:facing})});const old=track('environment'),restored=track('environment');
 const s=setup(async constraints=>{requests++;if(requests===2)throw Error('camera unavailable');if(requests===3)assert.equal(constraints.video.facingMode.exact,'environment');const t=requests===1?old:restored;return{getVideoTracks:()=>[t],getTracks:()=>[t]}});
 await s.approve();await settle();vm.runInContext('pc.getSenders=()=>[sender]',Object.assign(s.context,{sender:{track:old,replaceTrack:async t=>{replaced=t}}}));
 s.element('camera').value='user';await vm.runInContext('switchCamera()',s.context);
 assert.equal(replaced,restored);assert.equal(s.element('camera').value,'environment');assert.match(s.element('status').textContent,/gendannet/);assert.equal(vm.runInContext('stopped',s.context),false);
});

test('stopping during camera change releases the late camera and does not replace a track',async()=>{
 let requests=0,release,lateStops=0,replacements=0;const old={kind:'video',stop(){},getSettings:()=>({width:1280,height:720,facingMode:'environment'})};
 const s=setup(async()=>{requests++;if(requests===1)return{getVideoTracks:()=>[old],getTracks:()=>[old]};return new Promise(resolve=>release=resolve)});
 await s.approve();await settle();s.context.sender={track:old,replaceTrack:async()=>{replacements++}};vm.runInContext('pc.getSenders=()=>[sender]',s.context);
 s.element('camera').value='user';const switching=vm.runInContext('switchCamera()',s.context);await vm.runInContext('stop(false)',s.context);
 const late={kind:'video',stop(){lateStops++},getSettings:()=>({})};release({getVideoTracks:()=>[late],getTracks:()=>[late]});await switching;
 assert.equal(lateStops,1);assert.equal(replacements,0);assert.equal(vm.runInContext('stream',s.context),null);
});

test('transient disconnect preserves capture and reconnect cancels recovery deadlines',async()=>{
 const tasks=new Map();let id=0;const timers={setTimeout(fn,delay){tasks.set(++id,{fn,delay});return id},clearTimeout(key){tasks.delete(key)}};
 let stopped=0;const track={kind:'video',getSettings:()=>({width:1280,height:720}),stop(){stopped++}};
 const s=setup(async()=>({getVideoTracks:()=>[track],getTracks:()=>[track]}),timers);await s.approve();await settle();
 vm.runInContext("pc.connectionState='disconnected';handleConnectionState(pc)",s.context);assert.equal(stopped,0);assert.equal(tasks.size,2);assert.match(s.element('status').textContent,/Genopretter/);
 vm.runInContext("pc.connectionState='connected';handleConnectionState(pc)",s.context);assert.equal(tasks.size,0);assert.equal(stopped,0);
});
test('phone offers one ICE restart and closes only after recovery deadline',async()=>{
 const tasks=[];const timers={setTimeout(fn,delay){tasks.push({fn,delay});return tasks.length},clearTimeout(){}};
 let constraints,stops=0;const track={getSettings:()=>({}),stop(){stops++}};const s=setup(async()=>({getVideoTracks:()=>[track],getTracks:()=>[track]}),timers);await s.approve();await settle();
 s.context.offer=async options=>{constraints=options;return{}};vm.runInContext("pc.createOffer=offer;pc.connectionState='failed';handleConnectionState(pc);handleConnectionState(pc)",s.context);
 assert.equal(tasks.length,2);await tasks.find(x=>x.delay===3000).fn();assert.equal(constraints.iceRestart,true);assert.equal(stops,0);
 await tasks.find(x=>x.delay===15000).fn();await settle();assert.equal(stops,1);assert.equal(vm.runInContext('stopped',s.context),true);
});

test('invalid recording commands are rejected without exposing file operations',async()=>{const s=setup(async()=>{});vm.runInContext('approved=true',s.context);await vm.runInContext("receiveControl({type:'record-command',action:'write-file',path:'C:/arbitrary'})",s.context);assert.equal(vm.runInContext('stopped',s.context),true)});

test('closing phone retires even a connected pairing and creates exactly one fresh invitation',async()=>{
 const s=setup(async()=>{}, {setTimeout:()=>1,clearTimeout(){}});let created=0;
 s.context.WS=class {static OPEN=1;constructor(){this.readyState=1;s.context.latestSocket=this}close(){}send(){}};
 s.context.newInvitation=async()=>{created++;vm.runInContext('stopped=false;socket={close(){}}',s.context)};
 vm.runInContext("role='host';WebSocket=WS;makePeer=()=>{pc={connectionState:'connected',close(){}}};$('create').onclick=newInvitation",s.context);
 const connecting=vm.runInContext("connect('test-room','test-token')",s.context);const old=s.context.latestSocket;
 old.onmessage({data:JSON.stringify({type:'ready',expires:Date.now()+600000})});await connecting;
 old.onmessage({data:JSON.stringify({type:'peer-left'})});await settle();await settle();
 assert.equal(created,1);assert.ok(!s.element('approval').open);assert.equal(s.element('pair-link').value,'');
 old.onclose();old.onmessage({data:JSON.stringify({type:'peer-left'})});await settle();assert.equal(created,1);
});

test('manual cancellation never renews an invitation',async()=>{
 const s=setup(async()=>{});let created=0;s.element('create').onclick=async()=>created++;
 vm.runInContext("role='host'",s.context);await vm.runInContext('stop(false);renewPairing()',s.context);assert.equal(created,0);
});

