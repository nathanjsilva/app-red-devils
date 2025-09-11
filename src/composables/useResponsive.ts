import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useResponsive() {
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)

  const isMobile = ref(windowWidth.value <= 768)
  const isTablet = ref(windowWidth.value > 768 && windowWidth.value <= 1024)
  const isDesktop = ref(windowWidth.value > 1024)

  const updateDimensions = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
    isMobile.value = windowWidth.value <= 768
    isTablet.value = windowWidth.value > 768 && windowWidth.value <= 1024
    isDesktop.value = windowWidth.value > 1024
  }

  onMounted(() => {
    window.addEventListener('resize', updateDimensions)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDimensions)
  })

  return {
    windowWidth,
    windowHeight,
    isMobile,
    isTablet,
    isDesktop
  }
}
