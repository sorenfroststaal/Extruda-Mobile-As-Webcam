# Kendte sikkerhedsrisici

[Dansk](SECURITY.da.md) · [English](SECURITY.en.md) · [Deutsch](SECURITY.de.md) · [Français](SECURITY.fr.md)

> **Prototype: brug ikke løsningen til følsomme situationer. Kryptering beskytter ikke mod en kompromitteret telefon, pc eller klientkode.**

## Hosting og klientkode

**Høj konsekvens ved kompromis**

Telefonklienten hentes fra Cloudflare. Overtages hosting- eller deployadgang, kan klienten ændres og videobilleder lækkes. Den lokale Windows-brugerflade reducerer denne afhængighed på pc’en, men beskytter ikke telefonklienten.

<!-- plain:start -->
**Kort fortalt**

Telefonens kameraside leveres fra vores websted. Hvis nogen overtager adgangen til at ændre webstedet, kan de ændre, hvad siden gør.

**Det kan betyde for dig**

En angriber kan i værste fald få siden til at sende dit kamerabillede til andre, mens du bruger den. At forbindelsen er krypteret hjælper ikke, hvis selve siden er blevet ændret.
<!-- plain:end -->

## Installation og downloads

**Høj konsekvens ved kompromis**

Installationen er usigneret og kræver administratorgodkendelse. En falsk eller erstattet installer kan kompromittere pc’en. Hent kun fra projektets officielle GitHub Release. En kontrolsum på samme konto beskytter ikke mod overtagelse af hele kontoen.

<!-- plain:start -->
**Kort fortalt**

Du giver installationsprogrammet lov til at ændre Windows. Windows kan endnu ikke bekræfte udgiveren med en digital signatur.

**Det kan betyde for dig**

Henter du en falsk udgave, kan den i værste fald installere skadelig software, stjæle filer eller overtage pc’en. Brug projektets officielle GitHub-download; en fil med det rigtige navn er ikke i sig selv et bevis på, at den er ægte.
<!-- plain:end -->

## Adgang til QR-koden

**Kræver korrekt brugerbekræftelse**

QR-koden og parringslinket indeholder adgangsnøgler. Del eller offentliggør dem ikke. Engangsnøgler, udløb og sammenligningskode mindsker risikoen, men en lækket invitation og fejlagtig accept kan stadig forbinde den forkerte enhed. Koden er ikke et login eller en garanti for identitet.

<!-- plain:start -->
**Kort fortalt**

QR-koden er en midlertidig invitation med en hemmelig nøgle. En person, der får et billede af koden eller selve linket, kan forsøge at bruge invitationen.

**Det kan betyde for dig**

Hvis du samtidig accepterer uden at sammenligne koden på begge enheder, kan du forbinde en fremmed enhed. Det kan sende billeder fra en forkert telefon ind i dit møde. En lækket QR-kode giver ikke alene adgang til dit telefonkamera, men du bør aldrig dele den.
<!-- plain:end -->

## Kompromitterede enheder

**Høj konsekvens ved kompromis**

Malware, administratorer eller en person med adgang til en ulåst telefon eller pc kan læse skærm, nøgler eller video. Kryptering under transport beskytter ikke kompromitterede endepunkter. Brug ikke prototypen, hvis et lækket kamerabillede ville have alvorlige konsekvenser.

<!-- plain:start -->
**Kort fortalt**

Hvis telefonen eller pc’en allerede har skadelig software, eller nogen kan bruge din ulåste enhed, kan de muligvis se det samme som dig.

**Det kan betyde for dig**

Private billeder, parringsnøgler eller skærmens indhold kan blive kopieret uden din viden. Appens kryptering kan ikke gøre en allerede overtaget telefon eller pc sikker igen.
<!-- plain:end -->

## Lokal billedbuffer

**Lokal adgangsrisiko**

Afkodede billeder passerer en midlertidig fil under ProgramData. Den har adgangskontrol, nulstilles og slettes ved lukning, men er ikke kun i anonym RAM. Processer med samme bruger eller tilstrækkelige systemrettigheder kan få adgang. Sletning garanterer ikke sikker overskrivning af disk- eller pagefiledata.

