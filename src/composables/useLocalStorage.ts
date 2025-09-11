import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const storedValue = localStorage.getItem(key)
  const value = ref<T>(
    storedValue ? JSON.parse(storedValue) : defaultValue
  )

  // Watcher para sincronizar mudanças com localStorage
  watch(
    value,
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(newValue))
      }
    },
    { deep: true }
  )

  const setValue = (newValue: T) => {
    value.value = newValue
  }

  const removeValue = () => {
    value.value = defaultValue
    localStorage.removeItem(key)
  }

  return {
    value,
    setValue,
    removeValue
  }
}
