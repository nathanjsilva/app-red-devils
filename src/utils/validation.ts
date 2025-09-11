// Utilitários de validação

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'A senha deve ter pelo menos 6 caracteres' }
  }
  return { isValid: true }
}

export const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (name.trim().length < 2) {
    return { isValid: false, message: 'O nome deve ter pelo menos 2 caracteres' }
  }
  return { isValid: true }
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}
