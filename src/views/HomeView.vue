<template>
  <div class="page-shell py-4 py-lg-5">
    <section class="hero-panel mb-4 mb-lg-5">
      <div class="hero-copy">
        <div class="hero-brand">
          <img :src="logo" alt="Red Devils" class="logo-img" />
          <div>
            <p class="hero-kicker">Painel Publico</p>
            <h1 class="hero-title">Dashboard Red Devils</h1>
          </div>
        </div>
        <p class="hero-description">
          Acompanhe os rankings mais importantes da temporada e navegue rapidamente para o resumo geral dos jogadores.
        </p>
      </div>

      <div class="hero-highlight">
        <span class="highlight-label">Total de jogos mapeados</span>
        <strong class="highlight-value">{{ totalMatches }}</strong>
        <small class="highlight-caption">Atualizado a partir dos rankings publicos</small>
      </div>
    </section>

    <section class="metric-grid mb-4" v-if="!isLoading && !error && rankingsList.length > 0">
      <div v-for="summary in rankingSummaries" :key="summary.title" class="metric-card">
        <span>{{ summary.title }}</span>
        <strong>{{ summary.value }}</strong>
      </div>
    </section>

    <div v-if="isLoading" class="surface-card">
      <div class="surface-card-body text-center py-5">
        <div class="spinner-border text-red-devils" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-3 text-muted mb-0">Carregando rankings...</p>
      </div>
    </div>

    <div v-else-if="error" class="surface-card">
      <div class="surface-card-body text-center py-5">
        <h4 class="mb-2">Ops! Algo deu errado</h4>
        <p class="text-muted mb-3">{{ error }}</p>
        <button class="btn btn-outline-warning" @click="fetchRankings">
          Tentar novamente
        </button>
      </div>
    </div>

    <div v-else-if="rankingsList.length === 0" class="surface-card">
      <div class="surface-card-body text-center py-5">
        <h4 class="mb-2">Nenhum ranking disponivel</h4>
        <p class="text-muted mb-0">Nao ha dados de estatisticas para exibir no momento.</p>
      </div>
    </div>

    <section v-else class="dashboard-grid">
      <article v-for="(ranking, index) in rankingsList" :key="index" class="ranking-panel">
        <header class="ranking-panel-header">
          <div>
            <p class="ranking-kicker">Ranking</p>
            <h2 class="ranking-title">{{ ranking.type }}</h2>
          </div>
          <span class="ranking-pill">{{ ranking.players.length }} jogador{{ ranking.players.length !== 1 ? 'es' : '' }}</span>
        </header>

        <div class="ranking-panel-body">
          <div
            v-for="(player, i) in ranking.players"
            :key="player.id"
            class="ranking-row"
            :class="{ featured: i === 0 }"
          >
            <div class="ranking-order">#{{ i + 1 }}</div>
            <div class="ranking-player">
              <div class="player-avatar">
                {{ player.name.charAt(0).toUpperCase() }}
              </div>
              <div class="player-copy">
                <span class="player-name">{{ player.name }}</span>
                <span class="player-nickname">{{ player.nickname }}</span>
              </div>
            </div>
            <div class="ranking-stats">
              <strong class="ranking-total">{{ formatTotal(ranking.type, player.total) }}</strong>
              <span class="ranking-average">{{ formatAverage(ranking.type, player.average) }}</span>
              <span class="ranking-matches">{{ player.matches || 0 }} jogo{{ player.matches === 1 ? '' : 's' }}</span>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="surface-card action-panel mt-4 mt-lg-5">
      <div class="surface-card-body action-panel-body">
        <div>
          <h2 class="section-title mb-1">Proximos passos</h2>
          <p class="page-subtitle mb-0">Explore o resumo completo ou acesse a area de administracao quando estiver logado.</p>
        </div>
        <div class="action-buttons">
          <button
            class="btn btn-lg btn-red px-4 py-3 rounded-pill fw-semibold"
            @click="goToOverview"
          >
            Ver resumo dos jogadores
          </button>
          <button
            v-if="isAdmin"
            class="btn btn-lg btn-outline-danger px-4 py-3 rounded-pill fw-semibold"
            @click="goToAdminPlayers"
          >
            Gerenciar jogadores
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useRankingsStore } from '../stores/rankings'
import { useAuthStore } from '../stores/auth'
import { useSEO } from '../composables/useSEO'
import logo from '../assets/logo-red-devils.png'

const router = useRouter()
const rankingsStore = useRankingsStore()
const authStore = useAuthStore()
const { updateSEO } = useSEO()

const { rankings, isLoading, error } = storeToRefs(rankingsStore)
const { fetchRankings } = rankingsStore

const rankingsList = computed(() => rankings.value || [])
const totalMatches = computed(() => rankingsStore.getTotalMatches())
const isAdmin = computed(() => authStore.user?.profile === 'admin')

const rankingSummaries = computed(() => {
  return rankingsList.value.slice(0, 4).map((ranking) => ({
    title: ranking.type,
    value: ranking.players[0]?.name || 'Sem dados'
  }))
})

