# Bekannte Sicherheitsrisiken

[Dansk](SECURITY.da.md) · [English](SECURITY.en.md) · [Deutsch](SECURITY.de.md) · [Français](SECURITY.fr.md)

> **Prototyp: Nicht für sensible Situationen verwenden. Verschlüsselung schützt nicht vor kompromittierten Telefonen, PCs oder Client-Code.**

## Hosting und Client-Code

**Hohe Folgen bei Kompromittierung**

Der Telefon-Client wird von Cloudflare geladen. Kompromittierter Hosting- oder Deployment-Zugriff kann den Client verändern und Video offenlegen. Die lokale Windows-Oberfläche reduziert diese Abhängigkeit am PC, schützt aber nicht den Telefon-Client.

## Installation und Downloads

**Hohe Folgen bei Kompromittierung**

Das Installationsprogramm ist nicht signiert und benötigt Administratorfreigabe. Ein gefälschtes oder ersetztes Programm kann den PC kompromittieren. Nur aus dem offiziellen GitHub Release herunterladen. Eine Prüfsumme im selben Konto schützt nicht vor Übernahme des gesamten Kontos.

## Zugriff auf den QR-Code

**Sorgfältige Benutzerbestätigung erforderlich**

QR-Code und Kopplungslink enthalten Zugangsschlüssel. Nicht teilen oder veröffentlichen. Einmalige Schlüssel, Ablaufzeit und Vergleichscode verringern das Risiko; ein geleakter Link und eine falsche Bestätigung können dennoch das falsche Gerät verbinden. Der Code ist kein Konto-Login und keine Identitätsgarantie.

## Kompromittierte Geräte

**Hohe Folgen bei Kompromittierung**

Malware, Administratoren oder Personen mit Zugriff auf ein entsperrtes Telefon oder einen PC können Bildschirm, Schlüssel oder Video lesen. Transportverschlüsselung schützt keine kompromittierten Endgeräte. Diesen Prototyp nicht einsetzen, wenn ein Videoleck schwerwiegende Folgen hätte.

## Lokaler Bildpuffer

**Lokales Zugriffsrisiko**

Dekodierte Bilder laufen durch eine temporäre Datei unter ProgramData. Sie ist zugriffsgeschützt, wird geleert und beim Schließen gelöscht, liegt aber nicht ausschließlich in anonymem RAM. Prozesse desselben Benutzers oder mit ausreichenden Systemrechten können Zugriff erhalten. Löschen garantiert kein sicheres Überschreiben von Datenträger- oder Auslagerungsdateidaten.

## Verfügbarkeit und Missbrauch

**Verbleibendes Risiko**

Server- und Nachrichtenlimits begrenzen Missbrauch, aber Anfragen erreichen weiterhin Cloudflare. Größere Angriffe können Kontingente aufbrauchen und neue Kopplungen blockieren. Ein bereits gekoppeltes bösartiges Gerät kann die Sitzung ebenfalls stören. Dies allein gibt Außenstehenden keinen Zugriff auf Video.

## Verbindungsdaten und lokales Netzwerk

**Datenschutzgrenze**

Cloudflare und GitHub können IP-Adressen und technische Verbindungsdaten verarbeiten. WebRTC tauscht Netzwerkinformationen zwischen Geräten aus. Kein Benutzerkonto ist erforderlich, der Dienst ist aber nicht anonym. Dasselbe WLAN ist keine Sicherheitsgarantie; Gastnetztrennung, Firewalls und Unterbrechungen können die Verbindung blockieren.

## Kamerazugriff und Aufzeichnung durch den Empfänger

**Aufmerksamkeit erforderlich**

Die Kamera versucht nach PC-Bestätigung zu starten, sobald die Browserfreigabe vorliegt. Kameraanzeige beachten und nach Gebrauch trennen. Die App hat keine Aufnahmefunktion; Besprechungsprogramme, Bildschirmaufzeichnung oder der gekoppelte Empfänger können das Bild dennoch speichern. Verschlüsselung kann das nicht verhindern.

## Unbekannte Fehler und Updates

**Nicht unabhängig sicherheitsgeprüft**

Funktionstests und eine npm-Prüfung ersetzen weder Penetrationstests noch Fuzzing und bieten keine Garantie. Native C++-, WebView2- und Systemkomponenten können unbekannte Fehler enthalten; schwere Fehler können möglicherweise einen Prozess kompromittieren. Windows, Browser und App aktuell halten. Der Telefon-Client wird online aktualisiert; die lokale Windows-Oberfläche benötigt eine neue App-Version.

[Technical review](../SECURITY-REVIEW.md) · [Releases](https://github.com/sorenfroststaal/Extruda-Phone-As-Webcam/releases)
