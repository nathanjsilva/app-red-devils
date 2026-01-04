<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <div class="text-center mb-4">
        <img :src="logo" alt="Red Devils" class="logo-img" />
        <h1 class="h4 fw-bold text-red-devils">Redefinir Senha</h1>
        <p class="text-muted">Digite sua nova senha</p>
      </div>

      <form @submit.prevent="handleResetPassword">
        <div class="mb-3">
          <label for="password" class="form-label">Nova Senha</label>
          <div class="input-group">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="form.password" 
              required
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              aria-describedby="password-error"
              placeholder="Digite sua nova senha"
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

        <div class="mb-4">
          <label for="confirmPassword" class="form-label">Confirmar Nova Senha</label>
          <div class="input-group">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              id="confirmPassword" 
              v-model="form.confirmPassword" 
              required
              class="form-control"
              :class="{ 'is-invalid': errors.confirmPassword }"
              aria-describedby="confirmPassword-error"
              placeholder="Confirme sua nova senha"
            />
            <button 
              type="button" 
              class="btn btn-outline-secondary" 
              @click="toggleConfirmPassword"
              :aria-label="showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div v-if="errors.confirmPassword" id="confirmPassword-error" class="invalid-feedback">
            {{ errors.confirmPassword }}
          </div>
        </div>

        <button 
          type="submit" 
          class="btn btn-red-devils w-100 fw-semibold"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isLoading ? 'Redefinindo...' : 'Redefinir Senha' }}
        </button>

        <div class="text-center mt-4">
          <small>Lembrou da senha?
            <router-link to="/" class="text-red-devils text-decoration-none">Voltar ao Login</router-link>
          </small>
        </div>
      </form>

      <!-- Mensagem de sucesso -->
      <div v-if="passwordReset" class="alert alert-success mt-4">
        <i class="bi bi-check-circle me-2"></i>
        <strong>Senha redefinida com sucesso!</strong><br>
        Sua senha foi alterada. Você pode fazer login com a nova senha.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useForm } from '../composables/useForm'
import { useSEO } from '../composables/useSEO'
import { validatePassword } from '../utils/validation'
import logo from '../assets/logo-red-devils.png'

const router = useRouter()
const route = useRoute()
const { resetPassword, isLoading } = useAuth()
const { updateSEO } = useSEO()

const { form, errors, validate, executeWithLoading } = useForm({
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordReset = ref(false)

// Token da URL
const token = computed(() => route.query.token as string)

onMounted(() => {
  updateSEO({
    title: 'Redefinir Senha - Red Devils',
    description: 'Redefina sua senha do Red Devils.'
  })

  // Verificar se o token existe
  if (!token.value) {
    router.push('/')
  }
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleResetPassword = async () => {
  const isValid = validate([
    () => {
      const passwordValidation = validatePassword(form.password)
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message!
        return false
      }
      return true
    },
    () => {
      if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem'
        return false
      }
      return true
    }
  ])

  if (!isValid) return

  await executeWithLoading(async () => {
    const success = await resetPassword(token.value, form.password)
    if (success) {
      passwordReset.value = true
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }
  })
}
</script>

<style scoped>
.reset-password-container {
  display: flex;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: var(--gray-light);
  padding-left: 1rem;
  padding-right: 1rem;
}

.reset-password-card {
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







