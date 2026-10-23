# extruda - mobile as webcam

> **SECURITY: Experimental software. A compromised phone client, device or installer can expose camera images or compromise a PC. The protected frame file, hosting metadata, service quotas and unknown code flaws remain risks. No independent penetration test has been completed.**

**Security documentation:** [English](docs/SECURITY.en.md) · [Deutsch](docs/SECURITY.de.md) · [Français](docs/SECURITY.fr.md) · [Dansk](docs/SECURITY.da.md).


Use an Android or iPhone camera as a Windows webcam, without OBS or a user account.

**[Download Windows installer 0.7.2](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/releases/download/mobile-as-webcam-v0.7.2/ExtrudaMobileAsWebcam-Setup-0.7.2-x64.exe)** · [Releases](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/releases/tag/mobile-as-webcam-v0.7.2) · [mobile as webcam website](https://extruda-phone-camera.sorenfroststaal.workers.dev/)

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
  cross-room rate limits. Optional phone microphone audio uses the same direct WebRTC connection; no recording feature is included.
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
