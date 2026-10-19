# FAQ et guides

[Dansk](FAQ.da.md) · [English](FAQ.en.md) · [Deutsch](FAQ.de.md) · [Français](FAQ.fr.md)

[Risques de sécurité](SECURITY.fr.md)

## Comment démarrer ?

Installez l’application sur Windows 11 x64. Ouvrez-la et scannez le QR code avec votre téléphone sur le même Wi-Fi. Comparez le code à six chiffres et acceptez sur le PC. Autorisez la caméra du téléphone. Gardez les deux applications ouvertes.

## iPhone : comment autoriser la caméra ?

Ouvrez le lien de jumelage dans Safari et choisissez Autoriser lorsque le site demande la caméra. Après un refus : menu de page près de la barre d’adresse → Réglages du site web → Appareil photo → Demander ou Autoriser. Rechargez ; scannez un nouveau QR code si le jumelage a expiré.

Si le réglage manque, consultez Réglages → Apps → Safari → Appareil photo (ancien iOS : Réglages → Safari). Gardez Demander comme réglage général et autorisez uniquement le site voulu. Les autres navigateurs peuvent aussi nécessiter Réglages → Confidentialité et sécurité → Appareil photo. Les menus varient selon la version. Touchez Démarrer la caméra si le navigateur exige un geste supplémentaire.

[Apple · Safari](https://support.apple.com/guide/iphone/browse-the-web-privately-iphb01fc3c85/ios) · [Apple · iPhone](https://support.apple.com/guide/iphone/iph168c4bbd5/ios)

## Android : comment autoriser la caméra ?

Ouvrez le lien dans Chrome et autorisez la caméra à la demande. Si elle est bloquée : Chrome → ⋮ → Paramètres → Paramètres des sites → Appareil photo. Autorisez le site bloqué. Vérifiez aussi Android → Paramètres → Applications → Chrome → Autorisations → Appareil photo → Autoriser pendant l’utilisation. Rechargez ou scannez un nouveau QR code. Les menus varient selon le téléphone et la version.

[Google · Chrome](https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DAndroid&hl=en)

## Comment choisir la caméra dans Teams ?

Connectez d’abord le téléphone. Dans Teams sur PC : Paramètres → Appareils → Caméra → choisissez extruda mobile as webcam. Le nom peut inclure la résolution et Windows Virtual Camera. En réunion, utilisez la flèche près de l’icône caméra pour la choisir. Activez la vidéo. Si elle manque, redémarrez Teams en laissant Extruda ouvert.

[Microsoft · Teams](https://support.microsoft.com/en-us/teams/notifications-settings/manage-your-device-settings-in-microsoft-teams)

## Comment choisir la caméra dans Zoom ?

Connectez d’abord le téléphone. Dans Zoom sur PC : Paramètres → Vidéo et effets (ou Vidéo) → Caméra → extruda mobile as webcam. En réunion : flèche près de Vidéo → choisissez la caméra et démarrez la vidéo. Redémarrez Zoom si elle manque. Zoom et les réglages de réunion peuvent limiter la résolution réelle.

[Zoom · Video](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061836)

## Autres applications et caméra introuvable

Choisissez extruda mobile as webcam dans les réglages caméra de l’application. Un site de réunion a aussi besoin d’une autorisation caméra. Sous Windows : Paramètres → Confidentialité et sécurité → Caméra → activez l’accès et celui des applications de bureau. Les PC professionnels peuvent être restreints par l’IT. La compatibilité n’est pas garantie partout ; cette version n’a pas de récepteur macOS ou Linux.

[Microsoft · Camera](https://support.microsoft.com/en-us/teams/meetings/my-camera-isn-t-working-in-microsoft-teams)

## QR code expiré ou connexion impossible

Une invitation dure 10 minutes. Annulez et créez un nouveau jumelage ou rouvrez l’application. Utilisez le même Wi-Fi habituel ; les réseaux invités peuvent isoler les appareils. Un VPN ou pare-feu peut bloquer WebRTC. Essayez un réseau de confiance sans désactiver globalement la protection. Ouvrez le lien dans Safari ou Chrome plutôt que dans le navigateur du scanner. L’erreur 429 signifie trop de tentatives : attendez puis réessayez.

## Résolution, image noire et saccades

L’application démarre en 1920 × 1080. Une fois connecté, choisissez 480p, 720p, 1080p, 1440p ou 4K. Le téléphone ou l’application de réunion peut fournir moins. Après un changement, il peut falloir sélectionner à nouveau la caméra dans Teams ou Zoom. En cas de saccades : essayez 720p, rapprochez-vous du routeur et améliorez l’éclairage. Gardez la page au premier plan et l’écran allumé ; verrouillage, arrière-plan, chaleur et économie d’énergie peuvent couper la vidéo. Fermez les autres applications caméra et essayez Démarrer la caméra ou un nouveau jumelage.

## Internet, son, enregistrement et arrêt

Cette version nécessite internet pour le client téléphone et le jumelage, même sur le même Wi-Fi. La vidéo passe directement entre appareils par WebRTC ; Cloudflare gère le jumelage, sans relais vidéo. Aucun microphone ni enregistrement n’est intégré : choisissez le micro du PC ou du casque dans l’application de réunion. Le récepteur ou l’application peut toutefois enregistrer l’image. Appuyez sur Déconnecter/Annuler puis fermez la page et l’application après usage. Ne partagez jamais le QR code ni le lien. Consultez Risques de sécurité pour les limites connues.

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
