# Windows prototype 0.2 validation

## 0.3 resolution update

Added 640×480, 1280×720, 1920×1080, 2560×1440 and 3840×2160. All five sizes
passed RGB32 and NV12 pixel, buffer size, timestamp and stop/stale blackout tests
with 30 frames per format. The selector smoke test also switched from 720p to
4K and delivered 30 frames through WebView2 and native shared-buffer transport.
Native synthetic 4K tests took approximately 1.2–1.4 seconds per 30 frames on
this machine; this is not a sustained phone-to-Teams frame-rate benchmark.

The user reported the previous 0.2 app working in Teams. The new phone-side
resolution negotiation and high resolutions still need real-device validation.

19 October 2026 · Windows 11 x64 build 26200 (25H2).

## Passed

- Build with Microsoft Visual C++ 14.44 and Windows SDK 10.0.26100.0.
- Native Source Reader against the camera DLL without OS installation:
  30 correctly sized/color-checked RGB32 frames and 30 NV12 frames at 1280x720.
- Monotonic sample timestamps, 333333 × 100 ns sample duration, real-time pacing.
- Black output after explicit clearing and after the producer stalls for >2 s.
- Real WebView2 renderer: 30 synthetic video frames copied through its writable
  shared buffer to the native receiver, with expected BGRA channel order.
- Native EXE installer via normal UAC; application installed in Program Files,
  one HKLM COM source registered and a Start menu shortcut created. Windows
  PowerShell execution policy was left unchanged.
- Session virtual camera created successfully by MFCreateVirtualCamera.
- OS camera opened with MFCreateDeviceSource through Windows Camera Frame Server;
  30 correctly colored RGB frames plus stop/stale blackout. This verifies Local
  Service can access the ACL-restricted frame mapping across process boundaries.
- Complete installed app test: WebView2 synthetic MediaStream → canvas → shared
  buffer → native receiver → secured file mapping → virtual camera DLL in Frame
  Server → separate Media Foundation webcam client: 30 matching frames.

## Still needs real-world testing

- Real Android and iPhone capture through QR pairing in the Windows app.
- Teams, Zoom, Discord and other specific meeting applications. The generic OS
  camera test proves the device path; it does not certify these apps.
- Long-running performance, CPU use, minimization, sleep/resume, incoming calls,
  screen lock and Wi-Fi interruptions on real devices.
- Installer/uninstaller across clean PCs, ARM64, upgrade/reboot cases, and signed
  distribution. Current binaries are unsigned development builds for x64 only.

## Reproduce

Build with windows/build.cmd. From windows/dist:

```
CameraTests.exe                 # in-process native source formats and blackout
ExtrudaCamera.exe --smoke-test   # WebView2 transfer; exits after 30 frames
CameraTests.exe --system        # installed COM source + Windows Frame Server
ExtrudaCamera.exe --system-smoke # synthetic receiver + session OS webcam, 30 s
CameraTests.exe --probe         # separate client checks 30 frames from that app
```

The test modes create a generated pattern; they do not open physical cameras.
--system requires the application's COM source to be installed. For --probe,
start --system-smoke first and wait until the Extruda camera is listed.

0.3 update: native RGB32/NV12 tests passed for all five resolutions, including 4K.
The installed app changed from 720p to 4K via its selector and a separate Windows
Frame Server client validated 30 frames. 26A assets are hosted locally; native EXE
and installer include the Camera icon.
Installed 26A app verified against the build hash; selector smoke test passed with 30 frames at 3840x2160 after deployment (2026-10-19).
Compact UI update: browser host acceptance and cancellation tested with a separate phone-role tab; start remains unavailable until acceptance. Installed selector smoke passed 30 frames at 4K. Updated public installer matches local binary.
Automatic pairing: built and installed app passed --pairing-smoke against the live pairing server; QR visible without a click. Physical camera was not opened.
Automatic phone camera start: three VM tests cover approval-triggered capture, duplicate approval, denied permission fallback, and stop during pending permission. Physical Android/iOS behaviour still requires device testing.
Live resolution update: initial native output fixed to 1920x1080; control appears on connected event. Phone track uses applyConstraints without reacquisition, using WebRTC data channel after signalling expiry. Native selector test changed to 4K and exercised the Windows camera output.

