import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The Windows app serves a packaged copy of public/. A script that index.html
// loads but the installer leaves out breaks the receiver without any error.
test('every script loaded by index.html is copied, embedded and installed', async () => {
  const [html, build, rc, setup] = await Promise.all(['public/index.html', 'windows/build.cmd', 'windows/setup.rc', 'windows/setup.cpp'].map(file => readFile(file, 'utf8')));
  const scripts = [...html.matchAll(/<script[^>]+src="\/([\w-]+\.js)"/g)].map(match => match[1]);
  assert.ok(scripts.includes('desktop-ui.js') && scripts.includes('phone-ui.js'));
  for (const name of scripts) {
    assert.match(build, new RegExp(`copy /y public\\\\${name} windows\\\\dist\\\\ui\\\\${name}`), `${name} missing from build.cmd`);
    const resource = rc.match(new RegExp(`^(\\d+) RCDATA "dist/ui/${name}"`, 'm'));
    assert.ok(resource, `${name} missing from setup.rc`);
    assert.ok(setup.includes(`{${resource[1]},L"ui\\\\${name}"}`), `${name} missing from setup.cpp`);
  }
});

test('desktop layout starts after the native bridge has built its controls', async () => {
  const bridge = await readFile('windows/app/bridge.js', 'utf8');
  const init = bridge.indexOf('ExtrudaDesktopUI?.init()');
  assert.ok(init > bridge.indexOf("id='session-more'") && init > bridge.indexOf("id='edit-picture'"));
  assert.ok(init < bridge.indexOf("postMessage('ready')"));
});
