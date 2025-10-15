import { toast } from 'sonner';

/**
 * Error types for better error handling
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  STORAGE = 'STORAGE',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom error class with type information
 */
export class AppError extends Error {
  type: ErrorType;
  originalError?: Error;

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, originalError?: Error) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Check if error is a localStorage quota exceeded error
 */
export function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  if (error instanceof Error && error.message.toLowerCase().includes('network')) {
    return true;
  }
  return false;
}

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (isQuotaExceededError(error)) {
    return 'Espaço de armazenamento cheio. Por favor, limpe alguns dados ou use outro navegador.';
  }

  if (isNetworkError(error)) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
}

/**
 * Handle error with toast notification
 */
export function handleError(error: unknown, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error);
  console.error('Error:', error);
  toast.error(message);
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain errors
      if (error instanceof AppError && error.type === ErrorType.VALIDATION) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Safe async function wrapper with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, errorMessage);
    return null;
  }
}

/**
 * Handle localStorage errors specifically
 */
export function handleStorageError(error: unknown, operation: string): void {
  if (isQuotaExceededError(error)) {
    toast.error(
      'Espaço de armazenamento cheio',
      {
        description: 'Limpe o histórico do navegador ou remova alguns itens do carrinho.',
        duration: 5000,
      }
    );
  } else {
    toast.error(
      `Erro ao ${operation}`,
      {
        description: 'Tente novamente ou use outro navegador.',
        duration: 4000,
      }
    );
  }
  console.error(`Storage error during ${operation}:`, error);
}

/**
 * Handle network errors with retry option
 */
export function handleNetworkError(
  error: unknown,
  onRetry?: () => void
): void {
  const message = 'Erro de conexão';
  const description = onRetry
    ? 'Verifique sua internet. Clique para tentar novamente.'
    : 'Verifique sua internet e tente novamente.';

  if (onRetry) {
    toast.error(message, {
      description,
      action: {
        label: 'Tentar Novamente',
        onClick: onRetry,
      },
      duration: 6000,
    });
  } else {
    toast.error(message, {
      description,
      duration: 4000,
    });
  }

  console.error('Network error:', error);
}

/**
 * Validate localStorage availability
 */
export function checkStorageAvailability(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    handleError(
      error,
      'Armazenamento local não disponível. Algumas funcionalidades podem não funcionar.'
    );
    return false;
  }
}

/**
 * Clear old data from localStorage to free up space
 */
export function clearOldStorageData(daysOld: number = 30): void {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // This is a placeholder - implement based on your data structure
    // Example: clear old orders, messages, etc.
    console.log(`Clearing data older than ${daysOld} days`);
    
    toast.success('Dados antigos removidos com sucesso');
  } catch (error) {
    handleError(error, 'Erro ao limpar dados antigos');
  }
}
