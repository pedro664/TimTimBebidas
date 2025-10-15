/**
 * Simplified Order Service
 * 
 * This service only provides utility functions for order ID generation and formatting.
 * Orders are NOT saved to database - they are sent via WhatsApp only.
 * 
 * Requirements: 2.1, 2.2, 2.6
 */

/**
 * Generate a unique order ID
 * Format: TIM-{timestamp}
 * Example: TIM-1697123456789
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  return `TIM-${timestamp}`;
}

/**
 * Generate a unique order number (alternative format)
 * Format: ORD-YYYYMMDD-XXXXX
 * Example: ORD-20241013-00001
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000);
  const randomStr = String(random).padStart(5, '0');
  
  return `ORD-${year}${month}${day}-${randomStr}`;
}

/**
 * Format order total as currency
 */
export function formatOrderTotal(total: number): string {
  return `R$ ${total.toFixed(2).replace('.', ',')}`;
}

/**
 * Format order date
 */
export function formatOrderDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
