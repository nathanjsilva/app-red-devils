<template>
  <div>
    <Sidebar v-if="!hideSidebar" />
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Sidebar from './components/SidebarComponent.vue'

const route = useRoute()
const authStore = useAuthStore()

const hideSidebar = computed(() => {
  return route.path === '/' || route.path === '/register'
})

onMounted(() => {
  authStore.initializeAuth()
})
</script>
