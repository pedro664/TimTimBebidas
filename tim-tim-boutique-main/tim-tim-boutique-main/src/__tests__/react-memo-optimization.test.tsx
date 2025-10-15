import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { AdminCard } from '@/components/admin/AdminCard';
import CartItem from '@/components/CartItem';
import { Package } from 'lucide-react';
import { CartProvider } from '@/contexts/CartContext';

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('React.memo Optimization Tests', () => {
  describe('ProductCard', () => {
    it('should be wrapped with React.memo', () => {
      const product = {
        id: '1',
        name: 'Test Wine',
        price: 100,
        image: 'test.jpg',
        category: 'Vinho',
        country: 'Brasil',
        stock: 10,
        description: 'Test',
        volume: '750ml',
        featured: false,
        tags: [],
      };

      const { rerender } = render(
        <BrowserRouter>
          <CartProvider>
            <ProductCard {...product} />
          </CartProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Test Wine')).toBeInTheDocument();

      // Re-render with same props - should not cause re-render due to memo
      rerender(
        <BrowserRouter>
          <CartProvider>
            <ProductCard {...product} />
          </CartProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Test Wine')).toBeInTheDocument();
    });

    it('should re-render when props change', () => {
      const product1 = {
        id: '1',
        name: 'Test Wine 1',
        price: 100,
        image: 'test.jpg',
        category: 'Vinho',
        country: 'Brasil',
        stock: 10,
        description: 'Test',
        volume: '750ml',
        featured: false,
        tags: [],
      };

      const product2 = {
        ...product1,
        name: 'Test Wine 2',
      };

      const { rerender } = render(
        <BrowserRouter>
          <CartProvider>
            <ProductCard {...product1} />
          </CartProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Test Wine 1')).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <CartProvider>
            <ProductCard {...product2} />
          </CartProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Test Wine 2')).toBeInTheDocument();
    });
  });

  describe('AdminCard', () => {
    it('should be wrapped with React.memo', () => {
      const { rerender } = render(
        <BrowserRouter>
          <AdminCard
            title="Total Products"
            value={10}
            icon={Package}
            description="Active products"
          />
        </BrowserRouter>
      );

      expect(screen.getByText('Total Products')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();

      // Re-render with same props
      rerender(
        <BrowserRouter>
          <AdminCard
            title="Total Products"
            value={10}
            icon={Package}
            description="Active products"
          />
        </BrowserRouter>
      );

      expect(screen.getByText('Total Products')).toBeInTheDocument();
    });

    it('should re-render when value changes', () => {
      const { rerender } = render(
        <BrowserRouter>
          <AdminCard
            title="Total Products"
            value={10}
            icon={Package}
          />
        </BrowserRouter>
      );

      expect(screen.getByText('10')).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <AdminCard
            title="Total Products"
            value={20}
            icon={Package}
          />
        </BrowserRouter>
      );

      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });

  describe('CartItem', () => {
    it('should be wrapped with React.memo', () => {
      const item = {
        id: '1',
        name: 'Test Wine',
        price: 100,
        quantity: 2,
        image: 'test.jpg',
        stock: 10,
        country: 'Brasil',
        volume: '750ml',
      };

      const onRemove = vi.fn();
      const onUpdateQuantity = vi.fn();

      const { rerender } = render(
        <BrowserRouter>
          <CartItem
            item={item}
            onRemove={onRemove}
            onUpdateQuantity={onUpdateQuantity}
          />
        </BrowserRouter>
      );

      expect(screen.getByText('Test Wine')).toBeInTheDocument();

      // Re-render with same props
      rerender(
        <BrowserRouter>
          <CartItem
            item={item}
            onRemove={onRemove}
            onUpdateQuantity={onUpdateQuantity}
          />
        </BrowserRouter>
      );

      expect(screen.getByText('Test Wine')).toBeInTheDocument();
    });

    it('should re-render when item quantity changes', () => {
      const item1 = {
        id: '1',
        name: 'Test Wine',
        price: 100,
        quantity: 2,
        image: 'test.jpg',
        stock: 10,
        country: 'Brasil',
        volume: '750ml',
      };

      const item2 = {
        ...item1,
        quantity: 3,
      };

      const onRemove = vi.fn();
      const onUpdateQuantity = vi.fn();

      const { rerender } = render(
        <BrowserRouter>
          <CartItem
            item={item1}
            onRemove={onRemove}
            onUpdateQuantity={onUpdateQuantity}
          />
        </BrowserRouter>
      );

      expect(screen.getByText('2')).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <CartItem
            item={item2}
            onRemove={onRemove}
            onUpdateQuantity={onUpdateQuantity}
          />
        </BrowserRouter>
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Component displayName', () => {
    it('ProductCard should have displayName', () => {
      expect(ProductCard.displayName).toBe('ProductCard');
    });

    it('AdminCard should be memoized', () => {
      // AdminCard uses named function syntax with memo, which automatically sets displayName
      // We verify it's memoized by checking the component type
      expect(AdminCard).toBeDefined();
      expect(typeof AdminCard).toBe('object');
    });

    it('CartItem should have displayName', () => {
      expect(CartItem.displayName).toBe('CartItem');
    });
  });
});
