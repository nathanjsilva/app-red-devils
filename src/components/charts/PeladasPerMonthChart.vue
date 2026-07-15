<template>
  <div class="chart-box">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { PeladasPerMonthPoint } from '../../types'

const props = defineProps<{
  points: PeladasPerMonthPoint[]
}>()

const formatPeriodLabel = (period: string): string => {
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-')
    const date = new Date(Number(year), Number(month) - 1, 1)
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
  }
  return period
}

const chartData = computed(() => ({
  labels: props.points.map((point) => formatPeriodLabel(point.period)),
  datasets: [
    {
      label: 'Peladas',
      data: props.points.map((point) => point.total_peladas),
      backgroundColor: '#b91c1c',
      borderRadius: 6,
      maxBarThickness: 36
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1d0707',
      padding: 10,
      cornerRadius: 10,
      titleFont: { weight: 700 as const }
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { beginAtZero: true, grid: { color: 'rgba(15, 23, 42, 0.06)' }, ticks: { precision: 0, font: { size: 11 } } }
  }
}
</script>

<style scoped>
.chart-box {
  position: relative;
  height: 220px;
}

@media (min-width: 768px) {
  .chart-box {
    height: 260px;
  }
}
</style>
