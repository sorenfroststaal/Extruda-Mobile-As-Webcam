(() => {
  function geometry(sourceWidth,sourceHeight,width,height,mode='contain',rotation=0){
    if(![sourceWidth,sourceHeight,width,height].every(n=>Number.isFinite(n)&&n>0))return null;
    const angle=[0,90,180,270].includes(rotation)?rotation:0;
    const sideways=angle===90||angle===270;
    const scale=(mode==='cover'?Math.max:Math.min)(width/(sideways?sourceHeight:sourceWidth),height/(sideways?sourceWidth:sourceHeight));
    return{angle:angle*Math.PI/180,x:width/2,y:height/2,width:sourceWidth*scale,height:sourceHeight*scale};
  }
  window.ExtrudaVideo={geometry,draw(ctx,video,width,height,mode,rotation){
    const g=geometry(video.videoWidth,video.videoHeight,width,height,mode,rotation);if(!g)return false;
    ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.angle);
    ctx.drawImage(video,-g.width/2,-g.height/2,g.width,g.height);ctx.restore();return true;
  }};
})();
