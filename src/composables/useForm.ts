import { ref, reactive } from 'vue'
import { useToast } from 'vue-toastification'

export function useForm<T extends Record<string, any>>(initialValues: T) {
  const toast = useToast()
  const isLoading = ref(false)
  const errors = reactive<Partial<Record<keyof T, string>>>({})

  // Estado reativo do formulário
  const form = reactive<T>({ ...initialValues })

  // Função para resetar o formulário
  const resetForm = () => {
    Object.assign(form, initialValues)
    clearErrors()
  }

  // Função para limpar erros
  const clearErrors = () => {
    Object.keys(errors).forEach(key => {
      delete errors[key as keyof T]
    })
  }

  // Função para definir erro de um campo
  const setError = (field: keyof T, message: string) => {
    errors[field] = message
  }

  // Função para validar campo obrigatório
  const validateRequired = (field: keyof T, message?: string) => {
    if (!form[field] || (typeof form[field] === 'string' && !form[field].trim())) {
      setError(field, message || `${String(field)} é obrigatório`)
      return false
    }
    return true
  }

  // Função para validar e-mail
  const validateEmail = (field: keyof T, message?: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form[field] && !emailRegex.test(form[field] as string)) {
      setError(field, message || 'E-mail inválido')
      return false
    }
    return true
  }

  // Função para validar senha
  const validatePassword = (field: keyof T, minLength = 6, message?: string) => {
    if (form[field] && (form[field] as string).length < minLength) {
      setError(field, message || `Senha deve ter pelo menos ${minLength} caracteres`)
      return false
    }
    return true
  }

  // Função para validar confirmação de senha
  const validatePasswordConfirmation = (passwordField: keyof T, confirmationField: keyof T) => {
    if (form[passwordField] !== form[confirmationField]) {
      setError(confirmationField, 'Senhas não coincidem')
      return false
    }
    return true
  }

  // Função para executar validações
  const validate = (validations: Array<() => boolean>) => {
    clearErrors()
    return validations.every(validation => validation())
  }

  // Função para executar ação com loading
  const executeWithLoading = async (action: () => Promise<void>) => {
    isLoading.value = true
    try {
      await action()
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    form,
    errors,
    isLoading,
    
    // Actions
    resetForm,
    clearErrors,
    setError,
    validateRequired,
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
    validate,
    executeWithLoading
  }
}
