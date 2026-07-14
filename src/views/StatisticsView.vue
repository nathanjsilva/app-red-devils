<template>
  <div class="stats-page">
    <header class="stats-hero">
      <div class="stats-hero-noise"></div>
      <div class="container stats-hero-inner">
        <div class="stats-hero-brand">
          <img :src="logo" alt="Red Devils" class="stats-hero-logo" />
          <div>
            <p class="stats-hero-kicker">Central de estatísticas</p>
            <h1 class="stats-hero-title">Números da temporada</h1>
          </div>
        </div>
        <p class="stats-hero-subtitle">Evolução, rankings e comparação de jogadores — tudo num só lugar.</p>

        <div class="seg-control stats-division-filter">
          <button
            v-for="opt in divisionOptions"
            :key="opt.value"
            :class="['seg-btn', { active: division === opt.value }]"
            @click="division = opt.value"
          >{{ opt.label }}</button>
        </div>
      </div>
    </header>

    <main class="container stats-main">
      <!-- KPIs -->
      <section v-if="isLoadingDashboard" class="state-box surface-card">
        <span class="spinner"></span>
        <p>Carregando visão geral...</p>
      </section>

      <section v-else-if="errorDashboard" class="state-box surface-card state-error">
        <p>{{ errorDashboard }}</p>
        <button class="retry-btn" @click="fetchDashboard">Tentar novamente</button>
      </section>

      <template v-else-if="dashboard">
        <section class="metric-grid stats-kpi-grid">
          <div class="metric-card">
            <span>Peladas</span>
            <strong>{{ dashboard.total_peladas }}</strong>
            <small>{{ dashboard.total_players }} jogadores participantes</small>
          </div>
          <div class="metric-card">
            <span>Gols</span>
            <strong>{{ dashboard.total_goals }}</strong>
            <small>Média {{ formatDec(dashboard.avg_goals_per_pelada) }} por pelada</small>
          </div>
          <div class="metric-card">
            <span>Assistências</span>
            <strong>{{ dashboard.total_assists }}</strong>
            <small>Média {{ formatDec(dashboard.avg_assists_per_pelada) }} por pelada</small>
          </div>
          <div class="metric-card">
            <span>Participações em gols</span>
            <strong>{{ dashboard.total_goal_participations }}</strong>
            <small>Gols + assistências somados</small>
          </div>
        </section>

        <section class="home-spotlight-grid stats-spotlight-grid">
          <article v-if="dashboard.top_scorer" class="surface-card spotlight-card">
            <div class="surface-card-body spotlight-card-body">
              <p class="spotlight-kicker">Artilheiro</p>
              <div class="spotlight-player-row">
                <div class="spotlight-avatar">{{ initials(dashboard.top_scorer.player.name) }}</div>
                <div>
                  <strong class="spotlight-player-name">{{ dashboard.top_scorer.player.name }}</strong>
                  <p class="spotlight-player-copy">{{ dashboard.top_scorer.matches }} jogos</p>
                  <span class="spotlight-player-meta">{{ dashboard.top_scorer.value }} gols</span>
                </div>
              </div>
            </div>
          </article>

          <article v-if="dashboard.top_assister" class="surface-card spotlight-card">
            <div class="surface-card-body spotlight-card-body">
              <p class="spotlight-kicker">Garçom</p>
              <div class="spotlight-player-row">
                <div class="spotlight-avatar">{{ initials(dashboard.top_assister.player.name) }}</div>
                <div>
                  <strong class="spotlight-player-name">{{ dashboard.top_assister.player.name }}</strong>
                  <p class="spotlight-player-copy">{{ dashboard.top_assister.matches }} jogos</p>
                  <span class="spotlight-player-meta">{{ dashboard.top_assister.value }} assistências</span>
                </div>
              </div>
            </div>
          </article>

          <article v-if="dashboard.best_goalkeeper" class="surface-card spotlight-card">
            <div class="surface-card-body spotlight-card-body">
              <p class="spotlight-kicker">Melhor goleiro</p>
              <div class="spotlight-player-row">
                <div class="spotlight-avatar">{{ initials(dashboard.best_goalkeeper.player.name) }}</div>
                <div>
                  <strong class="spotlight-player-name">{{ dashboard.best_goalkeeper.player.name }}</strong>
                  <p class="spotlight-player-copy">{{ dashboard.best_goalkeeper.matches }} jogos</p>
                  <span class="spotlight-player-meta">{{ formatDec(dashboard.best_goalkeeper.value) }} sofridos/jogo</span>
                </div>
              </div>
            </div>
          </article>
        </section>
      </template>

      <!-- Evolução -->
      <section class="surface-card stats-section-card">
        <div class="surface-card-body">
          <div class="section-toolbar">
            <div>
              <p class="stats-section-kicker">Evolução</p>
              <h2 class="section-title mb-0">Gols e assistências por mês</h2>
            </div>
          </div>

          <div v-if="isLoadingEvolution" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="evolutionPoints.length === 0" class="text-muted mb-0">Sem dados suficientes para esse período.</p>
          <EvolutionChart v-else :points="evolutionPoints" />
        </div>
      </section>

      <!-- Rankings -->
      <section class="surface-card stats-section-card">
        <div class="surface-card-body">
          <div class="section-toolbar stats-ranking-toolbar">
            <div>
              <p class="stats-section-kicker">Ranking</p>
              <h2 class="section-title mb-0">{{ activeRankingLabel }}</h2>
            </div>
            <div class="seg-control">
              <button
                v-for="cat in rankingCategories"
                :key="cat.value"
                :class="['seg-btn', { active: rankingType === cat.value }]"
                @click="rankingType = cat.value"
              >{{ cat.label }}</button>
            </div>
          </div>

          <div v-if="isLoadingRanking" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="!currentRanking || currentRanking.players.length === 0" class="text-muted mb-0">
            Sem jogadores elegíveis nesse recorte.
          </p>
          <RankingBarChart v-else :players="currentRanking.players" :value-suffix="activeRankingSuffix" />
        </div>
      </section>

      <!-- Comparador -->
      <section class="surface-card stats-section-card">
        <div class="surface-card-body">
          <div class="section-toolbar">
            <div>
              <p class="stats-section-kicker">Comparativo</p>
              <h2 class="section-title mb-0">Compare jogadores</h2>
            </div>
          </div>

          <div class="stats-compare-picker">
            <div class="search-wrap stats-compare-search">
              <input
                v-model="playerSearch"
                type="text"
                class="search-input"
                placeholder="Buscar jogador para comparar (min. 2, max. 4)"
                @focus="isSearchOpen = true"
              />
              <ul v-if="isSearchOpen && filteredPlayers.length > 0" class="stats-compare-suggestions">
                <li v-for="player in filteredPlayers" :key="player.id" @click="addPlayer(player.id)">
                  {{ player.name }} <span class="text-muted">({{ player.nickname }})</span>
                </li>
              </ul>
            </div>

            <div class="stats-compare-chips">
              <span v-for="id in selectedPlayerIds" :key="id" class="stats-chip">
                {{ playerLabel(id) }}
                <button type="button" @click="removePlayer(id)" aria-label="Remover">
                  <i class="bi bi-x"></i>
                </button>
              </span>
              <span v-if="selectedPlayerIds.length === 0" class="text-muted small">Nenhum jogador selecionado ainda.</span>
            </div>
          </div>

          <div v-if="isLoadingCompare" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="selectedPlayerIds.length < 2" class="text-muted mb-0">
            Selecione pelo menos 2 jogadores para comparar.
          </p>
          <ComparisonRadarChart v-else-if="compareEntries.length > 0" :entries="compareEntries" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useSEO } from '../composables/useSEO'
