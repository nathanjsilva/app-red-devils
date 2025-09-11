<template>
  <div class="login-container">
    <div class="login-card">
      <div class="text-center mb-4">
        <img :src="logo" alt="Red Devils" class="logo-img" />
        <h1 class="h4 fw-bold text-red-devils">Red Devils</h1>
      </div>

      <form @submit.prevent="handleLogin">
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

        <div class="mb-3">
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

        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="form-check">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="rememberMe" 
              v-model="form.rememberMe" 
            />
            <label class="form-check-label" for="rememberMe">
              Lembrar-me
            </label>
          </div>
          <a href="#" class="text-red-devils text-decoration-none">Esqueci a senha</a>
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
          class="btn btn-outline-danger w-100 mt-2" 
          @click="goToRegister"
        >
          Criar conta
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useForm } from '../composables/useForm'
import { useSEO } from '../composables/useSEO'
import { useRouter } from 'vue-router'
import logo from '../assets/logo-red-devils.png'

const router = useRouter()
const { login, isLoading } = useAuth()
const { updateSEO } = useSEO()

const { form, errors, validate, executeWithLoading } = useForm({
  email: '',
  password: '',
  rememberMe: false
})

onMounted(() => {
  updateSEO({
    title: 'Login - Red Devils',
    description: 'Faça login no sistema Red Devils para acessar estatísticas e rankings da pelada.'
  })
})

const handleLogin = async () => {
  const isValid = validate([
    () => form.email ? true : (errors.email = 'E-mail é obrigatório', false),
    () => form.password ? true : (errors.password = 'Senha é obrigatória', false)
  ])

  if (!isValid) return

  await executeWithLoading(async () => {
    const success = await login({
      email: form.email,
      password: form.password
    })
    
    if (success) {
      router.push('/home')
    }
  })
}

const goToRegister = () => {
  router.push('/register')
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
