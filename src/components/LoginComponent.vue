<template>
    <div class="min-h-screen flex items-center justify-center bg-white px-4">
        <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
            <div class="text-center mb-6">
                <img :src="logo" alt="Red Devils" class="mx-auto h-16 mb-4" />
                <h1 class="text-2xl font-bold text-red-700">Red Devils</h1>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-5">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">E-mail</label>
                    <input id="email" v-model="email" type="email" required
                        class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600" />
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Senha</label>
                    <input id="password" v-model="password" type="password" required
                        class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600" />
                </div>

                <div class="flex items-center justify-between text-sm text-gray-600">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" v-model="rememberMe" class="accent-red-600" />
                        Lembrar-me
                    </label>
                    <a href="#" class="text-red-600 hover:underline">Esqueci a senha</a>
                </div>

                <button type="submit"
                    class="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-2 rounded-lg transition-colors">
                    Entrar
                </button>

                <div class="flex items-center justify-center mt-4">
                    <span class="text-gray-400 text-sm">ou</span>
                </div>

                <button type="button"
                    class="w-full border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="h-5 w-5" />
                    Entrar com Google
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import logo from '../assets/logo-red-devils.png'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)

function handleLogin() {
    // early return se campos estiverem vazios (exemplo)
    if (!email.value || !password.value) return

    console.log({
        email: email.value,
        password: password.value,
        rememberMe: rememberMe.value
    })

    // redirecionamento ou chamada de API vai aqui depois
}
</script>
