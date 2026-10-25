(() => {
 const $=id=>document.getElementById(id),tr=(key,values)=>window.ExtrudaI18n?.t(key,values)||key.replace(/\{(\w+)\}/g,(m,k)=>values?.[k]??m);
 const post=value=>{if(location.origin==='https://app.extruda.local')window.chrome?.webview?.postMessage(value);};
 const level=data=>Math.sqrt(data.reduce((sum,v)=>sum+v*v,0)/Math.max(1,data.length));
 const attenuation=value=>Math.round(6+54*Math.max(0,Math.min(100,Number(value)||0))/100);
 window.ExtrudaNoiseMath={level,attenuation};
 let ctx,player,destination,output,requested=false,phase='off',epoch=0,sequence=0,ready=false;
 let retries=0,reason='',retryTimer,watchdog,pending=new Map(),strength=55,processed=0,skipped=0,lastOutput=0;
 let preview=null,previewTimer,playback,playbackVolume,playbackContext,previewEpoch=0;
 let lastRender=-100,renderedPhase='';
 const reasons={startup:'Lydmotoren kunne ikke starte',timeout:'Lydmotoren svarede for langsomt',queue:'Lydkøen blev overfyldt',input:'Lydpakken blev afvist',pipe:'Forbindelsen til lydmotoren blev afbrudt',unknown:'Ukendt fejl i lydmotoren'};
 const labels={off:'Støjreduktion fra',waiting:'Afventer mikrofon',starting:'Starter lokal lydrensning…',active:'DeepFilterNet aktiv · Behandles lokalt',retrying:'Genstarter støjreduktion · Original lyd bruges',failed:'Lydrensning stoppede. Original lyd bruges.'};
 function render(force=false){
  const now=performance.now();if(!force&&renderedPhase===phase&&now-lastRender<80)return;lastRender=now;renderedPhase=phase;
  const text=tr(labels[phase]);for(const id of ['audio-denoise-status','noise-summary'])if($(id)){if($(id).textContent!==text)$(id).textContent=text;$(id).dataset.state=phase;}
  if($('audio-denoise'))$('audio-denoise').checked=requested;
  if($('noise-strength'))$('noise-strength').disabled=!requested;
  if($('noise-strength-value'))$('noise-strength-value').textContent=tr('Op til {db} dB dæmpning',{db:attenuation(strength)});
  if($('noise-detail'))$('noise-detail').textContent=reason?tr(reasons[reason]||reasons.unknown):'';
  if($('noise-listen'))$('noise-listen').disabled=phase!=='active';
  if($('noise-preview-start')&&!preview?.collecting)$('noise-preview-start').disabled=phase!=='active';
  if($('noise-output-level')){
   const db=lastOutput>0?Math.max(-90,20*Math.log10(lastOutput)):-90;
   $('noise-output-level').value=Math.max(0,Math.min(100,(db+60)/60*100));$('noise-output-level').setAttribute('aria-valuetext',db.toFixed(1)+' dBFS');
   $('noise-output-db').textContent=db.toFixed(1)+' dBFS';
  }
 }
 function clearPending(){clearTimeout(watchdog);pending.clear();}
 function stopEngine(){const old=epoch++;ready=false;clearPending();post('filter-stop:'+old);}
 function arm(){
  clearTimeout(watchdog);if(!pending.size)return;
  const oldest=pending.values().next().value;
  watchdog=setTimeout(()=>{
   // Suspended graphs and idle input are not filter failures. Only an unanswered
   // submitted block has a deadline; stale callbacks cannot affect a new epoch.
   if(ctx?.state==='suspended'){stopEngine();phase='waiting';render();return;}
   failure(epoch,'timeout');
  },Math.max(1,2500-(performance.now()-oldest.time)));
 }
 function startEngine(){
  if(!ctx||!requested)return;
  stopEngine();phase='starting';post('filter-start:'+epoch);render();
  const token=epoch;watchdog=setTimeout(()=>failure(token,'startup'),16000);
 }
 function deliver(samples){
  if(!ctx||!player)return;
  player.port.postMessage(samples);output?.(samples);lastOutput=level(samples);
 }
 function failure(token,code){
  if(token!==epoch||!requested||!ctx)return;
  reason=Object.hasOwn(reasons,code)?code:'unknown';stopEngine();cancelPreview(true);
  if(retries<1){retries++;phase='retrying';render();retryTimer=setTimeout(()=>{if(ctx&&requested)startEngine();},500);}
  else{requested=false;phase='failed';render();}
 }
 function accept(samples){
  if(!ctx||!(samples instanceof Float32Array)||samples.length!==960)return;
  if(requested&&phase==='waiting'&&ctx.state==='running')startEngine();
  if(!requested||!ready){deliver(samples);render();return;}
  if(pending.size>=4){skipped++;return;}
  const bytes=new Uint8Array(1920),view=new DataView(bytes.buffer),seq=++sequence;
  for(let i=0;i<960;i++)view.setInt16(i*2,Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),true);
  pending.set(seq,{raw:preview?.collecting?samples.slice():null,time:performance.now()});
  post('filter-pcm:'+epoch+':'+seq+':'+attenuation(strength)+':'+btoa(String.fromCharCode(...bytes)));arm();
 }
 function result(token,seq,encoded){
  if(token!==epoch||!requested||!ctx||!pending.has(seq)||typeof encoded!=='string'||encoded.length!==2560)return;
  let data;try{data=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));}catch{return;}
  if(data.length!==1920)return;
  const item=pending.get(seq);pending.delete(seq);const view=new DataView(data.buffer),samples=new Float32Array(960);
  for(let i=0;i<960;i++)samples[i]=view.getInt16(i*2,true)/32768;
  deliver(samples);processed++;phase='active';arm();
  if(preview?.collecting&&item.raw&&preview.raw.length<500){preview.raw.push(item.raw);preview.clean.push(samples);}
  render();
 }
 function stopPlayback(){playback?.stop();playback?.disconnect();playback=null;playbackVolume?.disconnect();playbackVolume=null;
  const old=playbackContext;playbackContext=null;if(old)void old.close().catch(()=>{});
 }
 function cancelPreview(failed=false){
  ++previewEpoch;clearTimeout(previewTimer);stopPlayback();
  for(const item of pending.values())item.raw=null;
  if(preview){preview.raw.length=preview.clean.length=0;}preview=null;
  for(const id of ['noise-play-raw','noise-play-clean'])if($(id))$(id).disabled=true;
  if($('noise-preview-start'))$('noise-preview-start').disabled=phase!=='active';
  if($('noise-preview-status'))$('noise-preview-status').textContent=tr(failed?'Lyttetesten blev afbrudt. Ingen testlyd er bevaret.':'Testlyden er slettet fra hukommelsen.');
 }
 function finishPreview(){
  if(!preview)return;preview.collecting=false;
  // Drop unmatched original blocks: raw and filtered samples must represent
  // exactly the same input, not two recordings made at different times.
  for(const item of pending.values())item.raw=null;
  const valid=preview.raw.length>=25;
  for(const id of ['noise-play-raw','noise-play-clean'])$(id).disabled=!valid;
  $('noise-preview-start').disabled=false;
  $('noise-preview-status').textContent=tr(valid?'Klar til sammenligning. Samme afspilningsniveau bruges.':'For lidt lyd til sammenligning. Prøv igen.');
 }
 function play(kind){
  if(!preview||preview.collecting||!preview.raw.length)return;stopPlayback();
  const context=new AudioContext({sampleRate:48000});playbackContext=context;
  const blocks=kind==='raw'?preview.raw:preview.clean,buffer=context.createBuffer(1,blocks.length*960,48000),channel=buffer.getChannelData(0);
  for(let i=0;i<blocks.length;i++)channel.set(blocks[i],i*960);
  playback=context.createBufferSource();playback.buffer=buffer;playbackVolume=context.createGain();
  // A common gain preserves the real before/after difference. Never auto-boost
  // quiet background noise; playback starts only after an explicit user click.
  playbackVolume.gain.value=0.25;playback.connect(playbackVolume);playbackVolume.connect(context.destination);playback.start();void context.resume();
 }
 if($('audio-denoise'))$('audio-denoise').onchange=()=>{
  requested=!!$('audio-denoise').checked;retries=0;reason='';clearTimeout(retryTimer);cancelPreview();
  if(requested){if(ctx)startEngine();else phase='waiting';}else{stopEngine();phase='off';}render();
 };
 if($('noise-strength'))$('noise-strength').oninput=()=>{strength=Math.max(0,Math.min(100,Number($('noise-strength').value)||0));render(true);};
 if($('noise-listen'))$('noise-listen').onclick=()=>{cancelPreview();$('noise-preview').showModal();};
 if($('noise-preview-start'))$('noise-preview-start').onclick=()=>{
  if(phase!=='active')return;cancelPreview();preview={raw:[],clean:[],collecting:true};const token=++previewEpoch;
  $('noise-preview-start').disabled=true;$('noise-preview-status').textContent=tr('Tal normalt i 10 sekunder. Testlyden holdes kun i hukommelsen.');
  previewTimer=setTimeout(()=>{if(token===previewEpoch)finishPreview();},10000);
 };
 if($('noise-preview-close'))$('noise-preview-close').onclick=()=>$('noise-preview').close();
 $('noise-preview')?.addEventListener('close',()=>cancelPreview());$('noise-preview')?.addEventListener('cancel',()=>cancelPreview());
 if($('noise-play-raw'))$('noise-play-raw').onclick=()=>play('raw');if($('noise-play-clean'))$('noise-play-clean').onclick=()=>play('clean');
 if($('noise-play-stop'))$('noise-play-stop').onclick=stopPlayback;
 window.addEventListener('extruda-language',render);
 window.addEventListener('pagehide',()=>{cancelPreview();stopEngine();});
 window.ExtrudaNoise={accept,result,failure,
  ready(token){if(token!==epoch||!ctx||!requested)return;clearTimeout(watchdog);ready=true;},
  bind(context,send){this.detach();ctx=context;output=send;
   destination=ctx.createMediaStreamDestination();player=new AudioWorkletNode(ctx,'extruda-filtered',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[1]});player.connect(destination);
   retries=0;if(requested)startEngine();else if(phase!=='failed')phase='off';render();
  },
  detach(){clearTimeout(retryTimer);stopEngine();cancelPreview();player?.disconnect();destination?.stream.getTracks().forEach(track=>track.stop());
   ctx=player=destination=output=null;lastOutput=0;if(requested)phase='waiting';render();
  },
  track(){return destination?.stream.getAudioTracks()[0]||null;},
  snapshot(){return{phase,requested,retries,reason,processed,skipped,pending:pending.size,session:epoch,lastSequence:sequence,attenuationDb:attenuation(strength),previewSamples:(preview?.raw.length||0)*960};}
 };
 render();
})();
