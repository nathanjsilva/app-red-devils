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

          <!-- Organização manual -->
          <div class="col-12" v-if="teamFields.length && peladaInfo">
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

          <div class="col-12" v-if="teamFields.length && peladaInfo">
            <button class="btn btn-red" :disabled="isLoading || !peladaId" @click.prevent="handleOrganize">
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
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
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
  
  // Se o valor for inválido, limpar o slot
  if (isNaN(value)) {
    if (!teamAssignmentsMap[teamNumber]) teamAssignmentsMap[teamNumber] = []
    teamAssignmentsMap[teamNumber][slotIndex] = undefined as any
    return
  }
  
  // Validar se o jogador já está em outro time ou slot
  if (isPlayerAlreadyChosen(value, teamNumber, slotIndex)) {
    toast.error('Este jogador já está em outro time ou slot. Escolha outro jogador.')
    // Reverter para o valor anterior
    target.value = teamAssignmentsMap[teamNumber]?.[slotIndex]?.toString() || ''
    return
  }
  
  // Atualizar o assignment
  if (!teamAssignmentsMap[teamNumber]) teamAssignmentsMap[teamNumber] = []
  teamAssignmentsMap[teamNumber][slotIndex] = value
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
    
    // Inicializar teamAssignmentsMap com arrays vazios
    for (const f of teamFields.value) {
      teamAssignmentsMap[f.team_number] = []
    }
    
    // Carregar duas rotas em paralelo:
    // 1. Rota de estatísticas (players-with-statistics) - FONTE PRINCIPAL com times e jogadores organizados
    // 2. Rota de todos os jogadores (/players) - para popular os selects
    try {
      const [teamsWithStatsResponse, allPlayersResponse] = await Promise.allSettled([
        TeamService.getTeamsWithStatistics(peladaId.value),
        PlayerService.getAllPlayers()
      ])
      
      // Processar resposta de todos os jogadores do sistema (para popular selects)
      if (allPlayersResponse.status === 'fulfilled') {
        const allPlayers = allPlayersResponse.value
        if (Array.isArray(allPlayers)) {
          players.value = allPlayers
        } else if (allPlayers && 'data' in allPlayers) {
          players.value = (allPlayers as any).data
        }
        console.log('✅ Todos os jogadores do sistema carregados:', players.value.length)
      } else {
        console.warn('⚠️ Erro ao carregar todos os jogadores:', allPlayersResponse.reason)
        toast.warning('Não foi possível carregar a lista completa de jogadores')
      }
      
      // Processar resposta de players-with-statistics - FONTE PRINCIPAL
      if (teamsWithStatsResponse.status === 'fulfilled') {
        const teamsWithStats = teamsWithStatsResponse.value
        
        // Priorizar o campo 'teams' que já vem organizado
        if (teamsWithStats && teamsWithStats.teams && Array.isArray(teamsWithStats.teams) && teamsWithStats.teams.length > 0) {
          console.log('✅ Times organizados encontrados via players-with-statistics:', teamsWithStats.teams.length)
          
          let hasOrganizedTeams = false
          
          // Preencher teamAssignmentsMap com os jogadores de cada time
          teamsWithStats.teams.forEach((team: any) => {
            // Extrair número do time do nome (ex: "Time 1" -> 1, "Time 2" -> 2)
            let teamNumber: number | undefined = undefined
            
            if (team.name) {
              const match = team.name.match(/Time\s*(\d+)/i)
              if (match && match[1]) {
                teamNumber = parseInt(match[1], 10)
              }
            }
            
            if (teamNumber !== undefined && !isNaN(teamNumber) && team.players && Array.isArray(team.players) && team.players.length > 0) {
              // Garantir que o array existe
              if (!teamAssignmentsMap[teamNumber]) {
                teamAssignmentsMap[teamNumber] = []
              }
              
              // Criar array com todos os jogadores
              const teamPlayers: number[] = []
              team.players.forEach((player: any) => {
                if (player && player.id && !isNaN(player.id)) {
                  teamPlayers.push(player.id)
                }
              })
              
              // Usar splice para manter reatividade do Vue
              teamAssignmentsMap[teamNumber].splice(0, teamAssignmentsMap[teamNumber].length, ...teamPlayers)
              
              hasOrganizedTeams = true
              console.log(`✅ Time ${teamNumber} (${team.name}) preenchido automaticamente com ${teamPlayers.length} jogador(es):`, teamPlayers)
            }
          })
          
          if (hasOrganizedTeams) {
            const teamCount = teamsWithStats.teams.length
            
            // Aguardar próximo tick para garantir que Vue atualize a UI
            await nextTick()
            
            toast.success(`${teamCount} time(s) já organizado(s) foi(ram) carregado(s). Você pode editar a organização.`)
            console.log('✅ Times já organizados carregados no formulário')
          }
        } else if (teamsWithStats && teamsWithStats.players && Array.isArray(teamsWithStats.players) && teamsWithStats.players.length > 0) {
          // Fallback: Se não tem campo 'teams', usar o campo 'players' e agrupar por time
          console.log('ℹ️ Campo "teams" não encontrado, usando campo "players" para identificar times')
          console.log(`📊 Total de jogadores retornados: ${teamsWithStats.players.length}`)
          
          // Agrupar jogadores por time
          const playersByTeam: Record<number, number[]> = {}
          
          teamsWithStats.players.forEach((p: any) => {
            if (p.team && p.team.name && p.team.id) {
              const match = p.team.name.match(/Time\s*(\d+)/i)
              if (match && match[1]) {
                const teamNumber = parseInt(match[1], 10)
                if (!isNaN(teamNumber)) {
                  if (!playersByTeam[teamNumber]) {
                    playersByTeam[teamNumber] = []
                  }
                  playersByTeam[teamNumber].push(p.id)
                  console.log(`  → Jogador ${p.id} (${p.nickname}) adicionado ao Time ${teamNumber}`)
                }
              }
            }
          })
          
          console.log('📋 Jogadores agrupados por time:', playersByTeam)
          
          // Preencher com os jogadores encontrados
          if (Object.keys(playersByTeam).length > 0) {
            // Ordenar as chaves dos times para garantir ordem correta
            const sortedTeamNumbers = Object.keys(playersByTeam)
              .map(n => parseInt(n, 10))
              .filter(n => !isNaN(n))
              .sort((a, b) => a - b)
            
            sortedTeamNumbers.forEach(teamNumber => {
              if (playersByTeam[teamNumber] && playersByTeam[teamNumber].length > 0) {
                // Garantir que o array existe no objeto reativo
                if (!teamAssignmentsMap[teamNumber]) {
                  teamAssignmentsMap[teamNumber] = []
                }
                
                // Limpar array existente e criar novo array com todos os jogadores
                const teamPlayers: number[] = []
                playersByTeam[teamNumber].forEach((playerId) => {
                  if (playerId && !isNaN(playerId)) {
                    teamPlayers.push(playerId)
                  }
                })
                
                // Atribuir o array completo ao objeto reativo
                // Usar splice para manter reatividade do Vue
                teamAssignmentsMap[teamNumber].splice(0, teamAssignmentsMap[teamNumber].length, ...teamPlayers)
                
                console.log(`✅ Time ${teamNumber} preenchido (via players) com ${teamPlayers.length} jogador(es):`, teamPlayers)
              }
            })
            
            const teamCount = sortedTeamNumbers.length
            const totalPlayersLoaded = Object.values(playersByTeam).reduce((sum, arr) => sum + arr.length, 0)
            
            // Aguardar próximo tick para garantir que Vue atualize a UI
            await nextTick()
            
            toast.success(`${teamCount} time(s) já organizado(s) com ${totalPlayersLoaded} jogador(es) carregado(s). Você pode editar a organização.`)
          } else {
            console.warn('⚠️ Nenhum jogador com time associado encontrado')
          }
        } else {
          console.log('ℹ️ Nenhum time organizado encontrado para esta pelada')
        }
      } else {
        // Se retornar 404, significa que não há dados (situação esperada)
        if (teamsWithStatsResponse.reason?.response?.status === 404) {
          console.log('ℹ️ Nenhum jogador com estatísticas encontrado para esta pelada (404)')
        } else {
          console.warn('⚠️ Erro ao carregar jogadores com estatísticas:', teamsWithStatsResponse.reason)
        }
      }
    } catch (e: any) {
      console.error('❌ Erro ao carregar dados:', e)
      toast.error('Erro ao carregar dados da pelada')
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
  
  // Build payload e validar
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
  
  // Validar duplicatas: garantir que nenhum jogador apareça duas vezes
  const allPlayerIds: number[] = []
  const duplicatePlayers: number[] = []
  
  team_assignments.forEach(assignment => {
    assignment.player_ids.forEach(playerId => {
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
    toast.error(`Erro: Os seguintes jogadores estão duplicados: ${duplicatePlayers.join(', ')}. Cada jogador pode aparecer apenas uma vez.`)
    return
  }
  
  const request: OrganizePeladaTeamsRequest = { team_assignments }
  
  console.log('📤 Enviando organização de times:', request)
  
  isLoading.value = true
  try {
    result.value = await TeamService.organizeTeams(peladaId.value, request)
    console.log('✅ Times organizados:', result.value)
    toast.success('Times organizados com sucesso!')
    // Recarregar times organizados para mostrar no formulário
    await loadTeamContext()
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