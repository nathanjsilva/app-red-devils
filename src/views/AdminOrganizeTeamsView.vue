<template>
  <div class="page-shell py-4">
    <div class="page-header">
      <div>
        <h1 class="page-title">Organizar Times</h1>
        <p class="page-subtitle">Monte os times manualmente e mantenha a distribuicao dos jogadores organizada.</p>
      </div>
    </div>

    <section class="surface-card">
      <div class="surface-card-body">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-lg-6">
            <label class="form-label">Pelada</label>
            <SearchableSelect
              v-model="peladaId"
              :options="peladaOptions"
              placeholder="Selecione a pelada"
              :disabled="isLoadingPeladas"
              @change="loadTeamContext"
            />
          </div>
          <div class="col-12 col-lg-6">
            <div v-if="peladaInfo" class="metric-grid compact-grid">
              <div class="metric-card">
                <span>Times</span>
                <strong>{{ peladaInfo.qtd_times }}</strong>
              </div>
              <div class="metric-card">
                <span>Jogadores/Time</span>
                <strong>{{ peladaInfo.qtd_jogadores_por_time }}</strong>
              </div>
              <div class="metric-card">
                <span>Goleiros</span>
                <strong>{{ peladaInfo.qtd_goleiros }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoadingPeladas || isLoadingTeams" class="text-muted mt-4">
          Carregando contexto da pelada...
        </div>

        <div v-if="teamFields.length && peladaInfo" class="auto-organize-box mt-4">
          <div class="section-toolbar">
            <div>
              <h2 class="section-title mb-0">Organização automática</h2>
              <p class="page-subtitle mb-0">Selecione quem vai jogar e deixe o sistema distribuir os times (apaga a organização atual).</p>
            </div>
          </div>

          <div class="auto-organize-players">
            <label v-for="player in players" :key="player.id" class="auto-organize-player">
              <input type="checkbox" :value="player.id" v-model="autoOrganizePlayerIds" />
              <span>{{ player.name }} ({{ player.position === 'goleiro' ? 'Goleiro' : 'Linha' }})</span>
            </label>
          </div>

          <button
            class="btn btn-outline-secondary mt-3"
            :disabled="isAutoOrganizing || autoOrganizePlayerIds.length === 0"
            @click="handleAutoOrganize"
          >
            {{ isAutoOrganizing ? 'Organizando...' : `Organizar automaticamente (${autoOrganizePlayerIds.length} jogadores)` }}
          </button>
        </div>

        <div v-if="teamFields.length && peladaInfo" class="row g-3 mt-1">
          <div v-for="field in teamFields" :key="field.team_number" class="col-12 col-xl-6">
            <div class="team-card">
              <div class="team-card-header">
                <h2 class="section-title mb-0">{{ field.label }}</h2>
              </div>
              <div class="team-card-body">
                <div class="slot-list">
                  <div v-for="slotIndex in peladaInfo.qtd_jogadores_por_time" :key="`${field.team_number}-${slotIndex}`">
                    <label class="form-label small text-muted">Jogador {{ slotIndex }}</label>
                    <SearchableSelect
                      :model-value="teamAssignmentsMap[field.team_number]?.[slotIndex - 1] ?? null"
                      :options="playerOptionsFor(field.team_number, slotIndex - 1)"
                      placeholder="Selecione o jogador"
                      @update:model-value="(value) => onChangeSingleAssignment(field.team_number, slotIndex - 1, value)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="teamFields.length && peladaInfo" class="mt-4 d-flex flex-wrap gap-2">
          <button class="btn btn-red" :disabled="isLoading || !peladaId" @click.prevent="handleOrganize">
            {{ isLoading ? 'Organizando...' : 'Salvar organizacao' }}
          </button>
        </div>

        <div v-if="result" class="alert alert-success mt-4 mb-0">
          {{ result.message }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import SearchableSelect from '../components/ui/SearchableSelect.vue'
import { PeladaService } from '../services/peladaService'
import { PlayerService } from '../services/playerService'
import { TeamService } from '../services/teamService'
import type { OrganizedPeladaTeamsResponse, OrganizePeladaTeamsRequest, Pelada, Player, TeamField } from '../types'

const toast = useToast()
const isLoading = ref(false)
const allPeladas = ref<Pelada[]>([])
const peladaId = ref<number | null>(null)
const peladaInfo = ref<Pelada | null>(null)
const teamFields = ref<TeamField[]>([])
const players = ref<Player[]>([])
const teamAssignmentsMap = reactive<Record<number, number[]>>({})
const result = ref<OrganizedPeladaTeamsResponse | null>(null)
const isLoadingPeladas = ref(false)
const isLoadingTeams = ref(false)
const autoOrganizePlayerIds = ref<number[]>([])
const isAutoOrganizing = ref(false)

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
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

const onChangeSingleAssignment = (teamNumber: number, slotIndex: number, value: number | string | null) => {
  if (!teamAssignmentsMap[teamNumber]) teamAssignmentsMap[teamNumber] = []

  if (value === null || value === undefined) {
    teamAssignmentsMap[teamNumber][slotIndex] = undefined as any
    return
  }

  const playerId = typeof value === 'number' ? value : parseInt(value, 10)
  if (isNaN(playerId)) return

  if (isPlayerAlreadyChosen(playerId, teamNumber, slotIndex)) {
    toast.error('Este jogador ja esta em outro time ou slot.')
    return
  }

  teamAssignmentsMap[teamNumber][slotIndex] = playerId
}

const peladaOptions = computed(() =>
  allPeladas.value.map((pelada) => ({
    value: pelada.id,
    label: `${pelada.location} (${formatDate(pelada.date)})`
  }))
)

const playerOptionsFor = (teamNumber: number, slotIndex: number) =>
  players.value.map((player) => ({
    value: player.id,
    label: `${player.name} (${player.position === 'goleiro' ? 'Goleiro' : 'Linha'})`,
    disabled: isPlayerAlreadyChosen(player.id, teamNumber, slotIndex)
  }))

const isPlayerAlreadyChosen = (playerId: number, currentTeam: number, currentSlot: number) => {
  for (const [teamKeyStr, list] of Object.entries(teamAssignmentsMap)) {
    const teamKey = parseInt(teamKeyStr, 10)
    if (!Array.isArray(list)) continue
    for (let i = 0; i < list.length; i++) {
      if (teamKey === currentTeam && i === currentSlot) continue
      if (list[i] === playerId) return true
    }
  }
  return false
}

const loadAllPeladas = async () => {
  isLoadingPeladas.value = true
  try {
    allPeladas.value = await PeladaService.getAllPeladas()
    allPeladas.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error: any) {
    console.error(error)
    toast.error(`Falha ao buscar peladas: ${error?.response?.data?.message || error?.message || 'Erro desconhecido'}`)
  } finally {
    isLoadingPeladas.value = false
  }
}

const loadTeamContext = async () => {
  if (!peladaId.value) return

  isLoadingTeams.value = true
  result.value = null

  try {
    teamFields.value = []
    players.value = []
    peladaInfo.value = null
    autoOrganizePlayerIds.value = []
    Object.keys(teamAssignmentsMap).forEach((key) => delete (teamAssignmentsMap as any)[key])

    const fieldsRes = await TeamService.getTeamFields(peladaId.value)
    const peladaData = fieldsRes.pelada || fieldsRes

    peladaInfo.value = {
      id: peladaData.id,
      date: peladaData.date,
      location: peladaData.location,
      qtd_times: peladaData.qtd_times,
      qtd_jogadores_por_time: peladaData.qtd_jogadores_por_time,
      qtd_goleiros: peladaData.qtd_goleiros,
      created_at: (peladaData as any).created_at || '',
      updated_at: (peladaData as any).updated_at || ''
    }

    teamFields.value = fieldsRes.team_fields
    teamFields.value.forEach((field) => {
      teamAssignmentsMap[field.team_number] = []
    })

    const [teamsWithStatsResponse, allPlayersResponse] = await Promise.allSettled([
      TeamService.getTeamsWithStatistics(peladaId.value),
      PlayerService.getAllPlayers()
    ])

    if (allPlayersResponse.status === 'fulfilled') {
      players.value = allPlayersResponse.value
    } else {
      toast.warning('Nao foi possivel carregar a lista completa de jogadores')
    }

    if (teamsWithStatsResponse.status === 'fulfilled') {
      const teamsWithStats = teamsWithStatsResponse.value
      if (teamsWithStats.teams?.length) {
        // O nome do time pode ser customizado pelo admin (ex: "Time Verde"), não confiar em regex sobre o nome.
        // A ordem de retorno corresponde à ordem de criação dos team_assignments, então a posição no array = team_number.
        teamsWithStats.teams.forEach((team: any, index: number) => {
          const teamNumber = index + 1
          if (Array.isArray(team.players) && teamAssignmentsMap[teamNumber]) {
            const playerIds = team.players.map((player: any) => player.id).filter(Boolean)
            teamAssignmentsMap[teamNumber].splice(0, teamAssignmentsMap[teamNumber].length, ...playerIds)
          }
        })
        await nextTick()
      }
    }
  } catch (error: any) {
    console.error(error)
    toast.error(`Falha ao carregar contexto de times: ${error?.response?.data?.message || error?.message || 'Erro desconhecido'}`)
  } finally {
    isLoadingTeams.value = false
  }
}

const handleAutoOrganize = async () => {
  if (!peladaId.value || autoOrganizePlayerIds.value.length === 0) return

  if (!confirm('Isso vai apagar a organização atual dessa pelada e distribuir os times automaticamente. Continuar?')) return

  isAutoOrganizing.value = true
  try {
    result.value = await TeamService.organizeTeamsAutomatically(peladaId.value, {
      player_ids: autoOrganizePlayerIds.value
    })
    toast.success('Times organizados automaticamente com sucesso!')
    await loadTeamContext()
  } catch (error: any) {
    console.error(error)
    toast.error(`Falha ao organizar automaticamente: ${error?.response?.data?.message || error?.message || 'Erro desconhecido'}`)
  } finally {
    isAutoOrganizing.value = false
  }
}

const handleOrganize = async () => {
  if (!peladaId.value) return

  const team_assignments = teamFields.value.map((field) => ({
    team_number: field.team_number,
    player_ids: (teamAssignmentsMap[field.team_number] || []).filter((value): value is number => typeof value === 'number' && !isNaN(value))
  }))

  if (team_assignments.some((team) => team.player_ids.length === 0)) {
    toast.warning('Adicione pelo menos um jogador em cada time antes de organizar')
    return
  }

  const allPlayerIds: number[] = []
  const duplicatePlayers: number[] = []

  team_assignments.forEach((assignment) => {
    assignment.player_ids.forEach((playerId) => {
      if (allPlayerIds.includes(playerId)) {
        if (!duplicatePlayers.includes(playerId)) {
          duplicatePlayers.push(playerId)
        }
      } else {
        allPlayerIds.push(playerId)
      }
    })
  })

  if (duplicatePlayers.length > 0) {
    toast.error(`Os seguintes jogadores estao duplicados: ${duplicatePlayers.join(', ')}`)
    return
  }

  const request: OrganizePeladaTeamsRequest = { team_assignments }

  isLoading.value = true
  try {
    result.value = await TeamService.organizeTeams(peladaId.value, request)
    toast.success('Times organizados com sucesso!')
    await loadTeamContext()
  } catch (error: any) {
    console.error(error)
    toast.error(`Falha ao organizar times: ${error?.response?.data?.message || error?.message || 'Erro desconhecido'}`)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadAllPeladas)
</script>

<style scoped>
.auto-organize-box {
  padding: 1rem;
  border-radius: 1.1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(185, 28, 28, 0.03);
}

.auto-organize-players {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  max-height: 260px;
  overflow-y: auto;
  margin-top: 0.75rem;
  padding-right: 0.25rem;
}

.auto-organize-player {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.compact-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.team-card {
  border: 1px solid var(--line-soft);
  border-radius: 1.1rem;
  overflow: hidden;
  background: var(--surface-strong);
}

.team-card-header {
  padding: 1rem 1rem 0.75rem;
  background: rgba(220, 38, 38, 0.12);
}

.team-card-body {
  padding: 1rem;
}

.slot-list {
  display: grid;
  gap: 0.85rem;
}

@media (max-width: 767px) {
  .compact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
