import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
function setup(){
 let now=1000,stats=[],copied;const els=new Map(),element=id=>{if(!els.has(id))els.set(id,{hidden:false,open:false,textContent:'',value:'',showModal(){this.open=true},close(){this.open=false},select(){}});return els.get(id)};
 const track={readyState:'live',muted:false},peer={getStats:async()=>new Map(stats.map((s,i)=>[i,s]))};
 const window={addEventListener(){},chrome:{webview:{}},ExtrudaAudio:{health:()=>({enabled:true,signal:true,context:'running',windowsAccepted:true})}};
 vm.runInNewContext(readFileSync('public/health.js','utf8'),{window,document:{getElementById:element},location:{origin:'https://app.extruda.local'},performance:{now:()=>now},setInterval:()=>1,clearInterval(){},setTimeout,clearTimeout,navigator:{clipboard:{writeText:async text=>copied=text}}});
 window.ExtrudaHealth.session({role:'host',peer,video:()=>({srcObject:{getVideoTracks:()=>[track]}})});window.ExtrudaHealth.transport('connected');
 return{window,api:window.ExtrudaHealth,element,track,peer,setStats:value=>stats=value,advance:ms=>now+=ms,get copied(){return copied}};
}
test('health detects real frame progress, stall, recovery and paused camera',async()=>{
 const s=setup();s.setStats([{type:'inbound-rtp',kind:'video',framesDecoded:10,packetsReceived:100}]);await s.api.poll();assert.equal(s.api.snapshot().video,'flowing');
 s.advance(6000);await s.api.poll();assert.equal(s.api.snapshot().video,'stalled');
 s.setStats([{type:'inbound-rtp',kind:'video',framesDecoded:11}]);await s.api.poll();assert.equal(s.api.snapshot().video,'flowing');
 s.track.muted=true;assert.equal(s.api.snapshot().video,'paused');s.track.readyState='ended';assert.equal(s.api.snapshot().video,'ended');
});
test('diagnostic report allowlist excludes candidates, secrets, labels and media',async()=>{
 const s=setup();s.setStats([{type:'inbound-rtp',kind:'video',framesDecoded:1,packetsReceived:5,secret:'PAIRING_SECRET',url:'https://secret.test/#key=123'},{type:'local-candidate',address:'192.168.1.2',usernameFragment:'PRIVATE'}]);await s.api.poll();await s.element('health-copy').onclick();
 assert.doesNotMatch(s.copied,/PAIRING_SECRET|secret.test|192\.168|PRIVATE|usernameFragment|candidate|sdp/i);assert.equal(JSON.parse(s.copied).packets,5);
 assert.deepEqual(Object.keys(JSON.parse(s.copied)).sort(),['schema','version','role','transport','video','videoAgeMs','windowsVideo','audio','packets','packetsLost','jitterMs','statsAvailable','received','recent'].sort());
});
test('native acknowledgements expire and stop clears diagnostics',async()=>{
 const s=setup();s.api.videoAck();assert.equal(s.api.snapshot().windowsVideo,'accepted');s.advance(6000);assert.equal(s.api.snapshot().windowsVideo,'waiting');s.api.stop();assert.equal(s.api.snapshot().video,'off');assert.equal(s.api.snapshot().transport,'closed');assert.equal(s.element('health-panel').hidden,true);
});
test('noise diagnostics retain only enumerated failures and numeric counters',async()=>{
 const s=setup();s.window.ExtrudaNoise={snapshot:()=>({phase:'retrying',retries:1,reason:'timeout',processed:25,skipped:2,raw:'PRIVATE AUDIO',path:'PRIVATE PATH'})};
 await s.element('health-copy').onclick();assert.doesNotMatch(s.copied,/PRIVATE|raw|path/);assert.equal(JSON.parse(s.copied).audio.noise.reason,'timeout');
 s.window.ExtrudaNoise.snapshot=()=>({phase:'PRIVATE',reason:'PRIVATE',processed:Infinity});assert.equal(s.api.snapshot().audio.noise.phase,'off');assert.equal(s.api.snapshot().audio.noise.reason,'');
});
test('late stats result cannot resurrect a stopped session',async()=>{
 const s=setup();let finish;s.peer.getStats=()=>new Promise(resolve=>finish=resolve);const pending=s.api.poll();s.api.stop();finish(new Map([[1,{type:'inbound-rtp',kind:'video',framesDecoded:50}]]));await pending;assert.equal(s.api.snapshot().video,'off');assert.equal(s.api.snapshot().statsAvailable,false);
});

test('recent media rates use counter differences, remain separate and reset after discontinuity',async()=>{
 const s=setup();const rows=(frames,bytes,packets,lost,audioBytes)=>[{id:'private-video-id',type:'inbound-rtp',kind:'video',framesDecoded:frames,bytesReceived:bytes,packetsReceived:packets,packetsLost:lost,jitter:0.006},{id:'private-audio-id',type:'inbound-rtp',kind:'audio',bytesReceived:audioBytes,packetsReceived:100,packetsLost:0,jitter:0.003}];
 s.setStats(rows(10,1000,100,1,100));await s.api.poll();assert.equal(s.api.snapshot().recent.video.fps,null);
 s.advance(1000);s.setStats(rows(40,126000,200,2,4100));await s.api.poll();const r=s.api.snapshot().recent;
 assert.equal(r.video.fps,30);assert.equal(r.video.bitrateKbps,1000);assert.equal(r.audio.bitrateKbps,32);assert.equal(r.video.lossPercent,0.99);assert.equal(r.video.jitterMs,6);
 s.advance(1000);s.setStats(rows(1,100,1,0,10));await s.api.poll();assert.equal(s.api.snapshot().recent.video.fps,null);
 s.advance(10000);s.setStats(rows(100,10000,100,0,500));await s.api.poll();assert.equal(s.api.snapshot().recent.video.bitrateKbps,null);
 await s.element('health-copy').onclick();assert.doesNotMatch(s.copied,/private-video-id|private-audio-id/);
});
