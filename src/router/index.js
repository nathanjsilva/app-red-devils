import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../components/LoginComponent.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/RegisterComponent.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
