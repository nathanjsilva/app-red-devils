import { createRouter, createWebHistory } from 'vue-router'
import { STORAGE_KEYS } from '../utils/constants'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordView.vue')
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/ResetPasswordView.vue')
  },
  {
    path: '/setup-admin',
    name: 'SetupAdmin',
    component: () => import('../views/SetupAdminView.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  // Admin routes
  {
    path: '/admin/players',
    name: 'AdminPlayers',
    component: () => import('../views/AdminPlayersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/peladas',
    name: 'AdminPeladas',
    component: () => import('../views/AdminPeladasView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/match-players',
    name: 'AdminMatchPlayers',
    component: () => import('../views/AdminMatchPlayersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/organize-teams',
    name: 'AdminOrganizeTeams',
    component: () => import('../views/AdminOrganizeTeamsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard de rota para verificar autenticação sem depender do store (evita race conditions)
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const hasToken = !!localStorage.getItem(STORAGE_KEYS.TOKEN)
    const hasPlayer = !!localStorage.getItem(STORAGE_KEYS.PLAYER)
    if (!hasToken || !hasPlayer) {
      next('/')
      return
    }
    if (to.meta.requiresAdmin) {
      try {
        const player = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYER) || 'null')
        if (!player || player.is_admin !== true) {
          next('/home')
          return
        }
      } catch (e) {
        next('/')
        return
      }
    }
  }
  next()
})

export default router
