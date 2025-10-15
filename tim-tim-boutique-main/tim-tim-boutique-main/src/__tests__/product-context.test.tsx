import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ProductProvider, useProducts } from '@/contexts/ProductContext';
import { adminStorageService } from '@/services/adminStorage';
import { Product } from '@/types';

// Mock the adminStorageService
vi.mock('@/services/adminStorage', () => ({
  adminStorageService: {
    getProducts: vi.fn(),
    initializeProducts: vi.fn(),
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    getProductById: vi.fn(),
  },
}));

// Mock não é mais necessário - produtos vêm do Supabase
// vi.mock('@/data/products', () => ({
//   products: [
    {
      id: '1',
      name: 'Test Product 1',
      category: 'Cerveja',
      country: 'Brasil',
      price: 10.00,
      image: 'https://example.com/image1.jpg',
      description: 'Test description 1',
      alcoholContent: '5%',
      volume: '350ml',
      tastingNotes: ['Note 1'],
      pairing: ['Food 1'],
      stock: 10,
    },
    {
      id: '2',
      name: 'Test Product 2',
      category: 'Vinho Tinto',
      country: 'Portugal',
      price: 50.00,
      image: 'https://example.com/image2.jpg',
      description: 'Test description 2',
      alcoholContent: '13%',
      volume: '750ml',
      tastingNotes: ['Note 2'],
      pairing: ['Food 2'],
      grapes: ['Grape 1'],
      stock: 5,
    },
  ],
})); */

