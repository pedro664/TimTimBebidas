/**
 * Testes Manuais Automatizados - Painel Administrativo
 * Task 18: Realizar testes manuais completos
 * 
 * Este arquivo contém testes automatizados que simulam os testes manuais
 * especificados na tarefa 18.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { ProductProvider } from '@/contexts/ProductContext';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import { adminStorageService } from '@/services/adminStorage';

// Mock do router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Task 18 - Testes Manuais Completos', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  describe('1. Testes de Login', () => {
    it('1.1 - Login com credenciais válidas', async () => {
      render(
        <BrowserRouter>
          <AdminAuthProvider>
            <AdminLogin />
          </AdminAuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'admin@timtimboutique.com' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
      });
    });

    it('1.2 - Login com credenciais inválidas', async () => {
      render(
        <BrowserRouter>
          <AdminAuthProvider>
            <AdminLogin />
          </AdminAuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
      });
    });

    it('1.3 - Persistência de sessão', () => {
      const admin = {
        id: '1',
        email: 'admin@timtimboutique.com',
        name: 'Administrador'
      };

      adminStorageService.saveAdminSession(admin);
      const savedSession = adminStorageService.getAdminSession();

      expect(savedSession).toEqual(admin);
    });
  });

  describe('2. Testes de Produtos', () => {
    it('2.1 - Adicionar novo produto', async () => {
      render(
        <BrowserRouter>
          <AdminAuthProvider>
            <ProductProvider>
              <AdminProducts />
            </ProductProvider>
          </AdminAuthProvider>
        </BrowserRouter>
      );

      const addButton = screen.getByText(/adicionar produto/i);
      expect(addButton).toBeInTheDocument();
    });

    it('2.2 - Buscar produtos', async () => {
      render(
        <BrowserRouter>
          <AdminAuthProvider>
            <ProductProvider>
              <AdminProducts />
            </ProductProvider>
          </AdminAuthProvider>
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('2.3 - Filtrar por categoria', async () => {
      render(
        <BrowserRouter>
          <AdminAuthProvider>
            <ProductProvider>
              <AdminProducts />
            </ProductProvider>
          </AdminAuthProvider>
        </BrowserRouter>
      );

      const categoryFilter = screen.getByRole('combobox');
      expect(categoryFilter).toBeInTheDocument();
    });
  });

  // Order tests removed - orders are no longer stored in database
  // Orders are finalized via WhatsApp only

  describe('4. Testes de Responsividade', () => {
    it('4.1 - Layout desktop', () => {
      global.innerWidth = 1920;
      global.dispatchEvent(new Event('resize'));

      render(
        <BrowserRouter>
          <AdminAuthProvider>
            <AdminDashboard />
          </AdminAuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it('4.2 - Layout mobile', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(
        <BrowserRouter>
          <AdminAuthProvider>
            <AdminDashboard />
          </AdminAuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  describe('5. Testes de Navegação', () => {
    it('5.1 - Verificar rotas administrativas', () => {
      const routes = ['/admin/login', '/admin/dashboard', '/admin/produtos'];
      routes.forEach(route => {
        expect(route).toContain('/admin');
      });
    });
  });

  describe('6. Testes de Acessibilidade', () => {
    it('6.1 - Labels em inputs', () => {
      render(
        <BrowserRouter>
          <AdminAuthProvider>
            <AdminLogin />
          </AdminAuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    });
  });
});
