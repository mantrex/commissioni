<template>
  <NuxtLayout v-if="useLayout" name="main-layout">
    <NuxtPage />
  </NuxtLayout>
  <NuxtPage v-else />
</template>

<script setup>


const route = useRoute()
const useLayout = computed(() => route.meta.layout !== false)
</script>
