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
          <StatTile
            label="Peladas"
            :value="dashboard.total_peladas"
            :hint="`${dashboard.total_players} jogadores participantes`"
          />
          <StatTile
            label="Gols"
            :value="dashboard.total_goals"
            :hint="`Média ${formatDec(dashboard.avg_goals_per_pelada)} por pelada`"
            help="Média de gols por pelada = total de gols ÷ total de peladas do período."
          />
          <StatTile
            label="Assistências"
            :value="dashboard.total_assists"
            :hint="`Média ${formatDec(dashboard.avg_assists_per_pelada)} por pelada`"
            help="Média de assistências por pelada = total de assistências ÷ total de peladas do período."
          />
          <StatTile
            label="Participações em gols"
            :value="dashboard.total_goal_participations"
            hint="Gols + assistências somados"
            help="Participações em gols = total de gols + total de assistências do período."
          />
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
              <div class="section-title-with-info">
                <h2 class="section-title mb-0">Gols e assistências por mês</h2>
                <InfoTooltip
                  text="Soma de gols e assistências de todos os jogadores, agrupada por mês das peladas dentro do período filtrado."
                  label="Gols e assistências por mês"
                />
              </div>
            </div>
          </div>

          <div v-if="isLoadingEvolution" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="evolutionError" class="text-muted mb-0">
            Não foi possível carregar a evolução. <button class="retry-btn" @click="fetchEvolution">Tentar novamente</button>
          </p>
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
              <div class="section-title-with-info">
                <h2 class="section-title mb-0">Peladas por mês</h2>
                <InfoTooltip
                  text="Quantidade de peladas realizadas em cada mês, dentro do período filtrado."
                  label="Peladas por mês"
                />
              </div>
            </div>
          </div>

          <div v-if="isLoadingPeladasPerMonth" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="peladasPerMonthError" class="text-muted mb-0">
            Não foi possível carregar as peladas por mês. <button class="retry-btn" @click="fetchPeladasPerMonth">Tentar novamente</button>
          </p>
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
              <div class="section-title-with-info">
                <h2 class="section-title mb-0">{{ activeRankingLabel }}</h2>
                <InfoTooltip :text="activeRankingHelp" :label="activeRankingLabel" />
              </div>
            </div>
            <div v-if="!isMobile" class="seg-control">
              <button
                v-for="cat in rankingCategories"
                :key="cat.value"
                :class="['seg-btn', { active: rankingType === cat.value }]"
                @click="rankingType = cat.value"
              >{{ cat.label }}</button>
            </div>
            <SearchableSelect
              v-else
              :model-value="rankingType"
              :options="rankingCategories.map((cat) => ({ value: cat.value, label: cat.label }))"
              class="stats-ranking-select"
              @update:model-value="(value) => value && (rankingType = value)"
            />
          </div>

          <div v-if="isLoadingRanking" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="rankingError" class="text-muted mb-0">
            Não foi possível carregar o ranking. <button class="retry-btn" @click="fetchRanking">Tentar novamente</button>
          </p>
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
              <div class="section-title-with-info">
                <h2 class="section-title mb-0">Presença por jogador</h2>
                <InfoTooltip
                  text="Quantidade de peladas em que cada jogador participou no período. Sem mínimo de partidas — é a própria contagem de presença."
                  label="Presença por jogador"
                />
              </div>
            </div>
          </div>

          <div v-if="isLoadingPresence" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="presenceError" class="text-muted mb-0">
            Não foi possível carregar a presença. <button class="retry-btn" @click="fetchPresence">Tentar novamente</button>
          </p>
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
              <div class="section-title-with-info">
                <h2 class="section-title mb-0">Quem mais foi artilheiro da pelada</h2>
                <InfoTooltip
                  text="Conta quantas vezes o jogador teve o maior número de gols de uma pelada específica. Se dois ou mais jogadores empatam no maior número de gols de uma pelada, todos contam como artilheiro daquele dia."
                  label="Quem mais foi artilheiro da pelada"
                />
              </div>
            </div>
          </div>

          <div v-if="isLoadingTopScorerFrequency" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="topScorerFrequencyError" class="text-muted mb-0">
            Não foi possível carregar. <button class="retry-btn" @click="fetchTopScorerFrequency">Tentar novamente</button>
          </p>
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
              <div class="section-title-with-info">
                <h2 class="section-title mb-0">Quem mais foi garçom da pelada</h2>
                <InfoTooltip
                  text="Conta quantas vezes o jogador teve o maior número de assistências de uma pelada específica. Se dois ou mais jogadores empatam no maior número de assistências de uma pelada, todos contam como garçom daquele dia."
                  label="Quem mais foi garçom da pelada"
                />
              </div>
            </div>
          </div>

          <div v-if="isLoadingTopAssisterFrequency" class="state-box">
            <span class="spinner"></span>
          </div>
          <p v-else-if="topAssisterFrequencyError" class="text-muted mb-0">
            Não foi possível carregar. <button class="retry-btn" @click="fetchTopAssisterFrequency">Tentar novamente</button>
          </p>
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
          <p v-else-if="goalkeepersError" class="text-muted mb-0">
            Não foi possível carregar os goleiros. <button class="retry-btn" @click="fetchGoalkeepers">Tentar novamente</button>
          </p>
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
              <div class="metric-grid">
                <StatTile label="Jogos" :value="goalkeeperDetail.total_matches" highlight />
                <StatTile label="Vitórias" :value="goalkeeperDetail.total_wins" highlight />
                <StatTile
                  label="Aproveitamento"
                  :value="`${formatDec(goalkeeperDetail.win_rate)}%`"
                  help="Vitórias ÷ partidas disputadas × 100."
                  highlight
                />
                <StatTile
                  label="Assiduidade"
                  :value="`${formatDec(goalkeeperDetail.attendance_rate)}%`"
                  help="Partidas disputadas ÷ peladas realizadas desde a primeira partida dele no período × 100."
                  highlight
                />

                <StatTile label="Gols sofridos" :value="goalkeeperDetail.goals_conceded ?? '-'" />
                <StatTile label="Gols" :value="goalkeeperDetail.total_goals" />
                <StatTile label="Assistências" :value="goalkeeperDetail.total_assists" />
                <StatTile
                  label="Participações em gols"
                  :value="goalkeeperDetail.total_goal_participations"
                  help="Participações em gols = gols + assistências do goleiro no período."
                />

                <StatTile label="Melhor sequência sem perder" :value="goalkeeperDetail.best_unbeaten_streak" />
                <StatTile
                  v-if="goalkeeperDetail.best_duo"
                  label="Melhor dupla"
                  :value="goalkeeperDetail.best_duo.players.map(p => p.name).join(' + ')"
                  help="Dupla com o melhor aproveitamento jogando junta no mesmo time, entre as que atingiram o mínimo de partidas juntas exigido no período."
                  wide
                />
              </div>

              <router-link
                :to="`/players/${goalkeeperDetail.player.id}`"
                class="btn btn-outline-secondary w-100 mt-3"
                @click="closeGoalkeeperDetail"
              >
                Ver perfil completo
              </router-link>
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
              <div class="section-title-with-info">
                <h2 class="section-title mb-0">Compare jogadores</h2>
                <InfoTooltip
                  text="Cada eixo é normalizado de 0 a 100% em relação ao maior valor entre os jogadores selecionados nesta comparação — não é uma escala absoluta, serve pra comparar métricas de grandezas diferentes (gols, assistências, aproveitamento etc.) no mesmo gráfico."
                  label="Compare jogadores"
                />
              </div>
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
          <p v-else-if="compareError" class="text-muted mb-0">
            Não foi possível comparar os jogadores. <button class="retry-btn" @click="fetchCompare">Tentar novamente</button>
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
import StatTile from '../components/ui/StatTile.vue'
import SearchableSelect from '../components/ui/SearchableSelect.vue'
import InfoTooltip from '../components/ui/InfoTooltip.vue'
import { useResponsive } from '../composables/useResponsive'

