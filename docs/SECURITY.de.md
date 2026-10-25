# Bekannte Sicherheitsrisiken

[Dansk](SECURITY.da.md) · [English](SECURITY.en.md) · [Deutsch](SECURITY.de.md) · [Français](SECURITY.fr.md)

> **Prototyp: Nicht für sensible Situationen verwenden. Verschlüsselung schützt nicht vor kompromittierten Telefonen, PCs oder Client-Code.**

## Hosting und Client-Code

**Hohe Folgen bei Kompromittierung**

Der Telefon-Client wird von Cloudflare geladen. Kompromittierter Hosting- oder Deployment-Zugriff kann den Client verändern und Video offenlegen. Die lokale Windows-Oberfläche reduziert diese Abhängigkeit am PC, schützt aber nicht den Telefon-Client.

<!-- plain:start -->
**Einfach erklärt**

Die Kameraseite auf deinem Telefon kommt von unserer Website. Wer den Zugang zum Ändern der Website übernimmt, könnte auch das Verhalten der Seite ändern.

**Was das für dich bedeuten kann**

Im schlimmsten Fall könnte ein Angreifer die Seite dazu bringen, dein Kamerabild während der Nutzung an andere zu senden. Verschlüsselung hilft nicht, wenn die Seite selbst verändert wurde.
<!-- plain:end -->

## Installation und Downloads

**Hohe Folgen bei Kompromittierung**

Das Installationsprogramm ist nicht signiert und benötigt Administratorfreigabe. Ein gefälschtes oder ersetztes Programm kann den PC kompromittieren. Nur aus dem offiziellen GitHub Release herunterladen. Eine Prüfsumme im selben Konto schützt nicht vor Übernahme des gesamten Kontos.

<!-- plain:start -->
**Einfach erklärt**

Du erlaubst dem Installationsprogramm, Windows zu ändern. Windows kann den Herausgeber noch nicht anhand einer digitalen Signatur bestätigen.

**Was das für dich bedeuten kann**

Eine gefälschte Kopie könnte im schlimmsten Fall Schadsoftware installieren, Dateien stehlen oder den PC übernehmen. Nutze den offiziellen GitHub-Download des Projekts; der richtige Dateiname beweist nicht, dass eine Datei echt ist.
<!-- plain:end -->

## Zugriff auf den QR-Code

**Sorgfältige Benutzerbestätigung erforderlich**

QR-Code und Kopplungslink enthalten Zugangsschlüssel. Nicht teilen oder veröffentlichen. Einmalige Schlüssel, Ablaufzeit und Vergleichscode verringern das Risiko; ein geleakter Link und eine falsche Bestätigung können dennoch das falsche Gerät verbinden. Der Code ist kein Konto-Login und keine Identitätsgarantie.

<!-- plain:start -->
**Einfach erklärt**

Der QR-Code ist eine vorübergehende Einladung mit einem geheimen Schlüssel. Wer ein Bild davon oder den Link erhält, kann versuchen, die Einladung zu nutzen.

**Was das für dich bedeuten kann**

Wenn du zusätzlich bestätigst, ohne den Code auf beiden Geräten zu vergleichen, könntest du ein fremdes Gerät verbinden. Dann könnten Bilder vom falschen Telefon in deinem Meeting erscheinen. Ein geleakter QR-Code allein gibt keinen Zugriff auf deine Telefonkamera; teile ihn trotzdem nie.
<!-- plain:end -->

## Kompromittierte Geräte

**Hohe Folgen bei Kompromittierung**

Malware, Administratoren oder Personen mit Zugriff auf ein entsperrtes Telefon oder einen PC können Bildschirm, Schlüssel oder Video lesen. Transportverschlüsselung schützt keine kompromittierten Endgeräte. Diesen Prototyp nicht einsetzen, wenn ein Videoleck schwerwiegende Folgen hätte.

<!-- plain:start -->
**Einfach erklärt**

