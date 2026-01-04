<template>
  <div class="container py-5">
    <!-- Cabeçalho -->
    <div class="text-center mb-5">
      <img :src="logo" alt="Red Devils" class="logo-img mb-3" />
      <h1 class="fw-bold text-red display-6">Dashboard Red Devils</h1>
      <p class="text-muted">Estatísticas atualizadas dos peladeiros</p>
      
      <!-- Total de Jogos -->
      <div class="mt-3" v-if="totalMatches > 0">
        <div class="total-matches-badge">
          <strong>Total de Jogos: {{ totalMatches }}</strong>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-red-devils" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3 text-muted">Carregando rankings...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-5">
      <div class="alert alert-warning" role="alert">
        <h4 class="alert-heading">Ops! Algo deu errado</h4>
        <p>{{ error }}</p>
        <hr>
        <button class="btn btn-outline-warning" @click="fetchRankings">
          Tentar Novamente
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && rankingsList.length === 0" class="text-center py-5">
      <div class="alert alert-info" role="alert">
        <h4 class="alert-heading">Nenhum ranking disponível</h4>
        <p>Não há dados de estatísticas para exibir no momento.</p>
      </div>
    </div>

    <!-- Rankings -->
    <div v-else class="row g-4">
      <div class="col-12 col-lg-6" v-for="(ranking, index) in rankingsList" :key="index">
        <div class="leaderboard-card">
          <!-- Título -->
          <div class="leaderboard-header">
            <h5 class="m-0">Ranking de {{ ranking.type }}</h5>
          </div>

          <!-- Lista -->
          <div class="leaderboard-body">
            <div 
              v-for="(player, i) in ranking.players" 
              :key="player.id" 
              class="leaderboard-item"
              :class="{ 'first-place': i === 0 }"
            >
              <div class="rank-number">#{{ i + 1 }}</div>
              <div class="player-info">
                <div class="player-avatar">
                  {{ player.name.charAt(0).toUpperCase() }}
                </div>
                <div class="player-details">
                  <span class="player-name">{{ player.name }}</span>
                  <span class="player-nickname">{{ player.nickname }}</span>
                </div>
              </div>
              <div class="player-stats">
                <div class="player-total">{{ formatTotal(ranking.type, player.total) }}</div>
                <div class="player-average">
                  {{ formatAverage(ranking.type, player.average) }} / Jogos: {{ player.matches || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botão -->
    <div class="text-center mt-5">
      <button 
        class="btn btn-lg btn-red px-5 py-3 rounded-pill fw-semibold shadow-sm"
        @click="goToProfile"
      >
        Editar Meu Perfil
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useRankingsStore } from '../stores/rankings'
import { useSEO } from '../composables/useSEO'
import logo from '../assets/logo-red-devils.png'

const router = useRouter()
const rankingsStore = useRankingsStore()
const { updateSEO } = useSEO()

// Usar storeToRefs para manter reatividade das refs do store
const { rankings, isLoading, error } = storeToRefs(rankingsStore)

// Actions não precisam de storeToRefs, podem ser acessadas diretamente
const { fetchRankings, getTotalMatches } = rankingsStore

// Computed para rankings (facilita acesso no template)
const rankingsList = computed(() => {
  return rankings.value || []
})

// Computed para total de jogos
const totalMatches = computed(() => {
  return rankingsStore.getTotalMatches()
})

// Função para formatar o total baseado no tipo de ranking
const formatTotal = (type: string, total: number): string => {
  if (type.includes('Vitória') || type.includes('Vitórias')) {
    return `${total}`
  }
  return `${total}`
}

// Função para formatar a média baseado no tipo de ranking
const formatAverage = (type: string, average: number): string => {
  if (type.includes('Vitória') || type.includes('Vitórias')) {
    return `Taxa: ${average.toFixed(2)}%`
  }
  return `Média: ${average.toFixed(2)}`
}

onMounted(async () => {
  updateSEO({
    title: 'Dashboard - Red Devils',
    description: 'Visualize rankings e estatísticas dos jogadores da pelada Red Devils.'
  })
  
  // Só buscar se não estiver carregando e não tiver dados
  if (!isLoading.value && (!rankings.value || rankings.value.length === 0)) {
    try {
      await fetchRankings()
    } catch (err) {
      console.error('❌ Error fetching rankings:', err)
    }
  }
})

const goToProfile = () => {
  router.push('/register')
}
</script>

<style scoped>
:root {
  --card-bg: rgba(255, 255, 255, 0.8);
  --card-border: rgba(255, 255, 255, 0.2);
}

.logo-img {
  height: 70px;
}

.text-red {
  color: var(--red-devils);
}

.btn-red {
  background-color: var(--red-devils);
  color: white;
  border: none;
}

.btn-red:hover {
  background-color: var(--red-devils-hover);
}

/* Badge de total de jogos */
.total-matches-badge {
  display: inline-block;
  background-color: var(--red-devils);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 2rem;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Card estilo glassmorphism */
.leaderboard-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header */
.leaderboard-header {
  background: var(--red-devils);
  color: white;
  padding: 0.75rem 1rem;
  font-weight: 600;
}

/* Corpo com scroll invisível */
.leaderboard-body {
  padding: 0.5rem 0;
  max-height: 260px;
  overflow-y: auto;
  scrollbar-width: none;
}

.leaderboard-body::-webkit-scrollbar {
  display: none;
}

/* Linha do ranking */
.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  transition: background 0.2s ease;
}

.leaderboard-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

/* Posição */
.rank-number {
  font-weight: 700;
  width: 40px;
  text-align: center;
  font-size: 1.1rem;
  color: #999;
}

/* Jogador */
.player-info {
  flex: 1;
  display: flex;
  align-items: center;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--red-devils);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 0.75rem;
}

.player-details {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.player-nickname {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

/* Estatísticas */
.player-stats {
  text-align: right;
}

.player-total {
  font-weight: 700;
  color: var(--red-devils);
  font-size: 1.1rem;
}

.player-average {
  font-size: 0.8rem;
  color: #666;
}

/* Destaque primeiro lugar */
.first-place {
  background: linear-gradient(90deg, var(--red-devils) 0%, #1d1c1c 100%);
  color: white;
}

.first-place .rank-number,
.first-place .player-total,
.first-place .player-average {
  color: white;
}

.first-place .player-nickname {
  color: rgba(255, 255, 255, 0.8);
}
</style>
