// Keep plain-language risk explanations identical in the app and GitHub docs.
import {readFile,writeFile} from 'node:fs/promises';
const languages=['da','en','de','fr'];
const content=JSON.parse(await readFile('scripts/security-plain.json','utf8'));
const help=JSON.parse(await readFile('scripts/help-content.json','utf8'));
const development=help.find(item=>item.id==='development').paragraphs[0];
const labels=[['Kort fortalt','In plain language','Einfach erklärt','En termes simples'],['Det kan betyde for dig','What could happen to you','Was das für dich bedeuten kann','Ce que cela peut entraîner pour vous']];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for(const [i,lang] of languages.entries()){
 const path=`public/locales/${lang}.json`;const dictionary=JSON.parse(await readFile(path,'utf8'));
 for(const row of labels)dictionary[row[0]]=row[i];
 for(const item of content)for(const row of [item.meaning,item.impact])dictionary[row[0]]=row[i];
 dictionary[content.at(-1).title[0]]=content.at(-1).title[i];
 await writeFile(path,JSON.stringify(dictionary,null,2)+'\n');
 const docPath=`docs/SECURITY.${lang}.md`;
 let doc=(await readFile(docPath,'utf8')).replace(/\r\n/g,'\n').replace(/\n<!-- plain:start -->[\s\S]*?<!-- plain:end -->\n?/g,'\n');
 const footer=doc.match(/^\[Technical review\].*$/m)?.[0]||'';
 doc=doc.replace(/^\[Technical review\].*\n?/gm,'');
 let count=0;
 doc=doc.split(/(?=^## )/m).map(section=>{
  if(!section.startsWith('## '))return section;
  const item=content[count++];if(!item)throw Error('Unexpected security section in '+lang);
  const title=section.split('\n')[0].slice(3).trim();
  if(title!==item.title[i])throw Error(`Security heading mismatch: ${lang}: ${title}`);
  return section.trimEnd()+`\n\n<!-- plain:start -->\n**${labels[0][i]}**\n\n${item.meaning[i]}\n\n**${labels[1][i]}**\n\n${item.impact[i]}\n<!-- plain:end -->\n\n`;
 }).join('');
 if(count!==content.length)throw Error('Missing security sections: '+lang);
 await writeFile(docPath,doc.trimEnd()+'\n\n'+footer+'\n');
}
const path='public/index.html';let html=await readFile(path,'utf8');
const cards=[...html.matchAll(/<article class="risk-card">([\s\S]*?)<\/article>/g)];
if(cards.length===content.length-1){const last=cards.at(-1)[0];html=html.replace(last,last+`<article class="risk-card"><h3>${escape(content.at(-1).title[0])}</h3><p>${escape(development[0])}</p></article>`);}
let index=0;
html=html.replace(/<article class="risk-card">([\s\S]*?)<\/article>/g,(_,body)=>{
 const item=content[index++];if(!item)throw Error('Unexpected risk card');
 body=body.replace(/<div class="risk-plain">[\s\S]*?<\/div>/g,'');
 return `<article class="risk-card">${body}<div class="risk-plain"><p><strong>${labels[0][0]}</strong><br>${escape(item.meaning[0])}</p><p><strong>${labels[1][0]}</strong><br>${escape(item.impact[0])}</p></div></article>`;
});
if(index!==content.length)throw Error('Missing risk cards');
await writeFile(path,html);
