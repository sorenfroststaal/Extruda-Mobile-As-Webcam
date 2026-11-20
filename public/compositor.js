(() => {
  const full = () => ({x:0,y:0,w:1,h:1});
  let config={crop:full(),masks:[],overlay:{x:.58,y:.02,w:.4,opacity:1}},image=null;
  let source,stage,patch;
  function rect(value){
    if(!value||!['x','y','w','h'].every(k=>Number.isFinite(value[k])))throw Error('Invalid rectangle');
    const x=Math.max(0,Math.min(.97,value.x)),y=Math.max(0,Math.min(.97,value.y));
    return{x,y,w:Math.max(.03,Math.min(1-x,value.w)),h:Math.max(.03,Math.min(1-y,value.h))};
  }
  function update(value){
    if(!Array.isArray(value.masks)||value.masks.length>12)throw Error('Invalid masks');
    const masks=value.masks.map(m=>{
      if(!['solid','blur'].includes(m.kind)||!/^#[0-9a-f]{6}$/i.test(m.color)||!Number.isFinite(m.strength))throw Error('Invalid mask');
      return{...rect(m),kind:m.kind,color:m.color,strength:Math.max(4,Math.min(80,m.strength))};
    });
    const o=value.overlay;
    if(!o||!['x','y','w','opacity'].every(k=>Number.isFinite(o[k])))throw Error('Invalid overlay');
    config={crop:rect(value.crop),masks,overlay:{x:Math.max(0,Math.min(1,o.x)),y:Math.max(0,Math.min(1,o.y)),w:Math.max(.05,Math.min(1,o.w)),opacity:Math.max(0,Math.min(1,o.opacity))}};
  }
  function canvas(current,w,h){
    const c=current||document.createElement('canvas');if(c.width!==w)c.width=w;if(c.height!==h)c.height=h;return c;
  }
  function maskedSource(video){
    const w=video.videoWidth,h=video.videoHeight;
    source=canvas(source,w,h);const c=source.getContext('2d');c.clearRect(0,0,w,h);c.drawImage(video,0,0,w,h);
    for(const m of config.masks){
      // Cover every boundary pixel; never introduce transparent holes.
      const x=Math.floor(m.x*w),y=Math.floor(m.y*h),rw=Math.ceil((m.x+m.w)*w)-x,rh=Math.ceil((m.y+m.h)*h)-y;
      if(m.kind==='solid'){c.fillStyle=m.color;c.fillRect(x,y,rw,rh);continue;}
      const radius=Math.max(4,Math.round(m.strength*Math.min(w,h)/1080)),pad=radius*3;
      patch=canvas(patch,rw+pad*2,rh+pad*2);const p=patch.getContext('2d');
      if(!('filter' in p))throw Error('Blur unavailable');
      p.filter='none';p.clearRect(0,0,patch.width,patch.height);
      // Sample the already masked surface so overlapping masks cannot restore
      // pixels hidden by a previous opaque mask.
      p.filter=`blur(${radius}px)`;p.drawImage(source,-x+pad,-y+pad);p.filter='none';
      c.fillStyle=m.color;c.fillRect(x,y,rw,rh);c.drawImage(patch,pad,pad,rw,rh,x,y,rw,rh);
    }
    // Opaque masks win over every blur, including overlapping later masks.
    for(const m of config.masks.filter(m=>m.kind==='solid')){const ctx=source.getContext('2d');ctx.fillStyle=m.color;const x=Math.floor(m.x*source.width),y=Math.floor(m.y*source.height);ctx.fillRect(x,y,Math.ceil((m.x+m.w)*source.width)-x,Math.ceil((m.y+m.h)*source.height)-y);}
    return source;
  }
  window.ExtrudaCompositor={
    rect,update,get config(){return structuredClone(config)},
    get hasOverlay(){return !!image},
    active(){const c=config.crop;return !!image||config.masks.length>0||c.x!==0||c.y!==0||c.w!==1||c.h!==1},
    setOverlay(bitmap){
      if(bitmap&&(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>16777216))throw Error('Image too large');
      if(image&&image!==bitmap)image.close?.();image=bitmap;
    },
    reset(){image?.close?.();image=null;config={crop:full(),masks:[],overlay:{x:.58,y:.02,w:.4,opacity:1}}},
    editor(ctx,video,w,h){ctx.clearRect(0,0,w,h);ctx.drawImage(maskedSource(video),0,0,w,h)},
    render(ctx,video,w,h,mode,rotation,geometry){
      try{
        const sw=video.videoWidth,sh=video.videoHeight,c=config.crop;
        if(!sw||!sh)return false;
        const g=geometry(c.w*sw,c.h*sh,w,h,mode,rotation);if(!g)return false;
        stage=canvas(stage,w,h);const out=stage.getContext('2d');
        out.filter='none';out.globalAlpha=1;out.fillStyle='#000';out.fillRect(0,0,w,h);
        out.save();out.translate(g.x,g.y);out.rotate(g.angle);
        try{out.drawImage(maskedSource(video),c.x*sw,c.y*sh,c.w*sw,c.h*sh,-g.width/2,-g.height/2,g.width,g.height)}finally{out.restore()}
        if(image){const o=config.overlay,ow=Math.min(o.w*w,h*image.width/image.height),oh=ow*image.height/image.width;out.globalAlpha=o.opacity;out.drawImage(image,o.x*w,o.y*h,ow,oh);out.globalAlpha=1;}
        // Publish only a completely processed frame, shared by preview,
        // Windows camera and recording. Never fall back to raw video on error.
        ctx.clearRect(0,0,w,h);ctx.drawImage(stage,0,0);return true;
      }catch{ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);return false;}
    }
  };
})();
