# FAQ og vejledninger

[Dansk](FAQ.da.md) · [English](FAQ.en.md) · [Deutsch](FAQ.de.md) · [Français](FAQ.fr.md)

[Sikkerhedsrisici](SECURITY.da.md)

## Hvordan kommer jeg i gang?

Installér appen på Windows 11 x64. Åbn den, og scan QR-koden med telefonen på samme Wi-Fi. Sammenlign den sekscifrede kode, og acceptér på pc’en. Tillad kameraet på telefonen. Hold begge programmer åbne.

## iPhone: hvordan tillader jeg kameraet?

Åbn parringslinket i Safari, og vælg Tillad, når siden beder om kameraadgang. Ved en tidligere afvisning: åbn sidemenuen ved adresselinjen → Webstedsindstillinger → Kamera → Spørg eller Tillad. Genindlæs siden; scan en ny QR-kode, hvis parringen er udløbet.

Hvis indstillingen mangler, se Indstillinger → Apps → Safari → Kamera (på ældre iOS: Indstillinger → Safari). Behold Spørg som generel indstilling, og tillad kun den ønskede side. Andre browsere kan også kræve tilladelse under Indstillinger → Anonymitet og sikkerhed → Kamera. Menunavne varierer efter version. Tryk Start kamera, hvis browseren kræver et ekstra tryk.

