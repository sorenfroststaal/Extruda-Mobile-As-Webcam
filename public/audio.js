(() => {
  const $=id=>document.getElementById(id);
  const tr=(text,params)=>window.ExtrudaI18n?.t(text,params)||text.replace(/\{(\w+)\}/g,(all,key)=>params?.[key]??all);
  let role='host',peer,sendControl,isApproved=()=>false;
  let capture=null,pending=false,generation=0,hostAllowed=true,phoneEnabled=false;
  let context,source,analyser,processor,silent,animation,lastPaint=0,nativeBusy=0;
  let devices=[],route=-1,connected=false;
  let gain=1,routingActive=false;
  let lastNativeAck=0;
  let cameraOnly=false,driverPrompted=false,devicesKnown=false;
  try{cameraOnly=localStorage.getItem('extruda-camera-only')==='true';}catch{}
  const driverDialog=$('audio-setup');
  function offerDriver(){
    if(role!=='host'||!native())return;
    const help=$('safety');if(help?.open)help.close();
    if(!driverDialog.open)driverDialog.showModal();
  }
  async function setCameraOnly(value,notify=true){
    cameraOnly=value;
    if(role==='host')try{localStorage.setItem('extruda-camera-only',String(value));}catch{}
    if(value){hostAllowed=false;if(role==='phone')await disablePhone();else await refreshHost();}
    else hostAllowed=true;
    if(notify&&connected&&role==='host')await sendControl?.({type:'microphone-mode',enabled:!value});
    buttons();
  }
  $('audio-camera-only').onclick=async()=>{driverDialog.close();await setCameraOnly(true);};
  $('audio-setup-later').onclick=()=>driverDialog.close();
  $('audio-setup-refresh').onclick=()=>post('audio-devices');
  $('audio-enable').onclick=async()=>{await setCameraOnly(false);if(!devices.length)offerDriver();else post('audio-devices');};
  driverDialog.addEventListener?.('cancel',()=>{driverPrompted=true;});
  function routingText(){
    const steam=devices.find(device=>device.index===route)?.name.includes('Steam Streaming Microphone');
    $('audio-route-guide').textContent=tr('Vælg {device} som mikrofon i Teams eller Zoom.',{device:steam?'Steam Streaming Microphone':'CABLE Output'});
  }
  const native=()=>location.origin==='https://app.extruda.local' && !!window.chrome?.webview;
  const post=text=>{if(native())window.chrome.webview.postMessage(text);};
  const state=text=>{$('mic-status').textContent=tr(text);};
  function paint(level=0){
    const value=Math.min(100,Math.max(0,Math.round(level*100)));
    $('mic-level').value=value;$('mic-level').setAttribute('aria-valuetext',`${value}%`);
  }
  function buttons(){
    const enabled=role==='phone'?!!capture:phoneEnabled&&hostAllowed;
    $('mic-toggle').textContent=tr(enabled?'Slå mikrofon fra':'Slå mikrofon til');
    $('mic-toggle').setAttribute('aria-pressed',String(enabled));
    $('mic-toggle').disabled=!connected||pending;
    $('mic-panel').hidden=!connected||cameraOnly;
    $('audio-enable').hidden=role!=='host'||!native();
    routingText();
  }
  async function clearGraph(){
    cancelAnimationFrame(animation);paint();nativeBusy=0;lastNativeAck=0;
    source?.disconnect();processor?.disconnect();silent?.disconnect();
    if(processor)processor.port.onmessage=null;
    const old=context;context=source=analyser=processor=silent=null;
    if(old)await old.close().catch(()=>{});
  }
  async function graph(stream,forward){
    const token=generation;
    await clearGraph();
    if(token!==generation)return;
    const ctx=new AudioContext({sampleRate:48000,latencyHint:'interactive'});context=ctx;
    source=ctx.createMediaStreamSource(stream);analyser=ctx.createAnalyser();analyser.fftSize=512;
    source.connect(analyser);
    // A zero-gain output runs the graph without playing the phone into PC speakers.
    silent=ctx.createGain();silent.gain.value=0;analyser.connect(silent);silent.connect(ctx.destination);
    if(forward && native()){
      await ctx.audioWorklet.addModule('/audio-worklet.js');
      if(token!==generation||context!==ctx)return;
      processor=new AudioWorkletNode(ctx,'extruda-pcm');source.connect(processor);processor.connect(silent);
      processor.port.onmessage=event=>{
        if(token!==generation||!connected||cameraOnly||!hostAllowed||!phoneEnabled||route<0||!routingActive||nativeBusy>=4)return;
        const samples=event.data;if(!(samples instanceof Float32Array)||samples.length!==960)return;
        const pcm=new Uint8Array(1920);const view=new DataView(pcm.buffer);
        for(let i=0;i<960;i++){const v=Math.max(-1,Math.min(1,samples[i]*gain));view.setInt16(i*2,Math.round(v<0?v*32768:v*32767),true);}
        nativeBusy++;post('audio-pcm:'+btoa(String.fromCharCode(...pcm)));
      };
    }
    await ctx.resume();
    const values=new Float32Array(analyser.fftSize);
    const tick=now=>{
      if(context!==ctx)return;
      if(now-lastPaint>80){
        lastPaint=now;analyser.getFloatTimeDomainData(values);let sum=0;for(const value of values)sum+=value*value;
        const level=Math.sqrt(sum/values.length);paint(Math.min(1,level*4));
        if(level<0.0001)state('Intet mikrofonsignal registreret. Tal, og kontrollér tilladelsen på telefonen.');
        else if(!forward)state('Mikrofonsignal registreres på telefonen');
        else if(!native())state('Lyd modtages. Windows-mikrofon kræver Windows-appen.');
        else if(route<0)state('Lyd modtages. Vælg en virtuel lydenhed.');
        else if(routingActive&&lastNativeAck&&performance.now()-lastNativeAck<2000)state('Lyd sendes til Windows. Vælg den virtuelle mikrofon i Teams eller Zoom.');
        else state('Lyd modtages, men er endnu ikke sendt til Windows');
      }
      animation=requestAnimationFrame(tick);
    };animation=requestAnimationFrame(tick);
  }
  async function disablePhone(notify=true){
    ++generation;const old=capture;capture=null;old?.getTracks().forEach(track=>track.stop());
    const sender=peer?.getSenders?.().find(sender=>sender.track?.kind==='audio')||peer?.getTransceivers?.().find(t=>t.receiver.track.kind==='audio')?.sender;
    await sender?.replaceTrack(null).catch(()=>{});await clearGraph();
    if(notify)await sendControl?.({type:'microphone-state',enabled:false}).catch(()=>{});
    state('Mikrofon fra');buttons();
  }
  async function enablePhone(){
    if(cameraOnly||!connected||!isApproved()||pending||capture)return;
    pending=true;buttons();const token=++generation;const connection=peer;state('Tillad mikrofonen på telefonen');
    try{
      const acquired=await navigator.mediaDevices.getUserMedia({video:false,audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:{ideal:1}}});
      if(token!==generation||!connected||!isApproved()||peer!==connection){acquired.getTracks().forEach(t=>t.stop());return;}
      const track=acquired.getAudioTracks()[0];
      const sender=peer.getTransceivers().find(t=>t.receiver.track.kind==='audio')?.sender;
      if(!track||!sender){acquired.getTracks().forEach(t=>t.stop());throw Error('Mikrofonforbindelsen mangler. Opret en ny parring.');}
      capture=acquired;await sender.replaceTrack(track);
      if(token!==generation||!connected){await disablePhone(false);return;}
      track.onended=()=>{if(capture===acquired)void disablePhone();};
      await graph(acquired,false);if(token!==generation||!capture)return;await sendControl({type:'microphone-state',enabled:true});state('Afventer mikrofonsignal');
    }catch(error){await disablePhone();state(error.name==='NotAllowedError'?'Mikrofon blokeret. Tillad den i browseren, og prøv igen.':'Mikrofonen kunne ikke starte. Prøv igen.');}
    finally{pending=false;buttons();}
  }
  let remoteStream;
  const playback=$('remote-audio');
  async function refreshHost(){
    const token=++generation;routingActive=false;post('audio-stop');
    if(!cameraOnly&&hostAllowed&&phoneEnabled&&remoteStream&&connected){
      try{await graph(remoteStream,true);if(token!==generation)return;if(route>=0)post('audio-route:'+route);state('Afventer mikrofonsignal');}
      catch{state('Tryk Slå mikrofon til for at aktivere lyd.');}
    }else{await clearGraph();state(phoneEnabled&&hostAllowed&&!cameraOnly?'Afventer telefonens lydspor':'Mikrofon fra');}
    buttons();
  }
  $('mic-toggle').onclick=async()=>{
    if(!connected)return;
    if(role==='host'&&native()&&devicesKnown&&!devices.length){offerDriver();return;}
    if(role==='phone'){if(capture)await disablePhone();else await enablePhone();}
    else if(hostAllowed&&phoneEnabled){hostAllowed=false;await refreshHost();await sendControl({type:'microphone-request',enabled:false});}
    else{hostAllowed=true;await refreshHost();if(!phoneEnabled){state('Slå mikrofonen til på telefonen');await sendControl({type:'microphone-request',enabled:true});}}
  };
  function chooseGain(){gain=devices.find(device=>device.index===route)?.name.includes('Steam Streaming Microphone')?0.03:1;$('audio-gain').value=String(Math.round(gain*100));routingText();}
  $('audio-gain').oninput=()=>{gain=Math.max(0,Math.min(1,Number($('audio-gain').value)/100));};
  $('audio-device').onchange=()=>{route=Number($('audio-device').value);chooseGain();routingActive=false;post('audio-stop');if(hostAllowed&&phoneEnabled&&route>=0)post('audio-route:'+route);};
  $('audio-refresh').onclick=()=>post('audio-devices');
  window.extrudaAudioDevices=list=>{
    devicesKnown=true;
    devices=Array.isArray(list)?list:[];route=-1;
    const select=$('audio-device');select.replaceChildren();
    const placeholder=document.createElement('option');placeholder.value='-1';placeholder.textContent=tr('Vælg virtuel lydenhed');select.append(placeholder);
    for(const device of devices){const option=document.createElement('option');option.value=String(device.index);option.textContent=device.name;select.append(option);}
    if(devices.length===1){route=devices[0].index;select.value=String(route);}
    chooseGain();
    $('audio-missing').hidden=devices.length>0;
    $('audio-setup-status').textContent=tr(devices.length?'Lydenhed fundet. Vælg den under Lydindstillinger.':'Ingen understøttet lydenhed fundet. Installér en driver, og søg igen.');
    if(devices.length&&driverDialog.open)driverDialog.close();
    if(!devices.length&&connected&&role==='host'&&!cameraOnly&&!driverPrompted){driverPrompted=true;offerDriver();}
    if(connected&&role==='host')void refreshHost();
  };
  window.extrudaAudioAck=accepted=>{if(accepted&&nativeBusy>0)lastNativeAck=performance.now();nativeBusy=Math.max(0,nativeBusy-1);};
  window.extrudaAudioStarted=()=>{routingActive=connected&&hostAllowed&&phoneEnabled&&route>=0;};
  window.extrudaAudioError=()=>{route=-1;routingActive=false;post('audio-stop');state('Lydudgangen kunne ikke åbnes. Opdatér listen.');};
  window.addEventListener('extruda-connection',event=>{
    const wasConnected=connected;
    connected=!!event.detail.connected;
    // ontrack precedes the initial connecting event. Preserve that track until
    // connected; only a connection that actually drops should clear it here.
    if(!connected&&wasConnected){++generation;capture?.getTracks().forEach(t=>t.stop());capture=null;phoneEnabled=false;remoteStream=null;if(playback)playback.srcObject=null;hostAllowed=true;routingActive=false;post('audio-stop');void clearGraph();state('Mikrofon fra');}
    $('audio-routing').hidden=role!=='host'||!native();buttons();
    if(connected&&role==='host'){
      void sendControl?.({type:'microphone-mode',enabled:!cameraOnly}).catch(()=>{});
      if(!cameraOnly&&devicesKnown&&!devices.length&&!driverPrompted){driverPrompted=true;offerDriver();}
    }
    if(connected&&role==='host'&&phoneEnabled&&remoteStream)void refreshHost();
  });
  window.addEventListener('extruda-language',buttons);
  window.addEventListener('pagehide',()=>{void window.ExtrudaAudio.stop();post('audio-stop');});
  window.ExtrudaAudio={
    health(){const track=(role==='phone'?capture:remoteStream)?.getAudioTracks?.()[0];return{enabled:role==='phone'?!!capture:phoneEnabled&&hostAllowed&&!cameraOnly,signal:Number($('mic-level').value)>0,paused:!!track?.muted||track?.readyState==='ended',context:context?.state||'closed',windowsAccepted:routingActive&&lastNativeAck>0&&performance.now()-lastNativeAck<2000};},
    session(options){role=options.role;peer=options.peer;sendControl=options.send;isApproved=options.approved;},
    track(track){
      if(role!=='host'||track.kind!=='audio')return;remoteStream=new MediaStream([track]);
      // Keep Chromium's remote WebRTC decoder running without local monitoring.
      if(playback){playback.muted=true;playback.srcObject=remoteStream;playback.play?.().catch(()=>{});}
      track.onended=()=>{phoneEnabled=false;void refreshHost();};if(phoneEnabled)void refreshHost();
    },
    async control(message){if(message.type==='microphone-mode'&&role==='phone'){await setCameraOnly(!message.enabled,false);}else if(message.type==='microphone-request'&&role==='phone'){if(message.enabled&&!cameraOnly)state('Pc’en beder om lyd. Tryk Slå mikrofon til.');else await disablePhone();}else if(message.type==='microphone-state'&&role==='host'){phoneEnabled=message.enabled;await refreshHost();}},
    stop(){connected=false;phoneEnabled=false;remoteStream=null;if(playback)playback.srcObject=null;hostAllowed=true;routingActive=false;post('audio-stop');return disablePhone(false);}
  };
  state('Mikrofon fra');buttons();
})();
