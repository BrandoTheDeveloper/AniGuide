import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import aniguideLogo192 from "@assets/aniguide-logo-192x192_1751223690504.png";

interface ProtectedFeatureProps {
  children: React.ReactNode;
  featureName: string;
  description: string;
  className?: string;
  trigger?: React.ReactNode;
}

export default function ProtectedFeature({ 
  children, 
  featureName, 
  description, 
  className,
  trigger
}: ProtectedFeatureProps) {
  const { isAuthenticated } = useAuth();
  const [showDialog, setShowDialog] = useState(false);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleProtectedAction = () => {
    setShowDialog(true);
  };

  return (
    <>
      {trigger ? (
        <div onClick={handleProtectedAction} className={className}>
          {trigger}
        </div>
      ) : (
        <div onClick={handleProtectedAction} className={className}>
          {children}
        </div>
      )}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <img 
              src={aniguideLogo192} 
              alt="AniGuide"
              className="w-16 h-16 mx-auto mb-4"
            />
            <DialogTitle className="text-[#06070E]">Create an Account</DialogTitle>
            <DialogDescription className="text-[#2F2D2E]">
              Sign up to access {featureName}: {description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button 
              className="w-full bg-[#9C0D38] hover:bg-[#9C0D38]/90 text-[#DAD2D8]" 
              onClick={() => window.location.href = "/login"}
            >
              Create Account
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-[#9C0D38] text-[#9C0D38] hover:bg-[#9C0D38]/10"
              onClick={() => window.location.href = "/login"}
            >
              I Already Have an Account
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-[#2F2D2E] hover:text-[#2F2D2E]/80"
              onClick={() => setShowDialog(false)}
            >
              Continue Browsing as Guest
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}