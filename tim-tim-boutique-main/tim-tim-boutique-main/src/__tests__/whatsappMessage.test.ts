/**
 * Tests for WhatsApp Message Generator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateWhatsAppMessage,
  generateWhatsAppUrl,
  validateOrderData,
  type OrderMessageData,
} from '@/lib/whatsappMessage';

describe('WhatsApp Message Generator', () => {
  let mockOrderData: OrderMessageData;

  beforeEach(() => {
    mockOrderData = {
      id: 'TIM-1234567890',
      items: [
        {
          id: '1',
          name: 'Vinho Tinto Reserva',
          price: 89.90,
          quantity: 2,
        },
        {
          id: '2',
          name: 'Espumante Brut',
          price: 65.00,
          quantity: 1,
        },
      ],
      subtotal: 244.80,
      shipping: {
        cep: '50000-000',
        city: 'Recife',
        cost: 10.00,
        isFree: false,
      },
      total: 254.80,
      customerInfo: {
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '(81) 99999-9999',
      },
      shippingAddress: {
        cep: '50000-000',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 101',
        neighborhood: 'Boa Viagem',
        city: 'Recife',
        state: 'PE',
      },
    };
  });

  describe('generateWhatsAppMessage', () => {
    it('should generate a formatted message with all order details', () => {
      const message = generateWhatsAppMessage(mockOrderData);

      // Check for main sections
      expect(message).toContain('🍷 *Novo Pedido - Tim-Tim Boutique*');
      expect(message).toContain('📋 *PEDIDO #TIM-1234567890*');
      expect(message).toContain('*Produtos:*');
      expect(message).toContain('💰 *VALORES*');
      expect(message).toContain('🚚 *ENTREGA*');
      expect(message).toContain('👤 *DADOS DO CLIENTE*');
      expect(message).toContain('📍 *ENDEREÇO DE ENTREGA*');
    });

    it('should include all products with correct formatting', () => {
      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('2x Vinho Tinto Reserva');
      expect(message).toContain('R$ 179.80'); // 2 * 89.90
      expect(message).toContain('1x Espumante Brut');
      expect(message).toContain('R$ 65.00');
    });

    it('should include correct totals', () => {
      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('Subtotal: R$ 244.80');
      expect(message).toContain('Frete: R$ 10.00');
      expect(message).toContain('*TOTAL: R$ 254.80*');
    });

    it('should show free shipping when applicable', () => {
      mockOrderData.shipping.isFree = true;
      mockOrderData.shipping.cost = 0;
      mockOrderData.total = 244.80;

      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('🎉 *FRETE GRÁTIS*');
      expect(message).not.toContain('R$ 0.00');
    });

    it('should include customer information', () => {
      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('Nome: João Silva');
      expect(message).toContain('Telefone: (81) 99999-9999');
      expect(message).toContain('Email: joao@example.com');
    });

    it('should handle missing email gracefully', () => {
      mockOrderData.customerInfo.email = undefined;

      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('Nome: João Silva');
      expect(message).toContain('Telefone: (81) 99999-9999');
      expect(message).not.toContain('Email:');
    });

    it('should include complete shipping address', () => {
      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('Rua das Flores, 123');
      expect(message).toContain('Apto 101');
      expect(message).toContain('Boa Viagem');
      expect(message).toContain('Recife - PE');
      expect(message).toContain('CEP: 50000-000');
    });

    it('should handle missing complement in address', () => {
      mockOrderData.shippingAddress.complement = undefined;

      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('Rua das Flores, 123');
      expect(message).toContain('Boa Viagem');
      expect(message).not.toContain('Apto 101');
    });

    it('should include delivery information', () => {
      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('até 2 horas 🚚');
      expect(message).toContain('📍 Recife');
    });

    it('should include estimated delivery time when provided', () => {
      const deliveryTime = new Date('2024-01-15T16:30:00');
      mockOrderData.estimatedDeliveryTime = deliveryTime;

      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('até 2 horas 🚚');
      expect(message).toContain('*Previsão:* 16:30');
    });

    it('should format prices with 2 decimal places', () => {
      mockOrderData.items[0].price = 89.9; // Single decimal
      mockOrderData.subtotal = 244.8;
      mockOrderData.total = 254.8;

      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('R$ 179.80');
      expect(message).toContain('Subtotal: R$ 244.80');
      expect(message).toContain('*TOTAL: R$ 254.80*');
    });

    it('should handle multiple items correctly', () => {
      mockOrderData.items.push({
        id: '3',
        name: 'Whisky Premium',
        price: 150.00,
        quantity: 1,
      });

      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('2x Vinho Tinto Reserva');
      expect(message).toContain('1x Espumante Brut');
      expect(message).toContain('1x Whisky Premium');
    });

    it('should include visual separators for readability', () => {
      const message = generateWhatsAppMessage(mockOrderData);

      // Check for separator lines
      const separatorCount = (message.match(/━━━━━━━━━━━━━━━━━━━━━━/g) || []).length;
      expect(separatorCount).toBeGreaterThan(0);
    });

    it('should include emojis for better visual appeal', () => {
      const message = generateWhatsAppMessage(mockOrderData);

      expect(message).toContain('🍷');
      expect(message).toContain('📋');
      expect(message).toContain('💰');
      expect(message).toContain('🚚');
      expect(message).toContain('👤');
      expect(message).toContain('📍');
      expect(message).toContain('✨');
    });
  });

  describe('generateWhatsAppUrl', () => {
    it('should generate a valid WhatsApp URL', () => {
      const url = generateWhatsAppUrl(mockOrderData);

      expect(url).toContain('https://wa.me/');
      expect(url).toContain('?text=');
    });

    it('should encode the message properly', () => {
      const url = generateWhatsAppUrl(mockOrderData);

      // URL should be encoded
      expect(url).not.toContain(' ');
      expect(url).not.toContain('\n');
      expect(url).toContain('%');
    });

    it('should include the phone number from config', () => {
      const url = generateWhatsAppUrl(mockOrderData);

      // Should contain a phone number pattern
      expect(url).toMatch(/https:\/\/wa\.me\/\d+\?text=/);
    });

    it('should generate different URLs for different orders', () => {
      const url1 = generateWhatsAppUrl(mockOrderData);

      mockOrderData.id = 'TIM-9999999999';
      const url2 = generateWhatsAppUrl(mockOrderData);

      expect(url1).not.toBe(url2);
    });
  });

  describe('validateOrderData', () => {
    it('should validate complete order data', () => {
      const isValid = validateOrderData(mockOrderData);
      expect(isValid).toBe(true);
    });

    it('should reject order without ID', () => {
      const invalidData = { ...mockOrderData, id: '' };
      const isValid = validateOrderData(invalidData);
      expect(isValid).toBe(false);
    });

    it('should reject order without items', () => {
      const invalidData = { ...mockOrderData, items: [] };
      const isValid = validateOrderData(invalidData);
      expect(isValid).toBe(false);
    });

    it('should reject order without customer name', () => {
      const invalidData = {
        ...mockOrderData,
        customerInfo: { ...mockOrderData.customerInfo, name: '' },
      };
      const isValid = validateOrderData(invalidData);
      expect(isValid).toBe(false);
    });

    it('should reject order without customer phone', () => {
      const invalidData = {
        ...mockOrderData,
        customerInfo: { ...mockOrderData.customerInfo, phone: '' },
      };
      const isValid = validateOrderData(invalidData);
      expect(isValid).toBe(false);
    });

    it('should reject order without shipping address CEP', () => {
      const invalidData = {
        ...mockOrderData,
        shippingAddress: { ...mockOrderData.shippingAddress, cep: '' },
      };
      const isValid = validateOrderData(invalidData);
      expect(isValid).toBe(false);
    });

    it('should reject order without shipping city', () => {
      const invalidData = {
        ...mockOrderData,
        shipping: { ...mockOrderData.shipping, city: '' },
      };
      const isValid = validateOrderData(invalidData);
      expect(isValid).toBe(false);
    });

    it('should accept order without email (optional field)', () => {
      const dataWithoutEmail = {
        ...mockOrderData,
        customerInfo: { ...mockOrderData.customerInfo, email: undefined },
      };
      const isValid = validateOrderData(dataWithoutEmail);
      expect(isValid).toBe(true);
    });

    it('should accept order without complement (optional field)', () => {
      const dataWithoutComplement = {
        ...mockOrderData,
        shippingAddress: { ...mockOrderData.shippingAddress, complement: undefined },
      };
      const isValid = validateOrderData(dataWithoutComplement);
      expect(isValid).toBe(true);
    });

    it('should handle partial data gracefully', () => {
      const partialData = {
        id: 'TIM-123',
      };
      const isValid = validateOrderData(partialData);
      expect(isValid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long product names', () => {
      mockOrderData.items[0].name = 'Vinho Tinto Reserva Especial Premium Safra 2020 Edição Limitada';

      const message = generateWhatsAppMessage(mockOrderData);
      expect(message).toContain(mockOrderData.items[0].name);
    });

    it('should handle large quantities', () => {
      mockOrderData.items[0].quantity = 100;

      const message = generateWhatsAppMessage(mockOrderData);
      expect(message).toContain('100x Vinho Tinto Reserva');
    });

    it('should handle high prices correctly', () => {
      mockOrderData.items[0].price = 9999.99;
      mockOrderData.subtotal = 19999.98;
      mockOrderData.total = 20009.98;

      const message = generateWhatsAppMessage(mockOrderData);
      expect(message).toContain('R$ 19999.98');
      expect(message).toContain('R$ 20009.98');
    });

    it('should handle special characters in names', () => {
      mockOrderData.customerInfo.name = "João D'Silva & Cia";

      const message = generateWhatsAppMessage(mockOrderData);
      expect(message).toContain("João D'Silva & Cia");
    });

    it('should handle special characters in address', () => {
      mockOrderData.shippingAddress.street = "Rua São José, Nº 10";

      const message = generateWhatsAppMessage(mockOrderData);
      expect(message).toContain("Rua São José, Nº 10");
    });
  });
});
