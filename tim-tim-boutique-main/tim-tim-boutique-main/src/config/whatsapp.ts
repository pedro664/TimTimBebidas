/**
 * WhatsApp Configuration
 * 
 * Configuração centralizada para integração com WhatsApp Business.
 * Os pedidos são finalizados via WhatsApp, sem armazenamento no banco de dados.
 */

/**
 * Número de WhatsApp da loja no formato internacional
 * 
 * Formato esperado: Código do país + DDD + Número (sem espaços, hífens ou parênteses)
 * 
 * Exemplos:
 * - Brasil (Recife): 5581999999999
 * - Brasil (São Paulo): 5511999999999
 * - Brasil (Rio): 5521999999999
 * 
 * Importante:
 * - Sempre comece com o código do país (55 para Brasil)
 * - Inclua o DDD com 2 dígitos
 * - Inclua o número com 9 dígitos (celular) ou 8 dígitos (fixo)
 * - NÃO use espaços, hífens, parênteses ou outros caracteres especiais
 * - Configure via variável de ambiente VITE_WHATSAPP_NUMBER
 */
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5581995985278';

/**
 * Configuração do WhatsApp
 */
export const WHATSAPP_CONFIG = {
  /**
   * Número de telefone no formato internacional
   */
  phoneNumber: WHATSAPP_NUMBER,

  /**
   * Gera URL do WhatsApp com mensagem pré-formatada
   * 
   * @param message - Mensagem a ser enviada
   * @returns URL completa do WhatsApp Web/App
   * 
   * @example
   * ```typescript
   * const url = WHATSAPP_CONFIG.generateUrl('Olá, gostaria de fazer um pedido!');
   * window.open(url, '_blank');
   * ```
   */
  generateUrl: (message: string): string => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${encodedMessage}`;
  },

  /**
   * Valida se o número está no formato correto
   * 
   * @returns true se o número está válido, false caso contrário
   */
  isValid: (): boolean => {
    // Formato esperado: código do país (2-3 dígitos) + DDD (2 dígitos) + número (8-9 dígitos)
    const phoneRegex = /^\d{12,13}$/;
    return phoneRegex.test(WHATSAPP_CONFIG.phoneNumber);
  },

  /**
   * Formata o número para exibição
   * 
   * @returns Número formatado para exibição (ex: +55 81 99999-9999)
   */
  getFormattedNumber: (): string => {
    const number = WHATSAPP_CONFIG.phoneNumber;
    
    if (number.length === 13) {
      // Formato: +55 81 99999-9999
      return `+${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4, 9)}-${number.slice(9)}`;
    } else if (number.length === 12) {
      // Formato: +55 81 9999-9999
      return `+${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4, 8)}-${number.slice(8)}`;
    }
    
    return `+${number}`;
  }
};

/**
 * Valida e exibe aviso se o número não estiver configurado corretamente
 */
if (!WHATSAPP_CONFIG.isValid()) {
  console.warn(
    '⚠️ ATENÇÃO: Número de WhatsApp não configurado corretamente!\n' +
    `Número atual: ${WHATSAPP_CONFIG.phoneNumber}\n` +
    'Configure a variável VITE_WHATSAPP_NUMBER no arquivo .env\n' +
    'Formato esperado: código do país + DDD + número (ex: 5581999999999)'
  );
}

export default WHATSAPP_CONFIG;
