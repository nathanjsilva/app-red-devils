<template>
  <div class="rd-pagination">
    <span class="rd-pagination-info">{{ rangeStart }}-{{ rangeEnd }} de {{ totalItems }}</span>

    <div class="rd-pagination-controls">
      <button
        class="pag-btn"
        :disabled="currentPage === 1"
        @click="$emit('update:currentPage', currentPage - 1)"
        aria-label="Página anterior"
      >
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>

      <template v-if="!isMobile">
        <button
          v-for="page in visiblePages"
          :key="page"
          :class="['pag-num', { active: page === currentPage, ellipsis: page === '...' }]"
          :disabled="page === '...'"
          @click="page !== '...' && $emit('update:currentPage', Number(page))"
        >{{ page }}</button>
      </template>
      <span v-else class="rd-pagination-compact">Página {{ currentPage }} de {{ totalPages }}</span>

      <button
        class="pag-btn"
        :disabled="currentPage === totalPages"
        @click="$emit('update:currentPage', currentPage + 1)"
        aria-label="Próxima página"
      >
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <div v-if="pageSizeOptions" class="pag-size">
      <label class="filter-label">por página</label>
      <SearchableSelect
        :model-value="pageSize"
        :options="pageSizeOptions"
        input-class="pag-select"
        @update:model-value="(value) => value != null && $emit('update:pageSize', Number(value))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SearchableSelect, { type SearchableSelectOption } from './SearchableSelect.vue'
import { useResponsive } from '../../composables/useResponsive'

const props = defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: SearchableSelectOption<number>[]
}>()

defineEmits<{
  'update:currentPage': [value: number]
  'update:pageSize': [value: number]
}>()

const { isMobile } = useResponsive()

const rangeStart = computed(() => (props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1))
const rangeEnd = computed(() => Math.min(props.currentPage * props.pageSize, props.totalItems))

const visiblePages = computed(() => {
  const total = props.totalPages
  const cur = props.currentPage
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | string)[] = [1]
  if (cur > 3) pages.push('...')
  for (let page = Math.max(2, cur - 1); page <= Math.min(total - 1, cur + 1); page++) pages.push(page)
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})
</script>

<style scoped>
.rd-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--line-soft);
  background: rgba(255, 255, 255, 0.02);
}

.rd-pagination-info {
  font-size: 0.84rem;
  color: var(--text-muted);
}

.rd-pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.rd-pagination-compact {
  min-width: 96px;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main);
}

.pag-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 767px) {
  .rd-pagination {
    padding: 0.75rem 0.9rem;
  }

  .rd-pagination-controls {
    flex: 1;
    justify-content: space-between;
  }

  .pag-size {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
