// Service Worker utilities for AniGuide PWA

export interface ServiceWorkerMessage {
  type: string;
  data?: any;
}

export interface OfflineAction {
  type: 'REVIEW' | 'WATCHLIST';
  data: any;
  timestamp: number;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
  }

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      const swPath = process.env.NODE_ENV === 'production' 
        ? '/sw-production.js' 
        : '/sw-dev.js';
      
      this.registration = await navigator.serviceWorker.register(swPath, {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              this.showUpdateAvailable();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  private handleMessage(event: MessageEvent) {
    const { type, data } = event.data as ServiceWorkerMessage;

    switch (type) {
      case 'ANIME_DATA_UPDATED':
        // Trigger cache invalidation in React Query
        window.dispatchEvent(new CustomEvent('sw-anime-updated', { detail: data }));
        break;
      
      case 'OFFLINE_ACTION_STORED':
        // Show user that action was stored for later sync
        window.dispatchEvent(new CustomEvent('sw-offline-action', { 
          detail: { message: 'Action saved for when you\'re back online' }
        }));
        break;
      
      case 'BACKGROUND_SYNC_COMPLETE':
        // Notify user that offline actions were synced
        window.dispatchEvent(new CustomEvent('sw-sync-complete', { 
          detail: { message: 'Offline actions synced successfully' }
        }));
        break;
    }
  }

  private showUpdateAvailable() {
    // Show update notification to user
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  async updateServiceWorker() {
    if (this.registration?.waiting) {
      this.sendMessage({ type: 'SKIP_WAITING' });
    }
  }

  sendMessage(message: ServiceWorkerMessage) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  // Cache anime data for offline access
  cacheAnimeData(data: any) {
    this.sendMessage({
      type: 'CACHE_ANIME_DATA',
      data
    });
  }

  // Store offline action for background sync
  storeOfflineAction(action: OfflineAction) {
    this.sendMessage({
      type: 'STORE_OFFLINE_ACTION',
      action
    });
  }

  // Request push notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.log('No service worker registration');
      return null;
    }

    try {
      const applicationServerKey = this.urlBase64ToUint8Array(
        process.env.VITE_VAPID_PUBLIC_KEY || ''
      );

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      console.log('Push subscription successful:', subscription);

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
      return false;
    }
  }

  // Check if user is subscribed to push notifications
  async isSubscribedToPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Failed to check push subscription:', error);
      return false;
    }
  }

  // Utility function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Check if app is running in standalone mode
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Check online status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Get service worker registration
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();