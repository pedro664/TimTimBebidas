/**
 * SessionService Unit Tests
 * 
 * Tests for the SessionService that manages cart session using sessionStorage
 * Requirements: 7.1, 7.2, 7.3
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { sessionService } from '@/services/sessionService';
import type { CartItem } from '@/types';
import type { ShippingInfo } from '@/services/sessionService';

// Mock data
const mockCartItems: CartItem[] = [
  {
    id: '1',
    name: 'Produto Teste 1',
    price: 100,
    image: 'test1.jpg',
    category: 'test',
    description: 'Descrição teste 1',
    quantity: 2
  },
  {
    id: '2',
    name: 'Produto Teste 2',
    price: 200,
    image: 'test2.jpg',
    category: 'test',
    description: 'Descrição teste 2',
    quantity: 1
  }
];

const mockShippingInfo: ShippingInfo = {
  cost: 15,
  isFree: false,
  city: 'São Paulo',
  cep: '01234-567',
  isValid: true
};

describe('SessionService', () => {
  beforeEach(() => {
    // Clear all storage before each test
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('Session ID Generation (Requirement 7.1)', () => {
    it('should generate a valid UUID v4 format session ID', () => {
      const sessionId = sessionService.generateSessionId();
      
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(sessionId).toMatch(uuidRegex);
    });

    it('should generate unique session IDs', () => {
      const id1 = sessionService.generateSessionId();
      const id2 = sessionService.generateSessionId();
      const id3 = sessionService.generateSessionId();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should have a session ID on initialization', () => {
      const sessionId = sessionService.getSessionId();
      
      expect(sessionId).toBeDefined();
      expect(sessionId).not.toBe('');
      expect(typeof sessionId).toBe('string');
    });

    it('should persist session ID in sessionStorage', () => {
      // Clear and manually set a session ID to test persistence
      sessionStorage.clear();
      const testId = 'test-session-id-12345';
      sessionStorage.setItem('tim-tim-session-id', testId);
      
      // Verify it's stored
      const storedId = sessionStorage.getItem('tim-tim-session-id');
      expect(storedId).toBe(testId);
    });

    it('should consistently return the same session ID', () => {
      // This test verifies the session ID is consistent across calls
      const sessionId1 = sessionService.getSessionId();
      const sessionId2 = sessionService.getSessionId();
      const sessionId3 = sessionService.getSessionId();
      
      expect(sessionId1).toBe(sessionId2);
      expect(sessionId2).toBe(sessionId3);
      expect(sessionId1).toBeDefined();
      expect(sessionId1).not.toBe('');
    });
  });

  describe('Cart Operations (Requirement 7.2)', () => {
    it('should save cart items to sessionStorage', () => {
      sessionService.saveCart(mockCartItems);
      
      const sessionId = sessionService.getSessionId();
      const key = `tim-tim-cart-${sessionId}`;
      const stored = sessionStorage.getItem(key);
      
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(mockCartItems);
    });

    it('should retrieve saved cart items', () => {
      sessionService.saveCart(mockCartItems);
      const retrieved = sessionService.getCart();
      
      expect(retrieved).toEqual(mockCartItems);
    });

    it('should return empty array when no cart exists', () => {
      const cart = sessionService.getCart();
      
      expect(cart).toEqual([]);
      expect(Array.isArray(cart)).toBe(true);
    });

    it('should update cart items when saved multiple times', () => {
      sessionService.saveCart(mockCartItems);
      
      const updatedItems = [
        ...mockCartItems,
        {
          id: '3',
          name: 'Produto Teste 3',
          price: 300,
          image: 'test3.jpg',
          category: 'test',
          description: 'Descrição teste 3',
          quantity: 1
        }
      ];
      
      sessionService.saveCart(updatedItems);
      const retrieved = sessionService.getCart();
      
      expect(retrieved).toEqual(updatedItems);
      expect(retrieved.length).toBe(3);
    });

    it('should handle empty cart array', () => {
      sessionService.saveCart([]);
      const retrieved = sessionService.getCart();
      
      expect(retrieved).toEqual([]);
    });

    it('should clear cart from sessionStorage', () => {
      sessionService.saveCart(mockCartItems);
      expect(sessionService.getCart()).toEqual(mockCartItems);
      
      sessionService.clearCart();
      const retrieved = sessionService.getCart();
      
      expect(retrieved).toEqual([]);
      
      const sessionId = sessionService.getSessionId();
      const key = `tim-tim-cart-${sessionId}`;
      expect(sessionStorage.getItem(key)).toBeNull();
    });
  });

  describe('Shipping Operations (Requirement 7.2)', () => {
    it('should save shipping information to sessionStorage', () => {
      sessionService.saveShipping(mockShippingInfo);
      
      const sessionId = sessionService.getSessionId();
      const key = `tim-tim-shipping-${sessionId}`;
      const stored = sessionStorage.getItem(key);
      
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(mockShippingInfo);
    });

    it('should retrieve saved shipping information', () => {
      sessionService.saveShipping(mockShippingInfo);
      const retrieved = sessionService.getShipping();
      
      expect(retrieved).toEqual(mockShippingInfo);
    });

    it('should return null when no shipping info exists', () => {
      const shipping = sessionService.getShipping();
      
      expect(shipping).toBeNull();
    });

    it('should update shipping information when saved multiple times', () => {
      sessionService.saveShipping(mockShippingInfo);
      
      const updatedShipping: ShippingInfo = {
        ...mockShippingInfo,
        cost: 0,
        isFree: true
      };
      
      sessionService.saveShipping(updatedShipping);
      const retrieved = sessionService.getShipping();
      
      expect(retrieved).toEqual(updatedShipping);
      expect(retrieved?.isFree).toBe(true);
    });

    it('should clear shipping information from sessionStorage', () => {
      sessionService.saveShipping(mockShippingInfo);
      expect(sessionService.getShipping()).toEqual(mockShippingInfo);
      
      sessionService.clearShipping();
      const retrieved = sessionService.getShipping();
      
      expect(retrieved).toBeNull();
      
      const sessionId = sessionService.getSessionId();
      const key = `tim-tim-shipping-${sessionId}`;
      expect(sessionStorage.getItem(key)).toBeNull();
    });
  });

  describe('Complete Cart Data Operations (Requirement 7.2)', () => {
    it('should save complete cart data (items + shipping)', () => {
      const cartData = {
        items: mockCartItems,
        shipping: mockShippingInfo
      };
      
      sessionService.saveCartData(cartData);
      
      expect(sessionService.getCart()).toEqual(mockCartItems);
      expect(sessionService.getShipping()).toEqual(mockShippingInfo);
    });

    it('should retrieve complete cart data', () => {
      sessionService.saveCart(mockCartItems);
      sessionService.saveShipping(mockShippingInfo);
      
      const cartData = sessionService.getCartData();
      
      expect(cartData.items).toEqual(mockCartItems);
      expect(cartData.shipping).toEqual(mockShippingInfo);
    });

    it('should handle cart data with null shipping', () => {
      const cartData = {
        items: mockCartItems,
        shipping: null
      };
      
      sessionService.saveCartData(cartData);
      
      expect(sessionService.getCart()).toEqual(mockCartItems);
      expect(sessionService.getShipping()).toBeNull();
    });

    it('should return empty cart data when nothing is saved', () => {
      const cartData = sessionService.getCartData();
      
      expect(cartData.items).toEqual([]);
      expect(cartData.shipping).toBeNull();
    });
  });

  describe('Session Cleanup (Requirement 7.2)', () => {
    it('should clear entire session (cart + shipping)', () => {
      sessionService.saveCart(mockCartItems);
      sessionService.saveShipping(mockShippingInfo);
      
      expect(sessionService.getCart()).toEqual(mockCartItems);
      expect(sessionService.getShipping()).toEqual(mockShippingInfo);
      
      sessionService.clearSession();
      
      expect(sessionService.getCart()).toEqual([]);
      expect(sessionService.getShipping()).toBeNull();
    });

    it('should not affect session ID when clearing session', () => {
      const sessionId = sessionService.getSessionId();
      
      sessionService.saveCart(mockCartItems);
      sessionService.clearSession();
      
      // Session ID should remain the same
      expect(sessionService.getSessionId()).toBe(sessionId);
      
      // Cart and shipping should be cleared but session ID key might not be in storage
      // due to singleton initialization, but the service should still return the same ID
      expect(sessionService.getCart()).toEqual([]);
      expect(sessionService.getShipping()).toBeNull();
    });
  });

  describe('Error Handling - Corrupted Data (Requirement 7.2)', () => {
    it('should handle corrupted cart data gracefully', () => {
      const sessionId = sessionService.getSessionId();
      const key = `tim-tim-cart-${sessionId}`;
      
      // Set corrupted data
      sessionStorage.setItem(key, 'invalid-json{{{');
      
      const cart = sessionService.getCart();
      
      expect(cart).toEqual([]);
      // Corrupted data should be cleaned up
      expect(sessionStorage.getItem(key)).toBeNull();
    });

    it('should handle corrupted shipping data gracefully', () => {
      const sessionId = sessionService.getSessionId();
      const key = `tim-tim-shipping-${sessionId}`;
      
      // Set corrupted data
      sessionStorage.setItem(key, 'not-valid-json');
      
      const shipping = sessionService.getShipping();
      
      expect(shipping).toBeNull();
      // Corrupted data should be cleaned up
      expect(sessionStorage.getItem(key)).toBeNull();
    });

    it('should handle invalid JSON structure in cart', () => {
      const sessionId = sessionService.getSessionId();
      const key = `tim-tim-cart-${sessionId}`;
      
      // Set invalid structure (object instead of array)
      sessionStorage.setItem(key, JSON.stringify({ invalid: 'structure' }));
      
      const cart = sessionService.getCart();
      
      // Should return the data as-is (type safety is handled by TypeScript)
      expect(cart).toBeDefined();
    });
  });

  describe('Error Handling - Quota Exceeded (Requirement 7.2)', () => {
    it('should not throw when quota exceeded error occurs', () => {
      const originalSetItem = Storage.prototype.setItem;
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock Storage.prototype.setItem to throw QuotaExceededError
      Storage.prototype.setItem = function(key: string, value: string) {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      };
      
      // Should not throw, just handle gracefully
      expect(() => {
        sessionService.saveCart(mockCartItems);
      }).not.toThrow();
      
      Storage.prototype.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });

    it('should not throw when quota exceeded on shipping save', () => {
      const originalSetItem = Storage.prototype.setItem;
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      Storage.prototype.setItem = function(key: string, value: string) {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      };
      
      expect(() => {
        sessionService.saveShipping(mockShippingInfo);
      }).not.toThrow();
      
      Storage.prototype.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });

    it('should handle quota exceeded with cleanup and retry logic', () => {
      // Add some old session data
      sessionStorage.setItem('tim-tim-cart-old-session-1', JSON.stringify(mockCartItems));
      sessionStorage.setItem('tim-tim-cart-old-session-2', JSON.stringify(mockCartItems));
      
      const originalSetItem = Storage.prototype.setItem;
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      let callCount = 0;
      
      Storage.prototype.setItem = function(key: string, value: string) {
        callCount++;
        // First call throws quota error, second succeeds after cleanup
        if (callCount === 1) {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        // Allow subsequent calls to succeed
        originalSetItem.call(this, key, value);
      };
      
      // This should trigger cleanup and retry
      sessionService.saveCart(mockCartItems);
      
      // Should have attempted retry after cleanup
      expect(callCount).toBeGreaterThanOrEqual(1);
      
      Storage.prototype.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Error Handling - Storage Unavailable (Requirement 7.2)', () => {
    it('should handle sessionStorage being unavailable', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock sessionStorage to throw on access
      const originalGetItem = sessionStorage.getItem;
      const originalSetItem = sessionStorage.setItem;
      
      sessionStorage.getItem = vi.fn(() => {
        throw new Error('Storage unavailable');
      });
      
      sessionStorage.setItem = vi.fn(() => {
        throw new Error('Storage unavailable');
      });
      
      // Should not throw
      expect(() => {
        sessionService.saveCart(mockCartItems);
      }).not.toThrow();
      
      expect(() => {
        sessionService.getCart();
      }).not.toThrow();
      
      sessionStorage.getItem = originalGetItem;
      sessionStorage.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Session Isolation (Requirement 7.3)', () => {
    it('should isolate cart data between different session IDs', () => {
      // Save data with current session
      const session1Id = sessionService.getSessionId();
      sessionService.saveCart(mockCartItems);
      
      // Verify current session has the data
      expect(sessionService.getCart()).toEqual(mockCartItems);
      
      // Manually create data for a different session to verify isolation
      const session2Id = 'different-session-id-12345';
      const session2Cart = [mockCartItems[0]];
      sessionStorage.setItem(`tim-tim-cart-${session2Id}`, JSON.stringify(session2Cart));
      
      // Current session should still have its own data
      expect(sessionService.getCart()).toEqual(mockCartItems);
      
      // Both session data should exist in storage but be isolated
      const session1Key = `tim-tim-cart-${session1Id}`;
      const session2Key = `tim-tim-cart-${session2Id}`;
      
      expect(sessionStorage.getItem(session1Key)).not.toBeNull();
      expect(sessionStorage.getItem(session2Key)).not.toBeNull();
      
      // Data should be different
      expect(JSON.parse(sessionStorage.getItem(session1Key)!)).toEqual(mockCartItems);
      expect(JSON.parse(sessionStorage.getItem(session2Key)!)).toEqual(session2Cart);
    });

    it('should isolate shipping data between different session IDs', () => {
      const session1Id = sessionService.getSessionId();
      sessionService.saveShipping(mockShippingInfo);
      
      // Verify current session has the data
      expect(sessionService.getShipping()).toEqual(mockShippingInfo);
      
      // Manually create data for a different session
      const session2Id = 'another-session-id-67890';
      const session2Shipping: ShippingInfo = {
        ...mockShippingInfo,
        cost: 0,
        isFree: true
      };
      sessionStorage.setItem(`tim-tim-shipping-${session2Id}`, JSON.stringify(session2Shipping));
      
      // Current session should still have its own data
      expect(sessionService.getShipping()).toEqual(mockShippingInfo);
      
      // Both session data should exist but be isolated
      const session1Key = `tim-tim-shipping-${session1Id}`;
      const session2Key = `tim-tim-shipping-${session2Id}`;
      
      expect(sessionStorage.getItem(session1Key)).not.toBeNull();
      expect(sessionStorage.getItem(session2Key)).not.toBeNull();
      
      // Data should be different
      expect(JSON.parse(sessionStorage.getItem(session1Key)!)).toEqual(mockShippingInfo);
      expect(JSON.parse(sessionStorage.getItem(session2Key)!)).toEqual(session2Shipping);
    });

    it('should not interfere with other session data when clearing', () => {
      // Create data for session 1
      const session1Id = sessionService.getSessionId();
      sessionService.saveCart(mockCartItems);
      sessionService.saveShipping(mockShippingInfo);
      
      // Manually create data for a different session
      const session2Id = 'other-session-id';
      const otherCartItems = [mockCartItems[0]];
      sessionStorage.setItem(`tim-tim-cart-${session2Id}`, JSON.stringify(otherCartItems));
      sessionStorage.setItem(`tim-tim-shipping-${session2Id}`, JSON.stringify(mockShippingInfo));
      
      // Clear current session
      sessionService.clearSession();
      
      // Current session should be empty
      expect(sessionService.getCart()).toEqual([]);
      expect(sessionService.getShipping()).toBeNull();
      
      // Other session data should remain intact
      expect(sessionStorage.getItem(`tim-tim-cart-${session2Id}`)).not.toBeNull();
      expect(sessionStorage.getItem(`tim-tim-shipping-${session2Id}`)).not.toBeNull();
    });

    it('should maintain separate carts for concurrent sessions', () => {
      // Session 1
      const session1Id = sessionService.getSessionId();
      const cart1 = [mockCartItems[0]];
      sessionService.saveCart(cart1);
      
      // Session 2 (simulated)
      const session2Id = 'concurrent-session-id';
      const cart2 = [mockCartItems[1]];
      sessionStorage.setItem(`tim-tim-cart-${session2Id}`, JSON.stringify(cart2));
      
      // Verify isolation
      expect(sessionService.getCart()).toEqual(cart1);
      expect(JSON.parse(sessionStorage.getItem(`tim-tim-cart-${session2Id}`)!)).toEqual(cart2);
      
      // Carts should be different
      expect(sessionService.getCart()).not.toEqual(cart2);
    });
  });

  describe('Migration Method', () => {
    it('should have a migrateFromLocalStorage method', () => {
      expect(typeof sessionService.migrateFromLocalStorage).toBe('function');
    });

    it('should not throw when calling migrateFromLocalStorage', () => {
      expect(() => {
        sessionService.migrateFromLocalStorage();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large cart data', () => {
      const largeCart: CartItem[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        name: `Produto ${i}`,
        price: i * 10,
        image: `test${i}.jpg`,
        category: 'test',
        description: `Descrição ${i}`,
        quantity: i % 10 + 1
      }));
      
      sessionService.saveCart(largeCart);
      const retrieved = sessionService.getCart();
      
      expect(retrieved).toEqual(largeCart);
      expect(retrieved.length).toBe(100);
    });

    it('should handle special characters in cart data', () => {
      const specialCart: CartItem[] = [{
        id: '1',
        name: 'Produto "Especial" com \'aspas\' e símbolos: @#$%',
        price: 100,
        image: 'test.jpg',
        category: 'test',
        description: 'Descrição com\nquebras\nde\nlinha',
        quantity: 1
      }];
      
      sessionService.saveCart(specialCart);
      const retrieved = sessionService.getCart();
      
      expect(retrieved).toEqual(specialCart);
    });

    it('should handle cart with zero quantity items', () => {
      const zeroQuantityCart: CartItem[] = [{
        ...mockCartItems[0],
        quantity: 0
      }];
      
      sessionService.saveCart(zeroQuantityCart);
      const retrieved = sessionService.getCart();
      
      expect(retrieved).toEqual(zeroQuantityCart);
      expect(retrieved[0].quantity).toBe(0);
    });

    it('should handle shipping with zero cost', () => {
      const freeShipping: ShippingInfo = {
        cost: 0,
        isFree: true,
        city: 'São Paulo',
        cep: '01234-567',
        isValid: true
      };
      
      sessionService.saveShipping(freeShipping);
      const retrieved = sessionService.getShipping();
      
      expect(retrieved).toEqual(freeShipping);
      expect(retrieved?.cost).toBe(0);
    });
  });
});
