<template>
  <div class="metric-card" :class="{ 'metric-card--highlight': highlight, 'metric-card--wide': wide }">
    <div class="metric-card-head">
      <span>{{ label }}</span>
      <InfoTooltip v-if="help" :text="help" :label="label" />
    </div>
    <strong>{{ value }}</strong>
    <small v-if="hint">{{ hint }}</small>
  </div>
</template>

<script setup lang="ts">
import InfoTooltip from './InfoTooltip.vue'

defineProps<{
  label: string
  value: string | number
  hint?: string
  help?: string
  highlight?: boolean
  wide?: boolean
}>()
</script>
