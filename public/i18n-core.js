(() => {
  const dictionaries = window.ExtrudaTranslations;
  const supported = ['da','en','de','fr'];
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key,value) => { try { value === 'auto' ? localStorage.removeItem(key) : localStorage.setItem(key,value); } catch {} };
  const choose = preferences => preferences.map(x=>String(x).toLowerCase().split('-')[0]).find(x=>supported.includes(x)) || 'en';
  const preferred = () => window.extrudaSystemLanguage ? [window.extrudaSystemLanguage] : (navigator.languages?.length ? navigator.languages : [navigator.language || 'en']);
  let languageChoice = read('extruda-language') || 'auto';
  if (!supported.includes(languageChoice)) languageChoice = 'auto';
  let language = languageChoice === 'auto' ? choose(preferred()) : languageChoice;
  let themeChoice = read('extruda-theme') || 'auto';
  if (!['auto','light','dark'].includes(themeChoice)) themeChoice='auto';
  const dark = window.matchMedia('(prefers-color-scheme: dark)');
  const format = (text,params={}) => text.replace(/\{(\w+)\}/g,(all,key)=>String(params[key] ?? all));
  const t = (key,params) => format(dictionaries[language][key] || key,params);
  const patterns=[];
  const exact = new Map();
  for (const key of Object.keys(dictionaries.da)) for (const lang of supported) {
    const value=dictionaries[lang][key].trim();
    if (!value.includes('{')) { if(!exact.has(value))exact.set(value,key); }
    else {
      const names=[...value.matchAll(/\{(\w+)\}/g)].map(m=>m[1]);
      const expression=value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\\\{\w+\\\}/g,'(\\d+)');
      patterns.push({key,names,regex:new RegExp('^'+expression+'$')});
    }
  }
  function translate(value) {
    const match=/^(\s*)(.*?)(\s*)$/s.exec(value);if(!match||!match[2])return value;
    const key=exact.get(match[2]);if(key)return match[1]+t(key).trim()+match[3];
    for(const pattern of patterns){const parts=pattern.regex.exec(match[2]);if(parts){const params={};pattern.names.forEach((name,i)=>params[name]=parts[i+1]);return match[1]+t(pattern.key,params).trim()+match[3];}}
    return value;
  }
  let lastNativeLanguage;
  function render() {
    if(window.chrome?.webview && lastNativeLanguage!==language){lastNativeLanguage=language;window.chrome.webview.postMessage('language:'+language); }
    document.documentElement.lang=language;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){if(node.parentElement?.closest('script,style,pre,code,textarea,[data-no-i18n]'))continue;const value=translate(node.nodeValue);if(value!==node.nodeValue)node.nodeValue=value;}
    for(const element of document.querySelectorAll('[aria-label],[title],[placeholder]'))for(const attr of ['aria-label','title','placeholder']){const value=element.getAttribute(attr);if(value){const translated=translate(value);if(translated!==value)element.setAttribute(attr,translated);}}
    const picker=document.getElementById('language');if(picker)picker.value=languageChoice;
    const code=document.getElementById('language-code');if(code && code.textContent!==language.toUpperCase())code.textContent=language.toUpperCase();
  }
  function applyTheme() {
    const theme=themeChoice==='auto'?(dark.matches?'dark':'light'):themeChoice;
    document.documentElement.dataset.theme=theme;if(window.chrome?.webview)window.chrome.webview.postMessage('theme:'+theme);
    const picker=document.getElementById('theme');if(picker)picker.value=themeChoice;
    for(const image of document.querySelectorAll('img.logo'))image.src=theme==='dark'?'/brand/logo-white.svg':'/brand/logo.svg';
  }
  window.ExtrudaI18n={t,choose,get language(){return language;},get languageChoice(){return languageChoice;},get themeChoice(){return themeChoice;},
    setLanguage(choice){languageChoice=supported.includes(choice)?choice:'auto';save('extruda-language',languageChoice);language=languageChoice==='auto'?choose(preferred()):languageChoice;render();window.dispatchEvent(new Event('extruda-language'));},
    setTheme(choice){themeChoice=['light','dark'].includes(choice)?choice:'auto';save('extruda-theme',themeChoice);applyTheme();},render};
  document.getElementById('language')?.addEventListener('change',event=>window.ExtrudaI18n.setLanguage(event.target.value));
  document.getElementById('theme')?.addEventListener('change',event=>window.ExtrudaI18n.setTheme(event.target.value));
  window.addEventListener('languagechange',()=>{if(languageChoice==='auto')window.ExtrudaI18n.setLanguage('auto');});
  dark.addEventListener('change',()=>{if(themeChoice==='auto')applyTheme();});
  let queued=false;new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;render();});}}).observe(document.body,{childList:true,subtree:true,characterData:true});
  const help=document.getElementById('safety');
  const back=document.getElementById('help-back');
  function showHelp(view='help-menu') {
    if(!['help-menu','help-risks','help-faq'].includes(view))return;
    for(const id of ['help-menu','help-risks','help-faq']){const section=document.getElementById(id);if(section)section.hidden=id!==view;}
    if(back)back.hidden=view==='help-menu';
    if(help){help.setAttribute('aria-labelledby',view==='help-menu'?'help-title':view==='help-risks'?'safety-title':'faq-title');help.scrollTop=0;}
    document.getElementById(view)?.querySelector('h2')?.focus();
  }
  document.getElementById('safety-open')?.addEventListener('click',()=>{showHelp();help.showModal();document.getElementById('help-title')?.focus();});
  for(const id of ['help-show-risks','help-show-faq'])document.getElementById(id)?.addEventListener('click',()=>showHelp(id==='help-show-risks'?'help-risks':'help-faq'));
  back?.addEventListener('click',()=>showHelp());
  document.getElementById('safety-close')?.addEventListener('click',()=>document.getElementById('safety').close());
  help?.addEventListener('close',()=>document.getElementById('safety-open')?.focus());
  applyTheme();render();
})();
