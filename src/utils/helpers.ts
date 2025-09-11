// Funções auxiliares

export const fakeAvatar = (id: number): string => {
  return `https://i.pravatar.cc/60?img=${id}`
}

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('pt-BR')
}

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('pt-BR')
}

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
