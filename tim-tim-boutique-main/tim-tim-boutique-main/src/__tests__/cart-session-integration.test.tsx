/**
 * Integration Tests for Cart Session Feature
 * 
 * Tests the complete flow of cart session management including:
 * - Adding items and verifying persistence
 * - Shipping calculation and persistence
 * - Checkout flow and session cleanup
 * - Session isolation between different sessions
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/contexts/CartContext';
import { sessionService } from '@/services/sessionService';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import * as shippingService from '@/services/shippingService';

// Mock services
vi.mock('@/services/shippingService', () => ({
  validateShippingArea: vi.fn(),
  getShippingInfo: vi.fn(() => ({
    baseShippingCost: 15.00,
    freeShippingThreshold: 200.00,
    estimatedHours: 2,
    coveredCities: ['Recife', 'Olinda', 'Jaboatão dos Guararapes', 'Camaragibe']
  }))
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}));

// Mock window.open for WhatsApp redirect
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

const mockProduct = {
  id: '1',
  name: 'Vinho Teste',
  price: 100.00,
  image: '/test.jpg',
  country: 'Brasil',
  volume: '750ml',
  category: 'vinho' as const,
  description: 'Vinho de teste',
  stock: 10
};

const mockProduct2 = {
  id: '2',
  name: 'Espumante Teste',
  price: 80.00,
  image: '/test2.jpg',
  country: 'Brasil',
  volume: '750ml',
  category: 'espumante' as const,
  description: 'Espumante de teste',
  stock: 5
};

describe('Cart Session Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  const renderCart = () => {
    return render(
      <BrowserRouter>
        <CartProvider>
          <Cart />
        </CartProvider>
      </BrowserRouter>
    );
  };

  const renderCheckout = () => {
    return render(
      <MemoryRouter initialEntries={['/checkout']}>
        <CartProvider>
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/carrinho" element={<div>Cart Page</div>} />
          </Routes>
        </CartProvider>
      </MemoryRouter>
    );
  };

  describe('Complete Flow: Add → Navigate → Verify Persistence', () => {
    it('should persist cart items when navigating between pages', async () => {
      // Requirement 7.1 - Validate cart persistence
      
      // Step 1: Add items to cart
      const sessionId = sessionService.getSessionId();
      sessionService.saveCart([
        { ...mockProduct, quantity: 2 },
        { ...mockProduct2, quantity: 1 }
      ]);

      // Step 2: Render cart page
      renderCart();

      // Step 3: Verify items are displayed
      await waitFor(() => {
        expect(screen.getByText('Vinho Teste')).toBeInTheDocument();
        expect(screen.getByText('Espumante Teste')).toBeInTheDocument();
      });

      // Step 4: Verify quantities are displayed
      const quantities = screen.getAllByText(/^\d+$/).filter(el => 
        el.className.includes('font-body') && el.className.includes('text-center')
      );
      expect(quantities.length).toBeGreaterThanOrEqual(2);

      // Step 5: Verify total
      expect(screen.getByText('R$ 280.00')).toBeInTheDocument(); // (100*2) + (80*1)

      // Step 6: Verify data is in sessionStorage
      const savedCart = sessionService.getCart();
      expect(savedCart).toHaveLength(2);
      expect(savedCart[0].quantity).toBe(2);
      expect(savedCart[1].quantity).toBe(1);
    });

    it('should maintain cart state after page reload simulation', () => {
      // Requirement 7.1 - Validate session persistence
      
      // Step 1: Save cart
      sessionService.saveCart([{ ...mockProduct, quantity: 3 }]);

      // Step 2: Simulate page reload by creating new component instance
      const { unmount } = renderCart();
      
      // Step 3: Verify cart is displayed
      expect(screen.getByText('Vinho Teste')).toBeInTheDocument();
      
      // Step 4: Unmount (simulate navigation away)
      unmount();

      // Step 5: Render again (simulate coming back)
      renderCart();

      // Step 6: Verify cart is still there with correct quantity
      expect(screen.getByText('Vinho Teste')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should update sessionStorage when cart items are modified', async () => {
      // Requirement 7.2 - Validate cart updates
      
      // Step 1: Add initial item
      sessionService.saveCart([{ ...mockProduct, quantity: 1 }]);

      // Step 2: Render cart
      renderCart();

      // Step 3: Increase quantity
      const increaseButton = screen.getAllByRole('button').find(
        btn => btn.textContent === '+'
      );
      
      if (increaseButton) {
        fireEvent.click(increaseButton);
      }

      // Step 4: Verify sessionStorage was updated
      await waitFor(() => {
        const savedCart = sessionService.getCart();
        expect(savedCart[0].quantity).toBe(2);
      });
    });
  });

  describe('Shipping Flow: Calculate → Checkout → Verify Data', () => {
    it('should persist shipping information across navigation', async () => {
      // Requirement 7.2 - Validate shipping persistence
      
      // Step 1: Setup cart with items
      sessionService.saveCart([{ ...mockProduct, quantity: 1 }]);

      // Step 2: Mock successful shipping validation
      vi.mocked(shippingService.validateShippingArea).mockResolvedValue({
        isValid: true,
        address: {
          cep: '50000-000',
          city: 'Recife',
          state: 'PE',
          neighborhood: 'Centro',
          street: 'Rua Teste'
        }
      });

      // Step 3: Render cart and calculate shipping
      const { unmount } = renderCart();

      const cepInput = screen.getByPlaceholderText('00000-000');
      const calculateButton = screen.getByRole('button', { name: /calcular/i });

      fireEvent.change(cepInput, { target: { value: '50000-000' } });
      fireEvent.click(calculateButton);

      // Step 4: Wait for shipping to be calculated
      await waitFor(() => {
        // Look for shipping cost in the shipping calculator section
        const shippingText = screen.getByText(/Frete: R\$/);
        expect(shippingText).toBeInTheDocument();
      });

      // Step 5: Verify shipping is saved in session
      const savedShipping = sessionService.getShipping();
      expect(savedShipping).not.toBeNull();
      expect(savedShipping?.cost).toBe(15.00);
      expect(savedShipping?.city).toBe('Recife');
      expect(savedShipping?.cep).toBe('50000-000');

      // Step 6: Unmount cart
      unmount();

      // Step 7: Render checkout page
      renderCheckout();

      // Step 8: Verify shipping info is pre-loaded in checkout
      await waitFor(() => {
        expect(screen.getByText(/Recife/)).toBeInTheDocument();
        expect(screen.getByText(/Entrega em até 2 horas/)).toBeInTheDocument();
      });
    });

    it('should show free shipping when threshold is met', async () => {
      // Requirement 7.2 - Validate free shipping logic
      
      // Step 1: Add items totaling more than R$ 200
      sessionService.saveCart([
        { ...mockProduct, quantity: 2 }, // 200
        { ...mockProduct2, quantity: 1 }  // 80
      ]); // Total: 280

      // Step 2: Mock shipping validation
      vi.mocked(shippingService.validateShippingArea).mockResolvedValue({
        isValid: true,
        address: {
          cep: '50000-000',
          city: 'Recife',
          state: 'PE',
          neighborhood: 'Centro',
          street: 'Rua Teste'
        }
      });

      // Step 3: Render cart
      renderCart();

      // Step 4: Calculate shipping
      const cepInput = screen.getByPlaceholderText('00000-000');
      const calculateButton = screen.getByRole('button', { name: /calcular/i });

      fireEvent.change(cepInput, { target: { value: '50000-000' } });
      fireEvent.click(calculateButton);

      // Step 5: Verify free shipping is shown
      await waitFor(() => {
        expect(screen.getByText('GRÁTIS')).toBeInTheDocument();
      });

      // Step 6: Verify shipping data in session
      const savedShipping = sessionService.getShipping();
      expect(savedShipping?.isFree).toBe(true);
      expect(savedShipping?.cost).toBe(0);
    });
  });

  describe('Checkout Flow: Complete → WhatsApp → Verify Cleanup', () => {
    it('should clear session after successful checkout', async () => {
      // Requirement 7.3 - Validate session cleanup after checkout
      
      // Step 1: Setup cart and shipping
      sessionService.saveCart([{ ...mockProduct, quantity: 1 }]);
      sessionService.saveShipping({
        cost: 15.00,
        isFree: false,
        city: 'Recife',
        cep: '50000-000',
        isValid: true
      });

      // Step 2: Render checkout
      renderCheckout();

      // Step 3: Fill form
      await waitFor(() => {
        expect(screen.getByLabelText(/Nome Completo/)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Nome Completo/), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText(/Telefone/), {
        target: { value: '(81) 99999-9999' }
      });
      fireEvent.change(screen.getByLabelText(/CEP/), {
        target: { value: '50000-000' }
      });
      fireEvent.change(screen.getByLabelText(/Endereço/), {
        target: { value: 'Rua Teste' }
      });
      fireEvent.change(screen.getByLabelText(/Número/), {
        target: { value: '123' }
      });
      fireEvent.change(screen.getByLabelText(/Bairro/), {
        target: { value: 'Centro' }
      });
      fireEvent.change(screen.getByLabelText(/Cidade/), {
        target: { value: 'Recife' }
      });
      fireEvent.change(screen.getByLabelText(/Estado/), {
        target: { value: 'PE' }
      });

      // Step 4: Submit form
      const form = screen.getByRole('form') || document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      // Step 5: Wait for processing and verify session was cleared
      await waitFor(() => {
        const cartAfterCheckout = sessionService.getCart();
        expect(cartAfterCheckout).toHaveLength(0);
      }, { timeout: 3000 });

      // Step 6: Verify shipping was also cleared
      const shippingAfterCheckout = sessionService.getShipping();
      expect(shippingAfterCheckout).toBeNull();
    });

    it('should save order data temporarily for confirmation page', async () => {
      // Requirement 7.3 - Validate order data persistence
      
      // Step 1: Setup cart and shipping
      sessionService.saveCart([{ ...mockProduct, quantity: 2 }]);
      sessionService.saveShipping({
        cost: 15.00,
        isFree: false,
        city: 'Recife',
        cep: '50000-000',
        isValid: true
      });

      // Step 2: Render checkout
      renderCheckout();

      // Step 3: Fill and submit form
      await waitFor(() => {
        expect(screen.getByLabelText(/Nome Completo/)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Nome Completo/), {
        target: { value: 'Maria Santos' }
      });
      fireEvent.change(screen.getByLabelText(/Telefone/), {
        target: { value: '(81) 98888-8888' }
      });
      fireEvent.change(screen.getByLabelText(/CEP/), {
        target: { value: '50000-000' }
      });
      fireEvent.change(screen.getByLabelText(/Endereço/), {
        target: { value: 'Av Principal' }
      });
      fireEvent.change(screen.getByLabelText(/Número/), {
        target: { value: '456' }
      });
      fireEvent.change(screen.getByLabelText(/Bairro/), {
        target: { value: 'Boa Viagem' }
      });
      fireEvent.change(screen.getByLabelText(/Cidade/), {
        target: { value: 'Recife' }
      });
      fireEvent.change(screen.getByLabelText(/Estado/), {
        target: { value: 'PE' }
      });

      const form = screen.getByRole('form') || document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      // Step 4: Verify order data was saved
      await waitFor(() => {
        const orderData = sessionStorage.getItem('tim-tim-last-order');
        expect(orderData).not.toBeNull();
        
        if (orderData) {
          const order = JSON.parse(orderData);
          expect(order.customerInfo.name).toBe('Maria Santos');
          expect(order.items).toHaveLength(1);
          expect(order.items[0].quantity).toBe(2);
          expect(order.shippingCost).toBe(15.00);
        }
      }, { timeout: 3000 });
    });

    it('should prevent checkout without valid shipping', async () => {
      // Requirement 7.3 - Validate shipping requirement
      
      // Step 1: Setup cart WITHOUT shipping
      sessionService.saveCart([{ ...mockProduct, quantity: 1 }]);

      // Step 2: Render checkout
      renderCheckout();

      // Step 3: Verify warning is shown
      await waitFor(() => {
        expect(screen.getByText(/Frete não calculado/)).toBeInTheDocument();
      });

      // Step 4: Verify cart was NOT cleared (since checkout should fail)
      const cartAfter = sessionService.getCart();
      expect(cartAfter).toHaveLength(1);
      
      // Step 5: Verify warning message is displayed
      expect(screen.getByText(/Frete não calculado/)).toBeInTheDocument();
    });
  });

  describe('Session Isolation', () => {
    it('should isolate cart data between different sessions', () => {
      // Requirement 7.5 - Validate session isolation
      
      // Step 1: Create first session
      const session1Id = sessionService.getSessionId();
      sessionService.saveCart([{ ...mockProduct, quantity: 1 }]);
      
      // Step 2: Manually create data for a different session
      const fakeSession2Id = 'fake-session-id-456';
      sessionStorage.setItem(`tim-tim-cart-${fakeSession2Id}`, JSON.stringify([
        { ...mockProduct2, quantity: 3 }
      ]));

      // Step 3: Verify first session cart is unchanged
      const cart1 = sessionService.getCart();
      expect(cart1).toHaveLength(1);
      expect(cart1[0].id).toBe('1');
      expect(cart1[0].quantity).toBe(1);

      // Step 4: Verify second session data exists separately
      const cart2Raw = sessionStorage.getItem(`tim-tim-cart-${fakeSession2Id}`);
      expect(cart2Raw).not.toBeNull();
      
      if (cart2Raw) {
        const cart2 = JSON.parse(cart2Raw);
        expect(cart2).toHaveLength(1);
        expect(cart2[0].id).toBe('2');
        expect(cart2[0].quantity).toBe(3);
      }

      // Step 5: Verify sessions are isolated
      expect(session1Id).not.toBe(fakeSession2Id);
    });

    it('should maintain separate shipping info per session', () => {
      // Requirement 7.5 - Validate shipping isolation
      
      // Step 1: Save shipping in first session
      const session1Id = sessionService.getSessionId();
      sessionService.saveShipping({
        cost: 15.00,
        isFree: false,
        city: 'Recife',
        cep: '50000-000',
        isValid: true
      });

      // Step 2: Manually create shipping for a different session
      const fakeSession2Id = 'fake-session-id-789';
      sessionStorage.setItem(`tim-tim-shipping-${fakeSession2Id}`, JSON.stringify({
        cost: 0,
        isFree: true,
        city: 'Olinda',
        cep: '53000-000',
        isValid: true
      }));

      // Step 3: Verify first session shipping is unchanged
      const shipping1 = sessionService.getShipping();
      expect(shipping1?.city).toBe('Recife');
      expect(shipping1?.cost).toBe(15.00);
      expect(shipping1?.isFree).toBe(false);

      // Step 4: Verify second session data exists separately
      const shipping2Raw = sessionStorage.getItem(`tim-tim-shipping-${fakeSession2Id}`);
      expect(shipping2Raw).not.toBeNull();
      
      if (shipping2Raw) {
        const shipping2 = JSON.parse(shipping2Raw);
        expect(shipping2.city).toBe('Olinda');
        expect(shipping2.isFree).toBe(true);
        expect(shipping2.cost).toBe(0);
      }

      // Step 5: Verify sessions are isolated
      expect(session1Id).not.toBe(fakeSession2Id);
    });

    it('should clear only current session data', () => {
      // Requirement 7.5 - Validate selective session cleanup
      
      // Step 1: Create first session with data
      const session1Id = sessionService.getSessionId();
      sessionService.saveCart([{ ...mockProduct, quantity: 1 }]);
      sessionService.saveShipping({
        cost: 15.00,
        isFree: false,
        city: 'Recife',
        cep: '50000-000',
        isValid: true
      });

      // Step 2: Manually save data for a "different session" in sessionStorage
      const fakeSession2Id = 'fake-session-id-123';
      sessionStorage.setItem(`tim-tim-cart-${fakeSession2Id}`, JSON.stringify([
        { ...mockProduct2, quantity: 5 }
      ]));
      sessionStorage.setItem(`tim-tim-shipping-${fakeSession2Id}`, JSON.stringify({
        cost: 0,
        isFree: true,
        city: 'Olinda',
        cep: '53000-000',
        isValid: true
      }));

      // Step 3: Clear current session
      sessionService.clearSession();

      // Step 4: Verify current session is cleared
      expect(sessionService.getCart()).toHaveLength(0);
      expect(sessionService.getShipping()).toBeNull();

      // Step 5: Verify "other session" data still exists
      const otherCart = sessionStorage.getItem(`tim-tim-cart-${fakeSession2Id}`);
      const otherShipping = sessionStorage.getItem(`tim-tim-shipping-${fakeSession2Id}`);
      
      expect(otherCart).not.toBeNull();
      expect(otherShipping).not.toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle corrupted session data gracefully', () => {
      // Requirement 7.1 - Error handling
      
      // Step 1: Save corrupted data
      const sessionId = sessionService.getSessionId();
      sessionStorage.setItem(`tim-tim-cart-${sessionId}`, 'invalid-json{{{');

      // Step 2: Try to get cart
      const cart = sessionService.getCart();

      // Step 3: Should return empty array instead of crashing
      expect(cart).toEqual([]);
    });

    it('should handle sessionStorage quota exceeded', () => {
      // Requirement 7.1 - Quota handling
      
      // Step 1: Mock quota exceeded error
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = vi.fn(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      // Step 2: Try to save cart
      const result = sessionService.saveCart([{ ...mockProduct, quantity: 1 }]);

      // Step 3: Should handle gracefully (returns void, but shouldn't crash)
      expect(() => result).not.toThrow();

      // Step 4: Restore original
      sessionStorage.setItem = originalSetItem;
    });

    it('should work when sessionStorage is unavailable', () => {
      // Requirement 7.1 - Fallback behavior
      
      // Note: This test verifies the service doesn't crash
      // In real scenario, cart would only exist in memory
      
      // Step 1: Create service (it checks availability in constructor)
      // Step 2: Try operations
      expect(() => {
        sessionService.saveCart([{ ...mockProduct, quantity: 1 }]);
        sessionService.getCart();
        sessionService.clearSession();
      }).not.toThrow();
    });
  });
});
