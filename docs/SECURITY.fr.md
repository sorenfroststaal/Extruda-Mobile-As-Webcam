# Risques de sécurité connus

[Dansk](SECURITY.da.md) · [English](SECURITY.en.md) · [Deutsch](SECURITY.de.md) · [Français](SECURITY.fr.md)

> **Prototype : évitez les situations sensibles. Le chiffrement ne protège pas contre un téléphone, un PC ou un code client compromis.**

## Hébergement et code client

**Impact élevé en cas de compromission**

Le client du téléphone est chargé depuis Cloudflare. Un accès à l’hébergement ou au déploiement compromis peut modifier le client et divulguer la vidéo. L’interface Windows locale réduit cette dépendance sur le PC, mais ne protège pas le client du téléphone.

<!-- plain:start -->
**En termes simples**

La page caméra de votre téléphone vient de notre site. Une personne qui prend le contrôle des accès permettant de modifier le site pourrait changer son fonctionnement.

**Ce que cela peut entraîner pour vous**

Dans le pire des cas, un attaquant pourrait faire envoyer votre image à d’autres personnes pendant l’utilisation. Le chiffrement ne protège pas si la page elle-même a été modifiée.
<!-- plain:end -->

## Installation et téléchargements

**Impact élevé en cas de compromission**

L’installateur n’est pas signé et demande une autorisation administrateur. Un installateur falsifié ou remplacé peut compromettre le PC. Téléchargez uniquement la version GitHub officielle du projet. Une somme de contrôle sur le même compte ne protège pas contre la prise de contrôle de ce compte.

<!-- plain:start -->
**En termes simples**

Vous autorisez l’installateur à modifier Windows. Windows ne peut pas encore vérifier son éditeur au moyen d’une signature numérique.

**Ce que cela peut entraîner pour vous**

Une fausse copie pourrait, dans le pire des cas, installer un logiciel malveillant, voler des fichiers ou prendre le contrôle du PC. Utilisez le téléchargement GitHub officiel du projet ; le bon nom de fichier ne suffit pas à prouver son authenticité.
<!-- plain:end -->

## Accès au code QR

**Confirmation attentive nécessaire**

Le code QR et le lien contiennent des secrets d’accès. Ne les partagez ni ne les publiez. Les jetons uniques, l’expiration et le code de comparaison réduisent le risque, mais une invitation divulguée et une acceptation erronée peuvent connecter le mauvais appareil. Le code n’est ni un compte ni une garantie d’identité.

<!-- plain:start -->
**En termes simples**

Le QR code est une invitation temporaire contenant une clé secrète. Une personne qui en obtient une photo ou le lien peut essayer d’utiliser cette invitation.

**Ce que cela peut entraîner pour vous**

Si vous acceptez aussi sans comparer le code sur les deux appareils, vous pourriez connecter un appareil inconnu. Les images du mauvais téléphone pourraient apparaître dans votre réunion. Un QR code divulgué ne donne pas à lui seul accès à votre caméra, mais ne le partagez jamais.
<!-- plain:end -->

## Appareils compromis

**Impact élevé en cas de compromission**

Des logiciels malveillants, des administrateurs ou une personne ayant accès à un téléphone ou PC déverrouillé peuvent lire l’écran, les clés ou la vidéo. Le chiffrement en transit ne protège pas les appareils compromis. N’utilisez pas ce prototype si une fuite vidéo aurait des conséquences graves.

<!-- plain:start -->
**En termes simples**

Si le téléphone ou le PC contient déjà un logiciel malveillant, ou si quelqu’un peut utiliser votre appareil déverrouillé, cette personne pourrait voir ce que vous voyez.

**Ce que cela peut entraîner pour vous**

Des images privées, secrets de jumelage ou contenus d’écran pourraient être copiés à votre insu. Le chiffrement de l’application ne peut pas rendre sûr un appareil déjà compromis.
<!-- plain:end -->

## Tampon vidéo local

**Risque d’accès local**

Les images décodées passent par un fichier temporaire sous ProgramData. Il est protégé, effacé puis supprimé à la fermeture, mais ne réside pas uniquement en mémoire anonyme. Des processus du même utilisateur ou disposant de privilèges système suffisants peuvent y accéder. La suppression ne garantit pas l’effacement sécurisé du disque ou du fichier d’échange.

<!-- plain:start -->
**En termes simples**

Pour fournir une caméra Windows, l’application place brièvement les images dans un fichier temporaire protégé sur le PC. Ce n’est pas un enregistrement vidéo habituel, mais les images existent brièvement hors de l’application.

**Ce que cela peut entraîner pour vous**

Un autre programme disposant de vos droits utilisateur ou d’un accès administrateur pourrait copier les images. Des traces peuvent aussi subsister sur le stockage après suppression. Évitez les images dont une fuite, même possible, aurait de graves conséquences.
<!-- plain:end -->

## Disponibilité et abus

**Risque résiduel**

Les limites de serveur et de messages réduisent les abus, mais les requêtes atteignent toujours Cloudflare. Une attaque importante peut épuiser les quotas et bloquer de nouveaux jumelages. Un appareil malveillant déjà jumelé peut aussi perturber la session. Cela ne donne pas, à lui seul, accès à la vidéo à un tiers.

<!-- plain:start -->
**En termes simples**

Le jumelage utilise un service en ligne partagé à capacité limitée. Trop de requêtes ou des abus peuvent le rendre temporairement indisponible.

**Ce que cela peut entraîner pour vous**

