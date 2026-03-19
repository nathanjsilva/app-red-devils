<template>
  <div class="page-shell py-4">
    <div class="page-header">
      <div>
        <h1 class="page-title">Peladas</h1>
        <p class="page-subtitle">Crie peladas e acompanhe rapidamente quais ja possuem estatisticas.</p>
      </div>
      <button class="btn btn-outline-secondary" @click="fetchPeladas" :disabled="isLoading">
        Recarregar lista
      </button>
    </div>

    <section class="surface-card">
      <div class="surface-card-body">
        <h2 class="section-title">Nova pelada</h2>
        <form class="row g-3" @submit.prevent="handleCreate">
          <div class="col-12 col-md-6 col-xl-3">
            <label class="form-label">Data</label>
            <input v-model="form.date" type="date" class="form-control" required />
          </div>
          <div class="col-12 col-md-6 col-xl-3">
            <label class="form-label">Local</label>
            <input v-model="form.location" class="form-control" placeholder="Arena Red Devils" required />
          </div>
          <div class="col-4 col-xl-2">
            <label class="form-label">Times</label>
            <input v-model.number="form.qtd_times" type="number" min="2" class="form-control" required />
          </div>
          <div class="col-4 col-xl-2">
            <label class="form-label">Jogadores/Time</label>
            <input v-model.number="form.qtd_jogadores_por_time" type="number" min="1" class="form-control" required />
          </div>
          <div class="col-4 col-xl-2">
            <label class="form-label">Goleiros</label>
            <input v-model.number="form.qtd_goleiros" type="number" min="0" class="form-control" required />
          </div>
          <div class="col-12">
            <button class="btn btn-red" :disabled="isLoading">
              {{ isLoading ? 'Salvando...' : 'Criar pelada' }}
            </button>
          </div>
        </form>
      </div>
    </section>

    <section class="surface-card">
      <div class="surface-card-body">
        <div class="section-toolbar">
          <h2 class="section-title mb-0">Lista de peladas</h2>
          <span class="text-muted small">{{ peladas.length }} registro{{ peladas.length !== 1 ? 's' : '' }}</span>
        </div>

        <div v-if="isLoading" class="text-muted">Carregando...</div>
        <div v-else-if="peladas.length === 0" class="text-muted">Nenhuma pelada encontrada.</div>
        <div v-else class="table-responsive">
          <table class="table red-table align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Local</th>
                <th>Times</th>
                <th>Jogadores/Time</th>
                <th>Goleiros</th>
                <th>Status</th>
                <th class="text-end">Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pelada in peladas" :key="pelada.id">
                <td>{{ pelada.id }}</td>
                <td class="fw-bold">{{ formatDate(pelada.date) }}</td>
                <td>{{ pelada.location }}</td>
                <td>{{ pelada.qtd_times }}</td>
                <td>{{ pelada.qtd_jogadores_por_time }}</td>
                <td>{{ pelada.qtd_goleiros }}</td>
                <td>
                  <span v-if="pelada.hasStatistics === undefined" class="pill-badge pill-muted">
                    Verificando
                  </span>
                  <span v-else class="pill-badge" :class="pelada.hasStatistics ? 'pill-ok' : 'pill-muted'">
                    {{ pelada.hasStatistics ? 'Com estatisticas' : 'Sem estatisticas' }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="d-flex flex-wrap justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-primary" @click="editPelada(pelada.id)" :disabled="isLoading">
                      Estatisticas
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="removePelada(pelada.id)" :disabled="isLoading">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { AdminService } from '../services/adminService'
import { PeladaService } from '../services/peladaService'
import { StatisticsService } from '../services/statisticsService'
import type { CreatePeladaRequest, Pelada } from '../types'

interface PeladaWithStats extends Pelada {
  hasStatistics?: boolean
}

const router = useRouter()
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

const fetchPeladas = async () => {
  isLoading.value = true
  try {
    const fetchedPeladas = await PeladaService.getAllPeladas()
    peladas.value = fetchedPeladas.map((pelada) => ({ ...pelada, hasStatistics: undefined }))
    isLoading.value = false

    fetchedPeladas.forEach(async (pelada) => {
      try {
        const hasStats = await StatisticsService.hasPeladaStatistics(pelada.id)
        const index = peladas.value.findIndex((item) => item.id === pelada.id)
        if (index !== -1) {
          peladas.value[index].hasStatistics = hasStats
        }
      } catch {
        const index = peladas.value.findIndex((item) => item.id === pelada.id)
        if (index !== -1) {
          peladas.value[index].hasStatistics = false
        }
      }
    })
  } catch (error) {
    console.error(error)
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
    form.value = {
      date: '',
      location: '',
      qtd_times: 2,
      qtd_jogadores_por_time: 5,
      qtd_goleiros: 0
    }
  } catch (error) {
    console.error(error)
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
    toast.success('Pelada excluida')
    await fetchPeladas()
  } catch (error) {
    console.error(error)
    toast.error('Falha ao excluir pelada')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPeladas)
</script>
