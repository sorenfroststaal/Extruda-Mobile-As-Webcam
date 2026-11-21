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

Image editing lives in the collapsed bottom settings menu. The modal uses local raster overlays, keyboard-accessible percentage rectangles, crop and opaque/blur masks. All outputs share one processed canvas. Changes last for the app session; see the FAQ for privacy limits.

## Phone viewfinder (0.17.0)

Pairing shows the comparison code large and centred with a status pill and
Cancel. Once the PC approves, the phone switches to a full-screen viewfinder
(`public/phone-ui.js`, `body.phone-live`): the picture uses `object-fit: contain`
so the phone shows what the PC receives, a Live/connecting chip and the current
resolution sit at the top, and five 56 px round controls sit at the bottom:
flip camera, microphone, hide picture, dim screen and settings.

- Settings is a bottom sheet. The existing microphone panel, recording controls,
  health line, status line and Disconnect are moved into it (not copied) and
  returned when the session ends, so errors stay visible on the ended page.
- Hide picture disables the outgoing video track; the PC receives black frames.
  `window.extrudaVideoHidden` keeps a new track hidden after a camera switch or
  restart before it is sent.
- Dim screen is a black, tappable cover. The existing screen wake lock stays held.
- Resolution: the phone sends `capture-request` with one of the five Windows
  sizes. Only hosts that advertise `resolutionControl` (approval and
  `capture-size` messages) receive it, because older hosts close the control
  channel on unknown message types. The PC applies its own rules (not while
  recording or mid-change) and answers with `capture-size`; a refusal returns
  the current size with `refused: true`. Hosted phone page and Windows app must
  both be updated before the phone selector becomes active.
- Icons: 26A `camera-switch`, `microphone`, `microphone-off`, `eye-off`, `moon`,
  `settings` and `close`; the first four were added to the identity package.

## Windows receiver layout and fullscreen

The native receiver follows the same order as the session: a four-step bar
(scan, approve the code, camera running, choose in meeting app) sits above the
video stage. Step 2 follows the approval dialog; step 4 stays current until
"Det har jeg gjort" is chosen in the stage hint, which is remembered locally.
The connected view puts the processed Windows output in the middle with a
"Live · Windows-kamera" chip, a recording chip and a resolution chip that opens
the toolbar selector. Controls below are grouped as Picture (resolution, edit
picture), Sound (microphone, input meter, noise reduction) and Record, followed
by Settings and Disconnect. The former "Settings and details" disclosure is a
right-hand panel with Picture, Sound, Recording and Connection sections; Escape
or the close button returns focus to Settings.

Fullscreen covers the video stage only. Use the stage button, F11 or a
double-click; Escape, F11 or a double-click leaves. Chips and the button fade
after 2.5 seconds without mouse movement, while the recording chip stays
visible. WebView2 reports the fullscreen element to the host, which removes the
window frame and covers the current monitor, then restores the previous window
placement. Disconnecting leaves fullscreen and closes the settings panel. The
old "Vis kun video" mode is hidden. New 26A icons: fullscreen, fullscreen-exit.
