import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const dictionaries=Object.fromEntries(['da','en','de','fr'].map(l=>[l,JSON.parse(readFileSync(new URL(`../public/locales/${l}.json`,import.meta.url),'utf8'))]));
const source=readFileSync(new URL('../public/i18n-core.js',import.meta.url),'utf8');
function setup({languages=['en-US'],system,stored={},dark=false,text='Telefon som webcam.'}={}) {
 const values=new Map(Object.entries(stored));const listeners={};const media={matches:dark,addEventListener:(name,fn)=>listeners[name]=fn};
 const node={nodeValue:text,parentElement:{closest:()=>false}};
 const elements=new Map();for(const id of ['language','language-code','theme','safety-open','safety-close','safety','help-back','help-menu','help-risks','help-faq','help-show-risks','help-show-faq','help-title'])elements.set(id,{value:'',textContent:'',hidden:false,scrollTop:0,attributes:{},listeners:{},addEventListener(name,fn){this.listeners[name]=fn},setAttribute(name,value){this.attributes[name]=value},querySelector(){return {focus(){}}},focus(){},showModal(){this.open=true},close(){this.open=false}});
 const document={documentElement:{dataset:{}},body:{},createTreeWalker(){let done=false;return{currentNode:node,nextNode(){if(done)return false;done=true;return true}}},querySelectorAll:()=>[],getElementById:id=>elements.get(id)};
 const window={ExtrudaTranslations:dictionaries,extrudaSystemLanguage:system,matchMedia:()=>media,dispatchEvent(){},addEventListener(){}};
 const context=vm.createContext({window,document,navigator:{languages},localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},NodeFilter:{SHOW_TEXT:4},MutationObserver:class{observe(){}},queueMicrotask,Event});
 vm.runInContext(source,context);return{api:window.ExtrudaI18n,document,values,media,listeners,node,elements};
}
test('translations have identical keys and interpolation parameters in all languages',()=>{
 const keys=Object.keys(dictionaries.da).sort();for(const lang of ['en','de','fr']){assert.deepEqual(Object.keys(dictionaries[lang]).sort(),keys);for(const key of keys){assert.deepEqual([...dictionaries[lang][key].matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),[...key.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort());}}
});
test('phone defaults use supported browser preferences and English fallback',()=>{assert.equal(setup({languages:['fr-CA','en']}).api.language,'fr');assert.equal(setup({languages:['nl','de-DE']}).api.language,'de');assert.equal(setup({languages:['ja']}).api.language,'en')});
test('Windows UI language overrides browser preference in automatic mode',()=>{assert.equal(setup({languages:['en'],system:'de-DE'}).api.language,'de')});
test('manual language persists and automatic restores the OS preference',()=>{const s=setup({system:'de-DE',stored:{'extruda-language':'fr'}});assert.equal(s.api.language,'fr');s.api.setLanguage('en');assert.equal(s.values.get('extruda-language'),'en');s.api.setLanguage('auto');assert.equal(s.api.language,'de');assert.equal(s.values.has('extruda-language'),false)});
test('live translated text can switch languages without changing its data',()=>{const s=setup({text:'Parringsserveren svarede 429. Prøv igen.'});assert.equal(s.node.nodeValue,'Pairing server returned 429. Try again.');s.api.setLanguage('de');assert.equal(s.node.nodeValue,'Kopplungsserver meldet 429. Erneut versuchen.');s.api.setLanguage('fr');assert.equal(s.node.nodeValue,'Le serveur de jumelage a répondu 429. Réessayez.')});
test('theme follows OS changes unless overridden and automatic clears the override',()=>{const s=setup({dark:true});assert.equal(s.document.documentElement.dataset.theme,'dark');s.api.setTheme('light');s.listeners.change();assert.equal(s.document.documentElement.dataset.theme,'light');s.api.setTheme('auto');assert.equal(s.document.documentElement.dataset.theme,'dark');s.media.matches=false;s.listeners.change();assert.equal(s.document.documentElement.dataset.theme,'light');assert.equal(s.values.has('extruda-theme'),false)});
test('information navigation keeps one dialog open and returns to its menu',()=>{
 const {elements:e}=setup();const click=id=>e.get(id).listeners.click();
 click('safety-open');assert.equal(e.get('safety').open,true);assert.equal(e.get('help-menu').hidden,false);assert.equal(e.get('help-back').hidden,true);assert.equal(e.get('help-risks').hidden,true);
 click('help-show-faq');assert.equal(e.get('help-menu').hidden,true);assert.equal(e.get('help-faq').hidden,false);assert.equal(e.get('safety').attributes['aria-labelledby'],'faq-title');
 e.get('safety').scrollTop=500;click('help-back');assert.equal(e.get('safety').scrollTop,0);assert.equal(e.get('help-faq').hidden,true);
 click('help-show-risks');assert.equal(e.get('help-risks').hidden,false);assert.equal(e.get('help-faq').hidden,true);assert.equal(e.get('safety').attributes['aria-labelledby'],'safety-title');
 click('safety-close');assert.equal(e.get('safety').open,false);click('safety-open');assert.equal(e.get('help-menu').hidden,false);
});
test('all help topics and official references are present in all four GitHub guides and app translations',()=>{
 const content=JSON.parse(readFileSync(new URL('../scripts/help-content.json',import.meta.url),'utf8'));
 for(const [i,lang] of ['da','en','de','fr'].entries()){
  const doc=readFileSync(new URL(`../docs/FAQ.${lang}.md`,import.meta.url),'utf8');
  for(const topic of content){for(const row of [topic.title,...topic.paragraphs]){assert.equal(dictionaries[lang][row[0]],row[i]);assert.ok(doc.includes(row[i]));}for(const [,url] of topic.sources||[])assert.ok(doc.includes(url));}
 }
});
