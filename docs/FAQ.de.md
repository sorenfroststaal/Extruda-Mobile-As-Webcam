# FAQ und Anleitungen

[Dansk](FAQ.da.md) · [English](FAQ.en.md) · [Deutsch](FAQ.de.md) · [Français](FAQ.fr.md)

[Sicherheitsrisiken](SECURITY.de.md)

## Wie fange ich an?

Installiere die App unter Windows 11 x64. Öffne sie und scanne den QR-Code mit dem Telefon im selben WLAN. Vergleiche den sechsstelligen Code und bestätige am PC. Erlaube den Kamerazugriff am Telefon. Lass beide Anwendungen geöffnet.

Während der Verbindung kannst du am Telefon Frontkamera oder Rückkamera wählen. Das Video kann beim Wechsel kurz pausieren; Mikrofon und Kopplung bleiben erhalten. Kann die Kamera nicht geöffnet werden, versucht die App, die vorherige Kamera wiederherzustellen.

## iPhone: Wie erlaube ich die Kamera?

Öffne den Kopplungslink in Safari und wähle Erlauben, wenn die Seite Kamerazugriff anfordert. Nach einer Ablehnung: Seitenmenü an der Adressleiste → Website-Einstellungen → Kamera → Fragen oder Erlauben. Lade neu; scanne bei abgelaufener Kopplung einen neuen QR-Code.

Fehlt die Einstellung, prüfe Einstellungen → Apps → Safari → Kamera (älteres iOS: Einstellungen → Safari). Behalte Fragen als allgemeine Einstellung und erlaube nur die gewünschte Seite. Andere Browser benötigen eventuell auch eine Freigabe unter Einstellungen → Datenschutz & Sicherheit → Kamera. Menünamen variieren je nach Version. Tippe auf Kamera starten, falls der Browser einen weiteren Tipp verlangt.

