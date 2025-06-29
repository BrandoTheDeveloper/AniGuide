import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ServiceWorkerDebug() {
  const [swStatus, setSwStatus] = useState<string>("Checking...");
  const [caches, setCaches] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    checkServiceWorker();
    checkCaches();
  }, []);

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        setSwStatus(`Active: ${registration.active ? 'Yes' : 'No'}, Scope: ${registration.scope}`);
      } else {
        setSwStatus("No service worker registered");
      }
    } else {
      setSwStatus("Service workers not supported");
    }
  };

  const checkCaches = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      setCaches([...cacheNames]);
    }
  };

  const clearAllCaches = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const cacheArray = [...cacheNames];
      await Promise.all(cacheArray.map(name => caches.delete(name)));
      setLogs(prev => [...prev, `Cleared ${cacheArray.length} caches`]);
      checkCaches();
    }
  };

  const unregisterServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        setLogs(prev => [...prev, "Service worker unregistered"]);
        checkServiceWorker();
      }
    }
  };

  const testImageLoad = () => {
    const testImg = new Image();
    testImg.onload = () => {
      setLogs(prev => [...prev, "Test image loaded successfully"]);
    };
    testImg.onerror = () => {
      setLogs(prev => [...prev, "Test image failed to load"]);
    };
    testImg.src = "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-ELSYx3yMPcKM.jpg";
  };

  const forceRefresh = () => {
    window.location.reload();
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Service Worker Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>SW Status:</strong> {swStatus}
        </div>
        
        <div>
          <strong>Caches ({caches.length}):</strong>
          <ul className="text-sm ml-4">
            {caches.map(cache => (
              <li key={cache}>• {cache}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={testImageLoad} size="sm">Test Image Load</Button>
          <Button onClick={clearAllCaches} size="sm" variant="outline">Clear Caches</Button>
          <Button onClick={unregisterServiceWorker} size="sm" variant="outline">Unregister SW</Button>
          <Button onClick={forceRefresh} size="sm" variant="destructive">Force Refresh</Button>
        </div>

        {logs.length > 0 && (
          <div>
            <strong>Debug Logs:</strong>
            <div className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded max-h-32 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}