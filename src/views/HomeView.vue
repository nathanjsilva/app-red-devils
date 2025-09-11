<template>
  <div class="container py-5">
    <!-- Cabeçalho -->
    <div class="text-center mb-5">
      <img :src="logo" alt="Red Devils" class="logo-img mb-3" />
      <h1 class="fw-bold text-red display-6">Dashboard Red Devils</h1>
      <p class="text-muted">Estatísticas atualizadas dos peladeiros</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-red-devils" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3 text-muted">Carregando rankings...</p>
    </div>

    <!-- Rankings -->
    <div v-else class="row g-4">
      <div class="col-12 col-lg-6" v-for="(ranking, index) in rankings" :key="index">
        <div class="leaderboard-card">
          <!-- Título -->
          <div class="leaderboard-header">
            <h5 class="m-0">{{ ranking.title }}</h5>
          </div>

          <!-- Lista -->
          <div class="leaderboard-body">
            <div 
              v-for="(player, i) in ranking.players" 
              :key="player.name" 
              class="leaderboard-item"
              :class="{ 'first-place': i === 0 }"
            >
              <div class="rank-number">#{{ i + 1 }}</div>
              <div class="player-info">
                <img :src="player.avatar" class="player-avatar" :alt="`Avatar de ${player.name}`" />
                <span class="player-name">{{ player.name }}</span>
              </div>
              <div class="player-points">
                {{ player.points }}
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
        @click="goToVoting"
      >
        Votar nos Jogadores
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRankingsStore } from '../stores/rankings'
import { useSEO } from '../composables/useSEO'
import logo from '../assets/logo-red-devils.png'

const router = useRouter()
const rankingsStore = useRankingsStore()
const { updateSEO } = useSEO()

const { rankings, isLoading, fetchRankings } = rankingsStore

onMounted(async () => {
  updateSEO({
    title: 'Dashboard - Red Devils',
    description: 'Visualize rankings e estatísticas dos jogadores da pelada Red Devils.'
  })
  await fetchRankings()
})

const goToVoting = () => {
  router.push('/votacao')
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
  object-fit: cover;
  margin-right: 0.75rem;
}

.player-name {
  font-weight: 500;
}

/* Pontos */
.player-points {
  font-weight: 700;
  color: var(--red-devils);
}

/* Destaque primeiro lugar */
.first-place {
  background: linear-gradient(90deg, var(--red-devils) 0%, #1d1c1c 100%);
  color: white;
}

.first-place .rank-number,
.first-place .player-points {
  color: white;
}
</style>
