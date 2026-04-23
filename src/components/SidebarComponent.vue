<template>
  <div class="app-layout">
    <button v-if="isMobile" class="sidebar-toggle" @click="sidebarOpen = true" aria-label="Abrir navegacao">
      <i class="bi bi-list"></i>
    </button>

    <div v-if="isMobile && sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <aside class="sidebar-panel" :class="{ 'is-mobile': isMobile, 'is-open': sidebarOpen }">
      <div class="sidebar-header">
        <img :src="logo" alt="Red Devils" class="sidebar-logo" />
        <div class="sidebar-brand-copy">
          <p class="sidebar-eyebrow">Painel publico</p>
          <h1 class="sidebar-brand">Red Devils</h1>
        </div>

        <button v-if="isMobile" class="sidebar-close" @click="sidebarOpen = false" aria-label="Fechar navegacao">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="sidebar-section">
        <p class="sidebar-section-title">Navegacao</p>
        <nav>
          <ul class="sidebar-nav-list">
            <li v-for="item in menu" :key="item.name">
              <router-link
                :to="item.path"
                class="sidebar-link"
                :class="{ active: $route.path === item.path }"
                @click="isMobile ? sidebarOpen = false : null"
              >
                <i :class="item.icon"></i>
                <span>{{ item.name }}</span>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>

      <div class="sidebar-meta">
        <div class="sidebar-meta-card">
          <span class="sidebar-meta-label">Experiencia</span>
          <strong class="sidebar-meta-value">Dashboard de temporada</strong>
        </div>
      </div>

      <div v-if="isAuthenticated" class="sidebar-footer">
        <button class="sidebar-logout" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i>
          <span>Sair</span>
        </button>
      </div>
    </aside>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useAuthStore } from '../stores/auth'
import { ROUTES } from '../utils/constants'
import { useResponsive } from '../composables/useResponsive'
import logo from '../assets/logo-red-devils.png'
import type { MenuItem } from '../types'

const { logout } = useAuth()
const { isMobile } = useResponsive()
const sidebarOpen = ref(false)
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.user?.profile === 'admin')

const menu = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    { name: 'Home', path: ROUTES.HOME, icon: 'bi bi-house-door' },
    { name: 'Jogadores', path: ROUTES.PLAYERS_OVERVIEW, icon: 'bi bi-bar-chart-line' },
  ]

  if (isAdmin.value) {
    items.push(
      { name: 'Cadastro de jogadores', path: ROUTES.ADMIN_PLAYERS, icon: 'bi bi-people' },
      { name: 'Peladas', path: ROUTES.ADMIN_PELADAS, icon: 'bi bi-calendar2-week' },
      { name: 'Estatisticas', path: ROUTES.ADMIN_MATCH_PLAYERS, icon: 'bi bi-graph-up' },
      { name: 'Organizar times', path: ROUTES.ADMIN_ORGANIZE_TEAMS, icon: 'bi bi-diagram-3' },
    )
  }

  return items
})

const handleLogout = async () => {
  await logout()
}
</script>
