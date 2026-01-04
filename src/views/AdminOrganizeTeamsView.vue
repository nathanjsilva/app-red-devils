<template>
  <div class="container py-4">
    <h2 class="mb-3">Admin · Organizar Times</h2>

    <div class="card">
      <div class="card-body">
        <h5 class="card-title mb-3">Organizar</h5>
        <form class="row g-3" @submit.prevent="handleOrganize">
          <div class="col-md-6">
            <label class="form-label">Pelada</label>
            <select v-model.number="peladaId" class="form-select" @change="loadTeamContext" :disabled="allPeladas.length === 0 || isLoadingPeladas" required>
              <option :value="undefined" disabled selected>Selecione a pelada</option>
              <option v-for="p in allPeladas" :key="p.id" :value="p.id">
                {{ p.location }} ({{ formatDate(p.date) }})
              </option>
            </select>
            <div v-if="isLoadingPeladas" class="mt-2 text-muted small">Carregando peladas...</div>
          </div>
          <div class="col-md-6 d-flex align-items-end">
            <div class="text-muted">
              <div v-if="peladaInfo">Times: {{ peladaInfo.qtd_times }} · Jogadores/Time: {{ peladaInfo.qtd_jogadores_por_time }} · Goleiros: {{ peladaInfo.qtd_goleiros }}</div>
            </div>
          </div>

          <div v-if="isLoadingTeams" class="col-12 text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-3 text-muted">Carregando times...</p>
          </div>

          <div class="col-12" v-else-if="teamFields.length && peladaInfo">
            <div class="row g-3">
              <div v-for="field in teamFields" :key="field.team_number" class="col-md-6">
                <div class="border rounded p-3">
                  <label class="form-label d-block mb-2">{{ field.label }}</label>
                  <div class="row g-2">
                    <div
                      v-for="slotIndex in peladaInfo.qtd_jogadores_por_time"
                      :key="`${field.team_number}-${slotIndex}`"
                      class="col-12"
                    >
                      <select
                        class="form-select"
                        :value="teamAssignmentsMap[field.team_number]?.[slotIndex - 1] ?? undefined"
                        @change="onChangeSingleAssignment(field.team_number, slotIndex - 1, $event)"
                      >
                        <option :value="undefined" disabled selected>Selecione o jogador ({{ slotIndex }})</option>
                        <option
                          v-for="player in players"
                          :key="player.id"
                          :value="player.id"
                          :disabled="isPlayerAlreadyChosen(player.id, field.team_number, slotIndex - 1)"
                        >
                          #{{ player.id }} · {{ player.nickname }} ({{ player.position }})
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12">
            <button class="btn btn-red" :disabled="isLoading || !peladaId">
              {{ isLoading ? 'Organizando...' : 'Organizar Times' }}
            </button>
          </div>
        </form>

        <div v-if="result" class="mt-3 alert alert-success">
          <h6 class="mb-2">✅ Times organizados com sucesso!</h6>
          <p class="mb-0 small">{{ result.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { PeladaService } from '../services/peladaService'
import { TeamService } from '../services/teamService'
import { PlayerService } from '../services/playerService'
import type { OrganizePeladaTeamsRequest, OrganizedPeladaTeamsResponse, Pelada, TeamField, Player } from '../types'

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

// Função para formatar data
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
  } catch (e) {
    return dateString
  }
}

const onChangeSingleAssignment = (teamNumber: number, slotIndex: number, event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = parseInt(target.value, 10)
  if (!teamAssignmentsMap[teamNumber]) teamAssignmentsMap[teamNumber] = []
  teamAssignmentsMap[teamNumber][slotIndex] = isNaN(value) ? undefined as any : value
}

const selectedPlayerIds = computed(() => {
  const set = new Set<number>()
  for (const teamKey of Object.keys(teamAssignmentsMap)) {
    const list = teamAssignmentsMap[teamKey as any] || []
    for (const pid of list) {
      if (typeof pid === 'number' && !isNaN(pid)) set.add(pid)
    }
  }
  return set
})

