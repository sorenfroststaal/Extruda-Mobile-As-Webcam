// Approved Extruda Midtpunkt master, bundled locally. Never gate pairing on media.
(() => {
  const overlay = document.getElementById('startup');
  if (!overlay || !window.chrome?.webview || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const video = overlay.querySelector('video');
  const button = overlay.querySelector('button');
  button.textContent = window.ExtrudaI18n?.t('Spring over') || 'Skip';
  const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  let closed = false;
  let timeout;
  function dismiss() {
    if (closed) return;
    closed = true;
    clearTimeout(timeout);
    overlay.hidden = true;
    window.chrome.webview.postMessage('startup-sound-stop');
    video.pause();
    video.removeAttribute('src');
    video.load();
    document.removeEventListener('keydown', onKey);
    if (document.activeElement === button) document.getElementById('language')?.focus();
  }
  function onKey(event) { if (event.key === 'Escape' || event.key === 'Tab') dismiss(); }
  video.muted = true;
  video.addEventListener('playing', () => {
    if (closed) return;
    // Native playback avoids browser autoplay restrictions; the WAV is local.
    window.chrome.webview.postMessage('startup-sound');
    try {
      const sample = document.createElement('canvas');
      sample.width = sample.height = 1;
      const context = sample.getContext('2d', {willReadFrequently:true});
      context.drawImage(video, 0, 0, 1, 1, 0, 0, 1, 1);
      const [r,g,b] = context.getImageData(0,0,1,1).data;
      overlay.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    } catch {} // Keep the theme background if sampling is unavailable.
  }, {once:true});
  video.src = `/brand/extruda-logo-${theme}-web.webm`;
  overlay.hidden = false;
  // All exit paths are bounded, including missing codecs and stalled media.
  timeout = setTimeout(dismiss, 4500);
  video.addEventListener('ended', dismiss, { once: true });
  video.addEventListener('error', dismiss, { once: true });
  button.addEventListener('click', dismiss, { once: true });
  document.addEventListener('keydown', onKey);
  document.getElementById('approval')?.addEventListener('toggle', event => {
    if (event.newState === 'open') dismiss();
  });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
    if (event.matches) dismiss();
  }, { once: true });
  video.play().catch(dismiss);
})();