const { updateSEO } = useSEO()
const { isMobile } = useResponsive()

const division = ref<'quinta' | 'sabado'>('quinta')
const divisionOptions = [
  { value: 'quinta' as const, label: 'Quinta' },
  { value: 'sabado' as const, label: 'Sábado' }
]
const filters = computed<StatisticsFilters>(() => ({ division: division.value }))

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
const evolutionError = ref(false)

const fetchEvolution = async () => {
  isLoadingEvolution.value = true
  evolutionError.value = false
  try {
    evolutionPoints.value = await StatisticsService.getEvolution('month', filters.value)
  } catch (error) {
    console.error(error)
    evolutionPoints.value = []
    evolutionError.value = true
  } finally {
    isLoadingEvolution.value = false
  }
}

// --- Rankings ---
const rankingCategories = [
  {
    value: 'goals' as const,
    label: 'Gols',
    suffix: '',
    help: 'Total de gols marcados no período, somado por jogador. Só entram jogadores que atingiram o mínimo de partidas do período.'
  },
  {
    value: 'assists' as const,
    label: 'Assistências',
    suffix: '',
    help: 'Total de assistências no período, somado por jogador. Só entram jogadores que atingiram o mínimo de partidas do período.'
  },
  {
    value: 'goal-participations' as const,
    label: 'Participações em Gols',
    suffix: '',
    help: 'Gols + assistências de cada jogador no período. Só entram jogadores que atingiram o mínimo de partidas do período.'
  },
  {
    value: 'wins' as const,
    label: 'Vitórias',
    suffix: '',
    help: 'Total de vitórias no período. Só entram jogadores que atingiram o mínimo de partidas do período.'
  },
  {
    value: 'win-rate' as const,
    label: 'Aproveitamento',
    suffix: '%',
    help: 'Vitórias ÷ partidas disputadas × 100. Só entram jogadores que atingiram o mínimo de partidas do período.'
  },
  {
    value: 'goalkeepers' as const,
    label: 'Goleiros',
    suffix: '/jogo',
    help: 'Média de gols sofridos por partida (quanto menor, melhor). Só entram goleiros que atingiram o mínimo de partidas do período.'
  }
]
const rankingType = ref<(typeof rankingCategories)[number]['value']>('goals')
const currentRanking = ref<Ranking | null>(null)
const isLoadingRanking = ref(false)
const rankingError = ref(false)

