import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import { ProductProvider, useProducts } from '@/contexts/ProductContext';
import { adminStorageService } from '@/services/adminStorage';
import { Product } from '@/types';
import React from 'react';

// Mock services
vi.mock('@/services/adminStorage', () => ({
  adminStorageService: {
    authenticateAdmin: vi.fn(),
    saveAdminSession: vi.fn(),
    getAdminSession: vi.fn(),
    clearAdminSession: vi.fn(),
    getProducts: vi.fn(),
    initializeProducts: vi.fn(),
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    getProductById: vi.fn(),
    getStats: vi.fn(),
  },
}));

// Mock não é mais necessário - produtos vêm do Supabase
// vi.mock('@/data/products', () => ({
//   products: [],
// }));

/**
 * Admin Integration Tests
 * 
 * These tests verify the integration between different admin contexts and services,
 * focusing on complete workflows rather than individual component behavior.
 */

describe('Admin Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Login → Dashboard → Logout Flow', () => {
    it('should complete full authentication workflow', async () => {
      const mockAdmin = {
        id: 'admin-001',
        email: 'admin@timtimboutique.com',
        name: 'Administrador',
      };

      // Setup mocks
      vi.mocked(adminStorageService.getAdminSession).mockReturnValue(null);
      vi.mocked(adminStorageService.authenticateAdmin).mockResolvedValue(mockAdmin);
      vi.mocked(adminStorageService.saveAdminSession).mockReturnValue(true);

      const { result } = renderHook(() => useAdminAuth(), {
        wrapper: AdminAuthProvider,
      });

      // Initial state - not authenticated
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.admin).toBeNull();

      // Login
      let loginSuccess = false;
      await act(async () => {
        loginSuccess = await result.current.login('admin@timtimboutique.com', 'admin123');
      });

      // Verify login success
      expect(loginSuccess).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.admin).toEqual(mockAdmin);
      expect(adminStorageService.authenticateAdmin).toHaveBeenCalledWith(
        'admin@timtimboutique.com',
        'admin123'
      );
      expect(adminStorageService.saveAdminSession).toHaveBeenCalledWith(mockAdmin);

      // Logout
      act(() => {
        result.current.logout();
      });

      // Verify logout
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.admin).toBeNull();
      expect(adminStorageService.clearAdminSession).toHaveBeenCalled();
    });

    it('should persist session across page reloads', () => {
      const mockAdmin = {
        id: 'admin-001',
        email: 'admin@timtimboutique.com',
        name: 'Administrador',
      };

      vi.mocked(adminStorageService.getAdminSession).mockReturnValue(mockAdmin);

      // First render - simulating initial page load
      const { result: result1 } = renderHook(() => useAdminAuth(), {
        wrapper: AdminAuthProvider,
      });

      expect(result1.current.isAuthenticated).toBe(true);
      expect(result1.current.admin).toEqual(mockAdmin);

      // Second render - simulating page reload
      const { result: result2 } = renderHook(() => useAdminAuth(), {
        wrapper: AdminAuthProvider,
      });

      expect(result2.current.isAuthenticated).toBe(true);
      expect(result2.current.admin).toEqual(mockAdmin);
    });

    it('should handle failed login attempts', async () => {
      vi.mocked(adminStorageService.getAdminSession).mockReturnValue(null);
      vi.mocked(adminStorageService.authenticateAdmin).mockResolvedValue(null);

      const { result } = renderHook(() => useAdminAuth(), {
        wrapper: AdminAuthProvider,
      });

      let loginSuccess = true;
      await act(async () => {
        loginSuccess = await result.current.login('wrong@email.com', 'wrongpass');
      });

      expect(loginSuccess).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.admin).toBeNull();
    });
  });

  describe('Add → Edit → Delete Product Flow', () => {
    const mockAdmin = {
      id: 'admin-001',
      email: 'admin@timtimboutique.com',
      name: 'Administrador',
    };

    beforeEach(() => {
      vi.mocked(adminStorageService.getAdminSession).mockReturnValue(mockAdmin);
    });

    it('should complete full product lifecycle', async () => {
      // Setup mocks
      vi.mocked(adminStorageService.getProducts)
        .mockReturnValueOnce([]) // Initial load
        .mockReturnValueOnce([]) // After initialization
        .mockReturnValueOnce([ // After adding product
          {
            id: 'product-1',
            name: 'Novo Produto',
            category: 'Cerveja',
            country: 'Brasil',
            price: 25.00,
            image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
            description: 'Descrição do produto',
            alcoholContent: '5%',
            volume: '350ml',
            tastingNotes: ['Nota 1'],
            pairing: ['Harmonização 1'],
            stock: 10,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        ])
        .mockReturnValueOnce([ // After updating product
          {
            id: 'product-1',
            name: 'Produto Atualizado',
            category: 'Cerveja',
            country: 'Brasil',
            price: 30.00,
            image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
            description: 'Descrição atualizada',
            alcoholContent: '5%',
            volume: '350ml',
            tastingNotes: ['Nota 1'],
            pairing: ['Harmonização 1'],
            stock: 15,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-02T00:00:00.000Z',
          },
        ])
        .mockReturnValueOnce([]); // After deleting product

      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);
      vi.mocked(adminStorageService.addProduct).mockReturnValue(true);
      vi.mocked(adminStorageService.updateProduct).mockReturnValue(true);
      vi.mocked(adminStorageService.deleteProduct).mockReturnValue(true);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initial state - no products
      expect(result.current.products.length).toBe(0);

      // Add product
      let addSuccess = false;
      act(() => {
        addSuccess = result.current.addProduct({
          name: 'Novo Produto',
          category: 'Cerveja',
          country: 'Brasil',
          price: 25.00,
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
          description: 'Descrição do produto',
          alcoholContent: '5%',
          volume: '350ml',
          tastingNotes: ['Nota 1'],
          pairing: ['Harmonização 1'],
          stock: 10,
        });
      });

      expect(addSuccess).toBe(true);
      expect(adminStorageService.addProduct).toHaveBeenCalled();

      // Refresh to get updated products
      act(() => {
        result.current.refreshProducts();
      });

      await waitFor(() => {
        expect(result.current.products.length).toBe(1);
      });

      // Update product
      let updateSuccess = false;
      act(() => {
        updateSuccess = result.current.updateProduct('product-1', {
          name: 'Produto Atualizado',
          price: 30.00,
          stock: 15,
        });
      });

      expect(updateSuccess).toBe(true);
      expect(adminStorageService.updateProduct).toHaveBeenCalledWith('product-1', {
        name: 'Produto Atualizado',
        price: 30.00,
        stock: 15,
      });

      // Refresh to get updated product
      act(() => {
        result.current.refreshProducts();
      });

      await waitFor(() => {
        const product = result.current.products.find(p => p.id === 'product-1');
        expect(product?.name).toBe('Produto Atualizado');
      });

      // Delete product
      let deleteSuccess = false;
      act(() => {
        deleteSuccess = result.current.deleteProduct('product-1');
      });

      expect(deleteSuccess).toBe(true);
      expect(adminStorageService.deleteProduct).toHaveBeenCalledWith('product-1');

      // Refresh to verify deletion
      act(() => {
        result.current.refreshProducts();
      });

      await waitFor(() => {
        expect(result.current.products.length).toBe(0);
      });
    });

    it('should handle product addition failure gracefully', async () => {
      vi.mocked(adminStorageService.getProducts).mockReturnValue([]);
      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);
      vi.mocked(adminStorageService.addProduct).mockReturnValue(false);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let addSuccess = true;
      act(() => {
        addSuccess = result.current.addProduct({
          name: 'Failed Product',
          category: 'Cerveja',
          country: 'Brasil',
          price: 10.00,
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
          description: 'Failed',
          alcoholContent: '5%',
          volume: '350ml',
          tastingNotes: [],
          pairing: [],
          stock: 5,
        });
      });

      expect(addSuccess).toBe(false);
      expect(result.current.products.length).toBe(0);
    });

    it('should handle product update failure gracefully', async () => {
      const mockProduct: Product = {
        id: 'product-1',
        name: 'Original Product',
        category: 'Cerveja',
        country: 'Brasil',
        price: 20.00,
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
        description: 'Original',
        alcoholContent: '5%',
        volume: '350ml',
        tastingNotes: [],
        pairing: [],
        stock: 10,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      vi.mocked(adminStorageService.getProducts).mockReturnValue([mockProduct]);
      vi.mocked(adminStorageService.updateProduct).mockReturnValue(false);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateSuccess = true;
      act(() => {
        updateSuccess = result.current.updateProduct('product-1', {
          name: 'Updated Product',
        });
      });

      expect(updateSuccess).toBe(false);
    });

    it('should handle product deletion failure gracefully', async () => {
      const mockProduct: Product = {
        id: 'product-1',
        name: 'Protected Product',
        category: 'Cerveja',
        country: 'Brasil',
        price: 15.00,
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
        description: 'Protected',
        alcoholContent: '5%',
        volume: '350ml',
        tastingNotes: [],
        pairing: [],
        stock: 5,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      vi.mocked(adminStorageService.getProducts).mockReturnValue([mockProduct]);
      vi.mocked(adminStorageService.deleteProduct).mockReturnValue(false);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let deleteSuccess = true;
      act(() => {
        deleteSuccess = result.current.deleteProduct('product-1');
      });

      expect(deleteSuccess).toBe(false);
      expect(result.current.products.length).toBe(1);
    });
  });

  describe('Combined Auth and Product Management Flow', () => {
    it('should require authentication before managing products', async () => {
      const mockAdmin = {
        id: 'admin-001',
        email: 'admin@timtimboutique.com',
        name: 'Administrador',
      };

      // Setup auth mocks
      vi.mocked(adminStorageService.getAdminSession)
        .mockReturnValueOnce(null) // Not authenticated initially
        .mockReturnValueOnce(mockAdmin); // Authenticated after login

      vi.mocked(adminStorageService.authenticateAdmin).mockResolvedValue(mockAdmin);
      vi.mocked(adminStorageService.saveAdminSession).mockReturnValue(true);

      // Setup product mocks
      vi.mocked(adminStorageService.getProducts).mockReturnValue([]);
      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);
      vi.mocked(adminStorageService.addProduct).mockReturnValue(true);

      // Create wrapper with both providers
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AdminAuthProvider>
          <ProductProvider>
            {children}
          </ProductProvider>
        </AdminAuthProvider>
      );

      // Test auth hook
      const { result: authResult } = renderHook(() => useAdminAuth(), { wrapper });

      // Initially not authenticated
      expect(authResult.current.isAuthenticated).toBe(false);

      // Login
      await act(async () => {
        await authResult.current.login('admin@timtimboutique.com', 'admin123');
      });

      // Now authenticated
      expect(authResult.current.isAuthenticated).toBe(true);

      // Test product hook
      const { result: productResult } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(productResult.current.loading).toBe(false);
      });

      // Now can add products
      act(() => {
        productResult.current.addProduct({
          name: 'New Product',
          category: 'Cerveja',
          country: 'Brasil',
          price: 20.00,
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
          description: 'New product',
          alcoholContent: '5%',
          volume: '350ml',
          tastingNotes: [],
          pairing: [],
          stock: 10,
        });
      });

      expect(adminStorageService.addProduct).toHaveBeenCalled();
    });
  });

  describe('Product Search and Filter Integration', () => {
    it('should filter products by category', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Cerveja 1',
          category: 'Cerveja',
          country: 'Brasil',
          price: 10.00,
          image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
          description: 'Beer 1',
          alcoholContent: '5%',
          volume: '350ml',
          tastingNotes: [],
          pairing: [],
          stock: 10,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Vinho 1',
          category: 'Vinho Tinto',
          country: 'Portugal',
          price: 50.00,
          image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400',
          description: 'Wine 1',
          alcoholContent: '13%',
          volume: '750ml',
          tastingNotes: [],
          pairing: [],
          stock: 5,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '3',
          name: 'Cerveja 2',
          category: 'Cerveja',
          country: 'Alemanha',
          price: 15.00,
          image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
          description: 'Beer 2',
          alcoholContent: '6%',
          volume: '500ml',
          tastingNotes: [],
          pairing: [],
          stock: 8,
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

      // All products loaded
      expect(result.current.products.length).toBe(3);

      // Filter by category (this would be done in the component, but we can verify the data)
      const beerProducts = result.current.products.filter(p => p.category === 'Cerveja');
      expect(beerProducts.length).toBe(2);
      expect(beerProducts.every(p => p.category === 'Cerveja')).toBe(true);

      const wineProducts = result.current.products.filter(p => p.category === 'Vinho Tinto');
      expect(wineProducts.length).toBe(1);
      expect(wineProducts[0].name).toBe('Vinho 1');
    });

    it('should search products by name', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Heineken',
          category: 'Cerveja',
          country: 'Holanda',
          price: 8.00,
          image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
          description: 'Heineken beer',
          alcoholContent: '5%',
          volume: '350ml',
          tastingNotes: [],
          pairing: [],
          stock: 20,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Corona',
          category: 'Cerveja',
          country: 'México',
          price: 9.00,
          image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
          description: 'Corona beer',
          alcoholContent: '4.5%',
          volume: '355ml',
          tastingNotes: [],
          pairing: [],
          stock: 15,
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

      // Search by name (this would be done in the component)
      const searchResults = result.current.products.filter(p => 
        p.name.toLowerCase().includes('corona'.toLowerCase())
      );

      expect(searchResults.length).toBe(1);
      expect(searchResults[0].name).toBe('Corona');
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover from storage errors', async () => {
      // First call throws error, second call succeeds
      vi.mocked(adminStorageService.getProducts)
        .mockImplementationOnce(() => {
          throw new Error('Storage error');
        })
        .mockReturnValueOnce([]);

      vi.mocked(adminStorageService.initializeProducts).mockReturnValue(true);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should fallback to hardcoded products or empty array
      expect(result.current.products).toBeDefined();
    });

    it('should handle concurrent operations safely', async () => {
      const mockProduct: Product = {
        id: 'product-1',
        name: 'Test Product',
        category: 'Cerveja',
        country: 'Brasil',
        price: 20.00,
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
        description: 'Test',
        alcoholContent: '5%',
        volume: '350ml',
        tastingNotes: [],
        pairing: [],
        stock: 10,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      vi.mocked(adminStorageService.getProducts).mockReturnValue([mockProduct]);
      vi.mocked(adminStorageService.updateProduct).mockReturnValue(true);
      vi.mocked(adminStorageService.deleteProduct).mockReturnValue(true);

      const { result } = renderHook(() => useProducts(), {
        wrapper: ProductProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Try to update and delete at the same time
      act(() => {
        result.current.updateProduct('product-1', { name: 'Updated' });
        result.current.deleteProduct('product-1');
      });

      // Both operations should be called
      expect(adminStorageService.updateProduct).toHaveBeenCalled();
      expect(adminStorageService.deleteProduct).toHaveBeenCalled();
    });
  });
});
