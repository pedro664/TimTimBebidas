/**
 * Cart Calculations Tests
 * Tests for validating cart subtotal, shipping, and grand total calculations
 * Requirements: 6.1, 6.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { act } from 'react-dom/test-utils';

// Mock sessionService
vi.mock('@/services/sessionService', () => ({
  sessionService: {
    getCart: vi.fn(() => []),
    saveCart: vi.fn(),
    clearCart: vi.fn(),
    getShipping: vi.fn(() => null),
    saveShipping: vi.fn(),
    clearShipping: vi.fn(),
    clearSession: vi.fn(),
  },
  ShippingInfo: {},
}));

// Mock migration
vi.mock('@/lib/migration', () => ({
  migrateFromLocalStorage: vi.fn(),
}));

// Test component to access cart context
const TestComponent = () => {
  const cart = useCart();
  return (
    <div>
      <div data-testid="item-count">{cart.itemCount}</div>
      <div data-testid="subtotal">{cart.total.toFixed(2)}</div>
      <div data-testid="shipping-cost">{cart.shipping?.cost.toFixed(2) || '0.00'}</div>
      <div data-testid="grand-total">{cart.grandTotal.toFixed(2)}</div>
      <div data-testid="is-free-shipping">{cart.shipping?.isFree ? 'true' : 'false'}</div>
      <button onClick={() => cart.addItem(mockProduct1)}>Add Product 1</button>
      <button onClick={() => cart.addItem(mockProduct2)}>Add Product 2</button>
      <button onClick={() => cart.updateQuantity('1', 3)}>Update Quantity</button>
      <button onClick={() => cart.setShipping({ cost: 15, isFree: false, isValid: true })}>
        Set Shipping
      </button>
      <button onClick={() => cart.setShipping({ cost: 0, isFree: true, isValid: true })}>
        Set Free Shipping
      </button>
      <button onClick={() => cart.clearCart()}>Clear Cart</button>
    </div>
  );
};

// Mock products
const mockProduct1: Product = {
  id: '1',
  name: 'Vinho Tinto Premium',
  price: 89.90,
  image: '/test-image.jpg',
  category: 'Vinhos',
  description: 'Test wine',
  stock: 10,
  featured: false,
  tags: [],
  country: 'Brasil',
  volume: '750ml',
  alcohol: '13%',
  type: 'Tinto',
  year: 2020,
};

const mockProduct2: Product = {
  id: '2',
  name: 'Champagne Especial',
  price: 150.00,
  image: '/test-image2.jpg',
  category: 'Espumantes',
  description: 'Test champagne',
  stock: 5,
  featured: false,
  tags: [],
  country: 'França',
  volume: '750ml',
  alcohol: '12%',
  type: 'Brut',
  year: 2019,
};

describe('Cart Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Subtotal Calculation', () => {
    it('should calculate subtotal correctly with single item', async () => {
      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product 1').click();
      });

      await waitFor(() => {
        expect(getByTestId('subtotal').textContent).toBe('89.90');
      });
    });

    it('should calculate subtotal correctly with multiple items', async () => {
      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product 1').click();
        getByText('Add Product 2').click();
      });

      await waitFor(() => {
        // 89.90 + 150.00 = 239.90
        expect(getByTestId('subtotal').textContent).toBe('239.90');
      });
    });

    it('should calculate subtotal correctly with quantity changes', async () => {
      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product 1').click();
      });

      await waitFor(() => {
        expect(getByTestId('subtotal').textContent).toBe('89.90');
      });

      act(() => {
        getByText('Update Quantity').click();
      });

      await waitFor(() => {
        // 89.90 * 3 = 269.70
        expect(getByTestId('subtotal').textContent).toBe('269.70');
      });
    });

    it('should calculate subtotal correctly with duplicate items', async () => {
      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product 1').click();
        getByText('Add Product 1').click();
        getByText('Add Product 1').click();
      });

      await waitFor(() => {
        // 89.90 * 3 = 269.70
        expect(getByTestId('subtotal').textContent).toBe('269.70');
        expect(getByTestId('item-count').textContent).toBe('3');
      });
    });

    it('should handle decimal precision correctly', async () => {
      const productWithDecimals: Product = {
        ...mockProduct1,
        id: '3',
        price: 33.33,
      };

      const TestComponentWithDecimals = () => {
        const cart = useCart();
        return (
          <div>
            <div data-testid="subtotal">{cart.total.toFixed(2)}</div>
            <button onClick={() => cart.addItem(productWithDecimals)}>Add Product</button>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponentWithDecimals />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product').click();
        getByText('Add Product').click();
        getByText('Add Product').click();
      });

      await waitFor(() => {
        // 33.33 * 3 = 99.99
        expect(getByTestId('subtotal').textContent).toBe('99.99');
      });
    });
  });

  describe('Shipping Cost Calculation', () => {
    it('should add shipping cost to grand total', async () => {
      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product 1').click();
        getByText('Set Shipping').click();
      });

      await waitFor(() => {
        expect(getByTestId('subtotal').textContent).toBe('89.90');
        expect(getByTestId('shipping-cost').textContent).toBe('15.00');
        // 89.90 + 15.00 = 104.90
        expect(getByTestId('grand-total').textContent).toBe('104.90');
      });
    });

    it('should handle free shipping correctly', async () => {
      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product 1').click();
        getByText('Add Product 2').click();
        getByText('Set Free Shipping').click();
      });

      await waitFor(() => {
        expect(getByTestId('subtotal').textContent).toBe('239.90');
        expect(getByTestId('shipping-cost').textContent).toBe('0.00');
        expect(getByTestId('is-free-shipping').textContent).toBe('true');
        // 239.90 + 0 = 239.90
        expect(getByTestId('grand-total').textContent).toBe('239.90');
      });
    });

    it('should calculate grand total without shipping', async () => {
      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product 1').click();
      });

      await waitFor(() => {
        expect(getByTestId('subtotal').textContent).toBe('89.90');
        expect(getByTestId('shipping-cost').textContent).toBe('0.00');
        // Without shipping set, grand total = subtotal
        expect(getByTestId('grand-total').textContent).toBe('89.90');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cart', async () => {
      const { getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(getByTestId('item-count').textContent).toBe('0');
        expect(getByTestId('subtotal').textContent).toBe('0.00');
        expect(getByTestId('grand-total').textContent).toBe('0.00');
      });
    });

    it('should recalculate when cart is cleared', async () => {
      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product 1').click();
        getByText('Add Product 2').click();
        getByText('Set Shipping').click();
      });

      await waitFor(() => {
        expect(getByTestId('grand-total').textContent).toBe('254.90');
      });

      act(() => {
        getByText('Clear Cart').click();
      });

      await waitFor(() => {
        expect(getByTestId('item-count').textContent).toBe('0');
        expect(getByTestId('subtotal').textContent).toBe('0.00');
        // Shipping should still be set
        expect(getByTestId('grand-total').textContent).toBe('15.00');
      });
    });

    it('should handle very large quantities', async () => {
      const TestComponentLarge = () => {
        const cart = useCart();
        return (
          <div>
            <div data-testid="subtotal">{cart.total.toFixed(2)}</div>
            <div data-testid="item-count">{cart.itemCount}</div>
            <button onClick={() => cart.addItem(mockProduct1)}>Add Product</button>
            <button onClick={() => cart.updateQuantity('1', 100)}>Set Large Quantity</button>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponentLarge />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product').click();
        getByText('Set Large Quantity').click();
      });

      await waitFor(() => {
        expect(getByTestId('item-count').textContent).toBe('100');
        // 89.90 * 100 = 8990.00
        expect(getByTestId('subtotal').textContent).toBe('8990.00');
      });
    });

    it('should handle zero price items', async () => {
      const freeProduct: Product = {
        ...mockProduct1,
        id: '4',
        price: 0,
      };

      const TestComponentFree = () => {
        const cart = useCart();
        return (
          <div>
            <div data-testid="subtotal">{cart.total.toFixed(2)}</div>
            <button onClick={() => cart.addItem(freeProduct)}>Add Free Product</button>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponentFree />
        </CartProvider>
      );

      act(() => {
        getByText('Add Free Product').click();
      });

      await waitFor(() => {
        expect(getByTestId('subtotal').textContent).toBe('0.00');
      });
    });

    it('should maintain precision with multiple decimal operations', async () => {
      const product1: Product = { ...mockProduct1, id: '5', price: 10.99 };
      const product2: Product = { ...mockProduct1, id: '6', price: 20.49 };
      const product3: Product = { ...mockProduct1, id: '7', price: 15.75 };

      const TestComponentPrecision = () => {
        const cart = useCart();
        return (
          <div>
            <div data-testid="subtotal">{cart.total.toFixed(2)}</div>
            <button onClick={() => {
              cart.addItem(product1);
              cart.addItem(product2);
              cart.addItem(product3);
            }}>Add All Products</button>
          </div>
        );
      };

      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponentPrecision />
        </CartProvider>
      );

      act(() => {
        getByText('Add All Products').click();
      });

      await waitFor(() => {
        // 10.99 + 20.49 + 15.75 = 47.23
        expect(getByTestId('subtotal').textContent).toBe('47.23');
      });
    });
  });

  describe('Item Count Calculation', () => {
    it('should count items correctly', async () => {
      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product 1').click();
        getByText('Add Product 2').click();
      });

      await waitFor(() => {
        expect(getByTestId('item-count').textContent).toBe('2');
      });
    });

    it('should count quantities correctly', async () => {
      const { getByText, getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      act(() => {
        getByText('Add Product 1').click();
        getByText('Add Product 1').click();
        getByText('Add Product 2').click();
      });

      await waitFor(() => {
        // 2 of product 1 + 1 of product 2 = 3 total items
        expect(getByTestId('item-count').textContent).toBe('3');
      });
    });
  });
});
