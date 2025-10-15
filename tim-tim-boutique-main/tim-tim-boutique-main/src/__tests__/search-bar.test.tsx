import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import { ProductProvider } from '@/contexts/ProductContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock products
const mockProducts = [
  {
    id: '1',
    name: 'Vinho Tinto Reserva',
    description: 'Vinho tinto encorpado',
    price: 150.0,
    category: 'Vinho Tinto',
    image: '/images/vinho1.jpg',
    stock: 10,
    tastingNotes: ['Frutado', 'Encorpado'],
  },
  {
    id: '2',
    name: 'Whisky Single Malt',
    description: 'Whisky escocês premium',
    price: 350.0,
    category: 'Whisky',
    image: '/images/whisky1.jpg',
    stock: 5,
    tastingNotes: ['Defumado', 'Amadeirado'],
  },
  {
    id: '3',
    name: 'Champagne Brut',
    description: 'Champagne francês',
    price: 450.0,
    category: 'Champagne',
    image: '/images/champagne1.jpg',
    stock: 8,
    tastingNotes: ['Elegante', 'Frutado'],
  },
];

// Mock ProductContext
vi.mock('@/contexts/ProductContext', () => ({
  useProducts: () => ({
    products: mockProducts,
    loading: false,
    error: null,
  }),
  ProductProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const renderSearchBar = (theme: 'light' | 'dark' = 'light') => {
  return render(
    <BrowserRouter>
      <ProductProvider>
        <SearchBar theme={theme} />
      </ProductProvider>
    </BrowserRouter>
  );
};

describe('SearchBar Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      expect(input).toBeInTheDocument();
    });

    it('should render with light theme by default', () => {
      renderSearchBar('light');
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      expect(input).toHaveClass('text-foreground');
    });

    it('should render with dark theme', () => {
      renderSearchBar('dark');
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      expect(input).toHaveClass('text-white');
    });
  });

  describe('Search Functionality', () => {
    it('should update input value when typing', () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i) as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      expect(input.value).toBe('vinho');
    });

    it('should show suggestions when typing at least 2 characters', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'vi' } });
      
      await waitFor(() => {
        expect(screen.getByText(/vinho tinto reserva/i)).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should not show suggestions for single character', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'v' } });
      
      await waitFor(() => {
        expect(screen.queryByText(/vinho tinto reserva/i)).not.toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should filter products by name', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'whisky' } });
      
      await waitFor(() => {
        expect(screen.getByText(/whisky single malt/i)).toBeInTheDocument();
        expect(screen.queryByText(/vinho tinto reserva/i)).not.toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should filter products by category', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'champagne' } });
      
      await waitFor(() => {
        expect(screen.getByText(/champagne brut/i)).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should limit suggestions to 5 items', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'a' } });
      
      await waitFor(() => {
        const suggestions = screen.queryAllByRole('option');
        expect(suggestions.length).toBeLessThanOrEqual(5);
      }, { timeout: 500 });
    });
  });

  describe('Navigation', () => {
    it('should navigate to catalog on form submit', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      fireEvent.submit(input.closest('form')!);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/catalogo?busca=vinho');
      });
    });

    it('should navigate to product detail on suggestion click', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      
      await waitFor(() => {
        const suggestion = screen.getByText(/vinho tinto reserva/i);
        fireEvent.click(suggestion);
      }, { timeout: 500 });
      
      expect(mockNavigate).toHaveBeenCalledWith('/produto/1');
    });

    it('should navigate to catalog with "View all results" button', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      
      await waitFor(() => {
        const viewAllButton = screen.getByText(/ver todos os resultados/i);
        fireEvent.click(viewAllButton);
      }, { timeout: 500 });
      
      expect(mockNavigate).toHaveBeenCalledWith('/catalogo?busca=vinho');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate suggestions with arrow keys', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      
      await waitFor(() => {
        expect(screen.getByText(/vinho tinto reserva/i)).toBeInTheDocument();
      }, { timeout: 500 });
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      const firstSuggestion = screen.getByText(/vinho tinto reserva/i).closest('button');
      expect(firstSuggestion).toHaveClass('bg-secondary/10');
    });

    it('should select suggestion with Enter key', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      
      await waitFor(() => {
        expect(screen.getByText(/vinho tinto reserva/i)).toBeInTheDocument();
      }, { timeout: 500 });
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockNavigate).toHaveBeenCalledWith('/produto/1');
    });

    it('should close suggestions with Escape key', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      
      await waitFor(() => {
        expect(screen.getByText(/vinho tinto reserva/i)).toBeInTheDocument();
      }, { timeout: 500 });
      
      fireEvent.keyDown(input, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText(/vinho tinto reserva/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Clear Functionality', () => {
    it('should show clear button when input has value', () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      
      const clearButton = screen.getByLabelText(/limpar pesquisa/i);
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i) as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      expect(input.value).toBe('vinho');
      
      const clearButton = screen.getByLabelText(/limpar pesquisa/i);
      fireEvent.click(clearButton);
      
      expect(input.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      expect(input).toHaveAttribute('aria-label', 'Pesquisar produtos');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-controls', 'search-suggestions');
    });

    it('should update aria-expanded when suggestions are shown', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      expect(input).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      }, { timeout: 500 });
    });

    it('should have role="listbox" on suggestions container', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      
      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('Price Formatting', () => {
    it('should display prices in Brazilian Real format', async () => {
      renderSearchBar();
      const input = screen.getByPlaceholderText(/pesquisar produtos/i);
      
      fireEvent.change(input, { target: { value: 'vinho' } });
      
      await waitFor(() => {
        expect(screen.getByText(/R\$\s*150,00/)).toBeInTheDocument();
      }, { timeout: 500 });
    });
  });
});
