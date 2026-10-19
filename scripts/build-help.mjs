// One source for the in-app FAQ, its translations and GitHub documentation.
import {readFile,writeFile} from 'node:fs/promises';
const languages=['da','en','de','fr'];
const content=JSON.parse(await readFile('scripts/help-content.json','utf8'));
const helpUrls=[...new Set(content.flatMap(item=>(item.sources||[]).map(row=>row[1])))];
if(helpUrls.some(url=>!url.startsWith('https://')))throw Error('Help links must use HTTPS');
await writeFile('windows/app/HelpLinks.h','#pragma once\n// Generated from scripts/help-content.json. Exact trusted help destinations only.\ninline bool AllowedHelpLink(const wchar_t* uri){\n if(!uri)return false;\n static const wchar_t* links[]={'+helpUrls.map(url=>'L'+JSON.stringify(url)).join(',')+'};\n for(const auto* link:links)if(wcscmp(uri,link)==0)return true;\n return false;\n}\n');
const labels=[['Information','Information','Information','Informations'],['Tilbage','Back','Zurück','Retour'],['Sikkerhedsrisici','Security risks','Sicherheitsrisiken','Risques de sécurité'],['FAQ og vejledninger','FAQ and guides','FAQ und Anleitungen','FAQ et guides']];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const links=item=>(item.sources||[]).map(([label,url])=>`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`).join(' · ');
for(const [i,lang] of languages.entries()){
 const path=`public/locales/${lang}.json`;const dictionary=JSON.parse(await readFile(path,'utf8'));
 for(const row of labels)dictionary[row[0]]=row[i];
 for(const item of content)for(const row of [item.title,...item.paragraphs])dictionary[row[0]]=row[i];
 await writeFile(path,JSON.stringify(dictionary,null,2)+'\n');
 const nav=languages.map((l,n)=>`[${['Dansk','English','Deutsch','Français'][n]}](FAQ.${l}.md)`).join(' · ');
 const body=content.map(item=>`## ${item.title[i]}\n\n${item.paragraphs.map(row=>row[i]).join('\n\n')}${item.sources?'\n\n'+item.sources.map(([label,url])=>`[${label}](${url})`).join(' · '):''}`).join('\n\n');
 await writeFile(`docs/FAQ.${lang}.md`,`# ${labels[3][i]}\n\n${nav}\n\n[${labels[2][i]}](SECURITY.${lang}.md)\n\n${body}\n`);
}
let html=await readFile('public/index.html','utf8');
const fragment=content.map(item=>`<details class="faq-item" id="faq-${item.id}"><summary>${escape(item.title[0])}</summary>${item.paragraphs.map(row=>`<p>${escape(row[0])}</p>`).join('')}${item.sources?`<p class="help-sources" data-no-i18n>${links(item)}</p>`:''}</details>`).join('\n');
html=html.replace(/<!-- FAQ:start -->[\s\S]*?<!-- FAQ:end -->/,`<!-- FAQ:start -->\n${fragment}\n<!-- FAQ:end -->`);
await writeFile('public/index.html',html);