describe('ProductContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should load products from localStorage if available', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Stored Product',
          category: 'Cerveja',
          country: 'Brasil',
          price: 15.00,
          image: 'https://example.com/stored.jpg',
          description: 'Stored product description',
          alcoholContent: '5%',
          volume: '350ml',
          tastingNotes: ['Stored note'],
          pairing: ['Stored pairing'],
          stock: 20,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      vi.mocked(adminStorageService.getProducts).mockReturnValue(mockProducts);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toEqual(mockProducts);
      expect(adminStorageService.getProducts).toHaveBeenCalled();
      expect(adminStorageService.initializeProducts).not.toHaveBeenCalled();
    });

    it('should migrate hardcoded products if localStorage is empty', async () => {
      vi.mocked(adminStorageService.getProducts)
        .mockReturnValueOnce([]) // First call returns empty
        .mockReturnValueOnce([ // Second call returns migrated products
          {
            id: '1',
            name: 'Test Product 1',
            category: 'Cerveja',
            country: 'Brasil',
            price: 10.00,
            image: 'https://example.com/image1.jpg',
            description: 'Test description 1',
            alcoholContent: '5%',
            volume: '350ml',
            tastingNotes: ['Note 1'],
            pairing: ['Food 1'],
            stock: 10,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        ]);

      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(adminStorageService.initializeProducts).toHaveBeenCalled();
      expect(result.current.products.length).toBeGreaterThan(0);
    });

    it('should use hardcoded products as fallback if migration fails', async () => {
      vi.mocked(adminStorageService.getProducts).mockReturnValue([]);
      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(false);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products.length).toBeGreaterThan(0);
    });
  });

  describe('addProduct', () => {
    it('should add a new product successfully', async () => {
      vi.mocked(adminStorageService.getProducts).mockReturnValue([]);
      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);
      vi.mocked(adminStorageService.addProduct).mockReturnValue(true);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newProduct = {
        name: 'New Product',
        category: 'Whisky',
        country: 'Escócia',
        price: 100.00,
        image: 'https://example.com/new.jpg',
        description: 'New product description',
        alcoholContent: '40%',
        volume: '1000ml',
        tastingNotes: ['New note'],
        pairing: ['New pairing'],
        stock: 15,
      };

      let success: boolean = false;
      act(() => {
        success = result.current.addProduct(newProduct);
      });

      expect(success).toBe(true);
      expect(adminStorageService.addProduct).toHaveBeenCalled();
      expect(result.current.products.length).toBeGreaterThan(0);
      
      const addedProduct = result.current.products.find(p => p.name === 'New Product');
      expect(addedProduct).toBeDefined();
      expect(addedProduct?.id).toBeDefined();
      expect(addedProduct?.createdAt).toBeDefined();
      expect(addedProduct?.updatedAt).toBeDefined();
    });

    it('should return false if adding product fails', async () => {
      vi.mocked(adminStorageService.getProducts).mockReturnValue([]);
      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);
      vi.mocked(adminStorageService.addProduct).mockReturnValue(false);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newProduct = {
        name: 'Failed Product',
        category: 'Vodka',
        country: 'Rússia',
        price: 50.00,
        image: 'https://example.com/failed.jpg',
        description: 'Failed product',
        alcoholContent: '40%',
        volume: '1000ml',
        tastingNotes: ['Failed'],
        pairing: ['Failed'],
        stock: 5,
      };

      let success: boolean = true;
      act(() => {
        success = result.current.addProduct(newProduct);
      });

      expect(success).toBe(false);
    });

    it('should set default stock to 0 if not provided', async () => {
      vi.mocked(adminStorageService.getProducts).mockReturnValue([]);
      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);
      vi.mocked(adminStorageService.addProduct).mockReturnValue(true);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newProduct = {
        name: 'Product Without Stock',
        category: 'Gin',
        country: 'Inglaterra',
        price: 80.00,
        image: 'https://example.com/gin.jpg',
        description: 'Gin description',
        alcoholContent: '40%',
        volume: '750ml',
        tastingNotes: ['Gin note'],
        pairing: ['Gin pairing'],
      };

      act(() => {
        result.current.addProduct(newProduct as Omit<Product, 'id'>);
      });

      const addedProduct = result.current.products.find(p => p.name === 'Product Without Stock');
      expect(addedProduct?.stock).toBe(0);
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product successfully', async () => {
      const existingProduct: Product = {
        id: 'product-1',
        name: 'Original Product',
        category: 'Cerveja',
        country: 'Brasil',
        price: 10.00,
        image: 'https://example.com/original.jpg',
        description: 'Original description',
        alcoholContent: '5%',
        volume: '350ml',
        tastingNotes: ['Original'],
        pairing: ['Original'],
        stock: 10,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      vi.mocked(adminStorageService.getProducts).mockReturnValue([existingProduct]);
      vi.mocked(adminStorageService.updateProduct).mockReturnValue(true);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates = {
        name: 'Updated Product',
        price: 15.00,
        stock: 20,
      };

      let success: boolean = false;
      act(() => {
        success = result.current.updateProduct('product-1', updates);
      });

      expect(success).toBe(true);
      expect(adminStorageService.updateProduct).toHaveBeenCalledWith('product-1', updates);
      
      const updatedProduct = result.current.products.find(p => p.id === 'product-1');
      expect(updatedProduct?.name).toBe('Updated Product');
      expect(updatedProduct?.price).toBe(15.00);
      expect(updatedProduct?.stock).toBe(20);
      expect(updatedProduct?.updatedAt).toBeDefined();
    });

    it('should return false if product does not exist', async () => {
      vi.mocked(adminStorageService.getProducts).mockReturnValue([]);
      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);
      vi.mocked(adminStorageService.updateProduct).mockReturnValue(false);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success: boolean = true;
      act(() => {
        success = result.current.updateProduct('non-existent-id', { name: 'Updated' });
      });

      expect(success).toBe(false);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      const products: Product[] = [
        {
          id: 'product-1',
          name: 'Product 1',
          category: 'Cerveja',
          country: 'Brasil',
          price: 10.00,
          image: 'https://example.com/1.jpg',
          description: 'Description 1',
          alcoholContent: '5%',
          volume: '350ml',
          tastingNotes: ['Note 1'],
          pairing: ['Pairing 1'],
          stock: 10,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'product-2',
          name: 'Product 2',
          category: 'Vinho Tinto',
          country: 'Portugal',
          price: 50.00,
          image: 'https://example.com/2.jpg',
          description: 'Description 2',
          alcoholContent: '13%',
          volume: '750ml',
          tastingNotes: ['Note 2'],
          pairing: ['Pairing 2'],
          stock: 5,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      vi.mocked(adminStorageService.getProducts).mockReturnValue(products);
      vi.mocked(adminStorageService.deleteProduct).mockReturnValue(true);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products.length).toBe(2);

      let success: boolean = false;
      act(() => {
        success = result.current.deleteProduct('product-1');
      });

      expect(success).toBe(true);
      expect(adminStorageService.deleteProduct).toHaveBeenCalledWith('product-1');
      expect(result.current.products.length).toBe(1);
      expect(result.current.products.find(p => p.id === 'product-1')).toBeUndefined();
      expect(result.current.products.find(p => p.id === 'product-2')).toBeDefined();
    });

    it('should return false if product does not exist', async () => {
      vi.mocked(adminStorageService.getProducts).mockReturnValue([]);
      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);
      vi.mocked(adminStorageService.deleteProduct).mockReturnValue(false);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success: boolean = true;
      act(() => {
        success = result.current.deleteProduct('non-existent-id');
      });

      expect(success).toBe(false);
    });
  });

  describe('getProductById', () => {
    it('should return product if it exists', async () => {
      const products: Product[] = [
        {
          id: 'product-1',
          name: 'Product 1',
          category: 'Cerveja',
          country: 'Brasil',
          price: 10.00,
          image: 'https://example.com/1.jpg',
          description: 'Description 1',
          alcoholContent: '5%',
          volume: '350ml',
          tastingNotes: ['Note 1'],
          pairing: ['Pairing 1'],
          stock: 10,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      vi.mocked(adminStorageService.getProducts).mockReturnValue(products);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const product = result.current.getProductById('product-1');
      expect(product).toBeDefined();
      expect(product?.id).toBe('product-1');
      expect(product?.name).toBe('Product 1');
    });

    it('should return undefined if product does not exist', async () => {
      vi.mocked(adminStorageService.getProducts).mockReturnValue([]);
      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const product = result.current.getProductById('non-existent-id');
      expect(product).toBeUndefined();
    });
  });

  describe('refreshProducts', () => {
    it('should reload products from localStorage', async () => {
      const initialProducts: Product[] = [
        {
          id: 'product-1',
          name: 'Initial Product',
          category: 'Cerveja',
          country: 'Brasil',
          price: 10.00,
          image: 'https://example.com/initial.jpg',
          description: 'Initial description',
          alcoholContent: '5%',
          volume: '350ml',
          tastingNotes: ['Initial'],
          pairing: ['Initial'],
          stock: 10,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const updatedProducts: Product[] = [
        ...initialProducts,
        {
          id: 'product-2',
          name: 'New Product',
          category: 'Vinho Tinto',
          country: 'Portugal',
          price: 50.00,
          image: 'https://example.com/new.jpg',
          description: 'New description',
          alcoholContent: '13%',
          volume: '750ml',
          tastingNotes: ['New'],
          pairing: ['New'],
          stock: 5,
          createdAt: '2025-01-02T00:00:00.000Z',
          updatedAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      vi.mocked(adminStorageService.getProducts)
        .mockReturnValueOnce(initialProducts)
        .mockReturnValueOnce(updatedProducts);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products.length).toBe(1);

      act(() => {
        result.current.refreshProducts();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products.length).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully when loading products', async () => {
      vi.mocked(adminStorageService.getProducts).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should fallback to hardcoded products
      expect(result.current.products.length).toBeGreaterThan(0);
    });

    it('should handle errors when adding product', async () => {
      vi.mocked(adminStorageService.getProducts).mockReturnValue([]);
      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);
      vi.mocked(adminStorageService.addProduct).mockImplementation(() => {
        throw new Error('Add error');
      });

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success: boolean = true;
      act(() => {
        success = result.current.addProduct({
          name: 'Error Product',
          category: 'Cerveja',
          country: 'Brasil',
          price: 10.00,
          image: 'https://example.com/error.jpg',
          description: 'Error',
          alcoholContent: '5%',
          volume: '350ml',
          tastingNotes: ['Error'],
          pairing: ['Error'],
          stock: 10,
        });
      });

      expect(success).toBe(false);
    });
  });

  describe('Hook Usage', () => {
    it('should throw error if used outside ProductProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useProducts());
      }).toThrow('useProducts must be used within a ProductProvider');

      consoleError.mockRestore();
    });
  });
});
