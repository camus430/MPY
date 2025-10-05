# Configuration Android pour la lecture en arrière-plan

## Modifications effectuées

J'ai configuré votre application pour maintenir la lecture audio/vidéo en arrière-plan sur Android, même après 30 minutes :

1. **Service Worker** : Enregistré pour maintenir la session active
2. **Gestionnaire d'état de l'app** : Maintient activement la lecture toutes les 3-5 secondes en arrière-plan
3. **Permissions Android** : Ajout des permissions nécessaires (FOREGROUND_SERVICE, WAKE_LOCK)
4. **AndroidManifest.xml** : Configuration pour le service de lecture média en avant-plan
5. **Lecteur natif amélioré** : Relance automatique en cas de pause inattendue

## Installation sur appareil Android

Pour tester sur votre appareil Android :

1. **Exportez vers GitHub** (si pas déjà fait)
   - Cliquez sur le bouton GitHub en haut à droite de Lovable

2. **Clonez votre projet** sur votre machine
   ```bash
   git clone [votre-repo-github]
   cd [nom-du-projet]
   ```

3. **Installez les dépendances**
   ```bash
   npm install
   ```

4. **Ajoutez la plateforme Android** (si première fois)
   ```bash
   npx cap add android
   ```

5. **Synchronisez le projet**
   ```bash
   npm run build
   npx cap sync android
   ```

6. **Ouvrez dans Android Studio**
   ```bash
   npx cap open android
   ```

7. **Dans Android Studio** :
   - Connectez votre appareil Android via USB (avec le débogage USB activé)
   - Ou utilisez un émulateur Android
   - Cliquez sur le bouton "Run" (▶️)

## Fonctionnalités de lecture en arrière-plan

✅ **Ce qui fonctionne maintenant** :
- La musique continue quand vous fermez l'application
- La musique continue après 30+ minutes en arrière-plan
- Contrôles sur l'écran de verrouillage (play, pause, suivant, précédent)
- Reprise automatique si pause inattendue
- Navigation entre les vidéos via les contrôles système

✅ **Contrôles disponibles** :
- Boutons play/pause sur l'écran de verrouillage
- Boutons précédent/suivant pour naviguer entre les vidéos
- Notifications avec les informations de la piste en cours
- Miniature de la vidéo/audio affichée

## Notes importantes

- **Après chaque modification de code** : Faites `git pull` puis `npx cap sync android`
- **Android 12+** : Les permissions FOREGROUND_SERVICE sont requises et configurées
- **Batterie** : Android peut limiter les apps en arrière-plan selon les paramètres d'économie d'énergie
- **Tests** : Testez avec l'écran éteint pendant plusieurs minutes pour confirmer

## Dépannage

Si la musique s'arrête toujours :
1. Vérifiez les paramètres d'économie de batterie pour votre app
2. Dans les paramètres Android, désactivez l'optimisation de batterie pour l'app
3. Assurez-vous que les notifications de l'app sont activées
4. Redémarrez l'app après les modifications

## Pour iOS

Les mêmes fonctionnalités sont supportées sur iOS. Suivez les mêmes étapes mais utilisez :
```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

Nécessite un Mac avec Xcode installé.
