<template>
  <div class="page-shell py-4">
    <div class="page-header">
      <div>
        <h1 class="page-title">Jogadores</h1>
        <p class="page-subtitle">Cadastre, edite e remova jogadores do elenco.</p>
      </div>
      <button class="btn btn-outline-secondary" @click="fetchPlayers" :disabled="isLoading">
        Recarregar lista
      </button>
    </div>

    <section class="surface-card">
      <div class="surface-card-body">
        <h2 class="section-title">{{ editingPlayer ? 'Editar jogador' : 'Novo jogador' }}</h2>
        <form class="row g-3" @submit.prevent="handleSubmit">
          <div class="col-12 col-lg-4">
            <label class="form-label">Nome completo</label>
            <input v-model="form.name" class="form-control" placeholder="Ex.: Joao da Silva" required />
          </div>

          <div class="col-12 col-lg-4">
            <label class="form-label">Apelido</label>
            <input v-model="form.nickname" class="form-control" placeholder="Ex.: joao10" required />
          </div>

          <div class="col-12 col-lg-4">
            <label class="form-label">Posicao</label>
            <select v-model="form.position" class="form-select" required>
              <option disabled value="">Selecione</option>
              <option value="linha">Jogador de linha</option>
              <option value="goleiro">Goleiro</option>
            </select>
          </div>

          <div class="col-12 d-flex flex-wrap gap-2">
            <button class="btn btn-red" :disabled="isLoading">
              {{ isLoading ? 'Salvando...' : (editingPlayer ? 'Salvar alteracoes' : 'Criar jogador') }}
            </button>
            <button
              v-if="editingPlayer"
              class="btn btn-outline-secondary"
              type="button"
              @click="cancelEdit"
              :disabled="isLoading"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </section>

    <section class="surface-card">
      <div class="surface-card-body">
        <div class="section-toolbar">
          <h2 class="section-title mb-0">Lista de jogadores</h2>
          <span class="text-muted small">{{ players.length }} jogador{{ players.length !== 1 ? 'es' : '' }}</span>
        </div>

        <div v-if="isLoading" class="text-muted">Carregando...</div>
        <div v-else-if="players.length === 0" class="text-muted">Nenhum jogador encontrado.</div>
        <div v-else class="table-responsive">
          <table class="table red-table align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Apelido</th>
                <th>Posicao</th>
                <th class="text-end">Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in players" :key="player.id">
                <td>{{ player.id }}</td>
                <td class="fw-bold">{{ player.name }}</td>
                <td>{{ player.nickname }}</td>
                <td>
                  <span class="pill-badge" :class="player.position === 'goleiro' ? 'pill-info' : 'pill-muted'">
                    {{ player.position }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="d-flex flex-wrap justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-primary" @click="editPlayer(player)" :disabled="isLoading">
                      Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="removePlayer(player)" :disabled="isLoading">
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
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { AdminService } from '../services/adminService'
import { PlayerService } from '../services/playerService'
import type { CreatePlayerRequest, Player, UpdatePlayerRequest } from '../types'

const toast = useToast()
const players = ref<Player[]>([])
const isLoading = ref(false)
const editingPlayer = ref<Player | null>(null)

const form = ref<CreatePlayerRequest>({
  name: '',
  nickname: '',
  position: 'linha'
})

const resetForm = () => {
  form.value = {
    name: '',
    nickname: '',
    position: 'linha'
  }
  editingPlayer.value = null
}

const fetchPlayers = async () => {
  isLoading.value = true
  try {
    players.value = await PlayerService.getAllPlayers()
  } catch (error) {
    console.error(error)
    toast.error('Falha ao carregar jogadores')
  } finally {
    isLoading.value = false
  }
}

const editPlayer = (player: Player) => {
  editingPlayer.value = player
  form.value = {
    name: player.name,
    nickname: player.nickname,
    position: player.position
  }
}

const cancelEdit = () => {
  resetForm()
}

const handleSubmit = async () => {
  isLoading.value = true
  try {
    if (editingPlayer.value) {
      const updateData: UpdatePlayerRequest = {
        name: form.value.name,
        nickname: form.value.nickname,
        position: form.value.position
      }
      await AdminService.updatePlayer(editingPlayer.value.id, updateData)
      toast.success(`Jogador "${form.value.name}" atualizado`)
    } else {
      await AdminService.createPlayer(form.value)
      toast.success(`Jogador "${form.value.name}" criado`)
    }

    await fetchPlayers()
    resetForm()
  } catch (error) {
    console.error(error)
    toast.error(editingPlayer.value ? 'Falha ao atualizar jogador' : 'Falha ao criar jogador')
  } finally {
    isLoading.value = false
  }
}

const removePlayer = async (player: Player) => {
  if (!confirm(`Excluir jogador "${player.name}"?`)) return

  isLoading.value = true
  try {
    await AdminService.deletePlayer(player.id)
    toast.success('Jogador excluido')
    await fetchPlayers()
  } catch (error) {
    console.error(error)
    toast.error('Falha ao excluir jogador')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPlayers)
</script>
