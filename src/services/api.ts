import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios'
import { useToast } from 'vue-toastification'
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants'
import type { ApiError } from '../types'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiError>) => {
    const toast = useToast()

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          localStorage.removeItem(STORAGE_KEYS.TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USER)
          toast.error('Sessao expirada. Faca login novamente.')
          if (window.location.pathname !== '/') {
            window.location.href = '/'
          }
          break
        case 403:
          toast.error('Acesso negado.')
          break
        case 404:
          break
        case 422:
          if (data?.errors) {
            Object.values(data.errors).forEach((fieldErrors) => {
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((message) => {
                  toast.error(message)
                })
              }
            })
          } else {
            toast.error(data?.message || data?.error || 'Erro de validacao.')
          }
          break
        case 500:
          toast.error('Erro interno do servidor.')
          break
        default:
          toast.error(data?.message || data?.error || 'Erro inesperado.')
      }
    } else if (error.request) {
      toast.error('Erro de conexao. Verifique sua internet.')
    } else {
      toast.error('Erro inesperado.')
    }

    return Promise.reject(error)
  }
)

export default api
