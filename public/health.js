(() => {
  const $=id=>document.getElementById(id),tr=text=>window.ExtrudaI18n?.t(text)||text;
  const states=['new','connecting','connected','disconnected','failed','closed'];
  let peer=null,role='host',video=()=>null,epoch=0,busy=false,timer,frameAt=0,ackAt=0,lastFrames=-1,started=0;
  let transport='closed',statsAvailable=false,packets=0,lost=0,jitter=0;
  const native=()=>location.origin==='https://app.extruda.local'&&!!window.chrome?.webview;
  const age=time=>time?Math.min(3600000,Math.max(0,Math.round(performance.now()-time))):null;
  const number=value=>Number.isFinite(value)?Math.max(0,Math.min(1e12,value)):0;
  function snapshot(){
    const media=video(),track=media?.srcObject?.getVideoTracks?.()[0];
    const audio=window.ExtrudaAudio?.health?.()||{enabled:false};
    let picture=!peer?'off':track?.readyState==='ended'?'ended':track?.muted||media?.paused?'paused':!statsAvailable?'unknown':frameAt&&age(frameAt)<5000?'flowing':performance.now()-started>5000?'stalled':'waiting';
    return {schema:1,version:'0.8.0',role,transport,video:picture,videoAgeMs:age(frameAt),windowsVideo:!native()?'not-app':ackAt&&age(ackAt)<5000?'accepted':'waiting',
      audio:{enabled:!!audio.enabled,signal:!!audio.signal,paused:!!audio.paused,context:['running','suspended','closed'].includes(audio.context)?audio.context:'closed',windowsAccepted:!!audio.windowsAccepted},
      packets:number(packets),packetsLost:number(lost),jitterMs:Math.round(number(jitter)*1000),statsAvailable};
  }
  const labels={off:'Ikke forbundet',ended:'Kamera stoppet',paused:'Kamera sat på pause',unknown:'Video kan ikke måles endnu',flowing:'Nye videobilleder modtages',stalled:'Ingen nye videobilleder i mindst 5 sekunder',waiting:'Afventer video'};
  function render(){
    const s=snapshot();$('health-summary').textContent=tr(s.transport==='connected'?(s.video==='flowing'?'Forbindelsen leverer nye videobilleder':'Forbundet · Kontrollér video og lyd'):['failed','disconnected'].includes(s.transport)?'Genopretter forbindelse…':'Kontrollér forbindelse');
    $('health-video').textContent=tr(labels[s.video]);
    $('health-audio').textContent=tr(!s.audio.enabled?'Mikrofon fra':s.audio.paused?'Mikrofon sat på pause af telefonen':s.audio.signal?'Mikrofonsignal registreres':'Ingen mikrofonlyd registreret');
    $('health-windows').textContent=tr(!native()?'Windows-kontrol kræver Windows-appen':s.windowsVideo==='accepted'?'Windows har accepteret videobilleder':'Afventer videobekræftelse fra Windows');
    $('health-output').textContent=tr(!s.audio.enabled?'Mikrofon fra':s.audio.windowsAccepted?'Windows har accepteret lyddata':'Lyddata er endnu ikke bekræftet af Windows');
    $('health-panel').hidden=!peer;
  }
  async function poll(){
    if(!peer||busy){render();return;}
    const connection=peer,token=epoch;busy=true;let deadline;
    try{
      const stats=await Promise.race([connection.getStats(),new Promise((_,reject)=>{deadline=setTimeout(()=>reject(Error('timeout')),2000)})]);
      if(token!==epoch||peer!==connection)return;
      let frames=0,found=false;packets=lost=jitter=0;
      for(const item of stats.values()){
        if(item.type==='inbound-rtp'&&role==='host'){
          packets+=number(item.packetsReceived);lost+=number(item.packetsLost);jitter=Math.max(jitter,number(item.jitter));
          if((item.kind||item.mediaType)==='video'&&Number.isFinite(item.framesDecoded)){frames+=item.framesDecoded;found=true;}
        }else if(item.type==='outbound-rtp'&&role==='phone'&&(item.kind||item.mediaType)==='video'&&Number.isFinite(item.framesEncoded)){frames+=item.framesEncoded;found=true;}
      }
      statsAvailable=found;
      if(found&&frames>0&&frames!==lastFrames)frameAt=performance.now();lastFrames=frames;
    }catch{if(token===epoch)statsAvailable=false;}
    finally{clearTimeout(deadline);if(token===epoch){busy=false;render();}}
  }
  window.ExtrudaHealth={
    session(options){++epoch;peer=options.peer;role=options.role==='phone'?'phone':'host';video=options.video;started=performance.now();frameAt=ackAt=0;lastFrames=-1;busy=false;statsAvailable=false;transport='new';clearInterval(timer);timer=setInterval(()=>void poll(),1000);render();},
    transport(state){transport=states.includes(state)?state:'closed';render();},
    videoAck(){ackAt=performance.now();},
    stop(){++epoch;clearInterval(timer);peer=null;busy=false;frameAt=ackAt=0;transport='closed';statsAvailable=false;packets=lost=jitter=0;render();},
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
