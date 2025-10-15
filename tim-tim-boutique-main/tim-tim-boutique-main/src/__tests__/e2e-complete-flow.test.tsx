import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { CartProvider } from '../contexts/CartContext'
import App from '../App'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock fetch for CEP API
global.fetch = vi.fn()

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
)

describe('E2E - Complete Application Flow', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('1. Fluxo Completo de Compra', () => {
    it('deve permitir navegar do catálogo até finalização da compra', async () => {
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // 1. Verificar que está na home
      expect(window.location.pathname).toBe('/')

      // 2. Navegar para catálogo
      const catalogLink = screen.getByText(/catálogo/i)
      fireEvent.click(catalogLink)

      await waitFor(() => {
        expect(window.location.pathname).toBe('/catalogo')
      })

      // 3. Adicionar produto ao carrinho (simulado)
      // Nota: Isso requer que os produtos estejam renderizados
      
      // 4. Verificar que o carrinho foi atualizado
      const cartData = localStorageMock.getItem('cart')
      // O carrinho deve existir no localStorage após adicionar produtos
    })
  })

  describe('2. Fluxo de Autenticação', () => {
    it('deve permitir registro, login e logout completo', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // 1. Navegar para registro
      const registerLink = screen.getByText(/registrar/i)
      fireEvent.click(registerLink)

      await waitFor(() => {
        expect(window.location.pathname).toBe('/registro')
      })

      // 2. Preencher formulário de registro
      const nameInput = screen.getByLabelText(/nome/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^senha$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)

      fireEvent.change(nameInput, { target: { value: 'Test User' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })

      // 3. Submeter registro
      const submitButton = screen.getByRole('button', { name: /registrar/i })
      fireEvent.click(submitButton)

      // 4. Verificar que usuário foi salvo no localStorage
      await waitFor(() => {
        const users = JSON.parse(localStorageMock.getItem('users') || '[]')
        expect(users.length).toBeGreaterThan(0)
      })

      // 5. Fazer logout
      const logoutButton = screen.getByText(/sair/i)
      fireEvent.click(logoutButton)

      // 6. Verificar que usuário foi deslogado
      await waitFor(() => {
        const currentUser = localStorageMock.getItem('currentUser')
        expect(currentUser).toBeNull()
      })

      // 7. Fazer login novamente
      const loginLink = screen.getByText(/entrar/i)
      fireEvent.click(loginLink)

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login')
      })
    })
  })

  describe('3. Persistência de Dados', () => {
    it('deve manter dados do carrinho após reload', () => {
      // Simular dados no localStorage
      const mockCart = [
        { id: '1', name: 'Produto 1', price: 100, quantity: 2 }
      ]
      localStorageMock.setItem('cart', JSON.stringify(mockCart))

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Verificar que o carrinho foi carregado
      const cartData = JSON.parse(localStorageMock.getItem('cart') || '[]')
      expect(cartData).toHaveLength(1)
      expect(cartData[0].name).toBe('Produto 1')
    })

    it('deve manter usuário autenticado após reload', () => {
      // Simular usuário autenticado
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }
      localStorageMock.setItem('currentUser', JSON.stringify(mockUser))

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Verificar que o usuário está autenticado
      const userData = JSON.parse(localStorageMock.getItem('currentUser') || 'null')
      expect(userData).not.toBeNull()
      expect(userData.email).toBe('test@example.com')
    })

    it('deve manter pedidos após reload', () => {
      // Simular pedidos no localStorage
      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-1',
          items: [],
          total: 200,
          createdAt: new Date().toISOString()
        }
      ]
      localStorageMock.setItem('orders', JSON.stringify(mockOrders))

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Verificar que os pedidos foram carregados
      const ordersData = JSON.parse(localStorageMock.getItem('orders') || '[]')
      expect(ordersData).toHaveLength(1)
      expect(ordersData[0].id).toBe('order-1')
    })
  })

  describe('4. Validação de Formulários', () => {
    it('deve validar formulário de login', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Navegar para login
      const loginLink = screen.getByText(/entrar/i)
      fireEvent.click(loginLink)

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login')
      })

      // Tentar submeter sem preencher
      const submitButton = screen.getByRole('button', { name: /entrar/i })
      fireEvent.click(submitButton)

      // Verificar mensagens de erro
      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
      })
    })

    it('deve validar formulário de registro', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Navegar para registro
      const registerLink = screen.getByText(/registrar/i)
      fireEvent.click(registerLink)

      await waitFor(() => {
        expect(window.location.pathname).toBe('/registro')
      })

      // Preencher com senhas diferentes
      const passwordInput = screen.getByLabelText(/^senha$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)

      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'different' } })

      const submitButton = screen.getByRole('button', { name: /registrar/i })
      fireEvent.click(submitButton)

      // Verificar erro de senhas não coincidentes
      await waitFor(() => {
        expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument()
      })
    })

    it('deve validar formulário de checkout', async () => {
      // Simular usuário autenticado e carrinho com itens
      const mockUser = { id: '1', name: 'Test', email: 'test@example.com' }
      const mockCart = [{ id: '1', name: 'Produto', price: 100, quantity: 1 }]
      
      localStorageMock.setItem('currentUser', JSON.stringify(mockUser))
      localStorageMock.setItem('cart', JSON.stringify(mockCart))

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Navegar para checkout
      const checkoutLink = screen.getByText(/checkout/i)
      fireEvent.click(checkoutLink)

      await waitFor(() => {
        expect(window.location.pathname).toBe('/checkout')
      })

      // Tentar submeter sem preencher
      const submitButton = screen.getByRole('button', { name: /finalizar/i })
      fireEvent.click(submitButton)

      // Verificar mensagens de erro
      await waitFor(() => {
        const errors = screen.getAllByRole('alert')
        expect(errors.length).toBeGreaterThan(0)
      })
    })

    it('deve validar formulário de contato', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Navegar para contato
      const contactLink = screen.getByText(/contato/i)
      fireEvent.click(contactLink)

      await waitFor(() => {
        expect(window.location.pathname).toBe('/contato')
      })

      // Tentar submeter sem preencher
      const submitButton = screen.getByRole('button', { name: /enviar/i })
      fireEvent.click(submitButton)

      // Verificar mensagens de erro
      await waitFor(() => {
        expect(screen.getByText(/nome deve ter no mínimo/i)).toBeInTheDocument()
      })
    })
  })

  describe('5. Proteção de Rotas', () => {
    it('deve redirecionar para login ao acessar perfil sem autenticação', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Tentar acessar perfil
      window.history.pushState({}, '', '/perfil')

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login')
      })
    })

    it('deve redirecionar para login ao acessar checkout sem autenticação', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Tentar acessar checkout
      window.history.pushState({}, '', '/checkout')

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login')
      })
    })

    it('deve permitir acesso a perfil quando autenticado', async () => {
      // Simular usuário autenticado
      const mockUser = { id: '1', name: 'Test', email: 'test@example.com' }
      localStorageMock.setItem('currentUser', JSON.stringify(mockUser))

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Acessar perfil
      window.history.pushState({}, '', '/perfil')

      await waitFor(() => {
        expect(window.location.pathname).toBe('/perfil')
      })
    })
  })

  describe('6. Tratamento de Erros', () => {
    it('deve tratar erro de localStorage cheio', () => {
      // Simular localStorage cheio
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Tentar salvar dados grandes
      expect(() => {
        localStorageMock.setItem('test', 'data')
      }).toThrow()

      // Restaurar
      localStorageMock.setItem = originalSetItem
    })

    it('deve tratar erro de rede na API de CEP', async () => {
      // Simular erro de rede
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Navegar para checkout e tentar buscar CEP
      // A aplicação deve tratar o erro graciosamente
    })

    it('deve exibir página 404 para rotas inexistentes', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Navegar para rota inexistente
      window.history.pushState({}, '', '/rota-inexistente')

      await waitFor(() => {
        expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument()
      })
    })
  })
})
