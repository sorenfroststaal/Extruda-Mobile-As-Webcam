import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const path=new URL('../windows/vendor/deepfilter/deep_filter.dll',import.meta.url);
const expected='f97e34275eb884b6076a96d261683d2a43c6b2d97ddf9e346bc06f7c8057eb04';
let data;
try{data=await readFile(path);}catch(error){
 if(error.code!=='ENOENT')throw error;
 const response=await fetch('https://github.com/Rikorose/DeepFilterNet/releases/download/v0.5.6/deep_filter_ladspa-0.5.6-x86_64-pc-windows-msvc.dll');
 if(!response.ok)throw Error('DeepFilterNet download failed');data=Buffer.from(await response.arrayBuffer());
}
if(createHash('sha256').update(data).digest('hex')!==expected)throw Error('DeepFilterNet SHA256 mismatch. Build stopped.');
await writeFile(path,data);
console.log('DeepFilterNet 0.5.6 verified. Embedded model; no runtime download.');
