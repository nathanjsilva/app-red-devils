<template>
    <div class="app-layout d-flex">
        <button v-if="isMobile" class="hamburger-btn" @click="sidebarOpen = true">
            <i class="bi bi-list"></i>
        </button>

        <aside class="sidebar d-flex flex-column" :class="{ 'sidebar-mobile': isMobile, 'sidebar-open': sidebarOpen }">
            <div class="sidebar-header text-center py-3">
                <img :src="logo" alt="Logo" class="logo-img mb-2" />
                <h6 class="m-0 text-white fw-bold">Red Devils</h6>

                <button v-if="isMobile" class="close-btn" @click="sidebarOpen = false">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <nav class="flex-grow-1">
                <ul class="nav flex-column">
                    <li v-for="item in menu" :key="item.name" class="nav-item">
                        <router-link
                            :to="item.path"
                            class="nav-link d-flex align-items-center"
                            :class="{ active: $route.path === item.path }"
                            @click="isMobile ? sidebarOpen = false : null"
                        >
                            <i :class="item.icon"></i>
                            <span class="ms-2">{{ item.name }}</span>
                        </router-link>
                    </li>
                </ul>
            </nav>

            <div class="sidebar-footer text-center py-3">
                <button v-if="isAuthenticated" class="btn btn-sm btn-outline-light" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-1"></i> Sair
                </button>
                <button v-else class="btn btn-sm btn-outline-light" @click="goToLogin">
                    <i class="bi bi-box-arrow-in-right me-1"></i> Entrar
                </button>
            </div>
        </aside>

        <main class="flex-grow-1 p-4">
            <router-view />
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useAuthStore } from '../stores/auth'
import { ROUTES } from '../utils/constants'
import { useResponsive } from '../composables/useResponsive'
import logo from '../assets/logo-red-devils.png'
import type { MenuItem } from '../types'

const router = useRouter()
const { logout } = useAuth()
const { isMobile } = useResponsive()
const sidebarOpen = ref(false)
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.user?.profile === 'admin')

const menu = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [
        { name: 'Dashboard', path: ROUTES.HOME, icon: 'bi bi-house-door' },
        { name: 'Resumo dos Jogadores', path: ROUTES.PLAYERS_OVERVIEW, icon: 'bi bi-bar-chart-line' },
    ]

    if (isAdmin.value) {
        items.push(
            { name: 'Jogadores', path: ROUTES.ADMIN_PLAYERS, icon: 'bi bi-people' },
            { name: 'Peladas', path: ROUTES.ADMIN_PELADAS, icon: 'bi bi-calendar2-week' },
            { name: 'Estatisticas', path: ROUTES.ADMIN_MATCH_PLAYERS, icon: 'bi bi-graph-up' },
            { name: 'Organizar Times', path: ROUTES.ADMIN_ORGANIZE_TEAMS, icon: 'bi bi-diagram-3' },
        )
    }

    return items
})

const handleLogout = async () => {
    await logout()
}

const goToLogin = () => {
    router.push(ROUTES.LOGIN)
}
</script>

<style scoped>
.app-layout {
    min-height: 100vh;
    background: linear-gradient(180deg, #ffffff 0%, #f6f7f9 100%);
}

.sidebar {
    background: linear-gradient(180deg, var(--red-devils) 0%, #1d0000 100%);
    width: 240px;
    min-height: 100vh;
    color: white;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
    flex-shrink: 0;
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

.close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: white;
}

.sidebar-mobile {
    position: fixed;
    top: 0;
    left: 0;
    transform: translateX(-100%);
    height: 100%;
    z-index: 1100;
    width: 90%;
}

.sidebar-open {
    transform: translateX(0);
}

main {
    min-width: 0;
}

@media (max-width: 768px) {
    main {
        width: 100%;
        padding: 4.75rem 1rem 1.25rem !important;
    }

    .sidebar {
        box-shadow: 12px 0 32px rgba(0, 0, 0, 0.24);
    }
}
</style>
