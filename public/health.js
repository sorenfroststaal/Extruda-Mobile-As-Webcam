(() => {
  const $=id=>document.getElementById(id),tr=text=>window.ExtrudaI18n?.t(text)||text;
  const states=['new','connecting','connected','disconnected','failed','closed'];
  let peer=null,role='host',video=()=>null,epoch=0,busy=false,timer,frameAt=0,ackAt=0,lastFrames=-1,started=0;
  let transport='closed',statsAvailable=false,packets=0,lost=0,jitter=0;
  let history={video:[],audio:[]},recent={video:null,audio:null};
  function sample(kind,total){
    const now=performance.now(),items=history[kind],last=items.at(-1);
    if(last&&(now-last.time>6000||total.bytes<last.bytes||total.packets<last.packets||total.frames<last.frames))items.length=0;
    items.push({...total,time:now});while(items.length>2&&items[1].time<now-5000)items.shift();
    const first=items[0],seconds=(now-first.time)/1000;
    const received=Math.max(0,total.packets-first.packets),missing=Math.max(0,total.lost-first.lost);
    recent[kind]={seconds:Math.round(seconds*10)/10,fps:kind==='video'&&seconds>0?Math.round((total.frames-first.frames)/seconds):null,
      bitrateKbps:seconds>0?Math.round((total.bytes-first.bytes)*8/seconds/1000):null,
      lossPercent:role==='host'&&received+missing>0?Math.round(missing/(received+missing)*10000)/100:null,jitterMs:role==='host'?Math.round(total.jitter*1000):null};
  }
  const native=()=>location.origin==='https://app.extruda.local'&&!!window.chrome?.webview;
  const age=time=>time?Math.min(3600000,Math.max(0,Math.round(performance.now()-time))):null;
  const number=value=>Number.isFinite(value)?Math.max(0,Math.min(1e12,value)):0;
  function snapshot(){
    const media=video(),track=media?.srcObject?.getVideoTracks?.()[0];
    const audio=window.ExtrudaAudio?.health?.()||{enabled:false};
    const filter=window.ExtrudaNoise?.snapshot?.()||{};
    const noise={phase:['off','waiting','starting','active','retrying','failed'].includes(filter.phase)?filter.phase:'off',
      retries:filter.retries===1?1:0,reason:['startup','timeout','queue','input','pipe','unknown'].includes(filter.reason)?filter.reason:'',processed:number(filter.processed),skipped:number(filter.skipped)};
    let picture=!peer?'off':track?.readyState==='ended'?'ended':track?.muted||media?.paused?'paused':!statsAvailable?'unknown':frameAt&&age(frameAt)<5000?'flowing':performance.now()-started>5000?'stalled':'waiting';
    return {schema:2,version:'0.12.0',role,transport,video:picture,videoAgeMs:age(frameAt),windowsVideo:!native()?'not-app':ackAt&&age(ackAt)<5000?'accepted':'waiting',
      audio:{enabled:!!audio.enabled,signal:!!audio.signal,paused:!!audio.paused,context:['running','suspended','closed'].includes(audio.context)?audio.context:'closed',windowsAccepted:!!audio.windowsAccepted,noise},
      packets:number(packets),packetsLost:number(lost),jitterMs:Math.round(number(jitter)*1000),statsAvailable,
      received:{width:number(media?.videoWidth),height:number(media?.videoHeight)},recent:{video:recent.video,audio:recent.audio}};
  }
  const labels={off:'Ikke forbundet',ended:'Kamera stoppet',paused:'Kamera sat på pause',unknown:'Video kan ikke måles endnu',flowing:'Nye videobilleder modtages',stalled:'Ingen nye videobilleder i mindst 5 sekunder',waiting:'Afventer video'};
  function render(){
    const s=snapshot();$('health-summary').textContent=tr(s.transport==='connected'?(s.video==='flowing'?'Forbindelsen leverer nye videobilleder':'Forbundet · Kontrollér video og lyd'):['failed','disconnected'].includes(s.transport)?'Genopretter forbindelse…':'Kontrollér forbindelse');
    $('health-video').textContent=tr(labels[s.video]);
    $('health-audio').textContent=tr(!s.audio.enabled?'Mikrofon fra':s.audio.paused?'Mikrofon sat på pause af telefonen':s.audio.signal?'Mikrofonsignal registreres':'Mikrofon til · Der er stille');
    $('health-windows').textContent=tr(!native()?'Windows-kontrol kræver Windows-appen':s.windowsVideo==='accepted'?'Windows har accepteret videobilleder':'Afventer videobekræftelse fra Windows');
    $('health-output').textContent=tr(!s.audio.enabled?'Mikrofon fra':s.audio.windowsAccepted?'Windows har accepteret lyddata':'Lyddata er endnu ikke bekræftet af Windows');
    $('health-panel').hidden=!peer;
    const v=s.recent.video,a=s.recent.audio,show=(x,suffix)=>x===null||x===undefined?'—':x+suffix;
    $('quality-summary').textContent=peer?tr('Modtaget')+` ${s.received.width} × ${s.received.height} · ${show(v?.fps,' fps')} · ${show(v?.bitrateKbps,' kb/s')} · `:'';
    $('health-quality').textContent=tr('Seneste måleinterval · Højst cirka 5 sekunder')+'\n'+tr('Video')+`: ${show(v?.fps,' fps')} · ${show(v?.bitrateKbps,' kb/s')} · ${show(v?.lossPercent,'%')} · ${show(v?.jitterMs,' ms')}\n`+tr('Lyd')+`: ${show(a?.bitrateKbps,' kb/s')} · ${show(a?.lossPercent,'%')} · ${show(a?.jitterMs,' ms')}\n`+tr('Rækkefølge: billedhastighed, bitrate, pakketab og jitter. — betyder endnu ikke målt.');
  }
  async function poll(){
    if(!peer||busy){render();return;}
    const connection=peer,token=epoch;busy=true;let deadline;
    try{
      const stats=await Promise.race([connection.getStats(),new Promise((_,reject)=>{deadline=setTimeout(()=>reject(Error('timeout')),2000)})]);
      if(token!==epoch||peer!==connection)return;
      let frames=0,found=false;packets=lost=jitter=0;
      const totals={video:{bytes:0,packets:0,lost:0,frames:0,jitter:0,found:false},audio:{bytes:0,packets:0,lost:0,frames:0,jitter:0,found:false}};
      for(const item of stats.values()){
        const kind=item.kind||item.mediaType;
        if(totals[kind]&&item.type===(role==='host'?'inbound-rtp':'outbound-rtp')){const t=totals[kind];t.found=true;t.bytes+=number(role==='host'?item.bytesReceived:item.bytesSent);t.packets+=number(role==='host'?item.packetsReceived:item.packetsSent);t.lost+=number(item.packetsLost);t.frames+=number(role==='host'?item.framesDecoded:item.framesEncoded);t.jitter=Math.max(t.jitter,number(item.jitter));}
        if(item.type==='inbound-rtp'&&role==='host'){
          packets+=number(item.packetsReceived);lost+=number(item.packetsLost);jitter=Math.max(jitter,number(item.jitter));
          if((item.kind||item.mediaType)==='video'&&Number.isFinite(item.framesDecoded)){frames+=item.framesDecoded;found=true;}
        }else if(item.type==='outbound-rtp'&&role==='phone'&&(item.kind||item.mediaType)==='video'&&Number.isFinite(item.framesEncoded)){frames+=item.framesEncoded;found=true;}
      }
      statsAvailable=found;
      for(const kind of ['video','audio'])if(totals[kind].found)sample(kind,totals[kind]);else{history[kind]=[];recent[kind]=null;}
      if(found&&frames>0&&frames!==lastFrames)frameAt=performance.now();lastFrames=frames;
    }catch{if(token===epoch)statsAvailable=false;}
    finally{clearTimeout(deadline);if(token===epoch){busy=false;render();}}
  }
  window.ExtrudaHealth={
    session(options){++epoch;history={video:[],audio:[]};recent={video:null,audio:null};peer=options.peer;role=options.role==='phone'?'phone':'host';video=options.video;started=performance.now();frameAt=ackAt=0;lastFrames=-1;busy=false;statsAvailable=false;transport='new';clearInterval(timer);timer=setInterval(()=>void poll(),1000);render();},
    transport(state){transport=states.includes(state)?state:'closed';render();},
    videoAck(){ackAt=performance.now();},
    stop(){++epoch;history={video:[],audio:[]};recent={video:null,audio:null};clearInterval(timer);peer=null;busy=false;frameAt=ackAt=0;transport='closed';statsAvailable=false;packets=lost=jitter=0;render();},
    snapshot,poll
  };
  $('health-open').onclick=()=>{if($('safety').open)$('safety').close();$('health-dialog').showModal();void poll();};
  $('health-close').onclick=()=>$('health-dialog').close();
  $('health-check').onclick=async()=>{$('health-check').disabled=true;try{await poll();$('health-result').textContent=tr('Kontrol afsluttet. Se hvert led ovenfor. Mødeprogrammets valg kan ikke kontrolleres her.');}finally{$('health-check').disabled=false;}};
  $('health-copy').onclick=async()=>{
    // Explicit allowlist: no SDP, candidates, URLs, device labels, tokens,
    // browser identifiers, media samples or arbitrary exception text.
    const report=JSON.stringify(snapshot(),null,2);$('health-report').value=report;$('health-report').hidden=false;
    try{await navigator.clipboard.writeText(report);$('health-result').textContent=tr('Fejlrapport kopieret. Ingen billeder, lyd eller parringsnøgler.');}
    catch{$('health-report').select();$('health-result').textContent=tr('Markér og kopiér rapporten manuelt.');}
  };
  window.addEventListener('extruda-language',render);render();
})();
