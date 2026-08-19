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

      <!-- Peladas por mês -->
      <section class="surface-card stats-section-card">
        <div class="surface-card-body">
          <div class="section-toolbar">
            <div>
              <p class="stats-section-kicker">Frequência</p>
              <h2 class="section-title mb-0">Peladas por mês</h2>
            </div>
          </div>

          <div v-if="isLoadingPeladasPerMonth" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="peladasPerMonth.length === 0" class="text-muted mb-0">Sem dados suficientes para esse período.</p>
          <PeladasPerMonthChart v-else :points="peladasPerMonth" />
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

      <!-- Presença -->
      <section class="surface-card stats-section-card">
        <div class="surface-card-body">
          <div class="section-toolbar">
            <div>
              <p class="stats-section-kicker">Frequência</p>
              <h2 class="section-title mb-0">Presença por jogador</h2>
            </div>
          </div>

          <div v-if="isLoadingPresence" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="!presenceRanking || presenceRanking.players.length === 0" class="text-muted mb-0">
            Sem jogadores elegíveis nesse recorte.
          </p>
          <RankingBarChart v-else :players="presenceRanking.players" value-suffix=" peladas" />
        </div>
      </section>

      <!-- Destaques por pelada -->
      <section class="surface-card stats-section-card">
        <div class="surface-card-body">
          <div class="section-toolbar">
            <div>
              <p class="stats-section-kicker">Destaques por pelada</p>
              <h2 class="section-title mb-0">Quem mais foi artilheiro da pelada</h2>
            </div>
          </div>

          <div v-if="isLoadingTopScorerFrequency" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="!topScorerFrequencyRanking || topScorerFrequencyRanking.players.length === 0" class="text-muted mb-0">
            Sem jogadores elegíveis nesse recorte.
          </p>
          <RankingBarChart v-else :players="topScorerFrequencyRanking.players" value-suffix=" vezes" />
        </div>
      </section>

      <section class="surface-card stats-section-card">
        <div class="surface-card-body">
          <div class="section-toolbar">
            <div>
              <p class="stats-section-kicker">Destaques por pelada</p>
              <h2 class="section-title mb-0">Quem mais foi garçom da pelada</h2>
            </div>
          </div>

          <div v-if="isLoadingTopAssisterFrequency" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="!topAssisterFrequencyRanking || topAssisterFrequencyRanking.players.length === 0" class="text-muted mb-0">
            Sem jogadores elegíveis nesse recorte.
          </p>
          <RankingBarChart v-else :players="topAssisterFrequencyRanking.players" value-suffix=" vezes" />
        </div>
      </section>

      <!-- Goleiros -->
      <section class="surface-card stats-section-card">
        <div class="surface-card-body">
          <div class="section-toolbar">
            <div>
              <p class="stats-section-kicker">Detalhe</p>
              <h2 class="section-title mb-0">Goleiros</h2>
            </div>
          </div>

          <div v-if="isLoadingGoalkeepers" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="goalkeepers.length === 0" class="text-muted mb-0">
            Nenhum goleiro elegível nesse recorte.
          </p>
          <div v-else class="table-responsive">
            <table class="data-table stack-mobile">
              <thead>
                <tr>
                  <th>Goleiro</th>
                  <th>Jogos</th>
                  <th>Vitórias</th>
                  <th>Aproveitamento</th>
                  <th>Gols</th>
                  <th>Assistências</th>
                  <th>Gols sofridos</th>
                  <th>Média/jogo</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="goalkeeper in goalkeepers"
                  :key="goalkeeper.player.id"
                  class="stats-goalkeeper-row"
                  @click="openGoalkeeperDetail(goalkeeper.player.id)"
                >
                  <td data-label="Goleiro">
                    <div class="fw-bold">{{ goalkeeper.player.name }}</div>
                  </td>
                  <td data-label="Jogos">{{ goalkeeper.matches }}</td>
                  <td data-label="Vitórias">{{ goalkeeper.wins }}</td>
                  <td data-label="Aproveitamento">{{ formatDec(goalkeeper.win_rate) }}%</td>
                  <td data-label="Gols">{{ goalkeeper.goals }}</td>
                  <td data-label="Assistências">{{ goalkeeper.assists }}</td>
                  <td data-label="Gols sofridos">{{ goalkeeper.goals_conceded }}</td>
                  <td data-label="Média/jogo">{{ formatDec(goalkeeper.avg_goals_conceded_per_match) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Transition name="modal-fade">
        <div v-if="goalkeeperDetail" class="modal-veil" @click.self="closeGoalkeeperDetail">
          <div class="modal-card" role="dialog" aria-modal="true">
            <div class="modal-head">
              <div class="modal-head-text">
                <h2>{{ goalkeeperDetail.player.name }}</h2>
              </div>
              <button class="modal-close" @click="closeGoalkeeperDetail" aria-label="Fechar">
                <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
            </div>

            <div class="modal-section-label">Estatísticas da temporada</div>

            <div class="modal-body">
              <div class="stat-grid">
                <div class="stat-card highlight">
                  <span class="stat-label">Jogos</span>
                  <strong class="stat-val">{{ goalkeeperDetail.total_matches }}</strong>
                </div>
                <div class="stat-card highlight">
                  <span class="stat-label">Vitórias</span>
                  <strong class="stat-val">{{ goalkeeperDetail.total_wins }}</strong>
                </div>
                <div class="stat-card highlight">
                  <span class="stat-label">Aproveitamento</span>
                  <strong class="stat-val">{{ formatDec(goalkeeperDetail.win_rate) }}%</strong>
                </div>
                <div class="stat-card highlight">
                  <span class="stat-label">Assiduidade</span>
                  <strong class="stat-val">{{ formatDec(goalkeeperDetail.attendance_rate) }}%</strong>
                </div>

                <div class="stat-card">
                  <span class="stat-label">Melhor sequência sem perder</span>
                  <strong class="stat-val">{{ goalkeeperDetail.best_unbeaten_streak }}</strong>
                </div>
                <div class="stat-card" v-if="goalkeeperDetail.best_duo">
                  <span class="stat-label">Melhor dupla</span>
                  <strong class="stat-val">{{ goalkeeperDetail.best_duo.players.map(p => p.name).join(' + ') }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

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
                  {{ player.name }}
                </li>
              </ul>
            </div>

            <div class="stats-compare-chips">
              <span v-for="id in selectedPlayerIds" :key="id" class="stats-chip">
                <router-link :to="`/players/${id}`" class="stats-chip-link">{{ playerLabel(id) }}</router-link>
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
import type { ComparePlayerEntry, DashboardOverview, EvolutionPoint, GoalkeeperDetail, GoalkeeperRankingItem, PeladasPerMonthPoint, Player, Ranking, StatisticsFilters } from '../types'
import logo from '../assets/logo-red-devils.png'
import EvolutionChart from '../components/charts/EvolutionChart.vue'
import PeladasPerMonthChart from '../components/charts/PeladasPerMonthChart.vue'
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
  { value: 'goal-participations' as const, label: 'Participações', suffix: '' },
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

// --- Presença por jogador ---
const presenceRanking = ref<Ranking | null>(null)
const isLoadingPresence = ref(false)

const fetchPresence = async () => {
  isLoadingPresence.value = true
  try {
    presenceRanking.value = await RankingService.getFullRanking('appearances', 8, filters.value)
  } catch (error) {
    console.error(error)
    presenceRanking.value = null
  } finally {
    isLoadingPresence.value = false
  }
}

// --- Destaques por pelada (artilheiro / garçom) ---
const topScorerFrequencyRanking = ref<Ranking | null>(null)
const isLoadingTopScorerFrequency = ref(false)

const fetchTopScorerFrequency = async () => {
  isLoadingTopScorerFrequency.value = true
  try {
    topScorerFrequencyRanking.value = await RankingService.getFullRanking('top-scorer-frequency', 8, filters.value)
  } catch (error) {
    console.error(error)
    topScorerFrequencyRanking.value = null
  } finally {
    isLoadingTopScorerFrequency.value = false
  }
}

const topAssisterFrequencyRanking = ref<Ranking | null>(null)
const isLoadingTopAssisterFrequency = ref(false)

const fetchTopAssisterFrequency = async () => {
  isLoadingTopAssisterFrequency.value = true
  try {
    topAssisterFrequencyRanking.value = await RankingService.getFullRanking('top-assister-frequency', 8, filters.value)
  } catch (error) {
    console.error(error)
    topAssisterFrequencyRanking.value = null
  } finally {
    isLoadingTopAssisterFrequency.value = false
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
  return player ? player.name : `Jogador ${id}`
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

// --- Peladas por mês ---
const peladasPerMonth = ref<PeladasPerMonthPoint[]>([])
const isLoadingPeladasPerMonth = ref(false)

const fetchPeladasPerMonth = async () => {
  isLoadingPeladasPerMonth.value = true
  try {
    peladasPerMonth.value = await StatisticsService.getPeladasPerMonth(filters.value)
  } catch (error) {
    console.error(error)
    peladasPerMonth.value = []
  } finally {
    isLoadingPeladasPerMonth.value = false
  }
}

// --- Goleiros ---
const goalkeepers = ref<GoalkeeperRankingItem[]>([])
const isLoadingGoalkeepers = ref(false)
const goalkeeperDetail = ref<GoalkeeperDetail | null>(null)

const fetchGoalkeepers = async () => {
  isLoadingGoalkeepers.value = true
  try {
    goalkeepers.value = await StatisticsService.getGoalkeepers(filters.value)
  } catch (error) {
    console.error(error)
    goalkeepers.value = []
  } finally {
    isLoadingGoalkeepers.value = false
  }
}

const openGoalkeeperDetail = async (playerId: number) => {
  try {
    goalkeeperDetail.value = await StatisticsService.getGoalkeeperDetail(playerId, filters.value)
  } catch (error) {
    console.error(error)
  }
}

const closeGoalkeeperDetail = () => {
  goalkeeperDetail.value = null
}

watch(division, () => {
  fetchDashboard()
  fetchEvolution()
  fetchPeladasPerMonth()
  fetchRanking()
  fetchPresence()
  fetchTopScorerFrequency()
  fetchTopAssisterFrequency()
  fetchGoalkeepers()
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
  fetchPeladasPerMonth()
  fetchRanking()
  fetchPresence()
  fetchTopScorerFrequency()
  fetchTopAssisterFrequency()
  fetchGoalkeepers()

  try {
    allPlayers.value = await PlayerService.getAllPlayers()
  } catch (error) {
    console.error(error)
  }
})
</script>
