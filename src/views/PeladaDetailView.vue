<template>
  <div class="page-shell py-4">
    <div class="page-header">
      <div>
        <button class="btn btn-outline-secondary mb-2" @click="router.back()">Voltar</button>
        <h1 class="page-title">{{ pelada ? pelada.location : 'Pelada' }}</h1>
        <p v-if="pelada" class="page-subtitle">
          {{ formatDate(pelada.date) }}
          <span class="pill-badge pill-info ms-2">{{ pelada.division === 'sabado' ? 'Sábado' : 'Quinta' }}</span>
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="surface-card">
      <div class="surface-card-body text-center py-5 text-muted">Carregando pelada...</div>
    </div>

    <div v-else-if="!match" class="surface-card">
      <div class="surface-card-body text-center py-5 text-muted">Não foi possível carregar as estatísticas dessa pelada.</div>
    </div>

    <template v-else>
      <section class="surface-card mb-4">
        <div class="surface-card-body">
          <h2 class="section-title">Visão geral</h2>
          <div class="metric-grid">
            <div class="metric-card">
              <span>Jogadores</span>
              <strong>{{ match.total_players }}</strong>
            </div>
            <div class="metric-card">
              <span>Gols</span>
              <strong>{{ match.total_goals }}</strong>
            </div>
            <div class="metric-card">
              <span>Assistências</span>
              <strong>{{ match.total_assists }}</strong>
            </div>
            <div class="metric-card">
              <span>Média gols/jogador</span>
              <strong>{{ formatDec(match.avg_goals_per_player) }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="surface-card mb-4">
        <div class="surface-card-body">
          <h2 class="section-title">Destaques</h2>
          <div class="metric-grid">
            <div v-if="match.top_scorer" class="metric-card">
              <span>Artilheiro</span>
              <strong>{{ match.top_scorer.player.name }}</strong>
              <small>{{ match.top_scorer.value }} gols</small>
            </div>
            <div v-if="match.top_assister" class="metric-card">
              <span>Garçom</span>
              <strong>{{ match.top_assister.player.name }}</strong>
              <small>{{ match.top_assister.value }} assistências</small>
            </div>
            <div v-if="match.top_goal_participation" class="metric-card">
              <span>Maior participação</span>
              <strong>{{ match.top_goal_participation.player.name }}</strong>
              <small>{{ match.top_goal_participation.value }} participações</small>
            </div>
          </div>
        </div>
      </section>

      <section v-if="match.team_results.length" class="surface-card mb-4">
        <div class="surface-card-body">
          <h2 class="section-title">Resultado dos times</h2>
          <div class="table-responsive">
            <table class="data-table stack-mobile">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Gols</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="team in match.team_results" :key="team.team_id">
                  <td data-label="Time" class="fw-bold">{{ team.name }}</td>
                  <td data-label="Gols">{{ team.total_goals }}</td>
                  <td data-label="Resultado">
                    <span class="pill-badge" :class="resultPillClass(team.result)">{{ resultLabel(team.result) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="surface-card mb-4">
        <div class="surface-card-body">
          <h2 class="section-title">Jogadores de linha</h2>
          <div class="table-responsive">
            <table class="data-table stack-mobile">
              <thead>
                <tr>
                  <th>Jogador</th>
                  <th>Gols</th>
                  <th>Assistências</th>
                  <th>Participações</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in match.field_players" :key="item.player.id">
                  <td data-label="Jogador">
                    <router-link :to="`/players/${item.player.id}`" class="fw-bold">{{ item.player.name }}</router-link>
                  </td>
                  <td data-label="Gols">{{ item.statistics.goals }}</td>
                  <td data-label="Assistências">{{ item.statistics.assists }}</td>
                  <td data-label="Participações">{{ item.statistics.goal_participation }}</td>
                  <td data-label="Resultado">
                    <span class="pill-badge" :class="resultPillClass(item.statistics.result)">{{ resultLabel(item.statistics.result) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section v-if="match.goalkeepers.length" class="surface-card">
        <div class="surface-card-body">
          <h2 class="section-title">Goleiros</h2>
          <div class="table-responsive">
            <table class="data-table stack-mobile">
              <thead>
                <tr>
                  <th>Goleiro</th>
                  <th>Gols</th>
                  <th>Assistências</th>
                  <th>Gols sofridos</th>
                  <th>Participações</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in match.goalkeepers" :key="item.player.id">
                  <td data-label="Goleiro">
                    <router-link :to="`/players/${item.player.id}`" class="fw-bold">{{ item.player.name }}</router-link>
                  </td>
                  <td data-label="Gols">{{ item.statistics.goals }}</td>
                  <td data-label="Assistências">{{ item.statistics.assists }}</td>
                  <td data-label="Gols sofridos">{{ item.statistics.goals_conceded }}</td>
                  <td data-label="Participações">{{ item.statistics.goal_participation }}</td>
                  <td data-label="Resultado">
                    <span class="pill-badge" :class="resultPillClass(item.statistics.result)">{{ resultLabel(item.statistics.result) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PeladaService } from '../services/peladaService'
import { StatisticsService } from '../services/statisticsService'
import type { MatchDetail, Pelada } from '../types'

const route = useRoute()
const router = useRouter()
const pelada = ref<Pelada | null>(null)
const match = ref<MatchDetail | null>(null)
const isLoading = ref(false)

const formatDec = (value?: number | null) => (value != null ? value.toFixed(2).replace('.', ',') : '-')

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString + 'T00:00:00')
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateString
  }
}

const resultLabel = (result: string) => (result === 'win' ? 'Vitória' : result === 'draw' ? 'Empate' : 'Derrota')
const resultPillClass = (result: string) => (result === 'win' ? 'pill-ok' : result === 'draw' ? 'pill-muted' : 'pill-danger')

const fetchPeladaDetail = async () => {
  const id = Number(route.params.id)
  if (isNaN(id)) return
  isLoading.value = true
  try {
    const [peladaData, matchData] = await Promise.all([
      PeladaService.getPelada(id),
      StatisticsService.getMatchDetail(id)
    ])
    pelada.value = peladaData
    match.value = matchData
  } catch (error) {
    console.error(error)
    match.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPeladaDetail)
</script>
