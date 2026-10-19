# Known security risks

[Dansk](SECURITY.da.md) · [English](SECURITY.en.md) · [Deutsch](SECURITY.de.md) · [Français](SECURITY.fr.md)

> **Prototype: avoid sensitive situations. Encryption does not protect against a compromised phone, PC or client code.**

## Hosting and client code

**High impact if compromised**

The phone client is loaded from Cloudflare. Compromised hosting or deployment access could change the client and leak video. The packaged Windows UI reduces this dependency on the PC, but does not protect the phone client.

<!-- plain:start -->
**In plain language**

Your phone’s camera page comes from our website. Someone who takes over access to change the website could change what the page does.

**What could happen to you**

In the worst case, an attacker could make the page send your camera image to someone else while you use it. Encryption does not help if the page itself has been changed.
<!-- plain:end -->

## Installation and downloads

**High impact if compromised**

The installer is unsigned and requests administrator approval. A fake or replaced installer can compromise the PC. Download only from the project’s official GitHub Release. A checksum on the same account does not protect against takeover of that entire account.

<!-- plain:start -->
**In plain language**

You allow the installer to make changes to Windows. Windows cannot yet verify its publisher using a digital signature.

**What could happen to you**

A fake copy could, in the worst case, install malware, steal files or take over your PC. Use the project’s official GitHub download; the correct filename alone does not prove a file is genuine.
<!-- plain:end -->

## Access to the QR code

**Requires careful user confirmation**

The QR code and pairing link contain access secrets. Do not share or publish them. One-time tokens, expiry and the comparison code reduce risk, but a leaked invitation and mistaken approval can still connect the wrong device. The code is not an account login or a guarantee of identity.

<!-- plain:start -->
**In plain language**

The QR code is a temporary invitation containing a secret key. Someone who gets a picture of it or the link itself can try to use that invitation.

**What could happen to you**

If you also accept without comparing the code on both devices, you could connect an unfamiliar device. Images from the wrong phone could then appear in your meeting. A leaked QR code alone does not grant access to your phone camera, but you should never share it.
<!-- plain:end -->

## Compromised devices

**High impact if compromised**

Malware, administrators or a person with access to an unlocked phone or PC may read the screen, keys or video. Encryption in transit does not protect compromised endpoints. Do not use this prototype where a video leak would have serious consequences.

<!-- plain:start -->
**In plain language**

If the phone or PC already has malware, or someone can use your unlocked device, they may be able to see what you see.

**What could happen to you**

Private images, pairing secrets or screen contents could be copied without your knowledge. The app’s encryption cannot make an already compromised phone or PC safe again.
<!-- plain:end -->

## Local frame buffer

**Local access risk**

Decoded frames pass through a temporary file under ProgramData. It is access-controlled, cleared and deleted on close, but is not anonymous RAM only. Processes under the same user or with sufficient system privileges may gain access. Deletion does not guarantee secure erasure of disk or pagefile data.

<!-- plain:start -->
**In plain language**

To present video as a Windows camera, the app briefly puts images in a protected temporary file on the PC. This is not a normal video recording, but the images briefly exist outside the app itself.

**What could happen to you**

Another program with your user permissions or administrator access might copy the images. Traces may also remain on storage after the file is deleted. Avoid images for which even a possible leak would be serious.
<!-- plain:end -->

## Availability and abuse

**Remaining risk**

Server and message limits reduce abuse, but requests still reach Cloudflare. A larger attack can exhaust quotas and block new pairings. An already paired malicious device can also disrupt the session. This does not by itself give an outsider access to video.

<!-- plain:start -->
**In plain language**

Pairing uses a shared online service with limited capacity. Many requests or abuse can make the service temporarily unavailable.

**What could happen to you**

You might be unable to connect your phone just before a meeting. A session could also be interrupted or disrupted. An outage does not itself mean anyone has seen your images; consider keeping the PC’s ordinary webcam as a backup.
<!-- plain:end -->

## Connection metadata and local network

**Privacy limitation**

Cloudflare and GitHub may process IP addresses and technical connection data. WebRTC exchanges network information between devices. No user account is required, but the service is not anonymous. Shared Wi-Fi is not a security guarantee; guest isolation, firewalls and interruptions can block the connection.

<!-- plain:start -->
**In plain language**

Even without a login, use leaves technical traces such as your internet address. Two devices on the same Wi-Fi may also be prevented from communicating.

**What could happen to you**

Service providers may have connection information, and the solution does not make you anonymous. Guest Wi-Fi or network rules can prevent pairing. This connection information is not the same as access to the camera image itself.
<!-- plain:end -->

## Camera permission and recording by the receiver

**Requires attention**

The camera attempts to start after PC approval once browser permission is granted. Watch the camera indicator and disconnect after use. This app has no recording feature, but meeting apps, screen capture or the paired receiver may record the image. Encryption cannot prevent that.

<!-- plain:start -->
**In plain language**

Once you accept on the PC and have allowed the browser to use the camera, the phone attempts to send video. An app or person able to see the image on the PC can save it.

**What could happen to you**

You could accidentally show a private room or people you did not intend to film. Images could be recorded or shared further even though Extruda has no record button. Point the camera appropriately before accepting, then disconnect and close the page after use.
<!-- plain:end -->

## Unknown flaws and updates

**Not independently security audited**

Functional tests and an npm advisory check are not penetration testing, fuzzing or a guarantee. Native C++, WebView2 and system components may contain unknown flaws; serious flaws could potentially compromise a process. Keep Windows, browser and app updated. The phone client updates online; the local Windows UI requires a new app version.

<!-- plain:start -->
**In plain language**

We have tested specific functions, but no independent expert has reviewed the entire solution for security holes. There may still be flaws we do not know about.

**What could happen to you**

A bug could cause black video or a crash. In the worst case, a serious security flaw could let an attacker read data or run malicious code on a device. These are possible consequences, not a claim that such a hole has been found. Keep the app, Windows and browser updated.
<!-- plain:end -->

## AI-assisted development

The prototype is vibe-coded with AI assistance and Codex. Automated tests and iterative testing may miss errors and incorrect assumptions in both code and documentation. There is no independent security certification or warranty. Also read the [FAQ and guides](FAQ.en.md) and [security reporting policy](../SECURITY.md).

<!-- plain:start -->
**In plain language**

AI helped write the program and its guides. AI can produce something that looks correct but still contains mistakes.

**What could happen to you**

A guide could name the wrong menu, a feature could fail or a security flaw could be overlooked. A passing test or convincing text is not proof of security. Avoid use where a leaked image or an outage could have serious consequences.
<!-- plain:end -->

[Technical review](../SECURITY-REVIEW.md) · [Releases](https://github.com/sorenfroststaal/Extruda-Phone-As-Webcam/releases)
