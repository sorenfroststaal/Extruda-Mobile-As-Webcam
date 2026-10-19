# Kendte sikkerhedsrisici

[Dansk](SECURITY.da.md) · [English](SECURITY.en.md) · [Deutsch](SECURITY.de.md) · [Français](SECURITY.fr.md)

> **Prototype: brug ikke løsningen til følsomme situationer. Kryptering beskytter ikke mod en kompromitteret telefon, pc eller klientkode.**

## Hosting og klientkode

**Høj konsekvens ved kompromis**

Telefonklienten hentes fra Cloudflare. Overtages hosting- eller deployadgang, kan klienten ændres og videobilleder lækkes. Den lokale Windows-brugerflade reducerer denne afhængighed på pc’en, men beskytter ikke telefonklienten.

## Installation og downloads

**Høj konsekvens ved kompromis**

Installationen er usigneret og kræver administratorgodkendelse. En falsk eller erstattet installer kan kompromittere pc’en. Hent kun fra projektets officielle GitHub Release. En kontrolsum på samme konto beskytter ikke mod overtagelse af hele kontoen.

## Adgang til QR-koden

**Kræver korrekt brugerbekræftelse**

QR-koden og parringslinket indeholder adgangsnøgler. Del eller offentliggør dem ikke. Engangsnøgler, udløb og sammenligningskode mindsker risikoen, men en lækket invitation og fejlagtig accept kan stadig forbinde den forkerte enhed. Koden er ikke et login eller en garanti for identitet.

## Kompromitterede enheder

**Høj konsekvens ved kompromis**

Malware, administratorer eller en person med adgang til en ulåst telefon eller pc kan læse skærm, nøgler eller video. Kryptering under transport beskytter ikke kompromitterede endepunkter. Brug ikke prototypen, hvis et lækket kamerabillede ville have alvorlige konsekvenser.

## Lokal billedbuffer

**Lokal adgangsrisiko**

Afkodede billeder passerer en midlertidig fil under ProgramData. Den har adgangskontrol, nulstilles og slettes ved lukning, men er ikke kun i anonym RAM. Processer med samme bruger eller tilstrækkelige systemrettigheder kan få adgang. Sletning garanterer ikke sikker overskrivning af disk- eller pagefiledata.

## Driftsstop og misbrug

**Resterende risiko**

Server- og beskedgrænser dæmper misbrug, men forespørgsler rammer stadig Cloudflare. Et større angreb kan opbruge kvoter og blokere nye parringer. En allerede parret ondsindet enhed kan også afbryde eller forstyrre sessionen. Det giver ikke i sig selv en fremmed adgang til videoen.

## Forbindelsesdata og lokalt netværk

**Privatlivsbegrænsning**

Cloudflare og GitHub kan behandle IP-adresser og tekniske forbindelsesdata. WebRTC udveksler netværksoplysninger mellem enhederne. Der kræves ingen brugerkonto, men løsningen er ikke anonym. Samme Wi-Fi er ikke en sikkerhedsgaranti; gæstenetværk, firewall og afbrydelser kan blokere forbindelsen.

## Kameraadgang og utilsigtet optagelse hos modparten

**Kræver opmærksomhed**

Kameraet forsøger at starte efter pc-accept, når browserens tilladelse er givet. Hold øje med kameraindikatoren, og afbryd efter brug. Appen har ingen optagefunktion, men mødeprogrammer, skærmoptagelse eller den parrede modpart kan gemme billedet. Vi kan ikke forhindre det med kryptering.

## Ukendte fejl og opdateringer

**Ikke uafhængigt sikkerhedsgodkendt**

Funktionstest og et npm-opslag er ikke en penetrationstest, fuzz-test eller garanti. Native C++-, WebView2- og systemkomponenter kan have ukendte fejl; alvorlige fejl kan potentielt kompromittere en proces. Hold Windows, browser og app opdateret. Telefonklienten opdateres online; den lokale Windows-brugerflade kræver en ny appversion.

[Technical review](../SECURITY-REVIEW.md) · [Releases](https://github.com/sorenfroststaal/Extruda-Phone-As-Webcam/releases)
