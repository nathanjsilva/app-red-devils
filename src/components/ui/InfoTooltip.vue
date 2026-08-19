<template>
  <span class="info-tooltip">
    <button
      type="button"
      class="info-tooltip-trigger"
      :aria-label="`O que é: ${label ?? 'esta estatística'}`"
      :aria-expanded="open"
      @click="open = !open"
      @focus="open = true"
      @blur="open = false"
      @mouseenter="open = true"
      @mouseleave="open = false"
    >
      <i class="bi bi-info-circle"></i>
    </button>
    <span v-if="open" class="info-tooltip-bubble" role="tooltip">{{ text }}</span>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  text: string
  label?: string
}>()

const open = ref(false)
</script>

<style scoped>
.info-tooltip {
  display: inline-flex;
  flex-shrink: 0;
}

.info-tooltip-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: help;
  line-height: 0;
}

.info-tooltip-trigger:hover,
.info-tooltip-trigger:focus-visible {
  color: var(--red-devils);
}

.info-tooltip-trigger i {
  font-size: 0.85rem;
}

.info-tooltip-bubble {
  position: absolute;
  z-index: 30;
  bottom: calc(100% + 0.4rem);
  left: 0;
  right: 0;
  padding: 0.55rem 0.7rem;
  border-radius: 0.6rem;
  background: var(--surface-strong);
  border: 1px solid var(--line-strong);
  box-shadow: var(--shadow-soft);
  color: var(--text-main);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
  text-transform: none;
  letter-spacing: normal;
  pointer-events: none;
}
</style>
