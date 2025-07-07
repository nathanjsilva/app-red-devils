import { createRouter, createWebHistory } from 'vue-router'

// import Home from '../pages/Home.vue'
import Login from '../components/LoginComponent.vue'
// import Clientes from '../pages/Clientes.vue'

const routes = [
//   { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
//   { path: '/clientes', name: 'Clientes', component: Clientes },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
