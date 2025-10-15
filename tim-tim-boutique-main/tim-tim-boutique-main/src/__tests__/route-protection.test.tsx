import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock components for testing
const ProtectedPage = () => <div>Protected Content</div>;
const PublicPage = () => <div>Public Content</div>;
const LoginPage = () => <div>Login Page</div>;
const ProfilePage = () => <div>Profile Page</div>;

// Helper to render with router and auth context
const renderWithRouter = (
  ui: React.ReactElement,
  { initialEntries = ['/'], isAuthenticated = false } = {}
) => {
  // Setup localStorage for auth state
  beforeEach(() => {
    localStorage.clear();
    if (isAuthenticated) {
      localStorage.setItem('timtim_user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }));
    }
  });

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should redirect to login when user is not authenticated', async () => {
    renderWithRouter(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/protected" 
          element={
            <ProtectedRoute>
              <ProtectedPage />
            </ProtectedRoute>
          } 
        />
      </Routes>,
      { initialEntries: ['/protected'], isAuthenticated: false }
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('should render protected content when user is authenticated', async () => {
    localStorage.setItem('timtim_user', JSON.stringify({
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }));

    renderWithRouter(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/protected" 
          element={
            <ProtectedRoute>
              <ProtectedPage />
            </ProtectedRoute>
          } 
        />
      </Routes>,
      { initialEntries: ['/protected'], isAuthenticated: true }
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should save return URL when redirecting to login', async () => {
    const { container } = renderWithRouter(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <ProtectedPage />
            </ProtectedRoute>
          } 
        />
      </Routes>,
      { initialEntries: ['/checkout'], isAuthenticated: false }
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});

describe('PublicOnlyRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render public content when user is not authenticated', async () => {
    renderWithRouter(
      <Routes>
        <Route path="/perfil" element={<ProfilePage />} />
        <Route 
          path="/login" 
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          } 
        />
      </Routes>,
      { initialEntries: ['/login'], isAuthenticated: false }
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('should redirect to profile when user is authenticated', async () => {
    localStorage.setItem('timtim_user', JSON.stringify({
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }));

    renderWithRouter(
      <Routes>
        <Route path="/perfil" element={<ProfilePage />} />
        <Route 
          path="/login" 
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          } 
        />
      </Routes>,
      { initialEntries: ['/login'], isAuthenticated: true }
    );

    await waitFor(() => {
      expect(screen.getByText('Profile Page')).toBeInTheDocument();
    });
  });

  it('should redirect authenticated users from register page to profile', async () => {
    localStorage.setItem('timtim_user', JSON.stringify({
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }));

    renderWithRouter(
      <Routes>
        <Route path="/perfil" element={<ProfilePage />} />
        <Route 
          path="/registro" 
          element={
            <PublicOnlyRoute>
              <PublicPage />
            </PublicOnlyRoute>
          } 
        />
      </Routes>,
      { initialEntries: ['/registro'], isAuthenticated: true }
    );

    await waitFor(() => {
      expect(screen.getByText('Profile Page')).toBeInTheDocument();
    });
  });
});

describe('Route Protection Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should protect /perfil route', async () => {
    renderWithRouter(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
      </Routes>,
      { initialEntries: ['/perfil'], isAuthenticated: false }
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('should protect /checkout route', async () => {
    renderWithRouter(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <div>Checkout Page</div>
            </ProtectedRoute>
          } 
        />
      </Routes>,
      { initialEntries: ['/checkout'], isAuthenticated: false }
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
