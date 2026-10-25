
const run=document.createElement('button');run.id='audio-test-run';run.textContent='Kør syntetisk lydtest';document.querySelector('main').prepend(run);
const result=document.createElement('p');result.id='audio-test-result';run.after(result);
document.querySelector('.intro').hidden=true;document.getElementById('desktop').hidden=false;
run.onclick=async()=>{run.disabled=true;try{
 const context=new AudioContext({sampleRate:48000});await context.resume();const osc=context.createOscillator(),gain=context.createGain(),dest=context.createMediaStreamDestination();gain.gain.value=0.12;osc.connect(gain);gain.connect(dest);const keepAlive=context.createGain();keepAlive.gain.value=0;gain.connect(keepAlive);keepAlive.connect(context.destination);osc.start();
 const phone=new RTCPeerConnection({iceServers:[]}),host=new RTCPeerConnection({iceServers:[]});
 phone.onicecandidate=e=>{if(e.candidate)host.addIceCandidate(e.candidate).catch(()=>{})};host.onicecandidate=e=>{if(e.candidate)phone.addIceCandidate(e.candidate).catch(()=>{})};
 window.ExtrudaHealth?.session({role:'host',peer:host,video:()=>document.getElementById('remote')});
 const camera=document.createElement('canvas');camera.width=320;camera.height=180;const paint=camera.getContext('2d');let count=0;const painting=setInterval(()=>{paint.fillStyle=count++%2?'#28645f':'#619b98';paint.fillRect(0,0,320,180)},100);const videoStream=camera.captureStream(10);phone.addTrack(videoStream.getVideoTracks()[0],videoStream);
 window.ExtrudaAudio.session({role:'host',peer:host,approved:()=>true,send:async message=>{if(message.enabled===false){osc.stop();dest.stream.getTracks().forEach(t=>t.stop());await window.ExtrudaAudio.control({type:'microphone-state',enabled:false});}}});
 host.addEventListener('connectionstatechange',()=>{window.ExtrudaHealth?.transport(host.connectionState);window.dispatchEvent(new CustomEvent('extruda-connection',{detail:{connected:host.connectionState==='connected'}}))});
 const received=new Promise(resolve=>host.ontrack=e=>{if(e.track.kind==='video'){const preview=document.getElementById('remote');preview.srcObject=e.streams[0];preview.play();}if(e.track.kind==='audio'){window.ExtrudaAudio.track(e.track);resolve(e.track)}});
 const audioSender=phone.addTransceiver('audio',{direction:'sendonly'}).sender;await phone.setLocalDescription(await phone.createOffer());await host.setRemoteDescription(phone.localDescription);await host.setLocalDescription(await host.createAnswer());await phone.setRemoteDescription(host.localDescription);
 const track=await received;
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('connection timeout')),8000);host.onconnectionstatechange=()=>{if(host.connectionState==='connected'){clearTimeout(timer);resolve()}};if(host.connectionState==='connected'){clearTimeout(timer);resolve()}});
 await audioSender.replaceTrack(dest.stream.getAudioTracks()[0]);
 window.dispatchEvent(new CustomEvent('extruda-connection',{detail:{connected:true}}));await window.ExtrudaAudio.control({type:'microphone-state',enabled:true});
 await context.audioWorklet.addModule('/audio-worklet.js');const source=context.createMediaStreamSource(new MediaStream([track])),pcm=new AudioWorkletNode(context,'extruda-pcm'),silent=context.createGain();silent.gain.value=0;source.connect(pcm);pcm.connect(silent);silent.connect(context.destination);
 let blocks=0,bad=0,peak=0;pcm.port.onmessage=e=>{blocks++;if(e.data.length!==960)bad++;for(const v of e.data)peak=Math.max(peak,Math.abs(v))};
 await new Promise(r=>setTimeout(r,1400));const level=document.getElementById('mic-level').value;
 if(level<=0||blocks<20||bad)throw Error('meter/worklet check failed: '+JSON.stringify({level,blocks,bad,peak,context:context.state,enabled:track.enabled,muted:track.muted,stats:[...(await host.getStats()).values()].filter(x=>x.type==='inbound-rtp').map(x=>({packets:x.packetsReceived,level:x.audioLevel,total:x.totalAudioEnergy}))}));
 if(window.ExtrudaHealth){await window.ExtrudaHealth.poll();if(window.ExtrudaHealth.snapshot().video!=='flowing')throw Error('Video health not flowing');}
 result.textContent='PASS: WebRTC-lyd modtaget, niveau '+level+'%, '+blocks+' PCM-blokke à 20 ms. Tryk Slå mikrofon fra for at teste mute.';
 const off=document.getElementById('mic-toggle');off.addEventListener('click',()=>{setTimeout(()=>{result.textContent=document.getElementById('mic-level').value===0?'PASS: WebRTC-lyd, niveauindikator, PCM og mute; ingen fysisk mikrofon eller højttaler brugt.':'FAIL: meter not silent';phone.close();host.close();context.close();},150)},{once:true});
}catch(error){result.textContent='FAIL: '+error.message;console.error(error)}};
const driverPreview=document.createElement('button');driverPreview.id='audio-test-driver';driverPreview.textContent='Vis driveropsætning';run.after(driverPreview);driverPreview.onclick=()=>document.getElementById('audio-setup').showModal();
const recordingSettings=document.createElement('button');recordingSettings.id='test-recording-settings';recordingSettings.textContent='Vis optageindstillinger';run.after(recordingSettings);recordingSettings.onclick=()=>{document.body.classList.add('native');const output=document.createElement('canvas');output.width=1920;output.height=1080;window.ExtrudaRecording.ready(output);document.getElementById('record-open').onclick();};
const noisePreview=document.createElement('button');noisePreview.id='test-noise-settings';noisePreview.textContent='Vis syntetisk støjtest';run.after(noisePreview);
noisePreview.onclick=async()=>{
 document.body.classList.add('native');document.getElementById('mic-panel').hidden=false;document.getElementById('noise-main').hidden=false;document.getElementById('audio-denoise-control').hidden=false;document.getElementById('audio-routing').hidden=false;
 const context=new AudioContext({sampleRate:48000});await context.resume();await context.audioWorklet.addModule('/audio-worklet.js');window.ExtrudaNoise.bind(context,()=>{});
 document.getElementById('audio-settings-dialog').showModal();let frame=0;
 const timer=setInterval(()=>{
  const s=window.ExtrudaNoise.snapshot();if(s.phase==='starting')window.ExtrudaNoise.ready(s.session);
  const raw=new Float32Array(960),pcm=new Uint8Array(1920),view=new DataView(pcm.buffer);
  for(let i=0;i<960;i++){const tone=Math.sin((frame*960+i)*2*Math.PI*220/48000)*0.1;raw[i]=tone+(Math.random()-0.5)*0.02;view.setInt16(i*2,Math.round(tone*32767),true);}frame++;
  window.ExtrudaNoise.accept(raw);const next=window.ExtrudaNoise.snapshot();if(next.pending)window.ExtrudaNoise.result(next.session,next.lastSequence,btoa(String.fromCharCode(...pcm)));
 },20);
 window.addEventListener('pagehide',()=>{clearInterval(timer);void context.close();},{once:true});
};
