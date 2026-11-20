// Phone viewfinder: a full-screen camera view with a few large controls.
// Existing controls are moved into a settings sheet, not copied, so their
// handlers, IDs and state stay owned by app.js, audio.js and recording.js.
(() => {
  const $ = id => document.getElementById(id);
  const tr = (key, params) => window.ExtrudaI18n?.t(key, params) || key;
  const stroke = body => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  // 26A UI icons (extruda-26a-v1/icons/ui).
  const icons = {
    flip: stroke('<path d="M8 6 9.5 4h5L16 6h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><path d="M8.5 13a3.5 3.5 0 0 1 6.1-2.3M15.5 13a3.5 3.5 0 0 1-6.1 2.3M15 8.5v2.4h-2.4M9 17.5v-2.4h2.4"/>'),
    mic: stroke('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21m-3 0h6"/>'),
    micOff: stroke('<path d="M15 10V6a3 3 0 0 0-5.7-1.3M9 9v2a3 3 0 0 0 4.6 2.5M18.5 11a6.5 6.5 0 0 1-.9 3.3M5.5 11a6.5 6.5 0 0 0 10 5.5M12 17.5V21m-3 0h6M3 3l18 18"/>'),
    eyeOff: stroke('<path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.6 3.5M6.6 6.6A16 16 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/>'),
    moon: stroke('<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z"/>'),
    settings: stroke('<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>'),
    close: stroke('<path d="m6 6 12 12M6 18 18 6"/>')
  };
  const sizes = [[640,480,'480p'],[1280,720,'720p'],[1920,1080,'1080p'],[2560,1440,'1440p'],[3840,2160,'4K']];
  const sizeLabel = size => { const row = sizes.find(([w,h]) => w === size?.width && h === size?.height); return row ? row[2] : ''; };

  function init() {
    if (init.done) return; init.done = true;
    const phone = $('phone');
    const element = (tag, props = {}, html = '') => Object.assign(document.createElement(tag), props, html ? {innerHTML: html} : {});
    const iconButton = (id, icon, label) => { const b = element('button', {id, type: 'button', className: 'live-button'}, icons[icon]); b.setAttribute('aria-label', label); return b; };

    // Overlay on top of the camera picture.
    const ui = element('div', {id: 'live-ui', className: 'live-ui'});
    const top = element('div', {className: 'live-top'});
    const chip = element('span', {id: 'live-chip', className: 'live-chip'}); chip.setAttribute('role', 'status');
    const chipText = element('span', {textContent: 'Forbinder…'});
    chip.append(element('span', {className: 'live-dot'}), chipText);
    const sizeChip = element('button', {id: 'live-size', type: 'button', className: 'live-chip live-size'});
    sizeChip.dataset.noI18n = ''; sizeChip.setAttribute('aria-label', 'Opløsning'); sizeChip.hidden = true;
    top.append(chip, sizeChip);
    const notice = element('p', {id: 'live-notice', className: 'live-notice'}); notice.setAttribute('role', 'status'); notice.hidden = true;
    const cover = element('div', {id: 'privacy-cover', className: 'privacy-cover'}, icons.eyeOff); cover.hidden = true;
    cover.append(element('p', {className: 'privacy-title', textContent: 'Billedet er skjult for pc’en'}), element('p', {textContent: 'Pc’en får et sort billede, indtil du viser det igen.'}));
    const bar = element('div', {className: 'live-bar'});
    const flip = iconButton('live-flip', 'flip', 'Vend kamera');
    const mic = iconButton('live-mic', 'mic', 'Slå mikrofon til'); mic.setAttribute('aria-pressed', 'false'); mic.hidden = true;
    const privacy = iconButton('live-privacy', 'eyeOff', 'Skjul billede'); privacy.setAttribute('aria-pressed', 'false');
    const dim = iconButton('live-dim', 'moon', 'Dæmp skærm');
    const more = iconButton('live-more', 'settings', 'Flere indstillinger'); more.setAttribute('aria-expanded', 'false'); more.setAttribute('aria-controls', 'phone-sheet');
    bar.append(flip, mic, privacy, dim, more);
    ui.append(top, notice, cover, bar);
    phone.append(ui);

    // Settings sheet: resolution first, then the moved existing panels.
    const sheet = element('section', {id: 'phone-sheet', className: 'phone-sheet'}); sheet.hidden = true;
    sheet.setAttribute('aria-labelledby', 'phone-sheet-title');
    const head = element('div', {className: 'sheet-head'});
    const close = iconButton('phone-sheet-close', 'close', 'Luk');
    head.append(element('h2', {id: 'phone-sheet-title', textContent: 'Indstillinger'}), close);
    const resolution = element('div', {className: 'sheet-group'});
    const resolutionSelect = element('select', {id: 'phone-resolution'}); resolutionSelect.dataset.noI18n = '';
    for (const [w,h,name] of sizes) resolutionSelect.append(element('option', {value: `${w}x${h}`, textContent: `${name} · ${w} × ${h}`}));
    const resolutionNote = element('p', {id: 'phone-resolution-note', className: 'sheet-note'}); resolutionNote.setAttribute('role', 'status');
    resolution.append(element('label', {htmlFor: 'phone-resolution', textContent: 'Opløsning'}), resolutionSelect, resolutionNote);
    const moved = element('div', {className: 'sheet-moved'});
    sheet.append(head, resolution, moved);
    document.body.append(sheet);

    const dimCover = element('button', {id: 'dim-cover', type: 'button', className: 'dim-cover'}); dimCover.hidden = true;
    dimCover.append(element('span', {className: 'live-dot'}), element('span', {className: 'dim-title', textContent: 'Sender til pc’en'}), element('span', {textContent: 'Tryk for at vise skærmen igen'}));
    document.body.append(dimCover);

    // Move existing panels into the sheet while live; put them back afterwards so
    // errors and the status line stay visible on the ended page.
    const movable = ['phone-record', 'mic-panel', 'health-panel'].map($).concat(document.querySelector('.statusbar'), $('stop')).filter(Boolean);
    const homes = movable.map(node => { const mark = document.createComment('home'); node.before(mark); return mark; });
    const place = live => movable.forEach((node, i) => { if (live) moved.append(node); else homes[i].after(node); });

    let live = false, connected = false, hidden = false, pendingSize = null, pendingTimer;
    const setLabel = (node, key) => node.setAttribute('aria-label', tr(key));
    function render() {
      chip.classList.toggle('is-live', connected);
      chipText.textContent = connected ? 'Live på pc' : 'Forbinder…';
      const micPanel = $('mic-panel'), micToggle = $('mic-toggle');
      mic.hidden = !micPanel || micPanel.hidden;
      const on = micToggle?.getAttribute('aria-pressed') === 'true';
      mic.disabled = !!micToggle?.disabled; mic.setAttribute('aria-pressed', String(on)); mic.innerHTML = on ? icons.mic : icons.micOff;
      setLabel(mic, on ? 'Slå mikrofon fra' : 'Slå mikrofon til');
      flip.disabled = !!$('camera')?.disabled || !$('local')?.srcObject;
      // Camera notices (paused, stopped) are shown; routine progress is not.
      const info = $('phone-info')?.textContent.trim() || '';
      notice.textContent = info; notice.hidden = !info || ['Kamera startet', 'Starter kamera…'].some(key => info === key || info === tr(key));
    }
    function applyPrivacy() {
      window.extrudaVideoHidden = hidden;
      $('local')?.srcObject?.getVideoTracks().forEach(track => { track.enabled = !hidden; });
      cover.hidden = !hidden; privacy.setAttribute('aria-pressed', String(hidden));
      setLabel(privacy, hidden ? 'Vis billede' : 'Skjul billede');
    }
    function setDim(on) {
      dimCover.hidden = !on; document.body.classList.toggle('phone-dim', on);
      if (on) dimCover.focus(); else if (live) dim.focus();
    }
    function setSheet(open) {
      sheet.hidden = !open; more.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('phone-sheet-open', open);
      if (open) close.focus(); else if (live) more.focus();
    }
    function setLive(value) {
      if (live === value) return;
      live = value; document.body.classList.toggle('phone-live', live); place(live);
      if (!live) { setSheet(false); setDim(false); hidden = false; applyPrivacy(); connected = false; sizeChip.hidden = true; }
      render();
    }
    function showSize({size, control, refused}) {
      clearTimeout(pendingTimer); pendingSize = null;
      const value = `${size.width}x${size.height}`;
      resolutionSelect.value = value; resolutionSelect.disabled = !control;
      sizeChip.textContent = sizeLabel(size); sizeChip.hidden = !sizeChip.textContent;
      resolutionNote.textContent = refused ? 'Pc’en kunne ikke skifte opløsning lige nu.' : control ? 'Windows-kameraet skifter også opløsning. Vælg eventuelt kameraet igen i Teams.' : 'Opløsningen vælges på pc’en.';
    }
    let lastSize = {size: {width: 1280, height: 720}, control: false};
    window.addEventListener('extruda-capture-size', event => { lastSize = event.detail; showSize(lastSize); });
    resolutionSelect.onchange = async () => {
      const [width, height] = resolutionSelect.value.split('x').map(Number);
      pendingSize = {width, height}; resolutionSelect.disabled = true; resolutionNote.textContent = 'Skifter opløsning…';
      let sent = false; try { sent = await window.extrudaRequestCaptureSize?.(pendingSize); } catch {}
      // The PC answers with its applied size; fall back to the last known size.
      pendingTimer = setTimeout(() => showSize({...lastSize, refused: true}), sent ? 8000 : 0);
    };

    flip.onclick = () => { const camera = $('camera'); if (!camera || camera.disabled) return; camera.value = camera.value === 'user' ? 'environment' : 'user'; camera.dispatchEvent(new Event('change')); };
    mic.onclick = () => $('mic-toggle')?.click();
    privacy.onclick = () => { hidden = !hidden; applyPrivacy(); };
    dim.onclick = () => setDim(true);
    dimCover.onclick = () => setDim(false);
    more.onclick = () => setSheet(sheet.hidden);
    sizeChip.onclick = () => setSheet(true);
    close.onclick = () => setSheet(false);
    document.addEventListener('keydown', event => { if (event.key !== 'Escape') return; if (!dimCover.hidden) setDim(false); else if (!sheet.hidden) setSheet(false); });
    $('local')?.addEventListener('loadedmetadata', applyPrivacy);
    window.addEventListener('extruda-connection', event => { connected = !!event.detail?.connected; render(); });

    const observer = new MutationObserver(() => { setLive(!$('phone-controls').hidden); render(); });
    observer.observe($('phone-controls'), {attributes: true, attributeFilter: ['hidden']});
    for (const id of ['mic-panel', 'mic-toggle', 'camera']) if ($(id)) observer.observe($(id), {attributes: true, attributeFilter: ['hidden', 'disabled', 'aria-pressed']});
    observer.observe($('phone-info'), {childList: true, characterData: true, subtree: true});
    setLive(!$('phone-controls').hidden);
  }

  const ready = () => document.body.classList.contains('phone-client');
  if (ready()) init();
  else { const watch = new MutationObserver(() => { if (ready()) { watch.disconnect(); init(); } }); watch.observe(document.body, {attributes: true, attributeFilter: ['class']}); }
})();
