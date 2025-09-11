<template>
  <div class="register-container">
    <div class="register-card">
      <div class="text-center mb-4">
        <img :src="logo" alt="Red Devils" class="logo-img" />
        <h1 class="h4 fw-bold text-red-devils">
          {{ isEdit ? "Editar Conta" : "Criar Conta" }}
        </h1>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="name" class="form-label">Nome</label>
          <input 
            id="name" 
            v-model="form.name" 
            type="text" 
            required 
            class="form-control"
            :class="{ 'is-invalid': errors.name }"
            aria-describedby="name-error"
          />
          <div v-if="errors.name" id="name-error" class="invalid-feedback">
            {{ errors.name }}
          </div>
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">E-mail</label>
          <input 
            id="email" 
            v-model="form.email" 
            type="email" 
            required 
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
            aria-describedby="email-error"
          />
          <div v-if="errors.email" id="email-error" class="invalid-feedback">
            {{ errors.email }}
          </div>
        </div>

        <!-- Cadastro: senha única -->
        <div v-if="!isEdit" class="mb-3">
          <label for="password" class="form-label">Senha</label>
          <div class="input-group">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="form.password" 
              required
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              aria-describedby="password-error"
            />
            <button 
              type="button" 
              class="btn btn-outline-secondary" 
              @click="togglePassword"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div v-if="errors.password" id="password-error" class="invalid-feedback">
            {{ errors.password }}
          </div>
        </div>

        <!-- Edição: senha antiga + nova -->
        <div v-else>
          <div class="mb-3">
            <label for="oldPassword" class="form-label">Senha Antiga</label>
            <div class="input-group">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="oldPassword" 
                v-model="form.oldPassword"
                class="form-control"
                :class="{ 'is-invalid': errors.oldPassword }"
                aria-describedby="oldPassword-error"
              />
              <button 
                type="button" 
                class="btn btn-outline-secondary" 
                @click="togglePassword"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div v-if="errors.oldPassword" id="oldPassword-error" class="invalid-feedback">
              {{ errors.oldPassword }}
            </div>
          </div>

          <div class="mb-3">
            <label for="newPassword" class="form-label">Senha Nova</label>
            <div class="input-group">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="newPassword" 
                v-model="form.newPassword"
                class="form-control"
                :class="{ 'is-invalid': errors.newPassword }"
                aria-describedby="newPassword-error"
              />
              <button 
                type="button" 
                class="btn btn-outline-secondary" 
                @click="togglePassword"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div v-if="errors.newPassword" id="newPassword-error" class="invalid-feedback">
              {{ errors.newPassword }}
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label for="position" class="form-label">Posição</label>
          <select 
            id="position" 
            v-model="form.position" 
            class="form-select"
            :class="{ 'is-invalid': errors.position }"
            required
            aria-describedby="position-error"
          >
            <option disabled value="">Selecione a posição</option>
            <option value="linha">Jogador de Linha</option>
            <option value="goleiro">Goleiro</option>
          </select>
          <div v-if="errors.position" id="position-error" class="invalid-feedback">
            {{ errors.position }}
          </div>
        </div>

        <button 
          type="submit" 
          class="btn btn-red-devils w-100"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isLoading ? (isEdit ? 'Salvando...' : 'Cadastrando...') : (isEdit ? 'Editar' : 'Cadastrar') }}
        </button>

        <div v-if="!isEdit" class="text-center mt-3">
          <small>Já tem uma conta?
            <a href="/" class="text-red-devils text-decoration-none">Entrar</a>
          </small>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useForm } from '../composables/useForm'
import { usePlayersStore } from '../stores/players'
import { useToast } from 'vue-toastification'
import logo from '../assets/logo-red-devils.png'
import type { UpdatePlayerRequest } from '../types'

const router = useRouter()
const toast = useToast()
const { user, register } = useAuth()
const playersStore = usePlayersStore()

const isEdit = ref(false)
const showPassword = ref(false)

const { form, errors, validate, executeWithLoading } = useForm({
  name: '',
  email: '',
  password: '',
  oldPassword: '',
  newPassword: '',
  position: ''
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

onMounted(async () => {
  if (user.value) {
    isEdit.value = true
    form.name = user.value.name
    form.email = user.value.email
    form.position = user.value.position
  }
})

const handleSubmit = async () => {
  const validations = [
    () => form.name ? true : (errors.name = 'Nome é obrigatório', false),
    () => form.email ? true : (errors.email = 'E-mail é obrigatório', false),
    () => form.position ? true : (errors.position = 'Posição é obrigatória', false)
  ]

  if (!isEdit.value) {
    validations.push(
      () => form.password ? true : (errors.password = 'Senha é obrigatória', false)
    )
  }

  const isValid = validate(validations)
  if (!isValid) return

  await executeWithLoading(async () => {
    try {
      if (isEdit.value && user.value) {
        const updateData: UpdatePlayerRequest = {
          name: form.name,
          email: form.email,
          position: form.position as 'linha' | 'goleiro'
        }

        if (form.oldPassword && form.newPassword) {
          updateData.old_password = form.oldPassword
          updateData.new_password = form.newPassword
        }

        await playersStore.updatePlayer(user.value.id, updateData)
        toast.success('Perfil atualizado com sucesso!')
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          position: form.position as 'linha' | 'goleiro'
        })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  })
}
</script>

<style scoped>
.register-container {
  display: flex;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: var(--gray-light);
  padding-left: 1rem;
  padding-right: 1rem;
}

.register-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 1rem;
  background-color: #fff;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.logo-img {
  height: 60px;
}

.text-red-devils {
  color: var(--red-devils);
}

.btn-red-devils {
  background-color: var(--red-devils);
  border: 1px solid var(--red-devils-border);
  color: #fff;
  transition: background-color 0.2s;
}

.btn-red-devils:hover {
  background-color: var(--red-devils-hover);
}
</style>
