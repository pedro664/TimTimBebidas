/**
 * Tests for CartContext with SessionService integration
 * 
 * This test suite verifies that CartContext correctly:
 * - Uses sessionService instead of localStorage
 * - Performs automatic migration on initialization
 * - Syncs cart and shipping data with sessionStorage
 * - Maintains the same public interface
 * 
 * Requirements: 3.1, 3.4, 1.1, 1.2, 1.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { sessionService } from '@/services/sessionService';
import * as migration from '@/lib/migration';

// Mock the migration module
vi.mock('@/lib/migration', () => ({
  migrateFromLocalStorage: vi.fn()
}));

describe('CartContext with SessionService', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Reset sessionService state
    sessionService.clearSession();
  });

  describe('Initialization', () => {
    it('should call migration on initialization', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      expect(migration.migrateFromLocalStorage).toHaveBeenCalledOnce();
      expect(result.current.items).toEqual([]);
    });

    it('should load cart from sessionStorage on initialization', () => {
      // Pre-populate sessionStorage with cart data
      const mockCart = [
        {
          id: '1',
          name: 'Test Product',
          price: 10,
          quantity: 2,
          category: 'Test',
          country: 'Test',
          image: 'test.jpg',
          description: 'Test',
          alcoholContent: '5%',
          volume: '500ml',
          tastingNotes: [],
          pairing: [],
          stock: 10
        }
      ];
      
      sessionService.saveCart(mockCart);

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('1');
      expect(result.current.items[0].quantity).toBe(2);
    });

    it('should load shipping from sessionStorage on initialization', () => {
      // Pre-populate sessionStorage with shipping data
      const mockShipping = {
        cost: 15,
        isFree: false,
        city: 'São Paulo',
        cep: '01234-567',
        isValid: true
      };
      
      sessionService.saveShipping(mockShipping);

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      expect(result.current.shipping).toEqual(mockShipping);
    });
  });

  describe('Cart Operations', () => {
    it('should add item and sync with sessionStorage', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      const product = {
        id: '1',
        name: 'Test Wine',
        price: 50,
        category: 'Vinho',
        country: 'Brasil',
        image: 'wine.jpg',
        description: 'Test wine',
        alcoholContent: '13%',
        volume: '750ml',
        tastingNotes: ['Fruity'],
        pairing: ['Cheese'],
        stock: 10
      };

      act(() => {
        result.current.addItem(product);
      });

      // Verify state updated
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('1');
      expect(result.current.items[0].quantity).toBe(1);

      // Wait for useEffect to sync
      await waitFor(() => {
        const savedCart = sessionService.getCart();
        expect(savedCart).toHaveLength(1);
        expect(savedCart[0].id).toBe('1');
      });
    });

    it('should remove item and sync with sessionStorage', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      const product = {
        id: '1',
        name: 'Test Product',
        price: 10,
        category: 'Test',
        country: 'Test',
        image: 'test.jpg',
        description: 'Test',
        alcoholContent: '5%',
        volume: '500ml',
        tastingNotes: [],
        pairing: [],
        stock: 10
      };

      // Add item first
      act(() => {
        result.current.addItem(product);
      });

      expect(result.current.items).toHaveLength(1);

      // Remove item
      act(() => {
        result.current.removeItem('1');
      });

      expect(result.current.items).toHaveLength(0);

      // Wait for useEffect to sync
      await waitFor(() => {
        const savedCart = sessionService.getCart();
        expect(savedCart).toHaveLength(0);
      });
    });

    it('should update quantity and sync with sessionStorage', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      const product = {
        id: '1',
        name: 'Test Product',
        price: 10,
        category: 'Test',
        country: 'Test',
        image: 'test.jpg',
        description: 'Test',
        alcoholContent: '5%',
        volume: '500ml',
        tastingNotes: [],
        pairing: [],
        stock: 10
      };

      // Add item
      act(() => {
        result.current.addItem(product);
      });

      // Update quantity
      act(() => {
        result.current.updateQuantity('1', 5);
      });

      expect(result.current.items[0].quantity).toBe(5);

      // Wait for useEffect to sync
      await waitFor(() => {
        const savedCart = sessionService.getCart();
        expect(savedCart[0].quantity).toBe(5);
      });
    });

    it('should clear cart and sync with sessionStorage', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      const product = {
        id: '1',
        name: 'Test Product',
        price: 10,
        category: 'Test',
        country: 'Test',
        image: 'test.jpg',
        description: 'Test',
        alcoholContent: '5%',
        volume: '500ml',
        tastingNotes: [],
        pairing: [],
        stock: 10
      };

      // Add item
      act(() => {
        result.current.addItem(product);
      });

      expect(result.current.items).toHaveLength(1);

      // Clear cart
      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);

      // Wait for useEffect to sync
      await waitFor(() => {
        const savedCart = sessionService.getCart();
        expect(savedCart).toHaveLength(0);
      });
    });
  });

  describe('Shipping Operations', () => {
    it('should set shipping and sync with sessionStorage', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      const shipping = {
        cost: 20,
        isFree: false,
        city: 'Rio de Janeiro',
        cep: '20000-000',
        isValid: true
      };

      act(() => {
        result.current.setShipping(shipping);
      });

      expect(result.current.shipping).toEqual(shipping);

      // Wait for useEffect to sync
      await waitFor(() => {
        const savedShipping = sessionService.getShipping();
        expect(savedShipping).toEqual(shipping);
      });
    });

    it('should clear shipping when set to null', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      const shipping = {
        cost: 20,
        isFree: false,
        city: 'Rio de Janeiro',
        cep: '20000-000',
        isValid: true
      };

      // Set shipping first
      act(() => {
        result.current.setShipping(shipping);
      });

      await waitFor(() => {
        expect(sessionService.getShipping()).toEqual(shipping);
      });

      // Clear shipping
      act(() => {
        result.current.setShipping(null);
      });

      expect(result.current.shipping).toBeNull();

      // Wait for useEffect to sync
      await waitFor(() => {
        const savedShipping = sessionService.getShipping();
        expect(savedShipping).toBeNull();
      });
    });
  });

  describe('Calculations', () => {
    it('should calculate total correctly', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      const product1 = {
        id: '1',
        name: 'Product 1',
        price: 10,
        category: 'Test',
        country: 'Test',
        image: 'test.jpg',
        description: 'Test',
        alcoholContent: '5%',
        volume: '500ml',
        tastingNotes: [],
        pairing: [],
        stock: 10
      };

      const product2 = {
        id: '2',
        name: 'Product 2',
        price: 20,
        category: 'Test',
        country: 'Test',
        image: 'test.jpg',
        description: 'Test',
        alcoholContent: '5%',
        volume: '500ml',
        tastingNotes: [],
        pairing: [],
        stock: 10
      };

      act(() => {
        result.current.addItem(product1);
        result.current.addItem(product2);
        result.current.updateQuantity('1', 2);
      });

      // 2 * 10 + 1 * 20 = 40
      expect(result.current.total).toBe(40);
      expect(result.current.itemCount).toBe(3);
    });

    it('should calculate grandTotal with shipping', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      const product = {
        id: '1',
        name: 'Product 1',
        price: 50,
        category: 'Test',
        country: 'Test',
        image: 'test.jpg',
        description: 'Test',
        alcoholContent: '5%',
        volume: '500ml',
        tastingNotes: [],
        pairing: [],
        stock: 10
      };

      const shipping = {
        cost: 15,
        isFree: false,
        city: 'São Paulo',
        cep: '01234-567',
        isValid: true
      };

      act(() => {
        result.current.addItem(product);
        result.current.setShipping(shipping);
      });

      expect(result.current.total).toBe(50);
      expect(result.current.grandTotal).toBe(65); // 50 + 15
    });
  });

  describe('Interface Compatibility', () => {
    it('should maintain the same public interface', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider
      });

      // Verify all expected properties and methods exist
      expect(result.current).toHaveProperty('items');
      expect(result.current).toHaveProperty('addItem');
      expect(result.current).toHaveProperty('removeItem');
      expect(result.current).toHaveProperty('updateQuantity');
      expect(result.current).toHaveProperty('clearCart');
      expect(result.current).toHaveProperty('total');
      expect(result.current).toHaveProperty('itemCount');
      expect(result.current).toHaveProperty('shipping');
      expect(result.current).toHaveProperty('setShipping');
      expect(result.current).toHaveProperty('grandTotal');

      // Verify types
      expect(Array.isArray(result.current.items)).toBe(true);
      expect(typeof result.current.addItem).toBe('function');
      expect(typeof result.current.removeItem).toBe('function');
      expect(typeof result.current.updateQuantity).toBe('function');
      expect(typeof result.current.clearCart).toBe('function');
      expect(typeof result.current.total).toBe('number');
      expect(typeof result.current.itemCount).toBe('number');
      expect(typeof result.current.setShipping).toBe('function');
      expect(typeof result.current.grandTotal).toBe('number');
    });
  });
});