Wenn Telefon oder PC bereits Schadsoftware enthalten oder jemand dein entsperrtes Gerät benutzen kann, könnte diese Person sehen, was du siehst.

**Was das für dich bedeuten kann**

Private Bilder, Kopplungsschlüssel oder Bildschirminhalte könnten ohne dein Wissen kopiert werden. Die Verschlüsselung der App macht ein bereits übernommenes Gerät nicht wieder sicher.
<!-- plain:end -->

## Lokaler Bildpuffer

**Lokales Zugriffsrisiko**

Dekodierte Bilder laufen durch eine temporäre Datei unter ProgramData. Sie ist zugriffsgeschützt, wird geleert und beim Schließen gelöscht, liegt aber nicht ausschließlich in anonymem RAM. Prozesse desselben Benutzers oder mit ausreichenden Systemrechten können Zugriff erhalten. Löschen garantiert kein sicheres Überschreiben von Datenträger- oder Auslagerungsdateidaten.

<!-- plain:start -->
**Einfach erklärt**

Um Video als Windows-Kamera bereitzustellen, legt die App Bilder kurzzeitig in einer geschützten temporären Datei auf dem PC ab. Das ist keine normale Videoaufnahme, aber die Bilder liegen kurz außerhalb der App vor.

**Was das für dich bedeuten kann**

Ein anderes Programm mit deinen Benutzerrechten oder Administratorzugriff könnte die Bilder kopieren. Auch nach dem Löschen können Spuren auf dem Speicher bleiben. Vermeide Bilder, bei denen schon ein mögliches Leck schwerwiegend wäre.
<!-- plain:end -->

## Verfügbarkeit und Missbrauch

**Verbleibendes Risiko**

Server- und Nachrichtenlimits begrenzen Missbrauch, aber Anfragen erreichen weiterhin Cloudflare. Größere Angriffe können Kontingente aufbrauchen und neue Kopplungen blockieren. Ein bereits gekoppeltes bösartiges Gerät kann die Sitzung ebenfalls stören. Dies allein gibt Außenstehenden keinen Zugriff auf Video.

<!-- plain:start -->
**Einfach erklärt**

Die Kopplung nutzt einen gemeinsamen Onlinedienst mit begrenzter Kapazität. Viele Anfragen oder Missbrauch können ihn vorübergehend unerreichbar machen.

**Was das für dich bedeuten kann**

Du könntest kurz vor einem Meeting dein Telefon nicht verbinden können. Auch eine Sitzung kann unterbrochen oder gestört werden. Ein Ausfall bedeutet für sich genommen nicht, dass jemand deine Bilder gesehen hat; halte eventuell die normale PC-Webcam als Ersatz bereit.
<!-- plain:end -->

## Verbindungsdaten und lokales Netzwerk

**Datenschutzgrenze**

Cloudflare und GitHub können IP-Adressen und technische Verbindungsdaten verarbeiten. WebRTC tauscht Netzwerkinformationen zwischen Geräten aus. Kein Benutzerkonto ist erforderlich, der Dienst ist aber nicht anonym. Dasselbe WLAN ist keine Sicherheitsgarantie; Gastnetztrennung, Firewalls und Unterbrechungen können die Verbindung blockieren.

<!-- plain:start -->
**Einfach erklärt**

Auch ohne Anmeldung hinterlässt die Nutzung technische Spuren, etwa deine Internetadresse. Zwei Geräte im selben WLAN können außerdem daran gehindert sein, miteinander zu kommunizieren.

**Was das für dich bedeuten kann**

Dienstanbieter können Verbindungsinformationen haben; die Lösung macht dich nicht anonym. Gast-WLAN oder Netzwerkregeln können die Kopplung verhindern. Diese Verbindungsdaten sind nicht dasselbe wie Zugriff auf das Kamerabild selbst.
<!-- plain:end -->

## Kamerazugriff und Aufzeichnung durch den Empfänger

**Aufmerksamkeit erforderlich**

