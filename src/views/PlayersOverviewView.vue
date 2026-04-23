<template>
  <div class="overview-page">
    <header class="overview-hero">
      <div class="overview-hero-noise"></div>
      <div class="container overview-hero-inner">
        <div class="overview-hero-brand">
          <img :src="logo" alt="Red Devils" class="overview-hero-logo" />
          <div>
            <p class="overview-hero-kicker">Central de jogadores</p>
            <h1 class="overview-hero-title">Resumo completo da temporada</h1>
          </div>
        </div>

        <div v-if="overview" class="overview-stat-strip">
          <div class="overview-stat-card">
            <span class="overview-stat-label">Peladas no ano</span>
            <strong class="overview-stat-value">{{ overview.total_peladas_in_year }}</strong>
          </div>
          <div class="overview-stat-card">
            <span class="overview-stat-label">Minimo para ranking</span>
            <strong class="overview-stat-value">{{ overview.minimum_matches_for_ranking }}</strong>
          </div>
          <div class="overview-stat-card">
            <span class="overview-stat-label">Jogadores filtrados</span>
            <strong class="overview-stat-value">{{ filteredPlayers.length }}</strong>
          </div>
        </div>
      </div>
    </header>

    <main class="container overview-main">
      <section class="surface-card overview-toolbar-card">
        <div class="surface-card-body">
          <div class="overview-toolbar-header">
            <div>
              <p class="overview-section-kicker">Busca e filtros</p>
              <h2 class="section-title mb-1">Buscar jogadores</h2>
            </div>
          </div>

          <div class="toolbar">
            <div class="search-wrap">
              <svg class="search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M13 13l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input
                v-model="search"
                type="text"
                class="search-input"
                placeholder="Buscar por nome ou apelido"
              />
              <button v-if="search" class="search-clear" @click="search = ''" aria-label="Limpar busca">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div class="filters">
              <div class="filter-group">
                <label class="filter-label">Posicao</label>
                <div class="seg-control">
                  <button
                    v-for="opt in positionOptions"
                    :key="opt.value"
                    :class="['seg-btn', { active: positionFilter === opt.value }]"
                    @click="positionFilter = opt.value; currentPage = 1"
                  >{{ opt.label }}</button>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">Status no ranking</label>
                <div class="seg-control">
                  <button
                    v-for="opt in eligibilityOptions"
                    :key="opt.value"
                    :class="['seg-btn', { active: eligibilityFilter === opt.value }]"
                    @click="eligibilityFilter = opt.value; currentPage = 1"
                  >{{ opt.label }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div v-if="isLoading" class="state-box surface-card">
        <span class="spinner"></span>
        <p>Carregando jogadores...</p>
      </div>

      <div v-else-if="error" class="state-box surface-card state-error">
        <svg viewBox="0 0 24 24" fill="none" width="32" height="32" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="fetchOverview">Tentar novamente</button>
      </div>

      <div v-else-if="filteredPlayers.length === 0" class="state-box surface-card">
        <p>Nenhum jogador encontrado com os filtros atuais.</p>
      </div>

      <section v-else class="surface-card overview-table-card">
        <div class="surface-card-body overview-table-head">
          <div>
            <p class="overview-section-kicker">Tabela</p>
            <h2 class="section-title mb-1">Resumo dos jogadores</h2>
          </div>
        </div>

        <div class="table-shell">
          <div class="table-scroll">
            <table class="data-table">
              <colgroup>
                <col style="width:52px" />
                <col />
                <col />
                <col style="width:90px" />
                <col style="width:90px" />
                <col style="width:120px" />
              </colgroup>
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th>Nome</th>
                  <th>Apelido / Posicao</th>
                  <th class="col-num">Jogos</th>
                  <th class="col-num">Gols</th>
                  <th class="col-num">Ranking</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(entry, idx) in paginatedPlayers"
                  :key="entry.player.id"
                  class="data-row"
                  @click="openModal(entry)"
                >
                  <td class="col-rank">
                    <span class="rank-num">{{ (currentPage - 1) * pageSize + idx + 1 }}</span>
                  </td>
                  <td>
                    <div class="player-cell">
                      <span class="avatar" :style="{ background: avatarColor(entry.player.name) }">
                        {{ initials(entry.player.name) }}
                      </span>
                      <span class="player-name">{{ entry.player.name }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="nick-pos">
                      <span class="nick">{{ entry.player.nickname || '-' }}</span>
                      <span class="pos-badge" :class="entry.player.position">{{ entry.player.position }}</span>
                    </div>
                  </td>
                  <td class="col-num">{{ entry.statistics.total_matches }}</td>
                  <td class="col-num">{{ entry.statistics.total_goals }}</td>
                  <td class="col-num">
                    <span class="elig-badge" :class="entry.statistics.eligible_for_ranking ? 'yes' : 'no'">
                      {{ entry.statistics.eligible_for_ranking ? 'Elegivel' : 'Nao elegivel' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-bar">
            <span class="pag-info">
              {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredPlayers.length) }}
              de {{ filteredPlayers.length }}
            </span>

            <div class="pag-controls">
              <button class="pag-btn" :disabled="currentPage === 1" @click="currentPage--" aria-label="Pagina anterior">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>

              <button
                v-for="page in visiblePages"
                :key="page"
                :class="['pag-num', { active: page === currentPage, ellipsis: page === '...' }]"
                :disabled="page === '...'"
                @click="page !== '...' && (currentPage = Number(page))"
              >{{ page }}</button>

              <button class="pag-btn" :disabled="currentPage === totalPages" @click="currentPage++" aria-label="Proxima pagina">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>

            <div class="pag-size">
              <label class="filter-label">por pagina</label>
              <select v-model="pageSize" @change="currentPage = 1" class="pag-select">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Transition name="modal-fade">
      <div v-if="selectedPlayer" class="modal-veil" @click.self="closeModal">
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-head">
            <span class="modal-avatar" :style="{ background: avatarColor(selectedPlayer.player.name) }">
              {{ initials(selectedPlayer.player.name) }}
            </span>
            <div class="modal-head-text">
              <h2>{{ selectedPlayer.player.name }}</h2>
              <p>{{ selectedPlayer.player.nickname || 'Sem apelido' }} - {{ selectedPlayer.player.position }}</p>
            </div>
            <button class="modal-close" @click="closeModal" aria-label="Fechar">
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>

          <div class="modal-section-label">Estatisticas da temporada</div>

          <div class="modal-body">
            <div class="stat-grid">
              <div class="stat-card highlight">
                <span class="stat-label">Jogos</span>
                <strong class="stat-val">{{ selectedPlayer.statistics.total_matches }}</strong>
              </div>
              <div class="stat-card highlight">
                <span class="stat-label">Vitorias</span>
                <strong class="stat-val">{{ selectedPlayer.statistics.total_wins }}</strong>
              </div>
              <div class="stat-card highlight">
                <span class="stat-label">Gols</span>
                <strong class="stat-val">{{ selectedPlayer.statistics.total_goals }}</strong>
              </div>
              <div class="stat-card highlight">
                <span class="stat-label">Assistencias</span>
                <strong class="stat-val">{{ selectedPlayer.statistics.total_assists }}</strong>
              </div>

              <div class="stat-card">
                <span class="stat-label">Aproveitamento</span>
                <strong class="stat-val">{{ formatWinRate(selectedPlayer.statistics.total_wins, selectedPlayer.statistics.total_matches) }}</strong>
              </div>
              <div class="stat-card">
                <span class="stat-label">Media de gols</span>
                <strong class="stat-val">{{ formatDec(selectedPlayer.statistics.avg_goals_per_match) }}</strong>
              </div>
              <div class="stat-card">
                <span class="stat-label">Media de assistencias</span>
                <strong class="stat-val">{{ formatDec(selectedPlayer.statistics.avg_assists_per_match) }}</strong>
              </div>
              <div class="stat-card">
                <span class="stat-label">Participacao</span>
                <strong class="stat-val">{{ formatDec(selectedPlayer.statistics.avg_goal_participation) }}</strong>
              </div>

              <div v-if="selectedPlayer.player.position === 'goleiro'" class="stat-card">
                <span class="stat-label">Gols sofridos</span>
                <strong class="stat-val">{{ selectedPlayer.statistics.total_goals_conceded ?? '-' }}</strong>
              </div>

              <div class="stat-card stat-card--wide" :class="selectedPlayer.statistics.eligible_for_ranking ? 'elig-yes' : 'elig-no'">
                <span class="stat-label">Status no ranking</span>
                <strong class="stat-val">{{ selectedPlayer.statistics.eligible_for_ranking ? 'Elegivel' : 'Nao elegivel' }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
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
const currentPage = ref(1)
const pageSize = ref<number>(10)

const positionOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'linha', label: 'Linha' },
  { value: 'goleiro', label: 'Goleiro' },
] as const

const eligibilityOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'eligible', label: 'Elegiveis' },
  { value: 'not_eligible', label: 'Nao elegiveis' },
] as const

