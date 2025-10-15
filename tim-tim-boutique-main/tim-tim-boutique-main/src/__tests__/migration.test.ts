/**
 * Migration Utility Tests
 * 
 * Tests for the localStorage to sessionStorage migration utility
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  migrateFromLocalStorage, 
  hasMigrated, 
  forceMigration,
  getMigrationStatus 
} from '@/lib/migration';
import { sessionService } from '@/services/sessionService';

// Mock data
const mockCartData = [
  { id: '1', name: 'Product 1', price: 100, quantity: 2 },
  { id: '2', name: 'Product 2', price: 200, quantity: 1 }
];

const mockShippingData = {
  cost: 15,
  isFree: false,
  city: 'São Paulo',
  cep: '01234-567',
  isValid: true
};

describe('Migration Utility', () => {
  beforeEach(() => {
    // Clear all storage before each test
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('hasMigrated', () => {
    it('should return false when migration flag is not set', () => {
      expect(hasMigrated()).toBe(false);
    });

    it('should return true when migration flag is set', () => {
      sessionStorage.setItem('tim-tim-migrated', 'true');
      expect(hasMigrated()).toBe(true);
    });

    it('should handle sessionStorage errors gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(hasMigrated()).toBe(false);
      getItemSpy.mockRestore();
    });
  });

  describe('getMigrationStatus', () => {
    it('should return correct status when no data exists', () => {
      const status = getMigrationStatus();
      expect(status.migrated).toBe(false);
      expect(status.hasOldCart).toBe(false);
      expect(status.hasOldShipping).toBe(false);
    });

    it('should detect old cart data in localStorage', () => {
      localStorage.setItem('tim-tim-cart', JSON.stringify(mockCartData));
      
      const status = getMigrationStatus();
      expect(status.hasOldCart).toBe(true);
      expect(status.hasOldShipping).toBe(false);
    });

    it('should detect old shipping data in localStorage', () => {
      localStorage.setItem('tim-tim-shipping', JSON.stringify(mockShippingData));
      
      const status = getMigrationStatus();
      expect(status.hasOldCart).toBe(false);
      expect(status.hasOldShipping).toBe(true);
    });

    it('should detect migration flag', () => {
      sessionStorage.setItem('tim-tim-migrated', 'true');
      
      const status = getMigrationStatus();
      expect(status.migrated).toBe(true);
    });
  });

  describe('migrateFromLocalStorage - Cart Migration', () => {
    it('should migrate cart data from localStorage to sessionStorage (Requirement 3.1)', () => {
      // Setup old data
      localStorage.setItem('tim-tim-cart', JSON.stringify(mockCartData));

      // Run migration
      const result = migrateFromLocalStorage();

      // Verify result
      expect(result.success).toBe(true);
      expect(result.cartMigrated).toBe(true);
      expect(result.errors).toHaveLength(0);

      // Verify data was migrated
      const migratedCart = sessionService.getCart();
      expect(migratedCart).toEqual(mockCartData);
    });

    it('should handle empty cart gracefully', () => {
      localStorage.setItem('tim-tim-cart', JSON.stringify([]));

      const result = migrateFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.cartMigrated).toBe(true);
      expect(sessionService.getCart()).toEqual([]);
    });

    it('should handle missing cart data', () => {
      const result = migrateFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.cartMigrated).toBe(false);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle corrupted cart data (Requirement 3.5)', () => {
      localStorage.setItem('tim-tim-cart', 'invalid-json{{{');

      const result = migrateFromLocalStorage();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Dados corrompidos');
    });

    it('should handle invalid cart structure', () => {
      localStorage.setItem('tim-tim-cart', JSON.stringify({ invalid: 'structure' }));

      const result = migrateFromLocalStorage();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('migrateFromLocalStorage - Shipping Migration', () => {
    it('should migrate shipping data from localStorage to sessionStorage (Requirement 3.1)', () => {
      localStorage.setItem('tim-tim-shipping', JSON.stringify(mockShippingData));

      const result = migrateFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.shippingMigrated).toBe(true);
      expect(result.errors).toHaveLength(0);

      const migratedShipping = sessionService.getShipping();
      expect(migratedShipping).toEqual(mockShippingData);
    });

    it('should handle missing shipping data', () => {
      const result = migrateFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.shippingMigrated).toBe(false);
      expect(sessionService.getShipping()).toBeNull();
    });

    it('should handle corrupted shipping data (Requirement 3.5)', () => {
      localStorage.setItem('tim-tim-shipping', 'invalid-json');

      const result = migrateFromLocalStorage();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('migrateFromLocalStorage - Complete Migration', () => {
    it('should migrate both cart and shipping data (Requirement 3.1)', () => {
      localStorage.setItem('tim-tim-cart', JSON.stringify(mockCartData));
      localStorage.setItem('tim-tim-shipping', JSON.stringify(mockShippingData));

      const result = migrateFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.cartMigrated).toBe(true);
      expect(result.shippingMigrated).toBe(true);
      expect(result.errors).toHaveLength(0);

      expect(sessionService.getCart()).toEqual(mockCartData);
      expect(sessionService.getShipping()).toEqual(mockShippingData);
    });

    it('should clean up localStorage after successful migration (Requirement 3.3)', () => {
      localStorage.setItem('tim-tim-cart', JSON.stringify(mockCartData));
      localStorage.setItem('tim-tim-shipping', JSON.stringify(mockShippingData));

      migrateFromLocalStorage();

      expect(localStorage.getItem('tim-tim-cart')).toBeNull();
      expect(localStorage.getItem('tim-tim-shipping')).toBeNull();
    });

    it('should set migration flag after completion (Requirement 3.2)', () => {
      localStorage.setItem('tim-tim-cart', JSON.stringify(mockCartData));

      migrateFromLocalStorage();

      expect(hasMigrated()).toBe(true);
      expect(sessionStorage.getItem('tim-tim-migrated')).toBe('true');
    });

    it('should not migrate twice in same session (Requirement 3.2)', () => {
      localStorage.setItem('tim-tim-cart', JSON.stringify(mockCartData));

      // First migration
      const result1 = migrateFromLocalStorage();
      expect(result1.cartMigrated).toBe(true);

      // Add new data to localStorage
      const newData = [{ id: '3', name: 'Product 3', price: 300, quantity: 1 }];
      localStorage.setItem('tim-tim-cart', JSON.stringify(newData));

      // Second migration should be skipped
      const result2 = migrateFromLocalStorage();
      expect(result2.cartMigrated).toBe(false);

      // Should still have old data, not new
      expect(sessionService.getCart()).toEqual(mockCartData);
    });

    it('should mark as migrated even on error to prevent retry loops (Requirement 3.5)', () => {
      localStorage.setItem('tim-tim-cart', 'corrupted-data');

      const result = migrateFromLocalStorage();

      expect(result.success).toBe(false);
      expect(hasMigrated()).toBe(true); // Should still be marked as migrated
    });
  });

  describe('forceMigration', () => {
    it('should clear migration flag and re-run migration', () => {
      // First migration
      localStorage.setItem('tim-tim-cart', JSON.stringify(mockCartData));
      migrateFromLocalStorage();
      expect(hasMigrated()).toBe(true);

      // Clear session storage to simulate new data
      sessionService.clearCart();
      
      // Add new data
      const newData = [{ id: '3', name: 'Product 3', price: 300, quantity: 1 }];
      localStorage.setItem('tim-tim-cart', JSON.stringify(newData));

      // Force migration
      const result = forceMigration();

      expect(result.success).toBe(true);
      expect(result.cartMigrated).toBe(true);
      expect(sessionService.getCart()).toEqual(newData);
    });
  });

  describe('Error Handling', () => {
    it('should handle sessionStorage quota exceeded error', () => {
      // Mock only sessionStorage setItem, not all Storage
      const originalSetItem = sessionStorage.setItem;
      let callCount = 0;
      
      sessionStorage.setItem = vi.fn((key, value) => {
        callCount++;
        // Allow migration flag to be set on second attempt
        if (callCount === 1) {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        originalSetItem.call(sessionStorage, key, value);
      });

      localStorage.setItem('tim-tim-cart', JSON.stringify(mockCartData));

      const result = migrateFromLocalStorage();

      // Should still mark as migrated to prevent retry loops
      expect(hasMigrated()).toBe(true);
      
      sessionStorage.setItem = originalSetItem;
    });

    it('should handle partial migration failures gracefully', () => {
      // Set up valid cart data but corrupted shipping data
      localStorage.setItem('tim-tim-cart', JSON.stringify(mockCartData));
      localStorage.setItem('tim-tim-shipping', 'corrupted-shipping-data');

      const result = migrateFromLocalStorage();

      // Should fail because shipping migration failed
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Frete');
      
      // But cart should still be migrated
      expect(result.cartMigrated).toBe(true);
      expect(sessionService.getCart()).toEqual(mockCartData);
      
      // Should still mark as migrated to prevent retry loops
      expect(hasMigrated()).toBe(true);
    });

    it('should handle cleanup errors gracefully', () => {
      localStorage.setItem('tim-tim-cart', JSON.stringify(mockCartData));
      
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error('Cannot remove');
      });

      const result = migrateFromLocalStorage();

      // Migration should still succeed even if cleanup fails
      expect(result.success).toBe(true);
      expect(sessionService.getCart()).toEqual(mockCartData);
      
      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('Logging', () => {
    it('should log migration progress', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      localStorage.setItem('tim-tim-cart', JSON.stringify(mockCartData));
      localStorage.setItem('tim-tim-shipping', JSON.stringify(mockShippingData));

      migrateFromLocalStorage();

      const allLogs = consoleSpy.mock.calls.map(call => call[0]).join(' ');
      
      expect(allLogs).toContain('Iniciando migração');
      expect(allLogs).toContain('Carrinho migrado');
      expect(allLogs).toContain('frete migradas');
      expect(allLogs).toContain('Limpeza');
      expect(allLogs).toContain('concluída com sucesso');
      
      consoleSpy.mockRestore();
    });

    it('should log when no data needs migration', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      migrateFromLocalStorage();

      const allLogs = consoleSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allLogs).toContain('Nenhum dado para migrar');
      
      consoleSpy.mockRestore();
    });

    it('should log errors during migration', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      localStorage.setItem('tim-tim-cart', 'invalid-json');

      migrateFromLocalStorage();

      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should log when migration is skipped', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // First migration
      migrateFromLocalStorage();
      consoleSpy.mockClear();
      
      // Second migration should be skipped
      migrateFromLocalStorage();

      const allLogs = consoleSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allLogs).toContain('já foi realizada');
      
      consoleSpy.mockRestore();
    });
  });
});