<!-- plain:start -->
**Kort fortalt**

For at vise videoen som et Windows-kamera lægger appen kortvarigt billeder i en beskyttet, midlertidig fil på pc’en. Det er ikke en almindelig videooptagelse, men billederne findes kortvarigt uden for selve appen.

**Det kan betyde for dig**

Et andet program med dine brugerrettigheder eller administratoradgang kan muligvis kopiere billederne. Der kan også være rester på lageret, selv efter filen er slettet. Brug derfor ikke løsningen til billeder, hvor selv et muligt læk vil være alvorligt.
<!-- plain:end -->

## Driftsstop og misbrug

**Resterende risiko**

Server- og beskedgrænser dæmper misbrug, men forespørgsler rammer stadig Cloudflare. Et større angreb kan opbruge kvoter og blokere nye parringer. En allerede parret ondsindet enhed kan også afbryde eller forstyrre sessionen. Det giver ikke i sig selv en fremmed adgang til videoen.

<!-- plain:start -->
**Kort fortalt**

Parringen bruger en fælles onlinetjeneste med begrænset kapacitet. Mange forespørgsler eller misbrug kan gøre tjenesten midlertidigt utilgængelig.

**Det kan betyde for dig**

Du kan stå lige før et møde uden at kunne forbinde telefonen. En forbindelse kan også blive afbrudt eller forstyrret. Et driftsstop betyder ikke i sig selv, at nogen har set dine billeder; hav eventuelt pc’ens almindelige webcam som reserve.
<!-- plain:end -->

## Forbindelsesdata og lokalt netværk

**Privatlivsbegrænsning**

Cloudflare og GitHub kan behandle IP-adresser og tekniske forbindelsesdata. WebRTC udveksler netværksoplysninger mellem enhederne. Der kræves ingen brugerkonto, men løsningen er ikke anonym. Samme Wi-Fi er ikke en sikkerhedsgaranti; gæstenetværk, firewall og afbrydelser kan blokere forbindelsen.

<!-- plain:start -->
**Kort fortalt**

Selv uden login efterlader brugen tekniske spor, for eksempel din internetadresse. To enheder på samme Wi-Fi kan desuden være forhindret i at tale sammen.

**Det kan betyde for dig**

Tjenesteudbydere kan have oplysninger om forbindelsen, og løsningen gør dig ikke anonym. Gæste-Wi-Fi eller netværksregler kan få parringen til at fejle. Disse forbindelsesoplysninger er ikke det samme som adgang til selve kamerabilledet.
<!-- plain:end -->

## Kameraadgang og utilsigtet optagelse hos modparten

**Kræver opmærksomhed**

Kameraet forsøger at starte efter pc-accept, når browserens tilladelse er givet. Hold øje med kameraindikatoren, og afbryd efter brug. Appen kan optage lokalt på pc’en, og mødeprogrammer, skærmoptagelse eller den parrede modpart kan gemme billedet. Vi kan ikke forhindre det med kryptering.

<!-- plain:start -->
**Kort fortalt**

Når du accepterer på pc’en og har tilladt kameraet i browseren, forsøger telefonen at sende video. Et program eller en person, der kan se billedet på pc’en, kan gemme det.

**Det kan betyde for dig**

Du kan komme til at vise et privat rum eller personer, du ikke ønskede at filme. Billeder kan blive optaget eller delt videre, både med Extrudas optageknap og andre programmer. Ret kameraet rigtigt før accept, og afbryd og luk siden efter brug.
<!-- plain:end -->

## Ukendte fejl og opdateringer

**Ikke uafhængigt sikkerhedsgodkendt**

Funktionstest og et npm-opslag er ikke en penetrationstest, fuzz-test eller garanti. Native C++-, WebView2- og systemkomponenter kan have ukendte fejl; alvorlige fejl kan potentielt kompromittere en proces. Hold Windows, browser og app opdateret. Telefonklienten opdateres online; den lokale Windows-brugerflade kræver en ny appversion.

<!-- plain:start -->
**Kort fortalt**

