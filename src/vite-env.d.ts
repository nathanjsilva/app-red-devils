/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/utils/constants'
declare module '@/types'
declare module '@/services/authService'
declare module '@/composables/useAuth'
declare module '@/composables/useForm'
declare module '@/composables/useSEO'
declare module '@/composables/useResponsive'
declare module '@/stores/auth'
declare module '@/assets/logo-red-devils.png'
