/**
 * SessionService - Manages cart session using sessionStorage
 * 
 * This service provides session-based storage for shopping cart data,
 * ensuring each browser session has its own isolated cart.
 * 
 * Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { CartItem } from '@/types';

interface ShippingInfo {
  cost: number;
  isFree: boolean;
  city?: string;
  cep?: string;
  isValid: boolean;
}

interface CartData {
  items: CartItem[];
  shipping: ShippingInfo | null;
}

// Storage keys
const SESSION_ID_KEY = 'tim-tim-session-id';
const CART_KEY_PREFIX = 'tim-tim-cart-';
const SHIPPING_KEY_PREFIX = 'tim-tim-shipping-';

class SessionService {
  private sessionId: string;
  private isStorageAvailable: boolean;

  constructor() {
    this.isStorageAvailable = this.checkStorageAvailability();
    this.sessionId = this.initializeSessionId();
  }

  /**
   * Check if sessionStorage is available
   * Requirement: 4.5 - Error handling for unavailable storage
   */
  private checkStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('⚠️ sessionStorage não disponível. Carrinho não será persistido.', error);
      return false;
    }
  }

  /**
   * Initialize or retrieve session ID
   * Requirements: 2.1, 2.2, 2.5
   */
  private initializeSessionId(): string {
    if (!this.isStorageAvailable) {
      return this.generateSessionId();
    }

    try {
      const existingId = sessionStorage.getItem(SESSION_ID_KEY);
      if (existingId) {
        return existingId;
      }

      const newId = this.generateSessionId();
      sessionStorage.setItem(SESSION_ID_KEY, newId);
      return newId;
    } catch (error) {
      console.error('Erro ao inicializar ID de sessão:', error);
      return this.generateSessionId();
    }
  }

  /**
   * Generate a unique session ID using UUID v4
   * Requirement: 2.1
   */
  generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Get current session ID
   * Requirement: 2.2
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Safely get item from sessionStorage with error handling
   * Requirement: 4.5 - Error handling for corrupted data
   */
  private safeGetItem<T>(key: string, defaultValue: T): T {
    if (!this.isStorageAvailable) {
      return defaultValue;
    }

    try {
      const item = sessionStorage.getItem(key);
      if (!item) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Erro ao ler ${key}:`, error);
      // Clean corrupted data
      try {
        sessionStorage.removeItem(key);
      } catch {
        // Ignore cleanup errors
      }
      return defaultValue;
    }
  }

  /**
   * Safely set item to sessionStorage with error handling
   * Requirement: 4.5 - Error handling for quota exceeded
   */
  private safeSetItem(key: string, value: any): boolean {
    if (!this.isStorageAvailable) {
      return false;
    }

    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('⚠️ Quota de sessionStorage excedida. Tentando limpar dados antigos...');
        this.clearOldSessions();
        
        // Try again after cleanup
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          console.error('❌ Quota excedida mesmo após limpeza');
          return false;
        }
      }
      console.error(`Erro ao salvar ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear old session data to free up space
   * Requirement: 4.5
   */
  private clearOldSessions(): void {
    if (!this.isStorageAvailable) return;

    try {
      const currentCartKey = `${CART_KEY_PREFIX}${this.sessionId}`;
      const currentShippingKey = `${SHIPPING_KEY_PREFIX}${this.sessionId}`;

      // Remove all cart and shipping keys except current session
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && 
            (key.startsWith(CART_KEY_PREFIX) || key.startsWith(SHIPPING_KEY_PREFIX)) &&
            key !== currentCartKey && 
            key !== currentShippingKey) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Erro ao limpar sessões antigas:', error);
    }
  }

  /**
   * Save cart items to session
   * Requirements: 1.1, 4.1, 4.3
   */
  saveCart(items: CartItem[]): void {
    const key = `${CART_KEY_PREFIX}${this.sessionId}`;
    const success = this.safeSetItem(key, items);
    
    if (!success && this.isStorageAvailable) {
      console.warn('⚠️ Não foi possível salvar o carrinho na sessão');
    }
  }

  /**
   * Get cart items from session
   * Requirements: 1.2, 4.4
   */
  getCart(): CartItem[] {
    const key = `${CART_KEY_PREFIX}${this.sessionId}`;
    return this.safeGetItem<CartItem[]>(key, []);
  }

  /**
   * Clear cart from session
   * Requirement: 4.5
   */
  clearCart(): void {
    if (!this.isStorageAvailable) return;

    const key = `${CART_KEY_PREFIX}${this.sessionId}`;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  }

  /**
   * Save shipping information to session
   * Requirements: 1.1, 4.1, 4.3
   */
  saveShipping(shipping: ShippingInfo): void {
    const key = `${SHIPPING_KEY_PREFIX}${this.sessionId}`;
    const success = this.safeSetItem(key, shipping);
    
    if (!success && this.isStorageAvailable) {
      console.warn('⚠️ Não foi possível salvar informações de frete na sessão');
    }
  }

  /**
   * Get shipping information from session
   * Requirements: 1.2, 4.4
   */
  getShipping(): ShippingInfo | null {
    const key = `${SHIPPING_KEY_PREFIX}${this.sessionId}`;
    return this.safeGetItem<ShippingInfo | null>(key, null);
  }

  /**
   * Clear shipping information from session
   * Requirement: 4.5
   */
  clearShipping(): void {
    if (!this.isStorageAvailable) return;

    const key = `${SHIPPING_KEY_PREFIX}${this.sessionId}`;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao limpar frete:', error);
    }
  }

  /**
   * Save complete cart data (items + shipping)
   * Requirements: 1.1, 4.1, 4.3
   */
  saveCartData(data: CartData): void {
    this.saveCart(data.items);
    if (data.shipping) {
      this.saveShipping(data.shipping);
    }
  }

  /**
   * Get complete cart data (items + shipping)
   * Requirements: 1.2, 4.4
   */
  getCartData(): CartData {
    return {
      items: this.getCart(),
      shipping: this.getShipping()
    };
  }

  /**
   * Clear entire session (cart + shipping)
   * Requirements: 2.3, 4.5
   */
  clearSession(): void {
    this.clearCart();
    this.clearShipping();
  }

  /**
   * Migrate data from localStorage to sessionStorage
   * Requirements: 1.2, 2.4
   * 
   * Note: This method is kept for backward compatibility.
   * The actual migration logic is now in src/lib/migration.ts
   */
  migrateFromLocalStorage(): void {
    if (!this.isStorageAvailable) {
      console.warn('⚠️ sessionStorage não disponível. Migração não realizada.');
      return;
    }

    // Import and use the migration utility
    import('@/lib/migration').then(({ migrateFromLocalStorage }) => {
      migrateFromLocalStorage();
    }).catch((error) => {
      console.error('Erro ao carregar módulo de migração:', error);
    });
  }
}

// Export singleton instance
export const sessionService = new SessionService();

// Export types for use in other modules
export type { ShippingInfo, CartData };
