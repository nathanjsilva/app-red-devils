import { beforeEach, vi } from 'vitest'

// Configuração global para testes de fluxo
beforeEach(() => {
  // Limpar todos os mocks
  vi.clearAllMocks()
  
  // Limpar localStorage
  localStorage.clear()
  
  // Limpar sessionStorage
  sessionStorage.clear()
  
  // Resetar timers
  vi.clearAllTimers()
  
  // Configurar mocks globais
  vi.stubGlobal('console', {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn()
  })
})

// Mock do window.matchMedia para testes responsivos
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock do IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))