const activeRankingLabel = computed(() => currentRanking.value?.type ?? '')
const activeRankingSuffix = computed(() => rankingCategories.find((cat) => cat.value === rankingType.value)?.suffix ?? '')
const activeRankingHelp = computed(() => rankingCategories.find((cat) => cat.value === rankingType.value)?.help ?? '')

const fetchRanking = async () => {
  isLoadingRanking.value = true
  rankingError.value = false
  try {
    currentRanking.value = await RankingService.getFullRanking(rankingType.value, 8, filters.value)
  } catch (error) {
    console.error(error)
    currentRanking.value = null
    rankingError.value = true
  } finally {
    isLoadingRanking.value = false
  }
}

// --- Presença por jogador ---
const presenceRanking = ref<Ranking | null>(null)
const isLoadingPresence = ref(false)
const presenceError = ref(false)

const fetchPresence = async () => {
  isLoadingPresence.value = true
  presenceError.value = false
  try {
    presenceRanking.value = await RankingService.getFullRanking('appearances', 8, filters.value)
  } catch (error) {
    console.error(error)
    presenceRanking.value = null
    presenceError.value = true
  } finally {
    isLoadingPresence.value = false
  }
}

// --- Destaques por pelada (artilheiro / garçom) ---
const topScorerFrequencyRanking = ref<Ranking | null>(null)
const isLoadingTopScorerFrequency = ref(false)
const topScorerFrequencyError = ref(false)

const fetchTopScorerFrequency = async () => {
  isLoadingTopScorerFrequency.value = true
  topScorerFrequencyError.value = false
  try {
    topScorerFrequencyRanking.value = await RankingService.getFullRanking('top-scorer-frequency', 8, filters.value)
  } catch (error) {
    console.error(error)
    topScorerFrequencyRanking.value = null
    topScorerFrequencyError.value = true
  } finally {
    isLoadingTopScorerFrequency.value = false
  }
}

const topAssisterFrequencyRanking = ref<Ranking | null>(null)
const isLoadingTopAssisterFrequency = ref(false)
const topAssisterFrequencyError = ref(false)

const fetchTopAssisterFrequency = async () => {
  isLoadingTopAssisterFrequency.value = true
  topAssisterFrequencyError.value = false
  try {
    topAssisterFrequencyRanking.value = await RankingService.getFullRanking('top-assister-frequency', 8, filters.value)
  } catch (error) {
    console.error(error)
    topAssisterFrequencyRanking.value = null
    topAssisterFrequencyError.value = true
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
const compareError = ref(false)

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
  compareError.value = false
  try {
    compareEntries.value = await StatisticsService.comparePlayers(selectedPlayerIds.value, filters.value)
  } catch (error) {
    console.error(error)
    compareEntries.value = []
    compareError.value = true
  } finally {
    isLoadingCompare.value = false
  }
}

// --- Peladas por mês ---
const peladasPerMonth = ref<PeladasPerMonthPoint[]>([])
const isLoadingPeladasPerMonth = ref(false)
const peladasPerMonthError = ref(false)

const fetchPeladasPerMonth = async () => {
  isLoadingPeladasPerMonth.value = true
  peladasPerMonthError.value = false
  try {
    peladasPerMonth.value = await StatisticsService.getPeladasPerMonth(filters.value)
  } catch (error) {
    console.error(error)
    peladasPerMonth.value = []
    peladasPerMonthError.value = true
  } finally {
    isLoadingPeladasPerMonth.value = false
  }
}

// --- Goleiros ---
const goalkeepers = ref<GoalkeeperRankingItem[]>([])
const isLoadingGoalkeepers = ref(false)
const goalkeepersError = ref(false)
const goalkeeperDetail = ref<GoalkeeperDetail | null>(null)

const fetchGoalkeepers = async () => {
  isLoadingGoalkeepers.value = true
  goalkeepersError.value = false
  try {
    goalkeepers.value = await StatisticsService.getGoalkeepers(filters.value)
  } catch (error) {
    console.error(error)
    goalkeepers.value = []
    goalkeepersError.value = true
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
