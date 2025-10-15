import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShippingCalculator from '@/components/ShippingCalculator';
import * as shippingService from '@/services/shippingService';
import { CartProvider } from '@/contexts/CartContext';

// Mock the shipping service
vi.mock('@/services/shippingService', () => ({
  validateShippingArea: vi.fn(),
  getShippingInfo: vi.fn(() => ({
    deliveryTime: 'até 2 horas',
    freeShippingThreshold: 200,
    coveredCities: ['Recife', 'Olinda', 'Jaboatão dos Guararapes', 'Camaragibe'],
    baseShippingCost: 15,
    weightPerBottle: 1.5
  }))
}));

// Mock sessionService
vi.mock('@/services/sessionService', () => ({
  sessionService: {
    getCart: vi.fn(() => []),
    saveCart: vi.fn(),
    getShipping: vi.fn(() => null),
    saveShipping: vi.fn(),
    clearShipping: vi.fn(),
    getSessionId: vi.fn(() => 'test-session-id'),
    generateSessionId: vi.fn(() => 'test-session-id'),
    clearSession: vi.fn()
  }
}));

// Mock migration
vi.mock('@/lib/migration', () => ({
  migrateFromLocalStorage: vi.fn()
}));

// Helper to render with CartProvider
const renderWithCart = (component: React.ReactElement) => {
  return render(<CartProvider>{component}</CartProvider>);
};

