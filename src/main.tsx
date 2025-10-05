import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeCapacitor } from "./utils/capacitor-init";

// Initialiser Capacitor pour les fonctionnalités natives
initializeCapacitor();

// Enregistrer le service worker pour la lecture en arrière-plan
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/background-service-worker.js')
    .then(() => console.log('Service Worker enregistré pour la lecture en arrière-plan'))
    .catch(err => console.log('Erreur Service Worker:', err));
}

createRoot(document.getElementById("root")!).render(<App />);