import { PlayerService } from '../services/playerService'
import { RankingService } from '../services/rankingService'
import { StatisticsService } from '../services/statisticsService'
import type { ComparePlayerEntry, DashboardOverview, EvolutionPoint, Player, Ranking, StatisticsFilters } from '../types'
import logo from '../assets/logo-red-devils.png'
import EvolutionChart from '../components/charts/EvolutionChart.vue'
import RankingBarChart from '../components/charts/RankingBarChart.vue'
import ComparisonRadarChart from '../components/charts/ComparisonRadarChart.vue'

const { updateSEO } = useSEO()

const division = ref<'all' | 'quinta' | 'sabado'>('all')
const divisionOptions = [
  { value: 'all' as const, label: 'Todas' },
  { value: 'quinta' as const, label: 'Quinta' },
  { value: 'sabado' as const, label: 'Sábado' }
]
const filters = computed<StatisticsFilters>(() => (division.value === 'all' ? {} : { division: division.value }))

const formatDec = (value?: number | null) => (value != null ? value.toFixed(2).replace('.', ',') : '-')
const initials = (name: string) => name.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase()

// --- Dashboard ---
const dashboard = ref<DashboardOverview | null>(null)
const isLoadingDashboard = ref(false)
const errorDashboard = ref('')

const fetchDashboard = async () => {
  isLoadingDashboard.value = true
  errorDashboard.value = ''
  try {
    dashboard.value = await StatisticsService.getDashboard(filters.value)
  } catch (error) {
    console.error(error)
    errorDashboard.value = 'Não foi possível carregar a visão geral.'
  } finally {
    isLoadingDashboard.value = false
  }
}

