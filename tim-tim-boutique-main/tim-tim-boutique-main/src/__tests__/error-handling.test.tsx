import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ErrorFallback, NetworkErrorFallback, StorageErrorFallback } from '@/components/ErrorFallback';
import {
  AppError,
  ErrorType,
  isQuotaExceededError,
  isNetworkError,
  getErrorMessage,
  retryWithBackoff,
  checkStorageAvailability,
} from '@/lib/errorHandling';

// Mock component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText(/Desculpe, ocorreu um erro inesperado/)).toBeInTheDocument();
  });

  it('should show retry and home buttons', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /Tentar Novamente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ir para Home/i })).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });
});

describe('ErrorFallback Components', () => {
  it('should render generic error fallback', () => {
    render(<ErrorFallback />);

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
  });

  it('should render network error fallback', () => {
    render(<NetworkErrorFallback />);

    expect(screen.getByText('Erro de Conexão')).toBeInTheDocument();
    expect(screen.getByText(/Verifique sua conexão com a internet/)).toBeInTheDocument();
  });

  it('should render storage error fallback', () => {
    render(<StorageErrorFallback />);

    expect(screen.getByText('Erro de Armazenamento')).toBeInTheDocument();
    expect(screen.getByText(/O armazenamento pode estar cheio/)).toBeInTheDocument();
  });

  it('should call resetError when retry button is clicked', async () => {
    const user = userEvent.setup();
    const resetError = vi.fn();

    render(<ErrorFallback resetError={resetError} />);

    const retryButton = screen.getByRole('button', { name: /Tentar Novamente/i });
    await user.click(retryButton);

    expect(resetError).toHaveBeenCalledTimes(1);
  });
});

describe('AppError', () => {
  it('should create error with correct properties', () => {
    const error = new AppError('Test error', ErrorType.NETWORK);

    expect(error.message).toBe('Test error');
    expect(error.type).toBe(ErrorType.NETWORK);
    expect(error.name).toBe('AppError');
  });

  it('should store original error', () => {
    const originalError = new Error('Original');
    const error = new AppError('Wrapped error', ErrorType.UNKNOWN, originalError);

    expect(error.originalError).toBe(originalError);
  });
});

describe('Error Detection Functions', () => {
  it('should detect quota exceeded error', () => {
    const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
    expect(isQuotaExceededError(quotaError)).toBe(true);

    const normalError = new Error('Normal error');
    expect(isQuotaExceededError(normalError)).toBe(false);
  });

  it('should detect network error', () => {
    const networkError = new TypeError('Failed to fetch');
    expect(isNetworkError(networkError)).toBe(true);

    const networkError2 = new Error('Network request failed');
    expect(isNetworkError(networkError2)).toBe(true);

    const normalError = new Error('Normal error');
    expect(isNetworkError(normalError)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('should return message from AppError', () => {
    const error = new AppError('Custom message', ErrorType.VALIDATION);
    expect(getErrorMessage(error)).toBe('Custom message');
  });

  it('should return quota exceeded message', () => {
    const error = new DOMException('Quota exceeded', 'QuotaExceededError');
    const message = getErrorMessage(error);
    expect(message).toContain('armazenamento cheio');
  });

  it('should return network error message', () => {
    const error = new TypeError('Failed to fetch');
    const message = getErrorMessage(error);
    expect(message).toContain('conexão');
  });

  it('should return generic message for unknown errors', () => {
    const error = new Error('Unknown error');
    expect(getErrorMessage(error)).toBe('Unknown error');
  });

  it('should return generic message for non-Error objects', () => {
    const message = getErrorMessage('string error');
    expect(message).toContain('erro inesperado');
  });
});

describe('retryWithBackoff', () => {
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await retryWithBackoff(fn, 3, 100);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, 3, 10);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

    await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow('Always fails');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry validation errors', async () => {
    const validationError = new AppError('Invalid input', ErrorType.VALIDATION);
    const fn = vi.fn().mockRejectedValue(validationError);

    await expect(retryWithBackoff(fn, 3, 10)).rejects.toThrow('Invalid input');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should use exponential backoff', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const startTime = Date.now();
    await retryWithBackoff(fn, 3, 50);
    const duration = Date.now() - startTime;

    // First retry: 50ms, second retry: 100ms = ~150ms total
    expect(duration).toBeGreaterThanOrEqual(100);
  });
});

describe('checkStorageAvailability', () => {
  it('should return true when localStorage is available', () => {
    expect(checkStorageAvailability()).toBe(true);
  });

  it('should return false when localStorage is not available', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('Storage not available');
    });

    const result = checkStorageAvailability();

    expect(result).toBe(false);

    // Restore
    Storage.prototype.setItem = originalSetItem;
  });
});

describe('LocalStorage Error Handling Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should handle quota exceeded gracefully', () => {
    const originalSetItem = Storage.prototype.setItem;
    let callCount = 0;

    Storage.prototype.setItem = vi.fn((key: string, value: string) => {
      callCount++;
      if (callCount === 1) {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      }
      originalSetItem.call(localStorage, key, value);
    });

    // This should trigger quota recovery
    const testData = { test: 'data' };
    localStorage.setItem('test_key', JSON.stringify(testData));

    // Restore
    Storage.prototype.setItem = originalSetItem;
  });
});
