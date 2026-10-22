<template>
  <div class="searchable-select" :class="{ open: isOpen, disabled: disabled }" @keydown.esc.prevent="closeImmediately">
    <input
      ref="inputEl"
      type="text"
      class="form-control searchable-select-input"
      :class="inputClass"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="ariaLabel || placeholder || 'Selecionar opção'"
      :aria-expanded="isOpen"
      :aria-controls="isOpen ? listboxId : undefined"
      :aria-activedescendant="activeOptionId || undefined"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      role="combobox"
      v-model="query"
      @focus="onFocus"
      @blur="close"
      @keydown.enter.prevent="selectFirstMatch"
      @keydown.down.prevent="moveActiveOption(1)"
      @keydown.up.prevent="moveActiveOption(-1)"
    />
    <i class="bi bi-chevron-down searchable-select-caret"></i>
    <ul v-if="isOpen" :id="listboxId" class="searchable-select-suggestions" role="listbox">
      <li
        v-for="(option, index) in filteredOptions"
        :id="optionId(index)"
        :key="option.value"
        :class="{ disabled: option.disabled, active: activeOptionIndex === index, selected: option.value === modelValue }"
        role="option"
        :aria-selected="option.value === modelValue"
        :aria-disabled="!!option.disabled"
        @mousemove="activeOptionIndex = index"
        @mousedown.prevent="selectOption(option)"
      >
        {{ option.label }}
      </li>
      <li v-if="filteredOptions.length === 0" class="empty" role="option" aria-disabled="true">Nenhum resultado</li>
    </ul>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
import { computed, ref, useId, watch } from 'vue'

export interface SearchableSelectOption<T> {
  value: T
  label: string
  disabled?: boolean
}

const props = defineProps<{
  modelValue: T | null | undefined
  options: SearchableSelectOption<T>[]
  placeholder?: string
  disabled?: boolean
  inputClass?: string
  ariaLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T | null]
  change: [value: T | null]
}>()

const inputEl = ref<HTMLInputElement | null>(null)
const query = ref('')
const isOpen = ref(false)
const activeOptionIndex = ref(-1)
const listboxId = `searchable-select-${useId()}`
const optionId = (index: number) => `${listboxId}-option-${index}`
const activeOptionId = computed(() =>
  isOpen.value && activeOptionIndex.value >= 0 ? optionId(activeOptionIndex.value) : ''
)

const DIACRITICS_PATTERN = /\p{M}/gu

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(DIACRITICS_PATTERN, '')
    .toLowerCase()

const selectedLabel = computed(() => {
  const found = props.options.find((option) => option.value === props.modelValue)
  return found ? found.label : ''
})

watch(
  () => props.modelValue,
  () => {
    if (!isOpen.value) query.value = selectedLabel.value
  },
  { immediate: true }
)

const filteredOptions = computed(() => {
  const q = normalize(query.value.trim())
  if (!q || query.value === selectedLabel.value) return props.options
  return props.options.filter((option) => normalize(option.label).includes(q))
})

const setInitialActiveOption = () => {
  const selectedIndex = filteredOptions.value.findIndex(
    (option) => option.value === props.modelValue && !option.disabled
  )
  activeOptionIndex.value = selectedIndex >= 0
    ? selectedIndex
    : filteredOptions.value.findIndex((option) => !option.disabled)
}

const onFocus = () => {
  if (props.disabled) return
  isOpen.value = true
  query.value = ''
  setInitialActiveOption()
}

const close = () => {
  setTimeout(() => {
    isOpen.value = false
    query.value = selectedLabel.value
    activeOptionIndex.value = -1
  }, 150)
}

const closeImmediately = () => {
  isOpen.value = false
  query.value = selectedLabel.value
  activeOptionIndex.value = -1
}

const selectOption = (option: SearchableSelectOption<T>) => {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
  query.value = option.label
  isOpen.value = false
  activeOptionIndex.value = -1
  inputEl.value?.blur()
}

const moveActiveOption = (direction: 1 | -1) => {
  if (props.disabled) return
  if (!isOpen.value) {
    isOpen.value = true
    query.value = ''
  }

  const enabledIndices = filteredOptions.value
    .map((option, index) => option.disabled ? -1 : index)
    .filter((index) => index >= 0)
  if (enabledIndices.length === 0) {
    activeOptionIndex.value = -1
    return
  }

  const currentPosition = enabledIndices.indexOf(activeOptionIndex.value)
  const nextPosition = currentPosition < 0
    ? (direction > 0 ? 0 : enabledIndices.length - 1)
    : (currentPosition + direction + enabledIndices.length) % enabledIndices.length
  activeOptionIndex.value = enabledIndices[nextPosition]
}

const selectFirstMatch = () => {
  const activeOption = filteredOptions.value[activeOptionIndex.value]
  const match = activeOption && !activeOption.disabled
    ? activeOption
    : filteredOptions.value.find((option) => !option.disabled)
  if (match) selectOption(match)
}

watch(filteredOptions, () => {
  if (isOpen.value) setInitialActiveOption()
})
</script>

<style scoped>
.searchable-select {
  position: relative;
  display: block;
  width: 100%;
}

.searchable-select-input {
  padding-right: 2rem;
  cursor: text;
}

.searchable-select-caret {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--red-devils);
  pointer-events: none;
  font-size: 0.85rem;
}

.searchable-select-suggestions {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.35rem);
  left: 0;
  right: 0;
  margin: 0;
  padding: 0.4rem;
  list-style: none;
  background: var(--surface-strong);
  border: 1px solid var(--line-strong);
  border-radius: 0.95rem;
  box-shadow: var(--shadow-strong);
  max-height: 240px;
  overflow-y: auto;
}

.searchable-select-suggestions li {
  padding: 0.55rem 0.7rem;
  border-radius: 0.7rem;
  cursor: pointer;
  font-weight: 600;
}

.searchable-select-suggestions li:hover {
  background: rgba(220, 38, 38, 0.14);
}

.searchable-select-suggestions li.active {
  background: rgba(220, 38, 38, 0.22);
}

.searchable-select-suggestions li.selected {
  font-weight: 800;
}

.searchable-select-suggestions li.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.searchable-select-suggestions li.empty {
  cursor: default;
  color: var(--text-muted);
  font-weight: 500;
}

.searchable-select.disabled .searchable-select-caret {
  opacity: 0.5;
}
</style>