Vi har afprøvet bestemte funktioner, men ingen uafhængig ekspert har gennemgået hele løsningen for sikkerhedshuller. Der kan stadig være fejl, vi ikke kender.

**Det kan betyde for dig**

En fejl kan give sort billede eller nedbrud. En alvorlig sikkerhedsfejl kan i værste fald lade en angriber læse data eller køre skadelig kode på en enhed. Det er mulige konsekvenser, ikke en konstatering af, at nogen har fundet et sådant hul. Hold app, Windows og browser opdateret.
<!-- plain:end -->

## Udvikling med AI

Prototypen er vibe-kodet med AI-assistance og Codex. Automatiske tests og løbende afprøvning kan overse fejl og forkerte antagelser i både kode og dokumentation. Der er ingen uafhængig sikkerhedsgodkendelse eller garanti. Læs også [FAQ og vejledninger](FAQ.da.md) og [rapportering af sikkerhedsfejl](../SECURITY.md).

<!-- plain:start -->
**Kort fortalt**

AI har hjulpet med at skrive programmet og vejledningerne. AI kan skrive noget, der ser rigtigt ud, men stadig indeholder fejl.

**Det kan betyde for dig**

En vejledning kan vise en forkert menu, en funktion kan svigte, eller en sikkerhedsfejl kan være overset. At en test består eller en tekst lyder overbevisende er ikke et bevis på sikkerhed. Undgå brug, hvor et lækket billede eller et driftsstop kan få alvorlige følger.
<!-- plain:end -->

## Mikrofonlyd og virtuel lyddriver

Mikrofonen er fra ved hver ny forbindelse og aktiveres på telefonen med særskilt browseradgang. Lyden sendes krypteret via WebRTC og føres i afgrænsede hukommelsesbuffere til en valgt, allerede installeret virtuel lydenhed. Appen ændrer ikke standardlydenheder og installerer ingen lyddriver automatisk. Steam Streaming Microphone eller VB-CABLE er tredjepartssoftware med egen licens og sikkerhedsrisiko. En ny driver kræver administratorgodkendelse og kan kræve genstart.

<!-- plain:start -->
**Kort fortalt**

Når du tænder mikrofonen, kan den også opfange andre personer og lyde i rummet. Den virtuelle mikrofon er en fælles lydforbindelse i Windows, som andre programmer også kan bruge.

**Det kan betyde for dig**

Private samtaler kan blive hørt eller optaget af et mødeprogram eller en anden app med adgang til den virtuelle mikrofon. Andre programmers lyd kan blandes ind, hvis de sender til samme virtuelle lydenhed. Slå mikrofonen fra efter brug; grøn niveauindikator betyder signal i appen, ikke at kun Teams kan høre det. Hent eventuelle drivere fra den officielle udgiver, og undlad at gøre det virtuelle kabel til pc’ens standardhøjttaler.
<!-- plain:end -->

## Lokale optagelser og mobilstyring

Optagelser gemmes ukrypteret i den mappe, du vælger. Mapper kan synkroniseres af OneDrive eller andre programmer. Appen uploader ikke optagelser. Optagekommandoer fra telefonen accepteres kun i den godkendte parring; start kræver valg og bekræftelse på pc’en. Pause, fortsæt og stop kan styres af den parrede telefon. En kompromitteret parret enhed kan misbruge disse funktioner. Diskfejl og nedbrud kan efterlade ufuldstændige .partial-filer. Optag kun med de medvirkendes accept.

<!-- plain:start -->
**Kort fortalt**

Når du trykker optag, bliver billede og eventuel mikrofonlyd til en rigtig videofil. Den forsvinder ikke, når parringen slutter. Telefonknapperne er en fjernbetjening til den parrede pc, ikke et offentligt link.

**Det kan betyde for dig**

Andre med adgang til pc’en, backup eller den synkroniserede mappe kan få adgang til optagelsen. En optagelse kan fylde disken eller blive beskadiget ved nedbrud. Vælg placeringen med omtanke, del ikke parringen, og kontrollér den gemte video, før du sletter en anden kopi.
<!-- plain:end -->

[Technical review](../SECURITY-REVIEW.md) · [Releases](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/releases)
