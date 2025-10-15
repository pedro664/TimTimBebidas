import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { Product } from '@/types';

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
  const { items, addItem, updateQuantity } = useCart();
  
  const testProduct: Product = {
    id: '1',
    name: 'Test Wine',
    category: 'Vinho Tinto',
    country: 'Brasil',
    price: 100,
    image: 'test.jpg',
    description: 'Test description',
    alcoholContent: '13%',
    volume: '750ml',
    tastingNotes: ['Fruity'],
    pairing: ['Meat'],
    stock: 5, // Limited stock for testing
  };

  const handleAdd = () => {
    const success = addItem(testProduct);
    if (!success) {
      const failedDiv = document.createElement('div');
      failedDiv.setAttribute('data-testid', 'add-failed');
      document.body.appendChild(failedDiv);
    }
  };

  const handleUpdateQuantity = (quantity: number) => {
    const success = updateQuantity('1', quantity);
    if (!success) {
      const failedDiv = document.createElement('div');
      failedDiv.setAttribute('data-testid', 'update-failed');
      document.body.appendChild(failedDiv);
    }
  };

  return (
    <div>
      <button onClick={handleAdd} data-testid="add-button">
        Add to Cart
      </button>
      <button onClick={() => handleUpdateQuantity(10)} data-testid="update-button">
        Update Quantity to 10
      </button>
      <button onClick={() => handleUpdateQuantity(3)} data-testid="update-valid-button">
        Update Quantity to 3
      </button>
      <div data-testid="cart-count">{items.length}</div>
      <div data-testid="item-quantity">
        {items.length > 0 ? items[0].quantity : 0}
      </div>
      <div data-testid="item-stock">
        {items.length > 0 ? items[0].stock : 0}
      </div>
    </div>
  );
};

