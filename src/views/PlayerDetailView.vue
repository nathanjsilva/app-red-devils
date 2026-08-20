<template>
  <div class="page-shell py-4">
    <div class="page-header">
      <div>
        <button class="btn btn-outline-secondary mb-2" @click="router.back()">Voltar</button>
        <h1 class="page-title">{{ profile ? profile.player.name : 'Jogador' }}</h1>
        <p v-if="profile" class="page-subtitle">{{ profile.player.position === 'goleiro' ? 'Goleiro' : 'Jogador de linha' }}</p>
      </div>

      <div class="seg-control">
        <button
          v-for="opt in divisionOptions"
          :key="opt.value"
          :class="['seg-btn', { active: division === opt.value }]"
          @click="division = opt.value"
        >{{ opt.label }}</button>
      </div>
    </div>

    <div v-if="isLoading" class="surface-card">
      <div class="surface-card-body text-center py-5 text-muted">Carregando perfil...</div>
    </div>

    <div v-else-if="!profile" class="surface-card">
      <div class="surface-card-body text-center py-5 text-muted">
        <p class="mb-3">Não foi possível carregar este jogador.</p>
        <button class="retry-btn" @click="fetchProfile">Tentar novamente</button>
      </div>
    </div>

    <template v-else>
      <section class="surface-card mb-4">
        <div class="surface-card-body">
          <h2 class="section-title">Visão geral</h2>
          <div class="metric-grid">
            <StatTile label="Jogos" :value="profile.total_matches" />
            <StatTile
              label="Gols"
              :value="profile.total_goals"
              :hint="`${formatDec(profile.avg_goals_per_match)}/jogo`"
              help="Total de gols marcados no período. Média = total de gols ÷ partidas disputadas."
            />
            <StatTile
              label="Assistências"
              :value="profile.total_assists"
              :hint="`${formatDec(profile.avg_assists_per_match)}/jogo`"
              help="Total de assistências no período. Média = total de assistências ÷ partidas disputadas."
            />
            <StatTile
              label="Participações em gols"
              :value="profile.total_goal_participations"
              :hint="`${formatDec(profile.avg_goal_participations_per_match)}/jogo`"
              help="Participações em gols = gols + assistências. Média = participações em gols ÷ partidas disputadas."
            />
            <StatTile
              label="Aproveitamento"
              :value="`${formatDec(profile.win_rate)}%`"
              :hint="`${profile.total_wins}V ${profile.total_draws}E ${profile.total_losses}D`"
              help="Vitórias ÷ partidas disputadas × 100."
            />
            <StatTile
              v-if="profile.player.position === 'goleiro'"
              label="Gols sofridos"
              :value="profile.goals_conceded ?? '-'"
            />
          </div>
        </div>
      </section>

      <section class="surface-card mb-4">
        <div class="surface-card-body">
          <h2 class="section-title">Sequências, assiduidade e regularidade</h2>
          <div class="metric-grid">
            <StatTile
              label="Assiduidade"
              :value="`${formatDec(profile.attendance_rate)}%`"
              help="Partidas disputadas ÷ peladas realizadas desde a primeira partida do jogador no período × 100."
            />
            <StatTile
              label="Melhor sequência de gols"
              :value="profile.best_scoring_streak"
              help="Maior número de peladas seguidas em que o jogador marcou pelo menos 1 gol."
            />
            <StatTile
              label="Melhor sequência de participações em gols"
              :value="profile.best_participation_streak"
              help="Maior número de peladas seguidas em que o jogador teve gol ou assistência."
            />
            <StatTile
              label="Melhor invencibilidade"
              :value="profile.best_unbeaten_streak"
              help="Maior número de peladas seguidas sem derrota (vitória ou empate)."
            />
            <StatTile
              label="% de jogos marcando"
              :value="`${formatDec(profile.pct_matches_scoring)}%`"
              help="Peladas em que marcou pelo menos 1 gol ÷ partidas disputadas × 100."
            />
            <StatTile
              label="% de jogos dando assistência"
              :value="`${formatDec(profile.pct_matches_assisting)}%`"
              help="Peladas em que deu pelo menos 1 assistência ÷ partidas disputadas × 100."
            />
            <StatTile
              label="% de jogos participando de gol"
              :value="`${formatDec(profile.pct_matches_participating)}%`"
              help="Peladas em que teve gol ou assistência ÷ partidas disputadas × 100."
            />
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

      <section class="surface-card mb-4">
        <div class="surface-card-body">
          <h2 class="section-title">Desempenho por pelada</h2>
          <p class="page-subtitle mb-2">Clique numa pelada para ver os números de todos naquele dia.</p>
          <div class="table-responsive pelada-history-scroll">
            <table class="data-table stack-mobile">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Local</th>
                  <th>Resultado</th>
                  <th>Gols</th>
                  <th>Assistências</th>
                  <th v-if="profile.player.position === 'goleiro'">Gols sofridos</th>
                  <th>Destaques</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="entry in profile.pelada_history"
                  :key="entry.pelada_id"
                  class="clickable-row"
                  @click="router.push(`/peladas/${entry.pelada_id}`)"
                >
                  <td data-label="Data">{{ formatDate(entry.date) }}</td>
                  <td data-label="Local">{{ entry.location }}</td>
                  <td data-label="Resultado">
                    <span class="pill-badge" :class="resultPillClass(entry.result)">{{ resultLabel(entry.result) }}</span>
                  </td>
                  <td data-label="Gols">{{ entry.goals ?? 0 }}</td>
                  <td data-label="Assistências">{{ entry.assists ?? 0 }}</td>
                  <td v-if="profile.player.position === 'goleiro'" data-label="Gols sofridos">{{ entry.goals_conceded ?? '-' }}</td>
                  <td data-label="Destaques">
                    <span class="highlight-icons">
                      <i v-if="entry.is_top_scorer" class="bi bi-trophy-fill highlight-icon highlight-scorer" title="Artilheiro do dia"></i>
                      <i v-if="entry.is_top_assister" class="bi bi-cup-hot-fill highlight-icon highlight-assister" title="Garçom do dia"></i>
                      <span v-if="!entry.is_top_scorer && !entry.is_top_assister" class="text-muted">—</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="profile.pelada_history.length === 0" class="text-muted mb-0">Nenhuma pelada registrada no período.</p>
        </div>
      </section>

      <section class="surface-card">
        <div class="surface-card-body">
          <h2 class="section-title">Evolução</h2>
          <EvolutionChart :points="profile.evolution" :show-goals-conceded="profile.player.position === 'goleiro'" />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { StatisticsService } from '../services/statisticsService'
