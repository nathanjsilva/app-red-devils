<template>
  <div class="app-layout">
    <div v-if="!isDesktop && sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <aside class="sidebar-panel" :class="{ 'is-mobile': !isDesktop, 'is-open': sidebarOpen }">
      <div class="sidebar-header">
        <img :src="logo" alt="Red Devils" class="sidebar-logo" />
        <div class="sidebar-brand-copy">
          <p class="sidebar-eyebrow">Painel publico</p>
          <h1 class="sidebar-brand">Red Devils</h1>
        </div>

        <button v-if="!isDesktop" class="sidebar-close" @click="sidebarOpen = false" aria-label="Fechar navegacao">
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
                @click="!isDesktop ? sidebarOpen = false : null"
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

    <nav v-if="!isDesktop" class="bottom-tab-bar" aria-label="Navegacao principal">
      <router-link to="/home" class="tab-item">
        <i class="bi bi-house-door"></i>
        <span>Home</span>
      </router-link>
      <router-link to="/players-overview" class="tab-item">
        <i class="bi bi-bar-chart-line"></i>
        <span>Jogadores</span>
      </router-link>
      <router-link to="/estatisticas" class="tab-item">
        <i class="bi bi-clipboard-data"></i>
        <span>Estatisticas</span>
      </router-link>
      <button
        v-if="isAuthenticated"
        type="button"
        class="tab-item"
        :class="{ 'router-link-active': sidebarOpen }"
        @click="sidebarOpen = true"
      >
        <i class="bi bi-grid-3x3-gap"></i>
        <span>Mais</span>
      </button>
    </nav>

    <main class="app-main" :class="{ 'has-bottom-nav': !isDesktop }">
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
const { isDesktop } = useResponsive()
const sidebarOpen = ref(false)
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.user?.profile === 'admin')

const menu = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    { name: 'Home', path: ROUTES.HOME, icon: 'bi bi-house-door' },
    { name: 'Jogadores', path: ROUTES.PLAYERS_OVERVIEW, icon: 'bi bi-bar-chart-line' },
    { name: 'Estatisticas', path: ROUTES.STATISTICS, icon: 'bi bi-clipboard-data' },
  ]

  if (isAdmin.value) {
    items.push(
      { name: 'Cadastro de jogadores', path: ROUTES.ADMIN_PLAYERS, icon: 'bi bi-people' },
      { name: 'Peladas', path: ROUTES.ADMIN_PELADAS, icon: 'bi bi-calendar2-week' },
      { name: 'Registrar estatisticas', path: ROUTES.ADMIN_MATCH_PLAYERS, icon: 'bi bi-pencil-square' },
      { name: 'Organizar times', path: ROUTES.ADMIN_ORGANIZE_TEAMS, icon: 'bi bi-diagram-3' },
    )
  }

  return items
})

const handleLogout = async () => {
  await logout()
}
</script>
