<template>
  <div class="searchable-select" :class="{ open: isOpen, disabled: disabled }" @keydown.esc="close">
    <input
      ref="inputEl"
      type="text"
      class="form-control searchable-select-input"
      :class="inputClass"
      :placeholder="placeholder"
      :disabled="disabled"
      v-model="query"
      @focus="onFocus"
      @blur="close"
      @keydown.enter.prevent="selectFirstMatch"
    />
    <i class="bi bi-chevron-down searchable-select-caret"></i>
    <ul v-if="isOpen && filteredOptions.length > 0" class="searchable-select-suggestions">
      <li
        v-for="option in filteredOptions"
        :key="option.value"
        :class="{ disabled: option.disabled, active: option.value === modelValue }"
        @mousedown.prevent="selectOption(option)"
      >
        {{ option.label }}
      </li>
    </ul>
    <ul v-else-if="isOpen" class="searchable-select-suggestions">
      <li class="empty">Nenhum resultado</li>
    </ul>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
import { computed, ref, watch } from 'vue'

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
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T | null]
  change: [value: T | null]
}>()

const inputEl = ref<HTMLInputElement | null>(null)
const query = ref('')
const isOpen = ref(false)

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

const onFocus = () => {
  if (props.disabled) return
  isOpen.value = true
  query.value = ''
}

const close = () => {
  setTimeout(() => {
    isOpen.value = false
    query.value = selectedLabel.value
  }, 150)
}

const selectOption = (option: SearchableSelectOption<T>) => {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
  query.value = option.label
  isOpen.value = false
  inputEl.value?.blur()
}

const selectFirstMatch = () => {
  const match = filteredOptions.value.find((option) => !option.disabled)
  if (match) selectOption(match)
}
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
