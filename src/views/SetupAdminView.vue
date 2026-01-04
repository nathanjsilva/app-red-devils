<template>
  <div class="setup-admin-container">
    <div class="setup-admin-card">
      <div class="text-center mb-4">
        <img :src="logo" alt="Red Devils" class="logo-img" />
        <h1 class="h4 fw-bold text-red-devils">Configuração Inicial</h1>
        <p class="text-muted">Crie o primeiro administrador do sistema</p>
      </div>

      <form @submit.prevent="handleSetupAdmin">
        <div class="mb-3">
          <label for="name" class="form-label">Nome Completo</label>
          <input 
            id="name" 
            v-model="form.name" 
            type="text" 
            required 
            class="form-control"
            :class="{ 'is-invalid': errors.name }"
            aria-describedby="name-error"
            placeholder="Digite seu nome completo"
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
            placeholder="Digite seu e-mail"
          />
          <div v-if="errors.email" id="email-error" class="invalid-feedback">
            {{ errors.email }}
          </div>
        </div>

        <div class="mb-3">
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
              placeholder="Digite uma senha forte"
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
          <div class="form-text">
            Mínimo 8 caracteres, deve conter: 1 minúscula, 1 maiúscula, 1 número, 1 caractere especial
          </div>
        </div>

        <div class="mb-3">
          <label for="phone" class="form-label">Telefone</label>
          <input 
            id="phone" 
            v-model="form.phone" 
            type="tel" 
            required 
            class="form-control"
            :class="{ 'is-invalid': errors.phone }"
            aria-describedby="phone-error"
            placeholder="(11) 99999-9999"
            maxlength="15"
            @input="form.phone = applyPhoneMask(form.phone)"
          />
          <div v-if="errors.phone" id="phone-error" class="invalid-feedback">
            {{ errors.phone }}
          </div>
        </div>

        <div class="mb-3">
          <label for="nickname" class="form-label">Apelido</label>
          <input 
            id="nickname" 
            v-model="form.nickname" 
            type="text" 
            required 
            class="form-control"
            :class="{ 'is-invalid': errors.nickname }"
            aria-describedby="nickname-error"
            placeholder="Seu apelido no futebol"
          />
          <div v-if="errors.nickname" id="nickname-error" class="invalid-feedback">
            {{ errors.nickname }}
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
          class="btn btn-red-devils w-100 fw-semibold"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isLoading ? 'Criando Admin...' : 'Criar Administrador' }}
        </button>

        <!-- Mensagem de sucesso -->
        <div v-if="adminCreated" class="alert alert-success mt-4">
          <i class="bi bi-check-circle me-2"></i>
          <strong>Administrador criado com sucesso!</strong><br>
          Agora você pode fazer login com suas credenciais.
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useForm } from '../composables/useForm'
import { useSEO } from '../composables/useSEO'
import { applyPhoneMask, cleanPhone } from '../utils/phoneMask'
import logo from '../assets/logo-red-devils.png'
import type { SetupFirstAdminRequest } from '../types'

const router = useRouter()
const { setupFirstAdmin, isLoading } = useAuth()
const { updateSEO } = useSEO()

const { form, errors, validate, executeWithLoading } = useForm({
  name: '',
  email: '',
  password: '',
  phone: '',
  nickname: '',
  position: ''
})

const showPassword = ref(false)
const adminCreated = ref(false)

onMounted(() => {
  updateSEO({
    title: 'Configuração Inicial - Red Devils',
    description: 'Configure o primeiro administrador do sistema Red Devils.'
  })
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// Watch para aplicar máscara no telefone
watch(() => form.phone, (newValue) => {
  const maskedValue = applyPhoneMask(newValue)
  if (maskedValue !== newValue) {
    form.phone = maskedValue
  }
})

const handleSetupAdmin = async () => {
  const isValid = validate([
    () => form.name ? true : (errors.name = 'Nome é obrigatório', false),
    () => form.email ? true : (errors.email = 'E-mail é obrigatório', false),
    () => form.password ? true : (errors.password = 'Senha é obrigatória', false),
    () => form.phone ? true : (errors.phone = 'Telefone é obrigatório', false),
    () => form.nickname ? true : (errors.nickname = 'Apelido é obrigatório', false),
    () => form.position ? true : (errors.position = 'Posição é obrigatória', false)
  ])

  if (!isValid) return

  await executeWithLoading(async () => {
    const success = await setupFirstAdmin({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: cleanPhone(form.phone), // Remove formatação
      nickname: form.nickname,
      position: form.position as 'linha' | 'goleiro'
    })
    
    if (success) {
      adminCreated.value = true
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }
  })
}
</script>

<style scoped>
.setup-admin-container {
  display: flex;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: var(--gray-light);
  padding-left: 1rem;
  padding-right: 1rem;
}

.setup-admin-card {
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



