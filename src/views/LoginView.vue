<template>
  <div class="login-container">
    <div class="login-card">
      <div class="text-center mb-4">
        <img :src="logo" alt="Red Devils" class="logo-img" />
        <h1 class="h4 fw-bold text-red-devils">Red Devils</h1>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="username" class="form-label">Usuario</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            class="form-control"
            :class="{ 'is-invalid': errors.username }"
            aria-describedby="username-error"
            placeholder="Ex.: ADMIN"
          />
          <div v-if="errors.username" id="username-error" class="invalid-feedback">
            {{ errors.username }}
          </div>
        </div>

        <div class="mb-4">
          <label for="password" class="form-label">Senha</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="form-control"
            :class="{ 'is-invalid': errors.password }"
            aria-describedby="password-error"
          />
          <div v-if="errors.password" id="password-error" class="invalid-feedback">
            {{ errors.password }}
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-red-devils w-100 fw-semibold"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>

        <div class="text-center my-3 text-muted">ou</div>

        <button
          type="button"
          class="btn btn-outline-danger w-100"
          @click="goToOverview"
        >
          Ver estatisticas publicas
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useForm } from '../composables/useForm'
import { useSEO } from '../composables/useSEO'
import logo from '../assets/logo-red-devils.png'

const router = useRouter()
const { login, isLoading } = useAuth()
const { updateSEO } = useSEO()

const { form, errors, validate, executeWithLoading } = useForm({
  username: '',
  password: ''
})

onMounted(() => {
  updateSEO({
    title: 'Login - Red Devils',
    description: 'Faca login no sistema Red Devils para acessar a area administrativa.'
  })
})

const handleLogin = async () => {
  const isValid = validate([
    () => form.username ? true : (errors.username = 'Usuario e obrigatorio', false),
    () => form.password ? true : (errors.password = 'Senha e obrigatoria', false)
  ])

  if (!isValid) return

  await executeWithLoading(async () => {
    await login({
      username: form.username,
      password: form.password
    })
  })
}

const goToOverview = () => {
  router.push('/players-overview')
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  padding-left: 1rem;
  padding-right: 1rem;
}

.login-card {
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
