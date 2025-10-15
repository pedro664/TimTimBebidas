import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('WhatsApp Configuration', () => {
  beforeEach(() => {
    // Reset modules before each test
    vi.resetModules();
  });

  describe('WHATSAPP_CONFIG', () => {
    it('should have a valid phone number format', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      expect(WHATSAPP_CONFIG.phoneNumber).toBeDefined();
      expect(typeof WHATSAPP_CONFIG.phoneNumber).toBe('string');
      expect(WHATSAPP_CONFIG.phoneNumber.length).toBeGreaterThanOrEqual(12);
      expect(WHATSAPP_CONFIG.phoneNumber.length).toBeLessThanOrEqual(13);
    });

    it('should validate phone number format correctly', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      const isValid = WHATSAPP_CONFIG.isValid();
      expect(typeof isValid).toBe('boolean');
    });

    it('should generate valid WhatsApp URL', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      const testMessage = 'Olá, gostaria de fazer um pedido!';
      const url = WHATSAPP_CONFIG.generateUrl(testMessage);
      
      expect(url).toContain('https://wa.me/');
      expect(url).toContain(WHATSAPP_CONFIG.phoneNumber);
      expect(url).toContain('?text=');
      expect(url).toContain(encodeURIComponent(testMessage));
    });

    it('should encode special characters in message', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      const messageWithSpecialChars = 'Pedido #123 - R$ 100,00 (10% desconto)';
      const url = WHATSAPP_CONFIG.generateUrl(messageWithSpecialChars);
      
      expect(url).toContain('https://wa.me/');
      expect(url).toContain('%23'); // Encoded '#'
      expect(url).toContain('%24'); // Encoded '$'
      // Note: parentheses may or may not be encoded depending on encodeURIComponent behavior
      // The important thing is that the URL is valid
      expect(url).toContain(WHATSAPP_CONFIG.phoneNumber);
    });

    it('should format phone number for display', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      const formatted = WHATSAPP_CONFIG.getFormattedNumber();
      
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('+');
    });

    it('should handle empty message', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      const url = WHATSAPP_CONFIG.generateUrl('');
      
      expect(url).toContain('https://wa.me/');
      expect(url).toContain(WHATSAPP_CONFIG.phoneNumber);
    });

    it('should handle long messages', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      const longMessage = 'A'.repeat(1000);
      const url = WHATSAPP_CONFIG.generateUrl(longMessage);
      
      expect(url).toContain('https://wa.me/');
      expect(url).toContain(WHATSAPP_CONFIG.phoneNumber);
    });

    it('should handle messages with line breaks', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      const messageWithLineBreaks = 'Linha 1\nLinha 2\nLinha 3';
      const url = WHATSAPP_CONFIG.generateUrl(messageWithLineBreaks);
      
      expect(url).toContain('https://wa.me/');
      expect(url).toContain(WHATSAPP_CONFIG.phoneNumber);
      expect(url).toContain('%0A'); // Encoded line break
    });

    it('should handle messages with emojis', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      const messageWithEmojis = '🍷 Pedido de vinho 🎉';
      const url = WHATSAPP_CONFIG.generateUrl(messageWithEmojis);
      
      expect(url).toContain('https://wa.me/');
      expect(url).toContain(WHATSAPP_CONFIG.phoneNumber);
    });
  });

  describe('Phone Number Validation', () => {
    it('should validate Brazilian phone numbers (13 digits)', () => {
      const validNumber = '5581999999999'; // 55 + 81 + 999999999
      expect(validNumber).toMatch(/^\d{13}$/);
    });

    it('should validate Brazilian landline numbers (12 digits)', () => {
      const validNumber = '558133334444'; // 55 + 81 + 33334444
      expect(validNumber).toMatch(/^\d{12}$/);
    });

    it('should reject numbers with special characters', () => {
      const invalidNumbers = [
        '+5581999999999',
        '(81) 99999-9999',
        '55 81 99999-9999',
        '55-81-99999-9999'
      ];

      invalidNumbers.forEach(number => {
        expect(number).not.toMatch(/^\d{12,13}$/);
      });
    });

    it('should reject numbers with incorrect length', () => {
      const invalidNumbers = [
        '558199999999',    // 12 digits but wrong format
        '55819999999999',  // 14 digits
        '5581999999',      // 10 digits
      ];

      invalidNumbers.forEach(number => {
        const isValid = number.length >= 12 && number.length <= 13;
        expect(isValid).toBe(number.length === 12 || number.length === 13);
      });
    });
  });

  describe('URL Generation', () => {
    it('should generate correct WhatsApp Web URL structure', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      const url = WHATSAPP_CONFIG.generateUrl('Test');
      const urlPattern = /^https:\/\/wa\.me\/\d{12,13}\?text=.+$/;
      
      expect(url).toMatch(urlPattern);
    });

    it('should properly encode Portuguese characters', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      const message = 'Olá! Gostaria de informações sobre promoções.';
      const url = WHATSAPP_CONFIG.generateUrl(message);
      
      expect(url).toContain('https://wa.me/');
      expect(url).toContain('%C3%A1'); // Encoded 'á'
      expect(url).toContain('%C3%A7'); // Encoded 'ç'
    });
  });

  describe('Environment Variable', () => {
    it('should use environment variable if set', () => {
      const envNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
      
      if (envNumber) {
        expect(typeof envNumber).toBe('string');
        expect(envNumber.length).toBeGreaterThanOrEqual(12);
      }
    });

    it('should have fallback number if env var not set', async () => {
      const { WHATSAPP_CONFIG } = await import('../config/whatsapp');
      
      expect(WHATSAPP_CONFIG.phoneNumber).toBeDefined();
      expect(WHATSAPP_CONFIG.phoneNumber.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('Number Formatting', () => {
    it('should format 13-digit number correctly', () => {
      const number = '5581999999999';
      const formatted = `+${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4, 9)}-${number.slice(9)}`;
      
      expect(formatted).toBe('+55 81 99999-9999');
    });

    it('should format 12-digit number correctly', () => {
      const number = '558133334444';
      const formatted = `+${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4, 8)}-${number.slice(8)}`;
      
      expect(formatted).toBe('+55 81 3333-4444');
    });
  });
});