[Apple · Safari](https://support.apple.com/guide/iphone/browse-the-web-privately-iphb01fc3c85/ios) · [Apple · iPhone](https://support.apple.com/guide/iphone/iph168c4bbd5/ios)

## Android: hvordan tillader jeg kameraet?

Åbn linket i Chrome, og tillad kameraet, når du bliver spurgt. Ved blokering: Chrome → ⋮ → Indstillinger → Websiteindstillinger → Kamera. Find siden blandt blokerede sider, og tillad den. Tjek også Android → Indstillinger → Apps → Chrome → Tilladelser → Kamera → Tillad, mens appen bruges. Genindlæs siden eller scan en ny QR-kode. Menunavne varierer efter telefon og version.

[Google · Chrome](https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DAndroid&hl=en)

## Hvordan vælger jeg kameraet i Teams?

Forbind telefonen først. I Teams på pc: Indstillinger → Enheder → Kamera → vælg Extruda Phone Camera. Navnet kan indeholde opløsning og Windows Virtual Camera. Under et møde kan du bruge pilen ved kameraikonet til at vælge kamera. Tænd videoen. Hvis kameraet mangler, genstart Teams, mens Extruda er åben.

[Microsoft · Teams](https://support.microsoft.com/en-us/teams/notifications-settings/manage-your-device-settings-in-microsoft-teams)

## Hvordan vælger jeg kameraet i Zoom?

Forbind telefonen først. I Zoom på pc: Indstillinger → Video og effekter (eller Video) → Kamera → Extruda Phone Camera. I et møde: pilen ved Video → vælg kameraet, og start video. Genstart Zoom, hvis kameraet ikke er på listen. Zoom og mødeindstillinger kan begrænse den faktiske opløsning.

[Zoom · Video](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061836)

## Andre programmer og et kamera, der mangler

Vælg Extruda Phone Camera i programmets kameraindstillinger. I en browser skal mødesiden også have kameratilladelse. På Windows: Indstillinger → Beskyttelse af personlige oplysninger og sikkerhed → Kamera → slå kameraadgang og adgang for skrivebordsapps til. Arbejds-pc’er kan være begrænset af IT. Kompatibilitet er ikke garanteret i alle programmer; macOS og Linux har ingen modtagerapp i denne version.

[Microsoft · Camera](https://support.microsoft.com/en-us/teams/meetings/my-camera-isn-t-working-in-microsoft-teams)

## QR-koden er udløbet, eller forbindelsen fejler

En invitation gælder i 10 minutter. Annullér, og opret en ny parring eller genåbn appen. Brug samme almindelige Wi-Fi; gæstenetværk kan isolere enhederne. VPN eller firewall kan blokere WebRTC. Prøv et betroet netværk uden at slå sikkerhedsbeskyttelsen generelt fra. Åbn linket i Safari eller Chrome, ikke i en indbygget scannerbrowser. En fejl 429 betyder for mange forsøg: vent, og prøv igen.

## Opløsning, sort billede og hakken

Appen starter i 1920 × 1080. Når forbindelsen er aktiv, kan du vælge 480p, 720p, 1080p, 1440p eller 4K. Telefonen eller mødeprogrammet kan levere mindre. Efter et skift skal kameraet muligvis vælges igen i Teams eller Zoom. Ved hakken: vælg 720p, kom tættere på routeren, og sørg for god belysning. Hold telefonsiden forrest og skærmen tændt; skærmlås, baggrundstilstand, varme og strømbesparelse kan afbryde video. Luk andre kameraapps, og prøv Start kamera eller en ny parring.

## Internet, lyd, optagelse og sikker afslutning

Denne version kræver internet til telefonklient og parring, selv på samme Wi-Fi. Video sendes direkte mellem enhederne med WebRTC; Cloudflare er parringsserver, ikke videorelæ. Der er ingen mikrofon eller optagefunktion: vælg pc’ens eller headsettets mikrofon i mødeprogrammet. Modtageren eller mødeprogrammet kan stadig optage billedet. Tryk Afbryd/Annuller, luk telefonsiden og appen efter brug. Del aldrig QR-koden eller linket. Se Sikkerhedsrisici for alle kendte begrænsninger.

## Sprog, tema og opdateringer

Globusikonet vælger dansk, engelsk, tysk eller fransk. Solikonet vælger lyst, mørkt eller automatisk tema. Automatisk følger systemets sprog og farvetema; telefonens sprog læses fra browserens præferencer. Manuelle valg gemmes på hver enhed. Opdatér Windows-appen via projektets GitHub Releases, og luk appen før installation. Telefonklienten opdateres ved genindlæsning. Installeren er usigneret; kontrollér kilden før administratorgodkendelse.

## Er det open source, og må jeg ændre og dele det?

Ja. Projektets kode er udgivet under MIT-licensen: du må bruge, kopiere, ændre, udgive, dele og sælge den, også kommercielt. Bevar copyright- og licensteksten i kopier eller væsentlige dele. Softwaren leveres uden garanti. Tredjepartskode og skrifttyper har deres egne medfølgende licenser; extruda-logo og brandmateriale er ikke omfattet af kodens MIT-licens.

[GitHub · Source](https://github.com/sorenfroststaal/Extruda-Phone-As-Webcam) · [MIT · LICENSE](https://github.com/sorenfroststaal/Extruda-Phone-As-Webcam/blob/main/LICENSE)

## Er programmet vibe-kodet?

Ja. Prototypen er udviklet med AI-assisteret programmering (vibe coding) og Codex ud fra ejerens ønsker og løbende afprøvning. Kode og dokumentation kan indeholde fejl eller oversete antagelser, også når automatiske tests består. Det er ikke en uafhængig kodegennemgang eller sikkerhedsgodkendelse. Brug den som et eksperimentelt open source-værktøj, og læs sikkerhedsrisiciene før brug.

## Fejl, forslag og hjælp til projektet

Opret et GitHub-issue med appversion, Windows-version, telefon/browser og trin til at genskabe fejlen. Del aldrig et aktivt parringslink, QR-kode, adgangsnøgler eller private kamerabilleder. Kodebidrag, oversættelser og forbedringer er velkomne; ingen svartid eller supportgaranti loves. Ved en sikkerhedsfejl: læs SECURITY.md for en privat kontaktvej, før detaljer offentliggøres.

[GitHub · Issues](https://github.com/sorenfroststaal/Extruda-Phone-As-Webcam/issues) · [GitHub · Security](https://github.com/sorenfroststaal/Extruda-Phone-As-Webcam/blob/main/SECURITY.md)