Security revision 0.4.0: 17 JS/security/integration tests passed against the live
server. Browser test confirmed matching six-digit codes on host and phone.
Installed local UI passed automatic pairing. All ten native RGB32/NV12 format
checks passed; installed app -> Windows Frame Server -> separate webcam client
passed 30 frames at 4K. npm audit reported zero known advisories in its 120-package
scope. No physical Android/iOS security penetration test was performed.

0.5.0: 24 JS/security/localisation/integration tests passed locally. Browser UI
verified English, German and French; dark/light themes and 320px layout checked.
Automatic preferences, Windows UI-language precedence, manual persistence and
system-theme changes covered by tests. Native pairing smoke passed with the
packaged local dictionaries and Windows locale bootstrap. Four language risk
guides and in-app risk information are included. Real-device locale behaviour
still requires Android/iPhone testing.

## Microphone validation — 23 October 2026

`AudioTests.exe` sends a synthetic 48 kHz mono PCM tone through the selected
virtual rendering endpoint and reads the matching Windows virtual microphone.
On this PC, the existing Steam Streaming Microphone received RMS 0.1672 at the
app's 3% send level and returned to RMS 0.0000 after stop. No physical microphone
was captured and no audio driver was installed for this test.

`node scripts/serve-audio-test.mjs` serves a local-only synthetic browser fixture
on http://127.0.0.1:8789/. Its button negotiates WebRTC with a reserved, initially
empty audio transceiver, enables audio using replaceTrack after connection,
checks the actual received meter and 960-sample/20 ms AudioWorklet blocks, then
checks that the off button clears the meter. It passed in the in-app Chromium
browser (34% level, 70 valid blocks during a 1.4 second interval).

The browser and native tests validate the transport components with synthetic
signals. Actual phone permission screens, device/browser behaviour, acoustic
quality and a live Teams/Zoom call still need user testing. VB-CABLE was not
installed or validated on this machine; support uses the same virtual rendering
path but must be checked on a machine with that separate driver.

## Microphone fix 0.7.1

The production Permissions-Policy still denied microphone capture in 0.7.0. It now permits microphone=(self), preserving browser consent and denying geolocation. The production-header integration test checks this explicitly. Microphone status now distinguishes waiting, silence, phone input, received audio and PCM acknowledged by Windows. A regression test covers these states, including a rejected native packet. No live phone/Teams call was available to verify acoustic output.

## Microphone connection lifecycle fix 0.7.2

The initial RTCPeerConnection connecting event reports connected=false after ontrack. The audio controller incorrectly cleared the received track then, leaving the toggle on with status off and no audio graph. It now clears only when an established connection drops or the session explicitly stops. A regression test covers track → initial false event → connected → microphone enabled → signal processing → disconnect cleanup. The browser fixture now forwards actual connection state events and handles ontrack immediately. AudioTests --monitor measures only the supported virtual capture endpoint without injecting a tone, saving audio or reading a physical microphone.

## Stability package 0.8.0

Tests cover transient disconnect recovery, one phone ICE restart, bounded timeout, stalled video detection, acknowledgement expiry, late asynchronous results and a strict diagnostic report allowlist. This is component validation; prolonged real-device use, interruptions on iOS/Android and recovery across real network changes still require device testing.

Installer DPI: the embedded manifest was extracted from the built EXE and verified to contain PerMonitorV2, a legacy per-monitor DPI fallback and requireAdministrator. Visual appearance across multiple monitors still needs user confirmation.

## Usability package 0.9.0

50 automated tests passed locally, covering portrait contain/crop/rotation geometry, silence classification, guided-test cancellation, rolling audio/video rates, counter resets and report privacy. A synthetic Windows camera passed 30 frames through Frame Server at 1080p. The compact native layout was visually inspected with a test image. The browser fixture verifies actual received video/audio and the five-second input-level test. Physical phone rotation/crop appearance in meeting apps and speech levels across different phones still require real-device testing.

