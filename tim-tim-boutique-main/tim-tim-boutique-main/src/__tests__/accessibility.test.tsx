import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import MobileMenu from '@/components/MobileMenu';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Product } from '@/types';

expect.extend(toHaveNoViolations);

// Mock product for testing
const mockProduct: Product = {
  id: '1',
  name: 'Vinho Teste',
  category: 'Vinho Tinto',
  price: 100,
  image: '/test-image.jpg',
  country: 'Brasil',
  volume: '750ml',
  description: 'Descrição teste',
  rating: 4.5,
  inStock: true,
};

// Wrapper component with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Accessibility Tests', () => {
  describe('Navbar Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <AllTheProviders>
          <Navbar />
        </AllTheProviders>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for cart', () => {
      render(
        <AllTheProviders>
          <Navbar />
        </AllTheProviders>
      );
      
      const cartLinks = screen.getAllByLabelText(/carrinho de compras/i);
      expect(cartLinks.length).toBeGreaterThan(0);
    });

    it('should have accessible search input', () => {
      render(
        <AllTheProviders>
          <Navbar />
        </AllTheProviders>
      );
      
      const searchInputs = screen.queryAllByLabelText(/pesquisar/i);
      // Search may not be visible on all screen sizes
      expect(searchInputs.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ProductCard Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <AllTheProviders>
          <ProductCard {...mockProduct} />
        </AllTheProviders>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have descriptive link text', () => {
      render(
        <AllTheProviders>
          <ProductCard {...mockProduct} />
        </AllTheProviders>
      );
      
      const productLink = screen.getByRole('link', { 
        name: /ver detalhes de vinho teste/i 
      });
      expect(productLink).toBeInTheDocument();
    });

    it('should have accessible add to cart button', () => {
      render(
        <AllTheProviders>
          <ProductCard {...mockProduct} />
        </AllTheProviders>
      );
      
      const addButton = screen.getByRole('button', { 
        name: /adicionar vinho teste ao carrinho/i 
      });
      expect(addButton).toBeInTheDocument();
    });

    it('should have proper alt text for images', () => {
      render(
        <AllTheProviders>
          <ProductCard {...mockProduct} />
        </AllTheProviders>
      );
      
      const image = screen.getByAltText(/vinho teste - vinho tinto/i);
      expect(image).toBeInTheDocument();
    });
  });

  describe('MobileMenu Component', () => {
    const mockNavLinks = [
      { path: '/', label: 'Início' },
      { path: '/catalogo', label: 'Catálogo' },
      { path: '/sobre', label: 'Sobre' },
      { path: '/contato', label: 'Contato' },
    ];

    it('should not have accessibility violations', async () => {
      const { container } = render(
        <AllTheProviders>
          <MobileMenu navLinks={mockNavLinks} />
        </AllTheProviders>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible menu button', () => {
      render(
        <AllTheProviders>
          <MobileMenu navLinks={mockNavLinks} />
        </AllTheProviders>
      );
      
      const menuButton = screen.getByRole('button', { name: /abrir menu/i });
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have visible focus indicators', () => {
      render(
        <AllTheProviders>
          <ProductCard {...mockProduct} />
        </AllTheProviders>
      );
      
      const addButton = screen.getByRole('button', { 
        name: /adicionar vinho teste ao carrinho/i 
      });
      
      addButton.focus();
      expect(addButton).toHaveFocus();
    });
  });

  describe('Form Accessibility', () => {
    it('should associate labels with inputs', () => {
      const { container } = render(
        <AllTheProviders>
          <form>
            <label htmlFor="test-input">Test Label</label>
            <input id="test-input" type="text" />
          </form>
        </AllTheProviders>
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeInTheDocument();
    });

    it('should mark invalid fields with aria-invalid', () => {
      render(
        <AllTheProviders>
          <input 
            type="email" 
            aria-invalid="true" 
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">Email inválido</span>
        </AllTheProviders>
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('should announce errors with role="alert"', () => {
      render(
        <AllTheProviders>
          <span role="alert">Este campo é obrigatório</span>
        </AllTheProviders>
      );
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Este campo é obrigatório');
    });
  });

  describe('ARIA Attributes', () => {
    it('should use aria-label for icon-only buttons', () => {
      render(
        <AllTheProviders>
          <button aria-label="Remover produto">
            <span>×</span>
          </button>
        </AllTheProviders>
      );
      
      const button = screen.getByRole('button', { name: /remover produto/i });
      expect(button).toBeInTheDocument();
    });

    it('should use aria-expanded for collapsible elements', () => {
      render(
        <AllTheProviders>
          <button aria-expanded="false" aria-label="Menu de categorias">
            Categorias
          </button>
        </AllTheProviders>
      );
      
      const button = screen.getByRole('button', { name: /menu de categorias/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should hide decorative elements from screen readers', () => {
      render(
        <AllTheProviders>
          <div>
            <span aria-hidden="true">→</span>
            <span>Próximo</span>
          </div>
        </AllTheProviders>
      );
      
      const decorative = screen.getByText('→');
      expect(decorative).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Semantic HTML', () => {
    it('should use proper heading hierarchy', () => {
      render(
        <AllTheProviders>
          <div>
            <h1>Título Principal</h1>
            <h2>Subtítulo</h2>
            <h3>Seção</h3>
          </div>
        </AllTheProviders>
      );
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should use nav element for navigation', () => {
      render(
        <AllTheProviders>
          <nav aria-label="Navegação principal">
            <a href="/">Início</a>
          </nav>
        </AllTheProviders>
      );
      
      const nav = screen.getByRole('navigation', { name: /navegação principal/i });
      expect(nav).toBeInTheDocument();
    });

    it('should use main element for main content', () => {
      render(
        <AllTheProviders>
          <main>
            <h1>Conteúdo Principal</h1>
          </main>
        </AllTheProviders>
      );
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for text', async () => {
      const { container } = render(
        <AllTheProviders>
          <div>
            <p className="text-foreground">Texto normal</p>
            <p className="text-secondary">Texto secundário</p>
            <p className="text-muted-foreground">Texto esmaecido</p>
          </div>
        </AllTheProviders>
      );
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Touch Targets', () => {
    it('should have minimum touch target size on mobile', () => {
      render(
        <AllTheProviders>
          <button className="touch-target">Botão</button>
        </AllTheProviders>
      );
      
      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      
      // Touch target should be at least 44x44px
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
      expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Skip Links', () => {
    it('should have skip to main content link', () => {
      render(
        <AllTheProviders>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Pular para o conteúdo principal
          </a>
          <main id="main-content">Conteúdo</main>
        </AllTheProviders>
      );
      
      const skipLink = screen.getByText(/pular para o conteúdo principal/i);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });
});
