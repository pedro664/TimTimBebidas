/**
 * Input mask utilities for formatting user input
 */

/**
 * Format CEP input to pattern 00000-000
 * @param value - The input value to be masked
 * @returns Formatted CEP string
 * @example
 * maskCep("12345678") // returns "12345-678"
 * maskCep("12345") // returns "12345"
 */
export function maskCep(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 5) {
    return numbers;
  }
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
}

/**
 * Format phone input to pattern (00) 00000-0000 or (00) 0000-0000
 * Handles both landline (10 digits) and mobile (11 digits) formats
 * @param value - The input value to be masked
 * @returns Formatted phone string
 * @example
 * maskPhone("11999999999") // returns "(11) 99999-9999"
 * maskPhone("1133334444") // returns "(11) 3333-4444"
 */
export function maskPhone(value: string): string {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length <= 2) {
    return numbers;
  }
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * Format CPF input to pattern 000.000.000-00
 * @param value - The input value to be masked
 * @returns Formatted CPF string
 * @example
 * maskCpf("12345678900") // returns "123.456.789-00"
 */
export function maskCpf(value: string): string {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length <= 3) {
    return numbers;
  }
  if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

/**
 * Remove all non-numeric characters from a string
 * @param value - The input value to be unmasked
 * @returns String with only numeric characters
 * @example
 * unmask("123.456.789-00") // returns "12345678900"
 * unmask("(11) 99999-9999") // returns "11999999999"
 */
export function unmask(value: string): string {
  return value.replace(/\D/g, "");
}
