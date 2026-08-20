<template>
  <div class="page-shell py-4">
    <div class="page-header">
      <div>
        <h1 class="page-title">Peladas</h1>
        <p class="page-subtitle">Todas as peladas já cadastradas. Clique numa linha para ver os números do dia.</p>
      </div>
    </div>

    <section class="surface-card">
      <div class="surface-card-body">
        <div class="section-toolbar">
          <h2 class="section-title mb-0">Lista de peladas</h2>
          <span class="text-muted small">{{ peladas.length }} registro{{ peladas.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="row g-3 align-items-end mb-3">
          <div class="col-12 col-md-4">
            <label class="form-label">Buscar por data</label>
            <input v-model="searchDate" type="date" class="form-control" />
          </div>
          <div class="col-12 col-md-auto d-flex gap-2">
            <button class="btn btn-outline-secondary" @click="searchByDate" :disabled="isLoading || !searchDate">
              Buscar
            </button>
            <button v-if="isSearchActive" class="btn btn-outline-secondary" @click="clearSearch" :disabled="isLoading">
              Limpar busca
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="text-muted">Carregando...</div>
        <div v-else-if="peladas.length === 0" class="text-muted">
          {{ isSearchActive ? 'Nenhuma pelada encontrada nessa data.' : 'Nenhuma pelada encontrada.' }}
        </div>
        <template v-else>
          <div class="table-responsive">
            <table class="data-table stack-mobile">
              <thead>
                <tr>
                  <th>Data</th>
                  <th class="hide-mobile">Divisao</th>
                  <th>Local</th>
                  <th class="hide-mobile">Times</th>
                  <th class="hide-mobile">Jogadores/Time</th>
                  <th class="hide-mobile">Goleiros</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="pelada in paginatedPeladas"
                  :key="pelada.id"
                  class="clickable-row"
                  @click="router.push(`/peladas/${pelada.id}`)"
                >
                  <td class="fw-bold" data-label="Data">{{ formatDate(pelada.date) }}</td>
                  <td class="hide-mobile" data-label="Divisao">
                    <span class="pill-badge pill-info">{{ pelada.division === 'sabado' ? 'Sabado' : 'Quinta' }}</span>
                  </td>
                  <td data-label="Local">{{ pelada.location }}</td>
                  <td class="hide-mobile" data-label="Times">{{ pelada.qtd_times }}</td>
                  <td class="hide-mobile" data-label="Jogadores/Time">{{ pelada.qtd_jogadores_por_time }}</td>
                  <td class="hide-mobile" data-label="Goleiros">{{ pelada.qtd_goleiros }}</td>
                  <td data-label="Status">
                    <span v-if="pelada.hasStatistics === undefined" class="pill-badge pill-muted">
                      Verificando
                    </span>
                    <span v-else class="pill-badge" :class="pelada.hasStatistics ? 'pill-ok' : 'pill-muted'">
                      {{ pelada.hasStatistics ? 'Com estatisticas' : 'Sem estatisticas' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="peladas.length"
            :page-size="pageSize"
            :page-size-options="pageSizeOptions"
            @update:current-page="currentPage = $event"
            @update:page-size="pageSize = $event"
          />
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { PeladaService } from '../services/peladaService'
import { StatisticsService } from '../services/statisticsService'
import Pagination from '../components/ui/Pagination.vue'
import type { Pelada } from '../types'

interface PeladaWithStats extends Pelada {
  hasStatistics?: boolean
}

const router = useRouter()
const toast = useToast()
const peladas = ref<PeladaWithStats[]>([])
const isLoading = ref(false)
const searchDate = ref('')
const isSearchActive = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' }
]
const totalPages = computed(() => Math.max(1, Math.ceil(peladas.value.length / pageSize.value)))
const paginatedPeladas = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return peladas.value.slice(start, start + pageSize.value)
})
watch(pageSize, () => { currentPage.value = 1 })
watch(totalPages, (newTotal) => { if (currentPage.value > newTotal) currentPage.value = newTotal })

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

const applyPeladas = (fetchedPeladas: Pelada[]) => {
  peladas.value = fetchedPeladas.map((pelada) => ({ ...pelada, hasStatistics: undefined }))
  currentPage.value = 1
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
}

const fetchPeladas = async () => {
  isLoading.value = true
  try {
    const fetchedPeladas = await PeladaService.getAllPeladas()
    applyPeladas(fetchedPeladas)
  } catch (error) {
    console.error(error)
    toast.error('Falha ao carregar peladas')
    isLoading.value = false
  }
}

const searchByDate = async () => {
  if (!searchDate.value) return
  isLoading.value = true
  isSearchActive.value = true
  try {
    const fetchedPeladas = await PeladaService.getPeladasByDate(searchDate.value)
    applyPeladas(fetchedPeladas)
  } catch (error) {
    console.error(error)
    toast.error('Falha ao buscar peladas por data')
    isLoading.value = false
  }
}

const clearSearch = () => {
  searchDate.value = ''
  isSearchActive.value = false
  fetchPeladas()
}

onMounted(fetchPeladas)
</script>

<style scoped>
.clickable-row {
  cursor: pointer;
}
</style>
