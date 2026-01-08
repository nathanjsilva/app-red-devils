<template>
  <div class="container py-4">
    <h2 class="mb-3">Admin · Jogadores</h2>

    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">{{ editingPlayer ? 'Editar jogador' : 'Criar jogador' }}</h5>
        <form class="row g-3" @submit.prevent="handleSubmit">
          <div class="col-md-12 mb-3">
            <label class="form-label">Vincular a usuário existente (opcional)</label>
            <select 
              v-model.number="form.user_id" 
              class="form-select"
              :disabled="isLoadingUsers"
            >
              <option :value="null">Nenhum - Criar jogador sem vínculo</option>
              <option 
                v-for="user in availableUsers" 
                :key="user.id" 
                :value="user.id"
              >
                #{{ user.id }} - {{ user.name }} ({{ user.email }}) - {{ user.player ? '✓ Já vinculado' : 'Disponível' }}
              </option>
            </select>
            <small class="text-muted">
              Se selecionar um usuário, email e senha não são necessários (opcional).
              Se não selecionar, é necessário informar email e senha.
            </small>
          </div>

          <div class="col-md-4">
            <label class="form-label">Nome completo <span class="text-danger">*</span></label>
            <input v-model="form.name" class="form-control" placeholder="Ex.: João da Silva" required />
          </div>

          <div class="col-md-4">
            <label class="form-label">E-mail <span v-if="!form.user_id" class="text-danger">*</span></label>
            <input 
              v-model="form.email" 
              class="form-control" 
              type="email" 
              placeholder="email@dominio.com" 
              :required="!form.user_id"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Senha <span v-if="!form.user_id && !editingPlayer" class="text-danger">*</span></label>
            <input 
              v-model="form.password" 
              class="form-control" 
              type="password" 
              placeholder="Mín. 8 caracteres" 
              :required="!form.user_id && !editingPlayer"
            />
          </div>

          <div class="col-md-3">
            <label class="form-label">Posição <span class="text-danger">*</span></label>
            <select v-model="form.position" class="form-select" required>
              <option disabled value="">Selecione</option>
              <option value="linha">Jogador de Linha</option>
              <option value="goleiro">Goleiro</option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Telefone <span class="text-danger">*</span></label>
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
            <label class="form-label">Apelido <span class="text-danger">*</span></label>
            <input v-model="form.nickname" class="form-control" placeholder="Ex.: joao10" required />
          </div>

          <div class="col-md-3 d-flex align-items-center">
            <div class="form-check mt-4">
              <input id="isAdmin" v-model="form.is_admin" class="form-check-input" type="checkbox" />
              <label class="form-check-label" for="isAdmin">Admin</label>
            </div>
          </div>

          <div class="col-12">
            <button class="btn btn-red me-2" :disabled="isLoading">
              {{ isLoading ? 'Salvando...' : (editingPlayer ? 'Salvar alterações' : 'Criar') }}
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
    </div>

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
                  <th>Usuário</th>
                  <th>Admin</th>
                  <th class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in players" :key="p.id">
                  <td>{{ p.id }}</td>
                  <td>{{ p.name }}</td>
                  <td>{{ p.email || '—' }}</td>
                  <td>{{ p.nickname }}</td>
                  <td>{{ p.position }}</td>
                  <td>
                    <span v-if="p.user_id" class="badge bg-success">Vinculado (User #{{ p.user_id }})</span>
                    <span v-else class="badge bg-secondary">Não vinculado</span>
                  </td>
                  <td>
                    <span class="badge" :class="p.is_admin ? 'bg-success' : 'bg-secondary'">{{ p.is_admin ? 'Sim' : 'Não' }}</span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-2" @click="editPlayer(p)" :disabled="isLoading">
                      Editar
                    </button>
                    <button class="btn btn-sm btn-outline-warning me-2" @click="toggleAdmin(p)" :disabled="isLoading">
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
import { AdminService } from '../services/adminService'
import { PlayerService } from '../services/playerService'
import { applyPhoneMask, cleanPhone } from '../utils/phoneMask'
import type { Player, CreatePlayerRequest, UpdatePlayerRequest, User } from '../types'

const toast = useToast()
const players = ref<Player[]>([])
const users = ref<User[]>([])
const isLoading = ref(false)
const isLoadingUsers = ref(false)
const editingPlayer = ref<Player | null>(null)

const form = ref<CreatePlayerRequest & { user_id?: number | null }>({
  name: '',
  email: '',
  password: '',
  position: 'linha',
  phone: '',
  nickname: '',
  is_admin: false,
  user_id: null
})

const availableUsers = ref<User[]>([])

const fetchUsers = async () => {
  isLoadingUsers.value = true
  try {
    users.value = await AdminService.getUsers()
    updateAvailableUsers()
  } catch (e: any) {
    console.error(e)
    toast.error('Falha ao carregar usuários')
  } finally {
    isLoadingUsers.value = false
  }
}

const updateAvailableUsers = () => {
  const playerUserIds = new Set(players.value.map(p => p.user_id).filter(id => id !== null))
  availableUsers.value = users.value.filter(u => !playerUserIds.has(u.id) || (editingPlayer.value && editingPlayer.value.user_id === u.id))
}

const fetchPlayers = async () => {
  isLoading.value = true
  try {
    players.value = await PlayerService.getAllPlayers()
    updateAvailableUsers()
  } catch (e: any) {
    console.error(e)
    toast.error('Falha ao carregar jogadores')
  } finally {
    isLoading.value = false
  }
}

watch(() => form.value.user_id, (newUserId) => {
  if (newUserId) {
    const selectedUser = users.value.find(u => u.id === newUserId)
    if (selectedUser && !editingPlayer.value) {
      form.value.name = selectedUser.name
      form.value.email = selectedUser.email
      form.value.position = selectedUser.position
    }
  }
})

watch(() => form.value.phone, (newValue) => {
  const maskedValue = applyPhoneMask(newValue)
  if (maskedValue !== newValue) {
    form.value.phone = maskedValue
  }
})

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    password: '',
    position: 'linha',
    phone: '',
    nickname: '',
    is_admin: false,
    user_id: null
  }
  editingPlayer.value = null
}

