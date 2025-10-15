/**
 * Service for fetching address data from ViaCEP API
 * with enhanced error handling and retry logic
 */

import { retryWithBackoff, handleNetworkError, AppError, ErrorType } from "@/lib/errorHandling";

export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Fetch address data by CEP from ViaCEP API with retry logic
 * @param cep - CEP string (can be formatted or not)
 * @returns Address data or null if not found/error
 */
export async function fetchAddressByCep(cep: string): Promise<AddressData | null> {
  try {
    // Remove non-numeric characters
    const cleanCep = cep.replace(/\D/g, "");

    // Validate CEP format (8 digits)
    if (cleanCep.length !== 8) {
      throw new AppError("CEP deve ter 8 dígitos", ErrorType.VALIDATION);
    }

    // Fetch with retry logic for network errors
    const data = await retryWithBackoff(async () => {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        throw new AppError("Erro ao buscar CEP", ErrorType.NETWORK);
      }

      return response.json() as Promise<CepResponse>;
    }, 2, 1000); // 2 retries, 1 second base delay

    // Check if CEP was not found
    if (data.erro) {
      throw new AppError("CEP não encontrado", ErrorType.NOT_FOUND);
    }

    // Return formatted address data
    return {
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    };
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    
    // Handle different error types
    if (error instanceof AppError) {
      if (error.type === ErrorType.VALIDATION) {
        // Don't show toast for validation errors (handled by form)
        return null;
      }
      if (error.type === ErrorType.NOT_FOUND) {
        // CEP not found - this is expected sometimes
        return null;
      }
    }
    
    // Network errors - show with retry option
    handleNetworkError(error);
    return null;
  }
}

/**
 * Fetch address data with manual retry callback
 * @param cep - CEP string
 * @param onRetry - Callback for retry action
 * @returns Address data or null
 */
export async function fetchAddressByCepWithRetry(
  cep: string,
  onRetry?: () => void
): Promise<AddressData | null> {
  try {
    return await fetchAddressByCep(cep);
  } catch (error) {
    if (onRetry) {
      handleNetworkError(error, onRetry);
    }
    return null;
  }
}

/**
 * Format CEP string to pattern 00000-000
 * @param cep - CEP string
 * @returns Formatted CEP
 */
export function formatCep(cep: string): string {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) return cep;
  return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
}

/**
 * Validate CEP format
 * @param cep - CEP string
 * @returns true if valid format
 */
export function isValidCep(cep: string): boolean {
  const cleanCep = cep.replace(/\D/g, "");
  return cleanCep.length === 8;
}
