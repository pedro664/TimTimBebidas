import { AlertTriangle, RefreshCw, Home, WifiOff, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error?: Error | null;
  resetError?: () => void;
  type?: 'network' | 'storage' | 'generic';
}

/**
 * Reusable error fallback component for different error scenarios
 */
export function ErrorFallback({ error, resetError, type = 'generic' }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const getErrorContent = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff className="h-6 w-6 text-red-600" />,
          title: 'Erro de Conexão',
          description: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
        };
      case 'storage':
        return {
          icon: <HardDrive className="h-6 w-6 text-red-600" />,
          title: 'Erro de Armazenamento',
          description: 'Não foi possível salvar os dados. O armazenamento pode estar cheio.',
        };
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          title: 'Algo deu errado',
          description: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="min-h-[400px] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              {content.icon}
            </div>
            <CardTitle className="text-2xl">{content.title}</CardTitle>
          </div>
          <CardDescription>{content.description}</CardDescription>
        </CardHeader>

        {error && process.env.NODE_ENV === 'development' && (
          <CardContent>
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Detalhes do erro (apenas em desenvolvimento):
              </p>
              <p className="text-xs text-gray-600 font-mono break-all">
                {error.toString()}
              </p>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex gap-3">
          {resetError && (
            <Button onClick={resetError} variant="default" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          )}
          <Button onClick={handleGoHome} variant="outline" className="flex-1">
            <Home className="mr-2 h-4 w-4" />
            Ir para Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Network error fallback
 */
export function NetworkErrorFallback({ resetError }: { resetError?: () => void }) {
  return <ErrorFallback type="network" resetError={resetError} />;
}

/**
 * Storage error fallback
 */
export function StorageErrorFallback({ resetError }: { resetError?: () => void }) {
  return <ErrorFallback type="storage" resetError={resetError} />;
}
