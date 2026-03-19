import { createRouter, createWebHistory } from 'vue-router'
import { STORAGE_KEYS } from '../utils/constants'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/players-overview',
    name: 'PlayersOverview',
    component: () => import('../views/PlayersOverviewView.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
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

router.beforeEach((to, from, next) => {
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  const hasToken = !!localStorage.getItem(STORAGE_KEYS.TOKEN)
  const savedUser = localStorage.getItem(STORAGE_KEYS.USER)

  if (!hasToken || !savedUser) {
    next('/login')
    return
  }

  if (to.meta.requiresAdmin) {
    try {
      const user = JSON.parse(savedUser)
      if (!user || user.profile !== 'admin') {
        next('/home')
        return
      }
    } catch (error) {
      next('/login')
      return
    }
  }

  next()
})

export default router