// --- Evolução ---
const evolutionPoints = ref<EvolutionPoint[]>([])
const isLoadingEvolution = ref(false)

const fetchEvolution = async () => {
  isLoadingEvolution.value = true
  try {
    evolutionPoints.value = await StatisticsService.getEvolution('month', filters.value)
  } catch (error) {
    console.error(error)
    evolutionPoints.value = []
  } finally {
    isLoadingEvolution.value = false
  }
}

// --- Rankings ---
const rankingCategories = [
  { value: 'goals' as const, label: 'Gols', suffix: '' },
  { value: 'assists' as const, label: 'Assistências', suffix: '' },
  { value: 'wins' as const, label: 'Vitórias', suffix: '' },
  { value: 'win-rate' as const, label: 'Aproveitamento', suffix: '%' },
  { value: 'goalkeepers' as const, label: 'Goleiros', suffix: '/jogo' }
]
const rankingType = ref<(typeof rankingCategories)[number]['value']>('goals')
const currentRanking = ref<Ranking | null>(null)
const isLoadingRanking = ref(false)

const activeRankingLabel = computed(() => currentRanking.value?.type ?? '')
const activeRankingSuffix = computed(() => rankingCategories.find((cat) => cat.value === rankingType.value)?.suffix ?? '')

const fetchRanking = async () => {
  isLoadingRanking.value = true
  try {
    currentRanking.value = await RankingService.getFullRanking(rankingType.value, 8, filters.value)
  } catch (error) {
    console.error(error)
    currentRanking.value = null
  } finally {
    isLoadingRanking.value = false
  }
}

// --- Comparador ---
const allPlayers = ref<Player[]>([])
const playerSearch = ref('')
const isSearchOpen = ref(false)
const selectedPlayerIds = ref<number[]>([])
const compareEntries = ref<ComparePlayerEntry[]>([])
const isLoadingCompare = ref(false)

const filteredPlayers = computed(() => {
  const q = playerSearch.value.trim().toLowerCase()
  if (!q) return []
  return allPlayers.value
    .filter((player) => !selectedPlayerIds.value.includes(player.id))
    .filter((player) => `${player.name} ${player.nickname}`.toLowerCase().includes(q))
    .slice(0, 6)
})

const playerLabel = (id: number) => {
  const player = allPlayers.value.find((item) => item.id === id)
  return player ? (player.nickname || player.name) : `#${id}`
}

const addPlayer = (id: number) => {
  if (selectedPlayerIds.value.length >= 4 || selectedPlayerIds.value.includes(id)) return
  selectedPlayerIds.value.push(id)
  playerSearch.value = ''
  isSearchOpen.value = false
}

const removePlayer = (id: number) => {
  selectedPlayerIds.value = selectedPlayerIds.value.filter((item) => item !== id)
}

const fetchCompare = async () => {
  if (selectedPlayerIds.value.length < 2) {
    compareEntries.value = []
    return
  }
  isLoadingCompare.value = true
  try {
    compareEntries.value = await StatisticsService.comparePlayers(selectedPlayerIds.value, filters.value)
  } catch (error) {
    console.error(error)
    compareEntries.value = []
  } finally {
    isLoadingCompare.value = false
  }
}

watch(division, () => {
  fetchDashboard()
  fetchEvolution()
  fetchRanking()
  fetchCompare()
})
watch(rankingType, fetchRanking)
watch(selectedPlayerIds, fetchCompare, { deep: true })

onMounted(async () => {
  updateSEO({
    title: 'Estatísticas - Red Devils',
    description: 'Evolução, rankings e comparação de jogadores do Red Devils.'
  })

  fetchDashboard()
  fetchEvolution()
  fetchRanking()

  try {
    allPlayers.value = await PlayerService.getAllPlayers()
  } catch (error) {
    console.error(error)
  }
})
</script>