Die Kamera versucht nach PC-Bestätigung zu starten, sobald die Browserfreigabe vorliegt. Kameraanzeige beachten und nach Gebrauch trennen. Die App kann lokal am PC aufnehmen; Besprechungsprogramme, Bildschirmaufzeichnung oder der gekoppelte Empfänger können das Bild dennoch speichern. Verschlüsselung kann das nicht verhindern.

<!-- plain:start -->
**Einfach erklärt**

Sobald du am PC bestätigst und dem Browser Kamerazugriff erlaubt hast, versucht das Telefon Video zu senden. Ein Programm oder eine Person, die das Bild am PC sehen kann, kann es speichern.

**Was das für dich bedeuten kann**

Du könntest versehentlich einen privaten Raum oder Personen zeigen, die du nicht filmen wolltest. Bilder können aufgezeichnet oder weitergegeben werden, mit Extrudas Aufnahmetaste oder anderer Software. Richte die Kamera vor der Bestätigung richtig aus und trenne die Verbindung und schließe die Seite danach.
<!-- plain:end -->

## Unbekannte Fehler und Updates

**Nicht unabhängig sicherheitsgeprüft**

Funktionstests und eine npm-Prüfung ersetzen weder Penetrationstests noch Fuzzing und bieten keine Garantie. Native C++-, WebView2- und Systemkomponenten können unbekannte Fehler enthalten; schwere Fehler können möglicherweise einen Prozess kompromittieren. Windows, Browser und App aktuell halten. Der Telefon-Client wird online aktualisiert; die lokale Windows-Oberfläche benötigt eine neue App-Version.

<!-- plain:start -->
**Einfach erklärt**

Wir haben bestimmte Funktionen getestet, aber kein unabhängiger Experte hat die gesamte Lösung auf Sicherheitslücken geprüft. Es kann weiterhin unbekannte Fehler geben.

**Was das für dich bedeuten kann**

Ein Fehler kann ein schwarzes Bild oder einen Absturz verursachen. Eine schwere Sicherheitslücke könnte im schlimmsten Fall das Lesen von Daten oder das Ausführen schädlichen Codes ermöglichen. Das sind mögliche Folgen, keine Behauptung, dass eine solche Lücke gefunden wurde. Halte App, Windows und Browser aktuell.
<!-- plain:end -->

## KI-gestützte Entwicklung

Der Prototyp wurde mit KI-Unterstützung und Codex vibe-gecodet. Automatisierte und fortlaufende Tests können Fehler und falsche Annahmen in Code und Dokumentation übersehen. Es gibt keine unabhängige Sicherheitszertifizierung oder Gewährleistung. Lies auch [FAQ und Anleitungen](FAQ.de.md) und die [Hinweise zur Meldung von Sicherheitsfehlern](../SECURITY.md).

<!-- plain:start -->
**Einfach erklärt**

KI hat beim Schreiben des Programms und der Anleitungen geholfen. KI kann etwas erzeugen, das richtig aussieht und dennoch Fehler enthält.

**Was das für dich bedeuten kann**

Eine Anleitung könnte ein falsches Menü nennen, eine Funktion könnte versagen oder eine Sicherheitslücke übersehen worden sein. Ein bestandener Test oder überzeugender Text beweist keine Sicherheit. Vermeide den Einsatz, wenn ein Bildleck oder Ausfall ernste Folgen hätte.
<!-- plain:end -->

## Mikrofon-Audio und virtueller Audiotreiber

Das Mikrofon ist bei jeder neuen Verbindung aus und wird am Telefon mit separater Browser-Erlaubnis eingeschaltet. Audio wird per WebRTC verschlüsselt und über begrenzte Speicherpuffer an ein ausgewähltes, bereits installiertes virtuelles Audiogerät geleitet. Die App ändert keine Standardgeräte und installiert keinen Audiotreiber automatisch. Steam Streaming Microphone oder VB-CABLE ist Drittsoftware mit eigener Lizenz und Sicherheitsrisiken. Ein neuer Treiber benötigt Administratorfreigabe und eventuell einen Neustart.

