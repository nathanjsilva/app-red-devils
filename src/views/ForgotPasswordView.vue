<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="text-center mb-4">
        <img :src="logo" alt="Red Devils" class="logo-img" />
        <h1 class="h4 fw-bold text-red-devils">Esqueci a Senha</h1>
        <p class="text-muted">Digite seu e-mail para receber instruções de recuperação</p>
      </div>

      <form @submit.prevent="handleForgotPassword">
        <div class="mb-4">
          <label for="email" class="form-label">E-mail</label>
          <input 
            id="email" 
            v-model="form.email" 
            type="email" 
            required 
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
            aria-describedby="email-error"
            placeholder="Digite seu e-mail cadastrado"
          />
          <div v-if="errors.email" id="email-error" class="invalid-feedback">
            {{ errors.email }}
          </div>
        </div>

        <button 
          type="submit" 
          class="btn btn-red-devils w-100 fw-semibold"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isLoading ? 'Enviando...' : 'Enviar Instruções' }}
        </button>

        <div class="text-center mt-4">
          <small>Lembrou da senha?
            <router-link to="/" class="text-red-devils text-decoration-none">Voltar ao Login</router-link>
          </small>
        </div>
      </form>

      <!-- Mensagem de sucesso -->
      <div v-if="emailSent" class="alert alert-success mt-4">
        <i class="bi bi-check-circle me-2"></i>
        <strong>E-mail enviado!</strong><br>
        Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useForm } from '../composables/useForm'
import { useSEO } from '../composables/useSEO'
import logo from '../assets/logo-red-devils.png'

const router = useRouter()
const { forgotPassword, isLoading } = useAuth()
const { updateSEO } = useSEO()

const { form, errors, validate, executeWithLoading } = useForm({
  email: ''
})

const emailSent = ref(false)

onMounted(() => {
  updateSEO({
    title: 'Esqueci a Senha - Red Devils',
    description: 'Recupere sua senha do Red Devils inserindo seu e-mail cadastrado.'
  })
})

const handleForgotPassword = async () => {
  const isValid = validate([
    () => form.email ? true : (errors.email = 'E-mail é obrigatório', false)
  ])

  if (!isValid) return

  await executeWithLoading(async () => {
    const success = await forgotPassword(form.email)
    if (success) {
      emailSent.value = true
    }
  })
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: var(--gray-light);
  padding-left: 1rem;
  padding-right: 1rem;
}

.forgot-password-card {
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

.alert {
  border-radius: 0.5rem;
}
</style>







