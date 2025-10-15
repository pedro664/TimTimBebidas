/**
 * Tests for ShippingService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateShippingArea,
  calculateTotalWeight,
  calculateShippingCost,
  calculateShipping,
  isCityInCoverage,
  getEstimatedDeliveryTime,
  formatShippingMessage,
  getCoveredCities,
  getShippingInfo,
  type ShippingCalculation
} from '../services/shippingService';
import type { CartItem } from '../types';
import * as cepService from '../services/cepService';

// Mock the cepService
vi.mock('../services/cepService', () => ({
  fetchAddressByCep: vi.fn()
}));

describe('ShippingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateShippingArea', () => {
    it('should validate CEP in Recife', async () => {
      vi.mocked(cepService.fetchAddressByCep).mockResolvedValue({
        street: 'Rua da Aurora',
        neighborhood: 'Boa Vista',
        city: 'Recife',
        state: 'PE'
      });

      const result = await validateShippingArea('50050-000');
      
      expect(result.isValid).toBe(true);
      expect(result.address?.city).toBe('Recife');
    });

    it('should validate CEP in Olinda', async () => {
      vi.mocked(cepService.fetchAddressByCep).mockResolvedValue({
        street: 'Rua do Sol',
        neighborhood: 'Carmo',
        city: 'Olinda',
        state: 'PE'
      });

      const result = await validateShippingArea('53120-000');
      
      expect(result.isValid).toBe(true);
      expect(result.address?.city).toBe('Olinda');
    });

    it('should validate CEP in Jaboatão dos Guararapes', async () => {
      vi.mocked(cepService.fetchAddressByCep).mockResolvedValue({
        street: 'Avenida Barreto de Menezes',
        neighborhood: 'Piedade',
        city: 'Jaboatão dos Guararapes',
        state: 'PE'
      });

      const result = await validateShippingArea('54400-000');
      
      expect(result.isValid).toBe(true);
      expect(result.address?.city).toBe('Jaboatão dos Guararapes');
    });

    it('should validate CEP in Camaragibe', async () => {
      vi.mocked(cepService.fetchAddressByCep).mockResolvedValue({
        street: 'Rua Principal',
        neighborhood: 'Centro',
        city: 'Camaragibe',
        state: 'PE'
      });

      const result = await validateShippingArea('54750-000');
      
      expect(result.isValid).toBe(true);
      expect(result.address?.city).toBe('Camaragibe');
    });

    it('should reject CEP outside coverage area', async () => {
      vi.mocked(cepService.fetchAddressByCep).mockResolvedValue({
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP'
      });

      const result = await validateShippingArea('01000-000');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('não entregamos em São Paulo');
      expect(result.error).toContain('Recife');
    });

    it('should handle invalid CEP', async () => {
      vi.mocked(cepService.fetchAddressByCep).mockResolvedValue(null);

      const result = await validateShippingArea('00000-000');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('CEP não encontrado');
    });

    it('should handle CEP service errors', async () => {
      vi.mocked(cepService.fetchAddressByCep).mockRejectedValue(
        new Error('Network error')
      );

      const result = await validateShippingArea('50050-000');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('calculateTotalWeight', () => {
    it('should calculate weight for single item', () => {
      const items: CartItem[] = [
        { id: '1', quantity: 1 } as CartItem
      ];

      const weight = calculateTotalWeight(items);
      
      expect(weight).toBe(1.5); // 1 bottle * 1.5kg
    });

    it('should calculate weight for multiple items', () => {
      const items: CartItem[] = [
        { id: '1', quantity: 2 } as CartItem,
        { id: '2', quantity: 3 } as CartItem
      ];

      const weight = calculateTotalWeight(items);
      
      expect(weight).toBe(7.5); // 5 bottles * 1.5kg
    });

    it('should return 0 for empty cart', () => {
      const items: CartItem[] = [];

      const weight = calculateTotalWeight(items);
      
      expect(weight).toBe(0);
    });

    it('should handle large quantities', () => {
      const items: CartItem[] = [
        { id: '1', quantity: 10 } as CartItem
      ];

      const weight = calculateTotalWeight(items);
      
      expect(weight).toBe(15); // 10 bottles * 1.5kg
    });
  });

  describe('calculateShippingCost', () => {
    it('should return 0 for orders above R$ 200', () => {
      const cost = calculateShippingCost(3, 250);
      
      expect(cost).toBe(0);
    });

    it('should return 0 for orders exactly R$ 200', () => {
      const cost = calculateShippingCost(3, 200);
      
      expect(cost).toBe(0);
    });

    it('should calculate base cost for single bottle', () => {
      const cost = calculateShippingCost(1.5, 100);
      
      expect(cost).toBe(15); // Base cost
    });

    it('should add cost per additional kg', () => {
      const cost = calculateShippingCost(3, 100); // 2 bottles
      
      expect(cost).toBe(25); // Base 15 + 10 for additional 1.5kg (rounded to 2kg)
    });

    it('should round up additional weight', () => {
      const cost = calculateShippingCost(4.5, 100); // 3 bottles
      
      expect(cost).toBe(30); // Base 15 + 15 for additional 3kg
    });

    it('should handle large weights', () => {
      const cost = calculateShippingCost(15, 100); // 10 bottles
      
      expect(cost).toBe(85); // Base 15 + 70 for additional 13.5kg (rounded to 14)
    });
  });

  describe('calculateShipping', () => {
    it('should calculate shipping for valid CEP with cost', async () => {
      vi.mocked(cepService.fetchAddressByCep).mockResolvedValue({
        street: 'Rua da Aurora',
        neighborhood: 'Boa Vista',
        city: 'Recife',
        state: 'PE'
      });

      const items: CartItem[] = [
        { id: '1', quantity: 1 } as CartItem
      ];

      const result = await calculateShipping('50050-000', items, 100);
      
      expect(result.isAvailable).toBe(true);
      expect(result.cost).toBe(15);
      expect(result.isFree).toBe(false);
      expect(result.estimatedHours).toBe(2);
      expect(result.totalWeight).toBe(1.5);
      expect(result.city).toBe('Recife');
      expect(result.message).toContain('R$ 15.00');
    });

    it('should calculate free shipping for orders above threshold', async () => {
      vi.mocked(cepService.fetchAddressByCep).mockResolvedValue({
        street: 'Rua da Aurora',
        neighborhood: 'Boa Vista',
        city: 'Recife',
        state: 'PE'
      });

      const items: CartItem[] = [
        { id: '1', quantity: 2 } as CartItem
      ];

      const result = await calculateShipping('50050-000', items, 250);
      
      expect(result.isAvailable).toBe(true);
      expect(result.cost).toBe(0);
      expect(result.isFree).toBe(true);
      expect(result.message).toContain('Frete Grátis');
    });

    it('should return unavailable for CEP outside coverage', async () => {
      vi.mocked(cepService.fetchAddressByCep).mockResolvedValue({
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP'
      });

      const items: CartItem[] = [
        { id: '1', quantity: 1 } as CartItem
      ];

      const result = await calculateShipping('01000-000', items, 100);
      
      expect(result.isAvailable).toBe(false);
      expect(result.cost).toBe(0);
      expect(result.message).toContain('não entregamos');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(cepService.fetchAddressByCep).mockRejectedValue(
        new Error('Network error')
      );

      const items: CartItem[] = [
        { id: '1', quantity: 1 } as CartItem
      ];

      const result = await calculateShipping('50050-000', items, 100);
      
      expect(result.isAvailable).toBe(false);
      expect(result.message).toContain('Erro ao validar CEP');
    });
  });

  describe('isCityInCoverage', () => {
    it('should return true for Recife', () => {
      expect(isCityInCoverage('Recife')).toBe(true);
      expect(isCityInCoverage('recife')).toBe(true);
      expect(isCityInCoverage('RECIFE')).toBe(true);
    });

    it('should return true for Olinda', () => {
      expect(isCityInCoverage('Olinda')).toBe(true);
    });

    it('should return true for Jaboatão', () => {
      expect(isCityInCoverage('Jaboatão dos Guararapes')).toBe(true);
      expect(isCityInCoverage('Jaboatao dos Guararapes')).toBe(true);
    });

    it('should return true for Camaragibe', () => {
      expect(isCityInCoverage('Camaragibe')).toBe(true);
    });

    it('should return false for other cities', () => {
      expect(isCityInCoverage('São Paulo')).toBe(false);
      expect(isCityInCoverage('Rio de Janeiro')).toBe(false);
      expect(isCityInCoverage('Caruaru')).toBe(false);
    });
  });

  describe('getEstimatedDeliveryTime', () => {
    it('should return time 2 hours from now', () => {
      const now = new Date();
      const estimated = getEstimatedDeliveryTime();
      
      const diffHours = (estimated.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      expect(diffHours).toBeGreaterThanOrEqual(1.9);
      expect(diffHours).toBeLessThanOrEqual(2.1);
    });
  });

  describe('formatShippingMessage', () => {
    it('should format message for unavailable shipping', () => {
      const calculation: ShippingCalculation = {
        isAvailable: false,
        cost: 0,
        isFree: false,
        estimatedHours: 0,
        totalWeight: 0,
        message: 'CEP fora da área'
      };

      const message = formatShippingMessage(calculation);
      
      expect(message).toBe('CEP fora da área');
    });

    it('should format message for free shipping', () => {
      const calculation: ShippingCalculation = {
        isAvailable: true,
        cost: 0,
        isFree: true,
        estimatedHours: 2,
        totalWeight: 3,
        city: 'Recife',
        message: 'Frete Grátis'
      };

      const message = formatShippingMessage(calculation);
      
      expect(message).toContain('Frete Grátis');
      expect(message).toContain('Recife');
      expect(message).toContain('2 horas');
    });

    it('should format message for paid shipping', () => {
      const calculation: ShippingCalculation = {
        isAvailable: true,
        cost: 15,
        isFree: false,
        estimatedHours: 2,
        totalWeight: 1.5,
        city: 'Olinda',
        message: 'Frete pago'
      };

      const message = formatShippingMessage(calculation);
      
      expect(message).toContain('Olinda');
      expect(message).toContain('R$ 15.00');
      expect(message).toContain('2 horas');
    });
  });

  describe('getCoveredCities', () => {
    it('should return array of covered cities', () => {
      const cities = getCoveredCities();
      
      expect(cities).toHaveLength(4);
      expect(cities).toContain('Recife');
      expect(cities).toContain('Olinda');
      expect(cities).toContain('Jaboatão dos Guararapes');
      expect(cities).toContain('Camaragibe');
    });
  });

  describe('getShippingInfo', () => {
    it('should return shipping service information', () => {
      const info = getShippingInfo();
      
      expect(info.deliveryTime).toBe('até 2 horas');
      expect(info.freeShippingThreshold).toBe(200);
      expect(info.coveredCities).toHaveLength(4);
      expect(info.baseShippingCost).toBe(15);
      expect(info.weightPerBottle).toBe(1.5);
    });
  });
});