const formatTotal = (type: string, total: number): string => {
  if (type.includes('Vitoria') || type.includes('Vitorias')) {
    return `${total}`
  }
  return `${total}`
}

const formatAverage = (type: string, average: number): string => {
  if (type.includes('Vitoria') || type.includes('Vitorias')) {
    return `${average.toFixed(2)}%`
  }
  return `Media ${average.toFixed(2)}`
}

onMounted(async () => {
  updateSEO({
    title: 'Dashboard - Red Devils',
    description: 'Visualize rankings e estatisticas publicas dos jogadores da pelada Red Devils.'
  })

  if (!isLoading.value && (!rankings.value || rankings.value.length === 0)) {
    try {
      await fetchRankings()
    } catch (fetchError) {
      console.error('Error fetching rankings:', fetchError)
    }
  }
})

const goToAdminPlayers = () => {
  router.push('/admin/players')
}

const goToOverview = () => {
  router.push('/players-overview')
}
</script>

<style scoped>
.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.8fr);
  gap: 1.25rem;
  align-items: stretch;
}

.hero-copy,
.hero-highlight,
.ranking-panel {
  border-radius: 1.4rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.hero-copy {
  padding: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(185, 28, 28, 0.14), transparent 30%),
    linear-gradient(135deg, #ffffff 0%, #fbfcfe 100%);
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logo-img {
  width: 72px;
  height: 72px;
}

.hero-kicker,
.ranking-kicker {
  margin: 0 0 0.35rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--red-devils);
  font-weight: 800;
}

.hero-title {
  margin: 0;
  font-size: clamp(1.9rem, 3vw, 2.8rem);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.hero-description {
  max-width: 62ch;
  margin: 0;
  color: var(--text-muted);
  font-size: 1rem;
}

.hero-highlight {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--red-devils) 0%, #2b0909 100%);
  color: #fff;
}

.highlight-label,
.highlight-caption {
  color: rgba(255, 255, 255, 0.74);
}

.highlight-label {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.65rem;
}

.highlight-value {
  font-size: clamp(2.4rem, 6vw, 4rem);
  line-height: 1;
  font-weight: 800;
}

.highlight-caption {
  margin-top: 0.75rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.ranking-panel {
  overflow: hidden;
  background: #fff;
}

.ranking-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.2rem 1.2rem 1rem;
  background: linear-gradient(135deg, rgba(185, 28, 28, 0.08) 0%, rgba(23, 32, 51, 0.02) 100%);
}

.ranking-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.ranking-pill {
  background: rgba(185, 28, 28, 0.1);
  color: var(--red-devils);
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.ranking-panel-body {
  padding: 0.5rem;
  max-height: 420px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(185, 28, 28, 0.45) rgba(15, 23, 42, 0.06);
}

.ranking-panel-body::-webkit-scrollbar {
  width: 8px;
}

.ranking-panel-body::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.06);
  border-radius: 999px;
}

.ranking-panel-body::-webkit-scrollbar-thumb {
  background: rgba(185, 28, 28, 0.45);
  border-radius: 999px;
}

.ranking-panel-body::-webkit-scrollbar-thumb:hover {
  background: rgba(185, 28, 28, 0.7);
}

.ranking-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;
  padding: 0.9rem;
  border-radius: 1rem;
}

.ranking-row + .ranking-row {
  margin-top: 0.35rem;
}

.ranking-row:hover {
  background: rgba(15, 23, 42, 0.04);
}

.ranking-row.featured {
  background: linear-gradient(90deg, var(--red-devils) 0%, #2d0909 100%);
  color: #fff;
}

.ranking-order {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.06);
  font-weight: 800;
}

.ranking-row.featured .ranking-order {
  background: rgba(255, 255, 255, 0.18);
}

.ranking-player {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.player-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: var(--red-devils);
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
  flex-shrink: 0;
}

.ranking-row.featured .player-avatar {
  background: rgba(255, 255, 255, 0.2);
}

.player-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.player-name {
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-nickname {
  color: var(--text-muted);
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-row.featured .player-nickname,
.ranking-row.featured .ranking-average,
.ranking-row.featured .ranking-matches {
  color: rgba(255, 255, 255, 0.82);
}

.ranking-stats {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.ranking-total {
  font-size: 1.15rem;
  color: var(--red-devils);
}

.ranking-row.featured .ranking-total {
  color: #fff;
}

.ranking-average,
.ranking-matches {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.action-panel-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 1100px) {
  .hero-panel,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .hero-copy,
  .hero-highlight {
    padding: 1.2rem;
  }

  .hero-brand {
    align-items: flex-start;
  }

  .logo-img {
    width: 60px;
    height: 60px;
  }

  .ranking-panel-header,
  .action-panel-body {
    flex-direction: column;
    align-items: stretch;
  }

  .ranking-row {
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .ranking-stats {
    grid-column: 2;
    align-items: flex-start;
    text-align: left;
  }

  .action-buttons {
    justify-content: stretch;
  }

  .action-buttons .btn {
    width: 100%;
  }
}
</style>
