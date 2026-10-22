import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SearchableSelect from '../../components/ui/SearchableSelect.vue'

describe('SearchableSelect', () => {
  it('expõe semântica de combobox e seleciona opções com o teclado', async () => {
    const wrapper = mount(SearchableSelect, {
      props: {
        modelValue: null,
        ariaLabel: 'Jogador da partida',
        options: [
          { value: 'unavailable', label: 'Indisponível', disabled: true },
          { value: 'ana', label: 'Ana' },
          { value: 'bia', label: 'Bia' },
        ],
      },
    })

    const combobox = wrapper.get('[role="combobox"]')
    expect(combobox.attributes('aria-label')).toBe('Jogador da partida')
    expect(combobox.attributes('aria-expanded')).toBe('false')

    await combobox.trigger('focus')
    expect(combobox.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[role="option"][aria-disabled="true"]').text()).toBe('Indisponível')

    await combobox.trigger('keydown', { key: 'ArrowDown' })
    const activeOptionId = combobox.attributes('aria-activedescendant')
    expect(wrapper.get(`#${activeOptionId}`).text()).toBe('Bia')

    await combobox.trigger('keydown.enter')
    expect(wrapper.emitted('update:modelValue')).toEqual([['bia']])
    expect(wrapper.emitted('change')).toEqual([['bia']])
    expect(combobox.attributes('aria-expanded')).toBe('false')
  })
})