import EvolutionChart from '../components/charts/EvolutionChart.vue'
import StatTile from '../components/ui/StatTile.vue'
import type { PlayerProfile, StatisticsFilters } from '../types'

const route = useRoute()
const router = useRouter()
const profile = ref<PlayerProfile | null>(null)
const isLoading = ref(false)

const division = ref<'all' | 'quinta' | 'sabado'>('all')
const divisionOptions = [
  { value: 'all' as const, label: 'Todas' },
  { value: 'quinta' as const, label: 'Quinta' },
  { value: 'sabado' as const, label: 'Sábado' }
]
const filters = computed<StatisticsFilters>(() => (division.value === 'all' ? {} : { division: division.value }))

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
    profile.value = await StatisticsService.getPlayerProfile(id, filters.value)
  } catch (error) {
    console.error(error)
    profile.value = null
  } finally {
    isLoading.value = false
  }
}

watch(division, fetchProfile)

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

.highlight-icons {
  display: inline-flex;
  gap: 0.5rem;
  font-size: 1.05rem;
}

.highlight-icon {
  cursor: default;
}

.highlight-scorer {
  color: #d4a017;
}

.highlight-assister {
  color: #0891b2;
}

.pelada-history-scroll {
  max-height: 320px;
  overflow-y: auto;
}

.clickable-row {
  cursor: pointer;
}
</style>
