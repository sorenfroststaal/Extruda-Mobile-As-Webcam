# FAQ and guides

[Dansk](FAQ.da.md) · [English](FAQ.en.md) · [Deutsch](FAQ.de.md) · [Français](FAQ.fr.md)

[Security risks](SECURITY.en.md)

## How do I get started?

Install the app on Windows 11 x64. Open it and scan the QR code with your phone on the same Wi-Fi. Compare the six-digit code and accept on the PC. Allow camera access on the phone. Keep both apps open.

During a connection, select Front camera or Rear camera on your phone. Video may briefly pause while switching; the microphone and pairing are preserved. If the camera cannot be opened, the app tries to restore the previous camera.

## iPhone: how do I allow the camera?

Open the pairing link in Safari and choose Allow when the site requests camera access. If previously denied: open the page menu by the address bar → Website Settings → Camera → Ask or Allow. Reload; scan a new QR code if pairing has expired.

If the setting is missing, check Settings → Apps → Safari → Camera (older iOS: Settings → Safari). Keep Ask as the general setting and allow only the intended site. Other browsers may also need permission under Settings → Privacy & Security → Camera. Menu names vary by version. Tap Start camera if the browser requires another tap.

[Apple · Safari](https://support.apple.com/guide/iphone/browse-the-web-privately-iphb01fc3c85/ios) · [Apple · iPhone](https://support.apple.com/guide/iphone/iph168c4bbd5/ios)

## Android: how do I allow the camera?

Open the link in Chrome and allow the camera when asked. If blocked: Chrome → ⋮ → Settings → Site settings → Camera. Find the blocked site and allow it. Also check Android → Settings → Apps → Chrome → Permissions → Camera → Allow only while using the app. Reload or scan a new QR code. Menu names vary by phone and version.

[Google · Chrome](https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DAndroid&hl=en)

## How do I select the camera in Teams?

Connect the phone first. In Teams on the PC: Settings → Devices → Camera → choose extruda - mobile as webcam. The name may include the resolution and Windows Virtual Camera. During a meeting, use the arrow beside the camera icon to choose the camera. Turn video on. If it is missing, restart Teams while Extruda stays open.

[Microsoft · Teams](https://support.microsoft.com/en-us/teams/notifications-settings/manage-your-device-settings-in-microsoft-teams)

## How do I select the camera in Zoom?

Connect the phone first. In Zoom on the PC: Settings → Video & effects (or Video) → Camera → extruda - mobile as webcam. In a meeting: use the arrow beside Video → select the camera and start video. Restart Zoom if it is not listed. Zoom and meeting settings may limit the actual resolution.

[Zoom · Video](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061836)

## Other apps and a missing camera

Choose extruda - mobile as webcam in the app’s camera settings. A browser meeting site also needs camera permission. On Windows: Settings → Privacy & security → Camera → enable camera access and access for desktop apps. Work PCs may be restricted by IT policy. Compatibility is not guaranteed in every app; this version has no macOS or Linux receiver.

[Microsoft · Camera](https://support.microsoft.com/en-us/teams/meetings/my-camera-isn-t-working-in-microsoft-teams)

## The QR code expired or connection fails

An invitation lasts 10 minutes. Cancel and create a new pairing or reopen the app. Use the same ordinary Wi-Fi; guest networks may isolate devices. A VPN or firewall can block WebRTC. Try a trusted network without disabling security protection globally. Open the link in Safari or Chrome, not an embedded scanner browser. Error 429 means too many attempts: wait and retry.

## Resolution, black video and stuttering

The app starts at 1920 × 1080. Once connected, choose 480p, 720p, 1080p, 1440p or 4K. The phone or meeting app may deliver less. After a change, you may need to reselect the camera in Teams or Zoom. For stuttering: try 720p, move closer to the router and improve lighting. Keep the phone page in front and the screen on; screen lock, background mode, heat and power saving can interrupt video. Close other camera apps and try Start camera or a new pairing.

## Internet, audio, recording and stopping safely

This version needs internet for the phone client and pairing, even on the same Wi-Fi. Video and optional microphone audio travel directly using WebRTC; Cloudflare does not relay media. The microphone starts off for every new connection and needs a tap and browser permission on the phone. The app can record locally on the PC, and meeting apps and receivers can save video and sound. Disconnect and close both sides after use. Never share the QR code or link. See Security risks.

## Language, theme and updates

The globe selects Danish, English, German or French. The sun selects light, dark or automatic theme. Automatic follows system language and appearance; the phone language comes from browser preferences. Manual choices are stored per device. Update the Windows app through the project’s GitHub Releases and close the app before installing. Reload to update the phone client. The installer is unsigned; verify its source before granting administrator approval.

## Is it open source, and can I change and share it?

Yes. The project code is published under the MIT licence: you may use, copy, modify, publish, share and sell it, including commercially. Keep the copyright and licence notice in copies or substantial portions. The software comes without warranty. Third-party code and fonts have their own included licences; the extruda logo and brand assets are not covered by the code’s MIT licence.

[GitHub · Source](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam) · [MIT · LICENSE](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/blob/main/LICENSE)

## Is the program vibe-coded?

Yes. The prototype was developed with AI-assisted programming (vibe coding) and Codex, guided by the owner’s requests and iterative testing. Code and documentation may contain mistakes or overlooked assumptions even when automated tests pass. This is not an independent code review or security certification. Treat it as an experimental open-source tool and read the security risks before use.

## Bugs, suggestions and contributing

Open a GitHub issue with the app version, Windows version, phone/browser and reproduction steps. Never share an active pairing link, QR code, access secrets or private camera images. Code, translations and improvements are welcome; no response time or support guarantee is promised. For a security flaw, read SECURITY.md for a private contact route before publishing details.

[GitHub · Issues](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/issues) · [GitHub · Security](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/blob/main/SECURITY.md)

## How do I use my phone as a microphone?

Connect the camera and press Turn microphone on on your phone. Allow the microphone in Safari or Chrome; permissions are managed alongside camera access, under Microphone. The PC button can request audio but cannot grant permission itself. The off button on either device stops audio; on the phone it also stops microphone capture. The green level meter shows captured or received signal, not whether Teams is actually using it.

A Windows microphone requires the separate VB-CABLE driver. Download only from vb-audio.com, extract it and run its installer as administrator. Restart after installation. Select CABLE Input in Extruda and CABLE Output as microphone in Teams or Zoom. This does not change your default microphone. VB-CABLE is third-party donationware with its own licence; it is not part of the project’s MIT code and is not installed automatically. Without the driver, the level meter works but audio cannot be selected as a Windows microphone.

If Steam Streaming Microphone is already installed, you can select it instead of VB-CABLE. Choose the same microphone name in Teams or Zoom. Send level starts lower for Steam to compensate for its amplification; adjust Audio settings if audio is quiet or distorted. Do not switch the Windows default speaker to the virtual device.

If no supported audio device is found, the app offers the publisher’s VB-CABLE download, another search, or Use camera only. Camera-only mode is remembered on the PC and hides the microphone button on both devices. Restore it under Information → Microphone setup. The driver is downloaded and installed separately; Extruda does not bypass Windows approval.

[VB-Audio · VB-CABLE](https://vb-audio.com/Cable/)

## How do I check the connection?

Open Information → Check connection. New video frames, microphone signal and Windows acknowledgements are shown separately. Five seconds without new video frames triggers a warning and the Windows app clears a frozen image. Silence alone does not mean a network failure. Windows acknowledgements mean data was accepted by the app’s Windows component; they do not prove that Teams, Zoom or OBS selected the correct device.

A brief network interruption gets up to 15 seconds to recover. The phone attempts one ICE restart if signalling is still available. An expired invitation, an unreachable network or a longer interruption can require a new QR code. A phone interruption may require reopening the page or tapping Start camera. Microphone permission is still granted by you on the phone.

Copy diagnostic report creates a local report containing only version, states and counters. It contains no images, audio, IP addresses, device names, browser identifiers, pairing links or keys. It is never sent automatically. The report is displayed for your review before sharing.

## Framing, microphone test and quality

During a connection, Windows controls sit beside a bounded preview. Show entire image preserves the full image with borders; Fill frame crops the centre to fill the frame. Rotation affects both preview and Windows camera. Choices are remembered on the PC. Small windows can still require scrolling. Audio settings open in a separate dialog.

Microphone on · Quiet is normal, not a permission error. The meter uses a dB scale. Enable the microphone, choose Test microphone and speak normally towards the phone for five seconds. The test assesses signal level and possible strong peaks; it does not recognise speech or save audio. On the PC it also reports whether Windows accepted audio data. It does not measure sound in Teams, Zoom or OBS or automatically change send level.

Windows resolution is the virtual camera output size. Received shows actual video dimensions, frame rate and bitrate; the phone or WebRTC can deliver lower quality. Check connection also separates video and audio rates, packet loss and jitter over the last roughly five seconds. — means not measured yet. Counters reset for new sessions or longer sampling gaps. Reports still contain no media, addresses, device names or pairing keys.

## How do I record video on the PC?

Connect the phone and choose Record video in the Windows app. The quality slider selects resolution, frame rate and bitrate targets and estimates file size per minute. Choose file and start opens the Windows save dialog. Video is written incrementally to the selected folder; the app does not upload it. A folder under OneDrive or another sync service may nevertheless be uploaded by that service.

Advanced offers format (automatic, MP4 or WebM), codec (H.264, VP8 or VP9), resolution, 15/24/25/30 fps, video/audio bitrates, recording audio gain, requested keyframe interval and optional duration limit. Support depends on WebView2 and the PC. Bitrate and size are targets; higher settings do not create detail absent from the phone feed. Windows camera resolution is locked while recording. Crop and rotation follow the displayed camera output.

Include microphone records phone audio only while permission is granted and the microphone is on. Local recording needs no virtual audio driver. It does not capture Teams, Zoom, OBS or system audio. Pause/resume retains the same file. Stop and save finalizes it. Disconnecting or closing attempts to stop and save. Data is first written to a temporary .partial file in the same folder; an existing target is replaced only after successful finalization. A crash, disk failure or storage that is too slow may leave an incomplete file that may not play.

A supported Extruda Windows version also exposes recording controls on the paired phone. Start opens settings and the save dialog on the PC and requires confirmation there. The phone can then pause, resume and stop. Commands use the existing approved encrypted connection; no public recording link or new server port is created. File paths are not sent to the phone. A compromised paired device can still misuse controls. Update both clients if buttons are missing. Record only with participants’ consent.

## How does local AI noise reduction work?

Open Audio settings in the Windows app and enable Local AI noise reduction. DeepFilterNet cleans phone audio on the PC using an embedded model. Processing requires no account, upload or internet. Pairing still uses the existing online server. The feature is off at every launch.

Filtering applies to both the virtual microphone and recordings with microphone enabled. The meter shows original input. Filtering can add delay, change the voice or remove quiet speech. Try a short recording first. A filtered recording contains processed audio without a separate original track. Existing files are unchanged. On failure or timeout, a warning appears and original audio resumes; a brief gap may occur.

[DeepFilterNet](https://github.com/Rikorose/DeepFilterNet)
