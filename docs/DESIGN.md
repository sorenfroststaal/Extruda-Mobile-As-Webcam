# Extruda design integration

Reference: https://extruda.dk/design-system/ (27 October 2026).
The current web guidelines supersede older radius values in the original 26A guide.

- Manrope wordmark/product name; Nunito headings; Inter controls and body.
- Existing approved light/dark palettes, 8 px control radius, 12 px cards,
  16 px large dialogs, explicit field borders and 48 px header controls.
- Header order: language, current light/dark theme, information. Preferences
  follow the OS by default and remain local; all four existing languages remain.
- Mobile utility controls sit below the product name. Help returns keyboard
  focus to the information button when closed.

## Startup

The native Windows app bundles the approved **Midtpunkt** 3.6-second masters
from `extruda.dk/design-system/logo-animation/`. Light and dark WebM variants
are copied unchanged; no remote player, fonts or media requests are needed.
Original approved artwork remains subject to BRAND-NOTICE.txt.

The video stays muted; the approved WAV plays through native Windows audio once per application launch, synchronized to video playback. Skip and every other dismissal stop the audio immediately. The overlay background is sampled from the decoded video corner to avoid YUV/RGB colour seams. Pairing starts concurrently.
Skip, Escape or Tab dismisses it; playback errors, blocked playback and a
4.5-second watchdog also reveal the application. Reduced-motion preference
skips it altogether. Phone pairing pages do not show the intro. Animation audio is played on the normal Windows playback device, not explicitly routed into the virtual microphone or recordings. If a virtual cable is the system default playback device, Windows may route it there. Pairing hides inactive recording, health and guide sections; Cancel sits inside the pairing panel.

## Pairing renewal (0.14.2)

Invitations remain single-use. When the phone leaves, stops the connection or
cannot recover within the existing 15-second deadline, the receiver retires the
old session and automatically creates a fresh QR code. Scan that new code and
compare/approve the new verification code. Manual Cancel does not automatically
restart pairing. Events from retired WebSockets cannot reset a new invitation.

## Compact connected view (0.15.0)

The connected Windows view shows resolution, microphone toggle, a compact input
meter, conditional noise-reduction checkbox, recording actions and Disconnect.
Settings and details starts collapsed below the preview and contains framing,
rotation, audio routing/tests, processing and connection diagnostics. Existing
controls are moved rather than copied, preserving state and avoiding duplicate
IDs. Disconnect restores the pairing screen and collapses the disclosure.
A synthetic browser check verified the default view, conditional checkbox,
expanded controls and return to pairing without using physical media devices.

## Phone pairing presentation

The phone Cancel/Disconnect button sits beside the verification section, using
the existing stop handler. While awaiting pairing, duplicate bottom status and
technical video statistics are hidden. Connection, cancellation or an error
ends the pairing presentation so diagnostic/error text remains available.
This is a hosted phone-UI change; the Windows installer is unchanged.

## Pairing clock independence

The ready message includes remaining server-side lifetime in milliseconds.
Clients use that relative lifetime, capped at ten minutes, rather than comparing
server timestamps with the phone clock. Older servers fall back to ten minutes;
the server still enforces the original invitation expiry. A simulated phone
clock one hour ahead reproduced immediate "Pairing ended" before this fix.
