import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Shield } from "lucide-react";

interface ProtectedFeatureProps {
  children: React.ReactNode;
  featureName: string;
  description: string;
  className?: string;
}

export default function ProtectedFeature({ 
  children, 
  featureName, 
  description, 
  className = "" 
}: ProtectedFeatureProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-32 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className={`border-2 border-dashed border-muted-foreground/30 ${className}`}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">{featureName} Feature</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full"
            aria-label={`Sign in to access ${featureName}`}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In to Access
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}