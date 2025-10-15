/**
 * Shipping Calculations Tests
 * Tests for validating shipping cost calculations and free shipping logic
 * Requirements: 6.1, 6.2
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTotalWeight,
  calculateShippingCost,
  getShippingInfo,
} from '@/services/shippingService';
import type { CartItem } from '@/types';

describe('Shipping Calculations', () => {
  describe('calculateTotalWeight', () => {
    it('should calculate weight for single item', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'Vinho Tinto',
          price: 89.90,
          quantity: 1,
          image: '/test.jpg',
          stock: 10,
        },
      ];

      const weight = calculateTotalWeight(items);
      // 1 bottle * 1.5kg = 1.5kg
      expect(weight).toBe(1.5);
    });

    it('should calculate weight for multiple quantities of same item', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'Vinho Tinto',
          price: 89.90,
          quantity: 3,
          image: '/test.jpg',
          stock: 10,
        },
      ];

      const weight = calculateTotalWeight(items);
      // 3 bottles * 1.5kg = 4.5kg
      expect(weight).toBe(4.5);
    });

    it('should calculate weight for multiple different items', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'Vinho Tinto',
          price: 89.90,
          quantity: 2,
          image: '/test.jpg',
          stock: 10,
        },
        {
          id: '2',
          name: 'Champagne',
          price: 150.00,
          quantity: 1,
          image: '/test2.jpg',
          stock: 5,
        },
      ];

      const weight = calculateTotalWeight(items);
      // (2 + 1) bottles * 1.5kg = 4.5kg
      expect(weight).toBe(4.5);
    });

    it('should return 0 for empty cart', () => {
      const items: CartItem[] = [];
      const weight = calculateTotalWeight(items);
      expect(weight).toBe(0);
    });

    it('should handle large quantities', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'Vinho Tinto',
          price: 89.90,
          quantity: 10,
          image: '/test.jpg',
          stock: 20,
        },
      ];

      const weight = calculateTotalWeight(items);
      // 10 bottles * 1.5kg = 15kg
      expect(weight).toBe(15);
    });
  });

  describe('calculateShippingCost', () => {
    it('should return base cost for single bottle', () => {
      const cost = calculateShippingCost(1.5, 89.90);
      // Base cost = R$ 15.00 (first 1.5kg included)
      expect(cost).toBe(15);
    });

    it('should add cost per additional kg', () => {
      const cost = calculateShippingCost(3.0, 89.90);
      // Base 15 + (3.0 - 1.5 = 1.5kg, rounded up to 2kg) * 5 = 15 + 10 = 25
      expect(cost).toBe(25);
    });

    it('should calculate cost for 3 bottles', () => {
      const cost = calculateShippingCost(4.5, 150.00);
      // Base 15 + (4.5 - 1.5 = 3kg) * 5 = 15 + 15 = 30
      expect(cost).toBe(30);
    });

    it('should return 0 for orders above free shipping threshold', () => {
      const cost = calculateShippingCost(1.5, 200.00);
      // Subtotal >= 200, free shipping
      expect(cost).toBe(0);
    });

    it('should return 0 for orders exactly at threshold', () => {
      const cost = calculateShippingCost(1.5, 200.00);
      expect(cost).toBe(0);
    });

    it('should charge shipping for orders just below threshold', () => {
      const cost = calculateShippingCost(1.5, 199.99);
      // Below threshold, should charge
      expect(cost).toBe(15);
    });

    it('should apply free shipping even with heavy weight', () => {
      const cost = calculateShippingCost(15.0, 250.00);
      // Subtotal >= 200, free shipping regardless of weight
      expect(cost).toBe(0);
    });

    it('should round up partial kg correctly', () => {
      const cost = calculateShippingCost(2.1, 100.00);
      // Base 15 + (2.1 - 1.5 = 0.6kg, rounded up to 1kg) * 5 = 15 + 5 = 20
      expect(cost).toBe(20);
    });

    it('should handle exactly 2 bottles', () => {
      const cost = calculateShippingCost(3.0, 150.00);
      // Base 15 + (3.0 - 1.5 = 1.5kg, rounded up to 2kg) * 5 = 15 + 10 = 25
      expect(cost).toBe(25);
    });

    it('should handle 0 weight', () => {
      const cost = calculateShippingCost(0, 50.00);
      // Base cost even with 0 weight (edge case)
      // Additional weight = max(0, 0 - 1.5) = 0, so ceil(0) * 5 = 0
      expect(cost).toBe(15);
    });
  });

  describe('Free Shipping Logic', () => {
    it('should provide free shipping at R$ 200', () => {
      const cost = calculateShippingCost(1.5, 200.00);
      expect(cost).toBe(0);
    });

    it('should provide free shipping above R$ 200', () => {
      const cost = calculateShippingCost(1.5, 250.00);
      expect(cost).toBe(0);
    });

    it('should provide free shipping at R$ 300', () => {
      const cost = calculateShippingCost(4.5, 300.00);
      expect(cost).toBe(0);
    });

    it('should charge shipping below R$ 200', () => {
      const cost = calculateShippingCost(1.5, 199.00);
      expect(cost).toBeGreaterThan(0);
    });

    it('should charge shipping at R$ 100', () => {
      const cost = calculateShippingCost(1.5, 100.00);
      expect(cost).toBe(15);
    });
  });

  describe('Shipping Info Configuration', () => {
    it('should return correct shipping configuration', () => {
      const info = getShippingInfo();
      
      expect(info.deliveryTime).toBe('até 2 horas');
      expect(info.freeShippingThreshold).toBe(200);
      expect(info.baseShippingCost).toBe(15);
      expect(info.weightPerBottle).toBe(1.5);
      expect(info.coveredCities).toEqual([
        'Recife',
        'Olinda',
        'Jaboatão dos Guararapes',
        'Camaragibe',
      ]);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should calculate correctly for typical order (2 bottles, R$ 180)', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'Vinho Tinto',
          price: 90.00,
          quantity: 2,
          image: '/test.jpg',
          stock: 10,
        },
      ];

      const weight = calculateTotalWeight(items);
      const subtotal = 180.00;
      const shippingCost = calculateShippingCost(weight, subtotal);

      expect(weight).toBe(3.0); // 2 bottles * 1.5kg
      expect(shippingCost).toBe(25); // Base 15 + 2kg * 5
    });

    it('should calculate correctly for free shipping order (3 bottles, R$ 270)', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'Vinho Premium',
          price: 90.00,
          quantity: 3,
          image: '/test.jpg',
          stock: 10,
        },
      ];

      const weight = calculateTotalWeight(items);
      const subtotal = 270.00;
      const shippingCost = calculateShippingCost(weight, subtotal);

      expect(weight).toBe(4.5); // 3 bottles * 1.5kg
      expect(shippingCost).toBe(0); // Free shipping
    });

    it('should calculate correctly for mixed cart (R$ 239.90)', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'Vinho Tinto',
          price: 89.90,
          quantity: 1,
          image: '/test.jpg',
          stock: 10,
        },
        {
          id: '2',
          name: 'Champagne',
          price: 150.00,
          quantity: 1,
          image: '/test2.jpg',
          stock: 5,
        },
      ];

      const weight = calculateTotalWeight(items);
      const subtotal = 239.90;
      const shippingCost = calculateShippingCost(weight, subtotal);

      expect(weight).toBe(3.0); // 2 bottles * 1.5kg
      expect(shippingCost).toBe(0); // Free shipping (>= 200)
    });

    it('should calculate correctly for single expensive bottle (R$ 250)', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'Vinho Premium',
          price: 250.00,
          quantity: 1,
          image: '/test.jpg',
          stock: 5,
        },
      ];

      const weight = calculateTotalWeight(items);
      const subtotal = 250.00;
      const shippingCost = calculateShippingCost(weight, subtotal);

      expect(weight).toBe(1.5); // 1 bottle * 1.5kg
      expect(shippingCost).toBe(0); // Free shipping
    });

    it('should calculate correctly for large order (10 bottles, R$ 899)', () => {
      const items: CartItem[] = [
        {
          id: '1',
          name: 'Vinho Tinto',
          price: 89.90,
          quantity: 10,
          image: '/test.jpg',
          stock: 20,
        },
      ];

      const weight = calculateTotalWeight(items);
      const subtotal = 899.00;
      const shippingCost = calculateShippingCost(weight, subtotal);

      expect(weight).toBe(15.0); // 10 bottles * 1.5kg
      expect(shippingCost).toBe(0); // Free shipping
    });
  });

  describe('Edge Cases', () => {
    it('should handle fractional weights correctly', () => {
      // Simulating a scenario where weight might not be exact multiples
      const cost = calculateShippingCost(2.7, 100.00);
      // Base 15 + (2.7 - 1.5 = 1.2kg, rounded up to 2kg) * 5 = 15 + 10 = 25
      expect(cost).toBe(25);
    });

    it('should handle very small subtotal', () => {
      const cost = calculateShippingCost(1.5, 10.00);
      expect(cost).toBe(15);
    });

    it('should handle very large subtotal', () => {
      const cost = calculateShippingCost(30.0, 2000.00);
      expect(cost).toBe(0); // Free shipping
    });

    it('should handle subtotal exactly at threshold minus 0.01', () => {
      const cost = calculateShippingCost(1.5, 199.99);
      expect(cost).toBe(15); // Should charge shipping
    });

    it('should handle subtotal exactly at threshold plus 0.01', () => {
      const cost = calculateShippingCost(1.5, 200.01);
      expect(cost).toBe(0); // Should be free
    });
  });
});