[Apple · Safari](https://support.apple.com/guide/iphone/browse-the-web-privately-iphb01fc3c85/ios) · [Apple · iPhone](https://support.apple.com/guide/iphone/iph168c4bbd5/ios)

## Android: Wie erlaube ich die Kamera?

Öffne den Link in Chrome und erlaube die Kamera auf Nachfrage. Bei einer Sperre: Chrome → ⋮ → Einstellungen → Website-Einstellungen → Kamera. Wähle die blockierte Seite und erlaube sie. Prüfe auch Android → Einstellungen → Apps → Chrome → Berechtigungen → Kamera → Nur während der Nutzung zulassen. Lade neu oder scanne einen neuen QR-Code. Menünamen variieren nach Gerät und Version.

[Google · Chrome](https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DAndroid&hl=en)

## Wie wähle ich die Kamera in Teams?

Verbinde zuerst das Telefon. In Teams am PC: Einstellungen → Geräte → Kamera → extruda - mobile as webcam wählen. Der Name kann Auflösung und Windows Virtual Camera enthalten. Im Meeting kannst du den Pfeil neben dem Kamerasymbol zur Auswahl verwenden. Schalte Video ein. Fehlt die Kamera, starte Teams neu und lass Extruda geöffnet.

[Microsoft · Teams](https://support.microsoft.com/en-us/teams/notifications-settings/manage-your-device-settings-in-microsoft-teams)

## Wie wähle ich die Kamera in Zoom?

Verbinde zuerst das Telefon. In Zoom am PC: Einstellungen → Video & Effekte (oder Video) → Kamera → extruda - mobile as webcam. Im Meeting: Pfeil neben Video → Kamera auswählen und Video starten. Starte Zoom neu, falls sie fehlt. Zoom und Meeting-Einstellungen können die tatsächliche Auflösung begrenzen.

[Zoom · Video](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061836)

## Andere Programme und eine fehlende Kamera

Wähle extruda - mobile as webcam in den Kameraeinstellungen des Programms. Eine Meeting-Webseite braucht ebenfalls Kamerazugriff. Unter Windows: Einstellungen → Datenschutz & Sicherheit → Kamera → Kamerazugriff und Zugriff für Desktop-Apps aktivieren. Firmen-PCs können durch IT-Richtlinien eingeschränkt sein. Nicht alle Programme sind garantiert kompatibel; diese Version hat keinen Empfänger für macOS oder Linux.

[Microsoft · Camera](https://support.microsoft.com/en-us/teams/meetings/my-camera-isn-t-working-in-microsoft-teams)

## QR-Code abgelaufen oder Verbindung fehlgeschlagen

Eine Einladung gilt 10 Minuten. Brich ab und erstelle eine neue Kopplung oder öffne die App erneut. Nutze dasselbe normale WLAN; Gastnetze können Geräte isolieren. VPN oder Firewall können WebRTC blockieren. Probiere ein vertrauenswürdiges Netz, ohne den Schutz allgemein abzuschalten. Öffne den Link in Safari oder Chrome statt im integrierten Scanner-Browser. Fehler 429 bedeutet zu viele Versuche: warten und erneut versuchen.

## Auflösung, schwarzes Bild und Ruckeln

Die App startet mit 1920 × 1080. Nach dem Verbinden stehen 480p, 720p, 1080p, 1440p und 4K zur Wahl. Telefon oder Meeting-App können weniger liefern. Nach einem Wechsel musst du die Kamera eventuell in Teams oder Zoom neu wählen. Bei Ruckeln: 720p versuchen, näher zum Router gehen und für gutes Licht sorgen. Lass die Telefonseite im Vordergrund und den Bildschirm an; Sperre, Hintergrundbetrieb, Wärme und Energiesparen können Video unterbrechen. Schließe andere Kamera-Apps und versuche Kamera starten oder eine neue Kopplung.

## Internet, Ton, Aufnahme und sicheres Beenden

Diese Version braucht Internet für Telefon-Client und Kopplung, auch im selben WLAN. Video und optionales Mikrofon-Audio laufen direkt über WebRTC; Cloudflare leitet keine Medien weiter. Das Mikrofon ist bei jeder neuen Verbindung aus und benötigt einen Tipp sowie die Browser-Erlaubnis am Telefon. Die App nimmt nicht auf, aber Meeting-Apps und Empfänger können Bild und Ton speichern. Nach Gebrauch trennen und beide Seiten schließen. QR-Code oder Link nie teilen. Siehe Sicherheitsrisiken.

## Sprache, Design und Updates

Die Weltkugel wählt Dänisch, Englisch, Deutsch oder Französisch. Die Sonne wählt hell, dunkel oder automatisch. Automatisch folgt Systemsprache und Erscheinungsbild; am Telefon kommen die Spracheinstellungen aus dem Browser. Manuelle Auswahl wird pro Gerät gespeichert. Aktualisiere die Windows-App über die GitHub Releases des Projekts und schließe sie vor der Installation. Neuladen aktualisiert den Telefon-Client. Der Installer ist unsigniert; prüfe die Quelle vor der Administratorfreigabe.

## Ist es Open Source, und darf ich es ändern und teilen?

Ja. Der Projektcode steht unter der MIT-Lizenz: Du darfst ihn nutzen, kopieren, ändern, veröffentlichen, teilen und verkaufen, auch kommerziell. Behalte Copyright- und Lizenzhinweis in Kopien oder wesentlichen Teilen bei. Die Software wird ohne Gewährleistung bereitgestellt. Fremdcode und Schriften haben eigene beiliegende Lizenzen; extruda-Logo und Markenmaterial fallen nicht unter die MIT-Lizenz des Codes.

[GitHub · Source](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam) · [MIT · LICENSE](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/blob/main/LICENSE)

## Ist das Programm vibe-gecodet?

Ja. Der Prototyp wurde mit KI-gestützter Programmierung (Vibe Coding) und Codex anhand der Wünsche des Eigentümers und fortlaufender Tests entwickelt. Code und Dokumentation können trotz bestandener automatisierter Tests Fehler oder übersehene Annahmen enthalten. Das ist keine unabhängige Codeprüfung oder Sicherheitszertifizierung. Nutze ihn als experimentelles Open-Source-Werkzeug und lies vorab die Sicherheitsrisiken.

## Fehler, Vorschläge und Mitarbeit

Erstelle ein GitHub-Issue mit App-Version, Windows-Version, Telefon/Browser und Schritten zum Nachstellen. Teile nie aktive Kopplungslinks, QR-Codes, Zugangsschlüssel oder private Kamerabilder. Code, Übersetzungen und Verbesserungen sind willkommen; es gibt keine garantierte Antwortzeit oder Supportzusage. Lies bei Sicherheitsfehlern SECURITY.md für einen privaten Kontaktweg, bevor du Details veröffentlichst.

[GitHub · Issues](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/issues) · [GitHub · Security](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/blob/main/SECURITY.md)

## Wie nutze ich das Telefon als Mikrofon?

Verbinde die Kamera und tippe am Telefon auf Mikrofon einschalten. Erlaube das Mikrofon in Safari oder Chrome; die Berechtigung liegt neben dem Kamerazugriff unter Mikrofon. Der PC kann Audio anfordern, aber nicht selbst erlauben. Ausschalten auf einem der Geräte stoppt den Ton; am Telefon wird auch die Mikrofonerfassung beendet. Der grüne Pegel zeigt das erfasste oder empfangene Signal, nicht ob Teams es tatsächlich nutzt.

Ein Windows-Mikrofon benötigt den separaten VB-CABLE-Treiber. Lade ihn nur von vb-audio.com, entpacke ihn und starte den Installer als Administrator. Danach neu starten. Wähle CABLE Input in Extruda und CABLE Output als Mikrofon in Teams oder Zoom. Dein Standardmikrofon wird nicht geändert. VB-CABLE ist Donationware eines Drittanbieters mit eigener Lizenz; es gehört nicht zum MIT-Code und wird nicht automatisch installiert. Ohne Treiber funktioniert die Pegelanzeige, aber der Ton steht nicht als Windows-Mikrofon zur Wahl.

Ist Steam Streaming Microphone bereits installiert, kannst du es statt VB-CABLE wählen. Wähle denselben Mikrofonnamen in Teams oder Zoom. Der Sendepegel startet für Steam niedriger, um dessen Verstärkung auszugleichen; bei leisem oder verzerrtem Ton unter Audioeinstellungen anpassen. Das virtuelle Gerät nicht als Windows-Standardlautsprecher festlegen.

Wenn kein unterstütztes Audiogerät gefunden wird, bietet die App den VB-CABLE-Download des Herstellers, eine erneute Suche oder Nur Kamera verwenden an. Der Kameramodus wird am PC gespeichert und blendet die Mikrofontaste auf beiden Geräten aus. Erneut aktivieren unter Information → Mikrofon einrichten. Der Treiber wird separat heruntergeladen und installiert; Extruda umgeht keine Windows-Bestätigung.

[VB-Audio · VB-CABLE](https://vb-audio.com/Cable/)

## Wie prüfe ich die Verbindung?

Öffne Information → Verbindung prüfen. Neue Videobilder, Mikrofonsignal und Windows-Bestätigungen werden getrennt angezeigt. Fünf Sekunden ohne neue Videobilder lösen eine Warnung aus; die Windows-App löscht ein eingefrorenes Bild. Stille allein ist kein Netzwerkfehler. Windows-Bestätigungen zeigen, dass die Windows-Komponente Daten angenommen hat, nicht dass Teams, Zoom oder OBS das richtige Gerät gewählt hat.

Eine kurze Netzwerkunterbrechung erhält bis zu 15 Sekunden zur Wiederherstellung. Das Telefon versucht einen ICE-Neustart, wenn die Signalisierung noch verfügbar ist. Eine abgelaufene Einladung, ein unerreichbares Netzwerk oder ein längerer Ausfall kann einen neuen QR-Code erfordern. Nach einer Unterbrechung am Telefon musst du eventuell die Seite öffnen oder Kamera starten antippen. Die Mikrofonfreigabe erteilst weiterhin du am Telefon.

Fehlerbericht kopieren erstellt lokal einen Bericht nur mit Version, Zuständen und Zählern. Er enthält keine Bilder, Audiodaten, IP-Adressen, Gerätenamen, Browserkennungen, Kopplungslinks oder Schlüssel. Er wird nie automatisch gesendet und zur Prüfung vor dem Teilen angezeigt.

## Bildausschnitt, Mikrofontest und Qualität

Während der Verbindung stehen die Windows-Steuerelemente neben einer begrenzten Vorschau. Ganzes Bild anzeigen erhält das Motiv mit Rändern; Bild füllen schneidet die Mitte bildfüllend zu. Drehung gilt für Vorschau und Windows-Kamera. Die Auswahl wird am PC gespeichert. Bei kleinen Fenstern kann Scrollen nötig sein. Audioeinstellungen öffnen sich in einem separaten Dialog.

Mikrofon an · Stille ist normal und kein Berechtigungsfehler. Die Anzeige nutzt eine dB-Skala. Schalte das Mikrofon ein, wähle Mikrofon testen und sprich fünf Sekunden normal zum Telefon. Der Test beurteilt Pegel und mögliche starke Spitzen; er erkennt keine Sprache und speichert keinen Ton. Am PC zeigt er auch, ob Windows Audiodaten angenommen hat. Er misst keinen Ton in Teams, Zoom oder OBS und ändert den Sendepegel nicht automatisch.

Windows-Auflösung ist die Ausgabegröße der virtuellen Kamera. Empfangen zeigt tatsächliche Videogröße, Bildrate und Bitrate; Telefon oder WebRTC können geringere Qualität liefern. Verbindung prüfen zeigt Video und Audio getrennt mit Bitrate, Paketverlust und Jitter über etwa fünf Sekunden. — bedeutet noch nicht gemessen. Zähler werden bei neuen Sitzungen oder längeren Messpausen zurückgesetzt. Berichte enthalten weiterhin keine Medien, Adressen, Gerätenamen oder Kopplungsschlüssel.
