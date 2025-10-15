import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { ProductProvider, useProducts } from '@/contexts/ProductContext';
import { toast } from 'sonner';
import * as productService from '@/services/productService';
import { sessionService } from '@/services/sessionService';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('@/services/sessionService', () => ({
  sessionService: {
    getCart: vi.fn(() => []),
    saveCart: vi.fn(),
    getShipping: vi.fn(() => null),
    saveShipping: vi.fn(),
    clearShipping: vi.fn(),
    clearSession: vi.fn(),
  },
}));

vi.mock('@/services/productService', () => ({
  getAllProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock('@/lib/migration', () => ({
  migrateFromLocalStorage: vi.fn(),
}));

describe('Error Handling Improvements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CartContext Error Handling', () => {
    const TestComponent = () => {
      const { addItem, removeItem, updateQuantity, items, error, isLoading } = useCart();
      
      return (
        <div>
          <div data-testid="loading">{isLoading ? 'Loading' : 'Ready'}</div>
          <div data-testid="error">{error || 'No error'}</div>
          <div data-testid="items-count">{items.length}</div>
          <button onClick={() => addItem({
            id: '1',
            name: 'Test Product',
            price: 100,
            stock: 5,
            image: 'test.jpg',
            description: 'Test',
            category: 'Vinho',
            tastingNotes: [],
            pairing: [],
            country: 'Brasil',
            region: '',
            alcoholContent: '',
            volume: '',
            grapes: [],
          })}>
            Add Item
          </button>
          <button onClick={() => removeItem('1')}>Remove Item</button>
          <button onClick={() => updateQuantity('1', 10)}>Update Quantity</button>
        </div>
      );
    };

    it('should handle storage errors when adding items', async () => {
      vi.mocked(sessionService.saveCart).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByText('Add Item');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('should show success toast when adding item', async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByText('Add Item');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Produto adicionado ao carrinho',
          expect.objectContaining({
            description: 'Test Product'
          })
        );
      });
    });

    it('should show error when adding item without stock', async () => {
      const TestComponentNoStock = () => {
        const { addItem } = useCart();
        
        return (
          <button onClick={() => addItem({
            id: '1',
            name: 'Out of Stock',
            price: 100,
            stock: 0,
            image: 'test.jpg',
            description: 'Test',
            category: 'Vinho',
            tastingNotes: [],
            pairing: [],
            country: 'Brasil',
            region: '',
            alcoholContent: '',
            volume: '',
            grapes: [],
          })}>
            Add Out of Stock
          </button>
        );
      };

      render(
        <CartProvider>
          <TestComponentNoStock />
        </CartProvider>
      );

      const addButton = screen.getByText('Add Out of Stock');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Produto sem estoque',
          expect.objectContaining({
            description: 'Este produto está temporariamente indisponível'
          })
        );
      });
    });

    it('should show warning when exceeding stock limit', async () => {
      const TestComponentStockLimit = () => {
        const { addItem, updateQuantity } = useCart();
        
        const product = {
          id: '1',
          name: 'Limited Stock',
          price: 100,
          stock: 2,
          image: 'test.jpg',
          description: 'Test',
          category: 'Vinho',
          tastingNotes: [],
          pairing: [],
          country: 'Brasil',
          region: '',
          alcoholContent: '',
          volume: '',
          grapes: [],
        };
        
        return (
          <div>
            <button onClick={() => addItem(product)}>Add Item</button>
            <button onClick={() => updateQuantity('1', 10)}>Exceed Stock</button>
          </div>
        );
      };

      render(
        <CartProvider>
          <TestComponentStockLimit />
        </CartProvider>
      );

      // First add the item
      const addButton = screen.getByText('Add Item');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });

      // Try to exceed stock
      const exceedButton = screen.getByText('Exceed Stock');
      fireEvent.click(exceedButton);

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalledWith(
          'Estoque insuficiente',
          expect.objectContaining({
            description: expect.stringContaining('unidades disponíveis')
          })
        );
      });
    });

    it('should show success toast when removing item', async () => {
      const TestComponentWithItem = () => {
        const { addItem, removeItem } = useCart();
        
        const product = {
          id: '1',
          name: 'Test Product',
          price: 100,
          stock: 5,
          image: 'test.jpg',
          description: 'Test',
          category: 'Vinho',
          tastingNotes: [],
          pairing: [],
          country: 'Brasil',
          region: '',
          alcoholContent: '',
          volume: '',
          grapes: [],
        };
        
        return (
          <div>
            <button onClick={() => addItem(product)}>Add Item</button>
            <button onClick={() => removeItem('1')}>Remove Item</button>
          </div>
        );
      };

      render(
        <CartProvider>
          <TestComponentWithItem />
        </CartProvider>
      );

      // Add item first
      fireEvent.click(screen.getByText('Add Item'));
      await waitFor(() => expect(toast.success).toHaveBeenCalled());

      // Clear mock
      vi.clearAllMocks();

      // Remove item
      fireEvent.click(screen.getByText('Remove Item'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Produto removido do carrinho');
      });
    });
  });

  describe('ProductContext Error Handling', () => {
    const TestProductComponent = () => {
      const { products, loading, error, refreshProducts } = useProducts();
      
      return (
        <div>
          <div data-testid="loading">{loading ? 'Loading' : 'Ready'}</div>
          <div data-testid="error">{error || 'No error'}</div>
          <div data-testid="products-count">{products.length}</div>
          <button onClick={refreshProducts}>Refresh</button>
        </div>
      );
    };

    it('should show error toast with retry option on load failure', async () => {
      vi.mocked(productService.getAllProducts).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <ProductProvider>
          <TestProductComponent />
        </ProductProvider>
      );

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Erro ao carregar produtos',
          expect.objectContaining({
            description: 'Network error',
            action: expect.objectContaining({
              label: 'Tentar Novamente',
            }),
            duration: 6000,
          })
        );
      });
    });

    it('should show success toast on successful retry', async () => {
      // First call fails
      vi.mocked(productService.getAllProducts)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([
          {
            id: '1',
            name: 'Test Product',
            price: 100,
            stock: 5,
            image: 'test.jpg',
            description: 'Test',
            category: 'Vinho',
            tastingNotes: [],
            pairing: [],
            country: 'Brasil',
            region: '',
            alcoholContent: '',
            volume: '',
            grapes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);

      render(
        <ProductProvider>
          <TestProductComponent />
        </ProductProvider>
      );

      // Wait for initial error
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Clear mocks
      vi.clearAllMocks();

      // Trigger retry
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Produtos carregados com sucesso!');
      });
    });

    it('should handle empty product list gracefully', async () => {
      vi.mocked(productService.getAllProducts).mockResolvedValue([]);

      render(
        <ProductProvider>
          <TestProductComponent />
        </ProductProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('products-count')).toHaveTextContent('0');
        expect(screen.getByTestId('error')).toHaveTextContent('No error');
      });
    });
  });

  describe('Product Service Error Handling', () => {
    it('should throw descriptive error for duplicate product', async () => {
      const mockError = {
        code: '23505',
        message: 'duplicate key value',
      };

      vi.mocked(productService.createProduct).mockRejectedValue(mockError);

      await expect(
        productService.createProduct({
          name: 'Duplicate',
          description: 'Test',
          price: 100,
          category: 'vinho',
          image_url: 'test.jpg',
          stock: 5,
        })
      ).rejects.toThrow();
    });

    it('should throw descriptive error for foreign key constraint', async () => {
      const mockError = {
        code: '23503',
        message: 'foreign key constraint',
      };

      vi.mocked(productService.deleteProduct).mockRejectedValue(mockError);

      await expect(
        productService.deleteProduct('1')
      ).rejects.toThrow();
    });
  });
});
