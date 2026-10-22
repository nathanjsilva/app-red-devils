import { nextTick, onScopeDispose, watch, type ComputedRef, type Ref } from 'vue'

const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useDialogFocus(
  dialog: Ref<HTMLElement | null>,
  isOpen: ComputedRef<boolean>,
  onClose: () => void,
) {
  let opener: HTMLElement | null = null
  let previousBodyOverflow = ''
  let active = false

  const handleKeydown = (event: KeyboardEvent) => {
    const element = dialog.value
    if (!element) return

    if (event.key === 'Escape') {
      if (event.defaultPrevented) return
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = Array.from(element.querySelectorAll<HTMLElement>(focusableSelector))
      .filter((item) => item.tabIndex >= 0 && !item.closest('[hidden], [inert], [aria-hidden="true"]'))

    if (!focusable.length) {
      event.preventDefault()
      element.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const current = document.activeElement

    if (event.shiftKey && (current === first || !element.contains(current))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (current === last || !element.contains(current))) {
      event.preventDefault()
      first.focus()
    }
  }

  const activate = () => {
    if (active) return
    active = true
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeydown)
  }

  const deactivate = () => {
    if (!active) return
    active = false
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = previousBodyOverflow
    const previousOpener = opener
    opener = null
    void nextTick(() => {
      if (previousOpener?.isConnected) previousOpener.focus()
    })
  }

  watch(isOpen, (open, wasOpen) => {
    if (open) {
      activate()
      void nextTick(() => dialog.value?.focus())
    } else if (wasOpen) {
      deactivate()
    }
  }, { flush: 'post' })

  watch(dialog, (element) => {
    if (element && isOpen.value) {
      activate()
      void nextTick(() => element.focus())
    }
  }, { flush: 'post' })

  onScopeDispose(() => {
    if (!active) return
    active = false
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = previousBodyOverflow
  })
}
