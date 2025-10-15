/**
 * Shipping Service for Tim-Tim Bebidas
 * Handles express delivery (up to 2 hours) for covered cities
 * Coverage: Recife, Olinda, Jaboatão dos Guararapes, Camaragibe
 */

import { fetchAddressByCep, type AddressData } from './cepService';
import { AppError, ErrorType } from '@/lib/errorHandling';
import type { CartItem } from '@/types';

// Constants
const WEIGHT_PER_BOTTLE_KG = 1.5; // Each bottle weighs 1.5kg
const FREE_SHIPPING_THRESHOLD = 200; // Free shipping above R$ 200
const DELIVERY_TIME_HOURS = 2; // Delivery within 2 hours
const BASE_SHIPPING_COST = 15; // Base shipping cost in R$
const COST_PER_KG = 5; // Additional cost per kg

// Covered cities (case-insensitive)
const COVERED_CITIES = [
  'recife',
  'olinda',
  'jaboatão dos guararapes',
  'jaboatao dos guararapes',
  'camaragibe'
];

export interface ShippingCalculation {
  isAvailable: boolean;
  cost: number;
  isFree: boolean;
  estimatedHours: number;
  totalWeight: number;
  message: string;
  city?: string;
  state?: string;
}

export interface ShippingValidation {
  isValid: boolean;
  address?: AddressData;
  error?: string;
}

/**
 * Validate if CEP is in coverage area
 * @param cep - CEP string (formatted or not)
 * @returns Validation result with address data
 */
export async function validateShippingArea(cep: string): Promise<ShippingValidation> {
  try {
    // Fetch address from ViaCEP
    const address = await fetchAddressByCep(cep);
    
    if (!address) {
      return {
        isValid: false,
        error: 'CEP não encontrado. Verifique e tente novamente.'
      };
    }

    // Check if city is in coverage area
    const cityLower = address.city.toLowerCase().trim();
    const isInCoverage = COVERED_CITIES.some(city => 
      cityLower === city || cityLower.includes(city) || city.includes(cityLower)
    );

    if (!isInCoverage) {
      return {
        isValid: false,
        address,
        error: `Desculpe, não entregamos em ${address.city}. Atendemos apenas: Recife, Olinda, Jaboatão dos Guararapes e Camaragibe.`
      };
    }

    return {
      isValid: true,
      address
    };
  } catch (error) {
    console.error('Error validating shipping area:', error);
    
    if (error instanceof AppError) {
      return {
        isValid: false,
        error: error.message
      };
    }

    return {
      isValid: false,
      error: 'Erro ao validar CEP. Tente novamente.'
    };
  }
}

/**
 * Calculate total weight of cart items
 * @param items - Cart items
 * @returns Total weight in kg
 */
export function calculateTotalWeight(items: CartItem[]): number {
  const totalBottles = items.reduce((sum, item) => sum + item.quantity, 0);
  return totalBottles * WEIGHT_PER_BOTTLE_KG;
}

/**
 * Calculate shipping cost based on weight
 * @param weightKg - Total weight in kg
 * @param subtotal - Order subtotal
 * @returns Shipping cost in R$
 */
export function calculateShippingCost(weightKg: number, subtotal: number): number {
  // Free shipping for orders above threshold
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  // Base cost + additional cost per kg
  const additionalWeight = Math.max(0, weightKg - 1.5); // First 1.5kg included in base
  const additionalCost = Math.ceil(additionalWeight) * COST_PER_KG;
  
  return BASE_SHIPPING_COST + additionalCost;
}

/**
 * Calculate complete shipping information
 * @param cep - CEP string
 * @param items - Cart items
 * @param subtotal - Order subtotal
 * @returns Complete shipping calculation
 */
export async function calculateShipping(
  cep: string,
  items: CartItem[],
  subtotal: number
): Promise<ShippingCalculation> {
  try {
    // Validate shipping area
    const validation = await validateShippingArea(cep);
    
    if (!validation.isValid) {
      return {
        isAvailable: false,
        cost: 0,
        isFree: false,
        estimatedHours: 0,
        totalWeight: 0,
        message: validation.error || 'CEP fora da área de cobertura'
      };
    }

    // Calculate weight and cost
    const totalWeight = calculateTotalWeight(items);
    const shippingCost = calculateShippingCost(totalWeight, subtotal);
    const isFree = shippingCost === 0;

    return {
      isAvailable: true,
      cost: shippingCost,
      isFree,
      estimatedHours: DELIVERY_TIME_HOURS,
      totalWeight,
      city: validation.address?.city,
      state: validation.address?.state,
      message: isFree 
        ? '🎉 Frete Grátis! Entrega em até 2 horas.'
        : `Entrega expressa em até 2 horas por R$ ${shippingCost.toFixed(2)}`
    };
  } catch (error) {
    console.error('Error calculating shipping:', error);
    
    return {
      isAvailable: false,
      cost: 0,
      isFree: false,
      estimatedHours: 0,
      totalWeight: 0,
      message: 'Erro ao calcular frete. Tente novamente.'
    };
  }
}

/**
 * Check if CEP is in coverage area (quick check without full validation)
 * @param city - City name
 * @returns true if city is covered
 */
export function isCityInCoverage(city: string): boolean {
  const cityLower = city.toLowerCase().trim();
  return COVERED_CITIES.some(coveredCity => 
    cityLower === coveredCity || cityLower.includes(coveredCity) || coveredCity.includes(cityLower)
  );
}

/**
 * Get estimated delivery time
 * @returns Estimated delivery date/time
 */
export function getEstimatedDeliveryTime(): Date {
  const now = new Date();
  now.setHours(now.getHours() + DELIVERY_TIME_HOURS);
  return now;
}

/**
 * Format shipping message for display
 * @param calculation - Shipping calculation result
 * @returns Formatted message
 */
export function formatShippingMessage(calculation: ShippingCalculation): string {
  if (!calculation.isAvailable) {
    return calculation.message;
  }

  if (calculation.isFree) {
    return `🎉 Frete Grátis para ${calculation.city}! Entrega em até ${calculation.estimatedHours} horas.`;
  }

  return `Frete para ${calculation.city}: R$ ${calculation.cost.toFixed(2)} - Entrega em até ${calculation.estimatedHours} horas.`;
}

/**
 * Get covered cities list
 * @returns Array of covered city names
 */
export function getCoveredCities(): string[] {
  return ['Recife', 'Olinda', 'Jaboatão dos Guararapes', 'Camaragibe'];
}

/**
 * Get shipping info summary
 * @returns Shipping service information
 */
export function getShippingInfo() {
  return {
    deliveryTime: `até ${DELIVERY_TIME_HOURS} horas`,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    coveredCities: getCoveredCities(),
    baseShippingCost: BASE_SHIPPING_COST,
    weightPerBottle: WEIGHT_PER_BOTTLE_KG
  };
}
