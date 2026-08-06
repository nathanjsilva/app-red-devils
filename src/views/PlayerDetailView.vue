<template>
  <div class="page-shell py-4">
    <div class="page-header">
      <div>
        <button class="btn btn-outline-secondary mb-2" @click="router.back()">Voltar</button>
        <h1 class="page-title">{{ profile ? profile.player.name : 'Jogador' }}</h1>
        <p v-if="profile" class="page-subtitle">{{ profile.player.position === 'goleiro' ? 'Goleiro' : 'Jogador de linha' }}</p>
      </div>
    </div>

    <div v-if="isLoading" class="surface-card">
      <div class="surface-card-body text-center py-5 text-muted">Carregando perfil...</div>
    </div>

    <div v-else-if="!profile" class="surface-card">
      <div class="surface-card-body text-center py-5 text-muted">Não foi possível carregar este jogador.</div>
    </div>

    <template v-else>
      <section class="surface-card mb-4">
        <div class="surface-card-body">
          <h2 class="section-title">Visão geral</h2>
          <div class="metric-grid">
            <div class="metric-card">
              <span>Jogos</span>
              <strong>{{ profile.total_matches }}</strong>
            </div>
            <div class="metric-card">
              <span>Gols</span>
              <strong>{{ profile.total_goals }}</strong>
              <small>{{ formatDec(profile.avg_goals_per_match) }}/jogo</small>
            </div>
            <div class="metric-card">
              <span>Assistências</span>
              <strong>{{ profile.total_assists }}</strong>
              <small>{{ formatDec(profile.avg_assists_per_match) }}/jogo</small>
            </div>
            <div class="metric-card">
              <span>Aproveitamento</span>
              <strong>{{ formatDec(profile.win_rate) }}%</strong>
              <small>{{ profile.total_wins }}V {{ profile.total_draws }}E {{ profile.total_losses }}D</small>
            </div>
          </div>
        </div>
      </section>

      <section class="surface-card mb-4">
        <div class="surface-card-body">
          <h2 class="section-title">Sequências e assiduidade</h2>
          <div class="metric-grid">
            <div class="metric-card">
              <span>Assiduidade</span>
              <strong>{{ formatDec(profile.attendance_rate) }}%</strong>
            </div>
            <div class="metric-card">
              <span>Melhor sequência de gols</span>
              <strong>{{ profile.best_scoring_streak }}</strong>
            </div>
            <div class="metric-card">
              <span>Melhor sequência de participações</span>
              <strong>{{ profile.best_participation_streak }}</strong>
            </div>
            <div class="metric-card">
              <span>Melhor invencibilidade</span>
              <strong>{{ profile.best_unbeaten_streak }}</strong>
            </div>
          </div>

          <div v-if="profile.best_duo" class="best-duo mt-3">
            <span class="text-muted small">Melhor dupla</span>
            <p class="mb-0 fw-bold">
              {{ profile.best_duo.players.map((p) => p.name).join(' + ') }}
              <span class="text-muted fw-normal">— {{ profile.best_duo.matches_together }} jogos juntos, {{ formatDec(profile.best_duo.win_rate_together) }}% de aproveitamento</span>
            </p>
          </div>
        </div>
      </section>

      <section class="surface-card mb-4">
        <div class="surface-card-body">
          <div class="section-toolbar">
            <h2 class="section-title mb-0">Forma recente</h2>
            <span class="pill-badge pill-info">Tendência: {{ profile.recent_form.trend }}</span>
          </div>
          <div class="recent-form-list">
            <div v-for="match in profile.recent_form.matches" :key="match.pelada_id" class="recent-form-item">
              <span class="pill-badge" :class="resultPillClass(match.result)">{{ resultLabel(match.result) }}</span>
              <span class="text-muted small">{{ formatDate(match.date) }}</span>
              <span class="recent-form-stats">{{ match.goals ?? 0 }}G {{ match.assists ?? 0 }}A</span>
            </div>
          </div>
        </div>
      </section>

      <section class="surface-card">
        <div class="surface-card-body">
          <h2 class="section-title">Evolução</h2>
          <EvolutionChart :points="profile.evolution" />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { StatisticsService } from '../services/statisticsService'
import EvolutionChart from '../components/charts/EvolutionChart.vue'
import type { PlayerProfile } from '../types'

const route = useRoute()
const router = useRouter()
const profile = ref<PlayerProfile | null>(null)
const isLoading = ref(false)

const formatDec = (value?: number | null) => (value != null ? value.toFixed(2).replace('.', ',') : '-')

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString + 'T00:00:00')
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return dateString
  }
}

const resultLabel = (result: string) => (result === 'win' ? 'Vitória' : result === 'draw' ? 'Empate' : 'Derrota')
const resultPillClass = (result: string) => (result === 'win' ? 'pill-ok' : result === 'draw' ? 'pill-muted' : 'pill-danger')

const fetchProfile = async () => {
  const id = Number(route.params.id)
  if (isNaN(id)) return
  isLoading.value = true
  try {
    profile.value = await StatisticsService.getPlayerProfile(id)
  } catch (error) {
    console.error(error)
    profile.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchProfile)
</script>

<style scoped>
.best-duo {
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  background: rgba(185, 28, 28, 0.04);
}

.recent-form-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.recent-form-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.recent-form-stats {
  margin-left: auto;
  font-weight: 700;
}
</style>
