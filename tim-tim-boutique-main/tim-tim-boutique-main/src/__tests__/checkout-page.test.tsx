import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Checkout from '@/pages/Checkout';
import { CartProvider } from '@/contexts/CartContext';
import { sessionService } from '@/services/sessionService';

// Mock dependencies
vi.mock('@/services/cepService', () => ({
  fetchAddressByCep: vi.fn().mockResolvedValue({
    street: 'Rua Teste',
    neighborhood: 'Bairro Teste',
    city: 'Recife',
    state: 'PE',
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock window.open
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Checkout Page - Session Integration', () => {
  beforeEach(() => {
    // Clear all storage
    sessionStorage.clear();
    localStorage.clear();
    
    // Reset mocks
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockWindowOpen.mockClear();
    
    // Setup a cart with items and shipping
    const sessionId = sessionService.getSessionId();
    const cartData = {
      items: [
        {
          id: '1',
          name: 'Vinho Teste',
          price: 50.00,
          quantity: 2,
          image: '/test.jpg',
          description: 'Teste',
          category: 'Vinhos',
          inStock: true,
        },
      ],
      shipping: {
        cost: 10.00,
        isFree: false,
        city: 'Recife',
        cep: '50000-000',
        isValid: true,
      },
    };
    
    sessionStorage.setItem(`tim-tim-cart-${sessionId}`, JSON.stringify(cartData.items));
    sessionStorage.setItem(`tim-tim-shipping-${sessionId}`, JSON.stringify(cartData.shipping));
  });

  const renderCheckout = () => {
    return render(
      <BrowserRouter>
        <CartProvider>
          <Checkout />
        </CartProvider>
      </BrowserRouter>
    );
  };

  it('should use sessionService.clearSession() on order submission', async () => {
    const user = userEvent.setup();
    const clearSessionSpy = vi.spyOn(sessionService, 'clearSession');
    
    renderCheckout();

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    // Fill out the form
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/telefone/i), '81999999999');
    await user.type(screen.getByLabelText(/cep/i), '50000000');
    
    // Wait for address to be filled
    await waitFor(() => {
      expect(screen.getByLabelText(/endereço/i)).toHaveValue('Rua Teste');
    });
    
    await user.type(screen.getByLabelText(/número/i), '123');
    await user.type(screen.getByLabelText(/bairro/i), 'Bairro Teste');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /finalizar via whatsapp/i });
    await user.click(submitButton);

    // Verify sessionService.clearSession was called
    await waitFor(() => {
      expect(clearSessionSpy).toHaveBeenCalled();
    });
  });

  it('should save order data to sessionStorage with correct key', async () => {
    const user = userEvent.setup();
    
    renderCheckout();

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    // Fill out the form
    await user.type(screen.getByLabelText(/nome completo/i), 'Maria Santos');
    
    // Type phone number (will be auto-masked)
    const phoneInput = screen.getByLabelText(/telefone/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, '81988888888');
    
    await user.type(screen.getByLabelText(/cep/i), '50000000');
    
    await waitFor(() => {
      expect(screen.getByLabelText(/endereço/i)).toHaveValue('Rua Teste');
    });
    
    await user.type(screen.getByLabelText(/número/i), '456');
    await user.type(screen.getByLabelText(/bairro/i), 'Bairro Teste');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /finalizar via whatsapp/i });
    await user.click(submitButton);

    // Verify order was saved to sessionStorage with correct key
    await waitFor(() => {
      const savedOrder = sessionStorage.getItem('tim-tim-last-order');
      expect(savedOrder).toBeTruthy();
      
      const orderData = JSON.parse(savedOrder!);
      expect(orderData.customerInfo.name).toBe('Maria Santos');
      // Phone will be masked, so check it contains the digits
      expect(orderData.customerInfo.phone).toContain('8888');
      expect(orderData.items).toHaveLength(1);
      expect(orderData.total).toBe(110.00); // 100 + 10 shipping
    });
  });

  it('should clear cart after successful order submission', async () => {
    const user = userEvent.setup();
    
    renderCheckout();

    // Verify cart has items initially
    const sessionId = sessionService.getSessionId();
    const initialCart = sessionStorage.getItem(`tim-tim-cart-${sessionId}`);
    expect(initialCart).toBeTruthy();

    // Fill and submit form
    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/nome completo/i), 'Pedro Costa');
    await user.type(screen.getByLabelText(/telefone/i), '81977777777');
    await user.type(screen.getByLabelText(/cep/i), '50000000');
    
    await waitFor(() => {
      expect(screen.getByLabelText(/endereço/i)).toHaveValue('Rua Teste');
    });
    
    await user.type(screen.getByLabelText(/número/i), '789');
    await user.type(screen.getByLabelText(/bairro/i), 'Bairro Teste');

    const submitButton = screen.getByRole('button', { name: /finalizar via whatsapp/i });
    await user.click(submitButton);

    // Verify cart was cleared from session
    await waitFor(() => {
      const clearedCart = sessionStorage.getItem(`tim-tim-cart-${sessionId}`);
      const clearedShipping = sessionStorage.getItem(`tim-tim-shipping-${sessionId}`);
      
      // Session should be cleared (cart will be empty array, not null)
      const cartData = clearedCart ? JSON.parse(clearedCart) : null;
      expect(cartData).toEqual([]);
      expect(clearedShipping).toBeNull();
    });
  });

  it('should open WhatsApp with correct order details', async () => {
    const user = userEvent.setup();
    
    renderCheckout();

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/nome completo/i), 'Ana Lima');
    await user.type(screen.getByLabelText(/telefone/i), '81966666666');
    await user.type(screen.getByLabelText(/cep/i), '50000000');
    
    await waitFor(() => {
      expect(screen.getByLabelText(/endereço/i)).toHaveValue('Rua Teste');
    });
    
    await user.type(screen.getByLabelText(/número/i), '321');
    await user.type(screen.getByLabelText(/bairro/i), 'Bairro Teste');

    const submitButton = screen.getByRole('button', { name: /finalizar via whatsapp/i });
    await user.click(submitButton);

    // Verify WhatsApp was opened
    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalled();
      const whatsappUrl = mockWindowOpen.mock.calls[0][0] as string;
      
      expect(whatsappUrl).toContain('wa.me');
      // Decode URL to check content
      const decodedUrl = decodeURIComponent(whatsappUrl);
      expect(decodedUrl).toContain('Ana Lima');
      expect(decodedUrl).toContain('Vinho Teste');
      expect(decodedUrl).toContain('110.00'); // Total with shipping
    });
  });

  it('should navigate to confirmation page after order submission', async () => {
    const user = userEvent.setup();
    
    renderCheckout();

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/nome completo/i), 'Carlos Souza');
    await user.type(screen.getByLabelText(/telefone/i), '81955555555');
    await user.type(screen.getByLabelText(/cep/i), '50000000');
    
    await waitFor(() => {
      expect(screen.getByLabelText(/endereço/i)).toHaveValue('Rua Teste');
    });
    
    await user.type(screen.getByLabelText(/número/i), '654');
    await user.type(screen.getByLabelText(/bairro/i), 'Bairro Teste');

    const submitButton = screen.getByRole('button', { name: /finalizar via whatsapp/i });
    await user.click(submitButton);

    // Verify navigation to confirmation page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/pedido-confirmado?orderId=')
      );
    });
  });

  it('should pre-fill shipping information from session', async () => {
    renderCheckout();

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/cep/i)).toHaveValue('50000-000');
      expect(screen.getByLabelText(/cidade/i)).toHaveValue('Recife');
    });
  });

  it('should display shipping summary from session', async () => {
    renderCheckout();

    // Verify shipping summary is displayed
    await waitFor(() => {
      expect(screen.getByText(/entrega expressa/i)).toBeInTheDocument();
      expect(screen.getByText(/recife/i)).toBeInTheDocument();
      expect(screen.getByText(/frete: r\$ 10\.00/i)).toBeInTheDocument();
    });
  });

  it('should not save to localStorage (legacy)', async () => {
    const user = userEvent.setup();
    
    renderCheckout();

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
    await user.type(screen.getByLabelText(/telefone/i), '81944444444');
    await user.type(screen.getByLabelText(/cep/i), '50000000');
    
    await waitFor(() => {
      expect(screen.getByLabelText(/endereço/i)).toHaveValue('Rua Teste');
    });
    
    await user.type(screen.getByLabelText(/número/i), '999');
    await user.type(screen.getByLabelText(/bairro/i), 'Bairro Teste');

    const submitButton = screen.getByRole('button', { name: /finalizar via whatsapp/i });
    await user.click(submitButton);

    // Verify nothing was saved to localStorage
    await waitFor(() => {
      expect(localStorage.getItem('lastOrder')).toBeNull();
      expect(localStorage.getItem('tim-tim-cart')).toBeNull();
      expect(localStorage.getItem('tim-tim-shipping')).toBeNull();
    });
  });

  it('should handle order with free shipping correctly', async () => {
    const user = userEvent.setup();
    
    // Setup cart with free shipping
    const sessionId = sessionService.getSessionId();
    const freeShippingData = {
      cost: 0,
      isFree: true,
      city: 'Recife',
      cep: '50000-000',
      isValid: true,
    };
    
    sessionStorage.setItem(`tim-tim-shipping-${sessionId}`, JSON.stringify(freeShippingData));
    
    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText(/frete grátis/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/nome completo/i), 'Free Shipping User');
    await user.type(screen.getByLabelText(/telefone/i), '81933333333');
    await user.type(screen.getByLabelText(/cep/i), '50000000');
    
    await waitFor(() => {
      expect(screen.getByLabelText(/endereço/i)).toHaveValue('Rua Teste');
    });
    
    await user.type(screen.getByLabelText(/número/i), '111');
    await user.type(screen.getByLabelText(/bairro/i), 'Bairro Teste');

    const submitButton = screen.getByRole('button', { name: /finalizar via whatsapp/i });
    await user.click(submitButton);

    // Verify order saved with free shipping
    await waitFor(() => {
      const savedOrder = sessionStorage.getItem('tim-tim-last-order');
      expect(savedOrder).toBeTruthy();
      
      const orderData = JSON.parse(savedOrder!);
      expect(orderData.shippingIsFree).toBe(true);
      expect(orderData.shippingCost).toBe(0);
      expect(orderData.total).toBe(100.00); // No shipping cost
    });
  });
});
