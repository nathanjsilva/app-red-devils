import { computed, defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useDialogFocus } from '../../composables/useDialogFocus'

const DialogHarness = defineComponent({
  setup() {
    const isOpen = ref(false)
    const dialog = ref<HTMLElement | null>(null)
    const close = () => { isOpen.value = false }

    useDialogFocus(dialog, computed(() => isOpen.value), close)

    return { isOpen, dialog, open: () => { isOpen.value = true } }
  },
  template: `
    <button type="button" data-opener @click="open">Abrir</button>
    <section v-if="isOpen" ref="dialog" role="dialog" tabindex="-1">
      <button type="button" data-first>Primeiro</button>
      <button type="button" data-last>Último</button>
    </section>
  `,
})

describe('useDialogFocus', () => {
  it('move o foco para o diálogo, mantém a tabulação dentro e restaura ao fechar', async () => {
    const wrapper = mount(DialogHarness, { attachTo: document.body })
    const opener = wrapper.get('[data-opener]')
    ;(opener.element as HTMLButtonElement).focus()

    await opener.trigger('click')
    await wrapper.vm.$nextTick()
    const dialog = wrapper.get('[role="dialog"]')
    const first = wrapper.get('[data-first]')
    const last = wrapper.get('[data-last]')

    expect(document.activeElement).toBe(dialog.element)
    expect(document.body.style.overflow).toBe('hidden')

    ;(last.element as HTMLButtonElement).focus()
    last.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(first.element)

    ;(first.element as HTMLButtonElement).focus()
    first.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    expect(document.activeElement).toBe(last.element)

    dialog.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    await nextTick()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(opener.element)
    wrapper.unmount()
  })

  it('não fecha o diálogo se um controle interno já consumiu Escape', async () => {
    const wrapper = mount(DialogHarness, { attachTo: document.body })
    const opener = wrapper.get('[data-opener]')
    await opener.trigger('click')
    await wrapper.vm.$nextTick()

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    const first = wrapper.get('[data-first]').element
    first.addEventListener('keydown', (keyEvent) => keyEvent.preventDefault(), { once: true })
    first.dispatchEvent(event)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    wrapper.unmount()
  })
})
