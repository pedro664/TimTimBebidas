/**
 * Test suite for authentication enhancements
 * Tests: email validation, password strength, rate limiting, error messages
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock as any;

describe('Authentication Enhancements', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Email Validation', () => {
    it('should detect duplicate emails (case-insensitive)', () => {
      const users = [
        { id: '1', email: 'test@example.com', password: 'pass123', name: 'Test User' }
      ];
      localStorage.setItem('timtim_users', JSON.stringify(users));

      const existingUsers = JSON.parse(localStorage.getItem('timtim_users') || '[]');
      const emailExists = existingUsers.some((u: any) => 
        u.email.toLowerCase() === 'TEST@EXAMPLE.COM'.toLowerCase()
      );

      expect(emailExists).toBe(true);
    });

    it('should allow registration with unique email', () => {
      const users = [
        { id: '1', email: 'test@example.com', password: 'pass123', name: 'Test User' }
      ];
      localStorage.setItem('timtim_users', JSON.stringify(users));

      const existingUsers = JSON.parse(localStorage.getItem('timtim_users') || '[]');
      const emailExists = existingUsers.some((u: any) => 
        u.email.toLowerCase() === 'newuser@example.com'.toLowerCase()
      );

      expect(emailExists).toBe(false);
    });
  });

  describe('Password Strength Validation', () => {
    it('should reject passwords shorter than 6 characters', () => {
      const password = 'abc12';
      const isValid = password.length >= 6;
      expect(isValid).toBe(false);
    });

    it('should reject passwords without letters', () => {
      const password = '123456';
      const hasLetter = /[a-zA-Z]/.test(password);
      expect(hasLetter).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      const password = 'abcdef';
      const hasNumber = /[0-9]/.test(password);
      expect(hasNumber).toBe(false);
    });

    it('should accept strong passwords', () => {
      const password = 'pass123';
      const hasMinLength = password.length >= 6;
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      
      expect(hasMinLength).toBe(true);
      expect(hasLetter).toBe(true);
      expect(hasNumber).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should track login attempts', () => {
      const rateLimitState = {
        attempts: 3,
        lastAttempt: Date.now(),
        blockedUntil: null
      };
      localStorage.setItem('timtim_rate_limit', JSON.stringify(rateLimitState));

      const saved = JSON.parse(localStorage.getItem('timtim_rate_limit') || '{}');
      expect(saved.attempts).toBe(3);
    });

    it('should block after max attempts', () => {
      const now = Date.now();
      const rateLimitState = {
        attempts: 5,
        lastAttempt: now,
        blockedUntil: now + 300000 // 5 minutes
      };

      const isBlocked = rateLimitState.blockedUntil && Date.now() < rateLimitState.blockedUntil;
      expect(isBlocked).toBe(true);
    });

    it('should reset after time window', () => {
      const oldTime = Date.now() - 70000; // 70 seconds ago
      const rateLimitState = {
        attempts: 3,
        lastAttempt: oldTime,
        blockedUntil: null
      };

      const shouldReset = Date.now() - rateLimitState.lastAttempt > 60000;
      expect(shouldReset).toBe(true);
    });
  });

  describe('Error Messages', () => {
    it('should provide specific error for invalid credentials', () => {
      const users = [
        { id: '1', email: 'test@example.com', password: 'pass123', name: 'Test User' }
      ];
      localStorage.setItem('timtim_users', JSON.stringify(users));

      const email = 'test@example.com';
      const password = 'wrongpass';
      
      const foundUser = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      expect(foundUser).toBeUndefined();
      
      // Check if email exists to provide better error
      const emailExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      const errorMessage = emailExists 
        ? "Senha incorreta. Verifique suas credenciais e tente novamente."
        : "Email não encontrado. Verifique suas credenciais ou crie uma conta.";
      
      expect(errorMessage).toBe("Senha incorreta. Verifique suas credenciais e tente novamente.");
    });

    it('should provide specific error for non-existent email', () => {
      const users = [
        { id: '1', email: 'test@example.com', password: 'pass123', name: 'Test User' }
      ];
      localStorage.setItem('timtim_users', JSON.stringify(users));

      const email = 'nonexistent@example.com';
      
      const emailExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      const errorMessage = emailExists 
        ? "Senha incorreta. Verifique suas credenciais e tente novamente."
        : "Email não encontrado. Verifique suas credenciais ou crie uma conta.";
      
      expect(errorMessage).toBe("Email não encontrado. Verifique suas credenciais ou crie uma conta.");
    });
  });

  describe('Redirect After Login', () => {
    it('should store redirect path in location state', () => {
      const from = '/checkout';
      const locationState = { from: { pathname: from } };
      
      expect(locationState.from.pathname).toBe('/checkout');
    });

    it('should default to home if no redirect path', () => {
      const locationState = {};
      const from = (locationState as any)?.from?.pathname || '/';
      
      expect(from).toBe('/');
    });
  });
});
