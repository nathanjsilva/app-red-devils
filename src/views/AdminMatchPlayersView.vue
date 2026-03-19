<template>
  <div class="page-shell py-4">
    <div class="page-header">
      <div>
        <h1 class="page-title">Estatisticas</h1>
        <p class="page-subtitle">Selecione uma pelada e registre o desempenho de cada jogador.</p>
      </div>
    </div>

    <section class="surface-card mb-4" v-if="!selectedPelada">
      <div class="surface-card-body">
        <h2 class="section-title">Selecionar pelada</h2>
        <div class="row g-3">
          <div class="col-12 col-lg-8">
            <label class="form-label">Pelada</label>
            <select
              v-model.number="form.pelada_id"
              class="form-select"
              @change="loadPeladaData"
              :disabled="allPeladas.length === 0 || isLoadingPeladas"
            >
              <option :value="0">Selecione a pelada</option>
              <option v-for="pelada in allPeladas" :key="pelada.id" :value="pelada.id">
                {{ pelada.location }} ({{ formatDate(pelada.date) }})
              </option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section v-if="selectedPelada" class="surface-card mb-4">
      <div class="surface-card-body">
        <div class="section-toolbar">
          <div>
            <h2 class="section-title mb-0">{{ selectedPelada.location }}</h2>
            <p class="page-subtitle">Data {{ formatDate(selectedPelada.date) }} · Pelada #{{ selectedPelada.id }}</p>
          </div>
          <button class="btn btn-outline-secondary" @click="clearSelection">Trocar pelada</button>
        </div>
      </div>
    </section>

    <section v-if="selectedPelada && playerStats.length > 0" class="surface-card">
      <div class="surface-card-body">
        <div class="section-toolbar">
          <h2 class="section-title mb-0">Jogadores da pelada</h2>
          <span class="text-muted small">{{ playerStats.length }} registro{{ playerStats.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="table-responsive">
          <table class="table red-table align-middle">
            <thead>
              <tr>
                <th>Jogador</th>
                <th>Posicao</th>
                <th>Gols</th>
                <th>Assistencias</th>
                <th>Gols sofridos</th>
                <th>Resultado</th>
                <th>Vencedor</th>
                <th class="text-end">Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="playerStat in playerStats" :key="playerStat.player.id">
                <td>
                  <div class="fw-bold">{{ playerStat.player.nickname }}</div>
                  <div class="text-muted small">{{ playerStat.player.name }}</div>
                </td>
                <td>
                  <span class="pill-badge" :class="playerStat.player.position === 'goleiro' ? 'pill-info' : 'pill-muted'">
                    {{ playerStat.player.position }}
                  </span>
                </td>
                <td>
                  <input
                    v-model.number="playerStat.statistics.goals"
                    type="number"
                    class="form-control form-control-sm stat-input"
                    min="0"
                    :disabled="playerStat.player.position === 'goleiro'"
                  />
                </td>
                <td>
                  <input
                    v-model.number="playerStat.statistics.assists"
                    type="number"
                    class="form-control form-control-sm stat-input"
                    min="0"
                    :disabled="playerStat.player.position === 'goleiro'"
                  />
                </td>
                <td>
                  <input
                    v-if="playerStat.player.position === 'goleiro'"
                    v-model.number="playerStat.statistics.goals_conceded"
                    type="number"
                    class="form-control form-control-sm stat-input"
                    min="0"
                  />
                  <span v-else class="text-muted">—</span>
                </td>
                <td>
                  <select v-model="playerStat.statistics.result" class="form-select form-select-sm result-select" @change="syncWinner(playerStat)">
                    <option value="win">Vitoria</option>
                    <option value="draw">Empate</option>
                    <option value="loss">Derrota</option>
                  </select>
                </td>
                <td>
                  <input v-model="playerStat.statistics.is_winner" type="checkbox" class="form-check-input" disabled />
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-red" @click="savePlayerStatistics(playerStat)" :disabled="isSaving === playerStat.player.id">
                    {{ isSaving === playerStat.player.id ? 'Salvando...' : 'Salvar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div v-else-if="selectedPelada && !isLoadingPlayers" class="surface-card">
      <div class="surface-card-body text-muted">
        Esta pelada ainda nao possui jogadores organizados.
      </div>
    </div>

    <div v-if="isLoadingPlayers || isLoadingPeladas" class="text-center py-5 text-muted">
      Carregando dados...
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { AdminService } from '../services/adminService'
import { PeladaService } from '../services/peladaService'
import { TeamService } from '../services/teamService'
import type { Pelada, PeladaPlayersItem, UpdateMatchPlayerRequest } from '../types'

interface PlayerWithStatistics {
  player: PeladaPlayersItem
  statistics: {
    goals: number
    assists: number
    is_winner: boolean
    goals_conceded?: number
    result: 'win' | 'loss' | 'draw'
  }
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const selectedPelada = ref<Pelada | null>(null)
const allPeladas = ref<Pelada[]>([])
const isLoadingPlayers = ref(false)
const isLoadingPeladas = ref(false)
const isSaving = ref<number | null>(null)
const playerStats = ref<PlayerWithStatistics[]>([])
const form = ref({ pelada_id: 0 })

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Data nao informada'
  try {
    const date = new Date(dateString + 'T00:00:00')
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

const syncWinner = (playerStat: PlayerWithStatistics) => {
  playerStat.statistics.is_winner = playerStat.statistics.result === 'win'
}

const loadPeladaById = async (peladaId: number) => {
  isLoadingPlayers.value = true
  playerStats.value = []

  try {
    const teamsResponse = await TeamService.getTeamsWithStatistics(peladaId)
    selectedPelada.value = {
      id: teamsResponse.pelada.id,
      date: teamsResponse.pelada.date,
      location: teamsResponse.pelada.location,
      qtd_times: teamsResponse.pelada.qtd_times,
      qtd_jogadores_por_time: teamsResponse.pelada.qtd_jogadores_por_time,
      qtd_goleiros: teamsResponse.pelada.qtd_goleiros,
      created_at: '',
      updated_at: ''
    }

    form.value.pelada_id = peladaId

    const sourcePlayers = teamsResponse.teams.length > 0
      ? teamsResponse.teams.flatMap((team) => team.players)
      : (teamsResponse.players || [])

    playerStats.value = sourcePlayers.map((player: any) => {
      const isGoalkeeper = player.position === 'goleiro'
      const result = player.statistics?.result || 'loss'

      return {
        player: {
          id: player.id,
          name: player.name || 'Sem nome',
          nickname: player.nickname || `Jogador ${player.id}`,
          position: player.position === 'goleiro' ? 'goleiro' : 'linha',
          is_goalkeeper: isGoalkeeper
        },
        statistics: {
          goals: isGoalkeeper ? 0 : (Number(player.statistics?.goals) || 0),
          assists: isGoalkeeper ? 0 : (Number(player.statistics?.assists) || 0),
          goals_conceded: isGoalkeeper ? (Number(player.statistics?.goals_conceded) || 0) : undefined,
          result,
          is_winner: result === 'win'
        }
      }
    })
  } catch (error: any) {
    if (error?.response?.status === 404) {
      playerStats.value = []
      toast.info('Esta pelada ainda nao possui times organizados')
    } else {
      console.error(error)
      toast.error('Erro ao carregar dados da pelada')
    }
  } finally {
    isLoadingPlayers.value = false
  }
}

const loadAllPeladas = async () => {
  isLoadingPeladas.value = true
  try {
    allPeladas.value = await PeladaService.getAllPeladas()
    allPeladas.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error(error)
    toast.error('Falha ao buscar peladas')
  } finally {
    isLoadingPeladas.value = false
  }
}

const loadPeladaData = async () => {
  if (!form.value.pelada_id) return
  await loadPeladaById(form.value.pelada_id)
}

const clearSelection = () => {
  selectedPelada.value = null
  playerStats.value = []
  form.value.pelada_id = 0
  router.replace({ name: 'AdminMatchPlayers' })
}

const savePlayerStatistics = async (playerStat: PlayerWithStatistics) => {
  if (!selectedPelada.value) return

  isSaving.value = playerStat.player.id
  try {
    const statsData: UpdateMatchPlayerRequest = {
      result: playerStat.statistics.result,
      is_winner: playerStat.statistics.result === 'win'
    }

    if (playerStat.player.position === 'goleiro') {
      statsData.goals_conceded = playerStat.statistics.goals_conceded || 0
    } else {
      statsData.goals = playerStat.statistics.goals || 0
      statsData.assists = playerStat.statistics.assists || 0
    }

    await AdminService.updatePlayerStatistics(selectedPelada.value.id, playerStat.player.id, statsData)
    syncWinner(playerStat)
    toast.success(`Estatisticas de ${playerStat.player.nickname} salvas com sucesso`)
  } catch (error: any) {
    console.error(error)
    toast.error(`Falha ao salvar estatisticas: ${error?.response?.data?.message || error?.message || 'Erro desconhecido'}`)
  } finally {
    isSaving.value = null
  }
}

onMounted(async () => {
  await loadAllPeladas()
  const peladaId = route.query.pelada_id
  if (!peladaId) return

  const id = parseInt(String(peladaId), 10)
  if (!isNaN(id) && allPeladas.value.find((pelada) => pelada.id === id)) {
    form.value.pelada_id = id
    await loadPeladaById(id)
  }
})

watch(() => route.query.pelada_id, async (newPeladaId) => {
  if (!newPeladaId) {
    selectedPelada.value = null
    playerStats.value = []
    form.value.pelada_id = 0
    return
  }

  const id = parseInt(String(newPeladaId), 10)
  if (!isNaN(id)) {
    form.value.pelada_id = id
    await loadPeladaById(id)
  }
})
</script>

<style scoped>
.stat-input {
  min-width: 82px;
}

.result-select {
  min-width: 118px;
}
</style>