const isPlayerAlreadyChosen = (playerId: number, currentTeam: number, currentSlot: number) => {
  // allow same player in the same select (keeps current value enabled), but disable in others
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

// Carregar todas as peladas
const loadAllPeladas = async () => {
  isLoadingPeladas.value = true
  try {
    const response = await PeladaService.getAllPeladas()
    allPeladas.value = Array.isArray(response) ? response : (response as any).data || []
    // Ordenar por data em ordem ascendente (mais antiga primeiro)
    allPeladas.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    console.log('✅ Peladas carregadas:', allPeladas.value.length)
  } catch (e: any) {
    console.error('❌ Erro ao buscar peladas:', e)
    toast.error(`Falha ao buscar peladas: ${e?.response?.data?.message || e?.message || 'Erro desconhecido'}`)
  } finally {
    isLoadingPeladas.value = false
  }
}

const loadTeamContext = async () => {
  if (!peladaId.value) return
  
  isLoadingTeams.value = true
  result.value = null
  
  try {
    console.log('🔍 Carregando contexto para pelada:', peladaId.value)
    
    // Limpar dados anteriores
    teamFields.value = []
    players.value = []
    peladaInfo.value = null
    Object.keys(teamAssignmentsMap).forEach(k => delete (teamAssignmentsMap as any)[k])
    
    const [fieldsRes] = await Promise.all([
      TeamService.getTeamFields(peladaId.value)
    ])
    
    console.log('✅ Contexto carregado:', {
      pelada: fieldsRes.pelada,
      teams: fieldsRes.team_fields.length
    })
    
    // CORREÇÃO: Verificar estrutura da pelada
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
    
    // Verificar se a pelada tem jogadores cadastrados
    let peladaPlayersResponse: any = null
    try {
      peladaPlayersResponse = await TeamService.getPeladaPlayers(peladaId.value)
      console.log('✅ Jogadores da pelada encontrados:', peladaPlayersResponse.players?.length || 0)
    } catch (e: any) {
      console.warn('⚠️ Não foi possível carregar jogadores da pelada:', e)
    }
    
    // Se a pelada tem jogadores cadastrados, usar esses jogadores
    if (peladaPlayersResponse && peladaPlayersResponse.players && peladaPlayersResponse.players.length > 0) {
      // Converter PeladaPlayersItem[] para Player[]
      players.value = peladaPlayersResponse.players.map((p: any) => ({
        id: p.id,
        name: p.name || '',
        email: '',
        position: p.position || (p.is_goalkeeper ? 'goleiro' : 'linha'),
        phone: p.phone || '',
        nickname: p.nickname || '',
        is_admin: false,
        created_at: '',
        updated_at: ''
      }))
      console.log('✅ Usando jogadores cadastrados na pelada')
    } else {
      // Caso contrário, usar todos os jogadores
      const playersResponse = await PlayerService.getAllPlayers()
      if (Array.isArray(playersResponse)) {
        players.value = playersResponse
      } else if (playersResponse && 'data' in playersResponse) {
        players.value = (playersResponse as any).data
      }
      console.log('✅ Usando todos os jogadores disponíveis')
    }
    
    // Inicializar teamAssignmentsMap com arrays vazios
    for (const f of teamFields.value) {
      teamAssignmentsMap[f.team_number] = []
    }
    
    // Tentar carregar times já organizados
    try {
      const organizedTeams = await TeamService.getOrganizedTeams(peladaId.value)
      if (organizedTeams && organizedTeams.teams && organizedTeams.teams.length > 0) {
        console.log('✅ Times já organizados encontrados:', organizedTeams.teams.length)
        
        // Preencher teamAssignmentsMap com os jogadores já organizados
        organizedTeams.teams.forEach(team => {
          const teamNumber = team.team_number
          if (teamNumber !== undefined && team.players) {
            if (!teamAssignmentsMap[teamNumber]) {
              teamAssignmentsMap[teamNumber] = []
            }
            // Preencher os slots com os IDs dos jogadores
            team.players.forEach((player, index) => {
              teamAssignmentsMap[teamNumber][index] = player.id
            })
          }
        })
        
        console.log('✅ Times já organizados carregados no formulário')
      } else {
        console.log('ℹ️ Nenhum time organizado encontrado para esta pelada')
      }
    } catch (e: any) {
      console.warn('⚠️ Erro ao carregar times organizados (continuando com times vazios):', e)
    }
    
    console.log('✅ Times inicializados:', teamFields.value.map(f => f.label))
  } catch (e: any) {
    console.error('❌ Erro ao carregar contexto:', e)
    console.error('Detalhes do erro:', {
      message: e?.message,
      response: e?.response?.data,
      status: e?.response?.status
    })
    toast.error(`Falha ao carregar contexto de times: ${e?.response?.data?.message || e?.message || 'Erro desconhecido'}`)
  } finally {
    isLoadingTeams.value = false
  }
}

const handleOrganize = async () => {
  if (!peladaId.value) return
  
  // Build payload
  const team_assignments = teamFields.value.map(f => ({
    team_number: f.team_number,
    player_ids: (teamAssignmentsMap[f.team_number] || [])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v))
  }))
  
  // Validar se todos os times têm jogadores
  const teamsWithoutPlayers = team_assignments.filter(t => t.player_ids.length === 0)
  if (teamsWithoutPlayers.length > 0) {
    toast.warning('Adicione pelo menos um jogador em cada time antes de organizar')
    return
  }
  
  const request: OrganizePeladaTeamsRequest = { team_assignments }
  
  console.log('📤 Enviando organização de times:', request)
  
  isLoading.value = true
  try {
    result.value = await TeamService.organizeTeams(peladaId.value, request)
    console.log('✅ Times organizados:', result.value)
    toast.success('Times organizados com sucesso!')
  } catch (e: any) {
    console.error('❌ Erro ao organizar times:', e)
    console.error('Detalhes do erro:', {
      message: e?.message,
      response: e?.response?.data,
      status: e?.response?.status
    })
    toast.error(`Falha ao organizar times: ${e?.response?.data?.message || e?.message || 'Erro desconhecido'}`)
  } finally {
    isLoading.value = false
  }
}

// Carregar peladas ao montar o componente
onMounted(async () => {
  await loadAllPeladas()
})
</script>

<style scoped>
.btn-red { 
  background-color: var(--red-devils); 
  color: #fff; 
}
.btn-red:hover { 
  background-color: var(--red-devils-hover); 
}
</style>