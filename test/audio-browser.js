
const run=document.createElement('button');run.id='audio-test-run';run.textContent='Kør syntetisk lydtest';document.querySelector('main').prepend(run);
const result=document.createElement('p');result.id='audio-test-result';run.after(result);
document.querySelector('.intro').hidden=true;document.getElementById('desktop').hidden=false;
run.onclick=async()=>{run.disabled=true;try{
 const context=new AudioContext({sampleRate:48000});await context.resume();const osc=context.createOscillator(),gain=context.createGain(),dest=context.createMediaStreamDestination();gain.gain.value=0.12;osc.connect(gain);gain.connect(dest);const keepAlive=context.createGain();keepAlive.gain.value=0;gain.connect(keepAlive);keepAlive.connect(context.destination);osc.start();
 const phone=new RTCPeerConnection({iceServers:[]}),host=new RTCPeerConnection({iceServers:[]});
 phone.onicecandidate=e=>{if(e.candidate)host.addIceCandidate(e.candidate).catch(()=>{})};host.onicecandidate=e=>{if(e.candidate)phone.addIceCandidate(e.candidate).catch(()=>{})};
 window.ExtrudaAudio.session({role:'host',peer:host,approved:()=>true,send:async message=>{if(message.enabled===false){osc.stop();dest.stream.getTracks().forEach(t=>t.stop());await window.ExtrudaAudio.control({type:'microphone-state',enabled:false});}}});
 host.addEventListener('connectionstatechange',()=>window.dispatchEvent(new CustomEvent('extruda-connection',{detail:{connected:host.connectionState==='connected'}})));
 const received=new Promise(resolve=>host.ontrack=e=>{if(e.track.kind==='audio'){window.ExtrudaAudio.track(e.track);resolve(e.track)}});
 const audioSender=phone.addTransceiver('audio',{direction:'sendonly'}).sender;await phone.setLocalDescription(await phone.createOffer());await host.setRemoteDescription(phone.localDescription);await host.setLocalDescription(await host.createAnswer());await phone.setRemoteDescription(host.localDescription);
 const track=await received;
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('connection timeout')),8000);host.onconnectionstatechange=()=>{if(host.connectionState==='connected'){clearTimeout(timer);resolve()}};if(host.connectionState==='connected'){clearTimeout(timer);resolve()}});
 await audioSender.replaceTrack(dest.stream.getAudioTracks()[0]);
 window.dispatchEvent(new CustomEvent('extruda-connection',{detail:{connected:true}}));await window.ExtrudaAudio.control({type:'microphone-state',enabled:true});
 await context.audioWorklet.addModule('/audio-worklet.js');const source=context.createMediaStreamSource(new MediaStream([track])),pcm=new AudioWorkletNode(context,'extruda-pcm'),silent=context.createGain();silent.gain.value=0;source.connect(pcm);pcm.connect(silent);silent.connect(context.destination);
 let blocks=0,bad=0,peak=0;pcm.port.onmessage=e=>{blocks++;if(e.data.length!==960)bad++;for(const v of e.data)peak=Math.max(peak,Math.abs(v))};
 await new Promise(r=>setTimeout(r,1400));const level=document.getElementById('mic-level').value;
 if(level<=0||blocks<20||bad)throw Error('meter/worklet check failed: '+JSON.stringify({level,blocks,bad,peak,context:context.state,enabled:track.enabled,muted:track.muted,stats:[...(await host.getStats()).values()].filter(x=>x.type==='inbound-rtp').map(x=>({packets:x.packetsReceived,level:x.audioLevel,total:x.totalAudioEnergy}))}));
 result.textContent='PASS: WebRTC-lyd modtaget, niveau '+level+'%, '+blocks+' PCM-blokke à 20 ms. Tryk Slå mikrofon fra for at teste mute.';
 const off=document.getElementById('mic-toggle');off.addEventListener('click',()=>{setTimeout(()=>{result.textContent=document.getElementById('mic-level').value===0?'PASS: WebRTC-lyd, niveauindikator, PCM og mute; ingen fysisk mikrofon eller højttaler brugt.':'FAIL: meter not silent';phone.close();host.close();context.close();},150)},{once:true});
}catch(error){result.textContent='FAIL: '+error.message;console.error(error)}};
const driverPreview=document.createElement('button');driverPreview.id='audio-test-driver';driverPreview.textContent='Vis driveropsætning';run.after(driverPreview);driverPreview.onclick=()=>document.getElementById('audio-setup').showModal();
