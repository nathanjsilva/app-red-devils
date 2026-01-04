<template>
  <div class="container py-4">
    <h2 class="mb-3">Admin · Peladas</h2>

    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">Criar pelada</h5>
        <form class="row g-3" @submit.prevent="handleCreate">
          <div class="col-md-3">
            <label class="form-label">Data</label>
            <input v-model="form.date" type="date" class="form-control" required />
          </div>
          <div class="col-md-3">
            <label class="form-label">Local</label>
            <input v-model="form.location" class="form-control" placeholder="Campo do João" required />
          </div>
          <div class="col-md-2">
            <label class="form-label">Times</label>
            <input v-model.number="form.qtd_times" type="number" min="2" class="form-control" placeholder="4" required />
          </div>
          <div class="col-md-2">
            <label class="form-label">Jogadores/Time</label>
            <input v-model.number="form.qtd_jogadores_por_time" type="number" min="1" class="form-control" placeholder="5" required />
          </div>
          <div class="col-md-2">
            <label class="form-label">Goleiros</label>
            <input v-model.number="form.qtd_goleiros" type="number" min="0" class="form-control" placeholder="4" required />
          </div>
          <div class="col-12">
            <button class="btn btn-red" :disabled="isLoading">{{ isLoading ? 'Salvando...' : 'Criar' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="card-title m-0">Peladas</h5>
          <button class="btn btn-outline-secondary btn-sm" @click="fetchPeladas" :disabled="isLoading">Recarregar</button>
        </div>
        <div v-if="isLoading">Carregando...</div>
        <div v-else>
          <div v-if="peladas.length === 0" class="text-muted">Nenhuma pelada encontrada.</div>
          <div v-else class="table-responsive">
            <table class="table table-sm align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Local</th>
                  <th>Times</th>
                  <th>Jogadores/Time</th>
                  <th>Goleiros</th>
                  <th>Estatísticas</th>
                  <th class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in peladasWithStats" :key="p.id">
                  <td>{{ p.id }}</td>
                  <td>{{ formatDate(p.date) }}</td>
                  <td>{{ p.location }}</td>
                  <td>{{ p.qtd_times }}</td>
                  <td>{{ p.qtd_jogadores_por_time }}</td>
                  <td>{{ p.qtd_goleiros }}</td>
                  <td>
                    <span 
                      v-if="p.hasStatistics !== undefined" 
                      :class="['badge', 'statistics-badge', p.hasStatistics ? 'badge-success' : 'badge-secondary']"
                    >
                      <span v-if="p.hasStatistics" class="badge-icon">✓</span>
                      <span v-else class="badge-icon">○</span>
                      {{ p.hasStatistics ? 'Com estatísticas' : 'Sem estatísticas' }}
                    </span>
                    <span v-else class="badge bg-light text-dark">
                      <span class="spinner-border spinner-border-sm me-1" role="status" style="width: 0.8rem; height: 0.8rem;"></span>
                      Verificando...
                    </span>
                  </td>
                  <td class="text-end">
                    <button 
                      class="btn btn-sm btn-outline-primary me-2" 
                      @click="editPelada(p.id)" 
                      :disabled="isLoading"
                      title="Editar estatísticas"
                    >
                      Editar
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger" 
                      @click="removePelada(p.id)" 
                      :disabled="isLoading"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { PeladaService } from '../services/peladaService'
import { AdminService } from '../services/adminService'
import { StatisticsService } from '../services/statisticsService'
import type { Pelada, CreatePeladaRequest } from '../types'

const router = useRouter()

// Tipo estendido para incluir informação de estatísticas
interface PeladaWithStats extends Pelada {
  hasStatistics?: boolean
  isLoadingStats?: boolean
}

const toast = useToast()
const peladas = ref<PeladaWithStats[]>([])
const isLoading = ref(false)
const form = ref<CreatePeladaRequest>({
  date: '',
  location: '',
  qtd_times: 2,
  qtd_jogadores_por_time: 5,
  qtd_goleiros: 0
})

// Computed para peladas com estatísticas
const peladasWithStats = computed(() => {
  return peladas.value
})

// Função para formatar data no padrão brasileiro
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

const fetchPeladas = async () => {
  isLoading.value = true
  try {
    const fetchedPeladas = await PeladaService.getAllPeladas()
    // Inicializar peladas com hasStatistics como undefined (aguardando verificação)
    peladas.value = fetchedPeladas.map(p => ({ ...p, hasStatistics: undefined, isLoadingStats: true }))
    
    // Marcar loading como false para exibir a tabela
    isLoading.value = false
    
    // Verificar estatísticas para cada pelada em paralelo (sem bloquear a UI)
    fetchedPeladas.forEach(async (pelada) => {
      try {
        const hasStats = await StatisticsService.hasPeladaStatistics(pelada.id)
        const index = peladas.value.findIndex(p => p.id === pelada.id)
        if (index !== -1) {
          peladas.value[index].hasStatistics = hasStats
          peladas.value[index].isLoadingStats = false
        }
      } catch (error) {
        console.warn(`Erro ao verificar estatísticas da pelada ${pelada.id}:`, error)
        const index = peladas.value.findIndex(p => p.id === pelada.id)
        if (index !== -1) {
          peladas.value[index].hasStatistics = false
          peladas.value[index].isLoadingStats = false
        }
      }
    })
  } catch (e: any) {
    console.error(e)
    toast.error('Falha ao carregar peladas')
    isLoading.value = false
  }
}

const handleCreate = async () => {
  isLoading.value = true
  try {
    const created = await AdminService.createPelada(form.value)
    toast.success(`Pelada #${created.id} criada`)
    await fetchPeladas()
    form.value = { date: '', location: '', qtd_times: 2, qtd_jogadores_por_time: 5, qtd_goleiros: 0 }
  } catch (e: any) {
    console.error(e)
    toast.error('Falha ao criar pelada')
  } finally {
    isLoading.value = false
  }
}

const editPelada = (id: number) => {
  router.push({ name: 'AdminMatchPlayers', query: { pelada_id: id } })
}

const removePelada = async (id: number) => {
  if (!confirm(`Excluir pelada #${id}?`)) return
  isLoading.value = true
  try {
    await AdminService.deletePelada(id)
    toast.success('Pelada excluída')
    await fetchPeladas()
  } catch (e: any) {
    console.error(e)
    toast.error('Falha ao excluir pelada')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPeladas)
</script>

<style scoped>
.btn-red { 
  background-color: var(--red-devils); 
  color: #fff; 
}
.btn-red:hover { 
  background-color: var(--red-devils-hover); 
}

.statistics-badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.65rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-secondary {
  background-color: #6c757d;
  color: white;
}

.badge-icon {
  font-weight: bold;
  font-size: 0.9rem;
}
</style>