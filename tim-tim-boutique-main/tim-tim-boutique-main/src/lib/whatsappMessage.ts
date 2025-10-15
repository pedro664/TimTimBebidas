/**
 * WhatsApp Message Generator
 * 
 * Utilitário centralizado para geração de mensagens formatadas do WhatsApp
 * para finalização de pedidos.
 */

import { WHATSAPP_CONFIG } from '@/config/whatsapp';

/**
 * Item do carrinho para a mensagem
 */
export interface MessageCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Informações de frete para a mensagem
 */
export interface MessageShippingInfo {
  cep: string;
  city: string;
  cost: number;
  isFree: boolean;
}

/**
 * Informações do cliente para a mensagem
 */
export interface MessageCustomerInfo {
  name: string;
  email?: string;
  phone: string;
}

/**
 * Endereço de entrega para a mensagem
 */
export interface MessageShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Dados completos do pedido para geração da mensagem
 */
export interface OrderMessageData {
  id: string;
  items: MessageCartItem[];
  subtotal: number;
  shipping: MessageShippingInfo;
  total: number;
  customerInfo: MessageCustomerInfo;
  shippingAddress: MessageShippingAddress;
  estimatedDeliveryTime?: Date;
}

/**
 * Gera mensagem formatada do WhatsApp com todos os detalhes do pedido
 * 
 * @param orderData - Dados completos do pedido
 * @returns Mensagem formatada com emojis e estrutura clara
 * 
 * @example
 * ```typescript
 * const message = generateWhatsAppMessage({
 *   id: 'TIM-123456',
 *   items: [{ id: '1', name: 'Vinho Tinto', price: 89.90, quantity: 2 }],
 *   subtotal: 179.80,
 *   shipping: { cep: '50000-000', city: 'Recife', cost: 10, isFree: false },
 *   total: 189.80,
 *   customerInfo: { name: 'João Silva', phone: '(81) 99999-9999' },
 *   shippingAddress: { ... }
 * });
 * ```
 */
export function generateWhatsAppMessage(orderData: OrderMessageData): string {
  const {
    id,
    items,
    subtotal,
    shipping,
    total,
    customerInfo,
    shippingAddress,
    estimatedDeliveryTime
  } = orderData;

  // Formatar lista de produtos
  const productsList = items
    .map(item => {
      const itemTotal = item.price * item.quantity;
      return `  • ${item.quantity}x ${item.name}\n    R$ ${itemTotal.toFixed(2)}`;
    })
    .join('\n');

  // Formatar texto do frete
  const shippingText = shipping.isFree 
    ? '🎉 *FRETE GRÁTIS*' 
    : `R$ ${shipping.cost.toFixed(2)}`;

  // Formatar horário de entrega estimado
  let deliveryTimeText = 'até 2 horas 🚚';
  if (estimatedDeliveryTime) {
    const timeString = estimatedDeliveryTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    deliveryTimeText = `até 2 horas 🚚\n*Previsão:* ${timeString}`;
  }

  // Formatar endereço completo
  const fullAddress = [
    `${shippingAddress.street}, ${shippingAddress.number}`,
    shippingAddress.complement,
    shippingAddress.neighborhood,
    `${shippingAddress.city} - ${shippingAddress.state}`,
    `CEP: ${shippingAddress.cep}`
  ].filter(Boolean).join('\n');

  // Montar mensagem completa
  const message = `
🍷 *Novo Pedido - Tim-Tim Bebidas*

━━━━━━━━━━━━━━━━━━━━━━

📋 *PEDIDO #${id}*

*Produtos:*
${productsList}

━━━━━━━━━━━━━━━━━━━━━━

💰 *VALORES*
Subtotal: R$ ${subtotal.toFixed(2)}
Frete: ${shippingText}
━━━━━━━━━━━━━━━━━━━━━━
*TOTAL: R$ ${total.toFixed(2)}*

━━━━━━━━━━━━━━━━━━━━━━

🚚 *ENTREGA*
${deliveryTimeText}
📍 ${shipping.city}

━━━━━━━━━━━━━━━━━━━━━━

👤 *DADOS DO CLIENTE*
Nome: ${customerInfo.name}
Telefone: ${customerInfo.phone}${customerInfo.email ? `\nEmail: ${customerInfo.email}` : ''}

━━━━━━━━━━━━━━━━━━━━━━

📍 *ENDEREÇO DE ENTREGA*
${fullAddress}

━━━━━━━━━━━━━━━━━━━━━━

✨ Obrigado por escolher a Tim-Tim Bebidas!
`.trim();

  return message;
}

/**
 * Gera URL completa do WhatsApp com a mensagem do pedido
 * 
 * @param orderData - Dados completos do pedido
 * @returns URL do WhatsApp pronta para abrir
 * 
 * @example
 * ```typescript
 * const url = generateWhatsAppUrl(orderData);
 * window.open(url, '_blank');
 * ```
 */
export function generateWhatsAppUrl(orderData: OrderMessageData): string {
  const message = generateWhatsAppMessage(orderData);
  return WHATSAPP_CONFIG.generateUrl(message);
}

/**
 * Valida se todos os dados necessários estão presentes
 * 
 * @param orderData - Dados do pedido a validar
 * @returns true se válido, false caso contrário
 */
export function validateOrderData(orderData: Partial<OrderMessageData>): boolean {
  if (!orderData.id || !orderData.items || orderData.items.length === 0) {
    return false;
  }

  if (!orderData.customerInfo?.name || !orderData.customerInfo?.phone) {
    return false;
  }

  if (!orderData.shippingAddress?.cep || !orderData.shippingAddress?.city) {
    return false;
  }

  if (!orderData.shipping?.city) {
    return false;
  }

  return true;
}
