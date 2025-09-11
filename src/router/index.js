import { createRouter, createWebHistory } from 'vue-router'

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
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
