<template>
  <div class="chart-box" :style="{ height: barsHeight }">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { RankingPlayer } from '../../types'

const props = withDefaults(
  defineProps<{
    players: RankingPlayer[]
    valueSuffix?: string
  }>(),
  { valueSuffix: '' }
)

const barsHeight = computed(() => `${Math.max(220, props.players.length * 46)}px`)

const chartData = computed(() => {
  const ordered = [...props.players].reverse()
  return {
    labels: ordered.map((player) => player.nickname || player.name),
    datasets: [
      {
        label: 'Valor',
        data: ordered.map((player) => player.total),
        backgroundColor: ordered.map((_, index) =>
          index === ordered.length - 1 ? '#b91c1c' : 'rgba(185, 28, 28, 0.55)'
        ),
        borderRadius: 8,
        maxBarThickness: 28
      }
    ]
  }
})

const chartOptions = computed(() => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1d0707',
      padding: 10,
      cornerRadius: 10,
      callbacks: {
        label: (ctx: any) => `${ctx.parsed.x}${props.valueSuffix}`
      }
    }
  },
  scales: {
    x: { beginAtZero: true, grid: { color: 'rgba(15, 23, 42, 0.06)' }, ticks: { precision: 0, font: { size: 11 } } },
    y: { grid: { display: false }, ticks: { font: { size: 12, weight: 700 } } }
  }
}))
</script>

<style scoped>
.chart-box {
  position: relative;
  width: 100%;
}
</style>