const filteredPlayers = computed(() => {
  const base = overview.value?.players ?? []
  const q = search.value.trim().toLowerCase()

  return base
    .filter((entry) => {
      if (positionFilter.value !== 'all' && entry.player.position !== positionFilter.value) return false
      if (eligibilityFilter.value === 'eligible' && !entry.statistics.eligible_for_ranking) return false
      if (eligibilityFilter.value === 'not_eligible' && entry.statistics.eligible_for_ranking) return false
      if (q) {
        const hay = `${entry.player.name} ${entry.player.nickname}`.toLowerCase()
        return hay.includes(q)
      }
      return true
    })
    .sort((a, b) => {
      if (a.statistics.eligible_for_ranking !== b.statistics.eligible_for_ranking) {
        return a.statistics.eligible_for_ranking ? -1 : 1
      }
      return b.statistics.total_matches - a.statistics.total_matches
    })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPlayers.value.length / pageSize.value)))

const paginatedPlayers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredPlayers.value.slice(start, start + pageSize.value)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | string)[] = [1]
  if (cur > 3) pages.push('...')
  for (let page = Math.max(2, cur - 1); page <= Math.min(total - 1, cur + 1); page++) pages.push(page)
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

watch([search, positionFilter, eligibilityFilter], () => {
  currentPage.value = 1
})

const formatDec = (value?: number | null) => value != null ? value.toFixed(2).replace('.', ',') : '-'
const formatWinRate = (wins: number, matches: number) => matches ? `${((wins / matches) * 100).toFixed(0)}%` : '0%'

const avatarColors = [
  '#B11313', '#8B0000', '#6D0000', '#A31515', '#C0392B',
  '#922B21', '#78281F', '#641E16', '#512E5F', '#76448A',
]

const avatarColor = (name: string) => {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) & 0xffffffff
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

const initials = (name: string) => name.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase()

const openModal = (entry: PlayerOverviewItem) => {
  selectedPlayer.value = entry
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  selectedPlayer.value = null
  document.body.style.overflow = ''
}

const fetchOverview = async () => {
  isLoading.value = true
  error.value = ''
  try {
    overview.value = await StatisticsService.getPlayersOverview()
  } catch (err: any) {
    console.error(err)
    error.value = err?.response?.data?.message || 'Falha ao carregar os dados.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  updateSEO({ title: 'Jogadores - Red Devils', description: 'Desempenho dos jogadores do Red Devils.' })
  await fetchOverview()
})
</script>
