import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Erro ao carregar dados',
  message = 'Ocorreu um erro ao carregar as informações. Por favor, tente novamente.',
  onRetry,
  retryLabel = 'Tentar Novamente',
}: ErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 max-w-md">{message}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="mt-6 border-red-300 hover:bg-red-100"
            aria-label={retryLabel}
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
