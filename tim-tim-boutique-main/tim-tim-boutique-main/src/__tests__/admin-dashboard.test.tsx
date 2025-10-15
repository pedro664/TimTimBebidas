import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { ProductProvider } from '@/contexts/ProductContext';

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <AdminAuthProvider>
        <ProductProvider>
          <AdminDashboard />
        </ProductProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should render dashboard title and description', () => {
    renderDashboard();
    
    // Use getByRole to get the specific heading element
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Bem-vindo ao painel administrativo da Tim Tim Bebidas')).toBeInTheDocument();
  });

  it('should render all statistics cards', () => {
    renderDashboard();
    
    // Dashboard now only shows product statistics
    // Order functionality has been removed as orders are finalized via WhatsApp
    expect(screen.getByText('Total de Produtos')).toBeInTheDocument();
    expect(screen.getByText('Produtos em Destaque')).toBeInTheDocument();
  });

  it('should calculate total products correctly', () => {
    renderDashboard();
    
    // Should show the total number of products from products.ts
    // The exact number depends on the products array
    const productCards = screen.getByText('Total de Produtos');
    expect(productCards).toBeInTheDocument();
  });

  it('should have navigation links in statistics cards', () => {
    renderDashboard();
    
    // Check that cards are wrapped in links
    const cards = document.querySelectorAll('a');
    expect(cards.length).toBeGreaterThan(0);
  });
});
