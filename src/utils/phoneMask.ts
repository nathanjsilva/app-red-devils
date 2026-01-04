/**
 * Utilitários para máscara de telefone
 */

/**
 * Aplica máscara de telefone brasileiro (11) 99999-9999
 * @param value - Valor do input
 * @returns Valor com máscara aplicada
 */
export const applyPhoneMask = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '')
  
  // Aplica a máscara (11) 99999-9999
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }
}

/**
 * Remove a máscara do telefone, deixando apenas números
 * @param phone - Telefone com ou sem máscara
 * @returns Telefone apenas com números
 */
export const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '')
}

/**
 * Valida se o telefone tem o formato correto (11 dígitos)
 * @param phone - Telefone para validar
 * @returns true se válido, false caso contrário
 */
export const validatePhone = (phone: string): boolean => {
  const clean = cleanPhone(phone)
  return clean.length === 11 && clean.startsWith('11')
}




