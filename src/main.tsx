import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeCapacitor } from "./utils/capacitor-init";

// Initialize Capacitor for native features
initializeCapacitor();

createRoot(document.getElementById("root")!).render(<App />);
