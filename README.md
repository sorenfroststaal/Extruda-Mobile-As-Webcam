# extruda - mobile as webcam

> **SECURITY: Experimental software. A compromised phone client, device or installer can expose camera images or compromise a PC. The protected frame file, hosting metadata, service quotas and unknown code flaws remain risks. No independent penetration test has been completed.**

**Security documentation:** [English](docs/SECURITY.en.md) · [Deutsch](docs/SECURITY.de.md) · [Français](docs/SECURITY.fr.md) · [Dansk](docs/SECURITY.da.md).


Use an Android or iPhone camera as a Windows webcam, without OBS or a user account.

**[Download Windows installer 0.13.0](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/releases/download/mobile-as-webcam-v0.13.0/ExtrudaMobileAsWebcam-Setup-0.13.0-x64.exe)** · [Releases](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/releases/tag/mobile-as-webcam-v0.13.0) · [mobile as webcam website](https://extruda-phone-camera.sorenfroststaal.workers.dev/)

## Use

Windows 11 x64 and Microsoft Edge WebView2 Runtime are required. Run the installer,
open extruda - mobile as webcam, and scan the QR code with your phone on the same Wi-Fi.
Compare the six-digit code on the two devices and accept on the PC. The phone
starts its camera after acceptance; grant camera permission if prompted.

The app starts at 1920 × 1080. Resolution controls appear once connected and
support 480p, 720p, 1080p, 1440p and 4K. Teams may need the camera reselected after
an output change. The phone and meeting app can deliver a lower actual resolution.

## Architecture

- The Windows UI is packaged locally. A native Media Foundation camera makes
  received video available to meeting programs.
- The phone client and temporary pairing service are hosted on Cloudflare.
  This version needs internet for loading/pairing; video travels directly via WebRTC.
- Pairing uses encrypted signalling, one-time tokens, a comparison code and
  cross-room rate limits. Optional phone microphone audio uses the same direct WebRTC connection; optional local recording saves to a user-selected PC folder.
- A protected temporary file transports decoded frames to Windows Frame Server.

See [Windows build and installation](windows/README.md),
[validation](windows/VALIDATION.md), and [security review](SECURITY-REVIEW.md).
This is an unsigned prototype, not an independently audited production release.

## Build

Install Node.js and pnpm, then run `pnpm install --frozen-lockfile` and `pnpm build`.
See the Windows README for the C++ toolchain. `pnpm dev` starts the local Worker;
run `pnpm test` in another terminal. To deploy your own instance, update the
Cloudflare account and service URLs in the sources; no credentials are committed.

## Source and releases

Source lives at the root of the dedicated
[Extruda-Mobile-As-Webcam repository](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam).
Installers and the Windows ZIP are GitHub Release assets, outside Git history.
Previous Cloudflare download URLs redirect to GitHub for compatibility.

## Licences

Code: MIT; upstream camera source and SDK notices accompany distributions.
Fonts carry their OFL licences. Brand assets are covered separately by
[BRAND-NOTICE.txt](BRAND-NOTICE.txt).

## Language and appearance

Use the globe icon to choose Danish, English, German or French. Automatic uses the Windows UI language in the desktop app and the browser’s preferred languages on the phone, falling back to English. Manual choices are stored only on that device. The theme icon offers Automatic, Light and Dark; Automatic follows the OS colour preference and updates when it changes. The information icon opens a menu with **Security risks** and **FAQ and guides** without leaving the connection. Help topics expand individually. Official reference links open in your browser.


## FAQ, permissions and meeting apps

Read the guides in [English](docs/FAQ.en.md), [Deutsch](docs/FAQ.de.md), [Français](docs/FAQ.fr.md) or [Dansk](docs/FAQ.da.md). They cover iOS/Safari and Android/Chrome camera permissions, Teams, Zoom, other meeting apps, Windows camera access, pairing failures, resolution, internet requirements, audio, stopping, preferences and updates. Menu labels can vary by OS and app version.

## Open source and development

This prototype is **vibe-coded with AI assistance and Codex**, guided by the owner’s requests and iterative testing. Passing tests do not establish that its code or documentation is correct or secure. There has been no independent security audit; read the [known risks](docs/SECURITY.en.md) and [security reporting policy](SECURITY.md). Contributions, translations and reproducible bug reports are welcome; support has no guaranteed response time. Never post active pairing links, QR codes, secrets or private video frames.

The project code is MIT-licensed. You may use, copy, modify, publish, distribute, sublicense and sell it, including commercially, while retaining the copyright and permission notice in copies or substantial portions. It is supplied without warranty. Preserve third-party notices; fonts and brand assets have separate terms listed above.

Each security topic includes a plain-language explanation and concrete possible consequences, in the app and all four security guides. These distinguish service outages from image disclosure and describe hypothetical severe outcomes without claiming a vulnerability has been found.

## Optional phone microphone

Connect first, then press **Turn microphone on** on the phone and grant its separate microphone permission. Audio starts off in every new session. Either device can stop it; the PC cannot grant phone permission remotely. The live input meter shows capture/received signal, not proof of delivery to a meeting app. Video stays connected when microphone audio is toggled.

For a Windows microphone, select an already installed **Steam Streaming Microphone** or **VB-CABLE** device in Audio settings and select its recording endpoint in Teams/Zoom (Steam Streaming Microphone or CABLE Output). There is no local audio monitoring through PC speakers and default Windows devices are unchanged. Steam send level starts at 3% to compensate its amplification; adjust if needed. VB-CABLE starts at 100%.

If neither is installed, the meter still works, but the phone audio is not exposed as a Windows microphone. VB-CABLE is optional, separately licensed third-party donationware from [VB-Audio](https://vb-audio.com/Cable/); download only from the official publisher, install with administrator approval and restart. No third-party driver is bundled or installed automatically. The project’s MIT licence does not cover these external drivers. See the microphone FAQ and security notes in all four languages.

If no supported virtual audio device is detected, a setup dialog links to the official VB-CABLE installer, offers another device scan, or lets you use the camera only. Camera-only mode hides audio controls on both devices and is remembered on the PC. Restore audio under Information → Microphone setup. External drivers are installed separately with normal Windows administrator approval.

## Connection recovery and diagnostics

Version 0.13.0 tolerates brief disconnects for up to 15 seconds without releasing phone capture or consent. The phone attempts one ICE restart if signalling remains available; expired invitations or unreachable networks still require a new pairing. Information > Check connection displays real frame progress, microphone signal and Windows acknowledgements separately. A five-second video stall clears frozen output in the Windows app. These checks do not verify a meeting application's device selection.

Copy diagnostic report displays and copies an allowlisted local snapshot of version, states and counters. It excludes media, addresses, device names, browser identifiers and pairing material, and is never uploaded automatically.

## Framing, level test and recent quality (0.13.0)

Connected Windows controls use a compact layout with a bounded preview. Audio settings open separately. Framing offers contain, centre crop and 0/90/180/270-degree rotation; the same canvas is previewed and delivered to Windows. Choices persist locally. Small windows may still scroll.

Silence is a normal microphone state. The input meter uses a logarithmic scale and displays dBFS. The five-second test evaluates a bounded collection of level measurements, not speech content or recordings, and gives level guidance. It does not automatically adjust gain or verify a meeting app's input. Actual received dimensions, frame rate and bitrate are displayed separately from Windows output resolution. Diagnostics split recent audio/video rates, loss and jitter over about five seconds; unknown values remain unknown and discontinuities reset the interval.

## Local recording (0.13.0)

Record video writes the framed Windows camera image and optional enabled phone microphone to a file chosen in the Windows save dialog. A quality slider estimates file size; Advanced exposes container, codec, resolution, frame rate, bitrates, audio gain, keyframe target and duration limit. Supported encoders are detected at runtime; requested settings are targets, not guarantees. This is an original MediaRecorder-based implementation and does not bundle OBS or require its installation.

Pause/resume retains one file. Data is streamed through an acknowledged bounded queue to a worker writing a temporary file; successful stop flushes and renames it to the selected target. Existing files remain untouched until commit. Crashes, full disks and slow storage can leave incomplete .partial files. No automatic recovery is promised. The app uploads no recordings, but a user-selected folder may be cloud-synced by another service.

Paired-phone controls request PC confirmation for each new recording and can then pause, resume and stop. Commands use the existing authenticated encrypted session, with no public control link, new port, file path or recording data exposed to the phone. Capability negotiation keeps old clients from receiving unsupported commands. Read the updated multilingual recording and security guides.

## Optional local AI noise reduction (0.13.0)

In the Windows app, open Audio settings and enable Local AI noise reduction. DeepFilterNet processes the approved phone microphone on the PC, with an embedded model and no runtime download or cloud inference. The same processed audio feeds the virtual microphone and new recordings with microphone enabled. It is off at launch. No Python or GPU is required by this bundled CPU runtime.

Noise reduction adds latency and can alter or suppress speech. Test your voice before relying on it. The meter shows original phone input, not processed output. If processing fails or times out, the app disables the filter, shows a warning and restores original audio; a brief gap may occur. A recording made with filtering enabled contains the processed audio, not a separate original track. Existing recordings are not modified.

Build prerequisite: `node scripts/fetch-deepfilter.mjs` downloads the pinned official Windows runtime if absent and verifies SHA256. Release packaging enforces a 400 MB installer ceiling. See windows/vendor/deepfilter/README.md for provenance.

## Noise reduction controls (0.13.0)

The main screen shows filter state and before/after levels. The strength slider changes DeepFilterNet attenuation (6–60 dB) on the next audio blocks without restarting the microphone or recording track. One automatic restart is permitted per audio graph; original audio continues during restart and after a second failure. Error reasons are enumerated and delayed replies from old sessions are ignored. Idle input and suspended graphs do not trigger failure loops.

The optional listening test starts only when clicked, holds at most 10 seconds of paired original/filtered PCM in memory, and plays either version at the same low gain after a separate click. Use headphones to avoid recapture/feedback. Close, mute, disconnect or filter failure stops playback and releases buffers; no test file or upload is created. Memory release is not forensic secure erasure. Both preview and main meters are before the separate Windows send-gain control. No extra original track is retained in normal video recordings.

## Security hardening 0.13.0

Development tooling is updated and undici is pinned to a patched release. GitHub CI checks the frozen lockfile, dependency advisories and local protocol tests with a read-only token and pinned actions. Only esbuild/workerd install scripts are allowed. No deploy credentials are supplied to PR checks.

Pairing budgets are per source (IPv6 /64), rather than one globally consumable minute budget. Platform quotas and shared-NAT limits still apply; this does not claim DDoS immunity. Frame transport uses private per-session directories, protected ACLs and a fresh 256-bit capability checked by a new camera COM component. A path alone is insufficient to obtain pixels. DeepFilterNet uses a capability-free AppContainer, one-process and 512 MB limits, with no unsandboxed fallback.

Recordings default to a private local app-data folder, use private file ACLs, warn for known synced/less-private storage and stop writing before a small free-space reserve is exhausted when detectable. Files are not encrypted. Other software under the same user, administrator access, OS services, a compromised phone/PC and compromised phone-client deployment remain trust boundaries. Digital signing is deferred.
