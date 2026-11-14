import test from 'node:test';
import assert from 'node:assert/strict';
import {PairingRoom,digest} from '../src/worker.js';
function socket(now){return{state:{role:null,created:now,count:0,bytes:0},sent:[],closed:[],deserializeAttachment(){return structuredClone(this.state)},serializeAttachment(s){this.state=structuredClone(s)},send(s){this.sent.push(JSON.parse(s))},close(...args){this.closed.push(args)}}}

test('paired session survives invitation expiry and ends at a fixed eight-hour cap',async t=>{
 let now=1800000000000;t.mock.method(Date,'now',()=>now);
 const hostToken='a'.repeat(64),phoneToken='b'.repeat(64);
 const invitationExpires=now+600000,store=new Map([['room',{expires:invitationExpires,hostHash:await digest(hostToken),joinHash:await digest(phoneToken)}]]);
 let alarm;const sockets=[];const room=new PairingRoom({getWebSockets:()=>sockets,storage:{get:async k=>structuredClone(store.get(k)),put:async(k,v)=>store.set(k,structuredClone(v)),setAlarm:async time=>alarm=time,deleteAll:async()=>store.clear()}});
 const host=socket(now);sockets.push(host);await room.processMessage(host,JSON.stringify({type:'auth',role:'host',token:hostToken}));
 assert.equal(store.get('room').expires,invitationExpires);
 now+=240000;const phone=socket(now);sockets.push(phone);await room.processMessage(phone,JSON.stringify({type:'auth',role:'phone',token:phoneToken}));
 const cap=now+8*60*60*1000;assert.equal(store.get('room').expires,cap);assert.equal(alarm,cap);
 now=invitationExpires+1;await room.alarm();assert.equal(host.closed.length,0);assert.equal(phone.closed.length,0);
 const signal={type:'signal',iv:'a'.repeat(16),data:'YQ=='};await room.processMessage(host,JSON.stringify(signal));assert.deepEqual(phone.sent.at(-1),signal);assert.equal(store.get('room').expires,cap);
 const duplicate=socket(now);sockets.push(duplicate);await room.processMessage(duplicate,JSON.stringify({type:'auth',role:'phone',token:phoneToken}));assert.equal(duplicate.closed[0][0],1008);assert.equal(store.get('room').expires,cap);
 now=cap;await room.alarm();assert.equal(host.closed.length,1);assert.equal(phone.closed.length,1);assert.equal(store.size,0);
});

test('unused invitation still expires after ten minutes',async t=>{
 let now=1800000000000;t.mock.method(Date,'now',()=>now);
 const sockets=[socket(now)],data={expires:now+600000};let cleared=false;
 const room=new PairingRoom({getWebSockets:()=>sockets,storage:{get:async()=>data,deleteAll:async()=>cleared=true}});
 now+=600000;await room.alarm();assert.equal(sockets[0].closed.length,1);assert.equal(cleared,true);
});
