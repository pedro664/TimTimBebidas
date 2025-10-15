import { Loader2 } from "lucide-react";

/**
 * Loading spinner component for Suspense fallback
 * Displays a centered loading indicator while lazy-loaded components are being fetched
 */
const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
