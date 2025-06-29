import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { serviceWorkerManager } from "./lib/serviceWorker";

// Register service worker for offline support and notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await serviceWorkerManager.register();
      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
