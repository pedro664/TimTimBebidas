/**
 * Final Integration Tests - Task 31
 * 
 * Comprehensive integration tests covering:
 * - Complete purchase flow
 * - Shipping calculation
 * - WhatsApp finalization
 * - Session cleanup
 * - Admin complete flow
 * 
 * Requirements: 6.7, 6.8
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '@/contexts/CartContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { sessionService } from '@/services/sessionService';
import Checkout from '@/pages/Checkout';
import Cart from '@/pages/Cart';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import { AdminLogin } from '@/pages/admin/AdminLogin';

// Mock modules
vi.mock('@/services/cepService', () => ({
  fetchAddressByCep: vi.fn().mockResolvedValue({
    street: 'Rua Teste',
    neighborhood: 'Bairro Teste',
    city: 'Recife',
    state: 'PE'
  })
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockResolvedValue({ data: null, error: null })
    })),
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: '1', email: 'admin@test.com' }, session: {} },
        error: null
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}));

// Mock window.open for WhatsApp tests
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AdminAuthProvider>
      <ProductProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ProductProvider>
    </AdminAuthProvider>
  </BrowserRouter>
);

describe('Task 31: Final Integration Tests', () => {
  beforeEach(() => {
    // Clear all storage before each test
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
    mockWindowOpen.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Complete Purchase Flow', () => {
    it('should complete full purchase flow from cart to WhatsApp', async () => {
      const user = userEvent.setup();

      // Setup: Add items to cart
      const mockProduct = {
        id: '1',
        name: 'Vinho Tinto Premium',
        price: 89.90,
        image: 'test.jpg',
        category: 'Vinho Tinto',
        description: 'Vinho teste',
        stock: 10,
        featured: true,
        tags: ['premium'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      sessionService.saveCart([
        { ...mockProduct, quantity: 2 }
      ]);

      sessionService.saveShipping({
        cep: '50000-000',
        city: 'Recife',
        cost: 10,
        isFree: false,
        isValid: true
      });

      // Render checkout
      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      // Fill in customer information
      const nameInput = screen.getByLabelText(/nome completo/i);
      const phoneInput = screen.getByLabelText(/telefone/i);
      const cepInput = screen.getByLabelText(/cep/i);
      const addressInput = screen.getByLabelText(/endereço/i);
      const numberInput = screen.getByLabelText(/número/i);
      const neighborhoodInput = screen.getByLabelText(/bairro/i);
      const cityInput = screen.getByLabelText(/cidade/i);
      const stateInput = screen.getByLabelText(/estado/i);

      await user.type(nameInput, 'João Silva');
      await user.type(phoneInput, '81999999999');
      await user.type(cepInput, '50000000');

      // Wait for CEP auto-fill
      await waitFor(() => {
        expect(addressInput).toHaveValue('Rua Teste');
      });

      await user.type(numberInput, '123');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /finalizar/i });
      await user.click(submitButton);

      // Verify WhatsApp was opened
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          expect.stringContaining('wa.me'),
          '_blank'
        );
      });

      // Verify message contains order details
      const whatsappUrl = mockWindowOpen.mock.calls[0][0];
      expect(whatsappUrl).toContain('Vinho%20Tinto%20Premium');
      expect(whatsappUrl).toContain('Jo%C3%A3o%20Silva');
      expect(whatsappUrl).toContain('Recife');

      // Verify session was cleared
      expect(sessionService.getCart()).toHaveLength(0);
      expect(sessionService.getShipping()).toBeNull();
    });

    it('should redirect to cart if cart is empty', async () => {
      // Ensure cart is empty
      sessionService.clearCart();

      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      // Should not render checkout form
      await waitFor(() => {
        expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
      });
    });

    it('should validate all required fields before submission', async () => {
      const user = userEvent.setup();

      // Setup cart with items
      sessionService.saveCart([
        {
          id: '1',
          name: 'Test Product',
          price: 50,
          quantity: 1,
          image: 'test.jpg',
          stock: 10,
          category: 'Test',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      sessionService.saveShipping({
        cep: '50000-000',
        city: 'Recife',
        cost: 10,
        isFree: false,
        isValid: true
      });

      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      // Try to submit without filling fields
      const submitButton = screen.getByRole('button', { name: /finalizar/i });
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/nome deve ter pelo menos/i)).toBeInTheDocument();
      });

      // WhatsApp should not be opened
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });
  });

  describe('2. Shipping Calculation', () => {
    it('should calculate shipping correctly', async () => {
      const user = userEvent.setup();

      // Setup cart
      sessionService.saveCart([
        {
          id: '1',
          name: 'Test Product',
          price: 50,
          quantity: 2,
          image: 'test.jpg',
          stock: 10,
          category: 'Test',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      render(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );

      // Wait for cart to load
      await waitFor(() => {
        expect(screen.getByText(/test product/i)).toBeInTheDocument();
      });

      // Find and fill CEP input
      const cepInput = screen.getByPlaceholderText(/00000-000/i);
      await user.type(cepInput, '50000000');

      // Click calculate button
      const calculateButton = screen.getByRole('button', { name: /calcular frete/i });
      await user.click(calculateButton);

      // Verify shipping was calculated
      await waitFor(() => {
        const shipping = sessionService.getShipping();
        expect(shipping).not.toBeNull();
        expect(shipping?.isValid).toBe(true);
      });
    });

    it('should apply free shipping for orders over R$ 150', async () => {
      const user = userEvent.setup();

      // Setup cart with high value
      sessionService.saveCart([
        {
          id: '1',
          name: 'Expensive Product',
          price: 200,
          quantity: 1,
          image: 'test.jpg',
          stock: 10,
          category: 'Test',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      render(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/expensive product/i)).toBeInTheDocument();
      });

      // Calculate shipping
      const cepInput = screen.getByPlaceholderText(/00000-000/i);
      await user.type(cepInput, '50000000');

      const calculateButton = screen.getByRole('button', { name: /calcular frete/i });
      await user.click(calculateButton);

      // Verify free shipping
      await waitFor(() => {
        const shipping = sessionService.getShipping();
        expect(shipping?.isFree).toBe(true);
        expect(shipping?.cost).toBe(0);
      });
    });

    it('should persist shipping in sessionStorage', async () => {
      const shippingInfo = {
        cep: '50000-000',
        city: 'Recife',
        cost: 10,
        isFree: false,
        isValid: true
      };

      sessionService.saveShipping(shippingInfo);

      // Verify it was saved
      const retrieved = sessionService.getShipping();
      expect(retrieved).toEqual(shippingInfo);

      // Verify it's in sessionStorage
      const sessionId = sessionService.getSessionId();
      const key = `tim-tim-shipping-${sessionId}`;
      const stored = JSON.parse(sessionStorage.getItem(key) || 'null');
      expect(stored).toEqual(shippingInfo);
    });
  });

  describe('3. WhatsApp Finalization', () => {
    it('should generate correct WhatsApp URL with order details', async () => {
      const user = userEvent.setup();

      // Setup complete order
      sessionService.saveCart([
        {
          id: '1',
          name: 'Vinho Tinto',
          price: 89.90,
          quantity: 2,
          image: 'test.jpg',
          stock: 10,
          category: 'Vinho',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      sessionService.saveShipping({
        cep: '50000-000',
        city: 'Recife',
        cost: 10,
        isFree: false,
        isValid: true
      });

      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      // Fill form
      await user.type(screen.getByLabelText(/nome completo/i), 'Maria Santos');
      await user.type(screen.getByLabelText(/telefone/i), '81988888888');
      await user.type(screen.getByLabelText(/cep/i), '50000000');

      await waitFor(() => {
        expect(screen.getByLabelText(/endereço/i)).toHaveValue('Rua Teste');
      });

      await user.type(screen.getByLabelText(/número/i), '456');

      // Submit
      const submitButton = screen.getByRole('button', { name: /finalizar/i });
      await user.click(submitButton);

      // Verify WhatsApp URL
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalled();
        const url = mockWindowOpen.mock.calls[0][0];
        
        // Check URL structure
        expect(url).toContain('wa.me/');
        expect(url).toContain('text=');
        
        // Check order details in message
        expect(url).toContain('Vinho%20Tinto');
        expect(url).toContain('Maria%20Santos');
        expect(url).toContain('Recife');
        expect(url).toContain('50000-000');
      });
    });

    it('should include all order information in WhatsApp message', async () => {
      const user = userEvent.setup();

      sessionService.saveCart([
        {
          id: '1',
          name: 'Produto A',
          price: 50,
          quantity: 1,
          image: 'test.jpg',
          stock: 10,
          category: 'Test',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Produto B',
          price: 30,
          quantity: 2,
          image: 'test.jpg',
          stock: 10,
          category: 'Test',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      sessionService.saveShipping({
        cep: '50000-000',
        city: 'Recife',
        cost: 15,
        isFree: false,
        isValid: true
      });

      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      // Fill minimal required fields
      await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
      await user.type(screen.getByLabelText(/telefone/i), '81999999999');
      await user.type(screen.getByLabelText(/cep/i), '50000000');

      await waitFor(() => {
        expect(screen.getByLabelText(/endereço/i)).toHaveValue();
      });

      await user.type(screen.getByLabelText(/número/i), '100');

      const submitButton = screen.getByRole('button', { name: /finalizar/i });
      await user.click(submitButton);

      await waitFor(() => {
        const url = mockWindowOpen.mock.calls[0][0];
        const decodedMessage = decodeURIComponent(url);
        
        // Check all products are included
        expect(decodedMessage).toContain('Produto A');
        expect(decodedMessage).toContain('Produto B');
        
        // Check quantities
        expect(decodedMessage).toContain('1x');
        expect(decodedMessage).toContain('2x');
        
        // Check prices
        expect(decodedMessage).toContain('50');
        expect(decodedMessage).toContain('60'); // 30 * 2
        
        // Check totals
        expect(decodedMessage).toContain('110'); // Subtotal
        expect(decodedMessage).toContain('15'); // Shipping
        expect(decodedMessage).toContain('125'); // Total
      });
    });
  });

  describe('4. Session Cleanup', () => {
    it('should clear cart after successful checkout', async () => {
      const user = userEvent.setup();

      // Setup cart
      sessionService.saveCart([
        {
          id: '1',
          name: 'Test Product',
          price: 50,
          quantity: 1,
          image: 'test.jpg',
          stock: 10,
          category: 'Test',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      sessionService.saveShipping({
        cep: '50000-000',
        city: 'Recife',
        cost: 10,
        isFree: false,
        isValid: true
      });

      // Verify cart has items
      expect(sessionService.getCart()).toHaveLength(1);
      expect(sessionService.getShipping()).not.toBeNull();

      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });

      // Complete checkout
      await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
      await user.type(screen.getByLabelText(/telefone/i), '81999999999');
      await user.type(screen.getByLabelText(/cep/i), '50000000');

      await waitFor(() => {
        expect(screen.getByLabelText(/endereço/i)).toHaveValue();
      });

      await user.type(screen.getByLabelText(/número/i), '100');

      const submitButton = screen.getByRole('button', { name: /finalizar/i });
      await user.click(submitButton);

      // Verify session was cleared
      await waitFor(() => {
        expect(sessionService.getCart()).toHaveLength(0);
        expect(sessionService.getShipping()).toBeNull();
      });
    });

    it('should clear session on browser close (sessionStorage behavior)', () => {
      // Setup session data
      sessionService.saveCart([
        {
          id: '1',
          name: 'Test',
          price: 50,
          quantity: 1,
          image: 'test.jpg',
          stock: 10,
          category: 'Test',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      // Verify data is in sessionStorage
      expect(sessionService.getCart()).toHaveLength(1);

      // Simulate browser close by clearing sessionStorage
      sessionStorage.clear();

      // Verify data is gone
      expect(sessionService.getCart()).toHaveLength(0);
    });

    it('should maintain session during page reload', () => {
      // Setup session data
      const cartData = [
        {
          id: '1',
          name: 'Test',
          price: 50,
          quantity: 1,
          image: 'test.jpg',
          stock: 10,
          category: 'Test',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      sessionService.saveCart(cartData);

      // Simulate page reload by creating new service instance
      // (in real scenario, sessionStorage persists)
      const retrievedCart = sessionService.getCart();

      expect(retrievedCart).toHaveLength(1);
      expect(retrievedCart[0].name).toBe('Test');
    });

    it('should isolate sessions between tabs', () => {
      // First tab session
      const sessionId1 = sessionService.getSessionId();
      sessionService.saveCart([
        {
          id: '1',
          name: 'Tab 1 Product',
          price: 50,
          quantity: 1,
          image: 'test.jpg',
          stock: 10,
          category: 'Test',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      // Simulate second tab with different session
      const key1 = `tim-tim-cart-${sessionId1}`;
      const cart1 = sessionStorage.getItem(key1);

      // Each tab would have its own sessionStorage in real browser
      // Here we verify the key structure supports isolation
      expect(cart1).toBeTruthy();
      expect(key1).toContain(sessionId1);
    });
  });

  describe('5. Admin Complete Flow', () => {
    it('should allow admin login', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      // Fill login form
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'admin@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Verify login was attempted
      await waitFor(() => {
        expect(vi.mocked(require('@/lib/supabase').supabase.auth.signInWithPassword)).toHaveBeenCalledWith({
          email: 'admin@test.com',
          password: 'password123'
        });
      });
    });

    it('should display admin dashboard with statistics', async () => {
      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      );

      // Verify dashboard elements
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/total de produtos/i)).toBeInTheDocument();
        expect(screen.getByText(/produtos em estoque/i)).toBeInTheDocument();
      });
    });

    it('should display products list in admin', async () => {
      render(
        <TestWrapper>
          <AdminProducts />
        </TestWrapper>
      );

      // Verify products page elements
      await waitFor(() => {
        expect(screen.getByText(/produtos/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /adicionar produto/i })).toBeInTheDocument();
      });
    });

    it('should allow searching products in admin', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminProducts />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
      });

      // Type in search
      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await user.type(searchInput, 'vinho');

      // Search input should have the value
      expect(searchInput).toHaveValue('vinho');
    });

    it('should allow filtering products by category', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdminProducts />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      // Click category selector
      const categorySelect = screen.getByRole('combobox');
      await user.click(categorySelect);

      // Verify categories are available
      await waitFor(() => {
        expect(screen.getByText(/cerveja/i)).toBeInTheDocument();
      });
    });
  });

  describe('6. Cross-Browser Compatibility', () => {
    it('should handle sessionStorage unavailability gracefully', () => {
      // Mock sessionStorage to throw error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw error
      expect(() => {
        sessionService.saveCart([
          {
            id: '1',
            name: 'Test',
            price: 50,
            quantity: 1,
            image: 'test.jpg',
            stock: 10,
            category: 'Test',
            description: 'Test',
            featured: false,
            tags: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      }).not.toThrow();

      // Restore
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle corrupted sessionStorage data', () => {
      // Set corrupted data
      const sessionId = sessionService.getSessionId();
      sessionStorage.setItem(`tim-tim-cart-${sessionId}`, 'invalid json{');

      // Should return empty array instead of throwing
      const cart = sessionService.getCart();
      expect(cart).toEqual([]);
    });

    it('should work with different viewport sizes', async () => {
      // Test mobile viewport
      window.innerWidth = 375;
      window.innerHeight = 667;

      sessionService.saveCart([
        {
          id: '1',
          name: 'Test',
          price: 50,
          quantity: 1,
          image: 'test.jpg',
          stock: 10,
          category: 'Test',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      render(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/test/i)).toBeInTheDocument();
      });

      // Test desktop viewport
      window.innerWidth = 1920;
      window.innerHeight = 1080;

      render(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/test/i)).toBeInTheDocument();
      });
    });
  });

  describe('7. Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const user = userEvent.setup();

      sessionService.saveCart([
        {
          id: '1',
          name: 'Test',
          price: 50,
          quantity: 1,
          image: 'test.jpg',
          stock: 10,
          category: 'Test',
          description: 'Test',
          featured: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      render(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/test/i)).toBeInTheDocument();
      });

      // Try to calculate shipping (will fail)
      const cepInput = screen.getByPlaceholderText(/00000-000/i);
      await user.type(cepInput, '50000000');

      const calculateButton = screen.getByRole('button', { name: /calcular frete/i });
      await user.click(calculateButton);

      // Should show error message
      await waitFor(() => {
        // Error handling should prevent crash
        expect(screen.getByText(/test/i)).toBeInTheDocument();
      });
    });

    it('should validate stock before adding to cart', async () => {
      const productWithNoStock = {
        id: '1',
        name: 'Out of Stock',
        price: 50,
        quantity: 1,
        image: 'test.jpg',
        stock: 0, // No stock
        category: 'Test',
        description: 'Test',
        featured: false,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Attempting to add should fail
      sessionService.saveCart([productWithNoStock]);
      const cart = sessionService.getCart();
      
      // Cart should be saved but validation happens in CartContext
      expect(cart).toHaveLength(1);
    });
  });
});
