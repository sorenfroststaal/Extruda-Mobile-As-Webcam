# Known security risks

[Dansk](SECURITY.da.md) · [English](SECURITY.en.md) · [Deutsch](SECURITY.de.md) · [Français](SECURITY.fr.md)

> **Prototype: avoid sensitive situations. Encryption does not protect against a compromised phone, PC or client code.**

## Hosting and client code

**High impact if compromised**

The phone client is loaded from Cloudflare. Compromised hosting or deployment access could change the client and leak video. The packaged Windows UI reduces this dependency on the PC, but does not protect the phone client.

## Installation and downloads

**High impact if compromised**

The installer is unsigned and requests administrator approval. A fake or replaced installer can compromise the PC. Download only from the project’s official GitHub Release. A checksum on the same account does not protect against takeover of that entire account.

## Access to the QR code

**Requires careful user confirmation**

The QR code and pairing link contain access secrets. Do not share or publish them. One-time tokens, expiry and the comparison code reduce risk, but a leaked invitation and mistaken approval can still connect the wrong device. The code is not an account login or a guarantee of identity.

## Compromised devices

**High impact if compromised**

Malware, administrators or a person with access to an unlocked phone or PC may read the screen, keys or video. Encryption in transit does not protect compromised endpoints. Do not use this prototype where a video leak would have serious consequences.

## Local frame buffer

**Local access risk**

Decoded frames pass through a temporary file under ProgramData. It is access-controlled, cleared and deleted on close, but is not anonymous RAM only. Processes under the same user or with sufficient system privileges may gain access. Deletion does not guarantee secure erasure of disk or pagefile data.

## Availability and abuse

**Remaining risk**

Server and message limits reduce abuse, but requests still reach Cloudflare. A larger attack can exhaust quotas and block new pairings. An already paired malicious device can also disrupt the session. This does not by itself give an outsider access to video.

## Connection metadata and local network

**Privacy limitation**

Cloudflare and GitHub may process IP addresses and technical connection data. WebRTC exchanges network information between devices. No user account is required, but the service is not anonymous. Shared Wi-Fi is not a security guarantee; guest isolation, firewalls and interruptions can block the connection.

## Camera permission and recording by the receiver

**Requires attention**

The camera attempts to start after PC approval once browser permission is granted. Watch the camera indicator and disconnect after use. This app has no recording feature, but meeting apps, screen capture or the paired receiver may record the image. Encryption cannot prevent that.

## Unknown flaws and updates

**Not independently security audited**

Functional tests and an npm advisory check are not penetration testing, fuzzing or a guarantee. Native C++, WebView2 and system components may contain unknown flaws; serious flaws could potentially compromise a process. Keep Windows, browser and app updated. The phone client updates online; the local Windows UI requires a new app version.

[Technical review](../SECURITY-REVIEW.md) · [Releases](https://github.com/sorenfroststaal/Extruda-Phone-As-Webcam/releases)

## AI-assisted development

The prototype is vibe-coded with AI assistance and Codex. Automated tests and iterative testing may miss errors and incorrect assumptions in both code and documentation. There is no independent security certification or warranty. Also read the [FAQ and guides](FAQ.en.md) and [security reporting policy](../SECURITY.md).
