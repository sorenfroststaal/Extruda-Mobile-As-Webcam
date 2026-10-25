# FAQ et guides

[Dansk](FAQ.da.md) · [English](FAQ.en.md) · [Deutsch](FAQ.de.md) · [Français](FAQ.fr.md)

[Risques de sécurité](SECURITY.fr.md)

## Comment démarrer ?

Installez l’application sur Windows 11 x64. Ouvrez-la et scannez le QR code avec votre téléphone sur le même Wi-Fi. Comparez le code à six chiffres et acceptez sur le PC. Autorisez la caméra du téléphone. Gardez les deux applications ouvertes.

Pendant la connexion, sélectionnez Caméra avant ou Caméra arrière sur le téléphone. La vidéo peut brièvement s’interrompre pendant le changement ; le microphone et l’appairage sont conservés. Si la caméra ne peut pas être ouverte, l’application tente de rétablir la caméra précédente.

## iPhone : comment autoriser la caméra ?

Ouvrez le lien de jumelage dans Safari et choisissez Autoriser lorsque le site demande la caméra. Après un refus : menu de page près de la barre d’adresse → Réglages du site web → Appareil photo → Demander ou Autoriser. Rechargez ; scannez un nouveau QR code si le jumelage a expiré.

Si le réglage manque, consultez Réglages → Apps → Safari → Appareil photo (ancien iOS : Réglages → Safari). Gardez Demander comme réglage général et autorisez uniquement le site voulu. Les autres navigateurs peuvent aussi nécessiter Réglages → Confidentialité et sécurité → Appareil photo. Les menus varient selon la version. Touchez Démarrer la caméra si le navigateur exige un geste supplémentaire.

