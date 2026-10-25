// Send bounded 20 ms mono PCM blocks. No recording or persistent storage.
class ExtrudaPcm extends AudioWorkletProcessor {
  constructor(){super();this.block=new Float32Array(960);this.offset=0;}
  process(inputs){
    const channels=inputs[0];if(!channels?.length)return true;
    for(let i=0;i<channels[0].length;i++){
      let value=0;for(const channel of channels)value+=channel[i]||0;
      this.block[this.offset++]=value/channels.length;
      if(this.offset===960){this.port.postMessage(this.block);this.block=new Float32Array(960);this.offset=0;}
    }
    return true;
  }
}
registerProcessor('extruda-pcm',ExtrudaPcm);
// Output is connected only to a MediaStream destination, never PC speakers.
class ExtrudaFiltered extends AudioWorkletProcessor {
 constructor(){super();this.blocks=[];this.offset=0;this.port.onmessage=event=>{
  if(event.data instanceof Float32Array&&event.data.length===960){if(this.blocks.length>=4){this.blocks=[];this.offset=0;}this.blocks.push(event.data);}
 };}
 process(inputs,outputs){const out=outputs[0]?.[0];if(!out)return true;
  for(let i=0;i<out.length;i++){out[i]=this.blocks.length?this.blocks[0][this.offset++]:0;if(this.offset===960){this.blocks.shift();this.offset=0;}}return true;
 }
}
registerProcessor('extruda-filtered',ExtrudaFiltered);
