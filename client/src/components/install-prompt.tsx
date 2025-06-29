import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

export default function InstallPrompt() {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    
    // Check if prompt was previously dismissed
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    // Show prompt after user has interacted with the app
    const timer = setTimeout(() => {
      if (isInstallable && !dismissed && !isStandalone) {
        setShowPrompt(true);
      }
    }, 10000); // Show after 10 seconds

    return () => clearTimeout(timer);
  }, [isInstallable, dismissed, isStandalone]);

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="bg-background border border-border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">
                Install AniGuide
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Get the app for faster access, offline viewing, and notifications about new anime releases.
              </p>
              <div className="flex space-x-2 mt-3">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  Not now
                </Button>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}