const cancelEdit = () => {
  resetForm()
}

const editPlayer = (player: Player) => {
  editingPlayer.value = player
  form.value = {
    name: player.name,
    email: player.email || '',
    password: '',
    position: player.position,
    phone: player.phone,
    nickname: player.nickname,
    is_admin: player.is_admin,
    user_id: player.user_id || null
  }
  updateAvailableUsers()
}

const handleSubmit = async () => {
  isLoading.value = true
  try {
    const cleanPhoneValue = cleanPhone(form.value.phone)
    
    if (editingPlayer.value) {
      const updateData: UpdatePlayerRequest = {
        name: form.value.name,
        email: form.value.email || undefined,
        position: form.value.position,
        phone: cleanPhoneValue,
        nickname: form.value.nickname,
        is_admin: form.value.is_admin,
        user_id: form.value.user_id === null ? null : form.value.user_id
      }

      if (form.value.password) {
        updateData.new_password = form.value.password
      }

      await AdminService.updatePlayer(editingPlayer.value.id, updateData)
      toast.success(`Jogador "${form.value.name}" atualizado`)
    } else {
      const playerData: CreatePlayerRequest = {
        name: form.value.name,
        email: form.value.email || undefined,
        password: form.value.password || undefined,
        position: form.value.position,
        phone: cleanPhoneValue,
        nickname: form.value.nickname,
        is_admin: form.value.is_admin,
        user_id: form.value.user_id === null ? undefined : form.value.user_id
      }

      await AdminService.createPlayer(playerData)
      toast.success(`Jogador "${form.value.name}" criado`)
    }
    
    await fetchPlayers()
    resetForm()
  } catch (e: any) {
    console.error(e)
    toast.error(editingPlayer.value ? 'Falha ao atualizar jogador' : 'Falha ao criar jogador')
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

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchPlayers()])
})
</script>

<style scoped>
.btn-red { background-color: var(--red-devils); color: #fff; }
.btn-red:hover { background-color: var(--red-devils-hover); }
</style>
