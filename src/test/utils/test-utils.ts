import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import type { App } from 'vue'

export function createTestWrapper(component: any, options: any = {}): VueWrapper {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/login', component: { template: '<div>Login</div>' } },
      { path: '/register', component: { template: '<div>Register</div>' } },
    ]
  })

  return mount(component, {
    global: {
      plugins: [pinia, router],
      stubs: {
        'router-link': true,
        'router-view': true,
      },
    },
    ...options,
  })
}
