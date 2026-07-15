<template>
  <div class="chart-box">
    <Radar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Radar } from 'vue-chartjs'
import type { ComparePlayerEntry } from '../../types'

const props = defineProps<{
  entries: ComparePlayerEntry[]
}>()

const PALETTE = ['#b91c1c', '#1d4ed8', '#b45309', '#0f766e']

type RadarAxisKey = keyof ComparePlayerEntry['radar']

const formatInt = (value: number) => String(value)
const formatDec = (value: number) => value.toFixed(2).replace('.', ',')
const formatPct = (value: number) => `${formatDec(value)}%`

const AXES: Array<{ key: RadarAxisKey; label: string; format: (value: number) => string }> = [
  { key: 'total_goals', label: 'Gols', format: formatInt },
  { key: 'total_assists', label: 'Assistências', format: formatInt },
  { key: 'total_goal_participations', label: 'Participações', format: formatInt },
  { key: 'win_rate', label: 'Aproveitamento', format: formatPct },
  { key: 'avg_goal_participations_per_match', label: 'Média/Partida', format: formatDec }
]

const chartData = computed(() => ({
  labels: AXES.map((axis) => axis.label),
  datasets: props.entries.map((entry, index) => {
    const color = PALETTE[index % PALETTE.length]
    return {
      label: entry.player.nickname || entry.player.name,
      data: AXES.map((axis) => entry.radar[axis.key] ?? 0),
      borderColor: color,
      backgroundColor: `${color}26`,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      borderWidth: 2,
      pointRadius: 4
    }
  })
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, boxWidth: 8, font: { size: 12, weight: 700 as const } }
    },
    tooltip: {
      backgroundColor: '#1d0707',
      padding: 10,
      cornerRadius: 10,
      callbacks: {
        label: (context: { datasetIndex: number; dataIndex: number; dataset: { label?: string } }) => {
          const axis = AXES[context.dataIndex]
          const entry = props.entries[context.datasetIndex]
          return `${context.dataset.label}: ${axis.format(entry[axis.key])}`
        }
      }
    }
  },
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: { display: false, stepSize: 25 },
      grid: { color: 'rgba(15, 23, 42, 0.08)' },
      angleLines: { color: 'rgba(15, 23, 42, 0.08)' },
      pointLabels: { font: { size: 11, weight: 700 as const } }
    }
  }
}
</script>

<style scoped>
.chart-box {
  position: relative;
  height: 320px;
}

@media (min-width: 768px) {
  .chart-box {
    height: 380px;
  }
}
</style>
