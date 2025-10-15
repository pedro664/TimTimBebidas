import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { toast as sonnerToast } from 'sonner';
import Checkout from '@/pages/Checkout';
import { CartProvider } from '@/contexts/CartContext';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

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
}));

describe('Checkout - Empty Cart Redirect', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  it('should redirect to cart when accessing checkout with empty cart', async () => {
    // Render checkout with empty cart
    render(
      <BrowserRouter>
        <CartProvider>
          <Checkout />
        </CartProvider>
      </BrowserRouter>
    );

    // Wait for redirect effect to trigger
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/carrinho');
    });
  });

  it('should show error message when redirecting from empty cart', async () => {
    // Render checkout with empty cart
    render(
      <BrowserRouter>
        <CartProvider>
          <Checkout />
        </CartProvider>
      </BrowserRouter>
    );

    // Wait for toast to be called
    await waitFor(() => {
      expect(sonnerToast.error).toHaveBeenCalledWith(
        'Seu carrinho está vazio',
        expect.objectContaining({
          description: 'Adicione produtos ao carrinho antes de finalizar a compra',
        })
      );
    });
  });

  it('should redirect immediately without rendering form when cart is empty', async () => {
    // Render checkout with empty cart
    const { container } = render(
      <BrowserRouter>
        <CartProvider>
          <Checkout />
        </CartProvider>
      </BrowserRouter>
    );

    // Wait for redirect
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/carrinho');
    });

    // Form should not be rendered
    expect(container.querySelector('form')).not.toBeInTheDocument();
  });
});
