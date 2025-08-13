<template>
    <div class="app-layout d-flex">
        <!-- Botão hambúrguer (somente mobile) -->
        <button v-if="isMobile" class="hamburger-btn" @click="sidebarOpen = true">
            <i class="bi bi-list"></i>
        </button>

        <!-- Sidebar -->
        <aside class="sidebar d-flex flex-column" :class="{ 'sidebar-mobile': isMobile, 'sidebar-open': sidebarOpen }">
            <div class="sidebar-header text-center py-3">
                <img :src="logo" alt="Logo" class="logo-img mb-2" />
                <h6 class="m-0 text-white fw-bold">Red Devils</h6>

                <!-- Botão fechar (somente mobile) -->
                <button v-if="isMobile" class="close-btn" @click="sidebarOpen = false">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <nav class="flex-grow-1">
                <ul class="nav flex-column">
                    <li v-for="item in menu" :key="item.name" class="nav-item">
                        <router-link :to="item.path" class="nav-link d-flex align-items-center"
                            :class="{ active: $route.path === item.path }"
                            @click="isMobile ? sidebarOpen = false : null">
                            <i :class="item.icon"></i>
                            <span class="ms-2">{{ item.name }}</span>
                        </router-link>
                    </li>
                </ul>
            </nav>

            <div class="sidebar-footer text-center py-3">
                <button class="btn btn-sm btn-outline-light" @click="logout">
                    <i class="bi bi-box-arrow-right me-1"></i> Sair
                </button>
            </div>
        </aside>

        <!-- Conteúdo -->
        <main class="flex-grow-1 p-4">
            <router-view />
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '../assets/logo-red-devils.png'

const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(false)
const isMobile = ref(window.innerWidth <= 992)

const menu = [
    { name: 'Dashboard', path: '/', icon: 'bi bi-speedometer2' },
    { name: 'Ranking', path: '/ranking', icon: 'bi bi-trophy' },
    { name: 'Jogadores', path: '/jogadores', icon: 'bi bi-people' },
    { name: 'Partidas', path: '/partidas', icon: 'bi bi-calendar-event' },
    { name: 'Configurações', path: '/config', icon: 'bi bi-gear' }
]

function logout() {
    router.push('/login')
}

function handleResize() {
    isMobile.value = window.innerWidth <= 992
    if (!isMobile.value) sidebarOpen.value = false
}

onMounted(() => {
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-layout {
    min-height: 100vh;
}

/* Sidebar */
.sidebar {
    background: linear-gradient(180deg, var(--red-devils) 0%, #1d0000 100%);
    width: 240px;
    min-height: 100vh;
    color: white;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
}

.sidebar-header {
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-img {
    height: 50px;
}

.nav-link {
    color: rgba(255, 255, 255, 0.85);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    transition: background 0.2s ease, color 0.2s ease;
}

.nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.nav-link.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.sidebar-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Botão hambúrguer */
.hamburger-btn {
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 1050;
    background: none;
    border: none;
    font-size: 2rem;
    color: var(--red-devils);
}

/* Botão fechar (mobile) */
.close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: white;
}

/* Mobile */
.sidebar-mobile {
    position: fixed;
    top: 0;
    left: 0;
    transform: translateX(-100%);
    height: 100%;
    z-index: 1100;
    width: 90%;
    /* max-width: 280px;s */
}

.sidebar-open {
    transform: translateX(0);
}
</style>