Vous pourriez ne pas pouvoir connecter le téléphone juste avant une réunion. Une session peut aussi être interrompue ou perturbée. Une panne ne signifie pas en soi que quelqu’un a vu vos images ; gardez éventuellement la webcam habituelle du PC en secours.
<!-- plain:end -->

## Métadonnées et réseau local

**Limite de confidentialité**

Cloudflare et GitHub peuvent traiter des adresses IP et des données techniques de connexion. WebRTC échange des informations réseau entre les appareils. Aucun compte n’est requis, mais le service n’est pas anonyme. Un Wi-Fi commun n’est pas une garantie de sécurité ; l’isolation des invités, les pare-feu et les interruptions peuvent bloquer la connexion.

<!-- plain:start -->
**En termes simples**

Même sans compte, l’utilisation laisse des traces techniques, comme votre adresse internet. Deux appareils sur le même Wi-Fi peuvent aussi être empêchés de communiquer.

**Ce que cela peut entraîner pour vous**

Les prestataires peuvent disposer d’informations de connexion ; la solution ne vous rend pas anonyme. Le Wi-Fi invité ou les règles réseau peuvent empêcher le jumelage. Ces informations ne donnent pas, à elles seules, accès à l’image de la caméra.
<!-- plain:end -->

## Autorisation caméra et enregistrement par le destinataire

**Vigilance nécessaire**

La caméra tente de démarrer après l’acceptation sur le PC et l’autorisation du navigateur. Surveillez l’indicateur et déconnectez après utilisation. Cette application n’enregistre pas, mais les applications de réunion, la capture d’écran ou le destinataire jumelé peuvent conserver l’image. Le chiffrement ne l’empêche pas.

<!-- plain:start -->
**En termes simples**

Après votre acceptation sur le PC et l’autorisation caméra dans le navigateur, le téléphone tente d’envoyer la vidéo. Une application ou une personne pouvant voir l’image sur le PC peut la sauvegarder.

**Ce que cela peut entraîner pour vous**

Vous pourriez montrer par erreur une pièce privée ou des personnes que vous ne souhaitiez pas filmer. Les images peuvent être enregistrées ou repartagées même sans bouton d’enregistrement dans Extruda. Orientez la caméra avant d’accepter, puis déconnectez et fermez la page après usage.
<!-- plain:end -->

## Failles inconnues et mises à jour

**Pas d’audit de sécurité indépendant**

Les tests fonctionnels et la recherche d’alertes npm ne constituent ni un test d’intrusion, ni du fuzzing, ni une garantie. Les composants C++ natifs, WebView2 et système peuvent contenir des failles inconnues ; des failles graves pourraient compromettre un processus. Maintenez Windows, le navigateur et l’application à jour. Le client du téléphone se met à jour en ligne ; l’interface Windows locale nécessite une nouvelle version.

<!-- plain:start -->
**En termes simples**

Nous avons testé certaines fonctions, mais aucun expert indépendant n’a examiné toute la solution pour rechercher des failles. Des défauts inconnus peuvent subsister.

**Ce que cela peut entraîner pour vous**

Un bug peut provoquer une image noire ou un plantage. Dans le pire des cas, une faille grave pourrait permettre de lire des données ou d’exécuter du code malveillant sur un appareil. Ce sont des conséquences possibles, pas l’affirmation qu’une telle faille a été trouvée. Maintenez l’application, Windows et le navigateur à jour.
<!-- plain:end -->

## Développement assisté par IA

Le prototype est « vibe codé » avec l’assistance de l’IA et Codex. Les tests automatisés et successifs peuvent manquer des erreurs et hypothèses incorrectes dans le code et la documentation. Aucune certification indépendante ni garantie n’est fournie. Consultez aussi la [FAQ et les guides](FAQ.fr.md) et la [procédure de signalement](../SECURITY.md).

<!-- plain:start -->
**En termes simples**

L’IA a aidé à écrire le programme et ses guides. Elle peut produire un résultat qui semble correct tout en contenant des erreurs.

**Ce que cela peut entraîner pour vous**

Un guide peut indiquer le mauvais menu, une fonction peut échouer ou une faille peut avoir été oubliée. Un test réussi ou un texte convaincant ne prouve pas la sécurité. Évitez les usages où une fuite d’image ou une panne aurait de graves conséquences.
<!-- plain:end -->

## Audio microphone et pilote audio virtuel

Le microphone est désactivé à chaque nouvelle connexion et activé sur le téléphone avec une autorisation distincte du navigateur. Le son est chiffré par WebRTC et passe par des tampons mémoire limités vers un périphérique audio virtuel sélectionné et déjà installé. L’application ne change pas les périphériques par défaut et n’installe aucun pilote audio automatiquement. Steam Streaming Microphone ou VB-CABLE est un logiciel tiers avec sa propre licence et ses risques. Un nouveau pilote exige une autorisation administrateur et peut nécessiter un redémarrage.

<!-- plain:start -->
**En termes simples**

Lorsque vous activez le microphone, il peut aussi capter d’autres personnes et les sons de la pièce. Le microphone virtuel est une connexion audio partagée dans Windows que d’autres applications peuvent utiliser.

**Ce que cela peut entraîner pour vous**

Des conversations privées peuvent être entendues ou enregistrées par une application de réunion ou une autre application ayant accès au microphone virtuel. Le son d’autres applications peut se mélanger si elles utilisent le même périphérique. Désactivez le microphone après usage ; une jauge verte indique un signal dans l’application, pas que seul Teams l’entend. Obtenez les pilotes auprès de leur éditeur officiel et ne définissez pas le câble virtuel comme haut-parleur par défaut.
<!-- plain:end -->

[Technical review](../SECURITY-REVIEW.md) · [Releases](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/releases)
