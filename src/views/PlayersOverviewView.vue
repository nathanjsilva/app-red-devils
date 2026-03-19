<template>
  <div class="overview-page">
    <div class="container py-4 py-lg-5">
      <div class="text-center mb-4 mb-lg-5">
        <img :src="logo" alt="Red Devils" class="logo-img mb-3" />
        <h1 class="fw-bold text-red display-6">Resumo dos Jogadores</h1>
        <p class="text-muted mb-4">Visao publica consolidada da temporada {{ overview?.reference_year ?? 'atual' }}</p>

        <div v-if="overview" class="overview-metrics">
          <div class="metric-pill">
            <span class="metric-label">Ano de referencia</span>
            <strong>{{ overview.reference_year }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Peladas no ano</span>
            <strong>{{ overview.total_peladas_in_year }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Minimo p/ ranking</span>
            <strong>{{ overview.minimum_matches_for_ranking }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Jogadores listados</span>
            <strong>{{ filteredPlayers.length }}</strong>
          </div>
        </div>
      </div>

      <div class="toolbar-card mb-4">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-lg-6">
            <label class="form-label">Buscar jogador</label>
            <input
              v-model="search"
              type="text"
              class="form-control"
              placeholder="Digite nome ou apelido"
            />
          </div>
          <div class="col-6 col-lg-3">
            <label class="form-label">Posicao</label>
            <select v-model="positionFilter" class="form-select">
              <option value="all">Todos</option>
              <option value="linha">Linha</option>
              <option value="goleiro">Goleiro</option>
            </select>
          </div>
          <div class="col-6 col-lg-3">
            <label class="form-label">Ranking</label>
            <select v-model="eligibilityFilter" class="form-select">
              <option value="all">Todos</option>
              <option value="eligible">Elegiveis</option>
              <option value="not_eligible">Nao elegiveis</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-red-devils" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-3 text-muted">Carregando overview dos jogadores...</p>
      </div>

      <div v-else-if="error" class="alert alert-warning text-center">
        <h4 class="alert-heading">Nao foi possivel carregar os dados</h4>
        <p class="mb-3">{{ error }}</p>
        <button class="btn btn-outline-warning" @click="fetchOverview">Tentar novamente</button>
      </div>

      <div v-else-if="filteredPlayers.length === 0" class="alert alert-info text-center">
        Nenhum jogador encontrado com os filtros atuais.
      </div>

      <div v-else class="table-shell">
        <div class="table-responsive">
          <table class="table table-overview align-middle mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Apelido</th>
                <th>Jogos</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in filteredPlayers"
                :key="entry.player.id"
                class="clickable-row"
                @click="openPlayerModal(entry)"
              >
                <td class="player-name-col">{{ entry.player.name }}</td>
                <td>{{ entry.player.nickname }}</td>
                <td>{{ entry.statistics.total_matches }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="selectedPlayer" class="modal-backdrop-custom" @click.self="closePlayerModal">
        <div class="player-modal-card">
          <div class="player-modal-header">
            <div>
              <h4 class="mb-1">{{ selectedPlayer.player.name }}</h4>
              <p class="mb-0 text-white-50">
                {{ selectedPlayer.player.nickname }} · {{ selectedPlayer.player.position }}
              </p>
            </div>
            <button class="close-modal-btn" @click="closePlayerModal" aria-label="Fechar">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="player-modal-body">
            <div class="modal-stats-grid">
              <div class="modal-stat">
                <span>Jogos</span>
                <strong>{{ selectedPlayer.statistics.total_matches }}</strong>
              </div>
              <div class="modal-stat">
                <span>Vitorias</span>
                <strong>{{ selectedPlayer.statistics.total_wins }}</strong>
              </div>
              <div class="modal-stat">
                <span>Gols</span>
                <strong>{{ selectedPlayer.statistics.total_goals }}</strong>
              </div>
              <div class="modal-stat">
                <span>Assistencias</span>
                <strong>{{ selectedPlayer.statistics.total_assists }}</strong>
              </div>
              <div class="modal-stat">
                <span>Media participacao</span>
                <strong>{{ formatDecimal(selectedPlayer.statistics.avg_goal_participation) }}</strong>
              </div>
              <div class="modal-stat">
                <span>Media gols</span>
                <strong>{{ formatDecimal(selectedPlayer.statistics.avg_goals_per_match) }}</strong>
              </div>
              <div class="modal-stat">
                <span>Media assistencias</span>
                <strong>{{ formatDecimal(selectedPlayer.statistics.avg_assists_per_match) }}</strong>
              </div>
              <div class="modal-stat">
                <span>Gols sofridos</span>
                <strong>{{ selectedPlayer.statistics.total_goals_conceded ?? '—' }}</strong>
              </div>
              <div class="modal-stat">
                <span>Aproveitamento</span>
                <strong>{{ formatWinRate(selectedPlayer.statistics.total_wins, selectedPlayer.statistics.total_matches) }}</strong>
              </div>
              <div class="modal-stat">
                <span>Ranking</span>
                <strong>{{ selectedPlayer.statistics.eligible_for_ranking ? 'Elegivel' : 'Nao elegivel' }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useSEO } from '../composables/useSEO'
import { StatisticsService } from '../services/statisticsService'
import type { PlayerOverviewItem, PlayersOverviewResponse } from '../types'
import logo from '../assets/logo-red-devils.png'

const { updateSEO } = useSEO()

const overview = ref<PlayersOverviewResponse | null>(null)
const isLoading = ref(false)
const error = ref('')
const search = ref('')
const positionFilter = ref<'all' | 'linha' | 'goleiro'>('all')
const eligibilityFilter = ref<'all' | 'eligible' | 'not_eligible'>('all')
const selectedPlayer = ref<PlayerOverviewItem | null>(null)

const filteredPlayers = computed(() => {
  const base = overview.value?.players || []
  const normalizedSearch = search.value.trim().toLowerCase()

  return base
    .filter((entry) => {
      if (positionFilter.value !== 'all' && entry.player.position !== positionFilter.value) {
        return false
      }

      if (eligibilityFilter.value === 'eligible' && !entry.statistics.eligible_for_ranking) {
        return false
      }

      if (eligibilityFilter.value === 'not_eligible' && entry.statistics.eligible_for_ranking) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const haystack = `${entry.player.name} ${entry.player.nickname}`.toLowerCase()
      return haystack.includes(normalizedSearch)
    })
    .sort((a: PlayerOverviewItem, b: PlayerOverviewItem) => {
      if (a.statistics.eligible_for_ranking !== b.statistics.eligible_for_ranking) {
        return a.statistics.eligible_for_ranking ? -1 : 1
      }

      return b.statistics.total_matches - a.statistics.total_matches
    })
})

const formatDecimal = (value: number) => value.toFixed(2).replace('.', ',')

const formatWinRate = (wins: number, matches: number) => {
  if (!matches) return '0%'
  return `${((wins / matches) * 100).toFixed(0)}%`
}

const openPlayerModal = (entry: PlayerOverviewItem) => {
  selectedPlayer.value = entry
}

const closePlayerModal = () => {
  selectedPlayer.value = null
}

const fetchOverview = async () => {
  isLoading.value = true
  error.value = ''

  try {
    overview.value = await StatisticsService.getPlayersOverview()
  } catch (err: any) {
    console.error('Erro ao carregar overview dos jogadores:', err)
    error.value = err?.response?.data?.message || 'Falha ao carregar o overview dos jogadores.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  updateSEO({
    title: 'Jogadores - Red Devils',
    description: 'Acompanhe o overview publico de desempenho dos jogadores do Red Devils.'
  })

  await fetchOverview()
})
</script>

<style scoped>
.overview-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(177, 19, 19, 0.08), transparent 35%),
    linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
}

