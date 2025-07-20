<template>
    <div class="register-container">
        <div class="register-card">
            <div class="text-center mb-4">
                <img :src="logo" alt="Red Devils" class="logo-img" />
                <h1 class="h4 fw-bold text-red-devils">Criar Conta</h1>
            </div>

            <form @submit.prevent="handleRegister">
                <div class="mb-3">
                    <label for="name" class="form-label">Nome</label>
                    <input id="name" v-model="name" type="text" required class="form-control" />
                </div>

                <div class="mb-3">
                    <label for="email" class="form-label">E-mail</label>
                    <input id="email" v-model="email" type="email" required class="form-control" />
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label">Senha</label>
                    <input id="password" v-model="password" type="password" required class="form-control" />
                </div>

                <div class="mb-4">
                    <label for="position" class="form-label">Posição</label>
                    <select id="position" v-model="position" class="form-select" required>
                        <option disabled value="">Selecione a posição</option>
                        <option value="linha">Jogador de Linha</option>
                        <option value="goleiro">Goleiro</option>
                    </select>
                </div>

                <button type="submit" class="btn btn-red-devils w-100">Cadastrar</button>

                <div class="text-center mt-3">
                    <small>Já tem uma conta? <a href="/"
                            class="text-red-devils text-decoration-none">Entrar</a></small>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../assets/logo-red-devils.png'

const name = ref('')
const email = ref('')
const password = ref('')
const position = ref('')

const router = useRouter()

function handleRegister() {
    if (!name.value || !email.value || !password.value || !position.value) return

    console.log({
        name: name.value,
        email: email.value,
        password: password.value,
        position: position.value
    })

    // Aqui virá a lógica real de cadastro futuramente
    // Ex: await api.post('/register', { ... })

    // Por enquanto, redireciona pro login:
    router.push('/')
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
</style>
