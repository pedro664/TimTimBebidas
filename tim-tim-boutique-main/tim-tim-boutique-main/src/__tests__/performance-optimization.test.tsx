import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { ReactNode } from 'react';

// Mock dependencies
vi.mock('@/services/sessionService', () => ({
  sessionService: {
    getCart: vi.fn(() => []),
    saveCart: vi.fn(),
    getShipping: vi.fn(() => null),
    saveShipping: vi.fn(),
    clearShipping: vi.fn(),
  },
}));

vi.mock('@/lib/migration', () => ({
  migrateFromLocalStorage: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('@/lib/errorHandling', () => ({
  handleStorageError: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('Performance Optimization - useMemo and useCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CartContext - useCallback optimization', () => {
    it('should maintain stable function references with useCallback', () => {
      const { result, rerender } = renderHook(() => useCart(), { wrapper });

      // Store initial function references
      const initialAddItem = result.current.addItem;
      const initialRemoveItem = result.current.removeItem;
      const initialUpdateQuantity = result.current.updateQuantity;
      const initialClearCart = result.current.clearCart;

      // Add an item to trigger state change
      act(() => {
        result.current.addItem({
          id: '1',
          name: 'Test Product',
          price: 100,
          image: 'test.jpg',
          stock: 10,
          description: 'Test',
          category: 'test',
          tags: [],
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      // Force re-render
      rerender();

      // Function references should remain the same (useCallback working)
      expect(result.current.addItem).toBe(initialAddItem);
      expect(result.current.removeItem).toBe(initialRemoveItem);
      expect(result.current.updateQuantity).toBe(initialUpdateQuantity);
      expect(result.current.clearCart).toBe(initialClearCart);
    });

    it('should not recreate addItem function on state changes', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      const addItemRef = result.current.addItem;

      // Add multiple items
      act(() => {
        result.current.addItem({
          id: '1',
          name: 'Product 1',
          price: 100,
          image: 'test1.jpg',
          stock: 10,
          description: 'Test',
          category: 'test',
          tags: [],
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      act(() => {
        result.current.addItem({
          id: '2',
          name: 'Product 2',
          price: 200,
          image: 'test2.jpg',
          stock: 5,
          description: 'Test',
          category: 'test',
          tags: [],
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      // Function reference should still be the same
      expect(result.current.addItem).toBe(addItemRef);
    });
  });

  describe('CartContext - useMemo optimization', () => {
    it('should memoize total calculation', () => {
      const { result, rerender } = renderHook(() => useCart(), { wrapper });

      // Add items
      act(() => {
        result.current.addItem({
          id: '1',
          name: 'Product 1',
          price: 100,
          image: 'test1.jpg',
          stock: 10,
          description: 'Test',
          category: 'test',
          tags: [],
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      const firstTotal = result.current.total;
      expect(firstTotal).toBe(100);

      // Re-render without changing items
      rerender();

      // Total should be the same reference (memoized)
      expect(result.current.total).toBe(firstTotal);
    });

    it('should recalculate total when items change', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          id: '1',
          name: 'Product 1',
          price: 100,
          image: 'test1.jpg',
          stock: 10,
          description: 'Test',
          category: 'test',
          tags: [],
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      expect(result.current.total).toBe(100);

      act(() => {
        result.current.addItem({
          id: '2',
          name: 'Product 2',
          price: 200,
          image: 'test2.jpg',
          stock: 5,
          description: 'Test',
          category: 'test',
          tags: [],
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      expect(result.current.total).toBe(300);
    });

    it('should memoize itemCount calculation', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          id: '1',
          name: 'Product 1',
          price: 100,
          image: 'test1.jpg',
          stock: 10,
          description: 'Test',
          category: 'test',
          tags: [],
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      expect(result.current.itemCount).toBe(1);

      act(() => {
        result.current.addItem({
          id: '1',
          name: 'Product 1',
          price: 100,
          image: 'test1.jpg',
          stock: 10,
          description: 'Test',
          category: 'test',
          tags: [],
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      expect(result.current.itemCount).toBe(2);
    });

    it('should memoize grandTotal calculation', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          id: '1',
          name: 'Product 1',
          price: 100,
          image: 'test1.jpg',
          stock: 10,
          description: 'Test',
          category: 'test',
          tags: [],
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      expect(result.current.grandTotal).toBe(100);

      act(() => {
        result.current.setShipping({
          cep: '12345-678',
          city: 'Test City',
          cost: 15,
          isFree: false,
          isValid: true,
        });
      });

      expect(result.current.grandTotal).toBe(115);
    });

    it('should recalculate grandTotal when shipping changes', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({
          id: '1',
          name: 'Product 1',
          price: 100,
          image: 'test1.jpg',
          stock: 10,
          description: 'Test',
          category: 'test',
          tags: [],
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      const totalWithoutShipping = result.current.grandTotal;
      expect(totalWithoutShipping).toBe(100);

      act(() => {
        result.current.setShipping({
          cep: '12345-678',
          city: 'Test City',
          cost: 20,
          isFree: false,
          isValid: true,
        });
      });

      expect(result.current.grandTotal).toBe(120);

      act(() => {
        result.current.setShipping({
          cep: '12345-678',
          city: 'Test City',
          cost: 0,
          isFree: true,
          isValid: true,
        });
      });

      expect(result.current.grandTotal).toBe(100);
    });
  });

  describe('Performance - Complex scenarios', () => {
    it('should handle multiple operations efficiently', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Add multiple products
      const products = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Product ${i + 1}`,
        price: (i + 1) * 10,
        image: `test${i + 1}.jpg`,
        stock: 10,
        description: 'Test',
        category: 'test',
        tags: [],
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      act(() => {
        products.forEach(product => {
          result.current.addItem(product);
        });
      });

      expect(result.current.items.length).toBe(10);
      expect(result.current.itemCount).toBe(10);
      expect(result.current.total).toBe(550); // Sum of 10+20+30+...+100

      // Update quantities
      act(() => {
        result.current.updateQuantity('1', 3);
        result.current.updateQuantity('2', 2);
      });

      expect(result.current.itemCount).toBe(13); // 3+2+1+1+1+1+1+1+1+1
      expect(result.current.total).toBe(590); // (10*3)+(20*2)+30+40+...+100

      // Remove some items
      act(() => {
        result.current.removeItem('3');
        result.current.removeItem('4');
      });

      expect(result.current.items.length).toBe(8);
    });

    it('should maintain performance with shipping calculations', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Add products
      act(() => {
        result.current.addItem({
          id: '1',
          name: 'Product 1',
          price: 100,
          image: 'test1.jpg',
          stock: 10,
          description: 'Test',
          category: 'test',
          tags: [],
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      // Set shipping multiple times
      act(() => {
        result.current.setShipping({
          cep: '12345-678',
          city: 'City 1',
          cost: 10,
          isFree: false,
          isValid: true,
        });
      });

      expect(result.current.grandTotal).toBe(110);

      act(() => {
        result.current.setShipping({
          cep: '12345-678',
          city: 'City 2',
          cost: 15,
          isFree: false,
          isValid: true,
        });
      });

      expect(result.current.grandTotal).toBe(115);

      act(() => {
        result.current.setShipping(null);
      });

      expect(result.current.grandTotal).toBe(100);
    });
  });
});
