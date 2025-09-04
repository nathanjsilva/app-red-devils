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
                    <input id="name" v-model="name" type="text" required class="form-control" />
                </div>

                <div class="mb-3">
                    <label for="email" class="form-label">E-mail</label>
                    <input id="email" v-model="email" type="email" required class="form-control" />
                </div>

                <!-- Cadastro: senha única -->
                <div v-if="!isEdit" class="mb-3">
                    <label for="password" class="form-label">Senha</label>
                    <div class="input-group">
                        <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required
                            class="form-control" />
                        <button type="button" class="btn btn-outline-secondary" @click="togglePassword">
                            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                        </button>
                    </div>
                </div>

                <!-- Edição: senha antiga + nova -->
                <div v-else>
                    <div class="mb-3">
                        <label for="oldPassword" class="form-label">Senha Antiga</label>
                        <div class="input-group">
                            <input :type="showPassword ? 'text' : 'password'" id="oldPassword" v-model="oldPassword"
                                class="form-control" />
                            <button type="button" class="btn btn-outline-secondary" @click="togglePassword">
                                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="newPassword" class="form-label">Senha Nova</label>
                        <div class="input-group">
                            <input :type="showPassword ? 'text' : 'password'" id="newPassword" v-model="newPassword"
                                class="form-control" />
                            <button type="button" class="btn btn-outline-secondary" @click="togglePassword">
                                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="position" class="form-label">Posição</label>
                    <select id="position" v-model="position" class="form-select" required>
                        <option disabled value="">Selecione a posição</option>
                        <option value="linha">Jogador de Linha</option>
                        <option value="goleiro">Goleiro</option>
                    </select>
                </div>

                <button type="submit" class="btn btn-red-devils w-100">
                    {{ isEdit ? "Editar" : "Cadastrar" }}
                </button>

                <div v-if="!isEdit" class="text-center mt-3">
                    <small>Já tem uma conta?
                        <a href="/" class="text-red-devils text-decoration-none">Entrar</a></small>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import axios from "axios"
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import logo from "../assets/logo-red-devils.png"
import { useToast } from "vue-toastification"

const name = ref("")
const email = ref("")
const password = ref("")
const oldPassword = ref("")
const newPassword = ref("")
const position = ref("")
const loading = ref(false)
const error = ref("")
const showPassword = ref(false)

const toast = useToast()
const router = useRouter()

const isEdit = ref(false) 

function togglePassword() {
    showPassword.value = !showPassword.value
}

onMounted(async () => {
    const savedPlayer = localStorage.getItem("player")
    const token = localStorage.getItem("token")

    if (savedPlayer && token) {
        try {
            const parsedPlayer = JSON.parse(savedPlayer)
            const response = await axios.get(
                `http://localhost:8080/api/players/${parsedPlayer.id}`,
                {
                    headers: {
                        Authorization: token,
                    },
                }
            )

            const playerData = response.data
            name.value = playerData.name
            email.value = playerData.email
            position.value = playerData.position

            localStorage.setItem("player", JSON.stringify(playerData))
            isEdit.value = true
        } catch (err) {
            console.error("Erro ao buscar player:", err)
            toast.error("Sessão expirada, faça login novamente.")
            localStorage.removeItem("player")
            localStorage.removeItem("token")
        }
    }
})

async function handleSubmit() {
    loading.value = true
    error.value = ""

    try {
        if (isEdit.value) {
            const token = localStorage.getItem("token")
            const player = JSON.parse(localStorage.getItem("player"))

            const response = await axios.put(
                `http://localhost:8080/api/players/${player.id}`,
                {
                    name: name.value,
                    email: email.value,
                    old_password: oldPassword.value,
                    new_password: newPassword.value,
                    position: position.value,
                },
                {
                    headers: { Authorization: token },
                }
            )

            toast.success("Perfil atualizado com sucesso!")
            localStorage.setItem("player", JSON.stringify(response.data))
        } else {
            await axios.post("http://localhost:8080/api/players", {
                name: name.value,
                email: email.value,
                password: password.value,
                position: position.value,
            })

            toast.success("Jogador cadastrado com sucesso.")
            router.push("/")
        }
    } catch (err) {
        if (err.response && err.response.data && err.response.data.errors) {
            const errors = err.response.data.errors
            Object.values(errors).forEach((fieldErrors) => {
                fieldErrors.forEach((message) => {
                    toast.error(message)
                })
            })
        } else {
            toast.error("Erro ao salvar jogador.")
        }
        console.error(err)
    } finally {
        loading.value = false
    }
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