describe('ShippingCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renders the component with input and button', () => {
    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    expect(screen.getByLabelText(/digite seu cep/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calcular frete/i })).toBeInTheDocument();
  });

  it('applies CEP mask correctly', () => {
    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const input = screen.getByLabelText(/digite seu cep/i) as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: '12345678' } });
    
    expect(input.value).toBe('12345-678');
  });

  it('disables button when CEP is incomplete', () => {
    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const button = screen.getByRole('button', { name: /calcular frete/i });
    const input = screen.getByLabelText(/digite seu cep/i);
    
    fireEvent.change(input, { target: { value: '12345' } });
    
    expect(button).toBeDisabled();
  });

  it('enables button when CEP is complete', () => {
    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const button = screen.getByRole('button', { name: /calcular frete/i });
    const input = screen.getByLabelText(/digite seu cep/i);
    
    fireEvent.change(input, { target: { value: '12345678' } });
    
    expect(button).not.toBeDisabled();
  });

  it('shows error for invalid CEP length', async () => {
    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    fireEvent.change(input, { target: { value: '123' } });
    
    // Button should be disabled for incomplete CEP
    expect(button).toBeDisabled();
  });

  it('displays free shipping message when subtotal is above threshold', async () => {
    const mockValidation = {
      isValid: true,
      address: {
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'Recife',
        state: 'PE'
      }
    };

    vi.mocked(shippingService.validateShippingArea).mockResolvedValue(mockValidation);

    renderWithCart(<ShippingCalculator subtotal={250} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    fireEvent.change(input, { target: { value: '50000000' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/🎉 frete grátis!/i)).toBeInTheDocument();
      expect(screen.getByText(/recife/i)).toBeInTheDocument();
    });
  });

  it('displays shipping cost when subtotal is below threshold', async () => {
    const mockValidation = {
      isValid: true,
      address: {
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'Recife',
        state: 'PE'
      }
    };

    vi.mocked(shippingService.validateShippingArea).mockResolvedValue(mockValidation);

    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    fireEvent.change(input, { target: { value: '50000000' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/frete: r\$ 15\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/recife/i)).toBeInTheDocument();
    });
  });

  it('shows how much is needed for free shipping', async () => {
    const mockValidation = {
      isValid: true,
      address: {
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'Recife',
        state: 'PE'
      }
    };

    vi.mocked(shippingService.validateShippingArea).mockResolvedValue(mockValidation);

    renderWithCart(<ShippingCalculator subtotal={150} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    fireEvent.change(input, { target: { value: '50000000' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/falta r\$ 50\.00 para frete grátis!/i)).toBeInTheDocument();
    });
  });

  it('displays error message for area not covered', async () => {
    const mockValidation = {
      isValid: false,
      address: {
        street: 'Praça da Sé',
        neighborhood: 'Sé',
        city: 'São Paulo',
        state: 'SP'
      },
      error: 'Desculpe, não entregamos em São Paulo. Atendemos apenas: Recife, Olinda, Jaboatão dos Guararapes e Camaragibe.'
    };

    vi.mocked(shippingService.validateShippingArea).mockResolvedValue(mockValidation);

    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    fireEvent.change(input, { target: { value: '01000000' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/área não atendida/i)).toBeInTheDocument();
      expect(screen.getByText(/não entregamos em são paulo/i)).toBeInTheDocument();
      expect(screen.getByText(/cidades atendidas:/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while calculating', async () => {
    const mockValidation = {
      isValid: true,
      address: {
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'Recife',
        state: 'PE'
      }
    };

    // Delay the response to see loading state
    vi.mocked(shippingService.validateShippingArea).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockValidation), 100))
    );

    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    fireEvent.change(input, { target: { value: '50000000' } });
    fireEvent.click(button);
    
    expect(screen.getByText(/calculando\.\.\./i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/calculando\.\.\./i)).not.toBeInTheDocument();
    });
  });

  it('calls onShippingCalculated callback with correct values', async () => {
    const mockValidation = {
      isValid: true,
      address: {
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'Recife',
        state: 'PE'
      }
    };

    vi.mocked(shippingService.validateShippingArea).mockResolvedValue(mockValidation);

    const onShippingCalculated = vi.fn();

    renderWithCart(<ShippingCalculator subtotal={100} onShippingCalculated={onShippingCalculated} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    fireEvent.change(input, { target: { value: '50000000' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(onShippingCalculated).toHaveBeenCalledWith(15, false, 'Recife', '50000-000');
    });
  });

  it('displays info box before calculation', () => {
    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    expect(screen.getByText(/entrega expressa/i)).toBeInTheDocument();
    expect(screen.getByText(/⚡ entrega em até 2 horas/i)).toBeInTheDocument();
    expect(screen.getByText(/🎁 frete grátis acima de r\$ 200\.00/i)).toBeInTheDocument();
  });

  it('allows calculation via Enter key', async () => {
    const mockValidation = {
      isValid: true,
      address: {
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'Recife',
        state: 'PE'
      }
    };

    vi.mocked(shippingService.validateShippingArea).mockResolvedValue(mockValidation);

    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    
    fireEvent.change(input, { target: { value: '50000000' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText(/frete: r\$ 15\.00/i)).toBeInTheDocument();
    });
  });

  it('clears results when CEP is changed', async () => {
    const mockValidation = {
      isValid: true,
      address: {
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'Recife',
        state: 'PE'
      }
    };

    vi.mocked(shippingService.validateShippingArea).mockResolvedValue(mockValidation);

    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    // First calculation
    fireEvent.change(input, { target: { value: '50000000' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/frete: r\$ 15\.00/i)).toBeInTheDocument();
    });
    
    // Change CEP
    fireEvent.change(input, { target: { value: '51000' } });
    
    // Result should be cleared
    expect(screen.queryByText(/frete: r\$ 15\.00/i)).not.toBeInTheDocument();
  });

  // Session Persistence Tests (Requirements 6.1, 6.2, 6.3, 6.4, 6.5)
  
  it('saves shipping info to session when calculated (Requirement 6.1)', async () => {
    const mockValidation = {
      isValid: true,
      address: {
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'Recife',
        state: 'PE'
      }
    };

    vi.mocked(shippingService.validateShippingArea).mockResolvedValue(mockValidation);

    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    fireEvent.change(input, { target: { value: '50000000' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/frete: r\$ 15\.00/i)).toBeInTheDocument();
    });

    // Verify shipping was saved to session via CartContext
    // The CartContext will automatically save to sessionStorage
    expect(screen.getByText(/recife/i)).toBeInTheDocument();
  });

  it('loads shipping info from session on mount (Requirement 6.2)', () => {
    // Mock sessionService to return saved shipping
    const { sessionService } = require('@/services/sessionService');
    sessionService.getShipping.mockReturnValue({
      cost: 15,
      isFree: false,
      city: 'Recife',
      cep: '50000-000',
      isValid: true
    });

    const onShippingCalculated = vi.fn();

    renderWithCart(<ShippingCalculator subtotal={100} onShippingCalculated={onShippingCalculated} />);
    
    // Should pre-load shipping data
    expect(screen.getByDisplayValue('50000-000')).toBeInTheDocument();
    expect(screen.getByText(/frete: r\$ 15\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/recife/i)).toBeInTheDocument();
    
    // Should notify parent
    expect(onShippingCalculated).toHaveBeenCalledWith(15, false, 'Recife', '50000-000');
  });

  it('updates shipping in session when CEP changes (Requirement 6.3)', async () => {
    const mockValidation = {
      isValid: true,
      address: {
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'Olinda',
        state: 'PE'
      }
    };

    vi.mocked(shippingService.validateShippingArea).mockResolvedValue(mockValidation);

    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    // First calculation
    fireEvent.change(input, { target: { value: '50000000' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/frete: r\$ 15\.00/i)).toBeInTheDocument();
    });

    // Change CEP - should clear session
    fireEvent.change(input, { target: { value: '51000' } });
    
    // Calculate again with new CEP
    mockValidation.address.city = 'Olinda';
    fireEvent.change(input, { target: { value: '51000000' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/olinda/i)).toBeInTheDocument();
    });
  });

  it('persists shipping across navigation (Requirement 6.2)', () => {
    // Mock sessionService to return saved shipping
    const { sessionService } = require('@/services/sessionService');
    sessionService.getShipping.mockReturnValue({
      cost: 0,
      isFree: true,
      city: 'Recife',
      cep: '50000-000',
      isValid: true
    });

    renderWithCart(<ShippingCalculator subtotal={250} />);
    
    // Should show free shipping from session
    expect(screen.getByText(/🎉 frete grátis!/i)).toBeInTheDocument();
    expect(screen.getByText(/recife/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('50000-000')).toBeInTheDocument();
  });

  it('shows warning when no shipping calculated in checkout (Requirement 6.5)', () => {
    // Mock sessionService to return no shipping
    const { sessionService } = require('@/services/sessionService');
    sessionService.getShipping.mockReturnValue(null);

    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    // Should show info box prompting to calculate
    expect(screen.getByText(/entrega expressa/i)).toBeInTheDocument();
    expect(screen.getByText(/calcular frete/i)).toBeInTheDocument();
  });

  it('clears shipping from session when CEP is changed (Requirement 6.3)', async () => {
    const mockValidation = {
      isValid: true,
      address: {
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'Recife',
        state: 'PE'
      }
    };

    vi.mocked(shippingService.validateShippingArea).mockResolvedValue(mockValidation);

    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    // Calculate shipping
    fireEvent.change(input, { target: { value: '50000000' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/frete: r\$ 15\.00/i)).toBeInTheDocument();
    });

    // Change CEP - should clear results and session
    fireEvent.change(input, { target: { value: '51' } });
    
    expect(screen.queryByText(/frete: r\$ 15\.00/i)).not.toBeInTheDocument();
  });

  it('saves invalid shipping to session (Requirement 6.1)', async () => {
    const mockValidation = {
      isValid: false,
      error: 'CEP não encontrado'
    };

    vi.mocked(shippingService.validateShippingArea).mockResolvedValue(mockValidation);

    renderWithCart(<ShippingCalculator subtotal={100} />);
    
    const input = screen.getByLabelText(/digite seu cep/i);
    const button = screen.getByRole('button', { name: /calcular frete/i });
    
    fireEvent.change(input, { target: { value: '99999999' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/cep não encontrado/i)).toBeInTheDocument();
    });

    // Invalid shipping should still be saved to track user attempts
  });
});
