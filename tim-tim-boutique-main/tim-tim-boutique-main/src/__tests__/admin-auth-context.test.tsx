import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminStorageService } from '@/services/adminStorage';

// Mock the adminStorageService
vi.mock('@/services/adminStorage', () => ({
  adminStorageService: {
    authenticateAdmin: vi.fn(),
    saveAdminSession: vi.fn(),
    getAdminSession: vi.fn(),
    clearAdminSession: vi.fn(),
  },
}));

describe('AdminAuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with no admin session', () => {
    vi.mocked(adminStorageService.getAdminSession).mockReturnValue(null);

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    expect(result.current.admin).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should load existing session on mount', () => {
    const mockAdmin = {
      id: 'admin-001',
      email: 'admin@timtimboutique.com',
      name: 'Administrador',
    };

    vi.mocked(adminStorageService.getAdminSession).mockReturnValue(mockAdmin);

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    expect(result.current.admin).toEqual(mockAdmin);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should login successfully with valid credentials', async () => {
    const mockAdmin = {
      id: 'admin-001',
      email: 'admin@timtimboutique.com',
      name: 'Administrador',
    };

    vi.mocked(adminStorageService.getAdminSession).mockReturnValue(null);
    vi.mocked(adminStorageService.authenticateAdmin).mockResolvedValue(mockAdmin);
    vi.mocked(adminStorageService.saveAdminSession).mockReturnValue(true);

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    let loginResult: boolean = false;

    await act(async () => {
      loginResult = await result.current.login('admin@timtimboutique.com', 'admin123');
    });

    expect(loginResult).toBe(true);
    expect(result.current.admin).toEqual(mockAdmin);
    expect(result.current.isAuthenticated).toBe(true);
    expect(adminStorageService.authenticateAdmin).toHaveBeenCalledWith(
      'admin@timtimboutique.com',
      'admin123'
    );
    expect(adminStorageService.saveAdminSession).toHaveBeenCalledWith(mockAdmin);
  });

  it('should fail login with invalid credentials', async () => {
    vi.mocked(adminStorageService.getAdminSession).mockReturnValue(null);
    vi.mocked(adminStorageService.authenticateAdmin).mockResolvedValue(null);

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    let loginResult: boolean = false;

    await act(async () => {
      loginResult = await result.current.login('wrong@email.com', 'wrongpassword');
    });

    expect(loginResult).toBe(false);
    expect(result.current.admin).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should logout and clear session', async () => {
    const mockAdmin = {
      id: 'admin-001',
      email: 'admin@timtimboutique.com',
      name: 'Administrador',
    };

    vi.mocked(adminStorageService.getAdminSession).mockReturnValue(mockAdmin);

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    // Verify admin is logged in
    expect(result.current.isAuthenticated).toBe(true);

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.admin).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(adminStorageService.clearAdminSession).toHaveBeenCalled();
  });

  it('should handle login errors gracefully', async () => {
    vi.mocked(adminStorageService.getAdminSession).mockReturnValue(null);
    vi.mocked(adminStorageService.authenticateAdmin).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    let loginResult: boolean = false;

    await act(async () => {
      loginResult = await result.current.login('admin@timtimboutique.com', 'admin123');
    });

    expect(loginResult).toBe(false);
    expect(result.current.admin).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should persist session across page reloads', () => {
    const mockAdmin = {
      id: 'admin-001',
      email: 'admin@timtimboutique.com',
      name: 'Administrador',
    };

    vi.mocked(adminStorageService.getAdminSession).mockReturnValue(mockAdmin);

    // First render - simulating initial page load
    const { result: result1 } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    expect(result1.current.admin).toEqual(mockAdmin);
    expect(result1.current.isAuthenticated).toBe(true);

    // Second render - simulating page reload
    const { result: result2 } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    expect(result2.current.admin).toEqual(mockAdmin);
    expect(result2.current.isAuthenticated).toBe(true);
  });

  it('should throw error when useAdminAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAdminAuth());
    }).toThrow('useAdminAuth must be used within AdminAuthProvider');

    consoleError.mockRestore();
  });
});
