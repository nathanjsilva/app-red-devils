<template>
  <div class="container py-5">
    <!-- Cabeçalho -->
    <div class="text-center mb-5">
      <img :src="logo" alt="Red Devils" class="logo-img mb-3" />
      <h1 class="fw-bold text-red display-6">Dashboard Red Devils</h1>
      <p class="text-muted">Estatísticas atualizadas dos peladeiros</p>
    </div>

    <!-- Rankings -->
    <div class="row g-4">
      <div class="col-12 col-lg-6" v-for="(ranking, index) in rankings" :key="index">
        <div class="leaderboard-card">
          <!-- Título -->
          <div class="leaderboard-header">
            <h5 class="m-0">{{ ranking.title }}</h5>
          </div>

          <!-- Lista -->
          <div class="leaderboard-body">
            <div v-for="(player, i) in ranking.players" :key="player.name" class="leaderboard-item"
              :class="{ 'first-place': i === 0 }">
              <div class="rank-number">#{{ i + 1 }}</div>
              <div class="player-info">
                <img :src="player.avatar" class="player-avatar" />
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
      <button class="btn btn-lg btn-red px-5 py-3 rounded-pill fw-semibold shadow-sm">
        Votar nos Jogadores
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import logo from '../assets/logo-red-devils.png'

function fakeAvatar(id) {
  return `https://i.pravatar.cc/60?img=${id}`
}

const rankings = ref([
  {
    title: 'Ranking de Gols',
    players: [
      { name: 'Carlos', points: 15, avatar: fakeAvatar(1) },
      { name: 'João', points: 12, avatar: fakeAvatar(2) },
      { name: 'Pedro', points: 9, avatar: fakeAvatar(3) },
      { name: 'Marcos', points: 7, avatar: fakeAvatar(4) },
      { name: 'Lucas', points: 5, avatar: fakeAvatar(5) },
      { name: 'André', points: 4, avatar: fakeAvatar(6) },
      { name: 'Felipe', points: 3, avatar: fakeAvatar(7) },
      { name: 'Tiago', points: 2, avatar: fakeAvatar(8) },
      { name: 'Rafael', points: 1, avatar: fakeAvatar(9) },
      { name: 'Bruno', points: 0, avatar: fakeAvatar(10) }
    ]
  },
  {
    title: 'Ranking de Assistências',
    players: [
      { name: 'Pedro', points: 11, avatar: fakeAvatar(11) },
      { name: 'Carlos', points: 10, avatar: fakeAvatar(12) },
      { name: 'João', points: 7, avatar: fakeAvatar(13) },
      { name: 'Marcos', points: 6, avatar: fakeAvatar(14) },
      { name: 'Lucas', points: 5, avatar: fakeAvatar(15) },
      { name: 'André', points: 4, avatar: fakeAvatar(16) },
      { name: 'Felipe', points: 3, avatar: fakeAvatar(17) },
      { name: 'Tiago', points: 2, avatar: fakeAvatar(18) },
      { name: 'Rafael', points: 1, avatar: fakeAvatar(19) },
      { name: 'Bruno', points: 0, avatar: fakeAvatar(20) }
    ]
  },
  {
    title: 'Média de Gols por Jogo',
    players: [
      { name: 'Carlos', points: 1.25, avatar: fakeAvatar(21) },
      { name: 'João', points: 1.0, avatar: fakeAvatar(22) },
      { name: 'Pedro', points: 0.9, avatar: fakeAvatar(23) },
      { name: 'Marcos', points: 0.8, avatar: fakeAvatar(24) },
      { name: 'Lucas', points: 0.7, avatar: fakeAvatar(25) },
      { name: 'André', points: 0.6, avatar: fakeAvatar(26) },
      { name: 'Felipe', points: 0.5, avatar: fakeAvatar(27) },
      { name: 'Tiago', points: 0.4, avatar: fakeAvatar(28) },
      { name: 'Rafael', points: 0.3, avatar: fakeAvatar(29) },
      { name: 'Bruno', points: 0.2, avatar: fakeAvatar(30) }
    ]
  },
  {
    title: 'Média de Assistências por Jogo',
    players: [
      { name: 'Pedro', points: 1.1, avatar: fakeAvatar(31) },
      { name: 'Carlos', points: 1.0, avatar: fakeAvatar(32) },
      { name: 'João', points: 0.6, avatar: fakeAvatar(33) },
      { name: 'Marcos', points: 0.5, avatar: fakeAvatar(34) },
      { name: 'Lucas', points: 0.4, avatar: fakeAvatar(35) },
      { name: 'André', points: 0.3, avatar: fakeAvatar(36) },
      { name: 'Felipe', points: 0.2, avatar: fakeAvatar(37) },
      { name: 'Tiago', points: 0.1, avatar: fakeAvatar(38) },
      { name: 'Rafael', points: 0.05, avatar: fakeAvatar(39) },
      { name: 'Bruno', points: 0.01, avatar: fakeAvatar(40) }
    ]
  }
])
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
