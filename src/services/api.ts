import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { useToast } from 'vue-toastification'
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants'
import type { ApiError } from '../types'

// Instância base do axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Aumentado para 30 segundos
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      // ensure header object exists and normalize key casing
      config.headers = config.headers || {}
      // API espera header "Authorization: Bearer {token}"; armazenamos o valor completo já com "Bearer "
      config.headers.Authorization = token
      console.log('API Request with token:', config.url, 'Authorization:', token.substring(0, 20) + '...')
    } else {
      console.log('API Request without token:', config.url)
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
          console.log('401 Unauthorized - clearing auth and redirecting')
          localStorage.removeItem(STORAGE_KEYS.TOKEN)
          localStorage.removeItem(STORAGE_KEYS.PLAYER)
          toast.error('Sessão expirada. Faça login novamente.')
          // Só redireciona se não estiver já na página de login
          if (window.location.pathname !== '/') {
            window.location.href = '/'
          }
          break
        case 403:
          toast.error('Acesso negado.')
          break
        case 404:
          // Não mostrar toast automático para 404 - deixar cada componente/serviço tratar conforme necessário
          // Muitos 404s são esperados (recursos que ainda não existem, verificações de existência, etc.)
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
