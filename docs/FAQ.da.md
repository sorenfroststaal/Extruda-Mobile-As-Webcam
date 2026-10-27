# FAQ og vejledninger

[Dansk](FAQ.da.md) · [English](FAQ.en.md) · [Deutsch](FAQ.de.md) · [Français](FAQ.fr.md)

[Sikkerhedsrisici](SECURITY.da.md)

## Hvor er de øvrige kontroller?

Når telefonen er forbundet, vises opløsning, lyd til/fra, en lille lydinputmåler, optag og afbryd. Når lyden er slået til, vises også en checkbox til lydrensning. Lydmåleren viser telefonens input før rensning; stilhed er ikke i sig selv en fejl.

Åbn Indstillinger og detaljer nederst for billedtilpasning, rotation, lydindstillinger, test og forbindelsesdetaljer. Menuen er lukket som udgangspunkt. Under optagelse vises Pause og Stop og gem. Start af optagelse kræver stadig valg og filplacering på pc’en.

## Telefonsiden blev lukket — hvordan forbinder jeg igen?

Pc-appen opretter automatisk en ny QR-kode, når telefonsiden lukkes eller forbindelsen afsluttes. Scan den nye kode og sammenlign og acceptér den nye sekscifrede kode på pc’en. Den gamle QR-kode er en engangsinvitation og kan ikke genbruges. Ved korte netværksudfald forsøges genoprettelse i op til 15 sekunder. Trykker du selv Annuller på pc’en, starter parringen ikke automatisk igen.

På telefonen står Annuller ved parringskoden. Under parringen skjules de tekniske felter og den gentagne status nederst. Fejl vises stadig, hvis forbindelsen ikke kan oprettes.

## Hvordan kommer jeg i gang?

Installér appen på Windows 11 x64. Åbn den, og scan QR-koden med telefonen på samme Wi-Fi. Sammenlign den sekscifrede kode, og acceptér på pc’en. Tillad kameraet på telefonen. Hold begge programmer åbne.

Under forbindelsen kan du vælge Frontkamera eller Bagkamera på telefonen. Videoen kan holde en kort pause under skiftet; mikrofon og parring bevares. Hvis kameraet ikke kan åbnes, forsøger appen at gendanne det tidligere kamera.

## iPhone: hvordan tillader jeg kameraet?

Åbn parringslinket i Safari, og vælg Tillad, når siden beder om kameraadgang. Ved en tidligere afvisning: åbn sidemenuen ved adresselinjen → Webstedsindstillinger → Kamera → Spørg eller Tillad. Genindlæs siden; scan en ny QR-kode, hvis parringen er udløbet.

Hvis indstillingen mangler, se Indstillinger → Apps → Safari → Kamera (på ældre iOS: Indstillinger → Safari). Behold Spørg som generel indstilling, og tillad kun den ønskede side. Andre browsere kan også kræve tilladelse under Indstillinger → Anonymitet og sikkerhed → Kamera. Menunavne varierer efter version. Tryk Start kamera, hvis browseren kræver et ekstra tryk.

