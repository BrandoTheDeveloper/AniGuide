import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { serviceWorkerManager } from "./lib/serviceWorker";

// Clear any existing service workers in development, register only in production
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // Unregister all service workers in development and clear caches
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        console.log('Unregistering service worker in development');
        registration.unregister();
      });
    });
    
    // Clear all caches in development
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          console.log('Deleting cache:', cacheName);
          caches.delete(cacheName);
        });
      });
    }
  } else {
    // Register service worker only in production for offline support and notifications
    window.addEventListener('load', async () => {
      try {
        await serviceWorkerManager.register();
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
