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
