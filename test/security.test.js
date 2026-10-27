import test from 'node:test';
import assert from 'node:assert/strict';
import {AbuseGuard,limitedBody,limitSource,sourceBucket} from '../src/worker.js';
test('body reader enforces the byte limit without relying on Content-Length',async()=>{
 const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(700));c.enqueue(new Uint8Array(700));c.close()}});
 await assert.rejects(limitedBody(new Request('https://example.test',{method:'POST',body:stream,duplex:'half'})),/Too large/);
});
test('source budgets reject abusers without consuming unrelated users slots',async()=>{
 const guards=new Map(),data=new Map();const env={ABUSE:{idFromName:n=>n,get(id){if(!guards.has(id)){const state=new Map();data.set(id,state);guards.set(id,new AbuseGuard({blockConcurrencyWhile:fn=>fn(),storage:{get:async k=>state.get(k),put:async(k,v)=>state.set(k,structuredClone(v)),setAlarm:async()=>{}}}));}return {fetch:(url,init)=>guards.get(id).fetch(new Request(url,init))};}}};
 const call=ip=>limitSource(new Request('https://test/api',{headers:{'CF-Connecting-IP':ip}}),env,true);
 for(let source=1;source<=10;source++){for(let i=0;i<20;i++)assert.equal((await call('192.0.2.'+source)).status,200);assert.equal((await call('192.0.2.'+source)).status,429);}
 assert.equal((await call('198.51.100.1')).status,200);
 assert.ok(!JSON.stringify([...data].map(([id,state])=>[id,[...state]])).includes('192.0.2.'));
});
test('IPv6 source budgets group a /64 while separating independent networks',()=>{
 assert.equal(sourceBucket('2001:db8:abcd:1::1'),sourceBucket('2001:0db8:abcd:0001:ffff:aaaa:bbbb:cccc'));
 assert.notEqual(sourceBucket('2001:db8:abcd:1::1'),sourceBucket('2001:db8:abcd:2::1'));
 assert.equal(sourceBucket('not-an-ip'),'local');
});
import worker from '../src/worker.js';
test('legacy installer URL redirects to the fixed GitHub release asset',async()=>{
 const result=await worker.fetch(new Request('https://camera.example/downloads/ExtrudaCamera-Setup-0.3.0-x64.exe'),{});
 assert.equal(result.status,302);
 assert.equal(result.headers.get('location'),'https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/releases/download/mobile-as-webcam-v0.15.0/ExtrudaMobileAsWebcam-Setup-0.15.0-x64.exe');
});

