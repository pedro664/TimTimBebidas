import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from '@/pages/Cart';
import { CartProvider } from '@/contexts/CartContext';
import * as shippingService from '@/services/shippingService';

// Mock the shipping service
vi.mock('@/services/shippingService', () => ({
  validateShippingArea: vi.fn(),
  getShippingInfo: vi.fn(() => ({
    baseShippingCost: 15.00,
    freeShippingThreshold: 200.00,
    estimatedHours: 2,
    coveredCities: ['Recife', 'Olinda', 'Jaboatão dos Guararapes', 'Camaragibe']
  }))
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockProduct = {
  id: '1',
  name: 'Vinho Teste',
  price: 100.00,
  image: '/test.jpg',
  country: 'Brasil',
  volume: '750ml',
  category: 'vinho' as const,
  description: 'Teste',
  stock: 10
};

describe('Cart Shipping Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
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

  it('should display ShippingCalculator in cart', () => {
    // Add item to cart first
    localStorage.setItem('cart', JSON.stringify([{ ...mockProduct, quantity: 1 }]));
    
    renderCart();
    
    expect(screen.getByText('Calcular Frete')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('00000-000')).toBeInTheDocument();
  });

  it('should show "Calcule acima" when shipping not calculated', () => {
    localStorage.setItem('cart', JSON.stringify([{ ...mockProduct, quantity: 1 }]));
    
    renderCart();
    
    expect(screen.getByText('Calcule acima')).toBeInTheDocument();
  });

  it('should update total when shipping is calculated', async () => {
    localStorage.setItem('cart', JSON.stringify([{ ...mockProduct, quantity: 1 }]));
    
    // Mock successful shipping validation
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
    
    renderCart();
    
    const cepInput = screen.getByPlaceholderText('00000-000');
    const calculateButton = screen.getByRole('button', { name: /calcular/i });
    
    fireEvent.change(cepInput, { target: { value: '50000-000' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/R\$ 15\.00/)).toBeInTheDocument();
    });
  });

  it('should show free shipping when threshold is met', async () => {
    // Add items totaling more than R$ 200
    localStorage.setItem('cart', JSON.stringify([
      { ...mockProduct, quantity: 3 } // 3 x 100 = 300
    ]));
    
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
    
    renderCart();
    
    const cepInput = screen.getByPlaceholderText('00000-000');
    const calculateButton = screen.getByRole('button', { name: /calcular/i });
    
    fireEvent.change(cepInput, { target: { value: '50000-000' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('GRÁTIS')).toBeInTheDocument();
    });
  });

  it('should prevent checkout without shipping calculation', async () => {
    localStorage.setItem('cart', JSON.stringify([{ ...mockProduct, quantity: 1 }]));
    
    const { toast } = await import('sonner');
    
    renderCart();
    
    const checkoutButton = screen.getByRole('button', { name: /finalizar compra/i });
    fireEvent.click(checkoutButton);
    
    expect(toast.error).toHaveBeenCalledWith(
      'Por favor, calcule o frete antes de finalizar a compra'
    );
  });

  it('should allow checkout after valid shipping calculation', async () => {
    localStorage.setItem('cart', JSON.stringify([{ ...mockProduct, quantity: 1 }]));
    
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
    
    renderCart();
    
    const cepInput = screen.getByPlaceholderText('00000-000');
    const calculateButton = screen.getByRole('button', { name: /calcular/i });
    
    fireEvent.change(cepInput, { target: { value: '50000-000' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/R\$ 15\.00/)).toBeInTheDocument();
    });
    
    const checkoutButton = screen.getByRole('button', { name: /finalizar compra/i });
    fireEvent.click(checkoutButton);
    
    // Should navigate (no error toast)
    const { toast } = await import('sonner');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should display correct grand total with shipping', async () => {
    localStorage.setItem('cart', JSON.stringify([{ ...mockProduct, quantity: 1 }]));
    
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
    
    renderCart();
    
    // Initial total should be just products
    expect(screen.getByText('R$ 100.00')).toBeInTheDocument();
    
    const cepInput = screen.getByPlaceholderText('00000-000');
    const calculateButton = screen.getByRole('button', { name: /calcular/i });
    
    fireEvent.change(cepInput, { target: { value: '50000-000' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      // Should show grand total (100 + 15 = 115)
      expect(screen.getByText('R$ 115.00')).toBeInTheDocument();
    });
  });

  it('should clear shipping when CEP is changed', async () => {
    localStorage.setItem('cart', JSON.stringify([{ ...mockProduct, quantity: 1 }]));
    
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
    
    renderCart();
    
    const cepInput = screen.getByPlaceholderText('00000-000');
    const calculateButton = screen.getByRole('button', { name: /calcular/i });
    
    // Calculate shipping
    fireEvent.change(cepInput, { target: { value: '50000-000' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/R\$ 15\.00/)).toBeInTheDocument();
    });
    
    // Change CEP
    fireEvent.change(cepInput, { target: { value: '51000' } });
    
    // Shipping should be cleared
    await waitFor(() => {
      expect(screen.getByText('Calcule acima')).toBeInTheDocument();
    });
  });
});
