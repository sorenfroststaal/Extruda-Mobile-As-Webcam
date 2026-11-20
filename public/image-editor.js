(() => {
  const t=text=>window.ExtrudaI18n?.t(text)||text;
  window.ExtrudaImageEditor={open(){
    if(!window.extrudaNative)return;
    const video=document.getElementById('remote'),engine=window.ExtrudaCompositor;
    if(!video?.videoWidth||!engine)return;
    let dialog=document.getElementById('image-editor');
    if(dialog){dialog.showModal();return;}
    dialog=document.createElement('dialog');dialog.id='image-editor';dialog.setAttribute('aria-labelledby','image-editor-title');
    // Static application markup only. Uploaded names and content never enter HTML.
    dialog.innerHTML=`<h2 id="image-editor-title">Redigér billede</h2>
      <p>Ændringer gælder webcam og nye optagelser. De gemmes kun, mens appen er åben.</p>
      <div class="image-editor-preview"><canvas id="edit-canvas" aria-label="Markér et område ved at trække i billedet"></canvas></div>
      <div class="image-editor-tools"><label>Værktøj<select id="edit-tool"><option value="crop">Beskær</option><option value="solid">Dæk med farve</option><option value="blur">Slør</option></select></label>
      <label>Farve<input type="color" id="edit-color" value="#000000"></label><label>Sløring<input type="range" id="edit-blur" min="4" max="80" value="24"></label></div>
      <p>Træk et område i billedet, eller indtast procenter nedenfor. Vælg Anvend område.</p>
      <div class="image-editor-tools" id="edit-coordinates"></div>
      <div class="image-editor-tools"><button id="edit-apply">Anvend område</button><button id="edit-crop-clear">Vis hele billedet</button></div>
      <p>En dækkende farve skjuler området helt. Sløring kan stadig efterlade genkendelige detaljer.</p>
      <label>Skjulte områder<select id="edit-masks"></select></label><button id="edit-remove">Fjern valgt område</button>
      <details><summary>Overlaygrafik</summary><label>Vælg billede<input type="file" id="edit-file" accept="image/png,image/jpeg,image/webp"></label>
      <p>PNG, JPEG eller WebP · højst 15 MB og 16 megapixel. Billedet bliver på pc’en.</p>
      <div class="image-editor-tools" id="edit-overlay-controls"></div><button id="edit-overlay-remove">Fjern grafik</button></details>
      <p id="edit-message" role="status"></p><div class="image-editor-tools"><button id="edit-reset">Nulstil alle ændringer</button><button id="edit-close">Luk</button></div>`;
    document.body.append(dialog);
    const $=id=>dialog.querySelector('#'+id),preview=$('edit-canvas'),ctx=preview.getContext('2d');
    let selection={x:0,y:0,w:1,h:1},start=null,timer=null,fileGeneration=0;
    const coords={};
    for(const [key,title] of [['x','Venstre (%)'],['y','Top (%)'],['w','Bredde (%)'],['h','Højde (%)']]){
      const label=document.createElement('label');label.textContent=title;const input=document.createElement('input');input.type='number';input.min=key==='w'||key==='h'?'3':'0';input.max='100';input.step='0.1';input.value=selection[key]*100;label.append(input);$('edit-coordinates').append(label);coords[key]=input;
    }
    const writeCoords=()=>{for(const key in coords)coords[key].value=(selection[key]*100).toFixed(1)};
    const readCoords=()=>engine.rect(Object.fromEntries(Object.entries(coords).map(([key,input])=>[key,Number(input.value)/100])));
    const save=change=>{const config=engine.config;change(config);engine.update(config);refreshMasks();};
    function refreshMasks(){const list=$('edit-masks'),previous=list.value;list.replaceChildren();engine.config.masks.forEach((mask,index)=>{const option=document.createElement('option');option.value=index;option.textContent=`${index+1} · ${t(mask.kind==='solid'?'Dæk med farve':'Slør')}`;list.append(option)});if([...list.options].some(o=>o.value===previous))list.value=previous;$('edit-remove').disabled=!list.options.length;}
    $('edit-apply').onclick=()=>{try{selection=readCoords();save(config=>{if($('edit-tool').value==='crop')config.crop=selection;else{if(config.masks.length>=12)throw Error('limit');config.masks.push({...selection,kind:$('edit-tool').value,color:$('edit-color').value,strength:Number($('edit-blur').value)})}});$('edit-message').textContent=t('Område anvendt');}catch{$('edit-message').textContent=t('Kontrollér procenterne. Højst 12 områder.')}};
    $('edit-crop-clear').onclick=()=>save(config=>{config.crop={x:0,y:0,w:1,h:1}});
    $('edit-remove').onclick=()=>save(config=>config.masks.splice(Number($('edit-masks').value),1));
    for(const [key,title,min,max] of [['x','Venstre (%)',0,100],['y','Top (%)',0,100],['w','Bredde (%)',3,100],['opacity','Synlighed (%)',0,100]]){
      const label=document.createElement('label');label.textContent=title;const input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.value=engine.config.overlay[key]*100;input.dataset.overlay=key;label.append(input);$('edit-overlay-controls').append(label);input.oninput=()=>save(config=>{config.overlay[key]=Number(input.value)/100});
    }
    $('edit-file').onchange=async()=>{const generation=++fileGeneration,file=$('edit-file').files[0];if(!file)return;let bitmap;try{
      if(file.size>15*1024*1024)throw Error('size');
      const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
      const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;
      const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
      const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
      if(!png&&!jpeg&&!webp)throw Error('format');bitmap=await createImageBitmap(file);
      if(generation!==fileGeneration){bitmap.close();return;}engine.setOverlay(bitmap);bitmap=null;$('edit-message').textContent=t('Grafik tilføjet');
    }catch{bitmap?.close();$('edit-message').textContent=t('Billedet kunne ikke åbnes. Brug PNG, JPEG eller WebP under 15 MB og 16 megapixel.')}finally{$('edit-file').value=''}};
    $('edit-overlay-remove').onclick=()=>{fileGeneration++;engine.setOverlay(null)};
    $('edit-reset').onclick=()=>{fileGeneration++;engine.reset();selection={x:0,y:0,w:1,h:1};writeCoords();refreshMasks();for(const input of dialog.querySelectorAll('[data-overlay]'))input.value=engine.config.overlay[input.dataset.overlay]*100;};
    const point=event=>{const bounds=preview.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(event.clientX-bounds.left)/bounds.width)),y:Math.max(0,Math.min(1,(event.clientY-bounds.top)/bounds.height))}};
    preview.onpointerdown=event=>{start=point(event);preview.setPointerCapture(event.pointerId)};
    preview.onpointermove=event=>{if(!start)return;const end=point(event);selection=engine.rect({x:Math.min(start.x,end.x),y:Math.min(start.y,end.y),w:Math.abs(end.x-start.x),h:Math.abs(end.y-start.y)});writeCoords()};
    preview.onpointerup=preview.onpointercancel=()=>{start=null};
    function paint(){if(!dialog.open)return;try{const scale=Math.min(1,960/video.videoWidth);preview.width=Math.round(video.videoWidth*scale);preview.height=Math.round(video.videoHeight*scale);engine.editor(ctx,video,preview.width,preview.height);const crop=engine.config.crop;ctx.strokeStyle='#edb494';ctx.lineWidth=3;ctx.strokeRect(crop.x*preview.width,crop.y*preview.height,crop.w*preview.width,crop.h*preview.height);ctx.setLineDash([8,5]);ctx.strokeStyle='#fff';ctx.strokeRect(selection.x*preview.width,selection.y*preview.height,selection.w*preview.width,selection.h*preview.height);}catch{ctx.fillStyle='#000';ctx.fillRect(0,0,preview.width,preview.height)}timer=setTimeout(paint,100)}
    $('edit-close').onclick=()=>dialog.close();dialog.onclose=()=>{clearTimeout(timer);fileGeneration++;dialog.remove()};
    refreshMasks();dialog.showModal();paint();
  }};
})();
