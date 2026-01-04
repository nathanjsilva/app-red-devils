<template>
  <div class="container py-4">
    <h2 class="mb-3">Admin · Jogadores</h2>

    <!-- Criar jogador -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">Criar jogador</h5>
        <form class="row g-3" @submit.prevent="handleCreate">
          <div class="col-md-4">
            <label class="form-label">Nome completo</label>
            <input v-model="form.name" class="form-control" placeholder="Ex.: João da Silva" required />
          </div>
          <div class="col-md-4">
            <label class="form-label">E-mail</label>
            <input v-model="form.email" class="form-control" type="email" placeholder="email@dominio.com" required />
          </div>
          <div class="col-md-4">
            <label class="form-label">Senha</label>
            <input v-model="form.password" class="form-control" type="password" placeholder="Mín. 8 caracteres" required />
          </div>
          <div class="col-md-3">
            <label class="form-label">Posição</label>
            <select v-model="form.position" class="form-select" required>
              <option disabled value="">Selecione</option>
              <option value="linha">Jogador de Linha</option>
              <option value="goleiro">Goleiro</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Telefone</label>
            <input 
              v-model="form.phone" 
              class="form-control" 
              placeholder="(11) 99999-9999" 
              maxlength="15"
              @input="form.phone = applyPhoneMask(form.phone)"
              required 
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Apelido</label>
            <input v-model="form.nickname" class="form-control" placeholder="Ex.: joao10" required />
          </div>
          <div class="col-md-3 d-flex align-items-center">
            <div class="form-check mt-4">
              <input id="isAdmin" v-model="form.is_admin" class="form-check-input" type="checkbox" />
              <label class="form-check-label" for="isAdmin">Admin</label>
            </div>
          </div>
          <div class="col-12">
            <button class="btn btn-red" :disabled="isLoading">{{ isLoading ? 'Salvando...' : 'Criar' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Lista de jogadores -->
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="card-title m-0">Jogadores</h5>
          <button class="btn btn-outline-secondary btn-sm" @click="fetchPlayers" :disabled="isLoading">Recarregar</button>
        </div>
        <div v-if="isLoading">Carregando...</div>
        <div v-else>
          <div v-if="players.length === 0" class="text-muted">Nenhum jogador encontrado.</div>
          <div v-else class="table-responsive">
            <table class="table table-sm align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Apelido</th>
                  <th>Posição</th>
                  <th>Admin</th>
                  <th class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in players" :key="p.id">
                  <td>{{ p.id }}</td>
                  <td>{{ p.name }}</td>
                  <td>{{ p.email }}</td>
                  <td>{{ p.nickname }}</td>
                  <td>{{ p.position }}</td>
                  <td>
                    <span class="badge" :class="p.is_admin ? 'bg-success' : 'bg-secondary'">{{ p.is_admin ? 'Sim' : 'Não' }}</span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-2" @click="toggleAdmin(p)" :disabled="isLoading">
                      {{ p.is_admin ? 'Remover admin' : 'Tornar admin' }}
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="removePlayer(p)" :disabled="isLoading">Excluir</button>
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
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { PlayerService } from '../services/playerService'
import { AdminService } from '../services/adminService'
import { applyPhoneMask, cleanPhone } from '../utils/phoneMask'
import type { Player, CreatePlayerRequest } from '../types'

const toast = useToast()
const players = ref<Player[]>([])
const isLoading = ref(false)

const form = ref<CreatePlayerRequest>({
  name: '',
  email: '',
  password: '',
  position: 'linha',
  phone: '',
  nickname: '',
  is_admin: false
})

const fetchPlayers = async () => {
  isLoading.value = true
  try {
    players.value = await PlayerService.getAllPlayers()
  } catch (e: any) {
    console.error(e)
    toast.error('Falha ao carregar jogadores')
  } finally {
    isLoading.value = false
  }
}

// Watch para aplicar máscara no telefone
watch(() => form.value.phone, (newValue) => {
  const maskedValue = applyPhoneMask(newValue)
  if (maskedValue !== newValue) {
    form.value.phone = maskedValue
  }
})

const handleCreate = async () => {
  isLoading.value = true
  try {
    // Limpar a máscara do telefone antes de enviar
    const playerData = {
      ...form.value,
      phone: cleanPhone(form.value.phone)
    }
    
    const created = await AdminService.createPlayer(playerData)
    toast.success(`Jogador "${created.name}" criado`)
    await fetchPlayers()
    form.value = { name: '', email: '', password: '', position: 'linha', phone: '', nickname: '', is_admin: false }
  } catch (e: any) {
    console.error(e)
    toast.error('Falha ao criar jogador')
  } finally {
    isLoading.value = false
  }
}

const toggleAdmin = async (player: Player) => {
  isLoading.value = true
  try {
    if (player.is_admin) {
      await AdminService.removeAdmin(player.id)
      toast.success('Permissão de admin removida')
    } else {
      await AdminService.makeAdmin(player.id)
      toast.success('Jogador promovido a admin')
    }
    await fetchPlayers()
  } catch (e: any) {
    console.error(e)
    toast.error('Falha ao alterar permissão')
  } finally {
    isLoading.value = false
  }
}

const removePlayer = async (player: Player) => {
  if (!confirm(`Excluir jogador "${player.name}"?`)) return
  isLoading.value = true
  try {
    await AdminService.deletePlayer(player.id)
    toast.success('Jogador excluído')
    await fetchPlayers()
  } catch (e: any) {
    console.error(e)
    toast.error('Falha ao excluir jogador')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPlayers)
</script>

<style scoped>
.btn-red { background-color: var(--red-devils); color: #fff; }
.btn-red:hover { background-color: var(--red-devils-hover); }
</style>


