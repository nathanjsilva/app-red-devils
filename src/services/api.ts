import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { useToast } from 'vue-toastification'
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants'
import type { ApiError } from '../types'

// Instância base do axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratamento de respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError<ApiError>) => {
    const toast = useToast()
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Token expirado ou inválido
          localStorage.removeItem(STORAGE_KEYS.TOKEN)
          localStorage.removeItem(STORAGE_KEYS.PLAYER)
          toast.error('Sessão expirada. Faça login novamente.')
          window.location.href = '/'
          break
        case 403:
          toast.error('Acesso negado.')
          break
        case 404:
          toast.error('Recurso não encontrado.')
          break
        case 422:
          // Erros de validação
          if (data.errors) {
            Object.values(data.errors).forEach((fieldErrors) => {
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((message) => {
                  toast.error(message)
                })
              }
            })
          } else {
            toast.error(data.message || 'Erro de validação.')
          }
          break
        case 500:
          toast.error('Erro interno do servidor.')
          break
        default:
          toast.error(data.message || 'Erro inesperado.')
      }
    } else if (error.request) {
      toast.error('Erro de conexão. Verifique sua internet.')
    } else {
      toast.error('Erro inesperado.')
    }
    
    return Promise.reject(error)
  }
)

export default api
