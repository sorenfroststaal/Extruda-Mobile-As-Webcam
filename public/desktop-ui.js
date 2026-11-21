// Windows receiver layout: steps, a video stage with status, grouped controls,
// a settings panel and real fullscreen. bridge.js calls init() after it has
// created the native controls. Existing elements are moved, never copied, so
// handlers, IDs and state stay owned by app.js, audio.js and recording.js.
(() => {
  const $ = id => document.getElementById(id);
  const stroke = body => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  // 26A UI icons (extruda-26a-v1/icons/ui).
  const icons = {
    fullscreen: stroke('<path d="M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5"/>'),
    fullscreenExit: stroke('<path d="M9 4v5H4m11-5v5h5m0 6h-5v5M4 15h5v5"/>'),
    settings: stroke('<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>'),
    close: stroke('<path d="m6 6 12 12M6 18 18 6"/>'),
    check: stroke('<path d="m4 12 5 5L20 6"/>'),
    edit: stroke('<path d="m4 16 12-12 4 4L8 20l-5 1 1-5zm9-9 4 4"/>')
  };
  const sizeNames = {'640x480':'480p','1280x720':'720p','1920x1080':'1080p','2560x1440':'1440p','3840x2160':'4K'};
  const STEP_KEY = 'extruda-meeting-step';
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const element = (tag, props = {}, html = '') => Object.assign(document.createElement(tag), props, html ? {innerHTML: html} : {});
  const iconButton = (id, icon, label, className = 'stage-button') => { const b = element('button', {id, type: 'button', className}, icons[icon]); b.setAttribute('aria-label', label); b.title = label; return b; };

  function init() {
    if (init.done || !document.body.classList.contains('native')) return;
    init.done = true;
    const main = document.querySelector('main');
    const screen = document.querySelector('#desktop .screen');
    const compact = $('session-controls');
    const more = $('session-more');
    const content = more.querySelector('.session-more-content');
    let connected = false;

    // 1. Steps: where the user is in scan → approve → camera → meeting app.
    const steps = element('ol', {id: 'steps', className: 'steps'});
    steps.setAttribute('aria-label', 'Trin');
    const labels = ['Scan QR-koden', 'Godkend koden', 'Kamera kører', 'Vælg i mødeprogram'];
    const items = labels.map((text, index) => {
      const item = element('li');
      item.append(element('span', {className: 'step-mark', ariaHidden: 'true'}, `<b>${index + 1}</b>${icons.check}`), element('span', {className: 'step-label', textContent: text}));
      steps.append(item); return item;
    });
    main.prepend(steps);
    function renderSteps() {
      const meetingDone = read(STEP_KEY) === 'done';
      const current = connected ? (meetingDone ? 5 : 4) : $('approval').open ? 2 : 1;
      items.forEach((item, index) => {
        const step = index + 1;
        item.className = step < current ? 'done' : step === current ? 'current' : '';
        if (step === current) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
      });
      hint.hidden = !connected || meetingDone;
    }
    new MutationObserver(renderSteps).observe($('approval'), {attributes: true, attributeFilter: ['open']});

    // 2. Stage overlay: live status, resolution, last step and fullscreen.
    const overlay = element('div', {id: 'stage-overlay', className: 'stage-overlay'});
    const chips = element('div', {className: 'stage-chips'});
    const live = element('span', {id: 'stage-live', className: 'stage-chip live'}, '<span class="stage-dot" aria-hidden="true"></span><span>Live · Windows-kamera</span>');
    const rec = element('span', {id: 'stage-rec', className: 'stage-chip rec', hidden: true}, '<span class="stage-dot" aria-hidden="true"></span><span>Optager</span>');
    const size = element('button', {id: 'stage-size', type: 'button', className: 'stage-chip size'});
    size.setAttribute('aria-label', 'Windows-opløsning');
    chips.append(live, rec, element('span', {className: 'stage-spacer'}), size);
    const hint = element('div', {id: 'stage-hint', className: 'stage-hint', hidden: true});
    hint.setAttribute('role', 'note');
    const hintText = element('p', {id: 'stage-hint-text'});
    const hintDone = element('button', {id: 'stage-hint-done', type: 'button', className: 'secondary', textContent: 'Det har jeg gjort'});
    hint.append(hintText, hintDone);
    const full = iconButton('stage-fullscreen', 'fullscreen', 'Fuld skærm');
    const bottom = element('div', {className: 'stage-bottom'});
    bottom.append(hint, element('span', {className: 'stage-spacer'}), full);
    overlay.append(chips, bottom);
    screen.append(overlay);
    const sizeValue = () => `${window.extrudaCaptureSize?.width}x${window.extrudaCaptureSize?.height}`;
    function renderSize() {
      const value = sizeValue();
      size.textContent = sizeNames[value] || value.replace('x', ' × ');
      hintText.textContent = '';
      hintText.append('Sidste trin: vælg ', element('strong', {textContent: `extruda - mobile as webcam (${value})`}), ' som kamera i Teams, Zoom eller Meet.');
    }
    hintDone.onclick = () => { save(STEP_KEY, 'done'); renderSteps(); full.focus(); };
    size.onclick = () => { const select = $('resolution'); if (select.disabled) return; select.focus(); try { select.showPicker(); } catch {} };

    // 3. Grouped controls: picture, sound, recording; settings and disconnect last.
    const group = (name, ...children) => {
      const box = element('div', {className: 'tool-group'});
      box.setAttribute('role', 'group'); box.setAttribute('aria-label', name);
      box.append(element('span', {className: 'tool-label', textContent: name, ariaHidden: 'true'}), ...children.filter(Boolean));
      return box;
    };
    const editPicture = $('edit-picture');
    editPicture.classList.add('secondary');
    editPicture.prepend(element('span', {className: 'button-icon'}, icons.edit));
    compact.prepend(
      group('Billede', compact.querySelector('.compact-resolution'), editPicture),
      group('Lyd', $('mic-toggle'), compact.querySelector('.compact-level'), $('compact-noise')),
      group('Optag', compact.querySelector('.record-actions'))
    );
    const settingsOpen = element('button', {id: 'settings-open', type: 'button', className: 'secondary'}, `<span class="button-icon">${icons.settings}</span><span>Indstillinger</span>`);
    settingsOpen.setAttribute('aria-controls', 'session-more');
    settingsOpen.setAttribute('aria-expanded', 'false');
    compact.append(element('span', {className: 'tool-spacer'}), settingsOpen);

    // 4. Settings panel: the existing details element becomes a side panel.
    more.classList.add('settings-panel');
    more.setAttribute('aria-label', 'Indstillinger');
    const head = element('div', {className: 'settings-head'});
    const close = iconButton('settings-close', 'close', 'Luk indstillinger', 'settings-close');
    head.append(element('h2', {id: 'settings-title', textContent: 'Indstillinger'}), close);
    content.prepend(head);
    $('fullscreen').classList.add('legacy-fullscreen');
    // The resolution hint belongs to the selector, which now sits in the toolbar.
    $('video-controls').querySelector('p:not(#resolution-info)')?.classList.add('resolution-hint');
    const section = (title, before) => { if (before?.parentElement === content) before.before(element('h3', {className: 'settings-section', textContent: title})); };
    section('Billede', $('video-controls'));
    section('Lyd', $('mic-panel'));
    section('Optagelse', $('record-toolbar'));
    section('Forbindelse', $('health-panel'));
    function openSettings(focus) {
      more.open = true;
      (focus && !focus.disabled ? focus : close).focus();
    }
    function closeSettings() { if (!more.open) return; more.open = false; settingsOpen.focus(); }
    more.addEventListener('toggle', () => { settingsOpen.setAttribute('aria-expanded', String(more.open)); document.body.classList.toggle('settings-open', more.open); });
    settingsOpen.onclick = () => more.open ? closeSettings() : openSettings();
    close.onclick = closeSettings;

    // 5. Fullscreen on the video stage. The native host turns the window
    // borderless when WebView2 reports a fullscreen element.
    let idle = 0;
    const isFull = () => document.fullscreenElement === screen;
    async function toggleFullscreen() {
      try {
        if (isFull()) await document.exitFullscreen();
        else if (connected) { closeSettings(); await screen.requestFullscreen({navigationUI: 'hide'}); }
      } catch {}
    }
    function wake() {
      document.body.classList.add('stage-awake');
      clearTimeout(idle);
      if (isFull()) idle = setTimeout(() => { if (!overlay.contains(document.activeElement) || document.activeElement === full) document.body.classList.remove('stage-awake'); }, 2500);
    }
    document.addEventListener('fullscreenchange', () => {
      const on = isFull();
      document.body.classList.toggle('stage-fullscreen', on);
      full.innerHTML = on ? icons.fullscreenExit : icons.fullscreen;
      const label = on ? 'Afslut fuld skærm' : 'Fuld skærm';
      full.setAttribute('aria-label', label); full.title = label;
      wake();
    });
    full.onclick = toggleFullscreen;
    screen.addEventListener('dblclick', event => { if (!event.target.closest('button,select,a')) toggleFullscreen(); });
    screen.addEventListener('mousemove', wake);
    screen.addEventListener('focusin', wake);
    document.addEventListener('keydown', event => {
      if (event.key === 'F11') { event.preventDefault(); toggleFullscreen(); }
      else if (event.key === 'Escape') {
        if (isFull()) { event.preventDefault(); document.exitFullscreen().catch(() => {}); }
        else if (more.open && !document.querySelector('dialog[open]')) { event.preventDefault(); closeSettings(); }
      }
    });

    // State from the existing app.
    window.addEventListener('extruda-connection', event => {
      connected = !!event.detail.connected;
      if (!connected) { closeSettings(); if (isFull()) document.exitFullscreen().catch(() => {}); }
      renderSize(); renderSteps();
    });
    const syncRecording = () => {
      const active = !!window.ExtrudaRecording?.active;
      rec.hidden = !active; document.body.classList.toggle('is-recording-ui', active);
    };
    window.addEventListener('extruda-recording', syncRecording);
    const applied = window.extrudaResolutionApplied;
    window.extrudaResolutionApplied = (width, height) => { applied?.(width, height); renderSize(); };
    renderSize(); renderSteps(); syncRecording();
  }
  window.ExtrudaDesktopUI = {init};
})();
