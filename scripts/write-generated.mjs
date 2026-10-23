import {readFile,writeFile} from 'node:fs/promises';
import {setTimeout} from 'node:timers/promises';
// Avoid rewriting identical generated files and tolerate brief OneDrive locks.
export async function writeGenerated(path,content){
  try{if(await readFile(path,'utf8')===content)return;}catch(error){if(error.code!=='ENOENT')throw error;}
  for(let attempt=0;;attempt++){
    try{await writeFile(path,content);return;}
    catch(error){if(attempt>=5||!['EBUSY','EPERM','UNKNOWN'].includes(error.code))throw error;await setTimeout(50*(attempt+1));}
  }
}
