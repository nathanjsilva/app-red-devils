<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand text-center">
        <img :src="logo" alt="Red Devils" class="login-logo" />
        <p class="login-kicker">Acesso administrativo</p>
        <h1 class="login-title">Entrar no painel</h1>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
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
            placeholder="Digite sua senha"
          />
          <div v-if="errors.password" id="password-error" class="invalid-feedback">
            {{ errors.password }}
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-red-devils w-100 fw-semibold login-submit"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>

        <button
          type="button"
          class="btn btn-outline-danger w-100 login-secondary"
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
