(() => {
  const $=id=>document.getElementById(id),tr=(text,params)=>window.ExtrudaI18n?.t(text,params)||text.replace(/\{(\w+)\}/g,(all,key)=>params?.[key]??all);
  const native=()=>location.origin==='https://app.extruda.local'&&!!window.chrome?.webview;
  const post=message=>window.chrome.webview.postMessage(message);
  function profile(quality,width=1920,height=1080){
    const q=Math.max(0,Math.min(100,Number(quality)||0));
    const limit=q<25?854:q<50?1280:q<80?1920:3840,scale=Math.min(1,limit/width);
    return{width:Math.max(2,Math.round(width*scale/2)*2),height:Math.max(2,Math.round(height*scale/2)*2),fps:q<25?24:30,videoMbps:q<25?1:q<50?3:q<80?8:20,audioKbps:128};
  }
  function chooseMime(container,codec,audio,supported){
    const mp4=audio?'video/mp4;codecs=avc1.42001E,mp4a.40.2':'video/mp4;codecs=avc1.42001E';
    const webm=name=>'video/webm;codecs='+name+(audio?',opus':'');
    const candidates=codec==='h264'?(container==='webm'?[]:[mp4]):codec==='vp8'||codec==='vp9'?(container==='mp4'?[]:[webm(codec)]):container==='mp4'?[mp4]:container==='webm'?[webm('vp8'),webm('vp9')]:[mp4,webm('vp8'),webm('vp9')];
    return candidates.find(supported)||null;
  }
  window.ExtrudaRecordingConfig={profile,chooseMime};
  let source=null,connected=false,opening=false,active=false,finishing=false,stopRequested=false,recorder=null;
  let canvas,stream,audioContext,audioSource,audioTrack,audioGain,audioDestination,drawAt=0,options,path='',bytes=0,pendingBytes=0;
  let writeChain=Promise.resolve(),ack=null,openResolve=null,elapsed=0,lastClock=0,clockTimer,lastError=false;
  let role='host',sendControl,isApproved=()=>false,configuring=false,remoteState=null,lastSent=null,remoteCapable=false;
  function notify(){const state=finishing?'saving':opening||configuring?'configuring':active?(recorder?.state==='paused'?'paused':'recording'):'idle';if(native()&&connected&&remoteCapable&&sendControl&&state!==lastSent){lastSent=state;void sendControl({type:'record-state',state}).catch(()=>{lastSent=null;});}}
  const state=text=>{$('record-state').textContent=tr(text);};
  function controls(){
    document.body?.classList.toggle('is-recording',opening||active||finishing);
    $('record-toolbar').hidden=!native();$('record-open').disabled=!native()||!connected||!source||opening||active||finishing;
    $('record-stop').hidden=!active&&!finishing;$('record-stop').disabled=finishing;
    $('record-pause').hidden=!active;$('record-pause').textContent=tr(recorder?.state==='paused'?'Fortsæt optagelse':'Pause optagelse');
    $('record-submit').disabled=opening||active||finishing;
    window.dispatchEvent(new CustomEvent('extruda-recording',{detail:{active:opening||active||finishing}}));
    notify();
    const mobile=role==='phone'&&connected&&isApproved()&&remoteState!==null;
    $('phone-record').hidden=!mobile;$('phone-record-toggle').disabled=!mobile||['saving','configuring'].includes(remoteState);
    $('phone-record-toggle').textContent=tr(remoteState==='recording'?'Pause optagelse':remoteState==='paused'?'Fortsæt optagelse':'Start optagelse på pc');
    $('phone-record-stop').hidden=!['recording','paused'].includes(remoteState);
    $('phone-record-status').textContent=tr(remoteState==='configuring'?'Bekræft optagelse og filplacering på pc’en':remoteState==='saving'?'Gemmer optagelsen…':remoteState==='recording'?'Optager lokalt på pc’en':remoteState==='paused'?'Optagelse på pause':'Ingen optagelse');
  }
  function selected(){
    const size=$('record-size').value;const [width,height]=size==='source'?[source.width,source.height]:size.split('x').map(Number);
    const fps=Number($('record-fps').value),videoMbps=Number($('record-bitrate').value),audioKbps=Number($('record-audio-bitrate').value),gainDb=Number($('record-audio-gain').value),limitMinutes=Number($('record-limit').value);
    if(![width,height,fps,videoMbps,audioKbps].every(Number.isFinite)||width<2||height<2||width>3840||height>2160||![15,24,25,30].includes(fps)||videoMbps<0.5||videoMbps>80||![64,96,128,192,256].includes(audioKbps))throw Error('settings');
    if(!Number.isFinite(gainDb)||gainDb<-24||gainDb>24||!Number.isInteger(limitMinutes)||limitMinutes<0||limitMinutes>1440)throw Error('settings');
    const audio=$('record-audio').checked;
    const mime=chooseMime($('record-format').value,$('record-codec').value,audio,type=>typeof MediaRecorder!=='undefined'&&MediaRecorder.isTypeSupported(type));
    if(!mime)throw Error('codec');
    const keyframe=Number($('record-keyframe').value);if(![0,1,2,5,10].includes(keyframe))throw Error('settings');
    return{width,height,fps,videoMbps,audioKbps,audio,mime,gainDb,limitMinutes,keyframe};
  }
  function estimate(){
    try{const o=selected();$('record-estimate').textContent=tr('Cirka {mb} MB pr. minut · {w} × {h} · {fps} fps',{mb:Math.round((o.videoMbps+(o.audio?o.audioKbps/1000:0))*60/8),w:o.width,h:o.height,fps:o.fps});}
    catch{$('record-estimate').textContent=tr('Denne kombination understøttes ikke. Vælg et andet format eller codec.');}
  }
  function applyProfile(){
    const p=profile($('record-quality').value,source?.width||1920,source?.height||1080);
    const size=`${p.width}x${p.height}`;$('record-size').value=[...$('record-size').options].some(o=>o.value===size)?size:'source';
    $('record-fps').value=String(p.fps);$('record-bitrate').value=String(p.videoMbps);$('record-audio-bitrate').value=String(p.audioKbps);estimate();
  }
  function updateClock(){
    const now=performance.now();if(lastClock&&recorder?.state==='recording')elapsed+=now-lastClock;lastClock=now;
    $('record-progress').textContent=`${Math.floor(elapsed/60000)}:${String(Math.floor(elapsed/1000)%60).padStart(2,'0')} · ${(bytes/1e6).toFixed(1)} MB`;
    if(active&&!stopRequested&&options?.limitMinutes>0&&elapsed>=options.limitMinutes*60000){stopRequested=true;queueMicrotask(stop);}
  }
  function syncAudio(){
    if(!audioContext||!audioGain)return;
    const track=window.ExtrudaAudio?.recordingTrack?.()||null;
    audioGain.gain.value=track?Math.pow(10,(options?.gainDb||0)/20):0;
    if(track===audioTrack)return;audioSource?.disconnect();audioSource=null;audioTrack=track;
    if(track){audioSource=audioContext.createMediaStreamSource(new MediaStream([track]));audioSource.connect(audioGain);}
  }
  function clean(){
    clearInterval(clockTimer);stream?.getTracks().forEach(track=>track.stop());audioSource?.disconnect();
    const old=audioContext;audioContext=audioSource=audioTrack=audioGain=audioDestination=null;if(old)void old.close().catch(()=>{});
    stream=recorder=canvas=null;active=false;opening=false;finishing=false;controls();
  }
  function encode(data){let raw='';for(let at=0;at<data.length;at+=8192)raw+=String.fromCharCode(...data.subarray(at,at+8192));return btoa(raw);}
  async function writeBlob(blob){
    for(let offset=0;offset<blob.size;offset+=196608){
      const part=new Uint8Array(await blob.slice(offset,offset+196608).arrayBuffer());
      if(lastError)throw Error('write');
      await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{ack=null;reject(Error('timeout'));},15000);ack={resolve:()=>{clearTimeout(timer);bytes+=part.length;resolve();},reject:()=>{clearTimeout(timer);reject(Error('write'));}};post('record-data:'+encode(part));});
    }
  }
  function failure(){
    if(lastError)return;lastError=true;state('Optagelsen kunne ikke fortsætte. En delvis fil kan være bevaret i den valgte mappe.');
    if(recorder&&recorder.state!=='inactive')try{recorder.stop();}catch{}
  }
  async function start(){
    if(active||opening||finishing||!source||!connected)return;
    try{options=selected();}catch{ $('record-form-error').textContent=tr('Denne kombination understøttes ikke. Vælg et andet format eller codec.');return;}
    opening=true;stopRequested=false;lastError=false;bytes=pendingBytes=elapsed=0;lastClock=0;writeChain=Promise.resolve();controls();
    try{
      const accepted=await new Promise(resolve=>{openResolve=resolve;post('record-open:'+(options.mime.startsWith('video/mp4')?'mp4':'webm'));});
      if(!accepted){opening=false;controls();return;}
      if(stopRequested||!connected){post('record-abort');finishing=true;opening=false;controls();return;}
      canvas=document.createElement('canvas');canvas.width=options.width;canvas.height=options.height;stream=canvas.captureStream(options.fps);
      if(options.audio){
        audioContext=new AudioContext({sampleRate:48000});audioDestination=audioContext.createMediaStreamDestination();audioGain=audioContext.createGain();audioGain.gain.value=0;audioGain.connect(audioDestination);
        syncAudio();await audioContext.resume();stream.addTrack(audioDestination.stream.getAudioTracks()[0]);
        if(window.extrudaRecordingTestAudio){const tone=audioContext.createOscillator(),volume=audioContext.createGain();volume.gain.value=0.1;tone.connect(volume);volume.connect(audioDestination);tone.start();}
      }
      const config={mimeType:options.mime,videoBitsPerSecond:Math.round(options.videoMbps*1e6),audioBitsPerSecond:options.audioKbps*1000};
      if(options.keyframe>0)config.videoKeyFrameIntervalDuration=options.keyframe*1000;
      recorder=new MediaRecorder(stream,config);
      recorder.ondataavailable=event=>{
        if(!event.data.size||lastError)return;
        pendingBytes+=event.data.size;
        if(pendingBytes>32*1024*1024){failure();return;}
        writeChain=writeChain.then(()=>writeBlob(event.data)).catch(()=>failure()).finally(()=>{pendingBytes-=event.data.size;});
      };
      recorder.onerror=()=>failure();
      recorder.onstop=async()=>{active=false;finishing=true;state(lastError?'Optagelsen kunne ikke fortsætte. En delvis fil kan være bevaret i den valgte mappe.':'Gemmer optagelsen…');controls();await writeChain;if(!bytes)lastError=true;post(lastError?'record-abort':'record-finish');};
      recorder.start(1000);opening=false;active=true;drawAt=0;updateClock();clockTimer=setInterval(()=>{syncAudio();updateClock();},100);
      configuring=false;$('record-dialog').close();state('Optager lokalt på pc’en');$('record-path').textContent=path;$('record-path').title=path;$('record-used-format').textContent=recorder.mimeType;$('record-reveal').hidden=true;controls();
    }catch{lastError=true;opening=false;finishing=true;post('record-abort');state('Optagelsen kunne ikke starte. Kontrollér format og ledig diskplads.');controls();}
  }
  function stop(){
    stopRequested=true;
    if(opening){stopRequested=true;return;}
    if(!recorder||recorder.state==='inactive')return;
    updateClock();recorder.stop();active=false;finishing=true;state('Gemmer optagelsen…');controls();
  }
  window.ExtrudaRecording={
    session(settings){role=settings.role;sendControl=settings.send;isApproved=settings.approved;remoteState=null;lastSent=null;remoteCapable=false;},
    offer(){if(role==='phone'&&isApproved()&&sendControl)void sendControl({type:'microphone-state',enabled:!!window.ExtrudaAudio?.health?.().enabled,recording:true}).catch(()=>{});},
    enableRemote(){if(role==='host'&&isApproved()){remoteCapable=true;notify();}},
    control(message){
      if(!isApproved())return;
      if(role==='phone'&&message.type==='record-state'){remoteState=message.state;controls();return;}
      if(!connected||role!=='host'||!native()||message.type!=='record-command')return;
      if(message.action==='start'&&!active&&!opening&&!finishing)$('record-open').onclick();
      else if(message.action==='stop')stop();
      else if(message.action==='pause'&&recorder?.state==='recording')pause();
      else if(message.action==='resume'&&recorder?.state==='paused')pause();
    },
    ready(output){source=output;controls();},
    frame(output,force=false){
      if(!active||recorder?.state!=='recording'||!canvas)return;
      const now=performance.now();if(!force&&now-drawAt<1000/options.fps-1)return;drawAt=now;
      const ctx=canvas.getContext('2d');ctx.drawImage(output,0,0,canvas.width,canvas.height);
    },
    syncAudio,stop,
    opened(ok,value,storageWarning=false){path=ok?value:'';if($('record-storage-warning')){$('record-storage-warning').hidden=!ok||!storageWarning;$('record-storage-warning').textContent=tr('Denne placering kan synkroniseres eller have andre adgangsrettigheder.');}if(!ok&&value)state('Filen kunne ikke åbnes. Vælg en anden mappe.');openResolve?.(ok);openResolve=null;},
    ack(ok){const pending=ack;ack=null;if(pending)(ok?pending.resolve:pending.reject)();},
    saved(ok){updateClock();state(ok&&!lastError?'Optagelsen er gemt lokalt':'Optagelsen kunne ikke færdiggøres. Se efter en .partial-fil i den valgte mappe.');$('record-reveal').hidden=!ok||lastError;clean();if(window.extrudaRecordingTest)post('record-window-close');},
    get active(){return opening||active||finishing;}
  };
  $('record-open').onclick=()=>{if(!source||active||opening||finishing)return;$('record-form-error').textContent='';applyProfile();configuring=true;if(!$('record-dialog').open)$('record-dialog').showModal();notify();};
  $('record-cancel').onclick=()=>{configuring=false;$('record-dialog').close();notify();};$('record-dialog').addEventListener('cancel',()=>{configuring=false;notify();});$('record-submit').onclick=start;$('record-stop').onclick=stop;
  function pause(){if(recorder?.state==='recording'){updateClock();recorder.pause();state('Optagelse på pause');}else if(recorder?.state==='paused'){lastClock=performance.now();recorder.resume();state('Optager lokalt på pc’en');}controls();}
  $('record-pause').onclick=pause;
  $('phone-record-toggle').onclick=()=>{if(connected&&isApproved()&&remoteState!==null)void sendControl({type:'record-command',action:remoteState==='recording'?'pause':remoteState==='paused'?'resume':'start'}).catch(()=>{$('phone-record-status').textContent=tr('Optagestyring er ikke tilgængelig. Brug pc’en.');});};
  $('phone-record-stop').onclick=()=>{if(connected&&isApproved())void sendControl({type:'record-command',action:'stop'}).catch(()=>{});};
  $('record-quality').oninput=applyProfile;
  $('record-reveal').onclick=()=>post('record-reveal');
  $('record-advanced-toggle').onclick=()=>{const open=$('record-advanced').hidden;$('record-advanced').hidden=!open;$('record-advanced-toggle').setAttribute('aria-expanded',String(open));};
  for(const id of ['record-format','record-codec','record-size','record-fps','record-bitrate','record-audio','record-audio-bitrate','record-keyframe','record-audio-gain','record-limit'])$(id).onchange=estimate;
  window.addEventListener('extruda-connection',event=>{connected=!!event.detail.connected;if(!connected){stop();remoteState=null;}controls();if(window.extrudaRecordingTest&&connected){applyProfile();$('record-audio').checked=!!window.extrudaRecordingTestAudio;void start();setTimeout(()=>pause(),1200);setTimeout(()=>pause(),1700);setTimeout(stop,4000);}});
  window.addEventListener('extruda-language',()=>{controls();if($('record-dialog').open)estimate();});controls();
})();