## Local recording 0.10.0

Synthetic native recording produced a finalized MP4 at 1920x1080, duration 3.265 seconds after a half-second pause, with two 48 kHz audio channels. The test used a generated image and oscillator, not a physical camera or microphone. Windows shell metadata recognized the output. RecordingTests verifies bounded block validation, atomic target replacement and preservation of an existing target on abort. JS tests cover quality/codec validation, acknowledge-before-finish sequencing, pause/resume, remote permission boundaries, old-client negotiation, cancelled dialogs, disconnect and duration stop. Real phone sound, prolonged capture, disk exhaustion and recovery of incomplete files still require further testing.

RecordingProbe decoded the resulting MP4 with Windows Media Foundation: 65 video frames and audio RMS 0.0706. This verifies actual video and audio decoding, beyond metadata recognition. Pause/resume was included in the recording fixture.

## Local noise reduction 0.11.0

60 automated tests passed. New JS tests verify processed audio is selected for recordings and Windows routing, stale output is rejected after graph changes, filter failure restores original audio, worklet starvation is silent, and buffered audio is bounded. Native FilterTests starts the bundled model locally, rejects malformed PCM, measures 34.7 dB attenuation on seeded white noise after warmup, processes 100 realtime 20 ms blocks in approximately 2.02 seconds, and verifies stop/restart. The noise-only score is not a speech-quality score. Native AudioTests still reaches the virtual Windows microphone and becomes silent after mute. Danish speech quality and end-to-end physical phone/OBS recording still require device testing.

## Noise usability 0.12.0

JS tests cover single bounded restart, original audio during restart, idle/suspended input, stale/duplicate replies, bounded PCM queues, live attenuation, stable recording track, shared Windows routing, opt-in preview, 10-second memory cap and cleanup on close/failure. Browser fixture exercised the generated-audio preview from Start to Ready and verified that reopening after Close has no retained test audio. No human audio was used for this fixture. Native tests measured 5.98 dB at the 6 dB setting and 34.67 dB at the 36 dB setting on seeded noise without restarting the engine. 100 realtime blocks completed in approximately 2.02 seconds. Physical-phone speech quality and exact acoustic latency still need real-device listening.

## Security hardening 0.13.0

All ten RGB32/NV12 camera formats passed with version-3 capability-protected buffers. A direct COM test rejected a missing capability, produced black frames with a wrong capability, and produced correct frames with the right capability. AppContainer DSP passed 100 realtime blocks in about 2.02 seconds. A separate zero-capability probe could not read a private canary file or establish TCP to a listening localhost endpoint. Recording finalization preserves a protected two-entry ACL. The new installed COM registration and real Frame Server path must also be checked after installation. Two-account Windows isolation is not claimed as an executed test.

Installed 0.13.0 verification: the new camera COM registration points to ExtrudaCamera-0.13.dll. ProgramData frame root is owned by Administrators with a protected ACL. The operating-system Frame Server test passed 30 correct RGB32 frames, timestamps and stop/stale blackout using the new capability-protected private transport.

Installed production audio verification: a probe launched the actual Program Files helper without the build-directory ACL test hook. AppContainer token verification passed and processed PCM was returned. No private media or microphone was opened.

## Connected-view update 0.15.0

73 automated tests passed, including phone closure while connected, one fresh
invitation, rejection of stale WebSocket events and manual cancellation without
renewal. A synthetic browser fixture verified the default compact controls,
visible input meter, denoise visibility only with enabled audio, expanded
framing controls and restoration of pairing layout on disconnect. These checks
did not use a physical phone, camera or microphone; acoustic quality and actual
speech levels still require device testing. Installed application/UI hashes
matched the packaged 0.15.0 files. GitHub CI passed.

## Session lifetime regression — 14 November 2026

A simulated-clock Durable Object test authenticates the second device four
minutes after invitation creation, advances past the original ten-minute
expiry, verifies both sockets remain open and can relay signalling, and checks
that repeated traffic/duplicate tokens do not extend the fixed eight-hour cap.
At that cap sockets close and storage clears. Unused invitations still expire
after ten minutes. This is a time-controlled regression, not an eight-hour
physical-phone endurance test. Echo was not acoustically reproduced on the
user's TV; microphone capture already requests browser echo cancellation.

