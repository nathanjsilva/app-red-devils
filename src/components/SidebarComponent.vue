<template>
  <div class="app-layout">
    <aside
      id="mobile-sidebar"
      class="sidebar-panel"
      :class="{ 'sidebar-panel-mobile': !isDesktop, 'is-open': isMobileMenuOpen }"
      :aria-hidden="!isDesktop && !isMobileMenuOpen"
    >
      <div class="sidebar-header">
        <img :src="logo" alt="Red Devils" class="sidebar-logo" />
        <div class="sidebar-brand-copy">
          <p class="sidebar-eyebrow">Painel publico</p>
          <h1 class="sidebar-brand">Red Devils</h1>
        </div>
        <button
          v-if="!isDesktop"
          type="button"
          class="mobile-sidebar-close"
          aria-label="Fechar menu"
          @click="closeMobileMenu"
        >
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
                @click="closeMobileMenu"
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

    <div
      v-if="!isDesktop && isMobileMenuOpen"
      class="mobile-sidebar-backdrop"
      aria-hidden="true"
      @click="closeMobileMenu"
    ></div>

    <button
      v-if="!isDesktop"
      type="button"
      class="mobile-menu-toggle"
      :aria-expanded="isMobileMenuOpen"
      aria-controls="mobile-sidebar"
      @click="toggleMobileMenu"
    >
      <i class="bi bi-list"></i>
      <span>Menu</span>
    </button>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useAuthStore } from '../stores/auth'
import { ROUTES } from '../utils/constants'
import { useResponsive } from '../composables/useResponsive'
import logo from '../assets/logo-red-devils.png'
import type { MenuItem } from '../types'

const { logout } = useAuth()
const { isDesktop } = useResponsive()
const route = useRoute()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.user?.profile === 'admin')
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const menu = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    { name: 'Home', path: ROUTES.HOME, icon: 'bi bi-house-door' },
    { name: 'Jogadores', path: ROUTES.PLAYERS_OVERVIEW, icon: 'bi bi-bar-chart-line' },
    { name: 'Estatisticas', path: ROUTES.STATISTICS, icon: 'bi bi-clipboard-data' },
    { name: 'Consultar peladas', path: ROUTES.PELADAS, icon: 'bi bi-calendar2-week' },
    { name: 'Campeonato', path: '/campeonatos', icon: 'bi bi-trophy' },
  ]

  if (isAdmin.value) {
    items.push(
      { name: 'Cadastro de jogadores', path: ROUTES.ADMIN_PLAYERS, icon: 'bi bi-people' },
      { name: 'Gerenciar peladas', path: ROUTES.ADMIN_PELADAS, icon: 'bi bi-calendar2-plus' },
      { name: 'Registrar estatisticas', path: ROUTES.ADMIN_MATCH_PLAYERS, icon: 'bi bi-pencil-square' },
      { name: 'Organizar times', path: ROUTES.ADMIN_ORGANIZE_TEAMS, icon: 'bi bi-diagram-3' },
      { name: 'Gerenciar campeonatos', path: '/admin/championships', icon: 'bi bi-trophy-fill' },
    )
  }

  return items
})

const handleLogout = async () => {
  closeMobileMenu()
  await logout()
}

watch(() => route.path, closeMobileMenu)
watch(isDesktop, closeMobileMenu)
</script>
