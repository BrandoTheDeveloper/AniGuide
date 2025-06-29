import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Download, Wifi, WifiOff } from "lucide-react";
import { serviceWorkerManager } from "@/lib/serviceWorker";

export default function ServiceWorkerNotifications() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isSubscribedToPush, setIsSubscribedToPush] = useState(false);

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Your internet connection has been restored.",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "You're now offline. Some features are still available.",
        duration: 5000,
      });
    };

    // Handle service worker events
    const handleSWUpdate = () => {
      setIsUpdateAvailable(true);
      toast({
        title: "Update Available",
        description: "A new version of AniGuide is available.",
        duration: 0,
        action: (
          <Button
            size="sm"
            onClick={() => {
              serviceWorkerManager.updateServiceWorker();
              window.location.reload();
            }}
          >
            Update
          </Button>
        ),
      });
    };

    const handleSWAnimeUpdated = () => {
      toast({
        title: "Anime Data Updated",
        description: "Latest anime information has been synced.",
        duration: 3000,
      });
    };

    const handleSWOfflineAction = (event: CustomEvent) => {
      toast({
        title: "Action Saved",
        description: event.detail.message,
        duration: 3000,
      });
    };

    const handleSWSyncComplete = (event: CustomEvent) => {
      toast({
        title: "Sync Complete",
        description: event.detail.message,
        duration: 3000,
      });
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sw-update-available', handleSWUpdate);
    window.addEventListener('sw-anime-updated', handleSWAnimeUpdated);
    window.addEventListener('sw-offline-action', handleSWOfflineAction as EventListener);
    window.addEventListener('sw-sync-complete', handleSWSyncComplete as EventListener);

    // Check initial notification permission
    setNotificationPermission(Notification.permission);

    // Check if already subscribed to push notifications
    serviceWorkerManager.isSubscribedToPush().then(setIsSubscribedToPush);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sw-update-available', handleSWUpdate);
      window.removeEventListener('sw-anime-updated', handleSWAnimeUpdated);
      window.removeEventListener('sw-offline-action', handleSWOfflineAction as EventListener);
      window.removeEventListener('sw-sync-complete', handleSWSyncComplete as EventListener);
    };
  }, [toast]);

  const handleEnableNotifications = async () => {
    const permission = await serviceWorkerManager.requestNotificationPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      const subscription = await serviceWorkerManager.subscribeToPush();
      setIsSubscribedToPush(!!subscription);
      
      if (subscription) {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive updates about new anime releases.",
          duration: 3000,
        });
      }
    } else {
      toast({
        title: "Notifications Blocked",
        description: "Enable notifications in your browser settings to receive updates.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleDisableNotifications = async () => {
    const success = await serviceWorkerManager.unsubscribeFromPush();
    if (success) {
      setIsSubscribedToPush(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive push notifications anymore.",
        duration: 3000,
      });
    }
  };

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <Badge 
          variant={isOnline ? "default" : "destructive"}
          className="flex items-center gap-1"
        >
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              Offline
            </>
          )}
        </Badge>
      </div>

      {/* Update Available Banner */}
      {isUpdateAvailable && (
        <div className="fixed top-16 right-4 z-50">
          <Card className="w-80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <CardTitle className="text-sm">Update Available</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-3">
                A new version of AniGuide is ready to install.
              </CardDescription>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    serviceWorkerManager.updateServiceWorker();
                    window.location.reload();
                  }}
                >
                  Update Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsUpdateAvailable(false)}
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Settings Card (only show if notifications are supported) */}
      {'Notification' in window && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              {isSubscribedToPush ? (
                <Bell className="h-5 w-5 text-claret" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <CardTitle>Push Notifications</CardTitle>
            </div>
            <CardDescription>
              Get notified about new anime releases and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Status: {isSubscribedToPush ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {notificationPermission === 'granted' 
                    ? 'Notifications are allowed' 
                    : notificationPermission === 'denied'
                    ? 'Notifications are blocked'
                    : 'Permission not requested'
                  }
                </p>
              </div>
              
              {!isSubscribedToPush ? (
                <Button
                  onClick={handleEnableNotifications}
                  disabled={notificationPermission === 'denied'}
                  size="sm"
                >
                  Enable
                </Button>
              ) : (
                <Button
                  onClick={handleDisableNotifications}
                  variant="outline"
                  size="sm"
                >
                  Disable
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}