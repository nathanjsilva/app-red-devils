<template>
  <div class="page-shell home-dashboard py-4 py-lg-5">
    <section class="home-hero">
      <div class="home-hero-main surface-card">
        <div class="surface-card-body home-hero-body">
          <div class="home-hero-copy">
            <div class="home-hero-brand">
              <img :src="logo" alt="Red Devils" class="home-logo" />
              <div>
                <p class="home-eyebrow">Painel publico</p>
                <h1 class="home-title">Dashboard Red Devils</h1>
              </div>
            </div>

            <div class="home-actions">
              <button class="btn btn-red home-primary-btn" @click="goToOverview">
                Ver resumo dos jogadores
              </button>
              <button
                v-if="isAdmin"
                class="btn btn-outline-secondary home-secondary-btn"
                @click="goToAdminPlayers"
              >
                Gerenciar jogadores
              </button>
            </div>
          </div>

          <div class="home-highlight-panel">
            <div class="home-highlight-head">
              <span class="home-highlight-label">Jogos mapeados</span>
              <span class="home-highlight-chip">Temporada</span>
            </div>

            <div class="home-highlight-center">
              <strong class="home-highlight-value">{{ totalMatches }}</strong>
              <span class="home-highlight-ring">
                <i class="bi bi-trophy-fill"></i>
              </span>
            </div>

            <div class="home-highlight-footer">
              <div class="home-highlight-stat">
                <span class="home-highlight-stat-label">Categorias</span>
                <strong class="home-highlight-stat-value">{{ rankingsList.length }}</strong>
              </div>
              <div class="home-highlight-divider"></div>
              <div class="home-highlight-stat">
                <span class="home-highlight-stat-label">Status</span>
                <strong class="home-highlight-stat-value">Ao vivo</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="surface-card division-section">
      <div class="surface-card-body">
        <div class="section-toolbar">
          <div>
            <p class="home-section-kicker">Peladas</p>
            <h2 class="section-title mb-0">Numeros por divisao</h2>
          </div>
        </div>

        <div v-if="isLoadingPeladaCounts" class="text-muted small">Carregando...</div>
        <div v-else class="metric-grid division-grid">
          <div class="metric-card">
            <span>Quinta</span>
            <strong>{{ peladaCountByDivision.quinta }}</strong>
            <small>pelada{{ peladaCountByDivision.quinta !== 1 ? 's' : '' }}</small>
          </div>
          <div class="metric-card">
            <span>Sabado</span>
            <strong>{{ peladaCountByDivision.sabado }}</strong>
            <small>pelada{{ peladaCountByDivision.sabado !== 1 ? 's' : '' }}</small>
          </div>
        </div>
      </div>
    </section>

    <div v-if="isLoading" class="surface-card">
      <div class="surface-card-body home-state-card text-center py-5">
        <div class="spinner-border text-red-devils" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-3 text-muted mb-0">Carregando rankings da temporada...</p>
      </div>
    </div>

    <div v-else-if="error" class="surface-card">
      <div class="surface-card-body home-state-card text-center py-5">
        <h2 class="section-title mb-2">Nao foi possivel carregar os rankings</h2>
        <p class="text-muted mb-3">{{ error }}</p>
        <button class="btn btn-outline-secondary" @click="fetchRankings">Tentar novamente</button>
      </div>
    </div>

    <div v-else-if="rankingsList.length === 0" class="surface-card">
      <div class="surface-card-body home-state-card text-center py-5">
        <h2 class="section-title mb-2">Nenhum ranking disponivel</h2>
        <p class="text-muted mb-0">Nao ha estatisticas publicas para exibir neste momento.</p>
      </div>
    </div>

    <template v-else>
      <section class="home-spotlight-grid">
        <article v-for="leader in featuredLeaders" :key="leader.type" class="surface-card spotlight-card">
          <div class="surface-card-body spotlight-card-body">
            <div>
              <p class="spotlight-kicker">Lider da categoria</p>
              <h2 class="spotlight-title">{{ leader.type }}</h2>
            </div>

            <div class="spotlight-player-row">
              <div class="spotlight-avatar">{{ leader.player.name.charAt(0).toUpperCase() }}</div>
              <div>
                <strong class="spotlight-player-name">{{ leader.player.name }}</strong>
                <p class="spotlight-player-copy">{{ leader.player.nickname || 'Sem apelido' }} - {{ leader.player.matches || 0 }} jogos</p>
                <span class="spotlight-player-meta">{{ formatSpotlightMeta(leader.type, leader.player.total, leader.player.average) }}</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section class="home-section-header">
        <div>
          <p class="home-section-kicker">Rankings</p>
          <h2 class="section-title home-section-title">Leitura rapida dos desempenhos</h2>
        </div>
      </section>

      <section class="dashboard-grid">
        <article v-for="(ranking, index) in rankingsList" :key="index" class="ranking-panel">
          <header class="ranking-panel-header">
            <div>
              <p class="ranking-kicker">Categoria</p>
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
                <div class="player-avatar">{{ player.name.charAt(0).toUpperCase() }}</div>
                <div class="player-copy">
                  <span class="player-name">{{ player.name }}</span>
                  <span class="player-nickname">{{ player.nickname || 'Sem apelido' }}</span>
                </div>
              </div>
              <div class="ranking-stats">
                <strong class="ranking-total">{{ formatTotal(ranking.type, player.total, player.average) }}</strong>
                <span class="ranking-average">{{ formatAverage(ranking.type, player.average) }}</span>
                <span class="ranking-matches">{{ player.matches || 0 }} jogo{{ player.matches === 1 ? '' : 's' }}</span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useRankingsStore } from '../stores/rankings'
