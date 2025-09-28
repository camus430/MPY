# 📱 Guide Mobile - Mon Petit YouTube

Cette application a été configurée avec **Capacitor** pour fonctionner comme une vraie app mobile native avec lecture audio en arrière-plan et compatibilité Dynamic Island.

## 🚀 Installation Mobile

Pour tester l'app sur votre téléphone ou émulateur :

### 1. Exportez vers GitHub
Cliquez sur "Export to GitHub" dans Lovable pour transférer le projet.

### 2. Clonez et installez
```bash
git clone [votre-repo]
cd mon-petit-youtube
npm install
```

### 3. Ajoutez les plateformes
```bash
# Pour iOS (nécessite un Mac avec Xcode)
npx cap add ios

# Pour Android (nécessite Android Studio)
npx cap add android
```

### 4. Buildez et synchronisez
```bash
npm run build
npx cap sync
```

### 5. Lancez l'app
```bash
# Pour iOS
npx cap run ios

# Pour Android  
npx cap run android
```

## 🎵 Fonctionnalités Audio

### ✅ Lecture en arrière-plan
- L'audio continue quand vous quittez l'app
- Fonctionne même quand l'écran est verrouillé
- Optimisé pour économiser la batterie

### ✅ Contrôles natifs
- Contrôles sur l'écran de verrouillage
- Compatibilité Dynamic Island (iPhone 14 Pro+)
- Centre de contrôle iOS/Android
- Boutons physiques du casque

### ✅ Media Session API
- Métadonnées complètes (titre, artiste, artwork)
- Barre de progression sur l'écran de verrouillage
- Actions de navigation (suivant, précédent, seek)

## 🔧 Configuration Avancée

### Permissions iOS (Info.plist)
L'app inclut automatiquement les permissions pour :
- Lecture audio en arrière-plan
- Accès au microphone (si nécessaire)
- Accès réseau

### Permissions Android (AndroidManifest.xml)
L'app inclut automatiquement :
- WAKE_LOCK pour maintenir l'audio actif
- FOREGROUND_SERVICE_MEDIA_PLAYBACK
- Contrôles Bluetooth

## 📊 Optimisations Performance

### 🔋 Économie d'énergie
- Audio codec optimisé
- Suspension automatique des animations en arrière-plan
- Gestion intelligente de la mémoire

### 🚀 Démarrage rapide
- Preload des ressources critiques
- Mise en cache intelligente
- Optimisation du bundle

## 🐛 Dépannage

### Audio ne fonctionne pas en arrière-plan
1. Vérifiez que l'app a les permissions nécessaires
2. Redémarrez l'app après installation
3. Testez avec des écouteurs connectés

### Dynamic Island ne s'affiche pas
- Fonctionne uniquement sur iPhone 14 Pro et modèles plus récents
- Nécessite iOS 16.1+
- L'audio doit être en cours de lecture

### Build iOS échoue
- Vérifiez que Xcode est installé et à jour
- Vérifiez les certificats de développement
- Nettoyez le cache : `npx cap clean ios`

### Build Android échoue
- Vérifiez qu'Android Studio est installé
- Configurez les variables d'environnement Android
- Nettoyez le cache : `npx cap clean android`

## 📖 Ressources

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Guide iOS Background Audio](https://developer.apple.com/documentation/avfaudio/avaudiosession)
- [Android Media Playback Guide](https://developer.android.com/guide/topics/media/mediasession)

## 🆘 Support

Si vous rencontrez des problèmes, consultez notre guide de dépannage complet ou contactez le support technique.

---

**Note importante** : Après chaque modification du code, n'oubliez pas de faire `git pull` puis `npx cap sync` pour synchroniser les changements avec les plateformes natives.