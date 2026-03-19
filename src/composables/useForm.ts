import { reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'

export function useForm<T extends Record<string, any>>(initialValues: T) {
  useToast()

  const isLoading = ref(false)
  const errors = reactive<Partial<Record<keyof T, string>>>({})
  const form = reactive<T>({ ...initialValues })

  const clearErrors = () => {
    Object.keys(errors).forEach((key) => {
      delete errors[key as keyof T]
    })
  }

  const resetForm = () => {
    Object.assign(form, initialValues)
    clearErrors()
  }

  const setError = (field: keyof T, message: string) => {
    errors[field] = message
  }

  const validateRequired = (field: keyof T, message?: string) => {
    if (!form[field] || (typeof form[field] === 'string' && !form[field].trim())) {
      setError(field, message || `${String(field)} e obrigatorio`)
      return false
    }
    return true
  }

  const validateEmail = (field: keyof T, message?: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form[field] && !emailRegex.test(form[field] as string)) {
      setError(field, message || 'E-mail invalido')
      return false
    }
    return true
  }

  const validatePassword = (field: keyof T, minLength = 6, message?: string) => {
    if (form[field] && (form[field] as string).length < minLength) {
      setError(field, message || `Senha deve ter pelo menos ${minLength} caracteres`)
      return false
    }
    return true
  }

  const validatePasswordConfirmation = (passwordField: keyof T, confirmationField: keyof T) => {
    if (form[passwordField] !== form[confirmationField]) {
      setError(confirmationField, 'Senhas nao coincidem')
      return false
    }
    return true
  }

  const validate = (validations: Array<() => boolean>) => {
    clearErrors()
    return validations.every((validation) => validation())
  }

  const executeWithLoading = async (action: () => Promise<void>) => {
    isLoading.value = true
    try {
      await action()
    } finally {
      isLoading.value = false
    }
  }

  return {
    form,
    errors,
    isLoading,
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