import { useAuthStore } from '../stores/auth'
import { useSEO } from '../composables/useSEO'
import { PeladaService } from '../services/peladaService'
import logo from '../assets/logo-red-devils.png'

const router = useRouter()
const rankingsStore = useRankingsStore()
const authStore = useAuthStore()
const { updateSEO } = useSEO()

const { rankings, isLoading, error } = storeToRefs(rankingsStore)
const { fetchRankings } = rankingsStore

const isLoadingPeladaCounts = ref(false)
const peladaCountByDivision = ref({ quinta: 0, sabado: 0 })

const rankingsList = computed(() => rankings.value || [])
const totalMatches = computed(() => rankingsStore.getTotalMatches())
const isAdmin = computed(() => authStore.user?.profile === 'admin')

const featuredLeaders = computed(() => {
  return rankingsList.value
    .filter((ranking) => ranking.players.length > 0)
    .slice(0, 3)
    .map((ranking) => ({
      type: ranking.type,
      player: ranking.players[0]
    }))
})

const isWinsRanking = (type: string) => type.includes('Vitoria') || type.includes('Vitorias')

const formatTotal = (type: string, total: number, average?: number): string => {
  if (isWinsRanking(type)) {
    return `${average?.toFixed(2) ?? '0.00'}%`
  }
  return `${total}`
}

const formatAverage = (type: string, average: number): string => {
  if (isWinsRanking(type)) {
    return `${average.toFixed(2)}% de aproveitamento`
  }
  return `Media ${average.toFixed(2)}`
}

const formatSpotlightMeta = (type: string, total: number, average: number): string => {
  if (isWinsRanking(type)) {
    return `${average.toFixed(2)}%`
  }
  return `${total} no total`
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

  isLoadingPeladaCounts.value = true
  try {
    const peladas = await PeladaService.getAllPeladas()
    peladaCountByDivision.value = {
      quinta: peladas.filter((pelada) => pelada.division === 'quinta').length,
      sabado: peladas.filter((pelada) => pelada.division === 'sabado').length
    }
  } catch (fetchError) {
    console.error('Error fetching peladas for division counts:', fetchError)
  } finally {
    isLoadingPeladaCounts.value = false
  }
})

const goToAdminPlayers = () => {
  router.push('/admin/players')
}

const goToOverview = () => {
  router.push('/players-overview')
}
</script>