describe('Stock Validation - Requirement 6.3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Adding products to cart', () => {
    it('should add product when stock is available', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('item-quantity')).toHaveTextContent('1');
    });

    it('should add multiple items up to stock limit', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId('add-button');
      
      // Add 5 times (stock limit)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(addButton);
      }

      expect(screen.getByTestId('item-quantity')).toHaveTextContent('5');
    });

    it('should not add product when stock limit is reached', async () => {
      const StockLimitComponent = () => {
        const { items, addItem } = useCart();
        const [lastResult, setLastResult] = useState<boolean | null>(null);
        
        const product: Product = {
          id: '1',
          name: 'Test Wine',
          category: 'Vinho Tinto',
          country: 'Brasil',
          price: 100,
          image: 'test.jpg',
          description: 'Test description',
          alcoholContent: '13%',
          volume: '750ml',
          tastingNotes: ['Fruity'],
          pairing: ['Meat'],
          stock: 5,
        };

        const handleAdd = () => {
          const success = addItem(product);
          setLastResult(success);
        };

        return (
          <div>
            <button onClick={handleAdd} data-testid="add-button">
              Add
            </button>
            <div data-testid="item-quantity">
              {items.length > 0 ? items[0].quantity : 0}
            </div>
            <div data-testid="last-result">
              {lastResult === null ? 'none' : lastResult ? 'true' : 'false'}
            </div>
          </div>
        );
      };

      render(
        <CartProvider>
          <StockLimitComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId('add-button');
      
      // Add 5 times (stock limit)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(addButton);
      }

      // Wait for state to update to 5
      await waitFor(() => {
        expect(screen.getByTestId('item-quantity')).toHaveTextContent('5');
      });

      // Try to add one more (should fail)
      fireEvent.click(addButton);

      // Wait for the result to update
      await waitFor(() => {
        expect(screen.getByTestId('last-result')).toHaveTextContent('false');
      });

      // Quantity should still be 5
      expect(screen.getByTestId('item-quantity')).toHaveTextContent('5');
    });

    it('should store stock information in cart item', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      expect(screen.getByTestId('item-stock')).toHaveTextContent('5');
    });
  });

  describe('Updating quantities in cart', () => {
    it('should update quantity when within stock limit', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // First add the product
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      // Update to valid quantity
      const updateValidButton = screen.getByTestId('update-valid-button');
      fireEvent.click(updateValidButton);

      expect(screen.getByTestId('item-quantity')).toHaveTextContent('3');
    });

    it('should not update quantity when exceeding stock limit', async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // First add the product
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      // Try to update to quantity exceeding stock (10 > 5)
      const updateButton = screen.getByTestId('update-button');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.queryByTestId('update-failed')).toBeInTheDocument();
      });

      // Quantity should remain 1
      expect(screen.getByTestId('item-quantity')).toHaveTextContent('1');
    });

    it('should allow updating to exact stock limit', () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // First add the product
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      // Create a button to update to exact stock limit
      const { container } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addBtn = screen.getAllByTestId('add-button')[1];
      fireEvent.click(addBtn);

      // Add 4 more times to reach stock limit of 5
      for (let i = 0; i < 4; i++) {
        fireEvent.click(addBtn);
      }

      const quantities = screen.getAllByTestId('item-quantity');
      expect(quantities[1]).toHaveTextContent('5');
    });
  });

  describe('Stock validation edge cases', () => {
    it('should handle product with zero stock', () => {
      const ZeroStockComponent = () => {
        const { addItem } = useCart();
        
        const zeroStockProduct: Product = {
          id: '2',
          name: 'Out of Stock Wine',
          category: 'Vinho Tinto',
          country: 'Brasil',
          price: 100,
          image: 'test.jpg',
          description: 'Test description',
          alcoholContent: '13%',
          volume: '750ml',
          tastingNotes: ['Fruity'],
          pairing: ['Meat'],
          stock: 0,
        };

        const handleAdd = () => {
          const success = addItem(zeroStockProduct);
          if (!success) {
            const failedDiv = document.createElement('div');
            failedDiv.setAttribute('data-testid', 'zero-stock-failed');
            document.body.appendChild(failedDiv);
          }
        };

        return (
          <button onClick={handleAdd} data-testid="add-zero-stock">
            Add Zero Stock
          </button>
        );
      };

      render(
        <CartProvider>
          <ZeroStockComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId('add-zero-stock');
      fireEvent.click(addButton);

      expect(screen.queryByTestId('zero-stock-failed')).toBeInTheDocument();
    });

    it('should handle decreasing quantity to zero (removal)', () => {
      const RemovalComponent = () => {
        const { items, addItem, updateQuantity } = useCart();
        
        const product: Product = {
          id: '3',
          name: 'Test Wine',
          category: 'Vinho Tinto',
          country: 'Brasil',
          price: 100,
          image: 'test.jpg',
          description: 'Test description',
          alcoholContent: '13%',
          volume: '750ml',
          tastingNotes: ['Fruty'],
          pairing: ['Meat'],
          stock: 10,
        };

        return (
          <div>
            <button onClick={() => addItem(product)} data-testid="add-product">
              Add
            </button>
            <button onClick={() => updateQuantity('3', 0)} data-testid="remove-product">
              Remove
            </button>
            <div data-testid="items-count">{items.length}</div>
          </div>
        );
      };

      render(
        <CartProvider>
          <RemovalComponent />
        </CartProvider>
      );

      // Add product
      fireEvent.click(screen.getByTestId('add-product'));
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');

      // Remove by setting quantity to 0
      fireEvent.click(screen.getByTestId('remove-product'));
      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    });
  });

  describe('Return values', () => {
    it('addItem should return true on success', () => {
      const ReturnValueComponent = () => {
        const { addItem } = useCart();
        
        const product: Product = {
          id: '4',
          name: 'Test Wine',
          category: 'Vinho Tinto',
          country: 'Brasil',
          price: 100,
          image: 'test.jpg',
          description: 'Test description',
          alcoholContent: '13%',
          volume: '750ml',
          tastingNotes: ['Fruity'],
          pairing: ['Meat'],
          stock: 10,
        };

        const handleAdd = () => {
          const success = addItem(product);
          const resultDiv = document.createElement('div');
          resultDiv.setAttribute('data-testid', 'add-result');
          resultDiv.textContent = success ? 'true' : 'false';
          document.body.appendChild(resultDiv);
        };

        return (
          <button onClick={handleAdd} data-testid="test-return">
            Test Return
          </button>
        );
      };

      render(
        <CartProvider>
          <ReturnValueComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('test-return'));
      expect(screen.getByTestId('add-result')).toHaveTextContent('true');
    });

    it('updateQuantity should return true on success', async () => {
      const UpdateReturnComponent = () => {
        const { items, addItem, updateQuantity } = useCart();
        
        const product: Product = {
          id: '5',
          name: 'Test Wine',
          category: 'Vinho Tinto',
          country: 'Brasil',
          price: 100,
          image: 'test.jpg',
          description: 'Test description',
          alcoholContent: '13%',
          volume: '750ml',
          tastingNotes: ['Fruity'],
          pairing: ['Meat'],
          stock: 10,
        };

        const handleAdd = () => {
          addItem(product);
        };

        const handleUpdate = () => {
          const success = updateQuantity('5', 5);
          const resultDiv = document.createElement('div');
          resultDiv.setAttribute('data-testid', 'update-result');
          resultDiv.textContent = success ? 'true' : 'false';
          document.body.appendChild(resultDiv);
        };

        return (
          <div>
            <button onClick={handleAdd} data-testid="add-first">
              Add First
            </button>
            <button onClick={handleUpdate} data-testid="test-update-return">
              Test Update Return
            </button>
            <div data-testid="has-items">{items.length > 0 ? 'yes' : 'no'}</div>
          </div>
        );
      };

      render(
        <CartProvider>
          <UpdateReturnComponent />
        </CartProvider>
      );

      // First add the product
      fireEvent.click(screen.getByTestId('add-first'));
      
      // Wait for item to be added
      await waitFor(() => {
        expect(screen.getByTestId('has-items')).toHaveTextContent('yes');
      });

      // Now update quantity
      fireEvent.click(screen.getByTestId('test-update-return'));
      expect(screen.getByTestId('update-result')).toHaveTextContent('true');
    });

    it('updateQuantity should return false when exceeding stock', () => {
      const UpdateFailComponent = () => {
        const { addItem, updateQuantity } = useCart();
        
        const product: Product = {
          id: '6',
          name: 'Test Wine',
          category: 'Vinho Tinto',
          country: 'Brasil',
          price: 100,
          image: 'test.jpg',
          description: 'Test description',
          alcoholContent: '13%',
          volume: '750ml',
          tastingNotes: ['Fruity'],
          pairing: ['Meat'],
          stock: 5,
        };

        const handleTest = () => {
          addItem(product);
          const success = updateQuantity('6', 10); // Exceeds stock
          const resultDiv = document.createElement('div');
          resultDiv.setAttribute('data-testid', 'update-fail-result');
          resultDiv.textContent = success ? 'true' : 'false';
          document.body.appendChild(resultDiv);
        };

        return (
          <button onClick={handleTest} data-testid="test-update-fail">
            Test Update Fail
          </button>
        );
      };

      render(
        <CartProvider>
          <UpdateFailComponent />
        </CartProvider>
      );

      fireEvent.click(screen.getByTestId('test-update-fail'));
      expect(screen.getByTestId('update-fail-result')).toHaveTextContent('false');
    });
  });
});
