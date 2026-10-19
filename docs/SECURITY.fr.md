# Risques de sécurité connus

[Dansk](SECURITY.da.md) · [English](SECURITY.en.md) · [Deutsch](SECURITY.de.md) · [Français](SECURITY.fr.md)

> **Prototype : évitez les situations sensibles. Le chiffrement ne protège pas contre un téléphone, un PC ou un code client compromis.**

## Hébergement et code client

**Impact élevé en cas de compromission**

Le client du téléphone est chargé depuis Cloudflare. Un accès à l’hébergement ou au déploiement compromis peut modifier le client et divulguer la vidéo. L’interface Windows locale réduit cette dépendance sur le PC, mais ne protège pas le client du téléphone.

## Installation et téléchargements

**Impact élevé en cas de compromission**

L’installateur n’est pas signé et demande une autorisation administrateur. Un installateur falsifié ou remplacé peut compromettre le PC. Téléchargez uniquement la version GitHub officielle du projet. Une somme de contrôle sur le même compte ne protège pas contre la prise de contrôle de ce compte.

## Accès au code QR

**Confirmation attentive nécessaire**

Le code QR et le lien contiennent des secrets d’accès. Ne les partagez ni ne les publiez. Les jetons uniques, l’expiration et le code de comparaison réduisent le risque, mais une invitation divulguée et une acceptation erronée peuvent connecter le mauvais appareil. Le code n’est ni un compte ni une garantie d’identité.

## Appareils compromis

**Impact élevé en cas de compromission**

Des logiciels malveillants, des administrateurs ou une personne ayant accès à un téléphone ou PC déverrouillé peuvent lire l’écran, les clés ou la vidéo. Le chiffrement en transit ne protège pas les appareils compromis. N’utilisez pas ce prototype si une fuite vidéo aurait des conséquences graves.

## Tampon vidéo local

**Risque d’accès local**

Les images décodées passent par un fichier temporaire sous ProgramData. Il est protégé, effacé puis supprimé à la fermeture, mais ne réside pas uniquement en mémoire anonyme. Des processus du même utilisateur ou disposant de privilèges système suffisants peuvent y accéder. La suppression ne garantit pas l’effacement sécurisé du disque ou du fichier d’échange.

## Disponibilité et abus

**Risque résiduel**

Les limites de serveur et de messages réduisent les abus, mais les requêtes atteignent toujours Cloudflare. Une attaque importante peut épuiser les quotas et bloquer de nouveaux jumelages. Un appareil malveillant déjà jumelé peut aussi perturber la session. Cela ne donne pas, à lui seul, accès à la vidéo à un tiers.

## Métadonnées et réseau local

**Limite de confidentialité**

Cloudflare et GitHub peuvent traiter des adresses IP et des données techniques de connexion. WebRTC échange des informations réseau entre les appareils. Aucun compte n’est requis, mais le service n’est pas anonyme. Un Wi-Fi commun n’est pas une garantie de sécurité ; l’isolation des invités, les pare-feu et les interruptions peuvent bloquer la connexion.

## Autorisation caméra et enregistrement par le destinataire

**Vigilance nécessaire**

La caméra tente de démarrer après l’acceptation sur le PC et l’autorisation du navigateur. Surveillez l’indicateur et déconnectez après utilisation. Cette application n’enregistre pas, mais les applications de réunion, la capture d’écran ou le destinataire jumelé peuvent conserver l’image. Le chiffrement ne l’empêche pas.

## Failles inconnues et mises à jour

**Pas d’audit de sécurité indépendant**

Les tests fonctionnels et la recherche d’alertes npm ne constituent ni un test d’intrusion, ni du fuzzing, ni une garantie. Les composants C++ natifs, WebView2 et système peuvent contenir des failles inconnues ; des failles graves pourraient compromettre un processus. Maintenez Windows, le navigateur et l’application à jour. Le client du téléphone se met à jour en ligne ; l’interface Windows locale nécessite une nouvelle version.

[Technical review](../SECURITY-REVIEW.md) · [Releases](https://github.com/sorenfroststaal/Extruda-Phone-As-Webcam/releases)

## Développement assisté par IA

Le prototype est « vibe codé » avec l’assistance de l’IA et Codex. Les tests automatisés et successifs peuvent manquer des erreurs et hypothèses incorrectes dans le code et la documentation. Aucune certification indépendante ni garantie n’est fournie. Consultez aussi la [FAQ et les guides](FAQ.fr.md) et la [procédure de signalement](../SECURITY.md).
