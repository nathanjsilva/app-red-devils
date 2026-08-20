<template>
  <div class="chart-box">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import type { EvolutionPoint } from '../../types'

const props = defineProps<{
  points: EvolutionPoint[]
  showGoalsConceded?: boolean
}>()

const formatPeriodLabel = (period: string): string => {
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-')
    const date = new Date(Number(year), Number(month) - 1, 1)
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return new Date(`${period}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }
  return period
}

const chartData = computed(() => ({
  labels: props.points.map((point) => formatPeriodLabel(point.period)),
  datasets: [
    {
      label: 'Gols',
      data: props.points.map((point) => point.total_goals),
      borderColor: '#b91c1c',
      backgroundColor: 'rgba(185, 28, 28, 0.16)',
      pointBackgroundColor: '#b91c1c',
      pointBorderColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 3,
      tension: 0.35,
      fill: true
    },
    {
      label: 'Assistências',
      data: props.points.map((point) => point.total_assists),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.14)',
      pointBackgroundColor: '#f59e0b',
      pointBorderColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 3,
      tension: 0.35,
      fill: true
    },
    ...(props.showGoalsConceded
      ? [
          {
            label: 'Gols sofridos',
            data: props.points.map((point) => point.total_goals_conceded),
            borderColor: '#64748b',
            backgroundColor: 'rgba(100, 116, 139, 0.14)',
            pointBackgroundColor: '#64748b',
            pointBorderColor: '#fff',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3,
            tension: 0.35,
            fill: true
          }
        ]
      : [])
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { usePointStyle: true, boxWidth: 8, font: { size: 12, weight: 700 as const } }
    },
    tooltip: {
      backgroundColor: '#1d0707',
      padding: 10,
      cornerRadius: 10,
      titleFont: { weight: 700 as const }
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.08)' }, ticks: { precision: 0, font: { size: 11 } } }
  }
}
</script>

<style scoped>
.chart-box {
  position: relative;
  height: 260px;
}

@media (min-width: 768px) {
  .chart-box {
    height: 320px;
  }
}
</style>
