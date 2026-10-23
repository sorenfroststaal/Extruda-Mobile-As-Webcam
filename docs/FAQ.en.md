# FAQ and guides

[Dansk](FAQ.da.md) · [English](FAQ.en.md) · [Deutsch](FAQ.de.md) · [Français](FAQ.fr.md)

[Security risks](SECURITY.en.md)

## How do I get started?

Install the app on Windows 11 x64. Open it and scan the QR code with your phone on the same Wi-Fi. Compare the six-digit code and accept on the PC. Allow camera access on the phone. Keep both apps open.

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

This version needs internet for the phone client and pairing, even on the same Wi-Fi. Video and optional microphone audio travel directly using WebRTC; Cloudflare does not relay media. The microphone starts off for every new connection and needs a tap and browser permission on the phone. The app has no recording feature, but meeting apps and receivers can save video and sound. Disconnect and close both sides after use. Never share the QR code or link. See Security risks.

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