.logo-img {
  height: 72px;
}

.text-red {
  color: var(--red-devils);
}

.overview-metrics {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.metric-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 180px;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid rgba(177, 19, 19, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.metric-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.toolbar-card {
  padding: 1.25rem;
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.table-shell {
  background: #fff;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(177, 19, 19, 0.08);
}

.table-overview {
  min-width: 640px;
  margin: 0;
}

.table-overview thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: linear-gradient(135deg, var(--red-devils) 0%, #2d0606 100%);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border: none;
  padding: 0.95rem 0.85rem;
  white-space: nowrap;
}

.table-overview tbody td {
  padding: 1rem 0.85rem;
  border-color: rgba(0, 0, 0, 0.06);
  white-space: nowrap;
  vertical-align: middle;
}

.table-overview tbody tr:nth-child(even) {
  background: rgba(177, 19, 19, 0.03);
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.clickable-row:hover {
  background: rgba(177, 19, 19, 0.08);
}

.player-name-col {
  font-weight: 700;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 16, 20, 0.56);
  backdrop-filter: blur(6px);
}

.player-modal-card {
  width: min(100%, 860px);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
}

.player-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 1rem;
  background: linear-gradient(135deg, var(--red-devils) 0%, #2d0606 100%);
  color: #fff;
}

.close-modal-btn {
  border: 0;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: grid;
  place-items: center;
}

.close-modal-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.player-modal-body {
  padding: 1.25rem;
}

.modal-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.modal-stat {
  padding: 1rem;
  border-radius: 1rem;
  background: #faf7f7;
  border: 1px solid rgba(177, 19, 19, 0.08);
}

.modal-stat span {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.35rem;
}

.modal-stat strong {
  font-size: 1.05rem;
  color: #1f2937;
}

@media (max-width: 767px) {
  .overview-metrics {
    justify-content: stretch;
  }

  .metric-pill {
    min-width: 0;
    width: 100%;
  }

  .table-overview {
    min-width: 520px;
  }

  .player-modal-header {
    padding: 1rem;
  }

  .player-modal-body {
    padding: 1rem;
  }

  .modal-stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
