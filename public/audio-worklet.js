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
