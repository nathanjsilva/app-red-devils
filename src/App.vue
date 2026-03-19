<template>
  <div>
    <Sidebar v-if="!hideSidebar" />
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/SidebarComponent.vue'

const route = useRoute()

const hideSidebar = computed(() => {
  const publicRoutes = ['/login']
  return publicRoutes.includes(route.path)
})
</script>