<!-- plain:start -->
**Einfach erklärt**

Wenn du das Mikrofon einschaltest, kann es auch andere Personen und Geräusche im Raum erfassen. Das virtuelle Mikrofon ist eine gemeinsame Audioverbindung in Windows, die auch andere Programme nutzen können.

**Was das für dich bedeuten kann**

Private Gespräche können von einer Meeting-App oder einer anderen App mit Zugriff auf das virtuelle Mikrofon gehört oder aufgenommen werden. Senden andere Programme an dasselbe virtuelle Gerät, kann ihr Ton beigemischt werden. Schalte das Mikrofon danach aus; ein grüner Pegel bedeutet Signal in der App, nicht dass nur Teams mithört. Treiber nur vom offiziellen Anbieter beziehen und das virtuelle Kabel nicht zum Standardlautsprecher machen.
<!-- plain:end -->

## Lokale Aufnahmen und Telefonsteuerung

Aufnahmen werden unverschlüsselt im gewählten Ordner gespeichert. OneDrive oder andere Software kann Ordner synchronisieren. Die App lädt Aufnahmen nicht hoch. Telefonbefehle werden nur in der bestätigten Kopplung akzeptiert; der Start erfordert Auswahl und Bestätigung am PC. Das gekoppelte Telefon kann pausieren, fortsetzen und stoppen. Ein kompromittiertes gekoppeltes Gerät kann dies missbrauchen. Fehler oder Abstürze können unvollständige .partial-Dateien hinterlassen. Nur mit Zustimmung der Beteiligten aufnehmen.



Lokale KI-Rauschunterdrückung sendet keinen Ton an einen Cloud-Dienst. Sie kann Stimmen verändern, leise Sprache entfernen und verzögern. Bei Fehlern kehrt die App zum Originalton zurück; eine kurze Pause ist möglich. Gefilterte Aufnahmen enthalten keine separate Originalspur.



Der freiwillige Hörtest hält höchstens 10 Sekunden Original und bearbeitete Sprache im Arbeitsspeicher. Keine Testdatei und kein Upload. Schließen, Stummschalten, Trennen oder Filterfehler beendet die Wiedergabe und gibt Audiodaten frei; dies garantiert kein sicheres Löschen von RAM oder Windows-Auslagerungsdatei. Nutze Kopfhörer, damit das Telefon die Wiedergabe nicht erfasst.

<!-- plain:start -->
**Einfach erklärt**

Beim Aufnehmen werden Video und optionaler Mikrofonton zu einer echten Datei. Sie verschwindet nicht beim Ende der Kopplung. Die Telefontasten steuern den gekoppelten PC und sind kein öffentlicher Link.

**Was das für dich bedeuten kann**

Wer Zugriff auf PC, Sicherung oder synchronisierten Ordner hat, kann die Aufnahme lesen. Aufnahmen können den Datenträger füllen oder durch Abstürze beschädigt werden. Speicherort sorgfältig wählen, Kopplung privat halten und die gespeicherte Datei vor dem Löschen anderer Kopien prüfen. Lokale KI-Rauschunterdrückung sendet keinen Ton an einen Cloud-Dienst. Sie kann Stimmen verändern, leise Sprache entfernen und verzögern. Bei Fehlern kehrt die App zum Originalton zurück; eine kurze Pause ist möglich. Gefilterte Aufnahmen enthalten keine separate Originalspur. Der freiwillige Hörtest hält höchstens 10 Sekunden Original und bearbeitete Sprache im Arbeitsspeicher. Keine Testdatei und kein Upload. Schließen, Stummschalten, Trennen oder Filterfehler beendet die Wiedergabe und gibt Audiodaten frei; dies garantiert kein sicheres Löschen von RAM oder Windows-Auslagerungsdatei. Nutze Kopfhörer, damit das Telefon die Wiedergabe nicht erfasst.
<!-- plain:end -->

[Technical review](../SECURITY-REVIEW.md) · [Releases](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/releases)