[Apple · Safari](https://support.apple.com/guide/iphone/browse-the-web-privately-iphb01fc3c85/ios) · [Apple · iPhone](https://support.apple.com/guide/iphone/iph168c4bbd5/ios)

## Android : comment autoriser la caméra ?

Ouvrez le lien dans Chrome et autorisez la caméra à la demande. Si elle est bloquée : Chrome → ⋮ → Paramètres → Paramètres des sites → Appareil photo. Autorisez le site bloqué. Vérifiez aussi Android → Paramètres → Applications → Chrome → Autorisations → Appareil photo → Autoriser pendant l’utilisation. Rechargez ou scannez un nouveau QR code. Les menus varient selon le téléphone et la version.

[Google · Chrome](https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DAndroid&hl=en)

## Comment choisir la caméra dans Teams ?

Connectez d’abord le téléphone. Dans Teams sur PC : Paramètres → Appareils → Caméra → choisissez extruda - mobile as webcam. Le nom peut inclure la résolution et Windows Virtual Camera. En réunion, utilisez la flèche près de l’icône caméra pour la choisir. Activez la vidéo. Si elle manque, redémarrez Teams en laissant Extruda ouvert.

[Microsoft · Teams](https://support.microsoft.com/en-us/teams/notifications-settings/manage-your-device-settings-in-microsoft-teams)

## Comment choisir la caméra dans Zoom ?

Connectez d’abord le téléphone. Dans Zoom sur PC : Paramètres → Vidéo et effets (ou Vidéo) → Caméra → extruda - mobile as webcam. En réunion : flèche près de Vidéo → choisissez la caméra et démarrez la vidéo. Redémarrez Zoom si elle manque. Zoom et les réglages de réunion peuvent limiter la résolution réelle.

[Zoom · Video](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061836)

## Autres applications et caméra introuvable

Choisissez extruda - mobile as webcam dans les réglages caméra de l’application. Un site de réunion a aussi besoin d’une autorisation caméra. Sous Windows : Paramètres → Confidentialité et sécurité → Caméra → activez l’accès et celui des applications de bureau. Les PC professionnels peuvent être restreints par l’IT. La compatibilité n’est pas garantie partout ; cette version n’a pas de récepteur macOS ou Linux.

[Microsoft · Camera](https://support.microsoft.com/en-us/teams/meetings/my-camera-isn-t-working-in-microsoft-teams)

## QR code expiré ou connexion impossible

Une invitation dure 10 minutes. Annulez et créez un nouveau jumelage ou rouvrez l’application. Utilisez le même Wi-Fi habituel ; les réseaux invités peuvent isoler les appareils. Un VPN ou pare-feu peut bloquer WebRTC. Essayez un réseau de confiance sans désactiver globalement la protection. Ouvrez le lien dans Safari ou Chrome plutôt que dans le navigateur du scanner. L’erreur 429 signifie trop de tentatives : attendez puis réessayez.

## Résolution, image noire et saccades

L’application démarre en 1920 × 1080. Une fois connecté, choisissez 480p, 720p, 1080p, 1440p ou 4K. Le téléphone ou l’application de réunion peut fournir moins. Après un changement, il peut falloir sélectionner à nouveau la caméra dans Teams ou Zoom. En cas de saccades : essayez 720p, rapprochez-vous du routeur et améliorez l’éclairage. Gardez la page au premier plan et l’écran allumé ; verrouillage, arrière-plan, chaleur et économie d’énergie peuvent couper la vidéo. Fermez les autres applications caméra et essayez Démarrer la caméra ou un nouveau jumelage.

## Internet, son, enregistrement et arrêt

Cette version nécessite internet pour le client téléphone et le jumelage, même sur le même Wi-Fi. La vidéo et le son microphone facultatif passent directement par WebRTC ; Cloudflare ne relaie pas les médias. Le microphone est désactivé à chaque nouvelle connexion et exige un geste et une autorisation du navigateur sur le téléphone. L’application peut enregistrer localement sur le PC ; les applications de réunion et destinataires peuvent sauvegarder image et son. Déconnectez et fermez les deux côtés après usage. Ne partagez jamais le QR code ni le lien. Voir Risques de sécurité.

## Langue, thème et mises à jour

Le globe propose danois, anglais, allemand ou français. Le soleil propose un thème clair, sombre ou automatique. Automatique suit la langue et l’apparence du système ; sur téléphone, la langue vient des préférences du navigateur. Les choix manuels sont mémorisés par appareil. Mettez à jour Windows via les GitHub Releases du projet et fermez l’application avant installation. Rechargez pour actualiser le client téléphone. L’installateur n’est pas signé ; vérifiez sa source avant l’autorisation administrateur.

## Est-ce open source, et puis-je le modifier et le partager ?

Oui. Le code du projet est publié sous licence MIT : vous pouvez l’utiliser, le copier, le modifier, le publier, le partager et le vendre, y compris commercialement. Conservez les mentions de copyright et de licence dans les copies ou parties substantielles. Le logiciel est fourni sans garantie. Le code tiers et les polices ont leurs propres licences incluses ; le logo extruda et les éléments de marque ne relèvent pas de la licence MIT du code.

[GitHub · Source](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam) · [MIT · LICENSE](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/blob/main/LICENSE)

## Le programme est-il « vibe codé » ?

Oui. Le prototype a été développé avec la programmation assistée par IA (« vibe coding ») et Codex, selon les demandes du propriétaire et des essais successifs. Le code et la documentation peuvent contenir des erreurs ou hypothèses oubliées même si les tests automatisés réussissent. Cela ne constitue ni une revue indépendante ni une certification de sécurité. Considérez-le comme un outil open source expérimental et lisez les risques avant utilisation.

## Bugs, suggestions et contributions

Ouvrez une issue GitHub avec la version de l’application, de Windows, le téléphone/navigateur et les étapes de reproduction. Ne partagez jamais de lien de jumelage actif, QR code, secret d’accès ou image privée. Code, traductions et améliorations sont bienvenus ; aucun délai de réponse ni support n’est garanti. Pour une faille, consultez SECURITY.md pour un contact privé avant de publier les détails.

[GitHub · Issues](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/issues) · [GitHub · Security](https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/blob/main/SECURITY.md)

## Comment utiliser le téléphone comme microphone ?

Connectez la caméra puis touchez Activer le microphone sur le téléphone. Autorisez le microphone dans Safari ou Chrome ; les autorisations se gèrent près de celles de la caméra, sous Microphone. Le PC peut demander du son mais ne peut pas autoriser à votre place. Le bouton de désactivation de chaque appareil arrête le son ; sur le téléphone, il arrête aussi la capture. La jauge verte montre le signal capté ou reçu, pas si Teams l’utilise réellement.

Un microphone Windows nécessite le pilote VB-CABLE séparé. Téléchargez-le uniquement depuis vb-audio.com, extrayez-le et lancez son installateur en administrateur. Redémarrez ensuite. Choisissez CABLE Input dans Extruda et CABLE Output comme microphone dans Teams ou Zoom. Votre microphone par défaut ne change pas. VB-CABLE est un logiciel tiers à contribution libre avec sa propre licence ; il ne fait pas partie du code MIT et ne s’installe pas automatiquement. Sans pilote, la jauge fonctionne mais le son ne peut pas être choisi comme microphone Windows.

Si Steam Streaming Microphone est déjà installé, vous pouvez le choisir à la place de VB-CABLE. Choisissez le même microphone dans Teams ou Zoom. Le niveau envoyé démarre plus bas pour Steam afin de compenser son amplification ; ajustez les Réglages audio si le son est faible ou déformé. Ne définissez pas ce périphérique comme haut-parleur Windows par défaut.

Si aucun périphérique compatible n’est détecté, l’application propose le téléchargement de VB-CABLE chez l’éditeur, une nouvelle recherche ou Utiliser uniquement la caméra. Ce choix est mémorisé sur le PC et masque le bouton du microphone sur les deux appareils. Réactivez-le dans Informations → Configurer le microphone. Le pilote est téléchargé et installé séparément ; Extruda ne contourne pas l’autorisation de Windows.

[VB-Audio · VB-CABLE](https://vb-audio.com/Cable/)

## Comment vérifier la connexion ?

Ouvrez Informations → Vérifier la connexion. Les nouvelles images, le signal du microphone et les confirmations Windows sont affichés séparément. Cinq secondes sans nouvelle image déclenchent un avertissement ; l’application Windows efface l’image figée. Le silence seul n’indique pas une panne réseau. Les confirmations Windows signifient que le composant Windows a accepté les données, sans garantir que Teams, Zoom ou OBS utilise le bon périphérique.

Une brève interruption réseau dispose de 15 secondes pour se rétablir. Le téléphone tente un redémarrage ICE si la signalisation est disponible. Une invitation expirée, un réseau inaccessible ou une interruption prolongée peut nécessiter un nouveau QR code. Une interruption sur le téléphone peut nécessiter de rouvrir la page ou d’appuyer sur Démarrer la caméra. Vous autorisez toujours vous-même le microphone sur le téléphone.

Copier le rapport de diagnostic crée un rapport local limité à la version, aux états et aux compteurs. Il ne contient ni image, son, adresse IP, nom de périphérique, identifiant de navigateur, lien d’appairage ni clé. Il n’est jamais envoyé automatiquement et s’affiche pour vérification avant partage.

## Cadrage, test du microphone et qualité

Pendant la connexion, les commandes Windows sont à côté d’un aperçu de taille limitée. Afficher toute l’image conserve le sujet avec des bordures ; Remplir recadre au centre pour remplir l’image. La rotation affecte l’aperçu et la caméra Windows. Les choix sont mémorisés sur le PC. Les petites fenêtres peuvent nécessiter un défilement. Les paramètres audio s’ouvrent dans une boîte de dialogue séparée.

Microphone activé · Silence est un état normal, pas une erreur d’autorisation. Le niveau utilise une échelle en dB. Activez le microphone, choisissez le test et parlez normalement vers le téléphone pendant cinq secondes. Le test évalue le niveau et les fortes crêtes possibles ; il ne reconnaît pas la parole et n’enregistre aucun son. Sur le PC, il indique aussi si Windows a accepté les données audio. Il ne mesure pas le son dans Teams, Zoom ou OBS et ne change pas automatiquement le niveau d’envoi.

Résolution Windows correspond à la sortie de la caméra virtuelle. Reçu indique la taille, la fréquence et le débit vidéo réels ; le téléphone ou WebRTC peut fournir une qualité inférieure. Vérifier la connexion sépare aussi les débits, pertes et gigues vidéo et audio sur environ cinq secondes. — signifie pas encore mesuré. Les compteurs sont réinitialisés pour une nouvelle session ou une longue pause. Les rapports ne contiennent toujours ni média, adresse, nom de périphérique ni clé d’appairage.

## Comment enregistrer une vidéo sur le PC ?

Connectez le téléphone et choisissez Enregistrer une vidéo dans l’application Windows. Le curseur sélectionne des objectifs de résolution, fréquence et débit, avec une taille estimée par minute. Choisir le fichier et démarrer ouvre la boîte de sauvegarde Windows. La vidéo est écrite progressivement dans le dossier choisi, sans envoi par l’application. OneDrive ou un autre service peut toutefois synchroniser ce dossier.

Avancé propose format (automatique, MP4 ou WebM), codec (H.264, VP8 ou VP9), résolution, 15/24/25/30 images/s, débits vidéo/audio, gain audio, intervalle souhaité d’images clés et durée maximale facultative. La compatibilité dépend de WebView2 et du PC. Débit et taille restent indicatifs ; augmenter les valeurs ne crée pas de détails absents du téléphone. La résolution de la caméra Windows est verrouillée pendant l’enregistrement. Cadrage et rotation suivent la sortie affichée.

Inclure le microphone enregistre uniquement le son autorisé et activé du téléphone. Aucun pilote audio virtuel n’est nécessaire. Le son de Teams, Zoom, OBS ou du système n’est pas capturé. Pause/reprise conserve le même fichier. Arrêter et enregistrer le finalise. Déconnexion ou fermeture tente d’arrêter et sauvegarder. Les données passent d’abord par un fichier .partial dans le même dossier ; une cible existante n’est remplacée qu’après finalisation réussie. Une panne ou un stockage trop lent peut laisser un fichier incomplet, parfois illisible.

Une version Windows compatible affiche les commandes sur le téléphone jumelé. Démarrer ouvre les paramètres et la sauvegarde sur le PC, avec confirmation obligatoire sur celui-ci. Le téléphone peut ensuite mettre en pause, reprendre et arrêter. Les commandes utilisent la connexion chiffrée approuvée existante, sans lien public ni nouveau port serveur. Les chemins de fichiers ne sont pas envoyés au téléphone. Un appareil jumelé compromis peut néanmoins abuser des commandes. Mettez les deux clients à jour si les boutons manquent. Enregistrez avec l’accord des participants.

## Comment fonctionne la réduction de bruit IA locale ?

Dans les paramètres audio de l’application Windows, activez Réduction de bruit IA locale. DeepFilterNet traite le son du téléphone sur le PC avec un modèle intégré. Aucun compte, envoi ou accès Internet n’est nécessaire au traitement. L’appairage utilise toujours le serveur en ligne. La fonction est désactivée à chaque démarrage.

Le filtre s’applique au microphone virtuel et aux enregistrements avec microphone. La jauge mesure le signal original. Le filtre peut retarder le son, modifier la voix ou supprimer la parole faible. Testez un court enregistrement. Les enregistrements filtrés ne contiennent pas de piste originale séparée. Les fichiers existants restent inchangés. En cas d’échec ou de délai excessif, un avertissement apparaît et le son original reprend ; une brève coupure est possible.

Le statut du filtre et les jauges avant et après traitement apparaissent sur l’écran principal. L’intensité choisit une atténuation maximale de 6 à 60 dB. Une atténuation plus forte n’améliore pas toujours la voix. En cas d’échec, l’application tente un redémarrage avec le son original entre-temps ; après un second échec, elle conserve l’original et affiche la cause. L’absence de nouveaux blocs n’est pas une erreur en soi. Après Démarrer, le test d’écoute conserve au maximum 10 secondes de son original et filtré en mémoire. Le même gain de lecture faible est appliqué aux deux. Utilisez un casque. Fermer, couper le microphone, déconnecter ou une erreur du filtre libère le son de test. Aucun fichier ni envoi n’est créé.

[DeepFilterNet](https://github.com/Rikorose/DeepFilterNet)
