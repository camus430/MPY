# 📱 Guide PWA Builder - Générer l'APK sans blocage

Ton site MPY est maintenant 100% compatible avec **PWA Builder** pour générer facilement un APK Android.

## 🚀 Pourquoi PWA Builder ?

PWA Builder te permet de générer un APK sans avoir besoin d'Android Studio ni de certificats. L'APK généré peut être installé directement sur Android **SANS** passer par le Play Store.

## ✅ Ce qui a été configuré

✅ **Manifest.json** optimisé avec toutes les métadonnées PWA  
✅ **Service Worker** fonctionnel pour le mode hors ligne  
✅ **Icônes** 192x192 et 512x512 générées  
✅ **Meta tags** PWA complets dans index.html  
✅ **Lecture en arrière-plan** maintenue même après 30+ minutes  

## 📋 Étapes pour générer l'APK

### 1. Publie ton site
Clique sur **Publish** en haut à droite de Lovable pour déployer ton site.

### 2. Va sur PWA Builder
Rends-toi sur : **https://www.pwabuilder.com/**

### 3. Entre l'URL de ton site
- Colle l'URL de ton site publié (ex: `https://ton-site.lovable.app`)
- Clique sur **Start**

### 4. Vérifie le rapport PWA
PWA Builder va analyser ton site. Tu devrais avoir :
- ✅ Manifest valide
- ✅ Service Worker détecté
- ✅ Icônes présentes
- ✅ Site HTTPS

### 5. Génère l'APK Android
1. Clique sur l'onglet **Android**
2. Choisis **TWA (Trusted Web Activity)** ou **APK Package**
3. Configure les options :
   - **Package ID** : `app.mpy.android` (ou ce que tu veux)
   - **App name** : MPY
   - **Version** : 1.0.0
4. Clique sur **Generate**

### 6. Télécharge ton APK
- PWA Builder va générer ton APK
- Télécharge-le quand c'est prêt
- L'APK peut être installé directement sur n'importe quel Android

## 📥 Installation de l'APK

### Sur ton téléphone Android :
1. **Transférer l'APK** sur ton téléphone
2. **Autoriser les sources inconnues** :
   - Paramètres > Sécurité > Sources inconnues (activer)
   - Ou : Paramètres > Applications > Accès spécial > Installation d'apps inconnues
3. **Ouvrir l'APK** avec un gestionnaire de fichiers
4. **Installer** l'application

## 🎵 Fonctionnalités incluses dans l'APK

✅ **Lecture en arrière-plan illimitée**  
✅ **Contrôles sur écran de verrouillage**  
✅ **Fonctionne même écran éteint**  
✅ **Navigation entre vidéos**  
✅ **Wake lock automatique**  
✅ **Mode hors ligne** (pages visitées)  

## 🔧 Options avancées PWA Builder

### TWA (Trusted Web Activity) - RECOMMANDÉ
- ✅ APK léger (~2-5 MB)
- ✅ Mises à jour automatiques via le site web
- ✅ Pas de duplication de code
- ✅ Performance identique au site

### APK Package
- Plus gros (~10-20 MB)
- Fonctionne 100% hors ligne
- Nécessite republication pour les mises à jour

## 📤 Publier sur Google Play Store (optionnel)

Si tu veux publier sur le Play Store :

1. Génère un **Android App Bundle (AAB)** au lieu d'un APK
2. Crée un compte développeur Google Play (25$ une fois)
3. Upload l'AAB sur Google Play Console
4. Remplis les informations (description, captures d'écran, etc.)
5. Soumets pour révision

**Note** : Le Play Store peut prendre 1-7 jours pour approuver l'app.

## 🆚 PWA Builder vs Capacitor

| Critère | PWA Builder | Capacitor |
|---------|-------------|-----------|
| **Facilité** | ⭐⭐⭐⭐⭐ Très simple | ⭐⭐⭐ Moyen |
| **Temps setup** | 5 minutes | 30+ minutes |
| **Outils requis** | Navigateur | Android Studio |
| **Taille APK** | 2-5 MB (TWA) | 15-30 MB |
| **Plugins natifs** | ❌ Non | ✅ Oui |
| **Mises à jour** | ✅ Auto (TWA) | ❌ Manuel |

**Recommandation** : Utilise **PWA Builder avec TWA** pour MPY car :
- Tu n'as pas besoin de plugins natifs supplémentaires
- Les mises à jour sont automatiques
- C'est beaucoup plus rapide
- L'APK est très léger

## 🐛 Dépannage

### PWA Builder ne détecte pas mon manifest
- Vérifie que ton site est publié (pas en preview)
- Assure-toi que `/manifest.json` est accessible
- Vérifie dans la console du navigateur s'il y a des erreurs

### L'APK ne s'installe pas
- Active les sources inconnues dans les paramètres Android
- Vérifie que tu as assez d'espace sur le téléphone
- Essaie de redémarrer le téléphone

### La lecture en arrière-plan ne fonctionne pas
- Désactive l'optimisation de batterie pour l'app
- Active les notifications pour l'app
- Redémarre l'app après installation

## 📚 Ressources

- [PWA Builder](https://www.pwabuilder.com/)
- [Documentation TWA](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Play Store Publishing](https://play.google.com/console/about/)

---

✅ **Ton site est prêt pour PWA Builder !** Il suffit de le publier et de générer l'APK.
