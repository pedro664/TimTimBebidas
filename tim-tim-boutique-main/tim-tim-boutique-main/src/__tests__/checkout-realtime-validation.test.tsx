import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
    city: 'São Paulo',
    state: 'SP',
  }),
}));

vi.mock('@/lib/whatsappMessage', () => ({
  generateWhatsAppUrl: vi.fn().mockReturnValue('https://wa.me/5581999999999?text=test'),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render Checkout with cart context
const renderCheckout = (cartItems = []) => {
  // Setup cart with items
  sessionService.saveCart(cartItems);
  sessionService.saveShipping({
    cep: '12345-678',
    city: 'São Paulo',
    cost: 10,
    isFree: false,
    isValid: true,
  });

  return render(
    <BrowserRouter>
      <CartProvider>
        <Checkout />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Checkout - Real-time Validation', () => {
  const mockCartItems = [
    {
      id: '1',
      name: 'Vinho Tinto',
      price: 50,
      quantity: 2,
      image: 'test.jpg',
      stock: 10,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('Name Field Validation', () => {
    it('should show error immediately when name is too short', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const nameInput = screen.getByLabelText(/nome completo/i);
      
      // Type short name
      await user.type(nameInput, 'Jo');
      
      // Should show error immediately (check aria-invalid)
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Should have red border
      expect(nameInput).toHaveClass('border-destructive');
    });

    it('should show green checkmark when name is valid', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const nameInput = screen.getByLabelText(/nome completo/i);
      
      // Type valid name
      await user.type(nameInput, 'João Silva');
      
      // Should have green border
      await waitFor(() => {
        expect(nameInput).toHaveClass('border-green-500');
      });

      // Should show green checkmark
      const checkmark = nameInput.parentElement?.querySelector('span[aria-hidden="true"]');
      expect(checkmark).toBeInTheDocument();
      expect(checkmark?.textContent).toBe('✓');
    });

    it('should remove error when name becomes valid', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const nameInput = screen.getByLabelText(/nome completo/i);
      
      // Type short name
      await user.type(nameInput, 'Jo');
      
      // Should show error
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Complete the name
      await user.type(nameInput, 'ão Silva');
      
      // Error should disappear
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'false');
        expect(nameInput).toHaveClass('border-green-500');
      });
    });
  });

  describe('Email Field Validation', () => {
    it('should show error for invalid email format', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/e-mail/i);
      
      // Type invalid email
      await user.type(emailInput, 'invalid-email');
      
      // Should show error immediately
      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it('should show green checkmark for valid email', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/e-mail/i);
      
      // Type valid email
      await user.type(emailInput, 'test@example.com');
      
      // Should have green border
      await waitFor(() => {
        expect(emailInput).toHaveClass('border-green-500');
      });

      // Should show green checkmark
      const checkmark = emailInput.parentElement?.querySelector('span[aria-hidden="true"]');
      expect(checkmark).toBeInTheDocument();
    });

    it('should allow empty email (optional field)', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/e-mail/i);
      
      // Type and clear
      await user.type(emailInput, 'test');
      await user.clear(emailInput);
      
      // Should not show error for empty optional field
      await waitFor(() => {
        expect(screen.queryByText(/email inválido/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Phone Field Validation', () => {
    it('should apply mask while typing', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const phoneInput = screen.getByLabelText(/telefone\/whatsapp/i);
      
      // Type phone number
      await user.type(phoneInput, '11999998888');
      
      // Should be masked
      await waitFor(() => {
        expect(phoneInput).toHaveValue('(11) 99999-8888');
      });
    });

    it('should show error for invalid phone format', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const phoneInput = screen.getByLabelText(/telefone\/whatsapp/i);
      
      // Type incomplete phone
      await user.type(phoneInput, '1199999');
      
      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/telefone inválido/i)).toBeInTheDocument();
      });
    });

    it('should show green checkmark for valid phone', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const phoneInput = screen.getByLabelText(/telefone\/whatsapp/i);
      
      // Type valid phone
      await user.type(phoneInput, '11999998888');
      
      // Should have green border
      await waitFor(() => {
        expect(phoneInput).toHaveClass('border-green-500');
      });
    });
  });

  describe('CEP Field Validation', () => {
    it('should apply mask while typing', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const cepInput = screen.getByLabelText(/cep/i);
      
      // Type CEP
      await user.type(cepInput, '12345678');
      
      // Should be masked
      await waitFor(() => {
        expect(cepInput).toHaveValue('12345-678');
      });
    });

    it('should show error for invalid CEP format', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const cepInput = screen.getByLabelText(/cep/i);
      
      // Type incomplete CEP and blur to trigger validation
      await user.type(cepInput, '12345');
      await user.tab(); // Blur the field
      
      // Should show error (check aria-invalid)
      await waitFor(() => {
        expect(cepInput).toHaveAttribute('aria-invalid', 'true');
      }, { timeout: 2000 });
    });

    it('should show green checkmark for valid CEP', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const cepInput = screen.getByLabelText(/cep/i);
      
      // Type valid CEP
      await user.type(cepInput, '12345678');
      
      // Should be valid
      await waitFor(() => {
        expect(cepInput).toHaveAttribute('aria-invalid', 'false');
      });
    });
  });

  describe('Address Fields Validation', () => {
    it('should validate address field in real-time', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const addressInput = screen.getByLabelText(/^endereço/i);
      
      // Type valid address
      await user.type(addressInput, 'Rua Teste');
      
      // Should have green border or be valid
      await waitFor(() => {
        expect(addressInput).toHaveAttribute('aria-invalid', 'false');
      });
    });

    it('should validate number field in real-time', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const numberInput = screen.getByLabelText(/^número/i);
      
      // Leave empty and blur
      await user.click(numberInput);
      await user.tab();
      
      // Type number
      await user.type(numberInput, '123');
      
      // Should have green border
      await waitFor(() => {
        expect(numberInput).toHaveClass('border-green-500');
      });
    });

    it('should validate neighborhood field in real-time', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const neighborhoodInput = screen.getByLabelText(/bairro/i);
      
      // Type valid neighborhood
      await user.type(neighborhoodInput, 'Bairro Centro');
      
      // Should be valid
      await waitFor(() => {
        expect(neighborhoodInput).toHaveAttribute('aria-invalid', 'false');
      });
    });

    it('should validate city field in real-time', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const cityInput = screen.getByLabelText(/cidade/i);
      
      // Type valid city
      await user.type(cityInput, 'São Paulo');
      
      // Should be valid
      await waitFor(() => {
        expect(cityInput).toHaveAttribute('aria-invalid', 'false');
      });
    });

    it('should validate state field in real-time and convert to uppercase', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const stateInput = screen.getByLabelText(/estado/i);
      
      // Type lowercase state
      await user.type(stateInput, 'sp');
      
      // Should be uppercase and valid
      await waitFor(() => {
        expect(stateInput).toHaveValue('SP');
        expect(stateInput).toHaveAttribute('aria-invalid', 'false');
      });
    });
  });

  describe('Visual Feedback', () => {
    it('should show red border for fields with errors', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const nameInput = screen.getByLabelText(/nome completo/i);
      
      // Type invalid name
      await user.type(nameInput, 'Jo');
      
      // Should have red border
      await waitFor(() => {
        expect(nameInput).toHaveClass('border-destructive');
      });
    });

    it('should show green border for valid fields', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const nameInput = screen.getByLabelText(/nome completo/i);
      
      // Type valid name
      await user.type(nameInput, 'João Silva');
      
      // Should have green border
      await waitFor(() => {
        expect(nameInput).toHaveClass('border-green-500');
      });
    });

    it('should show error messages with proper ARIA attributes', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const nameInput = screen.getByLabelText(/nome completo/i);
      
      // Type invalid name
      await user.type(nameInput, 'Jo');
      
      // Should have aria-invalid
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Error message should have role="alert"
      const errorMessages = screen.getAllByRole('alert');
      expect(errorMessages.length).toBeGreaterThan(0);
      
      // Should have aria-describedby pointing to error
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
    });
  });

  describe('Form Submission with Validation', () => {
    it('should prevent submission with invalid fields', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /finalizar via whatsapp/i });
      await user.click(submitButton);
      
      // Should show validation errors (check for aria-invalid on required fields)
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/nome completo/i);
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should allow submission with all valid fields', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      // Fill all required fields
      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
      await user.type(screen.getByLabelText(/telefone\/whatsapp/i), '11999998888');
      await user.type(screen.getByLabelText(/cep/i), '12345678');
      
      // Wait for address to be fetched
      await waitFor(() => {
        expect(screen.getByLabelText(/^endereço/i)).toHaveValue('Rua Teste');
      });

      await user.type(screen.getByLabelText(/^número/i), '123');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /finalizar via whatsapp/i });
      await user.click(submitButton);
      
      // Should navigate to confirmation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/pedido-confirmado'));
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderCheckout(mockCartItems);

      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/telefone\/whatsapp/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^endereço/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^número/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bairro/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/estado/i)).toBeInTheDocument();
    });

    it('should have aria-describedby for fields with errors', async () => {
      renderCheckout(mockCartItems);
      const user = userEvent.setup();

      const nameInput = screen.getByLabelText(/nome completo/i);
      
      // Type invalid name
      await user.type(nameInput, 'Jo');
      
      // Should have aria-describedby pointing to error
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      });
    });
  });
});