[Apple · Safari](https://support.apple.com/guide/iphone/browse-the-web-privately-iphb01fc3c85/ios) · [Apple · iPhone](https://support.apple.com/guide/iphone/iph168c4bbd5/ios)

## Android: hvordan tillader jeg kameraet?

Åbn linket i Chrome, og tillad kameraet, når du bliver spurgt. Ved blokering: Chrome → ⋮ → Indstillinger → Websiteindstillinger → Kamera. Find siden blandt blokerede sider, og tillad den. Tjek også Android → Indstillinger → Apps → Chrome → Tilladelser → Kamera → Tillad, mens appen bruges. Genindlæs siden eller scan en ny QR-kode. Menunavne varierer efter telefon og version.

[Google · Chrome](https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DAndroid&hl=en)

## Hvordan vælger jeg kameraet i Teams?

Forbind telefonen først. I Teams på pc: Indstillinger → Enheder → Kamera → vælg extruda - mobile as webcam. Navnet kan indeholde opløsning og Windows Virtual Camera. Under et møde kan du bruge pilen ved kameraikonet til at vælge kamera. Tænd videoen. Hvis kameraet mangler, genstart Teams, mens Extruda er åben.

[Microsoft · Teams](https://support.microsoft.com/en-us/teams/notifications-settings/manage-your-device-settings-in-microsoft-teams)

## Hvordan vælger jeg kameraet i Zoom?

Forbind telefonen først. I Zoom på pc: Indstillinger → Video og effekter (eller Video) → Kamera → extruda - mobile as webcam. I et møde: pilen ved Video → vælg kameraet, og start video. Genstart Zoom, hvis kameraet ikke er på listen. Zoom og mødeindstillinger kan begrænse den faktiske opløsning.

[Zoom · Video](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061836)

## Andre programmer og et kamera, der mangler

Vælg extruda - mobile as webcam i programmets kameraindstillinger. I en browser skal mødesiden også have kameratilladelse. På Windows: Indstillinger → Beskyttelse af personlige oplysninger og sikkerhed → Kamera → slå kameraadgang og adgang for skrivebordsapps til. Arbejds-pc’er kan være begrænset af IT. Kompatibilitet er ikke garanteret i alle programmer; macOS og Linux har ingen modtagerapp i denne version.

[Microsoft · Camera](https://support.microsoft.com/en-us/teams/meetings/my-camera-isn-t-working-in-microsoft-teams)

## QR-koden er udløbet, eller forbindelsen fejler

En invitation gælder i 10 minutter. Annullér, og opret en ny parring eller genåbn appen. Brug samme almindelige Wi-Fi; gæstenetværk kan isolere enhederne. VPN eller firewall kan blokere WebRTC. Prøv et betroet netværk uden at slå sikkerhedsbeskyttelsen generelt fra. Åbn linket i Safari eller Chrome, ikke i en indbygget scannerbrowser. En fejl 429 betyder for mange forsøg: vent, og prøv igen.

## Opløsning, sort billede og hakken

Appen starter i 1920 × 1080. Når forbindelsen er aktiv, kan du vælge 480p, 720p, 1080p, 1440p eller 4K. Telefonen eller mødeprogrammet kan levere mindre. Efter et skift skal kameraet muligvis vælges igen i Teams eller Zoom. Ved hakken: vælg 720p, kom tættere på routeren, og sørg for god belysning. Hold telefonsiden forrest og skærmen tændt; skærmlås, baggrundstilstand, varme og strømbesparelse kan afbryde video. Luk andre kameraapps, og prøv Start kamera eller en ny parring.

## Internet, lyd, optagelse og sikker afslutning

Denne version kræver internet til telefonklient og parring, selv på samme Wi-Fi. Video og valgfri mikrofonlyd sendes direkte med WebRTC; Cloudflare er ikke medieserver. Mikrofonen er fra ved hver ny forbindelse og kræver et tryk og browserens tilladelse på telefonen. Appen kan optage lokalt på pc’en, og mødeprogrammer og modtagere kan gemme både billede og lyd. Afbryd og luk begge sider efter brug. Del aldrig QR-koden eller linket. Se Sikkerhedsrisici.

## Sprog, tema og opdateringer

Globusikonet vælger dansk, engelsk, tysk eller fransk. Solikonet vælger lyst, mørkt eller automatisk tema. Automatisk følger systemets sprog og farvetema; telefonens sprog læses fra browserens præferencer. Manuelle valg gemmes på hver enhed. Opdatér Windows-appen via projektets GitHub Releases, og luk appen før installation. Telefonklienten opdateres ved genindlæsning. Installeren er usigneret; kontrollér kilden før administratorgodkendelse.

## Er det open source, og må jeg ændre og dele det?

Ja. Projektets kode er udgivet under MIT-licensen: du må bruge, kopiere, ændre, udgive, dele og sælge den, også kommercielt. Bevar copyright- og licensteksten i kopier eller væsentlige dele. Softwaren leveres uden garanti. Tredjepartskode og skrifttyper har deres egne medfølgende licenser; extruda-logo og brandmateriale er ikke omfattet af kodens MIT-licens.

[GitHub · Source](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam) · [MIT · LICENSE](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/blob/main/LICENSE)

## Er programmet vibe-kodet?

Ja. Prototypen er udviklet med AI-assisteret programmering (vibe coding) og Codex ud fra ejerens ønsker og løbende afprøvning. Kode og dokumentation kan indeholde fejl eller oversete antagelser, også når automatiske tests består. Det er ikke en uafhængig kodegennemgang eller sikkerhedsgodkendelse. Brug den som et eksperimentelt open source-værktøj, og læs sikkerhedsrisiciene før brug.

## Fejl, forslag og hjælp til projektet

Opret et GitHub-issue med appversion, Windows-version, telefon/browser og trin til at genskabe fejlen. Del aldrig et aktivt parringslink, QR-kode, adgangsnøgler eller private kamerabilleder. Kodebidrag, oversættelser og forbedringer er velkomne; ingen svartid eller supportgaranti loves. Ved en sikkerhedsfejl: læs SECURITY.md for en privat kontaktvej, før detaljer offentliggøres.

[GitHub · Issues](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/issues) · [GitHub · Security](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/blob/main/SECURITY.md)

## Hvordan bruger jeg telefonen som mikrofon?

Forbind kameraet, og tryk Slå mikrofon til på telefonen. Tillad mikrofonen i Safari eller Chrome; tilladelsen administreres samme sted som kameraadgang, men under Mikrofon. Pc-knappen kan bede telefonen om lyd, men kan ikke selv give tilladelsen. Slå fra-knappen på begge enheder stopper lyden; på telefonen stoppes også selve mikrofonoptagelsen. Den grønne niveaumåler viser det opfangede eller modtagne signal, ikke om Teams faktisk bruger det.

Windows-mikrofon kræver den separate VB-CABLE-driver. Hent den kun fra vb-audio.com, udpak, og kør installationsprogrammet som administrator. Genstart efter installation. Vælg CABLE Input i Extruda og CABLE Output som mikrofon i Teams eller Zoom. Det ændrer ikke din standardmikrofon. VB-CABLE er donationsbaseret tredjepartssoftware med egen licens; den er ikke en del af projektets MIT-kode og installeres ikke automatisk. Uden driveren virker niveauindikatoren, men lyden kan ikke vælges som Windows-mikrofon.

Har du allerede Steam Streaming Microphone, kan du vælge den i stedet for VB-CABLE. Vælg samme mikrofonnavn i Teams eller Zoom. Sendestyrken starter lavere for Steam for at modvirke dens forstærkning; justér under Lydindstillinger, hvis lyden er lav eller forvrænget. Slå ikke Windows’ standardhøjttaler over på den virtuelle lydenhed.

Hvis ingen understøttet lydenhed findes, tilbyder appen et link til producentens VB-CABLE-installation, en ny søgning eller Brug kun kamera. Valget Kun kamera huskes på pc’en og skjuler mikrofonknappen på begge enheder. Gendan funktionen under Information → Mikrofonopsætning. Driveren hentes og installeres separat; Extruda omgår ikke Windows’ godkendelse.

[VB-Audio · VB-CABLE](https://vb-audio.com/Cable/)

## Hvordan kontrollerer jeg forbindelsen?

Åbn Information → Kontrollér forbindelse. Kontrollen viser nye videobilleder, mikrofonsignal og Windows-bekræftelser separat. Fem sekunder uden nye videobilleder udløser en advarsel, og Windows-appen rydder et fastfrosset billede. Stilhed er ikke i sig selv en netværksfejl. Windows-bekræftelser betyder, at data er accepteret af appens Windows-del; de beviser ikke, at Teams, Zoom eller OBS har valgt den rigtige enhed.

Et kort netværksudfald får op til 15 sekunder til at rette sig. Telefonen forsøger én ICE-genstart, hvis parringsserveren stadig er tilgængelig. En udløbet invitation, skift til et utilgængeligt netværk eller et længere udfald kan kræve en ny QR-kode. En afbrydelse på telefonen kan kræve, at du åbner siden igen eller trykker Start kamera. Mikrofonadgang gives fortsat af dig på telefonen.

Kopiér fejlrapport opretter kun en lokal rapport med version, tilstande og tællere. Rapporten indeholder ikke billeder, lyd, IP-adresser, enhedsnavne, browseridentifikatorer, parringslink eller nøgler. Den sendes ingen steder automatisk. Rapporten vises, så du kan kontrollere den før deling.

## Billedtilpasning, mikrofontest og kvalitet

Under en forbindelse er Windows-kontrollerne samlet ved siden af et afgrænset videofelt. Vis hele billedet bevarer hele motivet med kanter; Fyld billedet beskærer midten, så billedet fylder. Rotation drejer både forhåndsvisning og Windows-kamera. Valgene huskes på pc’en. På små vinduer kan scrolling fortsat være nødvendig. Lydindstillinger åbnes i en separat dialog.

Mikrofon til · Der er stille er en normal tilstand, ikke en tilladelsesfejl. Niveaumåleren bruger en dB-skala. Slå mikrofonen til, vælg Test mikrofon og tal normalt mod telefonen i fem sekunder. Testen vurderer signalniveau og mulige kraftige spidser; den genkender ikke tale og gemmer ingen lyd. På pc’en angives også, om Windows accepterede lyddata. Testen måler ikke lyden i Teams, Zoom eller OBS og ændrer ikke automatisk sendestyrken.

Windows-opløsning er størrelsen på det virtuelle kameraoutput. Modtaget viser den faktiske videostørrelse, billedhastighed og bitrate; telefonen eller WebRTC kan levere en lavere kvalitet. Kontrollér forbindelse viser desuden video og lyd separat med bitrate, pakketab og jitter over de seneste cirka fem sekunder. — betyder endnu ikke målt. Tællere nulstilles ved en ny session eller et længere måleophold. Fejlrapporten indeholder fortsat ingen medier, adresser, enhedsnavne eller parringsnøgler.

## Hvordan optager jeg video på pc’en?

Forbind telefonen, og vælg Optag video i Windows-appen. Kvalitetsskyderen vælger et mål for opløsning, billedhastighed og bitrate og viser en anslået filstørrelse pr. minut. Vælg fil og start åbner Windows’ gem-dialog. Videoen skrives løbende til den valgte mappe; den uploades ikke af appen. En mappe under OneDrive eller andre synkroniseringstjenester kan dog blive uploadet af disse tjenester.

Avanceret giver format (automatisk, MP4 eller WebM), codec (H.264, VP8 eller VP9), opløsning, 15/24/25/30 fps, video- og lyd-bitrate, optagelydens forstærkning, ønsket keyframeinterval og valgfrit automatisk stop efter et antal minutter. Understøttelse afhænger af WebView2 og pc’en. Bitrate og filstørrelse er vejledende; højere indstillinger skaber ikke detaljer, som telefonen ikke sender. Windows-kameraets opløsning låses under optagelsen. Beskæring og rotation følger det viste kameraoutput.

Medtag mikrofon optager kun telefonens lyd, mens mikrofonen er tilladt og slået til. Den lokale optagelse kræver ikke en virtuel lyddriver. Den optager ikke Teams-, Zoom-, OBS- eller systemlyd. Pause og fortsæt beholder samme fil. Stop og gem færdiggør den. Ved afbrydelse eller lukning forsøger appen at stoppe og gemme. Der skrives først til en midlertidig .partial-fil i samme mappe; en eksisterende målfil erstattes først efter vellykket færdiggørelse. Et nedbrud, diskfejl eller for langsom lagring kan give en ufuldstændig fil, som ikke nødvendigvis kan afspilles.

På en understøttet Windows-version af Extruda vises optageknapper også på den parrede telefon. Start åbner indstillinger og gem-dialog på pc’en og kræver din bekræftelse dér. Derefter kan telefonen pause, fortsætte og stoppe. Kommandoerne bruger den eksisterende godkendte, krypterede forbindelse; der oprettes ikke et offentligt optagelink eller en ny serverport. Ingen filstier sendes til telefonen. En kompromitteret parret enhed kan stadig misbruge styringen. Opdatér begge klienter ved manglende knapper. Optag kun med de medvirkendes accept.

## Hvordan virker lokal AI-støjreduktion?

Åbn Lydindstillinger i Windows-appen, og slå Lokal AI-støjreduktion til. DeepFilterNet renser telefonens lyd lokalt på pc’en med en indbygget model. Funktionen kræver ingen konto, upload eller internet til lydrensningen. Parring bruger stadig den eksisterende onlineserver. Funktionen er slået fra ved hver opstart.

Rensningen gælder både den virtuelle mikrofon og optagelser med mikrofon. Niveaumåleren viser det oprindelige input. Filteret kan give forsinkelse, ændre stemmen eller fjerne lav tale. Prøv først en kort optagelse. En optagelse med filter indeholder den rensede lyd uden et separat originalspor. Eksisterende filer ændres ikke. Hvis filteret stopper eller svarer for langsomt, vises en advarsel, og original lyd genoptages; der kan være en kort pause.

Støjreduktionens status vises på hovedskærmen sammen med målere før og efter behandling. Styrke vælger en maksimal dæmpning fra 6 til 60 dB. Mere dæmpning er ikke altid bedre for stemmen. Ved fejl forsøger appen én genstart med original lyd imens; ved endnu en fejl bruges original lyd, og årsagen vises. Ingen nye lydblokke er i sig selv ikke en fejl. Lyttetest holder højst 10 sekunders original og renset lyd i hukommelsen efter dit tryk på Start. Begge afspilles med samme lave afspilningsniveau. Brug hovedtelefoner. Lukning, mute, afbrudt forbindelse eller filterfejl frigiver testlyden. Der oprettes ingen fil eller upload.

[DeepFilterNet](https://github.com/Rikorose/DeepFilterNet)

## Hvad beskytter sikkerhedsopdateringen?

Billedbufferen bruger nu en privat mappe pr. bruger/session og en tilfældig 256-bit adgangsnøgle. Kendskab til filnavnet alene giver ikke videobilleder. Buffere uden eller med forkert nøgle afvises eller giver sort billede. Almindelige programmer under samme bruger og Windows-tjenester er fortsat en tillidsgrænse.

Begrænsning af nye parringer sker pr. kilde uden en fælles tæller, som andre kan opbruge. IPv6-adresser grupperes pr. /64-netværk. Delte offentlige IP-adresser deler fortsat grænser, og store angreb kan ramme Cloudflares platformkvoter.

DeepFilterNet kører i en Windows AppContainer uden netværks-, kamera- eller mikrofonkapabiliteter, med loft over hukommelse og antal processer. Kan sandboxen ikke oprettes, bruges original lyd. Almindelig appdrift som administrator afvises.

Standardmappen til optagelser ligger lokalt under brugerens appdata og har private adgangsrettigheder. Nye optagelsesfiler gives adgang til brugeren og SYSTEM; under skrivning deles filhåndtaget ikke. Kendte OneDrive-placeringer og andre drev uden samme beskyttelse giver en advarsel. Appen forsøger at bevare mindst 128 MB ledig plads. Filer er stadig ukrypterede, og .partial-filer kan blive bevaret ved fejl.
