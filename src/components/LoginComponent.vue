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
                    <input id="email" v-model="email" type="email" required class="form-control" />
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label">Senha</label>
                    <input id="password" v-model="password" type="password" required class="form-control" />
                </div>

                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="rememberMe" v-model="rememberMe" />
                        <label class="form-check-label" for="rememberMe">
                            Lembrar-me
                        </label>
                    </div>
                    <a href="#" class="text-red-devils text-decoration-none">Esqueci a senha</a>
                </div>

                <button type="submit" class="btn btn-red-devils w-100 fw-semibold">
                    Entrar
                </button>

                <div class="text-center my-3 text-muted">ou</div>

                <button type="button"
                    class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 google-btn">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="google-icon" />
                    Entrar com Google
                </button>

                <button type="button" class="btn btn-outline-danger w-100 mt-2" @click="goToRegister">
                    Criar conta
                </button>
            </form>
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../assets/logo-red-devils.png'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const router = useRouter()

function handleLogin() {
    if (!email.value || !password.value) return

    console.log({ email: email.value, password: password.value, rememberMe: rememberMe.value })

    // lógica de login real aqui
}

function goToRegister() {
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

.google-icon {
    height: 20px;
}

/* Cor personalizada para o título */
.text-red-devils {
    color: var(--red-devils);
}

/* Botão com cor personalizada */
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