## Recovery after invitation deadline — 0.15.1

The client now clears the invitation deadline when media becomes connected.
A queued deadline checks its own socket, consent and recovery state before
renewing. Regression tests simulate a connection followed by a brief outage
at the old deadline and verify that the 15-second recovery period is preserved.
Server close handling distinguishes abnormal signalling/service loss from
explicit departure; a paired peer's direct media is not closed merely because
the other signalling socket reports 1006/1011/1012/1013. Authentication/policy
failures, explicit departure and session expiry retain termination behavior.

78 automated tests passed against an isolated local Worker. Physical iPhone
sleep/background behaviour is outside these synthetic tests. Endurance results
are recorded below after the real-time run finishes.

The real-time end-to-end run completed eleven minutes with the 0.15.1 packaged
Windows UI and hosted phone assets (patched phone app.js), using Chromium's
synthetic camera. The comparison codes matched, PC approval started media,
and the receiver remained connected beyond the ten-minute invitation boundary.
No physical camera/microphone was opened. This establishes this desktop-browser
path, not an iPhone endurance result or a reproduction of the user's exact
network/lock conditions. The earlier old-receiver trial was stopped after two
minutes to test the corrected package instead; it did not establish the user's
original root cause.

## 0.16.0 image editor

Phone viewfinder publication (2026-11-20): all 86 automated tests passed. A synthetic-media browser at 390 × 844 paired with the existing packaged receiver, exercised hide/show video, camera replacement while hidden, settings, screen dimming and reconnecting a new QR in the same phone tab. The simulated camera ignores facingMode because desktop fake cameras do not provide front/back devices. The video track remained live after replacement, and older receivers correctly kept phone-side resolution disabled. Physical iOS/Android and the updated native resolution bridge still require device testing; the Cloudflare publication alone does not update installed Windows apps.

Hosted phone reconnect hotfix: 83 automated tests passed, including new-QR fragment navigation and cached-page cleanup. An end-to-end synthetic-media browser test connected, closed the PC page, observed the ended phone session, opened a second PC pairing and navigated the SAME phone tab to its new QR URL. A fresh phone document loaded, comparison codes matched, PC approval succeeded and video resumed. This verifies desktop Chromium's tab-reuse path; physical iOS Safari cache behavior remains a manual check. No Windows binary changes are needed for the hosted phone fix.

Synthetic browser pixel checks passed for crop, opaque mask, unchanged exterior pixels, blur, overlay and invalid rectangle rejection. Native editor opens from the bottom advanced menu, supports numerical rectangles, adds/removes areas and closes correctly. No physical camera or microphone was accessed. Image edits feed the existing shared processed canvas for webcam and recording. Real phone and meeting-app validation remains a manual check.

## 0.17.0 phone-side resolution

All 86 automated tests passed (pairing against an isolated local Worker). Camera-start tests cover the capability flag, the PC applying valid phone requests through the bridge, refusals while the selector is locked, and the hidden picture surviving camera replacement. The installer was built from this commit and its packaged UI was compared with `public/` (phone-ui.js identical; app.js and i18n.js carry the new messages and strings). The updated receiver was not installed on this build machine during release, and physical iOS/Android plus Teams resolution switching remain manual checks.

## 0.18.0 receiver layout and fullscreen

All 88 automated tests passed (pairing against an isolated local Worker), including two new packaging tests for script copy/embed/install and bridge init order. The built ExtrudaCamera.exe was run with `--system-smoke` and checked for the step bar, stage chips, last-step hint, grouped toolbar, settings side panel, pairing view and maximized width. Fullscreen via button, F11 and double-click covered the monitor without frame or taskbar; Esc, F11 and double-click restored the earlier placement, and controls auto-hid and reappeared on mouse movement. A harness checked step progression, hint dismissal, Esc focus return and English strings. Physical phone pairing, recording in fullscreen and installation via setup remain manual checks.
